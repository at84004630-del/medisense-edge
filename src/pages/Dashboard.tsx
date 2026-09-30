import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Activity, Brain, ShieldCheck, TrendingUp, Lock, CheckCircle,
  Cpu, Zap, Heart, Sparkles, ArrowUpRight, ArrowDownRight,
  ImageIcon, Pill, ChevronRight, Stethoscope,
  Volume2, VolumeX, Sliders, Play, Pause
} from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

interface VitalsPoint {
  t: string
  hr: number
  spo2: number
  bpSys: number
  bpDia: number
  stress: number
}

const vitals6H: VitalsPoint[] = [
  { t: '06:00', hr: 64, spo2: 98, bpSys: 118, bpDia: 78, stress: 24 },
  { t: '07:00', hr: 72, spo2: 99, bpSys: 122, bpDia: 80, stress: 36 },
  { t: '08:00', hr: 84, spo2: 97, bpSys: 128, bpDia: 85, stress: 58 },
  { t: '09:00', hr: 79, spo2: 98, bpSys: 124, bpDia: 82, stress: 46 },
  { t: '10:00', hr: 76, spo2: 98, bpSys: 121, bpDia: 80, stress: 40 },
  { t: '11:00', hr: 81, spo2: 97, bpSys: 126, bpDia: 84, stress: 52 },
  { t: '12:00', hr: 89, spo2: 96, bpSys: 130, bpDia: 86, stress: 68 },
]

const vitals12H: VitalsPoint[] = [
  { t: '08:00', hr: 82, spo2: 97, bpSys: 126, bpDia: 84, stress: 55 },
  { t: '10:00', hr: 76, spo2: 98, bpSys: 122, bpDia: 82, stress: 43 },
  { t: '12:00', hr: 91, spo2: 96, bpSys: 130, bpDia: 86, stress: 70 },
  { t: '14:00', hr: 78, spo2: 98, bpSys: 124, bpDia: 81, stress: 38 },
  { t: '16:00', hr: 85, spo2: 97, bpSys: 128, bpDia: 85, stress: 52 },
  { t: '18:00', hr: 72, spo2: 99, bpSys: 121, bpDia: 80, stress: 26 },
  { t: '20:00', hr: 68, spo2: 99, bpSys: 119, bpDia: 78, stress: 20 },
]

const vitals24H: VitalsPoint[] = [
  { t: '00:00', hr: 60, spo2: 99, bpSys: 112, bpDia: 72, stress: 12 },
  { t: '03:00', hr: 56, spo2: 99, bpSys: 108, bpDia: 70, stress: 8 },
  { t: '06:00', hr: 64, spo2: 98, bpSys: 118, bpDia: 78, stress: 24 },
  { t: '09:00', hr: 80, spo2: 98, bpSys: 125, bpDia: 83, stress: 50 },
  { t: '12:00', hr: 91, spo2: 96, bpSys: 130, bpDia: 86, stress: 70 },
  { t: '15:00', hr: 82, spo2: 98, bpSys: 126, bpDia: 82, stress: 45 },
  { t: '18:00', hr: 74, spo2: 99, bpSys: 122, bpDia: 80, stress: 28 },
  { t: '21:00', hr: 66, spo2: 99, bpSys: 116, bpDia: 76, stress: 16 },
  { t: 'Now',   hr: 72, spo2: 99, bpSys: 124, bpDia: 82, stress: 22 },
]

const initialLiveVitals: VitalsPoint[] = [
  { t: '-18s', hr: 71, spo2: 99, bpSys: 123, bpDia: 81, stress: 22 },
  { t: '-16s', hr: 72, spo2: 99, bpSys: 124, bpDia: 82, stress: 23 },
  { t: '-14s', hr: 70, spo2: 99, bpSys: 123, bpDia: 81, stress: 21 },
  { t: '-12s', hr: 73, spo2: 98, bpSys: 125, bpDia: 83, stress: 24 },
  { t: '-10s', hr: 72, spo2: 99, bpSys: 124, bpDia: 82, stress: 22 },
  { t: '-8s',  hr: 74, spo2: 99, bpSys: 124, bpDia: 82, stress: 23 },
  { t: '-6s',  hr: 71, spo2: 99, bpSys: 123, bpDia: 81, stress: 21 },
  { t: '-4s',  hr: 73, spo2: 99, bpSys: 125, bpDia: 83, stress: 22 },
  { t: '-2s',  hr: 72, spo2: 99, bpSys: 124, bpDia: 82, stress: 22 },
  { t: 'LIVE', hr: 72, spo2: 99, bpSys: 124, bpDia: 82, stress: 22 },
]

type ChartTab = 'HR' | 'SpO₂' | 'BP' | 'Stress'
const CHART_CONFIG: Record<ChartTab, { key: keyof VitalsPoint; color: string; name: string; unit: string }> = {
  'HR':     { key: 'hr',     color: 'var(--red)',   name: 'Heart Rate',       unit: 'bpm' },
  'SpO₂':   { key: 'spo2',   color: 'var(--blue)',  name: 'Blood Oxygen',     unit: '%' },
  'BP':     { key: 'bpSys',  color: 'var(--amber)', name: 'Systolic Pressure', unit: 'mmHg' },
  'Stress': { key: 'stress', color: 'var(--purple-l)', name: 'Stress Index', unit: '%' },
}

interface ArrhythmiaMode {
  id: string
  name: string
  shortLabel: string
  bpm: number
  pr: number
  qrs: number
  qtc: number
  st: number
  statusBadge: string
  badgeColor: string
  severity: 'normal' | 'caution' | 'alert'
  clinicalFinding: string
  npuInference: string
  actionAdvice: string
  pathD: string
}

const CARDIAC_RHYTHMS: ArrhythmiaMode[] = [
  {
    id: 'normal',
    name: 'Normal Sinus Rhythm (NSR)',
    shortLabel: 'Normal Sinus',
    bpm: 72,
    pr: 156,
    qrs: 88,
    qtc: 412,
    st: 0.0,
    statusBadge: 'Normal Sinus',
    badgeColor: 'badge-green',
    severity: 'normal',
    clinicalFinding: 'Standard physiological P-QRS-T complexes. Normal isoelectric ST baseline.',
    npuInference: '1D-CNN ResNet-ECG: 99.4% Normal NSR (11ms latency on Qualcomm Hexagon NPU)',
    actionAdvice: 'Hemodynamically stable. Routine continuous edge monitoring active.',
    pathD: 'M0,50 L20,50 L25,48 L30,50 L40,50 L45,45 L50,55 L55,18 L60,86 L65,48 L70,52 L75,50 L85,50 L95,43 L105,50 L120,50 L125,48 L130,50 L140,50 L145,45 L150,55 L155,18 L160,86 L165,48 L170,52 L175,50 L185,50 L195,43 L205,50 L220,50 L225,48 L230,50 L240,50 L245,45 L250,55 L255,18 L260,86 L265,48 L270,52 L275,50 L285,50 L295,43 L300,50'
  },
  {
    id: 'stemi',
    name: 'Acute ST-Elevation MI (STEMI)',
    shortLabel: '🚨 STEMI Alert',
    bpm: 88,
    pr: 162,
    qrs: 98,
    qtc: 442,
    st: 0.35,
    statusBadge: 'ACUTE ISCHEMIA 🚨',
    badgeColor: 'badge-red',
    severity: 'alert',
    clinicalFinding: 'Pathological +3.5mm ST-segment elevation. Acute transmural myocardial infarction.',
    npuInference: '1D-CNN Ischemia Model: 98.7% Acute STEMI Alert (Immediate Cath Lab)',
    actionAdvice: 'EMERGENCY: Escalate to Level 3 Attending Physician. Prepare Aspirin + Heparin protocol.',
    pathD: 'M0,50 L20,50 L24,47 L28,50 L38,50 L44,46 L49,56 L54,12 L59,75 L63,32 L78,28 L92,30 L102,50 L120,50 L124,47 L128,50 L138,50 L144,46 L149,56 L154,12 L159,75 L163,32 L178,28 L192,30 L202,50 L220,50 L224,47 L228,50 L238,50 L244,46 L249,56 L254,12 L259,75 L263,32 L278,28 L292,30 L300,50'
  },
  {
    id: 'longqt',
    name: 'Drug-Induced Long QTc Interval',
    shortLabel: '⚡ Long QTc (518ms)',
    bpm: 64,
    pr: 172,
    qrs: 94,
    qtc: 518,
    st: 0.0,
    statusBadge: 'Torsades Hazard ⚠️',
    badgeColor: 'badge-amber',
    severity: 'caution',
    clinicalFinding: 'Severely prolonged QTc > 500ms. High vulnerability to fatal ventricular arrhythmias.',
    npuInference: 'BioBERT Pharmacovigilance: Cross-referenced with CYP450 inhibitor interactions',
    actionAdvice: 'Cross-check Drug Checker for QT-prolonging agents (e.g. Amiodarone, Macrolides).',
    pathD: 'M0,50 L18,50 L23,48 L28,50 L36,50 L41,45 L46,55 L50,20 L54,84 L58,49 L62,51 L66,50 L100,50 L115,40 L128,50 L140,50 L145,48 L150,50 L158,50 L163,45 L168,55 L172,20 L176,84 L180,49 L184,51 L188,50 L222,50 L237,40 L250,50 L265,50 L270,48 L275,50 L283,50 L288,45 L292,55 L296,20 L300,84'
  },
  {
    id: 'tachycardia',
    name: 'Sinus Tachycardia (122 BPM)',
    shortLabel: 'Tachycardia',
    bpm: 122,
    pr: 130,
    qrs: 84,
    qtc: 376,
    st: 0.0,
    statusBadge: 'Tachycardia ⚡',
    badgeColor: 'badge-amber',
    severity: 'caution',
    clinicalFinding: 'Rapid heart rate > 100 bpm. High autonomic sympathetic drive or systemic response.',
    npuInference: '1D-CNN Rhythm Analyzer: 96.8% Sinus Tachycardia (Check fever, sepsis, hypovolemia)',
    actionAdvice: 'Review continuous SpO₂ and Blood Pressure to rule out hemodynamic collapse.',
    pathD: 'M0,50 L12,50 L16,47 L20,50 L26,50 L30,44 L34,56 L38,18 L42,86 L46,48 L50,52 L54,50 L62,43 L70,50 L82,50 L86,47 L90,50 L96,50 L100,44 L104,56 L108,18 L112,86 L116,48 L120,52 L124,50 L132,43 L140,50 L152,50 L156,47 L160,50 L166,50 L170,44 L174,56 L178,18 L182,86 L186,48 L190,52 L194,50 L202,43 L210,50 L222,50 L226,47 L230,50 L236,50 L240,44 L244,56 L248,18 L252,86 L256,48 L260,52 L264,50 L272,43 L280,50 L292,50 L296,47 L300,50'
  },
  {
    id: 'avblock',
    name: '1st-Degree AV Block',
    shortLabel: 'AV Block',
    bpm: 52,
    pr: 248,
    qrs: 92,
    qtc: 418,
    st: 0.0,
    statusBadge: 'AV Delay ⏸️',
    badgeColor: 'badge-amber',
    severity: 'caution',
    clinicalFinding: 'Prolonged PR interval > 200 ms. Atrioventricular nodal conduction latency.',
    npuInference: 'Morphometric Interval Scanner: 97.2% 1st-Degree AV Block (PR = 248ms)',
    actionAdvice: 'Assess for electrolyte disturbances (potassium) or beta-blocker overdose.',
    pathD: 'M0,50 L15,50 L20,47 L25,50 L58,50 L64,45 L70,56 L76,16 L82,88 L88,48 L94,52 L100,50 L115,42 L130,50 L150,50 L155,47 L160,50 L193,50 L199,45 L205,56 L211,16 L217,88 L223,48 L229,52 L235,50 L250,42 L265,50 L285,50 L290,47 L295,50 L300,50'
  }
]

const recentAnalyses = [
  { type: 'Symptom Triage',    result: 'Migraine with Photophobia',          risk: 'medium', conf: 91, time: '2m ago',  icon: Brain,       path: '/symptoms', hex: '#a855f7' },
  { type: 'Chest Radiograph',  result: 'Bacterial Pneumonia (RLL infiltrate)', risk: 'high',   conf: 94, time: '14m ago', icon: ImageIcon,   path: '/imaging',  hex: '#00e5a0' },
  { type: 'Pharmacology Scan', result: 'High-risk interaction: Warfarin + Aspirin', risk: 'high', conf: 97, time: '1h ago',  icon: Pill,        path: '/drugs',    hex: '#ffb547' },
  { type: 'Cardiovascular',    result: '10-Yr ASCVD Risk: 6.8% (Borderline)', risk: 'medium', conf: 89, time: '3h ago', icon: ShieldCheck, path: '/risk',     hex: '#ff4d6d' },
]

const aiModels = [
  { name: 'Phi-3.5 Mini',     task: 'Clinical Reasoning LLM',      ms: 18,  tops: 18.0,  status: 'Ready',   color: 'var(--purple-l)' },
  { name: 'ResNet-50 Vision', task: 'X-Ray & Dermoscopy Vision',   ms: 12,  tops: 3.8,   status: 'Active',  color: 'var(--green)' },
  { name: 'BioBERT NLP',      task: 'Pharmacology & Interactions', ms: 35,  tops: 2.1,   status: 'Ready',   color: 'var(--amber)' },
  { name: 'Whisper Base',     task: 'Speech-to-Text Voice Input',  ms: 22,  tops: 0.8,   status: 'Standby', color: 'var(--blue)' },
]

interface TipPayload {
  name: string
  value: number | string
  color: string
}

const ChartTip = ({ active, payload, label }: { active?: boolean; payload?: TipPayload[]; label?: string }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="card" style={{ padding: '0.625rem 0.875rem', minWidth: 150, border: '1px solid var(--bdr-active)', background: 'rgba(7, 16, 32, 0.95)' }}>
      <p style={{ fontSize: '0.7rem', color: 'var(--txt-3)', marginBottom: '0.3rem' }}>{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ fontSize: '0.82rem', color: p.color, fontWeight: 700 }}>
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  )
}

export default function Dashboard() {
  const navigate = useNavigate()
  const [chartTab, setChartTab] = useState<ChartTab>('HR')
  const [timeFilter, setTimeFilter] = useState<'6H' | '12H' | '24H' | 'LIVE'>('LIVE')
  const [isDenoised, setIsDenoised] = useState(true)
  const [isLiveStreaming, setIsLiveStreaming] = useState(true)
  const [liveData, setLiveData] = useState<VitalsPoint[]>(initialLiveVitals)
  const [selectedRhythmId, setSelectedRhythmId] = useState<string>('normal')
  const [isMuted, setIsMuted] = useState(true)
  const [ecgOffset, setEcgOffset] = useState(0)
  const audioContextRef = useRef<AudioContext | null>(null)

  const activeRhythm = CARDIAC_RHYTHMS.find(r => r.id === selectedRhythmId) || CARDIAC_RHYTHMS[0]
  const cfg = CHART_CONFIG[chartTab]

  // Dynamic Audio Beeper for ICU Telemetry Monitor
  const triggerBeep = (freq = 880) => {
    if (isMuted) return
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      if (!AudioCtx) return
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioCtx()
      }
      const ctx = audioContextRef.current
      if (ctx.state === 'suspended') {
        ctx.resume()
      }
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(freq, ctx.currentTime)
      gain.gain.setValueAtTime(0.035, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.06)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start()
      osc.stop(ctx.currentTime + 0.06)
    } catch {
      // Audio context blocked by browser autoplay policy
    }
  }

  const triggerBeepRef = useRef(triggerBeep)
  useEffect(() => {
    triggerBeepRef.current = triggerBeep
  })

  // Live ECG rhythm animation simulation (speed scales with rhythm BPM)
  useEffect(() => {
    const sweepSpeed = Math.round((activeRhythm.bpm / 72) * 2.2)
    const interval = setInterval(() => {
      setEcgOffset(prev => {
        const next = (prev + sweepSpeed) % 300
        // Play beep near the R-peak (approx at sweep point 60, 160, 260)
        if (next >= 56 && next <= 64 && Math.random() > 0.4) {
          triggerBeepRef.current(activeRhythm.severity === 'alert' ? 1040 : 880)
        }
        return next
      })
    }, 40)
    return () => clearInterval(interval)
  }, [activeRhythm])

  // Real-time live telemetry stream updates
  useEffect(() => {
    if (timeFilter !== 'LIVE' || !isLiveStreaming) return
    const timer = setInterval(() => {
      setLiveData(prev => {
        const last = prev[prev.length - 1]
        const jitter = isDenoised ? (Math.random() - 0.5) * 1.2 : (Math.random() - 0.5) * 5.5
        const targetHr = activeRhythm.bpm
        const nextHr = Math.round(Math.max(45, Math.min(160, last.hr * 0.7 + targetHr * 0.3 + jitter)))
        const nextSpo2 = Math.round(Math.max(92, Math.min(100, 99 + (Math.random() - 0.5) * 0.8)))
        const nextBpSys = Math.round(124 + jitter * 1.5)
        const nextBpDia = Math.round(82 + jitter * 0.8)
        const nextStress = Math.round(Math.max(10, Math.min(95, last.stress + (Math.random() - 0.5) * 4)))

        const updated = [...prev.slice(1), {
          t: 'LIVE',
          hr: nextHr,
          spo2: nextSpo2,
          bpSys: nextBpSys,
          bpDia: nextBpDia,
          stress: nextStress
        }]
        return updated
      })
    }, 1500)
    return () => clearInterval(timer)
  }, [timeFilter, isLiveStreaming, isDenoised, activeRhythm.bpm])

  // Select the active data window
  const activeVitalsData = timeFilter === '6H' ? vitals6H
    : timeFilter === '12H' ? vitals12H
    : timeFilter === '24H' ? vitals24H
    : liveData

  // Real-time statistics calculation
  const values = activeVitalsData.map(d => (chartTab === 'BP' ? d.bpSys : Number(d[cfg.key])))
  const peakVal = Math.max(...values)
  const minVal = Math.min(...values)
  const meanVal = (values.reduce((a, b) => a + b, 0) / values.length).toFixed(1)

  return (
    <div className="page-wrapper" style={{ padding: '1.25rem 1.5rem', maxWidth: '1480px' }}>
      {/* ── Unified Futuristic Clinical Command Bar ── */}
      <div style={{
        position: 'relative',
        padding: '1.15rem 1.5rem',
        borderRadius: 'var(--r-lg)',
        background: 'linear-gradient(135deg, rgba(7, 24, 48, 0.9) 0%, rgba(13, 33, 62, 0.8) 50%, rgba(9, 20, 38, 0.92) 100%)',
        border: '1px solid var(--bdr-card)',
        backdropFilter: 'blur(24px)',
        marginBottom: '1.25rem',
        overflow: 'hidden',
        boxShadow: 'var(--shd-md)',
      }}>
        {/* Ambient neon backglow */}
        <div style={{
          position: 'absolute', top: '-50px', right: '-30px', width: '220px', height: '220px',
          borderRadius: '50%', background: 'radial-gradient(circle, rgba(0, 212, 255, 0.15) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />

        <div style={{ position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
              <div style={{
                width: 32, height: 32, borderRadius: 'var(--r-sm)',
                background: 'rgba(0, 212, 255, 0.12)', border: '1px solid rgba(0, 212, 255, 0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--blue)'
              }}>
                <Stethoscope size={18} />
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--txt-1)', fontFamily: 'var(--font-display)', letterSpacing: '-0.02em', margin: 0 }}>
                    Clinical Command Center
                  </h1>
                  <span className="badge badge-green" style={{ fontSize: '0.62rem', padding: '0.15rem 0.5rem' }}>
                    <span className="status-dot live" style={{ marginRight: 3 }} />
                    Snapdragon NPU 45 TOPS
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Live Telemetry Strip */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flexWrap: 'wrap', fontSize: '0.72rem', color: 'var(--txt-3)' }}>
              <span>Welcome, <strong>Dr. Abhinav Tripathi</strong></span>
              <span>·</span>
              <span style={{ color: 'var(--blue)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                <Zap size={11} /> 12ms Latency
              </span>
              <span>·</span>
              <span style={{ color: 'var(--green)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                <Lock size={11} /> 100% On-Device (Air-Gapped)
              </span>
              <span>·</span>
              <span style={{ color: 'var(--purple-l)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                <Cpu size={11} /> 4 Models Warm
              </span>
              <span>·</span>
              <span style={{ color: 'var(--amber)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                <CheckCircle size={11} /> 4.2W Power
              </span>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button className="btn btn-secondary btn-sm" onClick={() => navigate('/imaging')} title="Open Vision Diagnostics">
              <ImageIcon size={13} />
              <span>Diagnostic Scans</span>
            </button>
            <button className="btn btn-secondary btn-sm" onClick={() => navigate('/models')} title="Run Snapdragon NPU Benchmarks">
              <Cpu size={13} />
              <span>NPU Diagnostics</span>
            </button>
            <button className="btn btn-primary btn-sm" onClick={() => navigate('/symptoms')} title="Start Conversational Symptom Triage">
              <Sparkles size={13} />
              <span>Start Triage</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Key Biometric Vitals (Immediately Visible at Top) ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '0.75rem', marginBottom: '1.25rem' }}>
        {[
          { icon: Heart,      c: 'red',    val: '72',  unit: 'bpm', lbl: 'Heart Rate',    delta: '+2% (Normal)',   trend: 'up',   hex: '#ff4d6d' },
          { icon: TrendingUp, c: 'cyan',   val: '99',  unit: '%',   lbl: 'SpO₂ Oxygen',   delta: 'Stable 98-99%',  trend: 'flat', hex: '#00d4ff' },
          { icon: Activity,   c: 'amber',  val: '124', unit: '/82', lbl: 'Blood Pressure', delta: 'Optimal MAP',    trend: 'down', hex: '#ffb547' },
          { icon: ShieldCheck,c: 'green',  val: 'Low', unit: '',    lbl: 'ASCVD Risk',    delta: '6.8% Borderline',trend: 'down', hex: '#00e5a0' },
          { icon: Brain,      c: 'purple', val: '4',   unit: '',    lbl: 'AI Triage Today',delta: 'Zero Cloud',   trend: 'up',   hex: '#a855f7' },
          { icon: Zap,        c: 'cyan',   val: '38',  unit: '%',   lbl: 'Hexagon NPU',   delta: '12ms Response',  trend: 'flat', hex: '#00d4ff' },
        ].map(({ icon: Icon, val, unit, lbl, delta, trend, hex }) => (
          <div key={lbl} className="metric-card card-interactive" style={{ padding: '0.85rem' }}>
            <div style={{
              width: 32, height: 32, borderRadius: 'var(--r-sm)',
              background: `${hex}18`, color: hex, border: `1px solid ${hex}35`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
            }}>
              <Icon size={16} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="metric-val" style={{ fontSize: '1.15rem' }}>
                {val}
                {unit && <span className="metric-unit" style={{ fontSize: '0.7rem' }}> {unit}</span>}
              </div>
              <div className="metric-lbl" style={{ fontSize: '0.68rem' }}>{lbl}</div>
              <div className={`metric-delta ${trend}`} style={{ fontSize: '0.62rem' }}>
                {trend === 'up' && <ArrowUpRight size={8} style={{ display: 'inline' }} />}
                {trend === 'down' && <ArrowDownRight size={8} style={{ display: 'inline' }} />}
                {' '}{delta}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Core AI Diagnostic Hub (Interactive Feature Launcher) ── */}
      <div style={{ marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--txt-1)', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <Sparkles size={15} color="var(--blue)" />
            On-Device Diagnostic Workstations
          </h3>
          <Link to="/models" style={{ fontSize: '0.74rem', color: 'var(--blue)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.2rem', fontWeight: 600 }}>
            Model Benchmarks <ChevronRight size={12} />
          </Link>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.85rem' }}>
          {/* Card 1: Symptom AI */}
          <Link to="/symptoms" className="card card-interactive" style={{
            textDecoration: 'none',
            padding: '1rem',
            background: 'linear-gradient(145deg, rgba(124, 111, 240, 0.08) 0%, rgba(7, 16, 32, 0.85) 100%)',
            border: '1px solid rgba(124, 111, 240, 0.22)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            borderRadius: 'var(--r-md)'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
                <div style={{
                  width: 34, height: 34, borderRadius: 'var(--r-sm)',
                  background: 'rgba(124, 111, 240, 0.15)', color: 'var(--purple-l)',
                  border: '1px solid rgba(124, 111, 240, 0.35)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <Brain size={18} />
                </div>
                <span className="badge badge-purple" style={{ fontSize: '0.6rem' }}>Phi-3.5 Mini</span>
              </div>
              <h4 style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--txt-1)', marginBottom: '0.25rem' }}>
                Symptom AI Copilot
              </h4>
              <p style={{ fontSize: '0.72rem', color: 'var(--txt-3)', lineHeight: 1.4, marginBottom: '0.75rem' }}>
                Conversational differential diagnosis with live microphone input and clinical triage.
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--bdr-subtle)', paddingTop: '0.6rem' }}>
              <span style={{ fontSize: '0.66rem', color: 'var(--purple-l)', fontFamily: 'var(--mono)', fontWeight: 600 }}>18ms latency</span>
              <span style={{ fontSize: '0.72rem', color: 'var(--txt-1)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.15rem' }}>
                Open <ChevronRight size={12} />
              </span>
            </div>
          </Link>

          {/* Card 2: Vision Diagnostics */}
          <Link to="/imaging" className="card card-interactive" style={{
            textDecoration: 'none',
            padding: '1rem',
            background: 'linear-gradient(145deg, rgba(0, 229, 160, 0.08) 0%, rgba(7, 16, 32, 0.85) 100%)',
            border: '1px solid rgba(0, 229, 160, 0.22)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            borderRadius: 'var(--r-md)'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
                <div style={{
                  width: 34, height: 34, borderRadius: 'var(--r-sm)',
                  background: 'rgba(0, 229, 160, 0.15)', color: 'var(--green)',
                  border: '1px solid rgba(0, 229, 160, 0.35)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <ImageIcon size={18} />
                </div>
                <span className="badge badge-green" style={{ fontSize: '0.6rem' }}>ResNet-50</span>
              </div>
              <h4 style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--txt-1)', marginBottom: '0.25rem' }}>
                Vision Diagnostics
              </h4>
              <p style={{ fontSize: '0.72rem', color: 'var(--txt-3)', lineHeight: 1.4, marginBottom: '0.75rem' }}>
                Chest X-Ray & Dermoscopy classification with real-time Grad-CAM attention heatmaps.
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--bdr-subtle)', paddingTop: '0.6rem' }}>
              <span style={{ fontSize: '0.66rem', color: 'var(--green)', fontFamily: 'var(--mono)', fontWeight: 600 }}>12ms latency</span>
              <span style={{ fontSize: '0.72rem', color: 'var(--txt-1)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.15rem' }}>
                Open <ChevronRight size={12} />
              </span>
            </div>
          </Link>

          {/* Card 3: Pharmacology Safety */}
          <Link to="/drugs" className="card card-interactive" style={{
            textDecoration: 'none',
            padding: '1rem',
            background: 'linear-gradient(145deg, rgba(255, 181, 71, 0.08) 0%, rgba(7, 16, 32, 0.85) 100%)',
            border: '1px solid rgba(255, 181, 71, 0.22)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            borderRadius: 'var(--r-md)'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
                <div style={{
                  width: 34, height: 34, borderRadius: 'var(--r-sm)',
                  background: 'rgba(255, 181, 71, 0.15)', color: 'var(--amber)',
                  border: '1px solid rgba(255, 181, 71, 0.35)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <Pill size={18} />
                </div>
                <span className="badge badge-amber" style={{ fontSize: '0.6rem' }}>BioBERT</span>
              </div>
              <h4 style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--txt-1)', marginBottom: '0.25rem' }}>
                Pharmacology Safety
              </h4>
              <p style={{ fontSize: '0.72rem', color: 'var(--txt-3)', lineHeight: 1.4, marginBottom: '0.75rem' }}>
                Pairwise drug interaction matrix, CYP450 enzyme conflicts, and multi-med contraindications.
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--bdr-subtle)', paddingTop: '0.6rem' }}>
              <span style={{ fontSize: '0.66rem', color: 'var(--amber)', fontFamily: 'var(--mono)', fontWeight: 600 }}>35ms latency</span>
              <span style={{ fontSize: '0.72rem', color: 'var(--txt-1)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.15rem' }}>
                Open <ChevronRight size={12} />
              </span>
            </div>
          </Link>

          {/* Card 4: Multi-Organ Risk */}
          <Link to="/risk" className="card card-interactive" style={{
            textDecoration: 'none',
            padding: '1rem',
            background: 'linear-gradient(145deg, rgba(0, 212, 255, 0.08) 0%, rgba(7, 16, 32, 0.85) 100%)',
            border: '1px solid rgba(0, 212, 255, 0.22)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            borderRadius: 'var(--r-md)'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
                <div style={{
                  width: 34, height: 34, borderRadius: 'var(--r-sm)',
                  background: 'rgba(0, 212, 255, 0.15)', color: 'var(--blue)',
                  border: '1px solid rgba(0, 212, 255, 0.35)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <ShieldCheck size={18} />
                </div>
                <span className="badge badge-cyan" style={{ fontSize: '0.6rem' }}>ASCVD Biomarker</span>
              </div>
              <h4 style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--txt-1)', marginBottom: '0.25rem' }}>
                Multi-Organ Risk
              </h4>
              <p style={{ fontSize: '0.72rem', color: 'var(--txt-3)', lineHeight: 1.4, marginBottom: '0.75rem' }}>
                Framingham 10-Yr cardiovascular risk scoring, radar charts, and reactive clinical modifiers.
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--bdr-subtle)', paddingTop: '0.6rem' }}>
              <span style={{ fontSize: '0.66rem', color: 'var(--blue)', fontFamily: 'var(--mono)', fontWeight: 600 }}>Reactive engine</span>
              <span style={{ fontSize: '0.72rem', color: 'var(--txt-1)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.15rem' }}>
                Open <ChevronRight size={12} />
              </span>
            </div>
          </Link>
        </div>
      </div>

      {/* ── Main Monitoring Station: Waveform Chart + Live ECG Rhythm ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.45fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
        {/* Continuous Vitals History */}
        <div className="card" style={{ padding: '1.1rem' }}>
          <div className="section-hd" style={{ marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div>
              <div className="section-title"><Activity size={15} color="var(--blue)" />Continuous Biometric Waveform</div>
              <div className="section-sub">On-device continuous telemetry stream · Snapdragon DSP filtered</div>
            </div>
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', alignItems: 'center' }}>
              {/* Parameter selector */}
              <div className="tab-bar" style={{ fontSize: '0.68rem' }}>
                {(['HR', 'SpO₂', 'BP', 'Stress'] as ChartTab[]).map(t => (
                  <button key={t} className={`tab-btn ${chartTab === t ? 'active' : ''}`}
                    onClick={() => setChartTab(t)}>{t}</button>
                ))}
              </div>
              {/* Time window selector */}
              <div className="tab-bar" style={{ fontSize: '0.68rem' }}>
                {(['6H', '12H', '24H', 'LIVE'] as const).map(f => (
                  <button key={f} className={`tab-btn ${timeFilter === f ? 'active' : ''}`}
                    onClick={() => setTimeFilter(f)}>{f}</button>
                ))}
              </div>
              {/* Live streaming controls */}
              {timeFilter === 'LIVE' && (
                <div style={{ display: 'flex', gap: '0.25rem' }}>
                  <button
                    className={`telemetry-dsp-btn ${!isDenoised ? 'raw' : ''}`}
                    onClick={() => setIsDenoised(d => !d)}
                    title={isDenoised ? "Switch to Raw Unfiltered Biosensor Signal" : "Apply Qualcomm Hexagon Vector Denoising"}
                  >
                    <Sliders size={11} />
                    <span>{isDenoised ? "NPU Filter" : "Raw Jitter"}</span>
                  </button>
                  <button
                    className="telemetry-dsp-btn"
                    onClick={() => setIsLiveStreaming(s => !s)}
                    title={isLiveStreaming ? "Pause Live Streaming" : "Resume Live Streaming"}
                    style={{ padding: '0.22rem 0.45rem' }}
                  >
                    {isLiveStreaming ? <Pause size={11} /> : <Play size={11} />}
                  </button>
                </div>
              )}
            </div>
          </div>

          <ResponsiveContainer width="100%" height={215}>
            <AreaChart data={activeVitalsData} margin={{ left: -15, right: 4, top: 10, bottom: 0 }}>
              <defs>
                <linearGradient id="gVitals" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={cfg.color} stopOpacity={0.35} />
                  <stop offset="95%" stopColor={cfg.color} stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="gDiastolic" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="var(--blue)" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="var(--blue)" stopOpacity={0.01} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(0, 212, 255, 0.05)" vertical={false} />
              <XAxis dataKey="t" tick={{ fill: 'var(--txt-3)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis
                tick={{ fill: 'var(--txt-3)', fontSize: 11 }}
                domain={chartTab === 'SpO₂' ? [90, 100] : chartTab === 'BP' ? [60, 150] : [40, 140]}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<ChartTip />} />
              {chartTab === 'BP' ? (
                <>
                  <Area
                    type="monotone"
                    dataKey="bpSys"
                    name="Systolic (mmHg)"
                    stroke="var(--amber)"
                    fill="url(#gVitals)"
                    strokeWidth={2.5}
                    dot={{ r: 3, fill: 'var(--amber)', stroke: '#020b18', strokeWidth: 1.5 }}
                    activeDot={{ r: 5, fill: 'var(--amber)', stroke: '#fff', strokeWidth: 2 }}
                    animationDuration={400}
                  />
                  <Area
                    type="monotone"
                    dataKey="bpDia"
                    name="Diastolic (mmHg)"
                    stroke="var(--blue)"
                    fill="url(#gDiastolic)"
                    strokeWidth={2}
                    dot={{ r: 2.5, fill: 'var(--blue)', stroke: '#020b18', strokeWidth: 1.5 }}
                    activeDot={{ r: 4.5, fill: 'var(--blue)', stroke: '#fff', strokeWidth: 2 }}
                    animationDuration={400}
                  />
                </>
              ) : (
                <Area
                  key={cfg.key}
                  type="monotone"
                  dataKey={cfg.key}
                  name={`${cfg.name} (${cfg.unit})`}
                  stroke={cfg.color}
                  fill="url(#gVitals)"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: cfg.color, stroke: '#020b18', strokeWidth: 1.5 }}
                  activeDot={{ r: 5, fill: cfg.color, stroke: '#fff', strokeWidth: 2 }}
                  animationDuration={400}
                />
              )}
            </AreaChart>
          </ResponsiveContainer>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--bdr-subtle)', paddingTop: '0.65rem', marginTop: '0.4rem', fontSize: '0.7rem', color: 'var(--txt-3)', flexWrap: 'wrap', gap: '0.5rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <span className="status-dot live" />
              Source: Qualcomm DSP Bio-Sensors {isDenoised ? '(Denoised)' : '(Raw Feed)'}
            </span>
            <span style={{ color: 'var(--txt-2)' }}>
              {chartTab === 'BP' ? (
                <>MAP: <strong>96 mmHg</strong> · Sys Peak: <strong>{peakVal} mmHg</strong> · Dia Min: <strong>{minVal} mmHg</strong></>
              ) : (
                <>Peak: <strong>{peakVal} {cfg.unit}</strong> · Mean: <strong>{meanVal} {cfg.unit}</strong> · Min: <strong>{minVal} {cfg.unit}</strong></>
              )}
            </span>
          </div>
        </div>

        {/* Live ECG Electrocardiogram Rhythm Card with Arrhythmia Simulator */}
        <div
          className="card"
          style={{
            padding: '1.1rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            borderColor: activeRhythm.severity === 'alert' ? 'rgba(255, 77, 109, 0.45)' : 'var(--bdr-card)',
            boxShadow: activeRhythm.severity === 'alert' ? '0 0 24px rgba(255, 77, 109, 0.2)' : undefined,
            transition: 'all 0.3s ease'
          }}
        >
          <div>
            <div className="section-hd" style={{ marginBottom: '0.55rem' }}>
              <div>
                <div className="section-title"><Heart size={15} color="var(--red)" />Live Lead-II ECG Rhythm</div>
                <div className="section-sub">Real-time vector cardiogram · 1D-CNN Arrhythmia Detection</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <button
                  className="topbar-icon-btn"
                  onClick={() => setIsMuted(m => !m)}
                  title={isMuted ? "Unmute ICU Cardiac Telemetry Beep" : "Mute Cardiac Sound"}
                  style={{ width: 26, height: 26 }}
                >
                  {isMuted ? <VolumeX size={13} /> : <Volume2 size={13} color="var(--green)" />}
                </button>
                <span className={`badge ${activeRhythm.badgeColor}`} style={{ fontSize: '0.62rem' }}>
                  <span className="status-dot live" style={{ marginRight: 3 }} />
                  {activeRhythm.statusBadge}
                </span>
              </div>
            </div>

            {/* Interactive Arrhythmia Presets Selector */}
            <div style={{ display: 'flex', gap: '0.35rem', overflowX: 'auto', paddingBottom: '0.4rem', marginBottom: '0.45rem' }}>
              {CARDIAC_RHYTHMS.map(r => {
                const isSelected = selectedRhythmId === r.id
                return (
                  <button
                    key={r.id}
                    className={`ecg-rhythm-chip ${isSelected ? 'active' : ''} ${isSelected && r.severity === 'alert' ? 'alert' : ''} ${isSelected && r.severity === 'caution' ? 'caution' : ''}`}
                    onClick={() => setSelectedRhythmId(r.id)}
                    title={`Simulate ${r.name}`}
                  >
                    <span>{r.shortLabel}</span>
                  </button>
                )
              })}
            </div>

            {/* Simulated Clinical ECG Grid Canvas / SVG */}
            <div style={{
              position: 'relative',
              height: '130px',
              borderRadius: 'var(--r-md)',
              background: '#010810',
              border: `1px solid ${activeRhythm.severity === 'alert' ? 'rgba(255, 77, 109, 0.4)' : 'rgba(0, 229, 160, 0.25)'}`,
              overflow: 'hidden',
              boxShadow: activeRhythm.severity === 'alert' ? 'inset 0 0 20px rgba(255, 77, 109, 0.15)' : 'inset 0 0 20px rgba(0, 229, 160, 0.08)'
            }}>
              {/* Medical ECG grid overlay */}
              <div style={{
                position: 'absolute', inset: 0,
                backgroundImage: activeRhythm.severity === 'alert'
                  ? 'linear-gradient(rgba(255, 77, 109, 0.09) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 77, 109, 0.09) 1px, transparent 1px)'
                  : 'linear-gradient(rgba(0, 229, 160, 0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 229, 160, 0.08) 1px, transparent 1px)',
                backgroundSize: '16px 16px'
              }} />

              {/* Dynamic Animated ECG Path */}
              <svg width="100%" height="100%" viewBox="0 0 300 100" preserveAspectRatio="none" style={{ position: 'relative', zIndex: 2 }}>
                <defs>
                  <filter id="glowEcg" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="2" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>
                <path
                  d={activeRhythm.pathD}
                  fill="none"
                  stroke={activeRhythm.severity === 'alert' ? '#ff4d6d' : activeRhythm.severity === 'caution' ? '#ffb547' : 'var(--green)'}
                  strokeWidth="2.2"
                  filter="url(#glowEcg)"
                  strokeDasharray="300"
                  strokeDashoffset={ecgOffset}
                  style={{ transition: 'stroke 0.3s ease' }}
                />
              </svg>

              {/* Morphometric Wave Calipers Overlay */}
              <div style={{ position: 'absolute', top: 6, left: 10, zIndex: 3, display: 'flex', gap: '0.45rem', fontSize: '0.58rem', fontFamily: 'var(--mono)', color: 'var(--txt-4)' }}>
                <span>P-Wave</span>
                <span>·</span>
                <span style={{ color: activeRhythm.severity === 'alert' ? '#ff4d6d' : 'var(--blue)' }}>QRS Complex</span>
                <span>·</span>
                <span style={{ color: activeRhythm.st > 0 ? '#ff4d6d' : undefined }}>ST-Segment</span>
                <span>·</span>
                <span>T-Wave</span>
              </div>

              {/* Live Sweep indicator */}
              <div style={{
                position: 'absolute', top: 0, bottom: 0,
                left: `${(ecgOffset / 300) * 100}%`,
                width: '3px',
                background: activeRhythm.severity === 'alert'
                  ? 'linear-gradient(180deg, transparent 0%, #ff4d6d 50%, transparent 100%)'
                  : 'linear-gradient(180deg, transparent 0%, var(--green) 50%, transparent 100%)',
                boxShadow: activeRhythm.severity === 'alert' ? '0 0 8px #ff4d6d' : '0 0 8px var(--green)',
                zIndex: 3
              }} />

              {/* Heart Pulse Icon */}
              <div style={{
                position: 'absolute', top: 8, right: 10, zIndex: 4,
                display: 'flex', alignItems: 'center', gap: '0.35rem',
                background: 'rgba(2, 11, 24, 0.85)', padding: '0.18rem 0.45rem',
                borderRadius: 'var(--r-full)',
                border: `1px solid ${activeRhythm.severity === 'alert' ? 'rgba(255, 77, 109, 0.4)' : 'rgba(0, 229, 160, 0.3)'}`
              }}>
                <Heart
                  size={11}
                  color="var(--red)"
                  fill="var(--red)"
                  style={{ animation: `heartbeat ${Math.max(0.4, 60 / activeRhythm.bpm)}s infinite` }}
                />
                <span style={{ fontSize: '0.72rem', color: 'var(--txt-1)', fontWeight: 700, fontFamily: 'var(--mono)' }}>
                  {activeRhythm.bpm} BPM
                </span>
              </div>
            </div>

            {/* Clinical ECG Intervals Table */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.4rem', marginTop: '0.65rem' }}>
              <div style={{ padding: '0.4rem', background: 'var(--bg-surface)', borderRadius: 'var(--r-sm)', textAlign: 'center', border: '1px solid var(--bdr-subtle)' }}>
                <div style={{ fontSize: '0.6rem', color: 'var(--txt-3)' }}>PR Interval</div>
                <div style={{ fontSize: '0.74rem', fontWeight: 700, color: activeRhythm.pr > 200 ? 'var(--amber)' : 'var(--txt-1)', fontFamily: 'var(--mono)' }}>
                  {activeRhythm.pr} ms
                </div>
              </div>
              <div style={{ padding: '0.4rem', background: 'var(--bg-surface)', borderRadius: 'var(--r-sm)', textAlign: 'center', border: '1px solid var(--bdr-subtle)' }}>
                <div style={{ fontSize: '0.6rem', color: 'var(--txt-3)' }}>QRS Width</div>
                <div style={{ fontSize: '0.74rem', fontWeight: 700, color: activeRhythm.qrs > 100 ? 'var(--amber)' : 'var(--green)', fontFamily: 'var(--mono)' }}>
                  {activeRhythm.qrs} ms
                </div>
              </div>
              <div style={{ padding: '0.4rem', background: 'var(--bg-surface)', borderRadius: 'var(--r-sm)', textAlign: 'center', border: '1px solid var(--bdr-subtle)' }}>
                <div style={{ fontSize: '0.6rem', color: 'var(--txt-3)' }}>QTc Interval</div>
                <div style={{ fontSize: '0.74rem', fontWeight: 700, color: activeRhythm.qtc > 480 ? 'var(--red)' : activeRhythm.qtc > 440 ? 'var(--amber)' : 'var(--txt-1)', fontFamily: 'var(--mono)' }}>
                  {activeRhythm.qtc} ms
                </div>
              </div>
              <div style={{ padding: '0.4rem', background: 'var(--bg-surface)', borderRadius: 'var(--r-sm)', textAlign: 'center', border: '1px solid var(--bdr-subtle)' }}>
                <div style={{ fontSize: '0.6rem', color: 'var(--txt-3)' }}>ST Elevation</div>
                <div style={{ fontSize: '0.74rem', fontWeight: 700, color: activeRhythm.st > 0.1 ? 'var(--red)' : 'var(--green)', fontFamily: 'var(--mono)' }}>
                  {activeRhythm.st > 0 ? `+${activeRhythm.st.toFixed(2)}` : '0.0'} mV
                </div>
              </div>
            </div>

            {/* Snapdragon NPU Live 1D-CNN Diagnosis Callout */}
            <div style={{
              marginTop: '0.65rem',
              padding: '0.5rem 0.65rem',
              borderRadius: 'var(--r-sm)',
              background: activeRhythm.severity === 'alert' ? 'rgba(255, 77, 109, 0.08)' : 'rgba(0, 212, 255, 0.04)',
              border: `1px solid ${activeRhythm.severity === 'alert' ? 'rgba(255, 77, 109, 0.25)' : 'rgba(0, 212, 255, 0.15)'}`,
              fontSize: '0.67rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                <span style={{ fontWeight: 700, color: activeRhythm.severity === 'alert' ? '#ff4d6d' : 'var(--blue)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <Cpu size={12} />
                  {activeRhythm.npuInference}
                </span>
                {activeRhythm.severity === 'alert' && (
                  <button
                    className="btn btn-primary btn-sm"
                    style={{ fontSize: '0.62rem', padding: '0.15rem 0.45rem', height: 'auto', background: 'var(--red)', borderColor: 'var(--red)' }}
                    onClick={() => navigate('/symptoms')}
                  >
                    Escalate Triage
                  </button>
                )}
                {activeRhythm.id === 'longqt' && (
                  <button
                    className="btn btn-secondary btn-sm"
                    style={{ fontSize: '0.62rem', padding: '0.15rem 0.45rem', height: 'auto', color: 'var(--amber)', borderColor: 'var(--amber)' }}
                    onClick={() => navigate('/drugs')}
                  >
                    Check Drugs
                  </button>
                )}
              </div>
              <p style={{ margin: 0, color: 'var(--txt-3)', lineHeight: 1.35 }}>
                {activeRhythm.actionAdvice}
              </p>
            </div>
          </div>

          <div style={{ marginTop: '0.65rem', fontSize: '0.68rem', color: 'var(--txt-3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Vector Filter: 0.05 - 150 Hz · 500 S/s</span>
            <span style={{ color: activeRhythm.severity === 'alert' ? '#ff4d6d' : 'var(--green)', fontWeight: 600 }}>
              {activeRhythm.severity === 'alert' ? '⚠️ Arrhythmia Classified' : '0 Artifacts Detected'}
            </span>
          </div>
        </div>
      </div>

      {/* ── Recent Clinical Activity & Active NPU Models ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.15fr 1fr', gap: '1rem' }}>
        {/* Recent AI Diagnoses */}
        <div className="card" style={{ padding: '1.1rem' }}>
          <div className="section-hd" style={{ marginBottom: '0.85rem' }}>
            <div>
              <div className="section-title"><Brain size={15} color="var(--purple-l)" />Recent Diagnostic Records</div>
              <div className="section-sub">Computed locally on Snapdragon Hexagon DSP</div>
            </div>
            <span className="badge badge-cyan" style={{ fontSize: '0.64rem' }}>4 Recorded Today</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
            {recentAnalyses.map((item, i) => {
              const Icon = item.icon
              return (
                <div
                  key={i}
                  onClick={() => navigate(item.path)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.75rem',
                    padding: '0.65rem 0.85rem', background: 'var(--bg-surface)',
                    borderRadius: 'var(--r-md)', border: '1px solid var(--bdr-subtle)',
                    transition: 'all var(--t-fast)', cursor: 'pointer',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = 'var(--bdr-active)'
                    e.currentTarget.style.transform = 'translateX(4px)'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = 'var(--bdr-subtle)'
                    e.currentTarget.style.transform = 'none'
                  }}
                >
                  <div style={{
                    width: 32, height: 32, borderRadius: 'var(--r-sm)', flexShrink: 0,
                    background: `${item.hex}18`, border: `1px solid ${item.hex}35`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: item.hex,
                  }}>
                    <Icon size={16} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.1rem' }}>
                      <p style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--txt-1)' }}>
                        {item.type}
                      </p>
                      <span style={{ fontSize: '0.66rem', color: 'var(--blue)', fontFamily: 'var(--mono)' }}>
                        {item.conf}% conf
                      </span>
                    </div>
                    <p className="truncate" style={{ fontSize: '0.72rem', color: 'var(--txt-3)' }}>
                      {item.result}
                    </p>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.2rem', flexShrink: 0 }}>
                    <span className={`badge badge-${item.risk === 'low' ? 'green' : item.risk === 'medium' ? 'amber' : 'red'}`} style={{ fontSize: '0.6rem' }}>
                      {item.risk.toUpperCase()}
                    </span>
                    <span style={{ fontSize: '0.62rem', color: 'var(--txt-4)' }}>{item.time}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Qualcomm AI Models Co-Processor Matrix */}
        <div className="card" style={{ padding: '1.1rem' }}>
          <div className="section-hd" style={{ marginBottom: '0.85rem' }}>
            <div>
              <div className="section-title"><Cpu size={15} color="var(--blue)" />Snapdragon Neural Hub</div>
              <div className="section-sub">Hexagon DSP runtime memory map</div>
            </div>
            <Link to="/models" className="badge badge-cyan" style={{ textDecoration: 'none', cursor: 'pointer', fontSize: '0.64rem' }}>
              Full Matrix →
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {aiModels.map(m => (
              <div key={m.name} style={{
                padding: '0.75rem 0.85rem',
                background: 'var(--bg-surface)',
                border: '1px solid var(--bdr-subtle)',
                borderRadius: 'var(--r-md)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                transition: 'all var(--t-fast)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{
                    width: 30, height: 30, borderRadius: 'var(--r-sm)',
                    background: `${m.color}15`, color: m.color,
                    border: `1px solid ${m.color}35`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <Cpu size={15} />
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.82rem', color: 'var(--txt-1)' }}>{m.name}</span>
                      <span className="badge badge-green" style={{ fontSize: '0.58rem', padding: '0.08rem 0.35rem' }}>{m.status}</span>
                    </div>
                    <span style={{ fontSize: '0.68rem', color: 'var(--txt-3)' }}>{m.task}</span>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--blue)', fontFamily: 'var(--mono)' }}>
                    {m.ms} ms
                  </div>
                  <div style={{ fontSize: '0.64rem', color: 'var(--txt-4)', fontFamily: 'var(--mono)' }}>
                    {m.tops} TOPS allocated
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div style={{
            marginTop: '0.85rem',
            padding: '0.65rem 0.85rem',
            background: 'rgba(0, 212, 255, 0.04)',
            border: '1px solid rgba(0, 212, 255, 0.15)',
            borderRadius: 'var(--r-md)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.72rem'
          }}>
            <span style={{ color: 'var(--txt-2)' }}>Memory Footprint: <strong>3.4 GB / 16 GB unified LPDDR5x</strong></span>
            <span style={{ color: 'var(--green)', fontWeight: 600 }}>Zero NPU Throttling</span>
          </div>
        </div>
      </div>
    </div>
  )
}
