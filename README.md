# 七維思 Kiwissec 官方網站

資安教育品牌「七維思 Kiwissec」的官方行銷網站，以 **Astro（靜態優先）** 建置，部署於 GitHub Pages。

> **重要：本 repo 的程式碼由開發 repo 同步覆蓋**
>
> 雙 repo 分工——**程式碼／版型／測試／設定**的來源權威在 private 開發 repo，會定期由同步腳本「additive 覆寫」推送到這裡；**請勿直接在本 repo 修改** `src/components`、`src/layouts`、`src/styles`、`tests/`、設定檔等程式碼（改了會部署成功，但下次同步時被無聲覆蓋）。
>
> 只有**內容**在本 repo 維護：`src/data/<collection>/*.json` 與 `public/assets/news/`（透過 CMS 或直接 PR，見下「內容維護」）。本 README 與 `deploy.yml`、`.gitignore`、`.pre-commit-config.yaml` 為本 repo 專屬檔，不被同步覆蓋。

## 快速開始

```bash
mise install   # 安裝釘選的 Node 與 pre-commit（見 mise.toml）
npm install
npm run dev    # 啟動開發伺服器（預設 http://localhost:4321）
```

## 常用指令

| 指令                    | 說明                                                                                  |
| ----------------------- | ------------------------------------------------------------------------------------- |
| `npm run dev`           | 本機開發伺服器                                                                        |
| `npm run build`         | 建置靜態站至 `dist/`                                                                  |
| `npm run preview`       | 預覽建置結果                                                                          |
| `npm run check`         | 型別與診斷檢查（`astro check`）                                                       |
| `npm run audit:content` | 內容完整性稽核（id 同檔名、order 唯一、news 圖與標籤合法、分類 CSS、collection 非空） |
| `npm run test:e2e`      | Playwright E2E / 視覺行為測試（執行時自動安裝 chromium）                              |

## 專案結構

```text
src/
  pages/        路由頁（index / services / courses / courses/[id] / news / 404 + 法務頁）
  components/   UI 元件（Navbar / Hero / Footer / 各區塊）
  layouts/      Base（含 SEO / OG）/ LegalLayout
  styles/       tokens.css（設計 token）+ site.css
  data/         <collection>/*.json（每筆一檔內容 collections）+ site.ts / course-cats.ts
  lib/          site.ts（base-path / 絕對網址工具）
public/         靜態資源（assets/、admin/（Sveltia CMS）、og 圖；robots 由 src/pages 動態產生）
tests/          Playwright smoke
docs/           維護指南.md（非工程夥伴的 CMS 操作說明）
scripts/        audit-content.mjs（內容稽核）
```

## 內容維護

課程／服務／最新消息／學員見證／常見問題以「每筆一檔」存於 `src/data/<collection>/*.json`，由非工程夥伴透過 **Sveltia CMS**（`/admin/`）編輯；改動會落 `content` 分支並自動開 PR，CI 綠後合併上線。完整步驟與欄位說明見 [`docs/維護指南.md`](./docs/維護指南.md)。

工程師批量改內容：直接在本 repo 開 branch 改 `src/data/<collection>/*.json` → PR 進 `main`；merge 後 `sync-content.yml` 會自動把 `content` 分支 fast-forward 對齊。

> **content→main 的 PR 請用「Create a merge commit」合併**：Squash／Rebase 會讓 `content` 分支與 `main` 永久分歧，自動同步從此靜默失效。

## 部署（GitHub Pages）

- 目標：`kiwissec.github.io`（org/user pages → 服務於站台根目錄，`astro.config.mjs` 的 `base` 為 `/`）。
- 推送到 `main` → GitHub Actions（`.github/workflows/deploy.yml`）自動建置並部署。
- 需於 **Settings → Pages** 將 **Source** 設為 **GitHub Actions**。
- CI：`.github/workflows/ci.yml` 於每個 PR 跑 `audit:content` + `astro check` + `build` + Playwright。
- 自訂網域（如 `kiwissec.com`）：修改 `astro.config.mjs` 的 `site`，並在 `public/` 放 `CNAME`（目前測試階段未設）。
