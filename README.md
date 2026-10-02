# 海大午間候位叫號系統

國立臺灣海洋大學午餐候位 Queue 示範網站，使用 HTML、CSS 與原生 JavaScript 製作。資料存在瀏覽器目前頁面中，重新整理後會重置。

## 本機預覽

直接用瀏覽器開啟 `index.html` 即可。

## 發布到 GitHub Pages

此專案已設定 GitHub Actions：推送到 `main` 分支時，會自動發布網站。

1. 在 GitHub 建立一個 repository，並將本專案推送到該 repository 的 `main` 分支。
2. 到 repository 的 **Settings → Pages**，將 **Build and deployment → Source** 設為 **GitHub Actions**。
3. 等待 repository 的 **Actions** 頁面顯示部署成功。
4. 網站網址會是 `https://<你的GitHub帳號>.github.io/<repository名稱>/`。

若 repository 名稱是 `<你的GitHub帳號>.github.io`，網站網址則是 `https://<你的GitHub帳號>.github.io/`。

之後每次推送到 `main`，GitHub Actions 都會重新部署。