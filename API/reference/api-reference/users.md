# Users

## Creating a new user

## Create pet.

<mark style="color:green;">`POST`</mark> `https://api.flylogs.com/users/create.json`

Creates a new pet.

#### Request Body

| Name                                   | Type   | Description                                     |
| -------------------------------------- | ------ | ----------------------------------------------- |
| name<mark style="color:red;">\*</mark> | string | The name of the pet                             |
| user\_group\_id                        | int    | The `id` of the user  group the user belongs to |
| email                                  | string | The email of the user                           |
| phone                                  | string | The phone number                                |

{% tabs %}
{% tab title="200 Pet successfully created" %}
```javascript
{
    "name"="Wilson",
    "owner": {
        "id": "sha7891bikojbkreuy",
        "name": "Samuel Passet",
    "species": "Dog",}
    "breed": "Golden Retriever",
}
```
{% endtab %}

{% tab title="401 Permission denied" %}

{% endtab %}
{% endtabs %}

{% hint style="info" %}
**Good to know:** This API method was created using the API Method block, it's how you can build out an API method documentation from scratch. Have a play with the block and you'll see you can do some nifty things like add and reorder parameters, document responses, and give your methods detailed descriptions.
{% endhint %}

## Updating a user

{% hint style="info" %}
**Good to know:** This API method was auto-generated from an example Swagger file. You'll see that it's not editable – that's because the contents are synced to a URL! Any time the linked file changes, the documentation will change too.
{% endhint %}
