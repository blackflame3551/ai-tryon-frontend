# Personal Shopper — demo frontend

Static site, no build step. Deploys as-is.

## Before deploying
Open `index.html` and edit the top of the `<script>` block:

```js
const BACKEND_API_BASE = "https://ai-personal-shopper-backend-production.up.railway.app";
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
  "Copy image address")
- Optionally add a size chart: `S:45-55, M:55-65, L:65-80` (label + a
  weight range in kg, comma-separated). Leave it blank for products with
  no sizes — the widget will just skip the size half and show style
  matches only.

The new product is added to the catalog immediately, and once its image
finishes embedding in the background (usually a few seconds), it'll start
showing up as a style match for other products too.

---

## Embeddable widget (`widget.js`)

This same folder also contains `widget.js` — a "🧍 Find Your Size & Style"
button that gets embedded on a real store's product page (Shopify,
WooCommerce, etc.), not just this demo page. No photo upload — it asks for
height, weight, and a fit preference, then returns a size recommendation
plus a small grid of matching products from the same store. Once deployed,
it's publicly reachable at:

```
https://YOUR-SITE-NAME.netlify.app/widget.js
```

To install it on a store's product page, paste this (filling in the real
backend URL, merchant key, and Netlify URL above):

```html
<div class="ai-shopper-widget"
     data-backend="https://ai-personal-shopper-backend-production.up.railway.app"
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
