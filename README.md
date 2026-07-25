# Fitting Room — demo frontend

Static site, no build step. Deploys as-is.

## Before deploying
Open `index.html` and edit the top of the `<script>` block:

```js
const BACKEND_API_BASE = "https://ai-tryon-backend-production.up.railway.app";
const MERCHANT_KEY = "mch_live_test_789";
```

Set these to your real Railway backend URL and the merchant API key for
whichever merchant document you want this demo to authenticate as.

## Deploy on Netlify (fastest way)
1. Go to https://app.netlify.com/drop
2. Drag this whole folder onto the page
3. Netlify gives you a live URL immediately — no account required to try it,
   an account is only needed to keep the site permanently.

## Running a live demo against a real store's product
Use "+ Add a product" in the lookbook rail:
- Paste the product name and price
- Paste the product photo's URL (right-click the image on the store page →
  "Copy image address"), or use "Upload image instead" if you've saved the
  photo locally

The new look is added to the catalog immediately and can be tried on right
away — no code changes needed mid-demo.
