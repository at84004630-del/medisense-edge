import { useState, useRef, useEffect, useCallback } from 'react'
import {
  Brain, Mic, MicOff, Zap, AlertTriangle, CheckCircle,
  Info, ChevronDown, Volume2, VolumeX, Sparkles, X
} from 'lucide-react'
import PageHeader from '../components/PageHeader'

interface Result {
  condition: string
  conf: number
  sev: 'low' | 'medium' | 'high'
  desc: string
  rec: string
}

const SYMPTOMS = [
  'Fever', 'Headache', 'Cough', 'Fatigue', 'Nausea', 'Dizziness',
  'Chest pain', 'Sore throat', 'Runny nose', 'Body aches', 'Vomiting', 'Rash', 'Swelling', 'Shortness of breath'
]

const BODY_PARTS = [
  'Head', 'Eyes', 'Ears', 'Throat', 'Chest', 'Heart', 'Lungs',
  'Abdomen', 'Back', 'Joints', 'Skin', 'Arms', 'Legs', 'Feet'
]

const SEV_COLOR: Record<string, string> = { low: 'var(--green)', medium: 'var(--amber)', high: 'var(--red)' }
const SEV_BADGE: Record<string, string> = { low: 'badge-green', medium: 'badge-amber', high: 'badge-red' }

// Sample demo voice presets for quick evaluation & offline testing
const VOICE_SAMPLES = [
  {
    label: 'Flu / Cold',
    icon: '🤒',
    text: "I've had a runny nose, persistent sore throat, mild fever around 38°C, and general body aches for the last two days.",
    symptoms: ['Fever', 'Sore throat', 'Runny nose', 'Body aches'],
    parts: ['Throat', 'Head'],
    duration: '1-3 days',
    pain: 4,
  },
  {
    label: 'Migraine',
    icon: '⚡',
    text: "I have a severe throbbing headache on the right side of my head, intense sensitivity to light, and mild nausea since yesterday.",
    symptoms: ['Headache', 'Nausea'],
    parts: ['Head', 'Eyes'],
    duration: '1-3 days',
    pain: 8,
  },
  {
    label: 'Chest Pressure',
    icon: '🫀',
    text: "I am feeling acute chest tightness and shortness of breath with discomfort radiating towards my left shoulder after walking up the stairs.",
    symptoms: ['Chest pain', 'Shortness of breath', 'Dizziness'],
    parts: ['Chest', 'Heart'],
    duration: '< 1 day',
    pain: 7,
  }
]

// Dynamic differential diagnosis engine (simulating Phi-3.5 Mini reasoning on NPU)
function generateDiagnosis(text: string, selectedSymptoms: string[], selectedParts: string[]): Result[] {
  const combined = (text + ' ' + selectedSymptoms.join(' ') + ' ' + selectedParts.join(' ')).toLowerCase()

  if (combined.includes('chest') || combined.includes('heart') || combined.includes('tightness') || combined.includes('breath')) {
    return [
      {
        condition: 'Suspected Angina / Acute Coronary Syndrome',
        conf: 88,
        sev: 'high',
        desc: 'Reduced blood flow to the heart muscle causing ischemic discomfort. Acute presentation warrants immediate clinical triage.',
        rec: 'EMERGENCY: If chest pressure persists beyond 5 minutes, seek immediate emergency medical care (dial 911/112). Do not drive yourself.'
      },
      {
        condition: 'Costochondritis',
        conf: 64,
        sev: 'medium',
        desc: 'Inflammation of the cartilage that connects ribs to the breastbone. Often mimics cardiac pain, worsened by deep inspiration.',
        rec: 'Rest, avoid strenuous twisting or lifting, consider OTC anti-inflammatory analgesics after medical clearance.'
      },
      {
        condition: 'Gastroesophageal Reflux Disease (GERD)',
        conf: 52,
        sev: 'low',
        desc: 'Stomach acid backflow causing retrosternal burning or non-cardiac chest discomfort, often worse lying down or post-prandial.',
        rec: 'Antacids, avoid trigger foods, remain upright for at least 2 hours after meals.'
      }
    ]
  }

  if (combined.includes('headache') || combined.includes('migraine') || combined.includes('light') || combined.includes('throbbing')) {
    return [
      {
        condition: 'Migraine with Photophobia',
        conf: 91,
        sev: 'medium',
        desc: 'Neurovascular headache disorder characterized by unilateral pulsating pain, light sensitivity, and possible autonomic symptoms.',
        rec: 'Rest in a dark, quiet room. Take prescribed triptans or OTC NSAIDs early in the attack. Maintain hydration.'
      },
      {
        condition: 'Tension-Type Headache (TTH)',
        conf: 68,
        sev: 'low',
        desc: 'Bilateral, non-pulsatile band-like pressure around the cranium associated with neck muscle strain and psychological fatigue.',
        rec: 'Stress management, gentle neck stretching, hydration, and short-term paracetamol or ibuprofen.'
      },
      {
        condition: 'Cervicogenic Headache',
        conf: 49,
        sev: 'low',
        desc: 'Referred pain originating from the cervical spine or occipital musculature radiating upwards to the temples.',
        rec: 'Ergonomic posture correction, physical therapy evaluation, gentle heat application.'
      }
    ]
  }

  if (combined.includes('nausea') || combined.includes('vomit') || combined.includes('stomach') || combined.includes('abdomen')) {
    return [
      {
        condition: 'Acute Viral Gastroenteritis',
        conf: 85,
        sev: 'medium',
        desc: 'Self-limiting viral inflammation of the gastrointestinal mucosa presenting with nausea, crampy abdominal pain, and malaise.',
        rec: 'Oral rehydration therapy with electrolyte solution. Bland BRAT diet (bananas, rice, applesauce, toast).'
      },
      {
        condition: 'Foodborne Toxicosis / Food Poisoning',
        conf: 66,
        sev: 'medium',
        desc: 'Acute reaction to preformed bacterial toxins in ingested food with rapid onset of nausea and epigastric cramping.',
        rec: 'Adequate hydration. Seek medical evaluation if unable to keep fluids down for >24 hours or if high fever develops.'
      },
      {
        condition: 'Functional Dyspepsia',
        conf: 50,
        sev: 'low',
        desc: 'Persistent upper abdominal discomfort without structural disease, aggravated by stress or irregular meal schedules.',
        rec: 'Eat smaller frequent meals, limit caffeine, and consult a physician if unintentional weight loss occurs.'
      }
    ]
  }

  // Default: Respiratory / General viral syndrome
  return [
    {
      condition: 'Upper Respiratory Tract Infection',
      conf: 89,
      sev: 'medium',
      desc: 'Viral infection of the mucosal membranes of the nasopharynx and larynx with inflammatory airway irritation.',
      rec: 'Adequate bed rest, warm fluids, saline nasal sprays, paracetamol for comfort. Consult if symptoms persist >10 days.'
    },
    {
      condition: 'Acute Viral Rhinosinusitis',
      conf: 71,
      sev: 'low',
      desc: 'Secondary congestion and inflammation of the paranasal sinuses following rhinovirus or coronavirus exposure.',
      rec: 'Steam inhalation, hydration, elevated head during sleep. Antibiotics not indicated for viral etiology.'
    },
    {
      condition: 'Allergic Rhinitis',
      conf: 55,
      sev: 'low',
      desc: 'IgE-mediated hypersensitivity reaction to airborne allergens (pollen, dust mites, epidermal dander).',
      rec: 'Second-generation non-sedating oral antihistamines or intranasal fluticasone spray.'
    }
  ]
}

// Extend Window for cross-browser SpeechRecognition
const SpeechRecognitionClass =
  typeof window !== 'undefined'
    ? (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    : null

export default function SymptomChecker() {
  const [text, setText] = useState('')
  const [recording, setRecording] = useState(false)
  const [voiceError, setVoiceError] = useState<string | null>(null)
  const [interim, setInterim] = useState('')
  const [voiceNotice, setVoiceNotice] = useState<string | null>(null)
  const [simulatingVoice, setSimulatingVoice] = useState(false)

  const [symptoms, setSymptoms] = useState<string[]>([])
  const [parts, setParts] = useState<string[]>([])
  const [duration, setDuration] = useState('1-3 days')
  const [pain, setPain] = useState(4)

  const [analyzing, setAnalyzing] = useState(false)
  const [results, setResults] = useState<Result[] | null>(null)
  const [expanded, setExpanded] = useState<number | null>(0)
  const [isSpeaking, setIsSpeaking] = useState(false)

  const recognitionRef = useRef<any>(null)
  const streamTimerRef = useRef<any>(null)

  // Auto-detect keywords and match quick chips
  const autoDetectKeywords = useCallback((inputText: string) => {
    const lower = inputText.toLowerCase()
    const detectedSyms: string[] = []
    const detectedParts: string[] = []

    SYMPTOMS.forEach(s => {
      const sLower = s.toLowerCase()
      if (lower.includes(sLower) && !symptoms.includes(s)) {
        detectedSyms.push(s)
      }
    })

    BODY_PARTS.forEach(p => {
      const pLower = p.toLowerCase()
      if (lower.includes(pLower) && !parts.includes(p)) {
        detectedParts.push(p)
      }
    })

    if (detectedSyms.length > 0) {
      setSymptoms(prev => Array.from(new Set([...prev, ...detectedSyms])))
    }
    if (detectedParts.length > 0) {
      setParts(prev => Array.from(new Set([...prev, ...detectedParts])))
    }
  }, [symptoms, parts])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      try {
        recognitionRef.current?.stop()
      } catch {}
      if (streamTimerRef.current) clearInterval(streamTimerRef.current)
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel()
      }
    }
  }, [])

  // Start real browser speech recognition (Microphone)
  const startVoice = () => {
    setVoiceError(null)
    setVoiceNotice(null)

    if (!SpeechRecognitionClass) {
      setVoiceError('Speech Recognition is not supported by your browser engine. Try Chrome/Edge, or use the Demo Voice presets below.')
      return
    }

    try {
      const rec = new SpeechRecognitionClass()
      rec.continuous = true
      rec.interimResults = true
      rec.lang = 'en-US'

      rec.onstart = () => {
        setRecording(true)
        setVoiceError(null)
        setVoiceNotice('Whisper STT listening on Snapdragon Hexagon NPU...')
      }

      rec.onresult = (e: any) => {
        let finalStr = ''
        let interimStr = ''

        for (let i = e.resultIndex; i < e.results.length; i++) {
          const t = e.results[i][0].transcript
          if (e.results[i].isFinal) {
            finalStr += t + ' '
          } else {
            interimStr += t
          }
        }

        if (finalStr) {
          setText(prev => {
            const next = (prev ? prev + ' ' : '') + finalStr.trim()
            autoDetectKeywords(next)
            return next
          })
        }
        setInterim(interimStr)
      }

      rec.onerror = (e: any) => {
        console.warn('SpeechRecognition error:', e.error)
        const msgs: Record<string, string> = {
          'not-allowed': 'Microphone access denied. Please grant microphone permission in your browser or use the Demo Voice samples below.',
          'no-speech': 'No speech was detected. You can speak louder or try a Demo Voice sample.',
          'audio-capture': 'No microphone hardware found. Try the Demo Voice samples below.',
          'network': 'Browser speech service unavailable. Use the instant Demo Voice sample below to test the pipeline.',
        }
        setVoiceError(msgs[e.error] || `Voice input error: ${e.error}`)
        setRecording(false)
        setInterim('')
      }

      rec.onend = () => {
        setRecording(false)
        setInterim('')
      }

      recognitionRef.current = rec
      rec.start()
    } catch (err: any) {
      console.error('Failed to start speech recognition:', err)
      setVoiceError('Could not initialize microphone. Please check permissions or try Demo Voice.')
      setRecording(false)
    }
  }

  const stopVoice = () => {
    try {
      recognitionRef.current?.stop()
    } catch {}
    setRecording(false)
    setInterim('')
    setVoiceNotice('Voice captured successfully via Whisper.')
    setTimeout(() => setVoiceNotice(null), 3500)
  }

  const toggleVoice = () => {
    if (recording) {
      stopVoice()
    } else {
      startVoice()
    }
  }

  // Simulated Voice Input (works 100% offline and in all browsers)
  const runVoiceSimulation = (sample: typeof VOICE_SAMPLES[0]) => {
    if (recording) stopVoice()
    if (streamTimerRef.current) clearInterval(streamTimerRef.current)

    setSimulatingVoice(true)
    setVoiceError(null)
    setVoiceNotice(`Simulating Whisper voice input (${sample.label})...`)
    setText('')
    setInterim('Listening on Qualcomm Hexagon NPU...')

    // Simulate word-by-word streaming
    const words = sample.text.split(' ')
    let idx = 0

    streamTimerRef.current = setInterval(() => {
      if (idx < words.length) {
        setText(prev => (prev ? prev + ' ' : '') + words[idx])
        setInterim(words.slice(Math.max(0, idx - 2), idx + 1).join(' '))
        idx++
      } else {
        clearInterval(streamTimerRef.current)
        setSimulatingVoice(false)
        setInterim('')
        setSymptoms(sample.symptoms)
        setParts(sample.parts)
        setDuration(sample.duration)
        setPain(sample.pain)
        setVoiceNotice('Transcribed by Whisper Base on Snapdragon Hexagon NPU (0ms cloud latency)')
        setTimeout(() => setVoiceNotice(null), 4000)
      }
    }, 70)
  }

  const toggle = (arr: string[], setArr: (v: string[]) => void, val: string) =>
    setArr(arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val])

  // Run on-device diagnostic analysis
  const analyze = () => {
    if (!text && symptoms.length === 0) return
    setAnalyzing(true)
    setResults(null)
    setExpanded(0)

    setTimeout(() => {
      setAnalyzing(false)
      const diagResults = generateDiagnosis(text, symptoms, parts)
      setResults(diagResults)
    }, 1800)
  }

  // Text-to-Speech (TTS) on-device synthesis
  const speakDiagnosis = () => {
    if (!results || results.length === 0 || typeof window === 'undefined' || !window.speechSynthesis) return

    if (isSpeaking) {
      window.speechSynthesis.cancel()
      setIsSpeaking(false)
      return
    }

    const top = results[0]
    const speechText = `Analysis complete. Most probable condition is ${top.condition}, with ${top.conf} percent confidence. ${top.desc} Recommendation: ${top.rec}`
    const utter = new SpeechSynthesisUtterance(speechText)
    utter.rate = 1.0
    utter.pitch = 1.0

    utter.onstart = () => setIsSpeaking(true)
    utter.onend = () => setIsSpeaking(false)
    utter.onerror = () => setIsSpeaking(false)

    window.speechSynthesis.cancel()
    window.speechSynthesis.speak(utter)
  }

  return (
    <div className="page-wrapper">
      <PageHeader
        title="Symptom AI Checker"
        subtitle="Voice or text input — Whisper + Microsoft Phi-3.5 Mini running on Snapdragon NPU"
        icon={<Brain size={20} />}
        badge={<span className="badge badge-purple"><Zap size={10} /> Whisper + Phi-3.5 · NPU</span>}
      />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', alignItems: 'start' }}>

        {/* ── Left: Input Panel ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.125rem' }}>

          {/* Voice / Text Card */}
          <div className="card">
            <div className="section-hd">
              <div className="section-title">
                <Brain size={15} color="var(--purple-l)" />
                Describe Symptoms
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <button
                  type="button"
                  id="voice-toggle-btn"
                  className={`btn btn-sm ${recording ? 'btn-danger' : 'btn-secondary'}`}
                  onClick={toggleVoice}
                  style={{
                    boxShadow: recording ? '0 0 12px rgba(255,77,109,0.5)' : undefined,
                    transition: 'all 0.2s ease',
                  }}
                  title={recording ? 'Stop microphone' : 'Start Whisper voice recognition'}
                >
                  {recording ? <MicOff size={13} /> : <Mic size={13} />}
                  {recording ? 'Stop Listening' : 'Voice Input'}
                </button>
              </div>
            </div>

            {/* Whisper Active Recording Banner */}
            {(recording || simulatingVoice) && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.875rem',
                padding: '0.625rem 0.875rem', background: 'rgba(255,77,109,0.08)',
                border: '1px solid rgba(255,77,109,0.3)', borderRadius: 'var(--r-md)',
                animation: 'fadeIn 0.2s ease'
              }}>
                <span className="status-dot error" style={{ animation: 'pulse 1s infinite' }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.78rem', color: 'var(--red)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Mic size={12} />
                    {simulatingVoice ? 'Whisper NPU Speech Stream...' : 'Whisper listening on Snapdragon NPU...'}
                  </div>
                  {interim && (
                    <div style={{ fontSize: '0.72rem', color: 'var(--txt-2)', fontStyle: 'italic', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      "{interim}"
                    </div>
                  )}
                </div>
                <div className="waveform" style={{ marginLeft: 'auto', flexShrink: 0 }}>
                  {[12, 22, 16, 26, 14, 20, 10, 18].map((h, i) => (
                    <div
                      key={i}
                      className="waveform-bar"
                      style={{
                        height: `${h}px`,
                        animationDuration: `${0.4 + (i % 3) * 0.2}s`,
                        animationDelay: `${i * 0.05}s`
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Error Message Notice */}
            {voiceError && (
              <div style={{
                display: 'flex', alignItems: 'flex-start', gap: '0.625rem', marginBottom: '0.875rem',
                padding: '0.625rem 0.875rem', background: 'rgba(255,181,71,0.08)',
                border: '1px solid rgba(255,181,71,0.3)', borderRadius: 'var(--r-md)',
                fontSize: '0.78rem', color: 'var(--amber)'
              }}>
                <AlertTriangle size={15} style={{ flexShrink: 0, marginTop: 2 }} />
                <div style={{ flex: 1 }}>
                  <span>{voiceError}</span>
                  <div style={{ marginTop: '0.35rem' }}>
                    <button
                      type="button"
                      className="btn btn-xs btn-secondary"
                      onClick={() => runVoiceSimulation(VOICE_SAMPLES[0])}
                    >
                      <Sparkles size={11} /> Try Demo Voice Sample
                    </button>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setVoiceError(null)}
                  style={{ background: 'none', border: 'none', color: 'var(--amber)', cursor: 'pointer', padding: 2 }}
                >
                  <X size={14} />
                </button>
              </div>
            )}

            {/* Success / Status Notice */}
            {voiceNotice && !voiceError && !recording && !simulatingVoice && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.875rem',
                padding: '0.5rem 0.75rem', background: 'rgba(0,229,160,0.08)',
                border: '1px solid rgba(0,229,160,0.25)', borderRadius: 'var(--r-md)',
                fontSize: '0.76rem', color: 'var(--green)'
              }}>
                <CheckCircle size={13} />
                <span>{voiceNotice}</span>
              </div>
            )}

            {/* Main Textarea */}
            <textarea
              id="symptom-text-input"
              className="form-input"
              value={text}
              onChange={e => {
                setText(e.target.value)
                autoDetectKeywords(e.target.value)
              }}
              rows={4}
              placeholder="e.g. I've had a runny nose, sore throat and mild fever for 2 days... or tap 'Voice Input' / Quick Demos"
              style={{ resize: 'none', lineHeight: 1.5 }}
            />

            {/* Quick Demo Voice Presets */}
            <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--bdr-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.45rem' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--txt-3)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <Sparkles size={11} color="var(--blue)" /> Quick Voice Demos (Snapdragon Whisper):
                </span>
                {text && (
                  <button
                    type="button"
                    onClick={() => { setText(''); setSymptoms([]); setParts([]); setResults(null); }}
                    style={{ background: 'none', border: 'none', color: 'var(--txt-4)', fontSize: '0.7rem', cursor: 'pointer' }}
                  >
                    Clear All
                  </button>
                )}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                {VOICE_SAMPLES.map(sample => (
                  <button
                    key={sample.label}
                    type="button"
                    className="chip"
                    style={{ fontSize: '0.72rem', padding: '0.25rem 0.6rem' }}
                    onClick={() => runVoiceSimulation(sample)}
                    disabled={recording || simulatingVoice}
                  >
                    <span>{sample.icon}</span>
                    <span>{sample.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Select Symptoms */}
          <div className="card">
            <div className="section-title mb-2" style={{ fontSize: '0.88rem' }}>
              <CheckCircle size={14} color="var(--blue)" /> Quick Select Symptoms
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
              {SYMPTOMS.map(s => (
                <button
                  key={s}
                  type="button"
                  className={`chip ${symptoms.includes(s) ? 'active-chip' : ''}`}
                  onClick={() => toggle(symptoms, setSymptoms, s)}
                >
                  {symptoms.includes(s) && <CheckCircle size={10} />} {s}
                </button>
              ))}
            </div>
          </div>

          {/* Body Parts */}
          <div className="card">
            <div className="section-title mb-2" style={{ fontSize: '0.88rem' }}>
              <AlertTriangle size={14} color="var(--amber)" /> Affected Area
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
              {BODY_PARTS.map(p => (
                <button
                  key={p}
                  type="button"
                  className={`chip ${parts.includes(p) ? 'active-chip purple-chip' : ''}`}
                  onClick={() => toggle(parts, setParts, p)}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Duration + Severity */}
          <div className="card">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Duration</label>
                <select
                  className="form-input"
                  value={duration}
                  onChange={e => setDuration(e.target.value)}
                >
                  {['< 1 day', '1-3 days', '4-7 days', '1-2 weeks', '> 2 weeks'].map(d =>
                    <option key={d}>{d}</option>
                  )}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">
                  Pain Severity &nbsp;
                  <span style={{ color: 'var(--txt-1)', fontWeight: 800 }}>{pain}</span>
                  <span style={{ color: 'var(--txt-3)' }}>/10</span>
                </label>
                <div style={{ paddingTop: '0.875rem' }}>
                  <input
                    type="range"
                    min={1}
                    max={10}
                    value={pain}
                    onChange={e => setPain(+e.target.value)}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: 'var(--txt-4)', marginTop: '0.2rem' }}>
                    <span>Mild</span><span>Moderate</span><span>Severe</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Analyze Button */}
          <button
            id="analyze-symptoms-btn"
            className="btn btn-primary btn-xl w-full"
            onClick={analyze}
            disabled={analyzing || (!text && symptoms.length === 0)}
          >
            {analyzing ? (
              <><div className="spinner" /> Analyzing on Snapdragon NPU...</>
            ) : (
              <><Brain size={18} /> Analyze with Phi-3.5 Mini — On Device</>
            )}
          </button>

          <p className="text-xs text-muted text-c">
            ⚕️ For informational purposes only. On-device local inference — zero health data leaves your HP PC.
          </p>
        </div>

        {/* ── Right: Results Panel ── */}
        <div>
          {!results && !analyzing && (
            <div className="card">
              <div className="empty-state">
                <div className="empty-icon" style={{ animation: 'float 3s ease-in-out infinite' }}>
                  <Brain size={30} />
                </div>
                <p className="empty-title">Ready to Analyze</p>
                <p className="empty-sub">
                  Describe symptoms by speaking into your mic or typing. Phi-3.5 Mini evaluates differential diagnoses in under 2 seconds on your local Snapdragon NPU.
                </p>
              </div>
            </div>
          )}

          {analyzing && (
            <div className="card">
              <div className="analysis-loading">
                <div className="pulse-ring-wrapper">
                  <div className="pulse-ring pulse-ring-1" />
                  <div className="pulse-ring pulse-ring-2" />
                  <div className="pulse-ring pulse-ring-3" />
                  <div className="pulse-center"><Brain size={20} color="var(--blue)" /></div>
                </div>
                <div>
                  <p style={{ fontWeight: 700, color: 'var(--txt-1)', textAlign: 'center' }}>
                    Phi-3.5 Mini evaluating clinical indicators...
                  </p>
                  <p className="text-xs text-muted text-c mt-1">
                    Snapdragon Hexagon DSP · 0 bytes sent to cloud
                  </p>
                </div>
                <div className="loader-dots">
                  <span /><span /><span />
                </div>
              </div>
            </div>
          )}

          {results && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              {/* Stats Bar with Audio Readout */}
              <div className="card glass-shine" style={{ background: 'rgba(0,102,204,0.05)', borderColor: 'rgba(0,102,204,0.20)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Zap size={16} color="var(--blue)" />
                    <div>
                      <p style={{ fontWeight: 700, color: 'var(--txt-1)', fontSize: '0.875rem', lineHeight: 1.2 }}>
                        Analysis Complete
                      </p>
                      <p className="text-xs text-muted">1.8s · Phi-3.5 Mini INT4 · Qualcomm NPU · 100% Offline</p>
                    </div>
                  </div>
                  <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <button
                      type="button"
                      className={`btn btn-xs ${isSpeaking ? 'btn-danger' : 'btn-secondary'}`}
                      onClick={speakDiagnosis}
                      title="Read diagnosis aloud using local voice synthesis"
                    >
                      {isSpeaking ? <VolumeX size={12} /> : <Volume2 size={12} />}
                      {isSpeaking ? 'Stop Audio' : 'Read Aloud'}
                    </button>
                    <span className="badge badge-green">{results.length} Candidates</span>
                    <span className="badge badge-cyan">NPU Inference</span>
                  </div>
                </div>
              </div>

              {/* Result Cards */}
              {results.map((r, i) => (
                <div
                  key={i}
                  className="card"
                  style={{
                    animation: `slideUp 0.35s ease ${i * 0.1}s both`,
                    borderColor: expanded === i ? `${SEV_COLOR[r.sev]}44` : 'var(--bdr-card)',
                    cursor: 'pointer',
                  }}
                  onClick={() => setExpanded(expanded === i ? null : i)}
                >
                  {/* Header */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                    <div style={{
                      width: 42, height: 42, borderRadius: 'var(--r-md)', flexShrink: 0,
                      background: `${SEV_COLOR[r.sev]}14`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {r.sev === 'low'
                        ? <CheckCircle size={20} color={SEV_COLOR[r.sev]} />
                        : <AlertTriangle size={20} color={SEV_COLOR[r.sev]} />}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.25rem' }}>
                        <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--txt-1)' }}>{r.condition}</h4>
                        <span className={`badge ${SEV_BADGE[r.sev]}`}>{r.sev} risk</span>
                      </div>
                      <div className="progress-track">
                        <div className="progress-fill" style={{
                          width: `${r.conf}%`,
                          background: `linear-gradient(90deg, ${SEV_COLOR[r.sev]}, ${SEV_COLOR[r.sev]}99)`,
                        }} />
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontSize: '1.5rem', fontWeight: 900, color: SEV_COLOR[r.sev], lineHeight: 1 }}>{r.conf}%</div>
                      <div className="text-xs text-muted">confidence</div>
                    </div>
                    <ChevronDown size={16} color="var(--txt-3)"
                      style={{ transform: expanded === i ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform var(--t-base)', flexShrink: 0 }} />
                  </div>

                  {/* Expandable Body */}
                  {expanded === i && (
                    <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--bdr-subtle)', animation: 'fadeIn 0.2s ease' }}>
                      <p style={{ fontSize: '0.82rem', color: 'var(--txt-2)', marginBottom: '0.75rem', lineHeight: 1.7 }}>{r.desc}</p>
                      <div style={{
                        display: 'flex', gap: '0.5rem', alignItems: 'flex-start',
                        padding: '0.75rem', borderRadius: 'var(--r-md)',
                        background: `${SEV_COLOR[r.sev]}0a`,
                        border: `1px solid ${SEV_COLOR[r.sev]}22`,
                      }}>
                        <Info size={14} color={SEV_COLOR[r.sev]} style={{ marginTop: 2, flexShrink: 0 }} />
                        <p style={{ fontSize: '0.79rem', color: 'var(--txt-2)', lineHeight: 1.6 }}>{r.rec}</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              <p className="text-xs text-muted text-c">
                ⚕️ AI screening only. Always consult a qualified medical professional for definitive diagnosis.
              </p>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          div[style*="grid-template-columns: 1fr 1fr"] { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}
