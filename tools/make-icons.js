/* 產生 docs/ 底下的 PNG 圖示（分頁 favicon、iOS 主畫面、Android manifest）。
 *
 * 為什麼要 PNG：iOS「加入主畫面」只讀 apple-touch-icon 且不支援 SVG；
 * 部分瀏覽器的分頁圖示也不吃 SVG data URI。所以一律備 PNG。
 *
 * 為什麼用 canvas 而不是截圖：headless Chrome 的 layout viewport 最小被夾在
 * 500px，截不出 180×180；canvas.toDataURL 不受 viewport 影響，尺寸精準。
 *
 * 用法：node tools/make-icons.js
 * 圖示改了才需要重跑（產生檔已 commit，平常不用跑）。
 */
var fs = require("fs");
var path = require("path");
var os = require("os");
var cp = require("child_process");

var CHROME = process.env.CHROME ||
  "C:/Program Files/Google/Chrome/Application/chrome.exe";
var GLYPH = "🌿";
var BG = "#FBEBD7";                 /* 與 App 的 --cream 同色 */
var SIZES = [512, 192, 180, 32];

var docs = path.join(__dirname, "..", "docs");
var tmp = path.join(os.tmpdir(), "jincao-icons-" + process.pid);
fs.mkdirSync(tmp, { recursive: true });
fs.mkdirSync(docs, { recursive: true });

var page =
  '<div id="out"></div>\n<script>\n' +
  'var sizes = ' + JSON.stringify(SIZES) + ';\n' +
  'setTimeout(function () {\n' +
  '  var out = [];\n' +
  '  sizes.forEach(function (n) {\n' +
  '    var c = document.createElement("canvas");\n' +
  '    c.width = n; c.height = n;\n' +
  '    var x = c.getContext("2d");\n' +
  '    x.fillStyle = ' + JSON.stringify(BG) + ';\n' +
  '    x.fillRect(0, 0, n, n);\n' +
  /* 0.62 倍字級、略高於正中央 —— 留出 maskable 圖示的安全區 */
  '    x.font = Math.round(n * 0.62) + \'px "Segoe UI Emoji","Apple Color Emoji","Noto Color Emoji",sans-serif\';\n' +
  '    x.textAlign = "center"; x.textBaseline = "middle";\n' +
  '    x.fillText(' + JSON.stringify(GLYPH) + ', n / 2, n * 0.54);\n' +
  '    out.push(n + "|" + c.toDataURL("image/png"));\n' +
  '  });\n' +
  '  document.getElementById("out").textContent = out.join("\\n");\n' +
  '}, 400);\n<\/script>\n';

var src = path.join(tmp, "gen.html");
fs.writeFileSync(src, page);

var dom = cp.execFileSync(CHROME, [
  "--headless", "--disable-gpu", "--window-size=600,600",
  "--virtual-time-budget=3000", "--dump-dom", src
], { encoding: "utf8", maxBuffer: 64 * 1024 * 1024, stdio: ["ignore", "pipe", "ignore"] });

var made = 0;
SIZES.forEach(function (n) {
  var m = dom.match(new RegExp(n + "\\|data:image/png;base64,([A-Za-z0-9+/=]+)"));
  if (!m) { console.error("× " + n + "px 沒產出來"); return; }
  var buf = Buffer.from(m[1], "base64");
  var name = n === 32 ? "favicon-32.png" : "icon-" + n + ".png";
  fs.writeFileSync(path.join(docs, name), buf);
  /* PNG 檔頭第 16~24 位元組是寬高，順便驗一下尺寸真的對 */
  console.log("✓ docs/" + name + "  " + buf.readUInt32BE(16) + "x" + buf.readUInt32BE(20) +
    "  " + (buf.length / 1024).toFixed(1) + " KB");
  made++;
});

fs.rmSync(tmp, { recursive: true, force: true });
if (made !== SIZES.length) process.exit(1);
