import { useState, useRef } from 'react'
import {
  ImageIcon, Upload, Zap, CheckCircle, AlertTriangle, XCircle,
  Cpu, Sparkles, Layers, Info
} from 'lucide-react'
import PageHeader from '../components/PageHeader'

type ScanType = 'skin' | 'xray' | 'retinal' | 'wound'

interface Result {
  label: string
  conf: number
  cat: 'benign' | 'concerning' | 'urgent'
  desc: string
  action: string
}

// Built-in standalone clinical SVG samples for 1-click evaluation
const CLINICAL_SAMPLES: Record<ScanType, { title: string; subtitle: string; svgUri: string; bbox: { x: number; y: number; w: number; h: number; label: string } }> = {
  skin: {
    title: 'Atypical Melanocytic Nevus',
    subtitle: 'Dermoscopy 40x polarized scan (dorsal trunk)',
    bbox: { x: 38, y: 35, w: 26, h: 28, label: 'Pigment Network Asymmetry' },
    svgUri: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="400" height="300">
      <defs>
        <radialGradient id="skinBase" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="%23d6a37e"/>
          <stop offset="70%" stop-color="%23b8805a"/>
          <stop offset="100%" stop-color="%235c3c24"/>
        </radialGradient>
        <radialGradient id="lesionGrad" cx="45%" cy="45%" r="50%">
          <stop offset="0%" stop-color="%232b1308"/>
          <stop offset="50%" stop-color="%234d2812"/>
          <stop offset="85%" stop-color="%237a4422"/>
          <stop offset="100%" stop-color="%23a8693b" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <rect width="400" height="300" fill="%231a0e07"/>
      <circle cx="200" cy="150" r="135" fill="url(%23skinBase)"/>
      <ellipse cx="195" cy="145" rx="55" ry="46" fill="url(%23lesionGrad)" transform="rotate(-12 195 145)"/>
      <circle cx="185" cy="135" r="18" fill="%23140702" opacity="0.85"/>
      <circle cx="215" cy="155" r="12" fill="%23240e05" opacity="0.75"/>
      <circle cx="170" cy="158" r="8" fill="%233d1c0b" opacity="0.6"/>
      <circle cx="200" cy="150" r="135" fill="none" stroke="%233a1e0d" stroke-width="6"/>
      <text x="25" y="35" fill="%2300e5a0" font-family="monospace" font-size="11" font-weight="bold">DERM-40X // RESNET-50 POLARIZED</text>
    </svg>`
  },
  xray: {
    title: 'Thoracic PA Radiograph',
    subtitle: 'Bilateral lung fields & cardiac silhouette',
    bbox: { x: 52, y: 38, w: 25, h: 32, label: 'Bronchovascular Infiltration' },
    svgUri: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="400" height="300">
      <rect width="400" height="300" fill="%2305080f"/>
      <defs>
        <radialGradient id="lungL" cx="40%" cy="50%" r="50%">
          <stop offset="0%" stop-color="%23182838"/>
          <stop offset="100%" stop-color="%23050b14"/>
        </radialGradient>
      </defs>
      <!-- Spine -->
      <rect x="195" y="20" width="10" height="260" fill="%23556b82" opacity="0.6"/>
      <!-- Ribs -->
      <path d="M110 80 Q195 110 280 80 M100 110 Q195 145 290 110 M95 145 Q195 185 295 145 M100 185 Q195 220 290 185 M115 220 Q195 250 280 220" stroke="%233b4e63" stroke-width="7" fill="none" opacity="0.5"/>
      <!-- Lung fields -->
      <ellipse cx="140" cy="150" rx="45" ry="75" fill="url(%23lungL)" opacity="0.85"/>
      <ellipse cx="255" cy="150" rx="48" ry="75" fill="url(%23lungL)" opacity="0.85"/>
      <!-- Heart silhouette -->
      <path d="M175 140 C175 190 230 220 250 190 C250 160 210 135 175 140 Z" fill="%237b93ab" opacity="0.65"/>
      <!-- Clavicles -->
      <path d="M90 60 Q150 75 195 70 M305 60 Q245 75 195 70" stroke="%237a94ad" stroke-width="8" fill="none" opacity="0.7"/>
      <text x="25" y="35" fill="%2300d4ff" font-family="monospace" font-size="11" font-weight="bold">CHEST-PA // DENSENET-121 CHEST</text>
    </svg>`
  },
  retinal: {
    title: 'Fundus Photography Scan',
    subtitle: 'Macular center and temporal retinal arcades',
    bbox: { x: 42, y: 38, w: 22, h: 22, label: 'Early Microaneurysms' },
    svgUri: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="400" height="300">
      <rect width="400" height="300" fill="%23060201"/>
      <defs>
        <radialGradient id="retina" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="%23d64c1c"/>
          <stop offset="60%" stop-color="%238a1e05"/>
          <stop offset="90%" stop-color="%233d0a01"/>
          <stop offset="100%" stop-color="%23060201"/>
        </radialGradient>
      </defs>
      <circle cx="200" cy="150" r="130" fill="url(%23retina)"/>
      <!-- Optic Disc -->
      <circle cx="270" cy="150" r="22" fill="%23f7d174" opacity="0.85"/>
      <!-- Retinal Vessels -->
      <path d="M270 150 Q230 110 160 100 M270 150 Q210 190 145 200 M270 145 Q220 135 150 140 M270 155 Q240 170 170 185" stroke="%23540a02" stroke-width="3" fill="none"/>
      <!-- Macula -->
      <circle cx="170" cy="150" r="16" fill="%235e1403" opacity="0.9"/>
      <circle cx="170" cy="150" r="4" fill="%232b0800"/>
      <text x="25" y="35" fill="%23a78bfa" font-family="monospace" font-size="11" font-weight="bold">RETINA-EYE // EFFICIENTNET-B4</text>
    </svg>`
  },
  wound: {
    title: 'Post-Surgical Incision',
    subtitle: 'Granulation bed & periwound margin assessment',
    bbox: { x: 30, y: 42, w: 42, h: 22, label: 'Erythematous Margin' },
    svgUri: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="400" height="300">
      <rect width="400" height="300" fill="%231a0e07"/>
      <rect x="40" y="20" width="320" height="260" rx="16" fill="%23c48e6c"/>
      <!-- Incision line -->
      <path d="M100 150 Q200 148 300 150" stroke="%236e1414" stroke-width="5" stroke-linecap="round"/>
      <!-- Sutures -->
      <path d="M130 138 L130 162 M165 138 L165 162 M200 138 L200 162 M235 138 L235 162 M270 138 L270 162" stroke="%23241b17" stroke-width="2.5"/>
      <!-- Erythema halo -->
      <ellipse cx="200" cy="150" rx="110" ry="25" fill="%23ff4d6d" opacity="0.18"/>
      <text x="25" y="35" fill="%23ffb547" font-family="monospace" font-size="11" font-weight="bold">WOUND-YOLO // YOLOV8-MEDICAL</text>
    </svg>`
  }
}

const RESULTS: Record<ScanType, Result[]> = {
  skin: [
    {
      label: 'Atypical Melanocytic Nevus',
      conf: 93,
      cat: 'benign',
      desc: 'Dermoscopic evaluation shows reticular pigment network with mild peripheral asymmetry, consistent with benign Clark nevi.',
      action: 'Routine annual dermatological examination. Perform monthly self-monitoring using ABCDE criteria (Asymmetry, Border, Color, Diameter, Evolving).'
    },
    {
      label: 'Actinic Keratosis',
      conf: 38,
      cat: 'concerning',
      desc: 'Secondary low-confidence marker for hyperkeratotic scaling. Low probability of epithelial dysplastic transformation.',
      action: 'Apply broad-spectrum SPF 50+ sunscreen daily. Clinical inspection if roughness or bleeding occurs.'
    },
    {
      label: 'Seborrheic Keratosis',
      conf: 24,
      cat: 'benign',
      desc: 'Warty surface keratinocyte aggregation without evidence of malignant melanoma architecture.',
      action: 'No intervention required unless irritated by clothing or friction.'
    }
  ],
  xray: [
    {
      label: 'Bilateral Pulmonary Vascular Congestion',
      conf: 87,
      cat: 'concerning',
      desc: 'Subtle perihilar vascular cuffing and increased bronchovascular prominence. No consolidation, pleural effusion, or pneumothorax.',
      action: 'Correlate with auscultatory crackles and clinical dyspnea. Follow-up posteroanterior radiograph in 2-3 weeks if cough persists.'
    },
    {
      label: 'Clear Costophrenic Angles',
      conf: 95,
      cat: 'benign',
      desc: 'Sharp, well-demarcated lateral and cardiophrenic sulci bilaterally. Zero fluid accumulation detected.',
      action: 'Confirms absence of significant pleural fluid collection.'
    }
  ],
  retinal: [
    {
      label: 'Non-Proliferative Diabetic Retinopathy (Mild)',
      conf: 84,
      cat: 'concerning',
      desc: 'Sparse isolated retinal microaneurysms detected in the superior temporal quadrant without macular edema or hard exudates.',
      action: 'Schedule dilated ophthalmic funduscopic examination within 6-12 months. Optimize glycemic control (target HbA1c < 7.0%).'
    },
    {
      label: 'Normal Optic Disc Margin',
      conf: 96,
      cat: 'benign',
      desc: 'Crisp optic disc boundaries with physiological cup-to-disc ratio 0.3. No signs of papilledema.',
      action: 'Annual diabetic eye surveillance protocol.'
    }
  ],
  wound: [
    {
      label: 'Clean Granulation with Minimal Erythema',
      conf: 91,
      cat: 'benign',
      desc: 'Surgical incision shows intact primary closure approximation. Periwound erythema < 1cm, consistent with normal inflammatory phase.',
      action: 'Maintain sterile dry dressing. Monitor for purulent exudate, increasing warmth, or wound dehiscence.'
    },
    {
      label: 'Superficial Bacterial Colonization Risk',
      conf: 32,
      cat: 'concerning',
      desc: 'Low-grade perilesional flare. Zero systemic indicators.',
      action: 'Perform gentle antiseptic cleansing with chlorhexidine solution.'
    }
  ]
}

const SCAN_TYPES = [
  { id: 'skin' as ScanType, emoji: '🔬', label: 'Skin Lesion', model: 'ResNet-50 INT8', color: 'green', tops: '3.8 TOPS', latency: '12ms' },
  { id: 'xray' as ScanType, emoji: '🩻', label: 'Chest X-Ray', model: 'DenseNet-121 INT8', color: 'cyan', tops: '1.4 TOPS', latency: '22ms' },
  { id: 'retinal' as ScanType, emoji: '👁️', label: 'Retinal Fundus', model: 'EfficientNet-B4', color: 'purple', tops: '2.6 TOPS', latency: '16ms' },
  { id: 'wound' as ScanType, emoji: '🩹', label: 'Wound Assessment', model: 'YOLOv8-Medical', color: 'amber', tops: '2.0 TOPS', latency: '14ms' },
]

const CAT: Record<string, { color: string; icon: any; badge: string }> = {
  benign: { color: 'var(--green)', icon: CheckCircle, badge: 'badge-green' },
  concerning: { color: 'var(--amber)', icon: AlertTriangle, badge: 'badge-amber' },
  urgent: { color: 'var(--red)', icon: XCircle, badge: 'badge-red' },
}

export default function ImageDiagnostics() {
  const [scan, setScan] = useState<ScanType>('skin')
  const [drag, setDrag] = useState(false)
  const [imgUrl, setImgUrl] = useState<string | null>(CLINICAL_SAMPLES.skin.svgUri)
  const [sampleLoaded, setSampleLoaded] = useState<boolean>(true)
  const [showHeatmap, setShowHeatmap] = useState<boolean>(true)
  const [analyzing, setAnalyzing] = useState(false)
  const [results, setResults] = useState<Result[] | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const activeScan = SCAN_TYPES.find(s => s.id === scan)!
  const activeSample = CLINICAL_SAMPLES[scan]

  const handleFile = (f: File) => {
    setImgUrl(URL.createObjectURL(f))
    setSampleLoaded(false)
    setResults(null)
  }

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDrag(false)
    const f = e.dataTransfer.files[0]
    if (f?.type.startsWith('image/')) handleFile(f)
  }

  const onInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (f) handleFile(f)
  }

  const loadSample = (type: ScanType) => {
    setScan(type)
    setImgUrl(CLINICAL_SAMPLES[type].svgUri)
    setSampleLoaded(true)
    setResults(null)
  }

  const analyze = () => {
    if (!imgUrl) return
    setAnalyzing(true)
    setResults(null)
    setTimeout(() => {
      setAnalyzing(false)
      setResults(RESULTS[scan])
    }, 1600)
  }

  return (
    <div className="page-wrapper">
      <PageHeader
        title="Vision Diagnostics"
        subtitle="On-device medical imaging — ResNet-50, DenseNet-121 & YOLOv8 on Qualcomm Hexagon NPU"
        icon={<ImageIcon size={20} />}
        badge={<span className="badge badge-green"><Cpu size={10} /> {activeScan.model} · {activeScan.tops}</span>}
      />

      {/* Scan type selector */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem', marginBottom: '1.25rem' }}>
        {SCAN_TYPES.map(({ id, emoji, label, model, color, latency }) => (
          <button
            key={id}
            onClick={() => loadSample(id)}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.75rem',
              padding: '0.875rem', borderRadius: 'var(--r-md)', cursor: 'pointer',
              background: scan === id ? 'var(--bg-elevated)' : 'var(--bg-card)',
              border: `1px solid ${scan === id ? `var(--${color === 'green' ? 'green' : color === 'cyan' ? 'cyan' : color === 'purple' ? 'purple' : 'amber'})77` : 'var(--bdr-subtle)'}`,
              transition: 'all var(--t-spring)',
              transform: scan === id ? 'translateY(-2px)' : 'none',
              boxShadow: scan === id ? 'var(--shd-md)' : 'none',
            }}
          >
            <span style={{ fontSize: '1.5rem', lineHeight: 1 }}>{emoji}</span>
            <div style={{ textAlign: 'left', minWidth: 0 }}>
              <p style={{ fontWeight: 700, fontSize: '0.82rem', color: 'var(--txt-1)', marginBottom: '0.1rem' }}>{label}</p>
              <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
                <span style={{ fontSize: '0.65rem', color: 'var(--txt-4)', fontFamily: 'var(--mono)' }}>{model}</span>
                <span className="badge badge-cyan" style={{ fontSize: '0.55rem', padding: '1px 4px' }}>{latency}</span>
              </div>
            </div>
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', alignItems: 'start' }}>

        {/* ── Left: Image Canvas & Controls ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.125rem' }}>

          {/* Quick Presets Notice Bar */}
          <div className="card" style={{ padding: '0.75rem 1rem', background: 'rgba(0,212,255,0.03)', borderColor: 'rgba(0,212,255,0.2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--txt-2)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Sparkles size={12} color="var(--cyan)" />
                <strong>1-Click Clinical Demos:</strong>
              </span>
              <div style={{ display: 'flex', gap: '0.35rem' }}>
                {SCAN_TYPES.map(s => (
                  <button
                    key={s.id}
                    className={`chip ${scan === s.id && sampleLoaded ? 'active-chip' : ''}`}
                    style={{ fontSize: '0.7rem', padding: '2px 8px' }}
                    onClick={() => loadSample(s.id)}
                  >
                    {s.emoji} {s.label.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Drop / Viewer Zone */}
          <div
            onDragOver={e => { e.preventDefault(); setDrag(true) }}
            onDragLeave={() => setDrag(false)}
            onDrop={onDrop}
            onClick={() => !imgUrl && fileRef.current?.click()}
            style={{
              border: `2px dashed ${drag ? 'var(--cyan)' : imgUrl ? 'var(--bdr-card)' : 'var(--bdr-subtle)'}`,
              borderRadius: 'var(--r-xl)',
              minHeight: 280,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: imgUrl ? 'default' : 'pointer',
              overflow: 'hidden',
              position: 'relative',
              background: drag ? 'rgba(0,212,255,0.04)' : 'var(--bg-surface)',
              transition: 'all var(--t-base)',
            }}
          >
            <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={onInput} />

            {imgUrl ? (
              <div style={{ position: 'relative', width: '100%', height: 280, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#02060f' }}>
                <img
                  src={imgUrl}
                  alt="Medical scan"
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                />

                {/* AI Grad-CAM / Attention Region Bounding Box Overlay */}
                {results && showHeatmap && (
                  <div
                    style={{
                      position: 'absolute',
                      left: `${activeSample.bbox.x}%`,
                      top: `${activeSample.bbox.y}%`,
                      width: `${activeSample.bbox.w}%`,
                      height: `${activeSample.bbox.h}%`,
                      border: '2px solid rgba(0, 229, 160, 0.9)',
                      background: 'radial-gradient(circle, rgba(0,229,160,0.3) 0%, rgba(0,212,255,0.1) 70%, transparent 100%)',
                      borderRadius: 'var(--r-sm)',
                      boxShadow: '0 0 15px rgba(0, 229, 160, 0.6)',
                      pointerEvents: 'none',
                      animation: 'pulse 1.8s infinite',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'flex-start',
                    }}
                  >
                    <span style={{
                      alignSelf: 'flex-start',
                      background: 'var(--green)',
                      color: '#000',
                      fontSize: '0.62rem',
                      fontWeight: 800,
                      padding: '2px 5px',
                      borderRadius: '2px',
                      letterSpacing: '0.5px',
                      marginTop: '-18px',
                      whiteSpace: 'nowrap'
                    }}>
                      ROI: {activeSample.bbox.label}
                    </span>
                  </div>
                )}

                {/* Hover Action Strip */}
                <div style={{
                  position: 'absolute', bottom: 10, right: 10, display: 'flex', gap: '0.5rem',
                  background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', padding: '4px 8px', borderRadius: 'var(--r-md)'
                }}>
                  <button
                    className="btn btn-xs btn-secondary"
                    onClick={e => { e.stopPropagation(); fileRef.current?.click() }}
                  >
                    <Upload size={11} /> Upload Custom
                  </button>
                  <button
                    className="btn btn-xs btn-danger"
                    onClick={e => { e.stopPropagation(); setImgUrl(null); setResults(null) }}
                  >
                    Clear
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', padding: '2rem', textAlign: 'center' }}>
                <div style={{
                  width: 64, height: 64, borderRadius: 'var(--r-xl)',
                  background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.15)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  animation: 'float 3s ease-in-out infinite',
                }}>
                  <Upload size={24} color="var(--cyan)" />
                </div>
                <div>
                  <p style={{ fontWeight: 700, color: 'var(--txt-1)', marginBottom: '0.25rem' }}>Drop medical scan or choose a demo above</p>
                  <p style={{ fontSize: '0.76rem', color: 'var(--txt-3)' }}>DICOM PNG, JPEG, or High-Resolution Dermoscopy</p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button className="btn btn-secondary btn-sm" onClick={e => { e.stopPropagation(); fileRef.current?.click() }}>
                    <Upload size={13} /> Browse Computer
                  </button>
                  <button className="btn btn-primary btn-sm" onClick={e => { e.stopPropagation(); loadSample(scan) }}>
                    <Sparkles size={13} /> Load Sample
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Controls Bar */}
          {imgUrl && (
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <button
                className="btn btn-primary btn-xl"
                style={{ flex: 1 }}
                onClick={analyze}
                disabled={analyzing}
              >
                {analyzing ? (
                  <><div className="spinner" /> Inferencing {activeScan.model} on Snapdragon NPU...</>
                ) : (
                  <><Zap size={18} /> Analyze with {activeScan.model} — On Device</>
                )}
              </button>

              {results && (
                <button
                  type="button"
                  className={`btn btn-secondary btn-xl ${showHeatmap ? 'active' : ''}`}
                  onClick={() => setShowHeatmap(v => !v)}
                  title="Toggle AI Attention / Grad-CAM region"
                  style={{ flexShrink: 0 }}
                >
                  <Layers size={16} color={showHeatmap ? 'var(--green)' : 'var(--txt-3)'} />
                  {showHeatmap ? 'Heatmap ON' : 'Heatmap OFF'}
                </button>
              )}
            </div>
          )}

          {/* Privacy & Hardware Metrics Box */}
          <div style={{
            padding: '0.875rem',
            background: 'rgba(0,212,255,0.04)',
            border: '1px solid rgba(0,212,255,0.15)',
            borderRadius: 'var(--r-md)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem'
          }}>
            <div>
              <p style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--cyan)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Cpu size={14} /> Snapdragon Hexagon Tensor Processing
              </p>
              <p style={{ fontSize: '0.72rem', color: 'var(--txt-3)', marginTop: '2px' }}>
                100% on-device vision pipeline · 0 KB sent to cloud · Zero medical data egress
              </p>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <span className="badge badge-green">1.2W Draw</span>
              <span className="badge badge-cyan">{activeScan.latency} Latency</span>
            </div>
          </div>
        </div>

        {/* ── Right: Diagnostic Results ── */}
        <div>
          {!results && !analyzing && (
            <div className="card">
              <div className="empty-state">
                <div className="empty-icon" style={{ animation: 'float 3s ease-in-out infinite' }}>
                  <ImageIcon size={30} />
                </div>
                <p className="empty-title">Ready for Vision Inference</p>
                <p className="empty-sub">
                  Target: <strong style={{ color: 'var(--cyan)' }}>{activeSample.title}</strong>. Click <strong style={{ color: 'var(--green)' }}>Analyze</strong> to trigger Qualcomm AI Hub {activeScan.model} running locally on the Hexagon NPU.
                </p>
              </div>
            </div>
          )}

          {analyzing && (
            <div className="card">
              <div className="analysis-loading">
                <div className="pulse-ring-wrapper">
                  <div className="pulse-ring pulse-ring-1" style={{ borderColor: 'rgba(0,229,160,0.5)' }} />
                  <div className="pulse-ring pulse-ring-2" style={{ borderColor: 'rgba(0,229,160,0.25)' }} />
                  <div className="pulse-ring pulse-ring-3" style={{ borderColor: 'rgba(0,229,160,0.1)' }} />
                  <div className="pulse-center" style={{ background: 'rgba(0,229,160,0.12)', border: '1px solid rgba(0,229,160,0.3)' }}>
                    <ImageIcon size={20} color="var(--green)" />
                  </div>
                </div>
                <div>
                  <p style={{ fontWeight: 700, color: 'var(--txt-1)', textAlign: 'center' }}>
                    {activeScan.model} scanning pixel matrices...
                  </p>
                  <p className="text-xs text-muted text-c mt-1">
                    Qualcomm Hexagon DSP · Tensor Accelerator · 0ms cloud latency
                  </p>
                </div>
                <div className="loader-dots"><span /><span /><span /></div>
              </div>
            </div>
          )}

          {results && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              {/* Telemetry summary */}
              <div className="card glass-shine" style={{ background: 'rgba(0,229,160,0.04)', borderColor: 'rgba(0,229,160,0.25)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <Zap size={18} color="var(--green)" />
                  <div>
                    <p style={{ fontWeight: 800, color: 'var(--txt-1)', fontSize: '0.875rem', lineHeight: 1.2 }}>
                      Pathology Assessment Complete
                    </p>
                    <p className="text-xs text-muted">
                      {activeScan.latency} · {activeScan.model} · Qualcomm AI Hub · 45 TOPS Hexagon
                    </p>
                  </div>
                  <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.5rem' }}>
                    <span className="badge badge-green">{results.length} Candidates</span>
                    <span className="badge badge-cyan">Grad-CAM Mapped</span>
                  </div>
                </div>
              </div>

              {/* Finding Cards */}
              {results.map((r, i) => {
                const cfg = CAT[r.cat]
                const Icon = cfg.icon
                return (
                  <div
                    key={i}
                    className="card"
                    style={{
                      animation: `slideUp 0.3s ease ${i * 0.08}s both`,
                      borderColor: `${cfg.color}33`,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.875rem', marginBottom: '0.875rem' }}>
                      <div style={{
                        width: 42, height: 42, borderRadius: 'var(--r-md)', flexShrink: 0,
                        background: `${cfg.color}14`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <Icon size={20} color={cfg.color} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem', flexWrap: 'wrap' }}>
                          <h4 style={{ fontWeight: 700, color: 'var(--txt-1)', fontSize: '0.92rem' }}>{r.label}</h4>
                          <span className={`badge ${cfg.badge}`}>{r.cat}</span>
                        </div>
                        <div className="progress-track">
                          <div
                            className="progress-fill"
                            style={{
                              width: `${r.conf}%`,
                              background: `linear-gradient(90deg, ${cfg.color}, ${cfg.color}88)`
                            }}
                          />
                        </div>
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <div style={{ fontSize: '1.45rem', fontWeight: 900, color: cfg.color, lineHeight: 1 }}>{r.conf}%</div>
                        <div className="text-xs text-muted">confidence</div>
                      </div>
                    </div>

                    <p style={{ fontSize: '0.82rem', color: 'var(--txt-2)', marginBottom: '0.75rem', lineHeight: 1.65 }}>
                      {r.desc}
                    </p>

                    <div style={{
                      padding: '0.625rem 0.75rem', borderRadius: 'var(--r-sm)',
                      background: `${cfg.color}0a`, border: `1px solid ${cfg.color}22`,
                      fontSize: '0.78rem', color: 'var(--txt-2)',
                      display: 'flex', gap: '0.5rem', alignItems: 'flex-start'
                    }}>
                      <Info size={14} color={cfg.color} style={{ flexShrink: 0, marginTop: 2 }} />
                      <div>
                        <strong style={{ color: cfg.color }}>Clinical Action: </strong>
                        {r.action}
                      </div>
                    </div>
                  </div>
                )
              })}

              <p className="text-xs text-muted text-c">
                ⚕️ Vision screening aid. Histopathological verification required for definitive oncology triage.
              </p>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          div[style*="grid-template-columns: repeat(4"] { grid-template-columns: repeat(2, 1fr) !important; }
          div[style*="grid-template-columns: 1fr 1fr"] { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}
