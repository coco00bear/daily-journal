/* 把 index.html 包成可以獨立開啟的 docs/index.html（GitHub Pages 用）。
 *
 * 為什麼需要這一步：index.html 是給 Claude Artifact 用的 body 片段，
 * 發布時 Artifact 會自己補上 doctype 與 <head>。GitHub Pages 直接把檔案
 * 丟給瀏覽器，沒有 doctype 就會進 quirks mode，圓角卡片與 flex 版面會壞掉。
 *
 * 用法：node build.js     （改完 index.html 就跑一次，然後 commit）
 */
var fs = require("fs");
var path = require("path");

var dir = __dirname;
var src = fs.readFileSync(path.join(dir, "index.html"), "utf8");

/* 片段裡自帶的 title 與 viewport 要拿掉，改由下面的 <head> 提供 */
var title = (src.match(/<title>([^<]*)<\/title>/) || [])[1] || "今日草木";
var body = src
  .replace(/<meta name="viewport"[^>]*>\s*/i, "")
  .replace(/<title>[^<]*<\/title>\s*/i, "")
  .trim();

var icon = encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">' +
  '<text y=".9em" font-size="90">🌿</text></svg>'
);

var page = [
  "<!doctype html>",
  '<html lang="zh-Hant">',
  "<head>",
  '<meta charset="utf-8" />',
  '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />',
  "<title>" + title + "</title>",
  '<meta name="description" content="每日記錄：記帳、完成清單、運動、感受與心情。資料只存在自己的瀏覽器裡。" />',
  /* 手機瀏覽器的網址列顏色，跟白底／黑底對齊 */
  '<meta name="theme-color" content="#F6EFEA" media="(prefers-color-scheme: light)" />',
  '<meta name="theme-color" content="#100B0D" media="(prefers-color-scheme: dark)" />',
  '<meta name="apple-mobile-web-app-capable" content="yes" />',
  '<meta name="apple-mobile-web-app-title" content="' + title + '" />',
  '<link rel="icon" href="data:image/svg+xml,' + icon + '" />',
  "<style>body{margin:0;padding:0}img{max-width:100%}</style>",
  "</head>",
  "<body>",
  body,
  "</body>",
  "</html>",
  ""
].join("\n");

fs.mkdirSync(path.join(dir, "docs"), { recursive: true });
fs.writeFileSync(path.join(dir, "docs", "index.html"), page);
console.log("docs/index.html 已更新（" + page.length + " 字元）");
