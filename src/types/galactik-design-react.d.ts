declare module 'galactik-design-react/components/electrons' {
  import type { ComponentType } from 'react'
  type ElectronProps = Record<string, unknown>

  export const Avatar: ComponentType<ElectronProps>
  export const Button: ComponentType<ElectronProps>
  export const Checkbox: ComponentType<ElectronProps>
  export const Input: ComponentType<ElectronProps>
  export const Select: ComponentType<ElectronProps>
  export const Switch: ComponentType<ElectronProps>
  export const Toggle: ComponentType<ElectronProps>
  export const Tag: ComponentType<ElectronProps>
}

declare module 'galactik-design-react/components/atoms' {
  import type { ComponentType } from 'react'
  type AtomProps = Record<string, unknown>

  export const SplitButton: ComponentType<AtomProps>
}
