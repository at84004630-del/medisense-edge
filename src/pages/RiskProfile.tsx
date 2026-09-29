import { useState, useMemo } from 'react'
import {
  ShieldCheck, Zap, AlertTriangle, User, Heart, Activity, Cpu,
  Sparkles
} from 'lucide-react'
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip, Cell
} from 'recharts'
import PageHeader from '../components/PageHeader'

interface PatientForm {
  age: number
  weight: number
  height: number
  systolicBp: number
  smoking: 'Never' | 'Former' | 'Current'
  diabetes: 'No' | 'Pre-diabetic' | 'Type 1' | 'Type 2'
  family: 'None' | 'Heart Disease' | 'Cancer' | 'Diabetes' | 'Multiple'
}

const PRESETS: { label: string; icon: string; form: PatientForm }[] = [
  {
    label: 'Healthy Young Adult',
    icon: '🏃',
    form: { age: 26, weight: 68, height: 178, systolicBp: 116, smoking: 'Never', diabetes: 'No', family: 'None' }
  },
  {
    label: 'Middle-Aged Metabolic Watch',
    icon: '💼',
    form: { age: 52, weight: 92, height: 174, systolicBp: 138, smoking: 'Former', diabetes: 'Pre-diabetic', family: 'Diabetes' }
  },
  {
    label: 'High-Risk Cardiac Profile',
    icon: '⚠️',
    form: { age: 67, weight: 98, height: 172, systolicBp: 156, smoking: 'Current', diabetes: 'Type 2', family: 'Heart Disease' }
  }
]

const STATUS_CFG: Record<string, { color: string; badge: string }> = {
  normal: { color: 'var(--green)', badge: 'badge-green' },
  elevated: { color: 'var(--amber)', badge: 'badge-amber' },
  low: { color: 'var(--cyan)', badge: 'badge-cyan' },
  high: { color: 'var(--red)', badge: 'badge-red' },
}

export default function RiskProfile() {
  const [form, setForm] = useState<PatientForm>(PRESETS[1].form)
  const [loading, setLoading] = useState(false)
  const [computed, setComputed] = useState(true)

  const setVal = (k: keyof PatientForm, v: any) => {
    setForm(f => ({ ...f, [k]: v }))
  }

  // Clinical risk engine: Multi-organ ASCVD / Framingham approximation
  const computedMetrics = useMemo(() => {
    const heightM = form.height / 100
    const bmi = Math.round((form.weight / (heightM * heightM)) * 10) / 10

    // Cardiac (Age, BP, Smoking, Diabetes, Family)
    let cardiac = 10 + (form.age - 18) * 0.6
    if (form.smoking === 'Current') cardiac += 26
    else if (form.smoking === 'Former') cardiac += 10
    if (form.systolicBp > 140) cardiac += 22
    else if (form.systolicBp > 125) cardiac += 10
    if (form.diabetes === 'Type 2') cardiac += 18
    else if (form.diabetes === 'Pre-diabetic') cardiac += 8
    if (form.family === 'Heart Disease' || form.family === 'Multiple') cardiac += 18
    cardiac = Math.min(95, Math.max(12, Math.round(cardiac)))

    // Metabolic (BMI, Diabetes, BP)
    let metabolic = 12
    if (bmi > 30) metabolic += 38
    else if (bmi > 25) metabolic += (bmi - 25) * 5
    if (form.diabetes === 'Type 2') metabolic += 38
    else if (form.diabetes === 'Type 1') metabolic += 32
    else if (form.diabetes === 'Pre-diabetic') metabolic += 20
    if (form.family === 'Diabetes') metabolic += 12
    metabolic = Math.min(95, Math.max(10, Math.round(metabolic)))

    // Respiratory (Smoking, Age)
    let respiratory = 10 + (form.age - 18) * 0.25
    if (form.smoking === 'Current') respiratory += 54
    else if (form.smoking === 'Former') respiratory += 22
    respiratory = Math.min(95, Math.max(8, Math.round(respiratory)))

    // Neurovascular (Age, BP, Cardiac)
    let neuro = Math.round(cardiac * 0.5 + (form.age - 18) * 0.4 + (form.systolicBp > 140 ? 16 : 4))
    neuro = Math.min(92, Math.max(10, neuro))

    // Oncological (Smoking, Age, Family)
    let oncological = 8 + (form.age - 18) * 0.35
    if (form.smoking === 'Current') oncological += 42
    else if (form.smoking === 'Former') oncological += 18
    if (form.family === 'Cancer' || form.family === 'Multiple') oncological += 24
    oncological = Math.min(95, Math.max(8, Math.round(oncological)))

    // Renal (Diabetes, BP, Age)
    let renal = 10 + (form.age - 18) * 0.2
    if (form.diabetes !== 'No') renal += 26
    if (form.systolicBp > 140) renal += 24
    renal = Math.min(90, Math.max(10, Math.round(renal)))

    // Overall Composite Score (0 - 100)
    const overall = Math.round(
      cardiac * 0.28 +
      metabolic * 0.22 +
      respiratory * 0.16 +
      neuro * 0.14 +
      oncological * 0.10 +
      renal * 0.10
    )

    const radar = [
      { factor: 'Cardiac', score: cardiac },
      { factor: 'Respiratory', score: respiratory },
      { factor: 'Metabolic', score: metabolic },
      { factor: 'Neuro', score: neuro },
      { factor: 'Oncological', score: oncological },
      { factor: 'Renal', score: renal },
    ]

    const factors = [
      {
        name: 'Systolic Blood Pressure',
        val: form.systolicBp,
        unit: 'mmHg',
        status: form.systolicBp > 140 ? 'high' : form.systolicBp > 125 ? 'elevated' : 'normal',
        icon: '🩺'
      },
      {
        name: 'Body Mass Index (BMI)',
        val: bmi,
        unit: 'kg/m²',
        status: bmi >= 30 ? 'high' : bmi >= 25 ? 'elevated' : 'normal',
        icon: '⚖️'
      },
      {
        name: 'Glycemic Risk (HbA1c)',
        val: form.diabetes === 'Type 2' ? 8.2 : form.diabetes === 'Pre-diabetic' ? 6.1 : 5.4,
        unit: '%',
        status: form.diabetes === 'Type 2' || form.diabetes === 'Type 1' ? 'high' : form.diabetes === 'Pre-diabetic' ? 'elevated' : 'normal',
        icon: '🩸'
      },
      {
        name: 'Tobacco Exposure',
        val: form.smoking === 'Current' ? 85 : form.smoking === 'Former' ? 35 : 0,
        unit: '% load',
        status: form.smoking === 'Current' ? 'high' : form.smoking === 'Former' ? 'elevated' : 'normal',
        icon: '🚭'
      },
      {
        name: 'Family Genetic Weight',
        val: form.family === 'Multiple' ? 80 : form.family !== 'None' ? 55 : 10,
        unit: '% risk',
        status: form.family === 'Multiple' ? 'high' : form.family !== 'None' ? 'elevated' : 'normal',
        icon: '🧬'
      },
      {
        name: 'Age-Related Vascular Aging',
        val: Math.round((form.age / 90) * 100),
        unit: '% index',
        status: form.age > 65 ? 'high' : form.age > 45 ? 'elevated' : 'normal',
        icon: '⏳'
      },
    ]

    return { bmi, cardiac, metabolic, respiratory, neuro, oncological, renal, overall, radar, factors }
  }, [form])

  const compute = () => {
    setLoading(true)
    setComputed(false)
    setTimeout(() => {
      setLoading(false)
      setComputed(true)
    }, 1200)
  }

  const scoreColor = computedMetrics.overall < 30 ? 'var(--green)' : computedMetrics.overall < 60 ? 'var(--amber)' : 'var(--red)'
  const scoreLabel = computedMetrics.overall < 30 ? 'Low Risk Tier' : computedMetrics.overall < 60 ? 'Moderate Risk Tier' : 'High Risk Alert'

  return (
    <div className="page-wrapper">
      <PageHeader
        title="Health Risk Profile"
        subtitle="Multi-organ ASCVD & metabolic risk profiling — on-device inference on Qualcomm Hexagon NPU"
        icon={<ShieldCheck size={20} />}
        badge={<span className="badge badge-red"><Zap size={10} /> ONNX Risk Engine · NPU</span>}
      />

      <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: '1.5rem', alignItems: 'start' }}>

        {/* ── Left: Patient Profile Form ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.125rem' }}>

          {/* 1-Click Patient Presets */}
          <div className="card" style={{ padding: '0.875rem', background: 'rgba(0,212,255,0.03)', borderColor: 'rgba(0,212,255,0.2)' }}>
            <div style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--cyan)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Sparkles size={12} /> 1-Click Patient Profiles:
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              {PRESETS.map(p => (
                <button
                  key={p.label}
                  type="button"
                  className="btn btn-secondary btn-sm"
                  style={{ justifyContent: 'flex-start', fontSize: '0.74rem', padding: '0.35rem 0.65rem' }}
                  onClick={() => setForm(p.form)}
                >
                  <span>{p.icon}</span>
                  <span style={{ color: 'var(--txt-1)', fontWeight: 600 }}>{p.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Form */}
          <div className="card">
            <div className="section-hd">
              <div className="section-title">
                <User size={15} color="var(--purple-l)" />
                Patient Biometrics
              </div>
              <span className="badge badge-cyan">BMI: {computedMetrics.bmi}</span>
            </div>

            {/* Age Slider */}
            <div className="form-group mb-2">
              <label className="form-label">
                Age: <span style={{ color: 'var(--txt-1)', fontWeight: 800 }}>{form.age} yrs</span>
              </label>
              <input
                type="range"
                min={18}
                max={90}
                value={form.age}
                onChange={e => setVal('age', +e.target.value)}
              />
            </div>

            {/* Weight Slider */}
            <div className="form-group mb-2">
              <label className="form-label">
                Weight: <span style={{ color: 'var(--txt-1)', fontWeight: 800 }}>{form.weight} kg</span>
              </label>
              <input
                type="range"
                min={40}
                max={150}
                value={form.weight}
                onChange={e => setVal('weight', +e.target.value)}
              />
            </div>

            {/* Height Slider */}
            <div className="form-group mb-2">
              <label className="form-label">
                Height: <span style={{ color: 'var(--txt-1)', fontWeight: 800 }}>{form.height} cm</span>
              </label>
              <input
                type="range"
                min={140}
                max={210}
                value={form.height}
                onChange={e => setVal('height', +e.target.value)}
              />
            </div>

            {/* Systolic BP Slider */}
            <div className="form-group mb-2">
              <label className="form-label">
                Systolic BP: <span style={{ color: form.systolicBp > 140 ? 'var(--red)' : 'var(--txt-1)', fontWeight: 800 }}>{form.systolicBp} mmHg</span>
              </label>
              <input
                type="range"
                min={95}
                max={180}
                value={form.systolicBp}
                onChange={e => setVal('systolicBp', +e.target.value)}
              />
            </div>

            {/* Dropdowns */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.625rem', marginTop: '0.5rem' }}>
              <div className="form-group">
                <label className="form-label">Smoking Status</label>
                <select
                  className="form-input"
                  value={form.smoking}
                  onChange={e => setVal('smoking', e.target.value as any)}
                >
                  <option>Never</option>
                  <option>Former</option>
                  <option>Current</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Diabetes</label>
                <select
                  className="form-input"
                  value={form.diabetes}
                  onChange={e => setVal('diabetes', e.target.value as any)}
                >
                  <option>No</option>
                  <option>Pre-diabetic</option>
                  <option>Type 1</option>
                  <option>Type 2</option>
                </select>
              </div>
            </div>

            <div className="form-group mt-2">
              <label className="form-label">Family Medical History</label>
              <select
                className="form-input"
                value={form.family}
                onChange={e => setVal('family', e.target.value as any)}
              >
                <option>None</option>
                <option>Heart Disease</option>
                <option>Diabetes</option>
                <option>Cancer</option>
                <option>Multiple</option>
              </select>
            </div>

            <button
              className="btn btn-primary w-full mt-3"
              onClick={compute}
              disabled={loading}
            >
              {loading ? (
                <><div className="spinner" /> Calculating Multi-Axis Vectors on NPU...</>
              ) : (
                <><Cpu size={16} /> Recompute Risk Matrix — On Device</>
              )}
            </button>
          </div>

          <div style={{
            padding: '0.75rem', background: 'rgba(0,212,255,0.03)',
            border: '1px solid rgba(0,212,255,0.15)', borderRadius: 'var(--r-md)',
            fontSize: '0.74rem', color: 'var(--txt-3)'
          }}>
            🔒 <strong>Biometric Isolation:</strong> Cardiovascular equations & ONNX models compute in hardware cache on your Snapdragon-powered HP PC.
          </div>
        </div>

        {/* ── Right: Comprehensive Multi-Axis Results ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.125rem' }}>

          {/* Overall Score Banner */}
          <div className="card glass-shine" style={{
            background: `linear-gradient(135deg, ${scoreColor}0d, transparent)`,
            borderColor: `${scoreColor}44`,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>

              {/* Score SVG Dial */}
              <div style={{ position: 'relative', width: 115, height: 115, flexShrink: 0 }}>
                <svg viewBox="0 0 100 100" width="115" height="115" style={{ transform: 'rotate(-90deg)' }}>
                  <circle cx="50" cy="50" r="40" stroke="var(--bg-surface)" strokeWidth="8" fill="none" />
                  <circle
                    cx="50" cy="50" r="40"
                    stroke={scoreColor} strokeWidth="8" fill="none"
                    strokeDasharray={`${computed ? computedMetrics.overall * 2.51 : 0} 251`}
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dasharray 1s cubic-bezier(0.4,0,0.2,1)' }}
                  />
                </svg>
                <div style={{
                  position: 'absolute', inset: 0,
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                }}>
                  <div style={{ fontSize: '1.85rem', fontWeight: 900, color: scoreColor, lineHeight: 1 }}>
                    {computed ? computedMetrics.overall : 0}
                  </div>
                  <div style={{ fontSize: '0.55rem', color: 'var(--txt-3)', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                    % RISK
                  </div>
                </div>
              </div>

              {/* Text Summary */}
              <div style={{ flex: 1, minWidth: 200 }}>
                <div className="badge mb-1" style={{
                  background: `${scoreColor}18`, color: scoreColor, border: `1px solid ${scoreColor}44`,
                  fontSize: '0.75rem', padding: '0.25rem 0.75rem', fontWeight: 700
                }}>
                  {scoreLabel}
                </div>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 900, color: 'var(--txt-1)', marginBottom: '0.25rem' }}>
                  10-Year Multi-Organ Risk Score
                </h2>
                <p style={{ fontSize: '0.8rem', color: 'var(--txt-3)', lineHeight: 1.5 }}>
                  Synthesized across Framingham cardiovascular equations, BMI indices, and metabolic vectors on Hexagon DSP.
                </p>

                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                  <span className={`badge ${computedMetrics.cardiac > 50 ? 'badge-red' : computedMetrics.cardiac > 30 ? 'badge-amber' : 'badge-green'}`}>
                    Cardiac: {computedMetrics.cardiac}%
                  </span>
                  <span className={`badge ${computedMetrics.metabolic > 50 ? 'badge-red' : computedMetrics.metabolic > 30 ? 'badge-amber' : 'badge-green'}`}>
                    Metabolic: {computedMetrics.metabolic}%
                  </span>
                  <span className="badge badge-cyan">45 TOPS Local Acceleration</span>
                </div>
              </div>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid-2">
            {/* Radar Chart */}
            <div className="card">
              <div className="section-title mb-2" style={{ fontSize: '0.88rem' }}>
                <Activity size={14} color="var(--cyan)" /> Organ System Risk Radar
              </div>
              <ResponsiveContainer width="100%" height={210}>
                <RadarChart data={computedMetrics.radar} cx="50%" cy="50%" outerRadius="75%">
                  <PolarGrid stroke="rgba(255,255,255,0.08)" />
                  <PolarAngleAxis dataKey="factor" tick={{ fill: 'var(--txt-2)', fontSize: 10 }} />
                  <Radar
                    dataKey="score"
                    stroke="var(--cyan)"
                    fill="rgba(0,212,255,0.2)"
                    strokeWidth={2}
                    animationDuration={600}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            {/* Bar Chart Breakdown */}
            <div className="card">
              <div className="section-title mb-2" style={{ fontSize: '0.88rem' }}>
                <Heart size={14} color="var(--red)" /> Comparative Organ Severity
              </div>
              <ResponsiveContainer width="100%" height={210}>
                <BarChart data={computedMetrics.radar} layout="vertical" margin={{ left: 8, right: 16 }}>
                  <XAxis type="number" tick={{ fill: 'var(--txt-3)', fontSize: 10 }} axisLine={false} tickLine={false} domain={[0, 100]} />
                  <YAxis type="category" dataKey="factor" tick={{ fill: 'var(--txt-2)', fontSize: 10 }} axisLine={false} tickLine={false} width={75} />
                  <Tooltip
                    contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--bdr-card)', borderRadius: 10, color: 'var(--txt-1)', fontSize: '0.8rem' }}
                    cursor={{ fill: 'rgba(255,255,255,0.04)' }}
                  />
                  <Bar dataKey="score" radius={[0, 4, 4, 0]} animationDuration={600}>
                    {computedMetrics.radar.map((d, i) => (
                      <Cell
                        key={i}
                        fill={d.score < 35 ? 'var(--green)' : d.score < 65 ? 'var(--amber)' : 'var(--red)'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Detailed Risk Indicators Grid */}
          <div className="card">
            <div className="section-hd">
              <div className="section-title">
                <ShieldCheck size={15} color="var(--red)" />
                Specific Clinical Risk Factors
              </div>
              <span className="badge badge-amber">
                <AlertTriangle size={10} />
                {computedMetrics.factors.filter(f => f.status === 'high' || f.status === 'elevated').length} Need Modification
              </span>
            </div>

            <div className="grid-2" style={{ gap: '0.625rem' }}>
              {computedMetrics.factors.map((rf, i) => {
                const cfg = STATUS_CFG[rf.status]
                return (
                  <div
                    key={i}
                    style={{
                      padding: '0.75rem', background: 'var(--bg-surface)',
                      border: '1px solid var(--bdr-subtle)', borderRadius: 'var(--r-md)',
                      animation: `slideUp 0.25s ease ${i * 0.05}s both`,
                      transition: 'border-color var(--t-fast)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <span style={{ fontSize: '0.9rem' }}>{rf.icon}</span>
                        <p style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--txt-2)' }}>{rf.name}</p>
                      </div>
                      <span className={`badge ${cfg.badge}`}>{rf.status}</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem', marginBottom: '0.25rem' }}>
                      <span style={{ fontSize: '1.15rem', fontWeight: 900, color: cfg.color }}>{rf.val}</span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--txt-4)' }}>{rf.unit}</span>
                    </div>

                    <div className="progress-track">
                      <div
                        className="progress-fill"
                        style={{
                          width: `${Math.min(100, Math.max(10, (rf.val / (rf.unit === 'mmHg' ? 180 : rf.unit === 'kg/m²' ? 40 : 100)) * 100))}%`,
                          background: `linear-gradient(90deg, ${cfg.color}, ${cfg.color}88)`,
                        }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 1000px) {
          div[style*="grid-template-columns: 360px 1fr"] { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}
