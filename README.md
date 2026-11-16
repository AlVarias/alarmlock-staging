# AlarmLock New Zealand — Red & White Website, E-Commerce Store & NFC Calling Card

## Included Files
- `index.html` — Home page (with Hero picture & Featured Yale 3109 Best-Seller picture)
- `products.html` — Mini e-commerce storefront with product photos, quick-view specs & shopping cart
- `about.html` — About Us (with East Tamaki Workshop / Mobile Van picture) & interactive Security Checklist
- `contact.html` — Contact Us, map & booking form
- `card.html` — **Hidden Digital Calling Card** for **Molino Garcia (Locksmith)** accessible directly via QR code or NFC tap (`https://alarmlock.co.nz/card.html`)
- `products-data.js` — Product catalog photos & prices
- `script.js` & `style.css` — Shared storefront scripts and Red & White styles
- `images/` — Visual assets ready to be replaced with your own photos

## Setting Up Molino Garcia's NFC & QR Calling Card (`card.html`)
1. `card.html` has **no links** from `index.html`, `products.html`, `about.html`, or `contact.html`, and includes `<meta name="robots" content="noindex, nofollow" />`.
2. Write the URL `https://alarmlock.co.nz/card.html` (or `https://<your-username>.github.io/<repo-name>/card.html`) to your NFC card (e.g., NTAG215 via NFC Tools) and generate your QR code to that same URL.
3. To update Molino's direct mobile number or email later, edit `CARD_PROFILE` in `card.html`—the page links and the one-tap **Save Contact (.vcf)** download will update automatically.
