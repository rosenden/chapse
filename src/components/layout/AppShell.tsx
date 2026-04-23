import { useState, type ReactNode } from 'react'

interface AppShellProps {
  /** Header slot: logo, global nav, user avatar */
  header?: ReactNode
  /** Sidebar slot: navigation icons + labels */
  sidebar?: ReactNode
  /** Page header slot: h1, breadcrumb, page-level actions */
  pageHeader?: ReactNode
  /** Main content */
  children: ReactNode
  /** Sidebar mode. 'none' removes the sidebar entirely. Default: 'collapsible' */
  sidebarMode?: 'none' | 'always-mini' | 'collapsible'
  /** Visual theme for shell surface */
  theme?: 'light' | 'dark'
}

/**
 * Galactik Composition A — Header + Collapsible Sidebar + Panel.
 * Switch sidebarMode to 'always-mini' for Composition B,
 * or 'none' for Composition C (no sidebar).
 *
 * Panel border-radius is determined by sidebar PRESENCE, not open/close state.
 */
export function AppShell({
  header,
  sidebar,
  pageHeader,
  children,
  sidebarMode = 'collapsible',
  theme = 'light',
}: AppShellProps) {
  const [sidebarExpanded, setSidebarExpanded] = useState(false)

  const hasSidebar = sidebarMode !== 'none'

  const sidebarClass = [
    'sidebar',
    sidebarMode === 'always-mini'
      ? 'sidebar--mini'
      : sidebarExpanded
      ? 'sidebar--expanded'
      : 'sidebar--mini',
  ].join(' ')

  return (
    <div className={`app-shell app-shell--${theme}`}>
      {header && (
        <header className="app-header">
          {header}
          {sidebarMode === 'collapsible' && (
            <button
              aria-label={sidebarExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
              aria-expanded={sidebarExpanded}
              aria-controls="app-sidebar"
              onClick={() => setSidebarExpanded((v) => !v)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--font-primary-base)',
                padding: 'var(--spacing-xs)',
                borderRadius: 'var(--radius-sm)',
                lineHeight: 1,
                fontSize: 'var(--icon-l)',
              }}
            >
              {sidebarExpanded ? '←' : '→'}
            </button>
          )}
        </header>
      )}

      <div className="app-body">
        {hasSidebar && (
          <aside
            id="app-sidebar"
            className={sidebarClass}
            aria-label="Navigation principale"
          >
            {sidebar}
          </aside>
        )}

        <main className="main">
          <div className="main-surface">
            {pageHeader && <div className="page-header">{pageHeader}</div>}
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
