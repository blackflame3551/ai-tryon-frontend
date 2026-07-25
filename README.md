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

---

## Embeddable widget (`widget.js`)

This same folder also contains `widget.js` — a "✨ Try It On" button that
gets embedded on a real store's product page (Shopify, WooCommerce, etc.),
not just this demo page. Once deployed, it's publicly reachable at:

```
https://YOUR-SITE-NAME.netlify.app/widget.js
```

To install it on a store's product page, paste this (filling in the real
backend URL, merchant key, and Netlify URL above):

```html
<div class="ai-tryon-widget"
     data-backend="https://ai-tryon-backend-production.up.railway.app"
     data-merchant-key="mch_live_test_789"
     data-product-id="{{ product.id }}"
     data-product-name="{{ product.title }}"
     data-product-price="{{ product.price | money }}"
     data-product-image="{{ product.featured_image | img_url: '600x' }}">
</div>
<script src="https://YOUR-SITE-NAME.netlify.app/widget.js" defer></script>
```

The `{{ product.* }}` parts are Shopify's own placeholders — they fill in
automatically per product, so the same snippet works across a store's
whole catalog once pasted into the theme's product template.

`example-product-page.html` is a local mock store page for testing the
widget before installing it on a real site:
```bash
python -m http.server 8000
```
then open `http://localhost:8000/example-product-page.html`.

