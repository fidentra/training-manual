# FidentraOS — User Manual

Static training manual (no build step).

```
index.html          all modules, pages, sidebar, styles and scripts
assets/images/      all screenshots and logos
.github/workflows/  auto-deploy to GitHub Pages on every push to main
```

## Edit
Change `index.html` (content/layout) or add images to `assets/images/` and reference them as `assets/images/<file>`.
Preview locally: `python3 -m http.server 8000` then open http://localhost:8000

## Deploy (one-time setup)
1. Push this repo to GitHub (branch `main`).
2. Repo → Settings → Pages → Source: **GitHub Actions**.
3. After the first run, the URL is `https://<user>.github.io/<repo>/`.

Every later push to `main` redeploys automatically.
