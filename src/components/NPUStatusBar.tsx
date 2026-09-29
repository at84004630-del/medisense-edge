import { useState, useEffect } from 'react'
import { Cpu, Zap, Activity } from 'lucide-react'

export default function NPUStatusBar() {
  const [npu, setNpu] = useState(38)
  const [ms, setMs] = useState(24)
  const [fps, setFps] = useState(60)

  useEffect(() => {
    const t = setInterval(() => {
      setNpu(v => Math.max(15, Math.min(88, v + (Math.random() - 0.5) * 12)))
      setMs(v => Math.max(10, Math.min(90, v + (Math.random() - 0.5) * 10)))
      setFps(v => Math.max(55, Math.min(60, v + (Math.random() - 0.5) * 3)))
    }, 2500)
    return () => clearInterval(t)
  }, [])

  return (
    <div className="npu-float">
      <Cpu size={13} color="var(--cyan)" />
      <span style={{ color: 'var(--cyan)', fontWeight: 700 }}>NPU</span>
      <span className="status-dot live" />
      <span>{npu.toFixed(0)}%</span>

      <div className="npu-float-divider" />

      <Zap size={12} color="var(--amber)" />
      <span>{ms.toFixed(0)}<span style={{ color: 'var(--txt-3)', fontWeight: 500 }}>ms</span></span>

      <div className="npu-float-divider" />

      <Activity size={12} color="var(--green)" />
      <span>{fps.toFixed(0)}<span style={{ color: 'var(--txt-3)', fontWeight: 500 }}>fps</span></span>
    </div>
  )
}
