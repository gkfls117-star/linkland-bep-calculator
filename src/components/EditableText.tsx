import { useState } from "react"

type EditableTextProps = {
  readonly value: string
  readonly ariaLabel: string
  readonly className?: string
  readonly inputClassName?: string
  readonly truncate?: boolean
  readonly onChange: (value: string) => void
}

export const EditableText = ({
  value,
  ariaLabel,
  className = "",
  inputClassName = "",
  truncate = true,
  onChange,
}: EditableTextProps) => {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value)

  const save = (): void => {
    const next = draft.trim()
    onChange(next.length > 0 ? next : value)
    setEditing(false)
  }

  if (editing) {
    return (
      <input
        aria-label={ariaLabel}
        autoFocus={true}
        className={`rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-[#1f2937] outline-none focus:border-[#111827] ${inputClassName}`}
        value={draft}
        onBlur={save}
        onChange={(event) => setDraft(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") save()
          if (event.key === "Escape") {
            setDraft(value)
            setEditing(false)
          }
        }}
      />
    )
  }

  return (
    <button
      type="button"
      className={`${truncate ? "truncate" : ""} text-left text-sm text-[#4f4841] hover:text-[#111827] ${className}`}
      onClick={() => {
        setDraft(value)
        setEditing(true)
      }}
    >
      {value}
    </button>
  )
}
