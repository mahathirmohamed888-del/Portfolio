# Mahathir Mohamed — Portfolio

A single-page personal portfolio built with plain **HTML, CSS and JavaScript**.
No installation, no build step, no backend.

## Folder structure

```
portfolio/
├── index.html                  ← all the text and sections of the website
├── css/
│   └── style.css               ← colours, fonts, layout and animations
├── js/
│   └── main.js                 ← interactions (menu, animations, popup, filters)
├── assets/
│   ├── images/
│   │   ├── profile.jpg         ← YOUR PHOTO (you add this)
│   │   └── favicon.svg         ← small icon in the browser tab
│   └── resume/
│       └── Mahathir-Mohamed-Resume.pdf   ← YOUR CV (you add this)
└── README.md
```

## Before you start

1. **Add your photo**: save it as `assets/images/profile.jpg` (exact name, lowercase).
   Until you do, the site shows "MM" initials in its place.
   The photo is only *framed* (cropped by the box), never edited.
   To show more of the top or bottom of the photo, open `css/style.css`, search for
   `object-position` and change `center 20%` (smaller % = shows higher up).
2. **Add your CV**: save it as `assets/resume/Mahathir-Mohamed-Resume.pdf`.

## Run it on your computer

**Easiest:** double-click `index.html`. It opens in your browser.

**Recommended (behaves exactly like the real website):** use VS Code's *Live Server*.
1. Install [VS Code](https://code.visualstudio.com/).
2. In VS Code, open the Extensions panel (the four squares icon), search **Live Server**, install it.
3. File → Open Folder → choose the `portfolio` folder.
4. Right-click `index.html` → **Open with Live Server**. The site opens and refreshes automatically every time you save.

## Editing content

| I want to change…               | Open this file        | Search for                     |
|---------------------------------|-----------------------|--------------------------------|
| Any text on the page            | `index.html`          | the text itself                |
| A project case study (popup)    | `index.html`          | `<template id="case-1">` etc.  |
| Add a skill                     | `index.html`          | `ANALYTICS TOOLKIT`            |
| Add GitHub link                 | `index.html`          | `GitHub placeholder`           |
| Colours                         | `css/style.css`       | `DESIGN TOKENS`                |

## Publish free on GitHub Pages

1. Create a GitHub account and a new **public** repository (e.g. `portfolio`).
2. On the repository page click **Add file → Upload files**, drag in *everything inside* the `portfolio` folder (so `index.html` is at the top level), then **Commit changes**.
3. Go to **Settings → Pages**. Under *Branch*, choose `main` and `/ (root)`, then **Save**.
4. After a minute your site is live at `https://YOUR-USERNAME.github.io/portfolio/`.
5. Optional: in `index.html`, update `og:url` and `og:image` with full web addresses so link previews on LinkedIn show your photo.
