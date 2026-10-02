# 二元搜尋樹種樹所

一個用來認識二元搜尋樹（Binary Search Tree）的互動式小教室，使用 HTML、CSS 與原生 JavaScript 製作。

- 輸入整數，觀察它一路比較大小、往左或往右找到位置。
- 比較路徑會在樹上標示，並列出每一步的判斷。
- 可切換前序、中序、後序走訪，逐步播放並在樹上標示目前節點。
- 中序走訪可查看由小到大的數字排列。
- 支援隨機插入、重複數字提示和重新開始。
- 預設顯示一棵範例樹；重新整理會回到範例。

## 本機預覽

直接用瀏覽器開啟 `index.html` 即可，無須安裝相依套件或啟動伺服器。

## 發布到 GitHub Pages

此專案已設定 GitHub Actions：推送到 `main` 分支時，會自動發布網站。

1. 在 GitHub 建立一個 repository，並將本專案推送到該 repository 的 `main` 分支。
2. 到 repository 的 **Settings → Pages**，將 **Build and deployment → Source** 設為 **GitHub Actions**。
3. 等待 repository 的 **Actions** 頁面顯示部署成功。
4. 網站網址會是 `https://<你的GitHub帳號>.github.io/<repository名稱>/`。

若 repository 名稱是 `<你的GitHub帳號>.github.io`，網站網址則是 `https://<你的GitHub帳號>.github.io/`。

之後每次推送到 `main`，GitHub Actions 都會重新部署。