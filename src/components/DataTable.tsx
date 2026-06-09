import type { ReactNode } from "react"

export type DataColumn<T> = {
  readonly key: string
  readonly header: string
  readonly align?: "left" | "right" | "center"
  readonly render: (row: T) => ReactNode
}

type DataTableProps<T> = {
  readonly columns: readonly DataColumn<T>[]
  readonly rows: readonly T[]
  readonly getRowKey: (row: T) => string
  readonly emptyText: string
}

export const DataTable = <T,>({
  columns,
  rows,
  getRowKey,
  emptyText,
}: DataTableProps<T>) => (
  <div className="overflow-x-auto">
    <table className="w-full min-w-[720px] border-collapse text-sm">
      <thead>
        <tr className="border-b border-line bg-paper/70 text-xs text-steel">
          {columns.map((column) => (
            <th key={column.key} className={`px-3 py-2 text-${column.align ?? "left"}`}>
              {column.header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.length === 0 ? (
          <tr>
            <td colSpan={columns.length} className="px-3 py-6 text-center text-steel">
              {emptyText}
            </td>
          </tr>
        ) : (
          rows.map((row) => (
            <tr key={getRowKey(row)} className="border-b border-line/70 hover:bg-paper/60">
              {columns.map((column) => (
                <td key={column.key} className={`px-3 py-2 text-${column.align ?? "left"}`}>
                  {column.render(row)}
                </td>
              ))}
            </tr>
          ))
        )}
      </tbody>
    </table>
  </div>
)
