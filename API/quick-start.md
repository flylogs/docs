# Quick Start

{% hint style="info" %}
**Good to know:** A quick start guide can be good to help folks get up and running with your API in a few steps. Some people prefer diving in with the basics rather than meticulously reading every page of documentation!
{% endhint %}

## Get your API keys

Your API requests are authenticated using API keys. Any request that doesn't include an API key will return an error.

You can get your API keys from our support team, contact us here: [https://www.flylogs.com/pages/contact](https://www.flylogs.com/home/contact).

## Make your first request

To make your first request, send an authenticated request to the users login url. This will store a session token in the database that you will need to send in each following requests.

## Log into a users account.

<mark style="color:green;">`POST`</mark> `https://www.flylogs.com/users/login.json`

This is the first call required to use any other functions.

#### Request Body

| Name                                       | Type   | Description                                              |
| ------------------------------------------ | ------ | -------------------------------------------------------- |
| email<mark style="color:red;">\*</mark>    | string | Valid email address of an existing user in your company. |
| password<mark style="color:red;">\*</mark> | string | The user password.                                       |
| code                                       | int    | 2FA code                                                 |

{% tabs %}
{% tab title="200 Processed login" %}
```json
{
    "response": {
        "result": true,
        "two_factor": null
        "message": null,
        "url": "/users",
        "token": "kub0bmm3immamk6q1brojrq527"
    }
}
```
{% endtab %}

{% tab title="401 Permission denied" %}
```json
{
    "response": {
        "result": false,
        "message": "Incorrect email or password",
        "url": null
    }
}j
```
{% endtab %}
{% endtabs %}

{% hint style="info" %}
**2FA implementation:** You should make an initial request and check code field to be null or true. If **two\_factor** field is false, the provided code was not correct or empty. This case, triggers a code generation process and email.

Provide the correct code and Flylogs will return **result**=**true** for email and password validation, and **two\_factor**=**true** for correct 2FA authentication.
{% endhint %}

Take a look at how you might call this method using our official libraries, or via `curl`:

{% tabs %}
{% tab title="curl" %}
```
curl https://www.flylogs.com.com/users/login.json
    -u YOUR_API_KEY:  
    -d email='email@address.com'  
    -d species='Secret-Password'  
    -d code=''
```
{% endtab %}
{% endtabs %}
