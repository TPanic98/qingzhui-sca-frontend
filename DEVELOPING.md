# Developing

> Please also read [`CODE_OF_CONDUCT.md`](./CODE_OF_CONDUCT.md).

## Prerequisites

- Node.js 22+
- npm 10+
- Docker or Podman (for [container image builds](#container-image))
- A running [API server](https://github.com/DependencyTrack/dependency-track)

## Core Technologies

| Technology                                      | Purpose           |
| :---------------------------------------------- | :---------------- |
| [Vue 2](https://v2.vuejs.org/)                  | UI framework      |
| [Vue CLI](https://cli.vuejs.org/)               | Build tooling     |
| [BootstrapVue](https://bootstrap-vue.org/)      | Component library |
| [CoreUI](https://coreui.io/vue/)                | Admin template    |
| [Vue Router](https://v3.router.vuejs.org/)      | Routing           |
| [vue-i18n](https://kazupon.github.io/vue-i18n/) | Localization      |
| [Axios](https://axios-http.com/)                | HTTP client       |
| [ESLint](https://eslint.org/)                   | Linting           |
| [Prettier](https://prettier.io/)                | Formatting        |

## Install

```shell
npm ci
```

## Dev Server

```shell
npm run serve
```

Defaults to `http://localhost:8080`, incrementing the port if it is already in use (e.g. `8081`).
The API base URL is configured at runtime via `public/static/config.json`.

## Build

```shell
npm run build
```

Output is written to `dist/`.

## Container Image

```shell
npm run build-image
```

Produces `ghcr.io/dependencytrack/frontend:local`.

## Linting and Formatting

```shell
npm run eslint-fix
npm run prettier-fix
```

## Localization

Locale files live in [`src/i18n/locales`](src/i18n/locales).

Adding a key:

1. Add it to `en.json` with the English translation.
2. Add the same key with a `null` value to every other locale file.
3. Run `npm run prettier-fix` to sort keys.

Reports and cleanup:

```shell
npm run vue-i18n-extract
npm run remove-unused-i18n
```

## Qingzhui P0 UI

The bank's visual reference uses warm white surfaces, orange/red accents, dark text, and restrained glass effects. The implementation retains Vue 2, BootstrapVue, CoreUI, existing routes, API endpoints, and permission checks. The target bank browser is Chrome 149.0.7827.103 (64-bit); the build's Browserslist explicitly includes Chrome 149 and later alongside the upstream targets. Runtime acceptance on the bank's exact browser remains separate from testing on a newer local Chrome.

### Brand assets

The original assets were downloaded without modification on 2026-10-27 from the links used by the [official homepage](https://www.hkbea.com.cn/index95.shtml):

| Local file                          | Official source                               | SHA256                                                             |
| ----------------------------------- | --------------------------------------------- | ------------------------------------------------------------------ |
| `src/assets/img/brand/bea-logo.png` | <https://www.hkbea.com.cn/images/logo.png>    | `cb307f6552e835ecef176ed5148c70dd7ee189ab61e7aa4905bd0b53344a9414` |
| `public/favicon.ico`                | <https://www.hkbea.com.cn/images/favicon.ico> | `b99768b3931c08f69af569a9a662f490b5665d7203fbf1eeb49baa44ed511c1c` |

The logo is the site's 4001 × 725 transparent PNG. The favicon is its original 16 × 16 ICO. Both are served locally; normal use requires no requests to the bank website. The Chinese and English slogans match the homepage footer and appear only on Login.

### Customization points

- `src/qingzhui/brand.js`: product names, fixed brand copy, and slogan.
- `src/qingzhui/Brand.vue`: original bank logo, product lockup, and optional slogan.
- `src/qingzhui/AuthLayout.vue`: shared public-page layout. Only Login enables `slogan`.
- `src/assets/scss/_qingzhui-tokens.scss`: bank palette and surface primitives.
- `src/assets/scss/_variables.scss`: Bootstrap/CoreUI component roles, distinct brand, risk, and notification colors.
- `src/assets/scss/_qingzhui.scss`: shared component and layout presentation, loaded after vendor styles.

New deployments start in Simplified Chinese. A saved language preference or explicit server default still takes precedence. Existing locale keys are reused; this phase introduces no new translation keys.

Product branding is separate from the backend's application identifier and upstream build metadata. About retains the Dependency-Track and OWASP information. Business-page restructuring and specialized chart/editor styling are later phases.

### Validation

Run the upstream `npm run eslint`, `npm run prettier`, and `npm run build` commands. For visual verification, cover Login, password change, 404, expanded/collapsed navigation, public notices, and common form/table/modal states. Check at least 1440 × 900, 1366 × 768, and 390 × 844. Verify empty-form validation, keyboard focus, and OIDC-only versus account-login layouts without changing real account credentials.
