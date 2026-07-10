# IEICE KEN Timetable Renderer - Cloudflare Pages Worker Mode

This package uses `_worker.js` instead of `/functions`, so it works with Cloudflare Pages Direct Upload and GitHub deployments.

Files:

- `index.html`: frontend UI
- `_worker.js`: API endpoint `/api/fetch-ieice`

Deploy:

1. Upload this folder to Cloudflare Pages, or connect it via GitHub.
2. Open the published Pages URL.
3. Test `/api/fetch-ieice`; it should return JSON like `{ "error": "Missing url parameter." }`.

The API only fetches `https://ken.ieice.org/ken/program/...` pages.
