import React, { useState, useRef, useEffect, useMemo } from 'react'
import ReactDOM from 'react-dom/client'

/* ── SVG icon components ── */
const Icon = {
  King: ({ s = 28, c = '#a78bfa' }) => (
    <svg width={s} height={s} viewBox="0 0 32 32" fill="none" stroke={c} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <line x1="16" y1="2" x2="16" y2="9"/>
      <line x1="13" y1="5.5" x2="19" y2="5.5"/>
      <path d="M10 12 h12 l2 14 H8 Z"/>
      <line x1="7" y1="26" x2="25" y2="26"/>
      <line x1="9" y1="18" x2="23" y2="18"/>
    </svg>
  ),
  Upload: ({ s = 20, c = '#94a3b8' }) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
      <polyline points="17 8 12 3 7 8"/>
      <line x1="12" y1="3" x2="12" y2="15"/>
    </svg>
  ),
  File: ({ s = 20, c = '#94a3b8' }) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="16" y1="13" x2="8" y2="13"/>
      <line x1="16" y1="17" x2="8" y2="17"/>
      <polyline points="10 9 9 9 8 9"/>
    </svg>
  ),
  Sliders: ({ s = 18, c = '#94a3b8' }) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round">
      <line x1="4" y1="6" x2="20" y2="6"/><circle cx="8" cy="6" r="2" fill={c} stroke="none"/>
      <line x1="4" y1="12" x2="20" y2="12"/><circle cx="16" cy="12" r="2" fill={c} stroke="none"/>
      <line x1="4" y1="18" x2="20" y2="18"/><circle cx="10" cy="18" r="2" fill={c} stroke="none"/>
    </svg>
  ),
  Sparkle: ({ s = 18, c = '#f59e0b' }) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/>
    </svg>
  ),
  Check: ({ s = 16, c = '#10b981' }) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  ),
  X: ({ s = 16, c = '#ef4444' }) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.5" strokeLinecap="round">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  ),
  Book: ({ s = 20, c = '#fff' }) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
    </svg>
  ),
  Palette: ({ s = 18, c = '#94a3b8' }) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="13.5" cy="6.5" r=".5" fill={c} stroke="none"/>
      <circle cx="17.5" cy="10.5" r=".5" fill={c} stroke="none"/>
      <circle cx="8.5" cy="7.5" r=".5" fill={c} stroke="none"/>
      <circle cx="6.5" cy="12.5" r=".5" fill={c} stroke="none"/>
      <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/>
    </svg>
  ),
}

/* ── starting position for the live preview ── */
const STARTING_BOARD = [
  ['♜','♞','♝','♛','♚','♝','♞','♜'],
  ['♟','♟','♟','♟','♟','♟','♟','♟'],
  ['','','','','','','',''],
  ['','','','','','','',''],
  ['','','','','','','',''],
  ['','','','','','','',''],
  ['♙','♙','♙','♙','♙','♙','♙','♙'],
  ['♖','♘','♗','♕','♔','♗','♘','♖'],
]

/* ── FEN parsing (mirrors FenBookController.php so the preview matches the real PDF) ── */
const FEN_SYMBOLS = {
  K:'♔', Q:'♕', R:'♖', B:'♗', N:'♘', P:'♙',
  k:'♚', q:'♛', r:'♜', b:'♝', n:'♞', p:'♟',
}

function isValidFen(fen) {
  const placement = fen.trim().split(' ')[0]
  return (placement.match(/\//g) || []).length === 7
}

function parseFens(text) {
  if (!text) return []
  const pgnMatches = [...text.matchAll(/\[FEN\s+"([^"]+)"\]/gi)].map(m => m[1])
  if (pgnMatches.length) return pgnMatches.filter(isValidFen)
  const fens = []
  for (let line of text.split(/\r?\n/)) {
    line = line.trim()
    if (!line || line.startsWith('#')) continue
    if (isValidFen(line)) fens.push(line)
  }
  return fens
}

function fenToBoard(fen) {
  const ranks = fen.trim().split(' ')[0].split('/')
  const board = []
  for (let r = 0; r < 8; r++) {
    const cells = []
    for (const ch of (ranks[r] || '8')) {
      if (/\d/.test(ch)) {
        for (let i = 0; i < parseInt(ch, 10); i++) cells.push('')
      } else {
        cells.push(FEN_SYMBOLS[ch] || '')
      }
    }
    while (cells.length < 8) cells.push('')
    board.push(cells.slice(0, 8))
  }
  return board
}

function sideToMove(fen) {
  const parts = fen.trim().split(' ')
  return (parts[1] || 'w') === 'b' ? 'b' : 'w'
}

/* ── board color presets ── */
const PRESETS = [
  { name: 'Classic Blue',  dark: '#6b8bc3', light: '#ffffff' },
  { name: 'Chess.com',     dark: '#779556', light: '#ebecd0' },
  { name: 'Lichess Brown', dark: '#b58863', light: '#f0d9b5' },
  { name: 'Purple',        dark: '#7c3aed', light: '#f3f0ff' },
  { name: 'Navy',          dark: '#1d4ed8', light: '#dbeafe' },
  { name: 'Slate',         dark: '#475569', light: '#f1f5f9' },
]

/* ── mini 2×2 board swatch ── */
function MiniBoard({ dark, light, selected, onClick, name }) {
  return (
    <div title={name} onClick={onClick} style={{
      cursor: 'pointer',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', gap: 4,
    }}>
      <div style={{
        borderRadius: 6, overflow: 'hidden',
        border: `2px solid ${selected ? T.accent : 'rgba(255,255,255,0.1)'}`,
        boxShadow: selected ? `0 0 10px ${T.accent}60` : 'none',
        transition: 'all .15s',
        transform: selected ? 'scale(1.08)' : 'scale(1)',
      }}>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', width:38, height:38 }}>
          <div style={{ background: dark }}/>
          <div style={{ background: light }}/>
          <div style={{ background: light }}/>
          <div style={{ background: dark }}/>
        </div>
      </div>
      <span style={{ fontSize:9, color: selected ? T.violet : T.subtle, fontWeight: selected ? 700 : 400, textAlign:'center', lineHeight:1.2 }}>{name}</span>
    </div>
  )
}

/* ── live board preview ── */
function BoardPreview({ dark, light }) {
  const sq = 21
  return (
    <div style={{ flexShrink: 0 }}>
      <div style={{ fontSize:10, fontWeight:600, color:T.subtle, textTransform:'uppercase', letterSpacing:'.06em', marginBottom:6 }}>Preview</div>
      <div style={{
        display: 'inline-block',
        border: '2px solid #444',
        borderRadius: 5,
        overflow: 'hidden',
        boxShadow: '0 4px 20px rgba(0,0,0,0.6)',
        transition: 'box-shadow .2s',
      }}>
        {STARTING_BOARD.map((row, r) => (
          <div key={r} style={{ display:'flex' }}>
            {row.map((piece, c) => (
              <div key={c} style={{
                width: sq, height: sq,
                background: (r + c) % 2 !== 0 ? dark : light,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: Math.round(sq * 0.78),
                lineHeight: 1,
                color: '#111',
                userSelect: 'none',
                transition: 'background .25s',
              }}>
                {piece}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── live page-background preview (header/footer stay white) ── */
function PagePreview({ bg, hfBg }) {
  return (
    <div style={{ flexShrink: 0 }}>
      <div style={{ fontSize:10, fontWeight:600, color:T.subtle, textTransform:'uppercase', letterSpacing:'.06em', marginBottom:6 }}>Preview</div>
      <div style={{
        width: 70, height: 96,
        border: '2px solid #444', borderRadius: 5,
        overflow: 'hidden',
        boxShadow: '0 4px 20px rgba(0,0,0,0.6)',
        display: 'flex', flexDirection: 'column',
        transition: 'background .25s',
      }}>
        <div style={{ height: 12, background: hfBg, borderBottom: '1.5px solid #111', flexShrink: 0, transition: 'background .25s' }}/>
        <div style={{ flex: 1, background: bg, transition: 'background .25s' }}/>
        <div style={{ height: 9, background: hfBg, borderTop: '1.5px solid #111', flexShrink: 0, transition: 'background .25s' }}/>
      </div>
    </div>
  )
}

/* ── one small board inside the book preview ── */
function MiniChessBoard({ pos, dark, light, cellSize, answerCount, fontColor = '#111111' }) {
  const sideText = pos.side === 'b' ? 'Black' : 'White'
  return (
    <div style={{ flex: 1, border: '1px solid #333', borderRadius: 2, overflow: 'hidden', background: '#fff' }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        fontSize: Math.max(5, cellSize * 0.34), fontWeight: 700,
        padding: '1px 3px', borderBottom: '1px solid #ccc', color: fontColor,
      }}>
        <span>No.{pos.number}</span><span>{sideText}</span>
      </div>
      <div>
        {pos.board.map((row, r) => (
          <div key={r} style={{ display: 'flex' }}>
            {row.map((piece, c) => (
              <div key={c} style={{
                width: cellSize, height: cellSize,
                background: (r + c) % 2 !== 0 ? dark : light,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: cellSize * 0.72, lineHeight: 1, color: fontColor,
              }}>{piece}</div>
            ))}
          </div>
        ))}
      </div>
      {answerCount > 0 && (
        <div style={{ display: 'flex', gap: 2, padding: '2px 3px' }}>
          {Array.from({ length: answerCount }).map((_, i) => (
            <div key={i} style={{ flex: 1, borderBottom: '1px solid #888', height: Math.max(2, cellSize * 0.18) }}/>
          ))}
        </div>
      )}
    </div>
  )
}

/* ── realistic, paginated preview of the actual book that will be generated ── */
function resolveHeaderFooter(number, rangeRules, defaultHeader, defaultFooter) {
  for (const r of rangeRules) {
    const from = parseInt(r.from, 10), to = parseInt(r.to, 10)
    if (!isNaN(from) && !isNaN(to) && number >= from && number <= to) {
      return [r.header ? r.header : defaultHeader, r.footer ? r.footer : defaultFooter]
    }
  }
  return [defaultHeader, defaultFooter]
}

function BookPreview({ fens, perPage, header, footer, answerCount, darkColor, lightColor, bgColor, hfBgColor, fontColor = '#111111', pageSize, rangeRules = [] }) {
  const pp   = parseInt(perPage, 10) || 4
  const cols = pp >= 4 ? 2 : 1
  const ac   = Math.max(0, parseInt(answerCount, 10) || 0)
  const psScale = pageSize === 'A5' ? 0.705 : 1

  const pages = useMemo(() => {
    const positions = fens.map((fen, i) => ({ number: i + 1, board: fenToBoard(fen), side: sideToMove(fen) }))
    const out = []
    let current = []
    let currentKey = null
    for (const pos of positions) {
      const [h, f] = resolveHeaderFooter(pos.number, rangeRules, header, footer)
      const key = h + '|' + f
      if (current.length && (key !== currentKey || current.length >= pp)) {
        out.push(current)
        current = []
      }
      if (current.length === 0) currentKey = key
      current.push(pos)
    }
    if (current.length) out.push(current)
    return out
  }, [fens, pp, rangeRules, header, footer])

  const [pageIdx, setPageIdx] = useState(0)
  useEffect(() => { setPageIdx(0) }, [fens, perPage])

  const containerRef = useRef(null)
  const [containerW, setContainerW] = useState(280)
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const ro = new ResizeObserver(entries => {
      const w = entries[0]?.contentRect?.width
      if (w) setContainerW(w)
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const totalPages = pages.length
  const safeIdx = Math.min(pageIdx, Math.max(0, totalPages - 1))
  const current = pages[safeIdx] || []
  const rows = []
  for (let i = 0; i < current.length; i += cols) rows.push(current.slice(i, i + cols))
  const [pageHeader, pageFooter] = resolveHeaderFooter(current[0]?.number ?? 1, rangeRules, header, footer)

  const sheetW  = Math.round(containerW * psScale)
  const sheetH  = Math.round(sheetW * 1123 / 744)
  const padX    = Math.round(14 * psScale)
  const colGap  = Math.round(8 * psScale)
  // 1 cm bands — scale with sheet width the same way DomPDF does (38 px per cm at 96 dpi, A4 content = 744 px)
  const bandH1  = Math.max(5, Math.round(38 * sheetW / 744))
  const bandH2  = Math.max(5, Math.round(38 * sheetW / 744))
  const innerW  = sheetW - padX * 2
  const colW    = cols === 2 ? (innerW - colGap) / 2 : innerW
  const cellSizeW = colW / 8

  // Boards per page also determines row count (e.g. 8/page = 4 rows of 2),
  // so cellSize must also respect available height, not just column width —
  // otherwise more-rows-per-page settings (8, 2) overflow the fixed sheet height.
  const maxRows  = Math.max(1, Math.ceil(pp / cols))
  const innerH   = sheetH - bandH1 - bandH2 - 16
  const rowK     = 8.5 + (ac > 0 ? 0.2 : 0)
  const rowC     = 6 + (ac > 0 ? 5 : 0)
  const cellSizeH = (innerH - maxRows * rowC - (maxRows - 1) * colGap) / (maxRows * rowK)

  const cellSize = Math.max(3, Math.floor(Math.min(cellSizeW, cellSizeH) * 0.98))

  return (
    <div ref={containerRef}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Icon.Book s={14} c={T.violet}/>
          <span style={{ fontSize: 11, fontWeight: 700, color: '#e2e8f0', letterSpacing: '.01em' }}>Live Book Preview</span>
        </div>
        {totalPages > 1 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              onClick={() => setPageIdx(p => Math.max(0, p - 1))}
              disabled={safeIdx === 0}
              style={{
                width: 22, height: 22, borderRadius: 6, border: '1px solid rgba(255,255,255,0.1)',
                background: 'rgba(10,14,30,0.6)', color: safeIdx === 0 ? T.subtle : T.violet,
                cursor: safeIdx === 0 ? 'default' : 'pointer', fontSize: 13, lineHeight: 1,
              }}
            >‹</button>
            <span style={{ fontSize: 11, color: T.muted }}>{safeIdx + 1} / {totalPages}</span>
            <button
              onClick={() => setPageIdx(p => Math.min(totalPages - 1, p + 1))}
              disabled={safeIdx === totalPages - 1}
              style={{
                width: 22, height: 22, borderRadius: 6, border: '1px solid rgba(255,255,255,0.1)',
                background: 'rgba(10,14,30,0.6)', color: safeIdx === totalPages - 1 ? T.subtle : T.violet,
                cursor: safeIdx === totalPages - 1 ? 'default' : 'pointer', fontSize: 13, lineHeight: 1,
              }}
            >›</button>
          </div>
        )}
      </div>

      {totalPages === 0 ? (
        <div style={{
          width: sheetW, height: sheetH, margin: '0 auto',
          border: '1px dashed rgba(255,255,255,0.15)', borderRadius: 6,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          textAlign: 'center', padding: 20,
        }}>
          <span style={{ fontSize: 12, color: T.subtle }}>Upload a file to preview the book</span>
        </div>
      ) : (
        <div style={{
          width: sheetW, height: sheetH, margin: '0 auto',
          background: bgColor, border: '2px solid #444', borderRadius: 6,
          boxShadow: '0 4px 24px rgba(0,0,0,0.6)',
          display: 'flex', flexDirection: 'column', overflow: 'hidden',
          transition: 'background .25s',
        }}>
          <div style={{
            height: bandH1, background: hfBgColor, flexShrink: 0,
            borderBottom: pageHeader ? '1px solid #111' : 'none',
            display: 'flex', alignItems: 'center', padding: '0 8px', overflow: 'hidden',
            transition: 'background .25s',
          }}>
            {pageHeader && <span style={{ fontSize: 8, fontWeight: 700, color: fontColor, whiteSpace: 'nowrap' }}>{pageHeader}</span>}
          </div>

          <div style={{ flex: 1, padding: `8px ${padX}px`, display: 'flex', flexDirection: 'column', gap: colGap }}>
            {rows.map((rowItems, ri) => (
              <div key={ri} style={{ display: 'flex', gap: colGap }}>
                {rowItems.map(pos => (
                  <MiniChessBoard key={pos.number} pos={pos} dark={darkColor} light={lightColor} cellSize={cellSize} answerCount={ac} fontColor={fontColor}/>
                ))}
                {rowItems.length < cols && <div style={{ flex: 1 }}/>}
              </div>
            ))}
          </div>

          <div style={{
            height: bandH2, background: hfBgColor, flexShrink: 0,
            borderTop: pageFooter ? '1px solid #111' : 'none',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 8px', overflow: 'hidden',
            transition: 'background .25s',
          }}>
            {pageFooter && <span style={{ fontSize: 7, color: fontColor, whiteSpace: 'nowrap' }}>{pageFooter}</span>}
            {pageFooter && <span style={{ fontSize: 7, color: fontColor }}>{safeIdx + 1}</span>}
          </div>
        </div>
      )}
    </div>
  )
}

/* ── hex color input with swatch ── */
function ColorInput({ label, value, onChange }) {
  return (
    <label style={{ cursor:'pointer', display:'block' }}>
      <div style={{ fontSize:10, fontWeight:600, color:T.subtle, textTransform:'uppercase', letterSpacing:'.06em', marginBottom:5 }}>{label}</div>
      <div style={{
        display:'flex', alignItems:'center', gap:8,
        padding:'8px 10px',
        background:'rgba(10,14,30,0.8)',
        border:'1px solid rgba(255,255,255,0.08)',
        borderRadius:8, cursor:'pointer',
      }}>
        <input
          type="color" value={value}
          onChange={e => onChange(e.target.value)}
          style={{ width:22, height:22, border:'none', background:'none', cursor:'pointer', padding:0, borderRadius:4 }}
        />
        <span style={{ fontSize:12, fontFamily:'monospace', color:T.muted, userSelect:'none' }}>{value}</span>
      </div>
    </label>
  )
}

/* ── inject global CSS once ── */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: 'Inter', system-ui, sans-serif;
    background: #07090f;
    color: #e2e8f0;
    min-height: 100vh;
  }
  input::placeholder { color: #475569; }
  input::-webkit-outer-spin-button,
  input::-webkit-inner-spin-button { -webkit-appearance: none; }

  @keyframes float    { 0%,100%{transform:translateY(0)}  50%{transform:translateY(-8px)} }
  @keyframes fadeUp   { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
  @keyframes pulse    { 0%,100%{opacity:1} 50%{opacity:.6} }
  @keyframes spin     { to{transform:rotate(360deg)} }
  @keyframes shimmer  { 0%{background-position:200% center} 100%{background-position:-200% center} }
  @keyframes glow     { 0%,100%{box-shadow:0 0 20px #7c3aed40} 50%{box-shadow:0 0 40px #7c3aed80} }

  .float     { animation: float 3s ease-in-out infinite; }
  .fade-up   { animation: fadeUp .4s ease both; }
  .spin      { animation: spin .75s linear infinite; }

  /* chess-pattern background tile */
  .chess-bg {
    background-color: #07090f;
    background-image:
      radial-gradient(ellipse at 15% 40%, #1e0a3c55 0%, transparent 55%),
      radial-gradient(ellipse at 85% 20%, #0c1a4055 0%, transparent 50%),
      radial-gradient(ellipse at 60% 80%, #1a0c3055 0%, transparent 45%);
  }
`

function InjectCSS() {
  useEffect(() => {
    const el = document.createElement('style')
    el.textContent = CSS
    document.head.appendChild(el)
    return () => el.remove()
  }, [])
  return null
}

/* ── design tokens ── */
const T = {
  accent:  '#7c3aed',
  accent2: '#6366f1',
  violet:  '#a78bfa',
  gold:    '#f59e0b',
  green:   '#10b981',
  red:     '#ef4444',
  card:    'rgba(14,20,40,0.75)',
  border:  'rgba(124,58,237,0.18)',
  borderHover: 'rgba(124,58,237,0.5)',
  muted:   '#94a3b8',
  subtle:  '#475569',
}

/* ── reusable card ── */
function Card({ children, style, glow = false }) {
  return (
    <div style={{
      background: T.card,
      border: `1px solid ${T.border}`,
      borderRadius: 20,
      padding: 24,
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      boxShadow: glow
        ? `0 0 0 1px ${T.border}, 0 8px 40px rgba(124,58,237,0.2), inset 0 1px 0 rgba(255,255,255,0.05)`
        : `0 4px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.04)`,
      ...style,
    }}>
      {children}
    </div>
  )
}

/* ── section label ── */
function SectionLabel({ icon, children }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:18 }}>
      <div style={{
        width: 30, height: 30, borderRadius: 8,
        background: `linear-gradient(135deg, ${T.accent}30, ${T.accent2}20)`,
        border: `1px solid ${T.accent}40`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>{icon}</div>
      <span style={{ fontSize:13, fontWeight:700, color:'#e2e8f0', letterSpacing:'.01em' }}>{children}</span>
    </div>
  )
}

/* ── text field ── */
function Field({ label, value, onChange, type='text', placeholder='' }) {
  const [focus, setFocus] = useState(false)
  return (
    <div>
      <label style={{ fontSize:11, fontWeight:600, color:T.muted, textTransform:'uppercase', letterSpacing:'.06em', display:'block', marginBottom:6 }}>
        {label}
      </label>
      <input
        type={type} value={value} placeholder={placeholder}
        onChange={e => onChange(e.target.value)}
        onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
        style={{
          width:'100%', padding:'10px 14px',
          background:'rgba(10,14,30,0.8)',
          border:`1px solid ${focus ? T.accent+'80' : 'rgba(255,255,255,0.08)'}`,
          borderRadius:10, color:'#e2e8f0', fontSize:14, outline:'none',
          boxShadow: focus ? `0 0 0 3px ${T.accent}20` : 'none',
          transition: 'border .2s, box-shadow .2s',
        }}
      />
    </div>
  )
}

/* ── per-page selector ── */
function Toggle({ label, value, onChange, options }) {
  return (
    <div>
      <label style={{ fontSize:11, fontWeight:600, color:T.muted, textTransform:'uppercase', letterSpacing:'.06em', display:'block', marginBottom:6 }}>
        {label}
      </label>
      <div style={{ display:'flex', gap:6 }}>
        {options.map(v => (
          <button key={v} onClick={() => onChange(v)} style={{
            flex:1, padding:'10px 0', borderRadius:10, fontSize:14, fontWeight:600,
            border: `1px solid ${value===v ? T.accent : 'rgba(255,255,255,0.08)'}`,
            background: value===v
              ? `linear-gradient(135deg,${T.accent}30,${T.accent2}20)`
              : 'rgba(10,14,30,0.5)',
            color: value===v ? T.violet : T.subtle,
            cursor:'pointer',
            boxShadow: value===v ? `0 0 12px ${T.accent}30` : 'none',
            transition:'all .18s',
          }}>{v}</button>
        ))}
      </div>
    </div>
  )
}
function PageToggle({ value, onChange }) {
  return <Toggle label="Boards per page" value={value} onChange={onChange} options={['1','2','4','8']}/>
}
function PageSizeToggle({ value, onChange }) {
  return <Toggle label="Page size" value={value} onChange={onChange} options={['A4','A5']}/>
}

/* ── per-range header/footer overrides ── */
const miniInputStyle = {
  width: '100%', padding: '8px 10px', fontSize: 12,
  background: 'rgba(10,14,30,0.8)', border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 8, color: '#e2e8f0', outline: 'none',
}
const miniLabelStyle = {
  fontSize: 10, fontWeight: 600, color: T.subtle, textTransform: 'uppercase', letterSpacing: '.05em',
  display: 'block', marginBottom: 5,
}

function RangeRow({ index, rule, onChange, onRemove }) {
  return (
    <div style={{
      background: 'rgba(10,14,30,0.45)',
      border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: 12, padding: 12, marginBottom: 10,
    }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
        <span style={{ fontSize:11, fontWeight:700, color:T.violet }}>Range {index + 1}</span>
        <button onClick={onRemove} title="Remove range" style={{
          width:22, height:22, display:'flex', alignItems:'center', justifyContent:'center',
          background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.25)', borderRadius:6, cursor:'pointer',
        }}><Icon.X s={10} c={T.red}/></button>
      </div>

      <div style={{ display:'flex', alignItems:'flex-end', gap:8, marginBottom:10 }}>
        <div style={{ flex:1 }}>
          <label style={miniLabelStyle}>From #</label>
          <input type="number" min="1" placeholder="1" value={rule.from} style={miniInputStyle}
            onChange={e => onChange({ ...rule, from: e.target.value })}/>
        </div>
        <span style={{ color:T.subtle, paddingBottom:8 }}>–</span>
        <div style={{ flex:1 }}>
          <label style={miniLabelStyle}>To #</label>
          <input type="number" min="1" placeholder="10" value={rule.to} style={miniInputStyle}
            onChange={e => onChange({ ...rule, to: e.target.value })}/>
        </div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
        <div>
          <label style={miniLabelStyle}>Header</label>
          <input type="text" placeholder="e.g. Easy Puzzles" value={rule.header} style={miniInputStyle}
            onChange={e => onChange({ ...rule, header: e.target.value })}/>
        </div>
        <div>
          <label style={miniLabelStyle}>Footer</label>
          <input type="text" placeholder="e.g. Section A" value={rule.footer} style={miniInputStyle}
            onChange={e => onChange({ ...rule, footer: e.target.value })}/>
        </div>
      </div>
    </div>
  )
}

function RangeRulesEditor({ rules, onChange, enabled, onToggle }) {
  const addRule = () => onChange([...rules, { id: Date.now() + Math.random(), from:'', to:'', header:'', footer:'' }])
  const updateRule = (id, next) => onChange(rules.map(r => r.id === id ? next : r))
  const removeRule = id => onChange(rules.filter(r => r.id !== id))
  const disable = () => { onToggle(false); onChange([]) }

  if (!enabled) {
    return (
      <div>
        <button onClick={() => onToggle(true)} style={{
          width:'100%', display:'flex', alignItems:'center', justifyContent:'center', gap:7,
          padding:'10px 0', fontSize:12, fontWeight:600, color:T.violet,
          background:'rgba(124,58,237,0.08)', border:`1px dashed ${T.accent}50`, borderRadius:10, cursor:'pointer',
        }}>
          <Icon.Book s={14} c={T.violet}/> Customize by question number range
        </button>
      </div>
    )
  }

  return (
    <div style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: 16 }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:4 }}>
        <div style={{ display:'flex', alignItems:'center', gap:6 }}>
          <Icon.Book s={14} c={T.violet}/>
          <span style={{ fontSize:11, fontWeight:700, color:'#e2e8f0', letterSpacing:'.01em' }}>Header/Footer by Number Range</span>
        </div>
        <button onClick={disable} style={{
          fontSize:11, fontWeight:600, color:T.subtle, background:'none',
          border:'none', cursor:'pointer', padding:'4px 2px',
        }}>Disable</button>
      </div>

      <div style={{ fontSize:11, color:T.subtle, lineHeight:1.4, marginBottom:12 }}>
        Override the header/footer for specific puzzle number ranges (e.g. puzzles 1–20 vs 21–40). Leave a range's header/footer empty to fall back to the default above.
      </div>

      {rules.map((r, i) => (
        <RangeRow key={r.id} index={i} rule={r} onChange={next => updateRule(r.id, next)} onRemove={() => removeRule(r.id)}/>
      ))}

      <button onClick={addRule} style={{
        width:'100%', fontSize:12, fontWeight:600, color:T.violet,
        background:'rgba(124,58,237,0.1)', border:`1px solid ${T.accent}30`,
        borderRadius:10, padding:'9px 0', cursor:'pointer',
      }}>+ Add range</button>
    </div>
  )
}

/* ── progress bar ── */
const BAR_COLORS = [
  ['#7c3aed','#6366f1'],
  ['#6366f1','#a78bfa'],
  ['#10b981','#34d399'],
]
function ProgressBar({ label, pct, idx=0 }) {
  const [c1,c2] = BAR_COLORS[idx] || BAR_COLORS[0]
  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
        <span style={{ fontSize:12, color:T.muted }}>{label}</span>
        <span style={{ fontSize:12, color: pct>0 ? T.violet : T.subtle, fontWeight:600 }}>{pct}%</span>
      </div>
      <div style={{ height:6, background:'rgba(255,255,255,0.06)', borderRadius:99, overflow:'hidden' }}>
        <div style={{
          height:'100%', width:pct+'%', borderRadius:99,
          background:`linear-gradient(90deg,${c1},${c2})`,
          boxShadow: pct>0 ? `0 0 8px ${c1}80` : 'none',
          transition:'width .45s cubic-bezier(.4,0,.2,1)',
        }}/>
      </div>
    </div>
  )
}

/* ── progress popup ── */
function ProgressModal({ progress }) {
  return (
    <div style={{
      position:'fixed', inset:0, zIndex:1000,
      background:'rgba(5,7,16,0.65)',
      backdropFilter:'blur(4px)', WebkitBackdropFilter:'blur(4px)',
      display:'flex', alignItems:'center', justifyContent:'center',
      padding:20,
    }}>
      <Card glow style={{ width:'100%', maxWidth:380 }}>
        <SectionLabel icon={<Icon.Sparkle s={14} c={T.gold}/>}>
          Generating your book…
        </SectionLabel>
        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
          <ProgressBar label="Creating Boards" pct={progress.boards} idx={0}/>
          <ProgressBar label="Building Pages"  pct={progress.pages}  idx={1}/>
          <ProgressBar label="Generating PDF"  pct={progress.pdf}    idx={2}/>
        </div>
      </Card>
    </div>
  )
}

/* ── drop zone ── */
function DropZone({ file, onFile, inputRef }) {
  const [drag, setDrag] = useState(false)
  const [hover, setHover] = useState(false)
  const active = drag || hover

  return (
    <div
      onClick={() => inputRef.current.click()}
      onDrop={e => { e.preventDefault(); setDrag(false); onFile(e.dataTransfer.files[0]) }}
      onDragOver={e => { e.preventDefault(); setDrag(true) }}
      onDragLeave={() => setDrag(false)}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        border: `2px dashed ${active ? T.accent : file ? T.accent+'60' : 'rgba(255,255,255,0.1)'}`,
        borderRadius: 16,
        padding: '32px 20px',
        textAlign: 'center',
        cursor: 'pointer',
        background: active
          ? `${T.accent}0d`
          : file ? `${T.accent}08` : 'rgba(10,14,30,0.4)',
        transition: 'all .2s',
        boxShadow: active ? `0 0 24px ${T.accent}20, inset 0 0 24px ${T.accent}08` : 'none',
      }}
    >
      <input ref={inputRef} type="file" style={{ display:'none' }}
        onChange={e => onFile(e.target.files[0])} />

      {file ? (
        <>
          <div style={{
            width:52, height:52, borderRadius:14,
            background:`linear-gradient(135deg,${T.accent}40,${T.accent2}30)`,
            border:`1px solid ${T.accent}50`,
            display:'flex', alignItems:'center', justifyContent:'center',
            margin:'0 auto 12px',
          }}>
            <Icon.File s={24} c={T.violet}/>
          </div>
          <div style={{ fontWeight:700, fontSize:14, color:'#e2e8f0', marginBottom:4 }}>{file.name}</div>
          <div style={{ fontSize:12, color:T.subtle }}>{(file.size/1024).toFixed(1)} KB · Click to change</div>
        </>
      ) : (
        <>
          <div style={{
            width:56, height:56, borderRadius:16,
            background:'rgba(124,58,237,0.12)',
            border:'1px solid rgba(124,58,237,0.25)',
            display:'flex', alignItems:'center', justifyContent:'center',
            margin:'0 auto 14px',
            transition:'transform .2s',
            transform: active ? 'scale(1.1)' : 'scale(1)',
          }}>
            <Icon.Upload s={24} c={active ? T.violet : T.subtle}/>
          </div>
          <div style={{ fontWeight:600, fontSize:14, color:'#cbd5e1', marginBottom:4 }}>
            Drop your PGN or FEN file here
          </div>
          <div style={{ fontSize:12, color:T.subtle }}>
            or <span style={{ color:T.violet, fontWeight:600 }}>click to browse</span>
          </div>
        </>
      )}
    </div>
  )
}

/* ── file preview ── */
function FilePreview({ preview }) {
  if (!preview) return null
  const lines = preview.trim().split('\n').filter(Boolean)
  const fens = lines.filter(l => /\[FEN "/i.test(l) || /^[rnbqkpRNBQKP1-8\/]+ [wb]/.test(l))
  const count = fens.length || lines.length

  return (
    <div className="fade-up" style={{
      marginTop:12,
      background:'rgba(8,12,24,0.7)',
      border:'1px solid rgba(255,255,255,0.06)',
      borderRadius:12, padding:14,
      maxHeight:160, overflow:'auto',
    }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:8 }}>
        <span style={{ fontSize:11, fontWeight:700, color:T.muted, textTransform:'uppercase', letterSpacing:'.06em' }}>
          File preview
        </span>
        <span style={{
          fontSize:11, fontWeight:700, padding:'2px 10px', borderRadius:99,
          background:`${T.accent}20`, color:T.violet, border:`1px solid ${T.accent}40`,
        }}>
          {count} position{count!==1?'s':''}
        </span>
      </div>
      {lines.slice(0,20).map((l,i) => (
        <div key={i} style={{ display:'flex', gap:10, marginBottom:3, alignItems:'flex-start' }}>
          <span style={{ fontSize:10, color:T.subtle, width:20, textAlign:'right', flexShrink:0, paddingTop:1 }}>{i+1}</span>
          <span style={{ fontFamily:'monospace', fontSize:11, color: /^\[FEN/i.test(l) ? '#7dd3fc' : T.subtle, lineHeight:1.4, wordBreak:'break-all' }}>{l}</span>
        </div>
      ))}
      {lines.length > 20 && (
        <div style={{ fontSize:11, color:T.subtle, marginTop:4, textAlign:'center' }}>
          + {lines.length - 20} more lines
        </div>
      )}
    </div>
  )
}

/* ── status banner ── */
function StatusBanner({ status }) {
  if (!status) return null
  const ok = status.ok
  return (
    <div className="fade-up" style={{
      display:'flex', alignItems:'center', gap:12,
      padding:'12px 16px', borderRadius:12,
      background: ok ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
      border: `1px solid ${ok ? '#10b98140' : '#ef444440'}`,
    }}>
      <div style={{
        width:28, height:28, borderRadius:8, flexShrink:0,
        background: ok ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)',
        display:'flex', alignItems:'center', justifyContent:'center',
      }}>
        {ok ? <Icon.Check s={16} c="#10b981"/> : <Icon.X s={16} c="#ef4444"/>}
      </div>
      <span style={{ fontSize:13, color: ok ? '#34d399' : '#fca5a5', fontWeight:500 }}>{status.text}</span>
    </div>
  )
}

/* ── main app ── */
function App() {
  const [view, setView]               = useState('intro')
  const [file, setFile]               = useState(null)
  const [preview, setPreview]         = useState('')
  const [header, setHeader]           = useState('')
  const [footer, setFooter]           = useState('')
  const [answerCount, setAnswerCount] = useState('1')
  const [perPage, setPerPage]         = useState('4')
  const [pdfName, setPdfName]         = useState('')
  const [darkColor, setDarkColor]     = useState('#6b8bc3')
  const [lightColor, setLightColor]   = useState('#ffffff')
  const [bgColor, setBgColor]         = useState('#ffffff')
  const [hfBgColor, setHfBgColor]     = useState('#ffffff')
  const [fontColor, setFontColor]     = useState('#111111')
  const [pageSize, setPageSize]       = useState('A4')
  const [rangeRules, setRangeRules]   = useState([])
  const [rangeEnabled, setRangeEnabled] = useState(false)
  const [progress, setProgress]       = useState({ boards:0, pages:0, pdf:0 })
  const [status, setStatus]           = useState(null)
  const [busy, setBusy]               = useState(false)
  const inputRef = useRef()
  const fens = useMemo(() => parseFens(preview), [preview])

  const loadFile = f => {
    if (!f) return
    setFile(f); setStatus(null); setProgress({ boards:0, pages:0, pdf:0 })
    setPdfName(f.name.replace(/\.[^.]+$/, '') + '_book')
    const r = new FileReader()
    r.onload = e => setPreview(e.target.result)
    r.readAsText(f)
  }

  const handleCreate = async () => {
    if (!file || busy) return
    setBusy(true); setStatus(null); setProgress({ boards:0, pages:0, pdf:0 })

    const anim = (key, max, ms) => {
      let v = 0
      const id = setInterval(() => {
        v = Math.min(v + Math.random()*12+2, max)
        setProgress(p => ({ ...p, [key]: Math.round(v) }))
        if (v >= max) clearInterval(id)
      }, ms)
      return id
    }
    const t1 = anim('boards', 88, 80)
    const t2 = setTimeout(() => anim('pages', 88, 110), 700)

    const form = new FormData()
    form.append('file', file)
    form.append('header', header)
    form.append('footer', footer)
    form.append('answer_count', answerCount || '1')
    form.append('per_page', perPage || '4')
    form.append('dark_color', darkColor)
    form.append('light_color', lightColor)
    form.append('bg_color', bgColor)
    form.append('hf_bg_color', hfBgColor)
    form.append('font_color', fontColor)
    form.append('page_size', pageSize)
    const validRangeRules = rangeRules
      .map(r => ({ from: parseInt(r.from, 10), to: parseInt(r.to, 10), header: r.header || '', footer: r.footer || '' }))
      .filter(r => !isNaN(r.from) && !isNaN(r.to) && r.from > 0 && r.to >= r.from)
    form.append('range_rules', JSON.stringify(validRangeRules))

    try {
      const res = await fetch('/api/fen/book', { method:'POST', body:form })
      clearInterval(t1); clearTimeout(t2)
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error ?? `Server error ${res.status}`)
      }
      setProgress({ boards:100, pages:100, pdf:100 })
      const blob = await res.blob()
      const url  = URL.createObjectURL(blob)
      const a    = document.createElement('a')
      a.href = url
      a.download = (pdfName.trim() || file.name.replace(/\.[^.]+$/, '') + '_book') + '.pdf'
      a.click(); URL.revokeObjectURL(url)
      const lines = preview.trim().split('\n').filter(Boolean)
      const count = lines.filter(l => /\[FEN "/i.test(l)).length || lines.length
      setStatus({ ok:true, text:`Book created with ${count} chess position${count!==1?'s':''} — PDF downloaded.` })
    } catch(err) {
      clearInterval(t1); clearTimeout(t2)
      setProgress({ boards:0, pages:0, pdf:0 })
      setStatus({ ok:false, text:err.message })
    } finally {
      setBusy(false)
    }
  }

  const canGo = !!file && !busy

  return (
    <>
      <InjectCSS/>
      {busy && <ProgressModal progress={progress}/>}
      <div className="chess-bg" style={{ minHeight:'100vh', padding:'48px 20px 60px', zoom:1.15 }}>

        {/* ── Hero header ── */}
        <div style={{ textAlign:'center', marginBottom:48 }}>

          {/* Logo badge */}
          <div style={{ display:'inline-flex', alignItems:'center', gap:10, marginBottom:20 }}>
            <div className="float" style={{
              width:64, height:64, borderRadius:18,
              background:`linear-gradient(135deg, ${T.accent}, ${T.accent2})`,
              display:'flex', alignItems:'center', justifyContent:'center',
              boxShadow:`0 8px 32px ${T.accent}50, 0 0 0 1px ${T.accent}40`,
            }}>
              <Icon.King s={34} c="#fff"/>
            </div>
          </div>

          {/* Title */}
          <h1 style={{
            fontSize: 'clamp(28px, 5vw, 48px)',
            fontWeight: 900,
            letterSpacing: '-.03em',
            lineHeight: 1.1,
            marginBottom: 12,
          }}>
            <span style={{ color:'#e2e8f0' }}>Chess Book</span>{' '}
            <span style={{
              background:`linear-gradient(135deg, ${T.violet} 0%, #c084fc 50%, ${T.gold} 100%)`,
              backgroundSize: '200% auto',
              WebkitBackgroundClip:'text',
              WebkitTextFillColor:'transparent',
              animation:'shimmer 4s linear infinite',
            }}>Creator</span>
          </h1>

          <p style={{ color:T.muted, fontSize:15, maxWidth:460, margin:'0 auto' }}>
            Upload a PGN or FEN file and export a beautifully formatted chess puzzle PDF book
          </p>
        </div>

        {view === 'intro' ? (
        /* ── Intro screen: How it works + Get Started ── */
        <div style={{ maxWidth: 480, margin: '0 auto', display:'flex', flexDirection:'column', gap:20 }}>
          <Card>
            <SectionLabel icon={<Icon.Book s={14} c={T.violet}/>}>
              How it works
            </SectionLabel>
            <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
              {[
                { n:'01', t:'Upload', d:'A PGN file with [FEN "..."] tags, or a plain text file with one FEN per line' },
                { n:'02', t:'Customize', d:'Set header, footer text, number of answer lines, and boards per page' },
                { n:'03', t:'Create Book', d:'Click below to generate and download your formatted PDF book' },
              ].map(({ n, t, d }) => (
                <div key={n} style={{ display:'flex', gap:12, alignItems:'flex-start' }}>
                  <div style={{
                    flexShrink:0, width:28, height:28, borderRadius:8,
                    background:`linear-gradient(135deg,${T.accent}25,${T.accent2}15)`,
                    border:`1px solid ${T.accent}35`,
                    display:'flex', alignItems:'center', justifyContent:'center',
                    fontSize:10, fontWeight:800, color:T.violet,
                  }}>{n}</div>
                  <div>
                    <div style={{ fontSize:13, fontWeight:700, color:'#cbd5e1', marginBottom:2 }}>{t}</div>
                    <div style={{ fontSize:12, color:T.subtle, lineHeight:1.5 }}>{d}</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <button
            onClick={() => setView('main')}
            style={{
              width:'100%', padding:'16px 24px',
              borderRadius:14, border:'none',
              background: `linear-gradient(135deg, ${T.accent}, ${T.accent2})`,
              color:'#fff', fontSize:15, fontWeight:700,
              cursor:'pointer',
              display:'flex', alignItems:'center', justifyContent:'center', gap:10,
              boxShadow: `0 4px 24px ${T.accent}50, 0 0 0 1px ${T.accent}40`,
              transition:'all .25s',
              animation:'glow 2.5s ease-in-out infinite',
            }}
          >
            Get Started →
          </button>
        </div>
        ) : (
        <>
        <button
          onClick={() => setView('intro')}
          style={{
            display:'flex', alignItems:'center', gap:6,
            background:'none', border:'none', cursor:'pointer',
            color:T.subtle, fontSize:13, fontWeight:600,
            margin:'0 auto 16px', maxWidth:960, width:'100%',
          }}
        >
          ← Back
        </button>

        {/* ── Main 2-col grid ── */}
        <div style={{
          maxWidth: 960,
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 20,
          alignItems: 'start',
        }}>

          {/* ══ LEFT column ══ */}
          <div style={{ display:'flex', flexDirection:'column', gap:16 }}>

            {/* Upload card */}
            <Card>
              <SectionLabel icon={<Icon.Upload s={14} c={T.violet}/>}>
                Upload File
              </SectionLabel>
              <DropZone file={file} onFile={loadFile} inputRef={inputRef}/>
              <FilePreview preview={preview}/>
            </Card>

            {/* Customize card */}
            <Card>
              <SectionLabel icon={<Icon.Sliders s={14} c={T.violet}/>}>
                Customize
              </SectionLabel>
              <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
                <RangeRulesEditor rules={rangeRules} onChange={setRangeRules} enabled={rangeEnabled} onToggle={setRangeEnabled}/>

                {!rangeEnabled && (
                  <>
                    <Field label="Header" value={header} onChange={setHeader} placeholder="e.g. Chapter 1 — Mate in 1"/>
                    <Field label="Footer" value={footer} onChange={setFooter} placeholder="e.g. Chess School 1a"/>
                  </>
                )}
                <Field label="PDF Filename" value={pdfName} onChange={setPdfName} placeholder="chess_book"/>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                  <Field label="Answer lines" value={answerCount} onChange={setAnswerCount} type="number" placeholder="1"/>
                  <PageToggle value={perPage} onChange={setPerPage}/>
                </div>
                <PageSizeToggle value={pageSize} onChange={setPageSize}/>

                {/* Board color customizer */}
                <div style={{
                  borderTop: '1px solid rgba(255,255,255,0.06)',
                  paddingTop: 14,
                }}>
                  <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:12 }}>
                    <Icon.Palette s={14} c={T.violet}/>
                    <span style={{ fontSize:11, fontWeight:700, color:'#e2e8f0', letterSpacing:'.01em' }}>Board Colors</span>
                  </div>

                  <div style={{ display:'grid', gridTemplateColumns:'1fr auto', gap:14, alignItems:'start' }}>
                    {/* Left: presets + pickers */}
                    <div>
                      {/* Preset swatches */}
                      <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:12 }}>
                        {PRESETS.map(p => (
                          <MiniBoard
                            key={p.name}
                            dark={p.dark} light={p.light}
                            name={p.name}
                            selected={darkColor === p.dark && lightColor === p.light}
                            onClick={() => { setDarkColor(p.dark); setLightColor(p.light) }}
                          />
                        ))}
                      </div>

                      {/* Custom color pickers */}
                      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
                        <ColorInput label="Dark squares"  value={darkColor}  onChange={setDarkColor}/>
                        <ColorInput label="Light squares" value={lightColor} onChange={setLightColor}/>
                      </div>
                    </div>

                    {/* Right: live board preview */}
                    <BoardPreview dark={darkColor} light={lightColor}/>
                  </div>
                </div>

                {/* Page background customizer */}
                <div style={{
                  borderTop: '1px solid rgba(255,255,255,0.06)',
                  paddingTop: 14,
                }}>
                  <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:12 }}>
                    <Icon.Palette s={14} c={T.violet}/>
                    <span style={{ fontSize:11, fontWeight:700, color:'#e2e8f0', letterSpacing:'.01em' }}>Page Background</span>
                  </div>

                  <div style={{ display:'grid', gridTemplateColumns:'1fr auto', gap:14, alignItems:'start' }}>
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
                      <ColorInput label="Page background" value={bgColor} onChange={setBgColor}/>
                      <ColorInput label="Header/footer background" value={hfBgColor} onChange={setHfBgColor}/>
                      <ColorInput label="Font color" value={fontColor} onChange={setFontColor}/>
                    </div>
                    <PagePreview bg={bgColor} hfBg={hfBgColor}/>
                  </div>
                  <div style={{ fontSize:11, color:T.subtle, marginTop:8, lineHeight:1.4 }}>
                    Page background fills each sheet; header/footer bands use their own color. Font color applies to piece symbols, header/footer text, and board labels.
                  </div>
                </div>
              </div>
            </Card>

            {/* Status */}
            {status && <StatusBanner status={status}/>}

            {/* Create button */}
            <button
              onClick={handleCreate}
              disabled={!canGo}
              style={{
                width:'100%', padding:'16px 24px',
                borderRadius:14, border:'none',
                background: canGo
                  ? `linear-gradient(135deg, ${T.accent}, ${T.accent2})`
                  : 'rgba(255,255,255,0.05)',
                color: canGo ? '#fff' : T.subtle,
                fontSize:15, fontWeight:700,
                cursor: canGo ? 'pointer' : 'not-allowed',
                display:'flex', alignItems:'center', justifyContent:'center', gap:10,
                boxShadow: canGo ? `0 4px 24px ${T.accent}50, 0 0 0 1px ${T.accent}40` : 'none',
                transition:'all .25s',
                animation: canGo && !busy ? 'glow 2.5s ease-in-out infinite' : 'none',
              }}
            >
              {busy
                ? <><div className="spin" style={{ width:18,height:18,border:'2px solid #ffffff30',borderTop:'2px solid #fff',borderRadius:'50%'}}/> Creating PDF…</>
                : <><Icon.Book s={18} c="#fff"/> Create Book PDF</>
              }
            </button>

          </div>

          {/* ══ RIGHT column ══ */}
          <div style={{ display:'flex', flexDirection:'column', gap:16 }}>

            {/* Live book preview card */}
            <Card>
              <BookPreview
                fens={fens}
                perPage={perPage}
                header={header}
                footer={footer}
                answerCount={answerCount}
                darkColor={darkColor}
                lightColor={lightColor}
                bgColor={bgColor}
                hfBgColor={hfBgColor}
                fontColor={fontColor}
                pageSize={pageSize}
                rangeRules={rangeRules}
              />
            </Card>

          </div>
        </div>
        </>
        )}
      </div>
    </>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode><App/></React.StrictMode>
)
