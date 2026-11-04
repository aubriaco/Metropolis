# Metropolis Market .NET 10 upgrade

## Build

Install the .NET 10 SDK and place a compatible Ubriaco source checkout beside
`metropolis`. The solution expects `Ubriaco/Ubriaco.csproj` and
`UbriacoUtil/UbriacoUtil.csproj` inside that checkout. For another location,
pass `-p:UbriacoRoot=/path/to/Ubriaco`. The solution excludes the updater
project because its source was absent from the archive. The service unit is
available for deployments that install the updater separately.

```sh
dotnet build Marketplace.sln -c Release
```

Publishing the projects with React client apps also requires Node.js and npm.

## Deployment

Apply `scripts/checkout-payment.sql` against the Marketplace database before
starting the updated services. For framework-dependent deployments, install
the matching ASP.NET Core 10 runtime and republish each service.

Add the following settings to the existing service `config.json` files.
Replace the sample values with the integration token names, exact external
merchant IDs, and HTTPS image hostnames in use.

```json
{
  "IntegrationMerchants": {
    "example-integration": ["merchant-123"]
  },
  "Storage": {
    "ImageImportHosts": ["images.example.com"]
  }
}
```

Set the merchant mapping on the Marketplace API and the image allowlist on the
worker. Preserve the existing storage settings. Merchant sync denies unlisted
IDs. Image imports require a configured HTTPS hostname and a public IPv4
address. Redirects are rejected. Inbound login links are single-use and expire
after five minutes.

## Checkout recovery

A successful capture is recorded before the order transaction. The same
checkout can retry an interrupted order write as long as its details are
unchanged. If the cart changed or expired, or a charge could not be identified
inside the retry window, reconcile the payment using its transaction key and
Stripe PaymentIntent before initiating a replacement checkout.
