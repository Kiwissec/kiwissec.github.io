# 七維思 Kiwissec 官方網站

資安教育品牌「七維思 Kiwissec」的官方行銷網站，以 **Astro（靜態優先）** 建置，部署於 GitHub Pages。

## 快速開始

```bash
mise install   # 安裝釘選的 Node（見 mise.toml）
npm install
npm run dev    # 啟動開發伺服器（預設 http://localhost:4321）
```

## 常用指令

| 指令 | 說明 |
| --- | --- |
| `npm run dev` | 本機開發伺服器 |
| `npm run build` | 建置靜態站至 `dist/` |
| `npm run preview` | 預覽建置結果 |
| `npm run check` | 型別與診斷檢查（`astro check`） |
| `npm run test:e2e` | Playwright E2E（先 `npx playwright install chromium`） |

## 專案結構

```text
src/
  pages/        路由頁（index / services / courses / news + 法務頁）
  components/   UI 元件（Navbar / Hero / Footer / 各區塊）
  layouts/      Base（含 SEO / OG）/ LegalLayout
  styles/       tokens.css（設計 token）+ site.css
  data/         *.json（內容 collections）+ site.ts（站台單例 / UI 文案）
  lib/          site.ts（base-path / 絕對網址工具）
public/         靜態資源（assets / favicon / og 圖；robots 由 src/pages 動態產生）
tests/          Playwright smoke
```

## 部署（GitHub Pages）

- 目標：`kiwissec.github.io`（org/user pages → 服務於站台根目錄，`astro.config.mjs` 的 `base` 為 `/`）。
- 推送到 `main` → GitHub Actions（`.github/workflows/deploy.yml`）自動建置並部署。
- 需於 **Settings → Pages** 將 **Source** 設為 **GitHub Actions**。
- CI：`.github/workflows/ci.yml` 於每個 PR 跑 `astro check` + `build` + Playwright。
- 自訂網域（如 `kiwissec.com`）：修改 `astro.config.mjs` 的 `site`，並在 `public/` 放 `CNAME`（目前測試階段未設）。
