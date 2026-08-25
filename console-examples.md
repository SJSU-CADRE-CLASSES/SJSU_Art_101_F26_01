# Browser Console Examples

Open any page → right-click → **Inspect** → **Console**, then paste an example below.

---

## 1. Styled console messages

```js
console.log("%cHello from the console", "font-size: 24px; color: tomato; font-family: Georgia;");
console.log("%cArt 101", "background: #111; color: #0f0; padding: 8px 16px; font-size: 18px;");
```

## 2. Inspect data like a spreadsheet

```js
console.table([
  { name: "circle", sides: 0, color: "red" },
  { name: "square", sides: 4, color: "blue" },
  { name: "triangle", sides: 3, color: "yellow" }
]);
```

## 3. Change the whole page’s look

```js
document.body.style.background = "linear-gradient(135deg, #1a1a2e, #e94560)";
document.body.style.color = "white";
document.body.style.fontFamily = "Georgia, serif";
```

## 4. Random color generator

```js
const randomColor = () => "#" + Math.floor(Math.random() * 16777215).toString(16).padStart(6, "0");
document.body.style.background = randomColor();
console.log("New color:", randomColor());
```

## 5. Count every element on the page

```js
const tags = [...document.querySelectorAll("*")].map(el => el.tagName);
console.table(
  Object.entries(
    tags.reduce((acc, t) => ((acc[t] = (acc[t] || 0) + 1), acc), {})
  ).map(([tag, count]) => ({ tag, count }))
);
```

## 6. Draw on a canvas from the console

```js
const c = document.createElement("canvas");
c.width = 400; c.height = 400;
c.style.cssText = "position:fixed;top:20px;right:20px;z-index:9999;border:2px solid #fff;";
document.body.appendChild(c);
const ctx = c.getContext("2d");

for (let i = 0; i < 40; i++) {
  ctx.beginPath();
  ctx.arc(Math.random() * 400, Math.random() * 400, Math.random() * 40 + 5, 0, Math.PI * 2);
  ctx.fillStyle = `hsla(${Math.random() * 360}, 80%, 60%, 0.6)`;
  ctx.fill();
}
```

## 7. Make everything spin (then undo)

```js
// Spin
document.body.style.transition = "transform 2s";
document.body.style.transform = "rotate(360deg)";

// Reset after 2 seconds
setTimeout(() => { document.body.style.transform = ""; }, 2000);
```

## 8. Fetch a public API

```js
fetch("https://api.github.com/zen")
  .then(r => r.text())
  .then(zen => console.log("%c" + zen, "font-size: 20px; color: #58a6ff;"));
```

## 9. Live clock in the tab title

```js
setInterval(() => {
  document.title = new Date().toLocaleTimeString();
}, 1000);
```

## 10. Highlight every link

```js
document.querySelectorAll("a").forEach(a => {
  a.style.outline = "3px solid magenta";
  a.style.background = "yellow";
});
console.log(`Highlighted ${document.querySelectorAll("a").length} links`);
```

---

Tip: try these on a simple page like [example.com](https://example.com) so the DOM is easy to see.
