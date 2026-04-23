declare module 'galactik-design-react/components/electrons/Tab/Tab' {
  import type { ButtonHTMLAttributes, ReactNode } from 'react'

  export interface GalactikTabProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'inner'
    size?: 'sm' | 'md'
    active?: boolean
    disabled?: boolean
    icon?: unknown
    badge?: number
    onClose?: (event: unknown) => void
    children?: ReactNode
    className?: string
  }

  const Tab: (props: GalactikTabProps) => JSX.Element
  export default Tab
}
