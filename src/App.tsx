import { useState, useEffect, useRef } from 'react'
import { BrowserRouter, Routes, Route, useLocation, useNavigate, Link } from 'react-router-dom'
import {
  Search, Command, Bell, Cpu, X, ChevronRight,
  Brain, ImageIcon, Pill, ShieldCheck, Activity,
  Sparkles, PanelLeftClose, PanelLeftOpen, Sun, Moon
} from 'lucide-react'
import Sidebar from './components/Sidebar'
import NPUStatusBar from './components/NPUStatusBar'
import MediSenseLogo from './components/MediSenseLogo'
import Dashboard from './pages/Dashboard'
import SymptomChecker from './pages/SymptomChecker'
import ImageDiagnostics from './pages/ImageDiagnostics'
import DrugChecker from './pages/DrugChecker'
import RiskProfile from './pages/RiskProfile'
import AIModels from './pages/AIModels'
import { ThemeProvider, useTheme } from './context/ThemeContext'
import './App.css'

const PAGE_TITLES: Record<string, { title: string; subtitle: string }> = {
  '/':         { title: 'Clinical Dashboard',   subtitle: 'Real-time On-Device AI Triage' },
  '/symptoms': { title: 'Symptom AI Copilot',   subtitle: 'Phi-3.5 Mini · NPU Reasoning' },
  '/imaging':  { title: 'Vision Diagnostics',   subtitle: 'ResNet-50 · Chest X-Ray & Dermoscopy' },
  '/drugs':    { title: 'Pharmacology Safety',  subtitle: 'BioBERT · CYP450 Interaction Engine' },
  '/risk':     { title: 'Multi-Organ Risk',     subtitle: 'ASCVD & Framingham 10-Yr Analysis' },
  '/models':   { title: 'AI Model Hub',         subtitle: 'Qualcomm AI Hub · Hexagon NPU Benchmark' },
}

interface CommandItem {
  id: string
  title: string
  category: 'Pages' | 'Triage Presets' | 'Diagnostic Scans' | 'Drug Checks'
  path: string
  icon: typeof Activity
  badge?: string
}

const COMMAND_ITEMS: CommandItem[] = [
  { id: 'p-dash',    title: 'Dashboard Overview',         category: 'Pages',            path: '/',         icon: Activity },
  { id: 'p-symp',    title: 'Symptom AI Copilot',         category: 'Pages',            path: '/symptoms', icon: Brain,       badge: 'Phi-3.5' },
  { id: 'p-img',     title: 'Image Diagnostics',          category: 'Pages',            path: '/imaging',  icon: ImageIcon,   badge: 'Vision' },
  { id: 'p-drug',    title: 'Drug Interaction Checker',   category: 'Pages',            path: '/drugs',    icon: Pill,        badge: 'BioBERT' },
  { id: 'p-risk',    title: 'Multi-Organ Risk Profile',   category: 'Pages',            path: '/risk',     icon: ShieldCheck, badge: 'ASCVD' },
  { id: 'p-models',  title: 'Qualcomm AI Models Hub',     category: 'Pages',            path: '/models',   icon: Cpu,         badge: '45 TOPS' },
  { id: 't-migraine',title: 'Triage: Migraine with Photophobia', category: 'Triage Presets', path: '/symptoms', icon: Brain, badge: 'NPU Fast' },
  { id: 't-chest',   title: 'Triage: Acute Chest Tightness & Angina', category: 'Triage Presets', path: '/symptoms', icon: Brain, badge: 'Emergency' },
  { id: 's-cxr',     title: 'Analyze: Bacterial Pneumonia X-Ray', category: 'Diagnostic Scans', path: '/imaging', icon: ImageIcon, badge: 'Grad-CAM' },
  { id: 's-skin',    title: 'Analyze: Melanoma vs Dysplastic Nevus', category: 'Diagnostic Scans', path: '/imaging', icon: ImageIcon, badge: 'Dermoscopy' },
  { id: 'd-warf',    title: 'Safety Check: Warfarin + Aspirin Bleed Risk', category: 'Drug Checks', path: '/drugs', icon: Pill, badge: 'Severe' },
  { id: 'd-metf',    title: 'Safety Check: Metformin + Ciprofloxacin Lactic Risk', category: 'Drug Checks', path: '/drugs', icon: Pill, badge: 'Moderate' },
]

function CommandPalette({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const navigate = useNavigate()
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => inputRef.current?.focus(), 50)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  const filtered = COMMAND_ITEMS.filter(item =>
    item.title.toLowerCase().includes(query.toLowerCase()) ||
    item.category.toLowerCase().includes(query.toLowerCase())
  )

  const handleQueryChange = (val: string) => {
    setQuery(val)
    setSelectedIndex(0)
  }

  const handleSelect = (item: CommandItem) => {
    navigate(item.path)
    onClose()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex(i => (i + 1) % (filtered.length || 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(i => (i - 1 + (filtered.length || 1)) % (filtered.length || 1))
    } else if (e.key === 'Enter' && filtered[selectedIndex]) {
      e.preventDefault()
      handleSelect(filtered[selectedIndex])
    } else if (e.key === 'Escape') {
      e.preventDefault()
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="cmd-backdrop" onClick={onClose}>
      <div className="cmd-modal" onClick={e => e.stopPropagation()} onKeyDown={handleKeyDown}>
        <div className="cmd-search-row">
          <Search size={18} color="var(--blue)" />
          <input
            ref={inputRef}
            type="text"
            className="cmd-input"
            placeholder="Search symptoms, scans, pharmacology, or AI models..."
            value={query}
            onChange={e => handleQueryChange(e.target.value)}
          />
          <button className="cmd-close-btn" onClick={onClose} aria-label="Close search">
            <X size={16} />
          </button>
        </div>

        <div className="cmd-list">
          {filtered.length === 0 ? (
            <div className="cmd-empty">No clinical features match "{query}"</div>
          ) : (
            filtered.map((item, idx) => {
              const Icon = item.icon
              const isSelected = idx === selectedIndex
              return (
                <div
                  key={item.id}
                  className={`cmd-item ${isSelected ? 'selected' : ''}`}
                  onClick={() => handleSelect(item)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                >
                  <div className="cmd-item-icon">
                    <Icon size={16} />
                  </div>
                  <div className="cmd-item-content">
                    <span className="cmd-item-title">{item.title}</span>
                    <span className="cmd-item-cat">{item.category}</span>
                  </div>
                  {item.badge && <span className="cmd-badge">{item.badge}</span>}
                  <ChevronRight size={14} className="cmd-arrow" />
                </div>
              )
            })
          )}
        </div>

        <div className="cmd-footer">
          <span><kbd>↑</kbd> <kbd>↓</kbd> to navigate</span>
          <span><kbd>↵</kbd> to select</span>
          <span><kbd>esc</kbd> to dismiss</span>
          <span style={{ marginLeft: 'auto', color: 'var(--blue)' }}>Snapdragon NPU Fast Index</span>
        </div>
      </div>
    </div>
  )
}

type RoleType = 'attending' | 'triage' | 'patient'

interface ClinicianProfile {
  name: string
  role: string
  level: string
  badge: string
  desc: string
  license: string
  avatar: string
  badgeColor: string
}

const CLINICIAN_ROLES: Record<RoleType, ClinicianProfile> = {
  attending: {
    name: 'Dr. Abhinav Tripathi, MD',
    role: 'Attending Physician',
    level: 'Level 3 · Full Neural AI',
    badge: 'Physician Level 3',
    desc: 'Authorized for emergency differential diagnoses, Grad-CAM attention heatmaps, and BioBERT drug contraindications.',
    license: 'MD-SNAPDRAGON-84920',
    avatar: 'AT',
    badgeColor: 'badge-cyan'
  },
  triage: {
    name: 'Nurse A. Tripathi, RN',
    role: 'Triage Specialist',
    level: 'Level 2 · Intake & Vitals',
    badge: 'Triage Level 2',
    desc: 'Authorized to record biometric vitals, conduct patient symptom intake, and escalate acute emergency cases.',
    license: 'RN-TRIAGE-2026.09',
    avatar: 'AT',
    badgeColor: 'badge-amber'
  },
  patient: {
    name: 'Abhinav Tripathi',
    role: 'Patient Self-Triage',
    level: 'Level 1 · Privacy Self-Care',
    badge: 'Patient Level 1',
    desc: 'Consumer mode with simplified clinical explanations, non-emergency care advice, and local symptom tracking.',
    license: 'LOCAL-OFFLINE-ID',
    avatar: 'AT',
    badgeColor: 'badge-green'
  }
}

interface TopBarProps {
  onOpenCommand: () => void
  onToggleSidebar: () => void
  sidebarOpen: boolean
}

function TopBar({ onOpenCommand, onToggleSidebar, sidebarOpen }: TopBarProps) {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { toggleTheme, isDark } = useTheme()
  const [showNotifications, setShowNotifications] = useState(false)
  const [showClinicianMenu, setShowClinicianMenu] = useState(false)
  const [activeRole, setActiveRole] = useState<RoleType>('attending')
  const [isLocked, setIsLocked] = useState(false)
  const pageMeta = PAGE_TITLES[pathname] ?? { title: 'MediSense Edge', subtitle: 'On-Device AI' }
  const profile = CLINICIAN_ROLES[activeRole]

  return (
    <header className="topbar">
      {/* ── Left: Sidebar Toggle + Brand + Breadcrumb ── */}
      <div className="topbar-left">
        <button
          className={`sidebar-toggle-btn ${sidebarOpen ? 'open' : 'closed'}`}
          onClick={onToggleSidebar}
          title={sidebarOpen ? 'Close sidebar (Ctrl+B)' : 'Open sidebar (Ctrl+B)'}
          aria-label="Toggle navigation sidebar"
        >
          {sidebarOpen ? <PanelLeftClose size={18} /> : <PanelLeftOpen size={18} />}
        </button>

        <Link to="/" className="topbar-brand-link" title="MediSense Edge Home">
          <MediSenseLogo size="sm" showSubtitle={false} showBadge={true} />
        </Link>

        <span className="topbar-sep-bar" />

        <div className="breadcrumb">
          <span className="breadcrumb-path">WORKSPACE</span>
          <span className="breadcrumb-sep">/</span>
          <span className="breadcrumb-active">{pageMeta.title}</span>
        </div>
      </div>

      {/* ── Center: Command Search ── */}
      <div className="topbar-center">
        <button className="topbar-search-trigger" onClick={onOpenCommand} title="Open Command Palette (Ctrl+K or /)">
          <Search size={14} color="var(--blue)" />
          <span className="topbar-search-text">Search symptoms, drugs, scans, risk models...</span>
          <span className="topbar-search-kbd">
            <Command size={10} style={{ display: 'inline' }} /> K
          </span>
        </button>
      </div>

      {/* ── Right: Actions + Theme Toggle + Clinician ── */}
      <div className="topbar-right">

        {/* Mobile search button */}
        <button className="mobile-search-btn" onClick={onOpenCommand} aria-label="Search">
          <Search size={16} />
        </button>

        {/* Quick Triage CTA */}
        <button
          className="topbar-action-pill"
          onClick={() => navigate('/symptoms')}
          title="Launch Symptom AI Copilot"
        >
          <Sparkles size={13} color="var(--blue)" />
          <span>New Triage</span>
        </button>

        {/* Snapdragon NPU chip */}
        <Link to="/models" className="topbar-hw-chip" title="Qualcomm Snapdragon X Elite Hexagon NPU — View Benchmarks">
          <Cpu size={14} color="var(--blue)" />
          <span className="topbar-hw-title">Snapdragon NPU</span>
          <span className="status-dot live" />
          <span className="topbar-hw-val">45 TOPS</span>
        </Link>

        {/* ── Theme Toggle ── */}
        <button
          className="theme-toggle"
          onClick={toggleTheme}
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          aria-label="Toggle theme"
        >
          <Sun size={16} className="icon-sun" />
          <Moon size={16} className="icon-moon" />
        </button>

        {/* Notifications */}
        <div style={{ position: 'relative' }}>
          <button
            className={`topbar-icon-btn ${showNotifications ? 'active' : ''}`}
            onClick={() => {
              setShowNotifications(s => !s)
              setShowClinicianMenu(false)
            }}
            title="System & Clinical Alerts"
            aria-label="Alerts"
          >
            <Bell size={16} />
            <span className="notif-badge">2</span>
          </button>

          {showNotifications && (
            <div className="topbar-notif-menu">
              <div className="notif-header">
                <span style={{ fontWeight: 700, fontSize: '0.82rem', color: 'var(--txt-1)' }}>Clinical Alerts</span>
                <span className="badge badge-green" style={{ fontSize: '0.65rem' }}>All On-Device</span>
              </div>
              <div className="notif-item">
                <div className="notif-dot green" />
                <div style={{ flex: 1 }}>
                  <p className="notif-text"><strong>Vision Diagnostics:</strong> Grad-CAM heatmap generated in 12ms on Hexagon NPU.</p>
                  <span className="notif-time">3m ago · ResNet-50</span>
                </div>
              </div>
              <div className="notif-item">
                <div className="notif-dot amber" />
                <div style={{ flex: 1 }}>
                  <p className="notif-text"><strong>Pharmacology Warning:</strong> High-risk interaction between Warfarin & Aspirin flagged.</p>
                  <span className="notif-time">15m ago · BioBERT</span>
                </div>
              </div>
              <div className="notif-footer">
                <span style={{ fontSize: '0.7rem', color: 'var(--txt-3)' }}>Encrypted local storage only</span>
                <button
                  style={{ background: 'transparent', border: 'none', color: 'var(--blue)', fontSize: '0.72rem', cursor: 'pointer', fontWeight: 600 }}
                  onClick={() => setShowNotifications(false)}
                >
                  Dismiss
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Clinician Profile */}
        <div style={{ position: 'relative' }}>
          <div
            className={`topbar-clinician ${showClinicianMenu ? 'active' : ''}`}
            onClick={() => {
              setShowClinicianMenu(s => !s)
              setShowNotifications(false)
            }}
            title="Click to view Clinician Security Credentials & Role Settings"
            role="button"
            tabIndex={0}
          >
            <div className="topbar-avatar">
              {profile.avatar}
              <span className={`avatar-status-dot ${isLocked ? 'locked' : ''}`} />
            </div>
            <div className="topbar-clinician-info">
              <span className="clinician-name">{profile.name}</span>
              <span className="clinician-role">{profile.level}</span>
            </div>
          </div>

          {showClinicianMenu && (
            <div className="clinician-dropdown-modal" onClick={e => e.stopPropagation()}>
              <div className="clinician-modal-hd">
                <div className="clinician-modal-avatar">
                  {profile.avatar}
                  <span className="avatar-status-dot" />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                    <h4 style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--txt-1)', margin: 0 }}>
                      {profile.name}
                    </h4>
                  </div>
                  <p style={{ fontSize: '0.72rem', color: 'var(--blue)', fontWeight: 600, margin: '0.15rem 0' }}>
                    {profile.role}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.35rem' }}>
                    <span className={`badge ${profile.badgeColor}`} style={{ fontSize: '0.62rem' }}>
                      {profile.badge}
                    </span>
                    <span style={{ fontSize: '0.65rem', color: 'var(--txt-4)', fontFamily: 'var(--mono)' }}>
                      LIC: {profile.license}
                    </span>
                  </div>
                </div>
              </div>

              <div style={{ padding: '0.85rem 1rem', borderBottom: '1px solid var(--bdr-subtle)' }}>
                <p style={{ fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--txt-3)', letterSpacing: '0.08em', marginBottom: '0.5rem' }}>
                  Switch Security Role & Clearance
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  {(['attending', 'triage', 'patient'] as RoleType[]).map(key => {
                    const r = CLINICIAN_ROLES[key]
                    const isSelected = activeRole === key
                    return (
                      <div
                        key={key}
                        className={`role-option-item ${isSelected ? 'selected' : ''}`}
                        onClick={() => setActiveRole(key)}
                      >
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: isSelected ? 'var(--blue)' : 'var(--txt-1)' }}>
                              {r.role}
                            </span>
                            <span style={{ fontSize: '0.62rem', fontFamily: 'var(--mono)', color: isSelected ? 'var(--blue)' : 'var(--txt-4)' }}>
                              {r.level.split('·')[0]}
                            </span>
                          </div>
                          <p style={{ fontSize: '0.67rem', color: 'var(--txt-3)', marginTop: '0.15rem', lineHeight: 1.35 }}>
                            {r.desc}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--bdr-subtle)', fontSize: '0.7rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                  <span style={{ color: 'var(--txt-3)' }}>Keystore Isolation:</span>
                  <span style={{ color: 'var(--green)', fontWeight: 700 }}>Snapdragon TrustZone 🟢</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                  <span style={{ color: 'var(--txt-3)' }}>Audit Compliance:</span>
                  <span style={{ color: 'var(--txt-1)' }}>HIPAA / GDPR (Air-Gapped)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--txt-3)' }}>Hardware Node:</span>
                  <span style={{ color: 'var(--blue)', fontFamily: 'var(--mono)' }}>Qualcomm Hexagon 45 TOPS</span>
                </div>
              </div>

              <div style={{ padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <button
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: '0.7rem', padding: '0.25rem 0.6rem' }}
                  onClick={() => setIsLocked(l => !l)}
                >
                  {isLocked ? '🔓 Unlock Session' : '🔒 Lock Station'}
                </button>
                <button
                  style={{ background: 'transparent', border: 'none', color: 'var(--txt-3)', fontSize: '0.72rem', cursor: 'pointer', fontWeight: 600 }}
                  onClick={() => setShowClinicianMenu(false)}
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

function AppInner() {
  const [commandOpen, setCommandOpen] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    if (typeof window === 'undefined') return true
    // Default closed on mobile
    if (window.innerWidth < 768) return false
    return localStorage.getItem('medisense_sidebar_open') !== 'false'
  })

  const isMobile = () => typeof window !== 'undefined' && window.innerWidth < 768

  const toggleSidebar = () => {
    setSidebarOpen(prev => {
      const next = !prev
      if (!isMobile()) {
        localStorage.setItem('medisense_sidebar_open', String(next))
      }
      return next
    })
  }

  // Close sidebar on mobile when route changes
  const location = useLocation()
  useEffect(() => {
    if (isMobile()) setSidebarOpen(false)
  }, [location.pathname])

  // Close sidebar on mobile resize to desktop
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 768) {
        const saved = localStorage.getItem('medisense_sidebar_open')
        setSidebarOpen(saved !== 'false')
      } else {
        setSidebarOpen(false)
      }
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  // Global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setCommandOpen(open => !open)
      } else if (e.key === '/' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault()
        setCommandOpen(true)
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault()
        toggleSidebar()
      } else if (e.key === '[' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault()
        toggleSidebar()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <div className={`app-layout ${sidebarOpen ? 'sidebar-expanded' : 'sidebar-collapsed'}`}>
      {/* Mobile sidebar overlay — tap to close */}
      {sidebarOpen && isMobile() && (
        <div
          className="sidebar-overlay visible"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close sidebar"
        />
      )}

      <Sidebar isOpen={sidebarOpen} onToggle={toggleSidebar} />

      <div className="main-content">
        <TopBar
          onOpenCommand={() => setCommandOpen(true)}
          onToggleSidebar={toggleSidebar}
          sidebarOpen={sidebarOpen}
        />
        <Routes>
          <Route path="/"         element={<Dashboard />} />
          <Route path="/symptoms" element={<SymptomChecker />} />
          <Route path="/imaging"  element={<ImageDiagnostics />} />
          <Route path="/drugs"    element={<DrugChecker />} />
          <Route path="/risk"     element={<RiskProfile />} />
          <Route path="/models"   element={<AIModels />} />
        </Routes>
        <NPUStatusBar />
        <CommandPalette key={commandOpen ? 'open' : 'closed'} isOpen={commandOpen} onClose={() => setCommandOpen(false)} />
      </div>
    </div>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AppInner />
      </BrowserRouter>
    </ThemeProvider>
  )
}
