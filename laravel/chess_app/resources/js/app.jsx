import React, { useState, useRef, useEffect } from 'react'
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
function PageToggle({ value, onChange }) {
  return (
    <div>
      <label style={{ fontSize:11, fontWeight:600, color:T.muted, textTransform:'uppercase', letterSpacing:'.06em', display:'block', marginBottom:6 }}>
        Boards per page
      </label>
      <div style={{ display:'flex', gap:6 }}>
        {['1','2','4','8'].map(v => (
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
  const [file, setFile]               = useState(null)
  const [preview, setPreview]         = useState('')
  const [header, setHeader]           = useState('')
  const [footer, setFooter]           = useState('')
  const [answerCount, setAnswerCount] = useState('1')
  const [perPage, setPerPage]         = useState('4')
  const [pdfName, setPdfName]         = useState('')
  const [darkColor, setDarkColor]     = useState('#6b8bc3')
  const [lightColor, setLightColor]   = useState('#ffffff')
  const [progress, setProgress]       = useState({ boards:0, pages:0, pdf:0 })
  const [status, setStatus]           = useState(null)
  const [busy, setBusy]               = useState(false)
  const inputRef = useRef()

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
      <div className="chess-bg" style={{ minHeight:'100vh', padding:'48px 20px 60px' }}>

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
                <Field label="Header" value={header} onChange={setHeader} placeholder="e.g. Chapter 1 — Mate in 1"/>
                <Field label="Footer" value={footer} onChange={setFooter} placeholder="e.g. Chess School 1a"/>
                <Field label="PDF Filename" value={pdfName} onChange={setPdfName} placeholder="chess_book"/>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                  <Field label="Answer lines" value={answerCount} onChange={setAnswerCount} type="number" placeholder="1"/>
                  <PageToggle value={perPage} onChange={setPerPage}/>
                </div>

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
              </div>
            </Card>

          </div>

          {/* ══ RIGHT column ══ */}
          <div style={{ display:'flex', flexDirection:'column', gap:16 }}>

            {/* Progress card */}
            <Card glow={busy}>
              <SectionLabel icon={<Icon.Sparkle s={14} c={T.gold}/>}>
                Progress
              </SectionLabel>
              <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
                <ProgressBar label="Creating Boards" pct={progress.boards} idx={0}/>
                <ProgressBar label="Building Pages"  pct={progress.pages}  idx={1}/>
                <ProgressBar label="Generating PDF"  pct={progress.pdf}    idx={2}/>
              </div>
            </Card>

            {/* How it works card */}
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
        </div>
      </div>
    </>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode><App/></React.StrictMode>
)
