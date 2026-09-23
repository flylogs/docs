# Flight remark findings

Pilots write things on flight records that never become a report. A brake that felt odd, a go-around because something was on the runway, a warning light that came on and went out again — written in the remarks box at the end of a long day, read by nobody afterwards.

Flylogs now reads those remarks for you and points out the ones that look like they deserve a second look.

![](../.gitbook/assets/ai-remark-findings.png)

You will find it under **Safety → Remark Findings**.

## What it does

Once a day, Flylogs reads the remarks written on the previous day's flights and lists anything that reads like:

* **Possible defect** — a technical problem, malfunction, damage or unserviceability.
* **Safety relevant** — a conflict, an excursion, a go-around for cause, weather encountered, a procedural deviation.
* **Noteworthy** — clearly worth a look, but neither of the above.

Each finding shows the remark **exactly as the pilot wrote it**, the flight it came from, and a one-line note on why it stood out. **Open flight** takes you straight to the record.

## What it does *not* do

This is the important part.

**Nothing is reported.** No aircraft report is created, no safety report is opened, no maintenance job is raised, nobody is notified. The list is a reading aid, not a register. If a finding deserves a report, you open the flight and raise it the normal way — so what ends up in your registers is always something a person decided to put there.

**No assessment is made.** It will not tell you how serious something is, what caused it, or what to do about it. It points at a sentence a pilot wrote.

## Reading the list

Each day shows a badge with how many findings it has, and on the right, how many remarks were actually read:

> read 3 of 3 remarks

That second number matters. Most remarks are not prose at all — `5T`, `NIL`, `Private flight`, a route repeated back — and those are skipped before anything is read, so the two numbers are usually different. A day that says **read 9 of 40** looked at nine of them. The rest were routine entries with nothing to find.

**Nothing flagged** is a normal and common result. On most days, on most fleets, nobody wrote anything that needs a second look.

The chips under the date, like `EC-ABC · 2`, count findings per aircraft for that day. They are counted from the records, not written by the assistant.

## Who can see it

Managers only — user groups **110 and below** (management, safety and maintenance roles). Pilots and students cannot open the page and the API refuses them.

That restriction is deliberate. These are remarks your crews wrote, shown back with an interpretation attached. It is material for the person who triages, not feedback for the person who wrote it.

## Accuracy, honestly

The findings come from an automated reading of free text, and it will sometimes flag something ordinary or miss something real. Two things are built in to keep that manageable:

* The quote is always **copied verbatim** from the remark. If the quoted words are not really in the remark, the finding is thrown away rather than shown. So you can judge a finding by reading the quote, without trusting the interpretation.
* A finding that points at a flight that was not read is discarded, so **Open flight** always lands on the right record.

Treat the list the way you would treat a colleague saying "you might want to look at this one".

## If the page is empty

* **"No findings yet"** — each day is read once it has finished, so there is nothing to show until remarks have been written and the following day's run has happened.
* Your Flylogs installation may not have the assistant switched on. If the page stays empty while your crews are writing remarks, contact support.

## Related

* [Safety Reports](safety-reports.md) — raising a report from a flight
* [Create a Safety Report](create-a-safety-report.md)
