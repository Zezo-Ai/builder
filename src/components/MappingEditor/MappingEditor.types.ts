import { Mapping } from '@dcl/schemas'

export type Props = {
  mapping: Mapping
  loading?: boolean
  isCompact?: boolean
  error?: string
  disabled?: boolean
  onChange: (mapping: Mapping) => void
}