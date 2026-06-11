import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

// 部署目標：kiwissec.github.io（GitHub org/user pages → 服務於站台根目錄，故 base 為 '/'）。
// `site` 供 canonical / Open Graph / sitemap 產生絕對網址；日後若改掛自訂網域
// （如 https://kiwissec.com）只需改這一行並補 public/CNAME。
// 若需先於本 repo 以「專案頁」（.../Official-website/）預覽，請暫時把 base 改為
// '/Official-website/'（root-absolute 的資產路徑也需一併調整，故正式目標維持 root）。
export default defineConfig({
  site: "https://kiwissec.github.io",
  base: "/",
  // 與預設 build.format 'directory' 對齊：頁面最終網址皆為尾斜線形式
  // （GitHub Pages 對 /services 會 301 至 /services/）。站內連結與 canonical
  // 由 src/lib/site.ts 的 withBase() 統一補尾斜線；含副檔名的 endpoints
  // （robots.txt 等）不受此設定影響。
  trailingSlash: "always",
  integrations: [sitemap()],
});
