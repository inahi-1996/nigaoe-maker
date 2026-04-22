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

const LAYER_ORDER = ["face", "nose", "mouth", "eyes", "eyebrows", "hair"]

// =====================
// State
// =====================
const state = {
  currentCat: "eyes",
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

const CANVAS_SIZE = 500
const CANVAS_PADDING = 48
canvas.width  = CANVAS_SIZE
canvas.height = CANVAS_SIZE

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
  ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE)
  for (const cat of LAYER_ORDER) {
    const idx  = state.selected[cat]
    const part = PARTS[cat]?.[idx]
    if (!part || !part.src) continue
    const img = await loadImage(part.src)
    if (img) ctx.drawImage(img, CANVAS_PADDING, CANVAS_PADDING, CANVAS_SIZE - CANVAS_PADDING * 2, CANVAS_SIZE - CANVAS_PADDING * 2)
  }
}

// =====================
// グリッド描画
// =====================
function renderGrid() {
  const cat   = state.currentCat
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
// 完成ボタン（PNG保存）
// =====================
btnDone.addEventListener("click", async () => {
  await renderCanvas()
  canvas.toBlob(blob => {
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
// ローディングオーバーレイを非表示にする
// =====================
window.addEventListener('load', () => {
  const overlay = document.getElementById('loading-overlay')
  if (!overlay) return
  overlay.classList.add('hidden')
  overlay.addEventListener('transitionend', () => {
    overlay.remove()
  })
})

// =====================
// 起動
// =====================
renderGrid()
renderCanvas()