# pdf-export

Exports a pdf version of a webpage and saves into an s3 bucket, then returns the requester the location where the PDF can be downloaded using lambda.

## API

### Paths.

* /
 * Default Path
 * Exports PDF using PhantomJS
 * webkit renderer.
* /nightmare
 * Exports a PDF using nightmare.
 * Uses chrome's rendering.
 * Does not work without an X11 server.
  * https://github.com/electron/electron/issues/228

### Path Parameters.

| Name         | Type    | Description                                                  |
|--------------|-------- |------------------------                                      |
| jwt          | String  | JWT token to use to authenticate with server                 |
| path         | String  | Location on the server to export                             |
| passCookies  | Boolean | Should cookies be passed from this server to the next server.|

### Example Response.

```json
{
  "url":"https://auditr-pdf-export-dev-files.s3.amazonaws.com/pauls_test_files/rklgCtyfUx?AWSAccessKeyId=ASIAJ4QI543ET7V5TBKA&Expires=1484025165&Signature=EdJtTTCc4MAxTLicYzRpjinFTK4%3D&x-amz-security-token=FQoDYXdzEGkaDIeZ3GOratBlkIiERyL4ASE%2BlWOuZjpn4jO9rPsNt%2BExn538ZGQ2By4qfI5aUk2o3RV5mRMVIXHT6TPZyUdYFGpoXLeSd54ReNGQzVE4XQVBQGxvFZm4GNp6MAQTiP%2BoURZH7qh14CaLO1z1XIDMeiu0OgI%2Ft00rmOX7f62ojGn86vuJ8i8bLFKIKAOJ4KQguomgsoYbtEpJ%2FNbz%2BWzKIm2MY2kGaKqw%2F6Ffs1oq3sgS2nGYNrG5bAi6%2FoUbct4y1f11cAIbV7wrAW4GyfTVHAqf7WL1lbIA9ffVorILAmETiQeP9uQ0DmSNOaHCbWlic9cF8PXk6tIQQXOtjt8nRQ1e7v3niNpkKILL0MMF"
}
```

## Usage
The service deploys to lambda and exposes the two endpoints `/` and `/nightmare` the package contains deployment scripts to assist deploying it to lambda

To deploy the lamba service run the following,

```
yarn run deploy
```

to test a locally running, offline version of the server run the following.

```
yarn run dev
```




