"use strict"

// =====================
// パーツ定義
// =====================
const PARTS = {
  face: [
    { id: "face_01", label: "卵型", src: "assets/face/face_01.svg" },
  ],
  eyes: [
    { id: "eye_01", label: "細目",     src: "assets/eye/eye_01.svg" },
    { id: "eye_02", label: "丸目",     src: "assets/eye/eye_02.svg" },
    { id: "eye_03", label: "たれ目",   src: "assets/eye/eye_03.svg" },
    { id: "eye_04", label: "つり目",   src: "assets/eye/eye_04.svg" },
    { id: "eye_05", label: "伏し目",   src: "assets/eye/eye_05.svg" },
    { id: "eye_06", label: "半目",     src: "assets/eye/eye_06.svg" },
    { id: "eye_07", label: "大きな目", src: "assets/eye/eye_07.svg" },
    { id: "eye_00", label: "なし",     src: "" },
  ],
  eyebrows: [
    { id: "brow_01", label: "太眉",     src: "assets/brow/brow_01.svg" },
    { id: "brow_02", label: "細眉",     src: "assets/brow/brow_02.svg" },
    { id: "brow_03", label: "アーチ眉", src: "assets/brow/brow_03.svg" },
    { id: "brow_04", label: "下がり眉", src: "assets/brow/brow_04.svg" },
    { id: "brow_05", label: "上がり眉", src: "assets/brow/brow_05.svg" },
    { id: "brow_06", label: "短め眉",   src: "assets/brow/brow_06.svg" },
    { id: "brow_07", label: "一文字眉", src: "assets/brow/brow_07.svg" },
    { id: "brow_00", label: "なし",     src: "" },
  ],
  nose: [
    { id: "nose_01", label: "点のみ",   src: "assets/nose/nose_01.svg" },
    { id: "nose_02", label: "小鼻孔",   src: "assets/nose/nose_02.svg" },
    { id: "nose_03", label: "丸み鼻",   src: "assets/nose/nose_03.svg" },
    { id: "nose_04", label: "高い鼻",   src: "assets/nose/nose_04.svg" },
    { id: "nose_05", label: "上向き鼻", src: "assets/nose/nose_05.svg" },
    { id: "nose_06", label: "団子鼻",   src: "assets/nose/nose_06.svg" },
    { id: "nose_00", label: "なし",     src: "" },
  ],
  mouth: [
    { id: "mouth_01", label: "にっこり",   src: "assets/mouth/mouth_01.svg" },
    { id: "mouth_02", label: "歯あり笑顔", src: "assets/mouth/mouth_02.svg" },
    { id: "mouth_03", label: "真一文字",   src: "assets/mouth/mouth_03.svg" },
    { id: "mouth_04", label: "への字",     src: "assets/mouth/mouth_04.svg" },
    { id: "mouth_05", label: "開口",       src: "assets/mouth/mouth_05.svg" },
    { id: "mouth_06", label: "少し開き",   src: "assets/mouth/mouth_06.svg" },
    { id: "mouth_07", label: "ままり",     src: "assets/mouth/mouth_07.svg" },
    { id: "mouth_00", label: "なし",       src: "" },
  ],
  hair: [
    { id: "hair_01", label: "hair_01", src: "assets/hair/hair_01.svg" },
    { id: "hair_02", label: "hair_02", src: "assets/hair/hair_02.svg" },
    { id: "hair_03", label: "hair_03", src: "assets/hair/hair_03.svg" },
    { id: "hair_04", label: "hair_04", src: "assets/hair/hair_04.svg" },
    { id: "hair_05", label: "hair_05", src: "assets/hair/hair_05.svg" },
    { id: "hair_06", label: "hair_06", src: "assets/hair/hair_06.svg" },
    { id: "hair_07", label: "hair_07", src: "assets/hair/hair_07.svg" },
    { id: "hair_08", label: "hair_08", src: "assets/hair/hair_08.svg" },
    { id: "hair_09", label: "hair_09", src: "assets/hair/hair_09.svg" },
    { id: "hair_00", label: "なし",     src: "" },
  ],
}

// レイヤー描画順
const LAYER_ORDER = ["face", "nose", "mouth", "eyes", "eyebrows", "hair"]

// =====================
// State
// =====================
const state = {
  currentCat: "hair",
  lineColor: "#000000",
  selected: {
    face:      0,
    eyes:      0,
    eyebrows:  0,
    nose:      0,
    mouth:     0,
    hair:      0,
  },
}

// =====================
// DOM
// =====================
const canvas   = document.getElementById("preview")
const ctx      = canvas.getContext("2d")
const partGrid = document.getElementById("partGrid")
const tabs     = [...document.querySelectorAll(".chip")]
const btnDone  = document.getElementById("btnDone")
const toast    = document.getElementById("toast")
const partScroll = document.querySelector(".part-scroll")
const colorPanel = document.getElementById("colorPanel")
const paletteDots = [...document.querySelectorAll(".palette__dot")]
const loadingOverlay = document.getElementById("loading-overlay")

const headerEl = document.querySelector(".header")

const topScreen   = document.getElementById("topScreen")
const makerScreen = document.getElementById("makerScreen")
const btnStart    = document.getElementById("btnStart")
const btnHome     = document.getElementById("btnHome")

const DISPLAY_SIZE = 500
const RENDER_SCALE = 2
const CANVAS_SIZE = DISPLAY_SIZE * RENDER_SCALE
const CANVAS_PADDING = 48 * RENDER_SCALE
canvas.width  = CANVAS_SIZE
canvas.height = CANVAS_SIZE

// =====================
// Loading overlay
// =====================
function setLoading(isLoading) {
  if (!loadingOverlay) return
  loadingOverlay.classList.toggle("hidden", !isLoading)
}

// =====================
// 画像読み込みキャッシュ
// =====================
const imgCache = {}
function loadImage(src) {
  if (!src) return Promise.resolve(null)
  if (imgCache[src]) return Promise.resolve(imgCache[src])
  return new Promise((resolve) => {
    const img = new Image()
    img.onload  = () => { imgCache[src] = img; resolve(img) }
    img.onerror = () => resolve(null)
    img.src = src
  })
}

// =====================
// Canvas 描画
// =====================
async function renderCanvas() {
  const token = ++renderToken
  setLoading(true)
  await new Promise(requestAnimationFrame)

  try {
    ctx.fillStyle = "#FFFFFF"
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE)
    for (const cat of LAYER_ORDER) {
      if (token !== renderToken) return
      const idx  = state.selected[cat]
      const part = PARTS[cat]?.[idx]
      if (!part || !part.src) continue
      const img = await loadImage(part.src)
      if (token !== renderToken) return
      if (img) ctx.drawImage(img, CANVAS_PADDING, CANVAS_PADDING, CANVAS_SIZE - CANVAS_PADDING * 2, CANVAS_SIZE - CANVAS_PADDING * 2)
    }
    if (token !== renderToken) return
    replaceBlackWithColor(ctx, CANVAS_SIZE, CANVAS_SIZE, state.lineColor)
  } finally {
    if (token === renderToken) setLoading(false)
  }
}
let renderToken = 0

function hexToRgb(hex) {
  const h = hex.replace("#", "").trim()
  const n = parseInt(h, 16)
  return {
    r: (n >> 16) & 255,
    g: (n >> 8) & 255,
    b: n & 255,
  }
}

function replaceBlackWithColor(ctx, w, h, hexColor) {
  const { r: tr, g: tg, b: tb } = hexToRgb(hexColor)
  const img = ctx.getImageData(0, 0, w, h)
  const d = img.data
  const TH_LUM = 170

  for (let i = 0; i < d.length; i += 4) {
    const r = d[i]
    const g = d[i + 1]
    const b = d[i + 2]
    const a = d[i + 3]
    if (a === 0) continue
    if (r > 240 && g > 240 && b > 240) continue
    const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b
    if (lum < TH_LUM) {
      d[i]     = tr
      d[i + 1] = tg
      d[i + 2] = tb
      d[i + 3] = a
    }
  }
  ctx.putImageData(img, 0, 0)
}

// =====================
// グリッド描画
// =====================
function renderGrid() {
  const cat   = state.currentCat
  if (cat === "color") {
    if (partScroll) partScroll.style.display = "none"
    if (colorPanel) colorPanel.hidden = false
    return
  }
  if (partScroll) partScroll.style.display = ""
  if (colorPanel) colorPanel.hidden = true
  const parts = PARTS[cat] ?? []
  partGrid.innerHTML = ""
  parts.forEach((part, idx) => {
    const thumb = document.createElement("div")
    thumb.className = "part-thumb" + (idx === state.selected[cat] ? " is-selected" : "")
    if (part.src) {
      const img = document.createElement("img")
      img.src = part.src
      img.alt = part.label
      thumb.appendChild(img)
    }
    if (!part.src) {
      const label = document.createElement("span")
      label.className = "part-thumb__label"
      label.textContent = "なし"
      thumb.appendChild(label)
    }

    const check = document.createElement("div")
    check.className = "part-thumb__check"
    thumb.appendChild(check)
    thumb.addEventListener("click", () => {
      state.selected[cat] = idx
      renderGrid()
      renderCanvas()
    })
    partGrid.appendChild(thumb)
  })
}

// =====================
// タブ切り替え
// =====================
tabs.forEach(tab => {
  tab.addEventListener("click", () => {
    state.currentCat = tab.dataset.cat
    tabs.forEach(t => t.classList.toggle("is-active", t === tab))
    renderGrid()
  })
})

// =====================
// カラーパレット
// =====================
paletteDots.forEach(dot => {
  dot.addEventListener("click", () => {
    state.lineColor = dot.dataset.color
    paletteDots.forEach(d => d.classList.toggle("is-selected", d === dot))
    renderCanvas()
  })
})

// =====================
// 共有ボタン
// =====================
function pad2(n) { return String(n).padStart(2, "0") }
function makeFileName() {
  const d = new Date()
  const yy = String(d.getFullYear()).slice(-2)
  const mm = pad2(d.getMonth() + 1)
  const dd = pad2(d.getDate())
  return `nm_${yy}${mm}${dd}.png`
}

btnDone.addEventListener("click", async () => {
  await renderCanvas()

  const out = document.createElement("canvas")
  out.width = DISPLAY_SIZE
  out.height = DISPLAY_SIZE
  const octx = out.getContext("2d")

  octx.fillStyle = "#FFFFFF"
  octx.fillRect(0, 0, DISPLAY_SIZE, DISPLAY_SIZE)
  octx.drawImage(canvas, 0, 0, DISPLAY_SIZE, DISPLAY_SIZE)

  out.toBlob(async (blob) => {
    if (!blob) return
    const fileName = makeFileName()

    try {
      const file = new File([blob], fileName, { type: "image/png" })
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: "似顔絵メーカーで作りました！",
          text: "似顔絵メーカーで作りました！",
          url: "https://nigaoe-maker.vercel.app/",
        })
        return
      }
    } catch (e) {
      return
    }

    const url = URL.createObjectURL(blob)
    const a   = document.createElement("a")
    a.href     = url
    a.download = fileName
    document.body.appendChild(a)
    a.click()
    a.remove()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }, "image/png")
})

// =====================
// チュートリアルダイアログ
// =====================
const tutorialDialog = document.getElementById("tutorialDialog")
const btnDialogOk    = document.getElementById("btnDialogOk")

if (btnDialogOk) {
  btnDialogOk.addEventListener("click", () => {
    tutorialDialog.classList.add("hidden")
  })
}

// =====================
// トースト
// =====================
function showToast(text) {
  toast.textContent = text
  toast.hidden = false
  toast.style.bottom = "24px"
  setTimeout(() => {
    toast.style.bottom = "-52px"
    setTimeout(() => (toast.hidden = true), 250)
  }, 1600)
}

// =====================
// TOP -> Maker
// =====================
const SCREEN_TRANSITION_MS = 360

function showScreen(el) {
  if (!el) return
  el.style.display = ""
  el.classList.remove("is-hidden")
  el.classList.add("is-visible")
}
function hideScreen(el) {
  if (!el) return
  el.classList.remove("is-visible")
  el.classList.add("is-hidden")
  window.setTimeout(() => {
    if (el.classList.contains("is-hidden")) {
      el.style.display = "none"
    }
  }, SCREEN_TRANSITION_MS)
}

if (btnStart) {
  btnStart.addEventListener("click", () => {
    hideScreen(topScreen)
    showScreen(makerScreen)
    if (headerEl) headerEl.classList.remove("is-hidden")
    // チュートリアルダイアログを表示
    if (tutorialDialog) tutorialDialog.classList.remove("hidden")
  })
}

if (btnHome) {
  btnHome.addEventListener("click", () => {
    hideScreen(makerScreen)
    showScreen(topScreen)
    if (headerEl) headerEl.classList.add("is-hidden")
  })
}

// =====================
// 起動
// =====================
if (headerEl) headerEl.classList.add("is-hidden")
hideScreen(makerScreen)
showScreen(topScreen)
renderGrid()
renderCanvas()