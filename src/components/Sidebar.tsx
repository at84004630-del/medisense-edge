import { NavLink, Link } from 'react-router-dom'
import {
  Activity, Brain, ImageIcon, Pill, ShieldCheck, Cpu,
  Zap, Lock, Gauge, ChevronRight, PanelLeftClose
} from 'lucide-react'
import MediSenseLogo from './MediSenseLogo'
import './Sidebar.css'

interface SidebarProps {
  isOpen: boolean
  onToggle: () => void
}

const navItems = [
  { to: '/',         icon: Activity,    label: 'Dashboard',         sub: 'Clinical Overview',   model: 'Live',     keyHint: '1', color: 'cyan',   hex: '#0066CC' },
  { to: '/symptoms', icon: Brain,       label: 'Symptom AI',        sub: 'Phi-3.5 Mini · NPU',  model: 'LLM',      keyHint: '2', color: 'purple', hex: '#4F46E5' },
  { to: '/imaging',  icon: ImageIcon,   label: 'Image Diagnostics', sub: 'ResNet-50 · Vision',  model: 'Vision',   keyHint: '3', color: 'green',  hex: '#00A693' },
  { to: '/drugs',    icon: Pill,        label: 'Drug Checker',      sub: 'BioBERT · NLP',       model: 'BioBERT',  keyHint: '4', color: 'amber',  hex: '#D97706' },
  { to: '/risk',     icon: ShieldCheck, label: 'Risk Profile',      sub: 'AI Risk Engine',      model: 'ASCVD',    keyHint: '5', color: 'red',    hex: '#EF4444' },
  { to: '/models',   icon: Cpu,         label: 'AI Model Hub',      sub: 'Qualcomm AI Hub',     model: '45 TOPS',  keyHint: '6', color: 'blue',   hex: '#4F46E5' },
]

export default function Sidebar({ isOpen, onToggle }: SidebarProps) {
  return (
    <aside
      className={`sidebar ${isOpen ? 'sidebar-open' : 'sidebar-closed'}`}
      aria-label="Clinical Navigation Sidebar"
    >
      {/* Ambient background glow */}
      <div className="sidebar-glow" />

      {/* ── Brand Logo Header & Slide-Close Toggle ── */}
      <div className="sidebar-header-row">
        <Link to="/" className="sidebar-logo-link" title="MediSense Edge — On-Device Medical AI">
          <MediSenseLogo size="sm" showSubtitle={true} showBadge={true} />
        </Link>
        <button
          className="sidebar-slide-toggle"
          onClick={onToggle}
          title="Slide close sidebar (Ctrl+B)"
          aria-label="Collapse sidebar"
        >
          <PanelLeftClose size={16} />
        </button>
      </div>

      {/* ── Privacy Status Pill ── */}
      <div className="privacy-pill" title="Hardware Enforced: No cloud sockets or telemetry allowed">
        <span className="status-dot live" />
        <Lock size={11} />
        <span>100% On-Device · Zero Cloud</span>
      </div>

      {/* ── Navigation Group ── */}
      <nav className="sidebar-nav">
        <div className="nav-header-row">
          <span className="nav-label-group">Clinical Intelligence</span>
          <span className="nav-hotkey-label">KEYS</span>
        </div>

        {navItems.map(({ to, icon: Icon, label, sub, model, keyHint, hex }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) => `nav-item ${isActive ? 'nav-active' : ''}`}
            style={({ isActive }) => isActive ? { '--nav-color': hex } as React.CSSProperties : {}}
          >
            {({ isActive }) => (
              <>
                <span
                  className="nav-item-icon"
                  style={
                    isActive
                      ? { color: '#ffffff', background: hex, borderColor: hex, boxShadow: `0 2px 10px ${hex}55` }
                      : { color: hex, background: `${hex}15`, borderColor: `${hex}30` }
                  }
                >
                  <Icon size={16} />
                </span>

                <span className="nav-item-text">
                  <span className="nav-item-label">{label}</span>
                  <div className="nav-item-sub-row">
                    <span className="nav-item-sub">{sub}</span>
                    <span
                      className="nav-item-badge"
                      style={isActive ? { background: `${hex}25`, color: hex, borderColor: `${hex}45` } : {}}
                    >
                      {model}
                    </span>
                  </div>
                </span>

                <span className="nav-keyhint" title={`Shortcut: Press ${keyHint}`}>{keyHint}</span>

                {isActive && (
                  <span className="nav-active-indicator" style={{ background: hex, boxShadow: `0 0 8px ${hex}` }} />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* ── Compact Snapdragon NPU Co-Processor Card ── */}
      <div className="npu-card">
        <div className="npu-card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Zap size={13} color="var(--blue)" />
            <span style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--txt-1)' }}>Hexagon NPU</span>
          </div>
          <span className="badge badge-green" style={{ fontSize: '0.62rem', padding: '0.08rem 0.42rem' }}>
            <span className="status-dot live" style={{ marginRight: 3 }} />
            45 TOPS
          </span>
        </div>

        <div className="npu-bars">
          <div className="npu-bar-row">
            <span>NPU</span>
            <div className="npu-bar-track">
              <div className="npu-bar-fill npu-bar-active" style={{ width: '42%' }} />
            </div>
            <span className="font-mono">42%</span>
          </div>
          <div className="npu-bar-row">
            <span>RAM</span>
            <div className="npu-bar-track">
              <div className="npu-bar-fill npu-bar-ram" style={{ width: '28%' }} />
            </div>
            <span className="font-mono">3.4G</span>
          </div>
        </div>

        <Link to="/models" className="npu-bench-btn" title="Open NPU Benchmark Suite">
          <Gauge size={12} />
          <span>NPU Benchmark Suite</span>
          <ChevronRight size={12} style={{ marginLeft: 'auto' }} />
        </Link>
      </div>

      {/* ── Sub-Footer Hardware Build ── */}
      <div className="sidebar-footer-info">
        <span>Snapdragon X Elite</span>
        <span className="font-mono" style={{ color: 'var(--blue)' }}>v2.4</span>
      </div>
    </aside>
  )
}
