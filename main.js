"use strict"

// =====================
// パーツ定義
// 顔タイプを増やす場合は face 配列に追加するだけ
// タブに出す場合は index.html の .tabs にボタンを追加
// =====================
const PARTS = {
  face: [
    { id: "face_01", label: "卵型", src: "assets/face/face_01.svg" },
    // 顔タイプが増えたらここに追加
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

// レイヤー描画順（face が常に最下層）
const LAYER_ORDER = ["face", "nose", "mouth", "eyes", "eyebrows", "hair"]

// =====================
// State
// =====================
const state = {
  currentCat: "eyes",
  lineColor: "#2FAF5B",
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

// できるだけジャギを減らすため、内部は高解像度で描画してから縮小表示する
const DISPLAY_SIZE = 500
const RENDER_SCALE = 2
const CANVAS_SIZE = DISPLAY_SIZE * RENDER_SCALE
const CANVAS_PADDING = 48 * RENDER_SCALE  // イラスト描画の余白（拡大に追従）
canvas.width  = CANVAS_SIZE
canvas.height = CANVAS_SIZE

// =====================
// Loading overlay（WithMeと同じ）
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
  // loading表示を先に反映
  await new Promise(requestAnimationFrame)

  try {
    // 書き出しPNGの背景が透過にならないよう、毎回白で塗りつぶす
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
    // 黒部分のみ、ユーザー選択カラーに変換（白はそのまま）
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

  // アンチエイリアスでできるグレーも含めて「暗い色」を置換する（白はそのまま）
  // 置換しすぎる場合は小さく（例: 140）、置換されない場合は大きく（例: 190）
  const TH_LUM = 170

  for (let i = 0; i < d.length; i += 4) {
    const r = d[i]
    const g = d[i + 1]
    const b = d[i + 2]
    const a = d[i + 3]
    if (a === 0) continue

    // 白はそのまま（要件）
    if (r > 240 && g > 240 && b > 240) continue

    // 見た目の明るさ（相対輝度）で判定
    const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b

    // 暗いピクセルだけ置換（αは保持）
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
    // 「なし」ラベル表示
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
// WithMeの背景色パレットと同じUI・同じ色
// =====================
paletteDots.forEach(dot => {
  dot.addEventListener("click", () => {
    state.lineColor = dot.dataset.color
    paletteDots.forEach(d => d.classList.toggle("is-selected", d === dot))
    renderCanvas()
  })
})

// =====================
// 完成ボタン（PNG保存）
// =====================
btnDone.addEventListener("click", async () => {
  await renderCanvas()

  // 高解像度キャンバスを、書き出し用サイズ（DISPLAY_SIZE）に縮小して保存
  const out = document.createElement("canvas")
  out.width = DISPLAY_SIZE
  out.height = DISPLAY_SIZE
  const octx = out.getContext("2d")

  // 背景白
  octx.fillStyle = "#FFFFFF"
  octx.fillRect(0, 0, DISPLAY_SIZE, DISPLAY_SIZE)

  // 高解像度→縮小描画
  octx.drawImage(canvas, 0, 0, DISPLAY_SIZE, DISPLAY_SIZE)

  out.toBlob(blob => {
    if (!blob) return
    const url = URL.createObjectURL(blob)
    const a   = document.createElement("a")
    a.href     = url
    a.download = "my-avatar.png"
    document.body.appendChild(a)
    a.click()
    a.remove()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
    showToast("画像を保存しました")
  }, "image/png")
})

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
// 起動
// =====================
renderGrid()
renderCanvas()