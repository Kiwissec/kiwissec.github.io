# 七維思 Kiwissec 官方網站

資安教育品牌「七維思 Kiwissec」的官方行銷網站，以 **Astro（靜態優先）** 建置，部署於 GitHub Pages（網址 [kiwissec.com](https://kiwissec.com)）。

> 程式碼由團隊統一維護。若要協助維護**內容**（課程／服務／最新消息／學員見證／常見問題），請見下方「內容維護」，**不需也不建議直接修改程式碼**。

## 快速開始

```bash
mise install   # 安裝釘選的 Node 與 pre-commit（見 mise.toml）
npm install
npm run dev    # 啟動開發伺服器（預設 http://localhost:4321）
```

## 常用指令

| 指令                    | 說明                            |
| ----------------------- | ------------------------------- |
| `npm run dev`           | 本機開發伺服器                  |
| `npm run build`         | 建置靜態站至 `dist/`            |
| `npm run preview`       | 預覽建置結果                    |
| `npm run check`         | 型別與診斷檢查（`astro check`） |
| `npm run audit:content` | 內容完整性稽核                  |
| `npm run test:e2e`      | Playwright E2E / 視覺行為測試   |

## 內容維護

課程／服務／最新消息／學員見證／常見問題以「每筆一檔」存於 `src/data/`，由夥伴透過 **Sveltia CMS**（[`/admin/`](https://kiwissec.com/admin/)）以瀏覽器編輯，不需寫程式。完整操作步驟與欄位說明見 [`docs/維護指南.md`](./docs/維護指南.md)。

## 部署

推送到 `main` 後由 GitHub Actions 自動建置並部署至 GitHub Pages；自訂網域 `kiwissec.com` 由 `public/CNAME` 指定。
