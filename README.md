# Clover Studios site

A plain static website. No build step, nothing to install.

## Running it

Just open `index.html` in a browser. If you want it to act like a real host,
serve the folder instead:

    python3 -m http.server 8000

Then go to http://localhost:8000

The fonts load from Google Fonts, so the first load needs an internet connection.

## What's in here

- `index.html`, `services.html`, `why-us.html`, `payment.html`, `team.html`, `contact.html`: the pages
- `css/style.css`: all the styling. Colors live as variables at the top under `:root`.
- `js/main.js`: all the animations and interactions.
- `js/vendor/`: the Lenis smooth scroll library and its license.
- `assets/`: favicon, phone icon, and the social preview image.
- `robots.txt`, `sitemap.xml`: for search engines.
- `site.webmanifest`: lets the site get saved to a phone home screen.

## Stuff you'll probably want to change

- Email: it's written as `cloverstudios.info (at) gmail (dot) com` on the contact
  page and in every footer. The real address is only glued together in `js/main.js`
  when someone clicks copy, so bots can't scrape it. Change it in both places.
- Team: the tree is in `team.html`, and a shorter list sits near the bottom of `index.html`.
- Colors: `--accent` and `--accent-2` in `css/style.css`.
- Scroll feel: the `lerp` and `wheelMultiplier` numbers in `js/main.js`.
- The header and footer are copied into each page, so edit all six if you change them.

## Going live

Upload the whole folder to any static host (GitHub Pages, Netlify, Cloudflare Pages, Vercel).
The domain is set to `cloverstudios.info` everywhere, so if it ends up somewhere else,
swap that out in the meta tags, `sitemap.xml`, and `robots.txt`.
