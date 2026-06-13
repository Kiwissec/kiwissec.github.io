# kiwissec.com 搬遷 301 對應（Cloudflare Bulk Redirects）

舊 `kiwissec.com`（WordPress）改由本 Astro 站取代時，網域不變但**每頁路徑改變**。
本目錄的 `migration-redirects.csv` 是把舊網址 301 導向新網址的對應表，用來保住舊頁
累積的搜尋排名與外部連結權重、避免 404。`kiwissec.com` 既走 Cloudflare，可直接以
**Bulk Redirects** 設定真正的 301（host 仍為 GitHub Pages）。

## 資料來源

舊網址清單於 2026-06-13 由舊站的 Rank Math sitemap 群爬取取得
（`post-sitemap.xml` / `page-sitemap.xml` / `category-sitemap.xml`）。新網址對照本 repo
`src/data/courses/*.json` 的 `id`。

## 如何匯入 Cloudflare

1. Cloudflare 儀表板 → 該網域 → **Bulk Redirects** → 建立一個 Bulk Redirect List。
2. 上傳 `migration-redirects.csv`。

CSV 格式（Cloudflare 規範）：每行 `SOURCE_URL,TARGET_URL[,STATUS_CODE,...]`，**不可有
標題列**，`STATUS_CODE` 省略時預設 301（本檔已明確標 301）。格式說明見
<https://developers.cloudflare.com/rules/url-forwarding/bulk-redirects/reference/csv-file-format/>。

匯入後建立對應的 Bulk Redirect Rule 使清單生效。

## 對應原則與信心

依先前討論的原則：**對得上的逐一 1:1；對不上的一律導課程總表 `/courses/`**，避免 404、
把權重回收到課程頁。

- **18 筆高信心 1:1**：舊課程文章 slug 語意明確對上新課（`aw-*` / `def-*` / `off-*`）。
- **`secops-*` 與 `security-operations-*` → `/courses/def-01/`**：兩筆皆為「資安維運與網路
  安全」內容，導向同一新課；何者為舊站現役 slug 不影響導向正確性。
- **無明確對應者 → `/courses/`**：`web-penetration-testing-advanced`、
  `ai-security-threats-awareness`，以及新站已不再開設的舊課
  （`introduction-to-ot-security`、`blue-team-...-gcb`、`iso-27001-training-course`、
  `digital-forensic-and-case-study-course`）。
- **5 個 WordPress 分類頁 → `/courses/`**。
- **`social-engineering-testing` → `/services/`**；**`privacy-policy` → `/policy/`**。

## 可選精修（若要更精準，需課程負責人確認）

| 舊網址                                              | 目前導向    | 可精修為                                                  |
| --------------------------------------------------- | ----------- | --------------------------------------------------------- |
| `web-penetration-testing-advanced-training-course/` | `/courses/` | `/courses/off-05/` 或 `off-06/`（網站滲透測試中階／實務） |
| `category/.../cybersecurity-awareness/`             | `/courses/` | `/courses/?cat=awareness`                                 |
| `category/.../cybersecurity-practical/`             | `/courses/` | `/courses/?cat=offensive`                                 |
| `category/.../cybersecurity-management/`            | `/courses/` | `/courses/?cat=defensive`                                 |

## 仍待確認 / 刻意省略

- **`/?page_id=27924`**：爬取時無法辨識內容，未列入；確認該頁用途後再決定導向。
- **`/terms`**：新站路徑相同（`/terms/`），未列入；GitHub Pages 會把無尾斜線形式
  301 至 `/terms/`。
- **`/locations.kml`**：2022 年舊地圖檔，已廢棄，未列入（任其 404 即可）。

## Cutover Runbook（單一權威版本）

> 本節為搬遷操作的**唯一依據**。關鍵原則：**CNAME 生效後，GitHub Pages 會把
> `*.github.io` 301 轉到 `kiwissec.com`**；若此時 DNS 仍指舊 WordPress，新站會在
> github.io 不可達、而 `kiwissec.com` 仍是舊站。因此「合併 cutover commit／DNS 切換／
> 啟用 Cloudflare 轉址」要在**同一個協調視窗**完成，而非先後分開。

### Phase 0 — 前置（不影響線上站，可提前數天做）

1. 合併本 PR 的**站內 SEO 修復 commits**（非 cutover 的部分），部署到目前的
   `kiwissec.github.io`，確認新站在 github.io 一切正常。
2. 在 Cloudflare 用 `docs/migration-redirects.csv` **建立** Bulk Redirect 清單，但
   **先停用（disabled）**——DNS 仍指舊站時就啟用，會把舊站既有網址改寫掉。

### Phase 1 — Cutover 視窗（擇低流量時段，協調進行）

1. 合併**cutover commit**（`site` 改 `kiwissec.com` + 新增 `public/CNAME`）並部署，使
   GitHub Pages 設定自訂網域 `kiwissec.com`。
2. **緊接著**在 Cloudflare 把 `kiwissec.com` 的 DNS/origin 由舊 WordPress 切到 GitHub
   Pages（依 GitHub Pages 自訂網域文件設定 apex A/AAAA 或 CNAME；Cloudflare proxy 與
   SSL 模式一併確認）。合併 cutover 與此 DNS 切換兩步要相鄰，縮短新站不可驗證的空窗。
3. DNS 生效後，**啟用** Cloudflare Bulk Redirect 清單。

### Phase 2 — 驗證

1. `curl -I https://kiwissec.com/` → 200（新站）。
2. 抽查數個舊網址 `curl -I https://kiwissec.com/<舊 slug>/` → 301 → 對應新網址。
3. 確認 `https://kiwissec.com/` 的 canonical / og:url / `robots.txt` / `sitemap-index.xml`
   皆為 `kiwissec.com`。
4. 在 Search Console 提交新 sitemap、監看涵蓋率與 404（見下節）。

### Rollback

- 若新站異常：在 Cloudflare 把 DNS/origin **切回舊 WordPress** 並**停用** Bulk Redirects
  即可恢復舊站。轉址與 DNS 都在 Cloudflare 控制，rollback 快速、無需改動 repo。

### 需與 ops 確認（無法從本 repo 判定）

- 公開部署 repo（`kiwissec.github.io`）的 GitHub Pages 是否已設定，以及本 repo 的
  `public/CNAME` 如何同步到實際部署。
- 目前 `kiwissec.com` 的 DNS 記錄、Cloudflare proxy 與 SSL 模式。
- GitHub Pages 對 apex 自訂網域要求的確切 DNS 記錄（A records vs CNAME）。

## Google Search Console（無需改碼）

`kiwissec.com` 既走 Cloudflare，建議以 **Cloudflare DNS 的 TXT 記錄**完成 GSC 網域驗證
（網域層級驗證，免在頁面埋驗證 meta）。驗證後提交 `https://kiwissec.com/sitemap-index.xml`，
並於「成效 / 涵蓋率」報表監看搬遷後的索引變化與 404。
