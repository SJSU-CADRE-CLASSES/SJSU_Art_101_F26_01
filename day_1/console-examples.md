# Browser Console Examples

Quick ideas for introducing the browser console in an intro creative coding class.

Open any webpage → right-click → **Inspect** → **Console**, then paste an example below.

---

## Console output

### Styled messages

```js
console.log("%cHello from the console", "font-size: 24px; color: tomato; font-family: Georgia;");
console.log("%cArt 101", "background: #111; color: #0f0; padding: 8px 16px; font-size: 18px;");

console.log(
  "%c hello creative coders ",
  "background: #111; color: #0f0; font-size: 28px; padding: 8px 16px; border-radius: 8px;"
);

console.log(
  "%c pink %c mint %c sky",
  "color:#ff69b4; font-size:20px; font-weight:bold;",
  "color:#98ff98; font-size:20px; font-weight:bold;",
  "color:#87ceeb; font-size:20px; font-weight:bold;"
);
```

**Talking points:** the console is a canvas too; `%c` applies CSS to log output.

### Data as a table

```js
console.table([
  { name: "circle", sides: 0, color: "red" },
  { name: "square", sides: 4, color: "blue" },
  { name: "triangle", sides: 3, color: "yellow" }
]);
```

### Confetti in the console

```js
const palette = ["🔴", "🟠", "🟡", "🟢", "🔵", "🟣"];
const confetti = Array.from({ length: 12 }, () => ({
  emoji: palette[Math.floor(Math.random() * palette.length)],
  x: Math.floor(Math.random() * 10),
  y: Math.floor(Math.random() * 10),
}));

console.table(confetti);
console.log("counts:", Object.fromEntries(
  palette.map(e => [e, confetti.filter(c => c.emoji === e).length])
));
```

**Talking points:** objects, `Array.from`, `console.table` for neat grids of data.

### Fetch a public API

```js
fetch("https://api.github.com/zen")
  .then(r => r.text())
  .then(zen => console.log("%c" + zen, "font-size: 20px; color: #58a6ff;"));
```

### Endless emoji vomit

Browser console ≠ terminal: **Ctrl+C won’t stop this.** Save the interval in a variable, then call `clearInterval(vomit)` when you’re done (or close the tab / refresh).

```js
const emoji = ["⬛", "⬜", "◼", "◻", "▪", "▫", "●", "○", "◆", "◇"];

const vomit = setInterval(() => {
  let row = "";
  for (let j = 0; j < 24; j++) {
    row += emoji[Math.floor(Math.random() * emoji.length)] + " ";
  }
  console.log(row);
}, 80);

// when you've had enough:
// clearInterval(vomit);
```

**Talking points:** arrays, `Math.random()`, loops, `setInterval` / `clearInterval`, why we name the timer so we can stop it.

### Animated loading bar

```js
let i = 0;
const bar = setInterval(() => {
  console.clear();
  console.log("[" + "█".repeat(i) + "░".repeat(20 - i) + "] " + i * 5 + "%");
  i++;
  if (i > 20) clearInterval(bar);
}, 100);
```

**Talking points:** `setInterval`, `clearInterval`, `console.clear()`, string `.repeat()`.

### ASCII art typewriter

```js
const art = `
   /\\_/\\
  ( o.o )
   > ^ <
`;

let i = 0;
const type = setInterval(() => {
  console.clear();
  console.log(art.slice(0, i));
  i++;
  if (i > art.length) clearInterval(type);
}, 40);
```

**Talking points:** strings as data, slicing, timers for animation.

### Live clock in the console

```js
const clock = setInterval(() => {
  console.clear();
  console.log(
    "%c " + new Date().toLocaleTimeString() + " ",
    "font-size: 40px; font-family: monospace; color: #222; background: #ffd;"
  );
}, 1000);

// later: clearInterval(clock);
```

**Talking points:** `Date`, continuous updates, remembering to stop intervals.

### Draw a pixel grid with emoji

```js
function drawCircle(size = 15) {
  const mid = (size - 1) / 2;
  for (let y = 0; y < size; y++) {
    let row = "";
    for (let x = 0; x < size; x++) {
      const d = Math.hypot(x - mid, y - mid);
      row += d < mid * 0.7 ? "● " : "· ";
    }
    console.log(row);
  }
}

drawCircle(17);
```

**Talking points:** functions, `Math.hypot`, treating the console like a low-res canvas.

### Cellular automata (Game of Life)

Clear the console, redraw the whole frame, repeat. Each “pixel” is a cell that lives or dies based on its neighbors.

```js
const W = 40, H = 20;
let grid = Array.from({ length: H }, () =>
  Array.from({ length: W }, () => (Math.random() < 0.35 ? 1 : 0))
);

function neighbors(x, y) {
  let n = 0;
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      if (dx === 0 && dy === 0) continue;
      const xx = (x + dx + W) % W;
      const yy = (y + dy + H) % H;
      n += grid[yy][xx];
    }
  }
  return n;
}

function step() {
  grid = grid.map((row, y) =>
    row.map((cell, x) => {
      const n = neighbors(x, y);
      if (cell === 1) return n === 2 || n === 3 ? 1 : 0;
      return n === 3 ? 1 : 0;
    })
  );
}

function draw() {
  console.clear();
  console.log(
    grid.map(row => row.map(c => (c ? "█" : "·")).join("")).join("\n")
  );
}

const life = setInterval(() => {
  draw();
  step();
}, 120);

// when you've had enough:
// clearInterval(life);
```

**Talking points:** 2D arrays, rules as code, wrapping edges with `%`, animation via `console.clear` + redraw. Try changing the `0.35` start density or the birth/survive rules.

---

## Page styling & effects

### Change the whole page’s look

```js
document.body.style.background = "linear-gradient(135deg, #1a1a2e, #e94560)";
document.body.style.color = "white";
document.body.style.fontFamily = "Georgia, serif";
```

### Random color generator

```js
const randomColor = () => "#" + Math.floor(Math.random() * 16777215).toString(16).padStart(6, "0");
document.body.style.background = randomColor();
console.log("New color:", randomColor());
```

### Make everything spin (then undo)

```js
// Spin
document.body.style.transition = "transform 2s";
document.body.style.transform = "rotate(360deg)";

// Reset after 2 seconds
setTimeout(() => { document.body.style.transform = ""; }, 2000);
```

### Flood the page with floating emoji

```js
for (let i = 0; i < 30; i++) {
  const el = document.createElement("div");
  el.textContent = ["⭐", "💫", "🌙", "☀️"][i % 4];
  el.style.cssText = `
    position: fixed;
    left: ${Math.random() * 100}vw;
    top: ${Math.random() * 100}vh;
    font-size: ${20 + Math.random() * 40}px;
    pointer-events: none;
    z-index: 9999;
  `;
  document.body.appendChild(el);
}
```

**Talking points:** the console talks to the live DOM; CSS + JS = instant visual change. *(Refresh the page to reset.)*

### Live clock in the tab title

```js
setInterval(() => {
  document.title = new Date().toLocaleTimeString();
}, 1000);
```

---

## Exploring the DOM

### Count every element on the page

```js
const tags = [...document.querySelectorAll("*")].map(el => el.tagName);
console.table(
  Object.entries(
    tags.reduce((acc, t) => ((acc[t] = (acc[t] || 0) + 1), acc), {})
  ).map(([tag, count]) => ({ tag, count }))
);
```

### Highlight every link

```js
document.querySelectorAll("a").forEach(a => {
  a.style.outline = "3px solid magenta";
  a.style.background = "yellow";
});
console.log(`Highlighted ${document.querySelectorAll("a").length} links`);
```

### Remix something on the page

Pick a news site or Wikipedia, then try:

```js
document.querySelectorAll("img").forEach(img => {
  img.style.filter = "hue-rotate(180deg) contrast(1.2)";
});

document.querySelectorAll("p").forEach(p => {
  p.style.fontFamily = "Comic Sans MS, cursive";
  p.style.lineHeight = "2";
});

document.title = "✨ we remixed this page ✨";
```

**Talking points:** `querySelectorAll`, loops over real page elements, “hacking” as creative play (and why refresh resets everything).

---

## Creative coding

### Draw on a canvas from the console

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

---

## Sound

### Beep with the Web Audio API

```js
const ctx = new AudioContext();
function beep(freq = 440, duration = 0.15) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.frequency.value = freq;
  gain.gain.value = 0.1;
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + duration);
}

// Little ascending arpeggio
[262, 330, 392, 523].forEach((f, i) => {
  setTimeout(() => beep(f), i * 200);
});
```

**Talking points:** the browser can make sound; functions with parameters; `setTimeout` for rhythm. *(Some browsers need a click on the page first before audio will play.)*

---

## Teaching tips

| Tip | Why |
|-----|-----|
| Start on a blank / simple page (`about:blank` works) | Less noise in the console |
| Have students paste one demo at a time | Easier to debug typos together |
| Ask “what happens if we change this number?” | Reinforces experimentation |
| Show `console.clear()` early | Keeps demos readable |
| End with “change something on this website” | Connects console → real DOM |

---

## Bonus challenge for students

1. Make a 10×10 grid of your own emoji set.
2. Animate it so the pattern refreshes every half second.
3. Stop the animation with `clearInterval(...)`.
4. Extra credit: make a smiley face or initial with `●` / `·` like the pixel grid example above.

---

Tip: try these on a simple page like [example.com](https://example.com) so the DOM is easy to see.
