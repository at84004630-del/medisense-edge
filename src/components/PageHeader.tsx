import type { ReactNode } from 'react'

interface Props {
  title: string
  subtitle: string
  icon: ReactNode
  actions?: ReactNode
  badge?: ReactNode
}

export default function PageHeader({ title, subtitle, icon, actions, badge }: Props) {
  return (
    <div className="page-hd">
      <div className="page-hd-inner">
        <div className="page-hd-left">
          <div className="page-hd-icon">{icon}</div>
          <div>
            <h1 className="page-hd-title">{title}</h1>
            <p className="page-hd-sub">{subtitle}</p>
          </div>
        </div>
        {(actions || badge) && (
          <div className="page-hd-actions">
            {badge}
            {actions}
          </div>
        )}
      </div>
      <div className="page-hd-line" />
    </div>
  )
}
