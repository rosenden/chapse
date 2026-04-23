# Chaps-e Generator

Playground interactif pour assembler la mascotte **Chaps-e** a partir d'assets SVG (light/dark), avec une UI construite sur **Galactik Design React**.

## Ce que fait l'app

- Assemble un robot couche par couche (torse, tete, yeux, chapeau, bras).
- Propose des presets emoji (`🙂`, `😵`, `🔧`, `🌍`, `🏆`).
- Permet une configuration custom:
  - theme `Light` / `Dark`
  - activation/desactivation de l'ombre
  - choix de la tete, des yeux, du chapeau
  - mode bras `Custom Arms` ou `Arm Set`
  - selection des sources de bras et des poses/objets
- Interface bilingue `EN` / `FR`.
- Export du robot final en **PNG** ou **SVG**.
- Experience responsive mobile-first (panel + playground adaptatifs).

## Stack technique

- React 19
- TypeScript
- Vite
- `galactik-design-react` (composants design system)
- `react-circle-flags` (selecteur de langue)

## Structure utile

- `src/App.tsx`: logique UI, etats, i18n, presets, actions d'export.
- `src/robot/chapse.ts`: catalogue d'assets, calibration des layers, composition SVG/PNG.
- `src/styles/global.css`: shell applicatif + base light.
- `src/styles/galactik-token-dark.css`: overrides dark centralises.
- `src/styles/robot-playground.css`: layout playground, overlays, grille/lueur.
- `src/assets/chapse/`: librairie SVG des pieces du robot (light/dark + examples + accessories).

## Lancer en local

Prerequis:

- Node.js 20+ (22 recommande)
- Acces au repo prive `galactik-design-react` (GitLab)

Installation et demarrage:

```bash
npm install
npm run dev
```

Build production:

```bash
npm run build
npm run preview
```

## Deploiement GitHub Pages (GitHub Actions)

Le repo est configure avec le workflow:

- `.github/workflows/deploy-pages.yml`

Fonctionnement:

- un push sur `main` declenche build + deploy Pages
- le `base` Vite est ajuste automatiquement via `GITHUB_REPOSITORY` dans `vite.config.ts`

URL de publication:

- https://rosenden.github.io/chapse/

Si c'est la premiere mise en ligne, verifier:

- `Settings > Pages > Build and deployment > Source = GitHub Actions`

## Scripts npm

- `npm run dev`: serveur de dev
- `npm run build`: type-check + build Vite
- `npm run preview`: previsualisation du build
- `npm run lint`: lint ESLint
