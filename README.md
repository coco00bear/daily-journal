# 今日草木 — 每日生活記錄

單檔的每日記錄工具：記帳、今日完成、運動、感受、心情，加上「花園」頁的月曆、月結與一棵會隨記錄天數長大的樹。

- 沒有後端、沒有帳號、沒有任何連外請求。
- 資料只存在瀏覽器的 `localStorage`，換裝置或清瀏覽器資料前請先匯出備份。
- 外觀「傘下」，可切白底／黑底（記在 `localStorage`，預設跟隨系統）。

## 檔案

| 檔案 | 用途 |
|---|---|
| `index.html` | **來源檔**。給 Claude Artifact 用的 body 片段（沒有 doctype／`<head>`，發布時由 Artifact 補上） |
| `build.js` | 把 `index.html` 包成可獨立開啟的 `docs/index.html`，並產生 `manifest.webmanifest` |
| `tools/make-icons.js` | 產生 `docs/` 底下的 PNG 圖示（只有換圖示時才需要跑） |
| `docs/index.html` | **產生檔**，GitHub Pages 就是吃這個。不要手改，改 `index.html` 後重跑 build |
| `docs/*.png` | 圖示。iOS 主畫面只讀 `apple-touch-icon` 且不支援 SVG，所以一律備 PNG |
| `docs/version.txt` | 版本字串。App 會繞過快取讀它，發現與手上不同就提示更新 |

## 改東西的流程

```bash
# 1. 改來源檔
#    （編輯 index.html）

# 2. 產生 Pages 版本
node build.js

# 3. 推上去
git add -A && git commit -m "調整：..." && git push
```

GitHub Pages 大約一分鐘後生效。

### 舊版快取

GitHub Pages 固定回 `Cache-Control: max-age=600`（免費方案改不了），所以關掉再打開有機會還是舊版，最多 10 分鐘。App 自己有處理：

- 每次開啟／回到前景時，繞過快取讀 `version.txt`，跟頁面內的 `BUILD` 比對
- 不一樣就在畫面下方浮出「有新版 · 點一下更新」，點了會用 `?v=<新版本>` 重新載入（換一個沒被快取過的網址，比 `location.reload()` 可靠）
- 也可以自己來：右上角三條線 → **重新載入**

版本號顯示在備份面板最下面一行，格式是 `建置日期 · 來源檔 sha1 前七碼`。

## 部署設定（只需做一次）

repo：<https://github.com/coco00bear/daily-journal>

**Settings** → **Pages**：

- Source：`Deploy from a branch`
- Branch：`main` ／ 目錄選 **`/docs`**

網址會是 <https://coco00bear.github.io/daily-journal/>。

## 資料搬移

`localStorage` 是**綁網域**的，所以 Artifact 網址與 GitHub Pages 網址的資料是各自獨立的兩份。要把舊資料帶過去：

1. 在舊網址開啟 → 右上角三條線 → **匯出備份檔（JSON）**
2. 在新網址開啟 → 右上角三條線 → **匯入備份檔**，選剛才那個 JSON

同一份 JSON 匯入不會重複累加（以日期為 key 覆蓋），可以安心重試。

## 手機上像 App 一樣用

iPhone Safari／Android Chrome 開啟後，選「加入主畫面」。已設好 `theme-color` 與 `apple-mobile-web-app-title`，會用綠葉圖示、標題顯示「今日草木」。

## 客製

- **每日一句**：`index.html` 裡的 `QUOTES` 陣列（目前 113 句），`a` 留空就不顯示出處。
- **記帳分類**：`CATS` 陣列（代碼字、key、顯示名），顏色是 CSS 的 `--c-food` 等變數。
- **心情**：`MOODS` 陣列。
- **配色**：CSS 的 `:root[data-skin="parasol"]` 區塊，季節色相在下面四行 `[data-season]`。
