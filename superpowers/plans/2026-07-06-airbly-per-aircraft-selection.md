# Airbly Per-Aircraft Selection — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let managers choose which aircraft participate in Airbly flight import; default to all active aircraft when the integration is first enabled.

**Architecture:** The `airbly_aircraft` table (already created) is the sole source of truth. The import cron checks it per-aircraft; a new controller endpoint manages the list. The UI adds a computed "All aircraft" toggle plus a per-aircraft list with a Save button.

**Tech Stack:** CakePHP 2, PHP 5.6+, React/TypeScript (SettingsPage.tsx), i18n (6 locale JSON files)

## Global Constraints

- Never commit or push — the user runs git.
- All PHP models follow CakePHP 2 conventions (`App::uses`, `$useTable`, `$belongsTo`).
- All timestamps stored as Unix seconds (`int(11) unsigned`), never datetime strings.
- All 6 locale files must receive every new i18n key: `en`, `de`, `es`, `fr`, `it`, `pt`.
- New manager endpoints follow the naming pattern `manager_<action>` in `CompaniesController`.
- The `airbly_aircraft` table uses `UNIQUE KEY uq (company_id, aircraft_id)`.
- Company ID comes from `$this->Auth->User('company_id')` — never from user input.

---

## File Map

| Action | File |
|--------|------|
| **Create** | `app/Model/AirblyAircraft.php` |
| **Modify** | `app/Model/AirblyImport.php` — `resolveAircraft()`, `loadModelsForImport()` |
| **Modify** | `app/Controller/CompaniesController.php` — `manager_settings()`, new `manager_airbly_aircraft()` |
| **Modify** | `src/web/i18n/locales/en.json` (and de, es, fr, it, pt) |
| **Modify** | `src/web/pages/manager/companies/SettingsPage.tsx` |

---

## Task 1: AirblyAircraft model

**Files:**
- Create: `app/Model/AirblyAircraft.php`

**Interfaces:**
- Produces: `AirblyAircraft` CakePHP model, usable via `ClassRegistry::init('AirblyAircraft')` or `$this->loadModel('AirblyAircraft')`. Provides standard CakePHP `find`, `save`, `deleteAll`, `query` methods.

- [ ] **Step 1: Create the model file**

`/Users/inigo/Development/flylogs/app/Model/AirblyAircraft.php`:

```php
<?php
App::uses('AppModel', 'Model');

class AirblyAircraft extends AppModel {

	public $useTable = 'airbly_aircraft';

	public $belongsTo = array(
		'Company' => array(
			'className' => 'Company',
			'foreignKey' => 'company_id'
		),
		'Aircraft' => array(
			'className' => 'Aircraft',
			'foreignKey' => 'aircraft_id'
		)
	);
}
```

- [ ] **Step 2: Smoke-test the model loads**

Hit any existing endpoint that loads CakePHP (e.g., `GET /manager/companies/settings.json` with a valid token). No PHP fatal errors = model file parses correctly. Check `app/tmp/logs/error.log` for parse errors.

---

## Task 2: Update AirblyImport — enforce allowlist in resolveAircraft()

**Files:**
- Modify: `app/Model/AirblyImport.php`
  - `resolveAircraft()` at line ~519
  - `loadModelsForImport()` at line ~958

**Interfaces:**
- Consumes: `AirblyAircraft` model from Task 1.
- Produces: `resolveAircraft()` returns `null` when aircraft is not in `airbly_aircraft`; existing callers are unchanged.

- [ ] **Step 1: Add AirblyAircraft to loadModelsForImport()**

In `app/Model/AirblyImport.php`, find `loadModelsForImport()` (around line 958). Add one block after the existing `AircraftPosition` block:

Old:
```php
		if(empty($this->AircraftPosition))
			$this->AircraftPosition = ClassRegistry::init('AircraftPosition');
	}
```

New:
```php
		if(empty($this->AircraftPosition))
			$this->AircraftPosition = ClassRegistry::init('AircraftPosition');
		if(empty($this->AirblyAircraft))
			$this->AirblyAircraft = ClassRegistry::init('AirblyAircraft');
	}
```

- [ ] **Step 2: Add the allowlist check in resolveAircraft()**

Find `resolveAircraft()` (around line 519). The current body after finding the aircraft is:

```php
		if(!empty($aircraft))
			return $aircraft['Aircraft']['id'];

		CakeLog::write('airbly', 'Aircraft '.$ident.' not found or inactive for company '.$companyId.' — skipping asset');
		return null;
```

Replace with:

```php
		if(!empty($aircraft)){
			$aircraftId = $aircraft['Aircraft']['id'];
			$this->loadModelsForImport();
			$allowed = $this->AirblyAircraft->find('count', array(
				'conditions' => array(
					'AirblyAircraft.company_id' => $companyId,
					'AirblyAircraft.aircraft_id' => $aircraftId
				)
			));
			if($allowed > 0)
				return $aircraftId;
			CakeLog::write('airbly', 'Aircraft '.$ident.' not in Airbly aircraft list for company '.$companyId.' — skipping asset');
			return null;
		}

		CakeLog::write('airbly', 'Aircraft '.$ident.' not found or inactive for company '.$companyId.' — skipping asset');
		return null;
```

- [ ] **Step 3: Verify no parse errors**

```bash
php -l /Users/inigo/Development/flylogs/app/Model/AirblyImport.php
```

Expected output: `No syntax errors detected in .../AirblyImport.php`

---

## Task 3: CompaniesController — auto-populate + two new endpoints

**Files:**
- Modify: `app/Controller/CompaniesController.php`
  - `manager_settings()` at line 387 — add first-enable seed logic
  - Add new `manager_airbly_aircraft()` function after `manager_settings()`

**Interfaces:**
- Consumes: `AirblyAircraft` model from Task 1.
- Produces:
  - `GET /manager/companies/airbly_aircraft.json` → `{ "aircraft": [{ "id": int, "registration": string, "model": string, "active": bool, "airbly_enabled": bool }] }`
  - `POST /manager/companies/airbly_aircraft.json` body `{ "aircraft_ids": [int] }` → `{ "success": bool }`
  - First-enable seed: when `airbly_enabled` transitions false→true, all active aircraft are inserted into `airbly_aircraft`.

- [ ] **Step 1: Detect current airbly_enabled before save in manager_settings()**

In `manager_settings()`, find the block that handles `airbly_enabled` (around line 418):

```php
			if(isset($this->request->data['CompanySetting']['airbly_enabled'])){
				// Cannot enable the integration on a plan that does not include it.
				if(!$airblyAllowed)
					$this->request->data['CompanySetting']['airbly_enabled'] = false;
			}
```

Replace with:

```php
			$airblyFirstEnable = false;
			if(isset($this->request->data['CompanySetting']['airbly_enabled'])){
				// Cannot enable the integration on a plan that does not include it.
				if(!$airblyAllowed){
					$this->request->data['CompanySetting']['airbly_enabled'] = false;
				} elseif($this->request->data['CompanySetting']['airbly_enabled']){
					// Detect first-enable transition so we can seed airbly_aircraft below.
					$cur = $this->Company->CompanySetting->find('first', array(
						'conditions' => array('CompanySetting.company_id' => $this->Auth->User('company_id')),
						'fields' => array('CompanySetting.airbly_enabled')
					));
					$airblyFirstEnable = empty($cur['CompanySetting']['airbly_enabled']);
				}
			}
```

- [ ] **Step 2: Seed airbly_aircraft after a successful first-enable save**

Find the line that reads `$save = $this->Company->CompanySetting->save(...)` (around line 437). Directly after that line (and before the other saves), add:

```php
			// First-enable: populate airbly_aircraft with all active aircraft.
			if($save && $airblyFirstEnable){
				$this->loadModel('AirblyAircraft');
				$cid = $this->Auth->User('company_id');
				$this->AirblyAircraft->query(
					"INSERT IGNORE INTO airbly_aircraft (company_id, aircraft_id, created, modified)
					 SELECT '{$cid}', id, UNIX_TIMESTAMP(), UNIX_TIMESTAMP()
					 FROM aircraft WHERE company_id = '{$cid}' AND active = 1 AND deleted = 0"
				);
			}
```

- [ ] **Step 3: Add manager_airbly_aircraft() endpoint**

Find `manager_spidertracks_disconnect()` (around line 3216). Add the new function directly **before** it:

```php
	/**
	 * manager_airbly_aircraft
	 *
	 * GET  — returns all company aircraft with airbly_enabled flag.
	 * POST — replaces the company's airbly_aircraft rows with the posted set.
	 */
	public function manager_airbly_aircraft(){

		$companyId = $this->Auth->User('company_id');
		if(empty($companyId))
			throw new ForbiddenException('Not authenticated');

		if(!in_array($this->params['Company']['plan'], array('premium','unlimited')))
			throw new ForbiddenException('Airbly integration requires the Premium or Unlimited plan');

		$this->loadModel('AirblyAircraft');

		if(!empty($this->request->data)){

			// POST: replace aircraft list.
			$aircraftIds = isset($this->request->data['aircraft_ids']) ? $this->request->data['aircraft_ids'] : array();

			// Validate: only integers and only aircraft belonging to this company.
			$validIds = array();
			if(!empty($aircraftIds)){
				$owned = $this->Company->Aircraft->find('list', array(
					'conditions' => array(
						'Aircraft.company_id' => $companyId,
						'Aircraft.deleted' => false,
						'Aircraft.active' => true,
						'Aircraft.id' => array_map('intval', $aircraftIds)
					),
					'fields' => array('Aircraft.id', 'Aircraft.id')
				));
				$validIds = array_keys($owned);
			}

			$db = $this->AirblyAircraft->getDataSource();
			$db->begin();

			$this->AirblyAircraft->deleteAll(array('AirblyAircraft.company_id' => $companyId), false);

			foreach($validIds as $aid){
				$this->AirblyAircraft->create();
				$this->AirblyAircraft->save(array('AirblyAircraft' => array(
					'company_id'  => $companyId,
					'aircraft_id' => (int)$aid,
					'created'     => time(),
					'modified'    => time()
				)));
			}

			$db->commit();

			$success = true;
			$this->set(compact('success'));
			$this->set('_serialize', 'success');
			return;
		}

		// GET: return all aircraft with airbly_enabled flag.
		$allAircraft = $this->Company->Aircraft->find('all', array(
			'conditions' => array(
				'Aircraft.company_id' => $companyId,
				'Aircraft.deleted' => false
			),
			'fields' => array('Aircraft.id', 'Aircraft.registration', 'Aircraft.active'),
			'contain' => array(
				'AircraftModel' => array('fields' => array('AircraftModel.name'))
			),
			'order' => 'Aircraft.registration ASC'
		));

		$enabled = $this->AirblyAircraft->find('list', array(
			'conditions' => array('AirblyAircraft.company_id' => $companyId),
			'fields' => array('AirblyAircraft.aircraft_id', 'AirblyAircraft.aircraft_id')
		));

		$aircraft = array();
		foreach($allAircraft as $a){
			$aid = $a['Aircraft']['id'];
			$aircraft[] = array(
				'id'             => $aid,
				'registration'   => $a['Aircraft']['registration'],
				'model'          => isset($a['AircraftModel']['name']) ? $a['AircraftModel']['name'] : '',
				'active'         => (bool)$a['Aircraft']['active'],
				'airbly_enabled' => isset($enabled[$aid])
			);
		}

		$this->set(compact('aircraft'));
		$this->set('_serialize', 'aircraft');
	}


```

- [ ] **Step 4: Verify no parse errors**

```bash
php -l /Users/inigo/Development/flylogs/app/Controller/CompaniesController.php
```

Expected: `No syntax errors detected`

- [ ] **Step 5: Manual smoke-test GET endpoint**

```bash
# Replace TOKEN and BASE with real values
curl -s -H "Authorization: Bearer TOKEN" BASE/manager/companies/airbly_aircraft.json | python3 -m json.tool
```

Expected: JSON with `aircraft` array. Each element has `id`, `registration`, `model`, `active`, `airbly_enabled`.

- [ ] **Step 6: Manual smoke-test POST endpoint**

```bash
curl -s -X POST \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"aircraft_ids":[42]}' \
  BASE/manager/companies/airbly_aircraft.json | python3 -m json.tool
```

Expected: `{ "success": true }`. Verify the `airbly_aircraft` table in the DB has the expected row(s).

---

## Task 4: i18n — add new keys to all 6 locale files

**Files:**
- Modify: `src/web/i18n/locales/en.json`
- Modify: `src/web/i18n/locales/de.json`
- Modify: `src/web/i18n/locales/es.json`
- Modify: `src/web/i18n/locales/fr.json`
- Modify: `src/web/i18n/locales/it.json`
- Modify: `src/web/i18n/locales/pt.json`

**Interfaces:**
- Produces: translation keys used in Task 5.
  - `companies.airblyAllAircraft`
  - `companies.airblyAllAircraftDesc`
  - `companies.airblyAircraftSelection`
  - `companies.airblyInactiveNote`
  - `companies.airblySaveSelection`

- [ ] **Step 1: Add keys after `airblyDraftNote` in en.json (line ~3066)**

Insert after the `"airblyDraftNote"` line:

```json
    "airblyAllAircraft": "All aircraft",
    "airblyAllAircraftDesc": "Import flights from all active aircraft automatically.",
    "airblyAircraftSelection": "Aircraft selection",
    "airblyInactiveNote": "Inactive aircraft are shown but cannot be imported. Activate the aircraft in Aircraft settings first.",
    "airblySaveSelection": "Save selection",
```

- [ ] **Step 2: Add keys after `airblyDraftNote` in de.json (line ~3008)**

```json
    "airblyAllAircraft": "Alle Luftfahrzeuge",
    "airblyAllAircraftDesc": "Flüge automatisch von allen aktiven Luftfahrzeugen importieren.",
    "airblyAircraftSelection": "Luftfahrzeugauswahl",
    "airblyInactiveNote": "Inaktive Luftfahrzeuge werden angezeigt, können aber nicht importiert werden. Aktivieren Sie das Luftfahrzeug zuerst in den Luftfahrzeug-Einstellungen.",
    "airblySaveSelection": "Auswahl speichern",
```

- [ ] **Step 3: Add keys after `airblyDraftNote` in es.json (line ~3062)**

```json
    "airblyAllAircraft": "Todas las aeronaves",
    "airblyAllAircraftDesc": "Importar vuelos automáticamente de todas las aeronaves activas.",
    "airblyAircraftSelection": "Selección de aeronaves",
    "airblyInactiveNote": "Las aeronaves inactivas se muestran pero no se pueden importar. Active primero la aeronave en la configuración de aeronaves.",
    "airblySaveSelection": "Guardar selección",
```

- [ ] **Step 4: Add keys after `airblyDraftNote` in fr.json (line ~3007)**

```json
    "airblyAllAircraft": "Tous les aéronefs",
    "airblyAllAircraftDesc": "Importer automatiquement les vols de tous les aéronefs actifs.",
    "airblyAircraftSelection": "Sélection des aéronefs",
    "airblyInactiveNote": "Les aéronefs inactifs sont affichés mais ne peuvent pas être importés. Activez d'abord l'aéronef dans les paramètres des aéronefs.",
    "airblySaveSelection": "Enregistrer la sélection",
```

- [ ] **Step 5: Add keys after `airblyDraftNote` in it.json (line ~3004)**

```json
    "airblyAllAircraft": "Tutti i velivoli",
    "airblyAllAircraftDesc": "Importa automaticamente i voli da tutti i velivoli attivi.",
    "airblyAircraftSelection": "Selezione velivoli",
    "airblyInactiveNote": "I velivoli inattivi sono visibili ma non possono essere importati. Attiva prima il velivolo nelle impostazioni velivoli.",
    "airblySaveSelection": "Salva selezione",
```

- [ ] **Step 6: Add keys after `airblyDraftNote` in pt.json (line ~3010)**

```json
    "airblyAllAircraft": "Todas as aeronaves",
    "airblyAllAircraftDesc": "Importar voos automaticamente de todas as aeronaves ativas.",
    "airblyAircraftSelection": "Seleção de aeronaves",
    "airblyInactiveNote": "As aeronaves inativas são apresentadas mas não podem ser importadas. Ative primeiro a aeronave nas definições de aeronaves.",
    "airblySaveSelection": "Guardar seleção",
```

---

## Task 5: Frontend — aircraft selection UI in TabIntegrations

**Files:**
- Modify: `src/web/pages/manager/companies/SettingsPage.tsx`

**Interfaces:**
- Consumes:
  - `GET /manager/companies/airbly_aircraft.json` → `{ aircraft: AirblyAircraftRow[] }`
  - `POST /manager/companies/airbly_aircraft.json` body `{ aircraft_ids: string[] }` → `{ success: boolean }`
  - i18n keys from Task 4: `airblyAllAircraft`, `airblyAllAircraftDesc`, `airblyAircraftSelection`, `airblyInactiveNote`, `airblySaveSelection`
  - `Tog` toggle component already used in `TabIntegrations`
  - `session`, `BASE_URL`, `useTranslation` already imported

- [ ] **Step 1: Add AirblyAircraftRow type near the top of SettingsPage.tsx**

Find the first type/interface declaration block in SettingsPage.tsx (around where `RateFormState` or `AircraftOption` are defined). Add:

```typescript
interface AirblyAircraftRow {
  id: string;
  registration: string;
  model: string;
  active: boolean;
  airbly_enabled: boolean;
}
```

- [ ] **Step 2: Add state and fetch logic inside TabIntegrations**

`TabIntegrations` starts at around line 860. It already has `const { t } = useTranslation()` and `const enabled = !!f.airbly_enabled`. Add state and fetch directly after those existing declarations:

```typescript
  // token is already declared earlier in TabIntegrations (line ~874): const token = session.get()?.token ?? "";
  // Do NOT redeclare it. The lines below go after the existing token declaration.
  const [aircraftRows, setAircraftRows] = useState<AirblyAircraftRow[]>([]);
  const [enabledIds, setEnabledIds] = useState<Set<string>>(new Set());
  const [acBusy, setAcBusy] = useState(false);
  const [acError, setAcError] = useState<string | null>(null);
  const [acSaved, setAcSaved] = useState(false);

  useEffect(() => {
    if (!enabled || !token) return;
    setAcError(null);
    fetch(`${BASE_URL}/manager/companies/airbly_aircraft.json`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d) => {
        const rows: AirblyAircraftRow[] = (d.aircraft ?? []).map((a: Record<string, unknown>) => ({
          id: String(a.id),
          registration: String(a.registration ?? ""),
          model: String(a.model ?? ""),
          active: !!a.active,
          airbly_enabled: !!a.airbly_enabled,
        }));
        setAircraftRows(rows);
        setEnabledIds(new Set(rows.filter((r) => r.airbly_enabled).map((r) => r.id)));
      })
      .catch(() => setAcError("Could not load aircraft list"));
  }, [enabled]);
```

Note: `token` must NOT be in the dependency array — it never changes during a session and adding it would re-fetch on every render. Only `enabled` drives the fetch.

- [ ] **Step 3: Add derived values and handlers after the state declarations**

Add directly after the `useEffect` block:

```typescript
  const activeAircraft = aircraftRows.filter((a) => a.active);
  const allOn =
    activeAircraft.length > 0 && activeAircraft.every((a) => enabledIds.has(a.id));

  const postAircraftIds = async (ids: string[]) => {
    setAcBusy(true);
    setAcError(null);
    setAcSaved(false);
    try {
      await fetch(`${BASE_URL}/manager/companies/airbly_aircraft.json`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ aircraft_ids: ids }),
      });
      setAcSaved(true);
    } catch {
      setAcError("Could not update aircraft selection");
    }
    setAcBusy(false);
  };

  const handleAllOn = () => {
    const ids = activeAircraft.map((a) => a.id);
    setEnabledIds(new Set(ids));
    postAircraftIds(ids);
  };

  const handleSaveSelection = () => {
    const ids = aircraftRows
      .filter((a) => a.active && enabledIds.has(a.id))
      .map((a) => a.id);
    postAircraftIds(ids);
  };
```

- [ ] **Step 4: Add the aircraft selection UI to the JSX**

In `TabIntegrations`, find the closing tag of the sync info box (the one ending with `airblyDraftNote`) — around line 991. Add the aircraft selection section directly after that closing `</div>`:

```tsx
      {enabled && aircraftRows.length > 0 && (
        <div style={{ marginTop: 18 }}>
          <Tog
            label={t("companies.airblyAllAircraft")}
            desc={t("companies.airblyAllAircraftDesc")}
            checked={allOn}
            onChange={(v) => { if (v) handleAllOn(); }}
            disabled={acBusy}
          />

          {!allOn && (
            <div style={{ marginTop: 14 }}>
              <div style={{ fontSize: "0.8rem", fontWeight: 600, color: "#374151", marginBottom: 8 }}>
                {t("companies.airblyAircraftSelection")}
              </div>

              <div style={{ padding: "10px 14px", borderRadius: 8, background: "#fffbeb", border: "1px solid #fde68a", fontSize: "0.75rem", color: "#78350f", marginBottom: 10 }}>
                <i className="fa fa-circle-info me-1" />
                {t("companies.airblyInactiveNote")}
              </div>

              <div style={{ border: "1px solid #e5e7eb", borderRadius: 10, overflow: "hidden" }}>
                {aircraftRows.map((ac, i) => (
                  <div key={ac.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", borderBottom: i < aircraftRows.length - 1 ? "1px solid #f3f4f6" : undefined, opacity: ac.active ? 1 : 0.45 }}>
                    <div>
                      <span style={{ fontWeight: 600, fontSize: "0.82rem" }}>{ac.registration}</span>
                      {ac.model && <span style={{ marginLeft: 8, fontSize: "0.75rem", color: "#6c757d" }}>{ac.model}</span>}
                      {!ac.active && <span style={{ marginLeft: 8, fontSize: "0.7rem", color: "#9ca3af", fontStyle: "italic" }}>inactive</span>}
                    </div>
                    <input
                      type="checkbox"
                      checked={enabledIds.has(ac.id)}
                      disabled={!ac.active || acBusy}
                      onChange={(e) => {
                        setAcSaved(false);
                        setEnabledIds((prev) => {
                          const next = new Set(prev);
                          if (e.target.checked) next.add(ac.id);
                          else next.delete(ac.id);
                          return next;
                        });
                      }}
                      style={{ width: 16, height: 16, accentColor: "#0891b2", cursor: ac.active ? "pointer" : "not-allowed" }}
                    />
                  </div>
                ))}
              </div>

              <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 10 }}>
                <button
                  type="button"
                  onClick={handleSaveSelection}
                  disabled={acBusy}
                  style={{ padding: "8px 18px", borderRadius: 8, border: "none", background: "#0891b2", color: "#fff", fontWeight: 600, fontSize: "0.82rem", opacity: acBusy ? 0.6 : 1 }}
                >
                  {acBusy
                    ? <><i className="fa fa-spinner fa-spin me-1" />{t("companies.airblySaveSelection")}</>
                    : t("companies.airblySaveSelection")}
                </button>
                {acSaved && !acBusy && (
                  <span style={{ fontSize: "0.78rem", color: "#16a34a" }}>
                    <i className="fa fa-circle-check me-1" /> Saved
                  </span>
                )}
                {acError && (
                  <span style={{ fontSize: "0.78rem", color: "#dc2626" }}>
                    <i className="fa fa-triangle-exclamation me-1" />{acError}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      )}
```

- [ ] **Step 5: TypeScript check**

```bash
cd /Users/inigo/Development/neo && npx tsc --noEmit 2>&1 | grep -i "SettingsPage\|AirblyAircraft" | head -20
```

Expected: no errors for these files.

- [ ] **Step 6: Manual browser test — all aircraft ON**

1. Open Settings → Integrations tab with Airbly enabled.
2. Verify the "All aircraft" toggle appears and is ON (all active aircraft are in `airbly_aircraft`).
3. Verify no list is shown when toggle is ON.

- [ ] **Step 7: Manual browser test — per-aircraft list**

1. Toggle "All aircraft" OFF (it won't fire a POST — just reveals the list).
2. Verify the list shows all aircraft including inactive ones (inactive are greyed, checkboxes disabled).
3. Verify the info banner is shown.
4. Uncheck one aircraft, click "Save selection".
5. Verify the row disappears from `airbly_aircraft` in the DB.
6. Reload the page — verify the list reflects the saved state.

- [ ] **Step 8: Manual browser test — toggle back to ALL**

1. With the list visible, toggle "All aircraft" ON.
2. Verify an immediate POST fires (check network tab).
3. Verify the list collapses and the toggle shows ON.
4. Verify `airbly_aircraft` in DB has all active aircraft again.

- [ ] **Step 9: End-to-end import test**

1. Remove one aircraft from `airbly_aircraft` via the UI.
2. Trigger the Airbly cron manually (or wait for the next 15-min run).
3. Verify no flights are imported for that aircraft.
4. Check `app/tmp/logs/airbly.log` for the "not in Airbly aircraft list" message.
