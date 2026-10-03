# FidentraOS — User Manual (website)

Static website (HTML/CSS/JS). No build step. Every push to `main`
automatically redeploys the live site via GitHub Actions.

## Structure
```
index.html                 Manual content (all 162 sections)
css/styles.css             Styles
js/script-1..3.js          Navigation and interactions
assets/images/             Screenshots and logo
.github/workflows/deploy.yml   Auto-deploy to GitHub Pages
.nojekyll                  Tells Pages to serve files as-is
```

## One-time setup
1. Create a new GitHub repository (e.g. `fidentra-manual`).
2. Push this folder to it (commands below).
3. In the repo: **Settings → Pages → Build and deployment → Source = GitHub Actions**.
4. Open the **Actions** tab and wait for "Deploy manual to GitHub Pages" to finish.
5. Your link will be `https://<username>.github.io/<repo-name>/`
   (also shown in the Actions run and Settings → Pages).

```bash
git init
git add .
git commit -m "Initial manual"
git branch -M main
git remote add origin https://github.com/<username>/<repo-name>.git
git push -u origin main
```

## Updating the manual afterwards
Edit files, then:
```bash
git add .
git commit -m "Describe your change"
git push
```
The site updates automatically in ~1 minute (hard refresh with Ctrl+F5).
You can also edit files directly on github.com and commit there.

## Use your existing link / custom domain
- Custom domain: Settings → Pages → Custom domain (add a DNS CNAME to
  `<username>.github.io`). This keeps your current URL if you own the domain.
- Other hosts (Netlify, Vercel, Cloudflare Pages): connect this repo,
  build command = none, publish directory = `/` (root). Pushes then deploy automatically.

## Local preview
```bash
python3 -m http.server 8000   # then open http://localhost:8000
```
