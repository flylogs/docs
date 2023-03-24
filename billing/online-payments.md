---
description: Enable online payments in Flylogs via Stripe
---

# Online payments

In addition to an efficient way to manage flight billing, Flylogs also offers the possibility to automate payments via an integration with Stripe.

Stripe is a payment processing platform that allows businesses to accept payments from their customers online. Stripe provides a secure and reliable way to accept online payments and has become one of the most widely used payment gateways worldwide.

__

### Initial Configuration

In order to enable a safe communication between your Flylogs account and your Stripe account, you need to perform a very simple setup. Follow these steps in order:

1. If you do not have a company Stripe account, visit [Stripe website](https://dashboard.stripe.com/register) and create one.
2. In Stripe, configure your bank account and automatic payout method.
3. Obtain the publishable\_key and the private\_key from your [Stripe LIVE Keys page](https://dashboard.stripe.com/apikeys).
4. Go to the [Billing Settings page](https://www.flylogs.com/manager/companies/billing) in Flylogs and enable Stripe payments.
5. Copy past your Stripe **publishable\_key** and the **private\_key**, before hitting Save.

Once completed, your pilots will have the option to make online payments in Flylogs via Stripe that will be deposited directly into your Stripe account. If the payment is successful, the pilot's balance in Flylogs will be automatically updated.
