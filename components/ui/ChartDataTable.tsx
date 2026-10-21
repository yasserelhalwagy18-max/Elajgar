'use client';

import { useId, useState } from 'react';
import { ChevronDown, Table2 } from 'lucide-react';

/**
 * The text alternative for a chart.
 *
 * A chart drawn on a canvas is invisible to a screen reader, and the tooltip
 * that carries the numbers can only be reached with a pointer. This table
 * carries the same numbers as real text: it is collapsed by default so it
 * does not push the page around, and it can be opened with the keyboard or
 * with a tap.
 *
 * The values are already formatted for the reader - Persian digits and
 * Persian dates - so the table and the chart always agree.
 */
export function ChartDataTable({
  caption,
  columns,
  rows,
}: {
  /** A short description of what the table holds. */
  caption: string;
  /** The column headings. */
  columns: string[];
  /** One array of cell values per row. */
  rows: string[][];
}) {
  const [isOpen, setIsOpen] = useState(false);
  const captionId = useId();

  if (rows.length === 0) return null;

  return (
    <div className="mt-3">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-expanded={isOpen}
        aria-controls={captionId}
        className="inline-flex items-center gap-2 text-xs font-bold text-on-surface-variant hover:text-primary transition-colors py-1"
      >
        <Table2 className="w-4 h-4" aria-hidden="true" />
        {isOpen ? 'بستن جدول داده‌ها' : 'نمایش داده‌های نمودار به‌صورت جدول'}
        <ChevronDown
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          aria-hidden="true"
        />
      </button>

      <div id={captionId} hidden={!isOpen} className="mt-2 overflow-x-auto custom-scrollbar">
        <table className="w-full text-xs border-collapse">
          <caption className="sr-only">{caption}</caption>
          <thead>
            <tr>
              {columns.map((column) => (
                <th
                  key={column}
                  scope="col"
                  className="text-start font-bold text-on-surface border-b border-outline-variant px-2 py-1.5"
                >
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={index} className="even:bg-surface-variant/40">
                {row.map((cell, cellIndex) => (
                  <td
                    key={cellIndex}
                    className={`px-2 py-1.5 ${cellIndex === 0 ? 'font-medium text-on-surface' : 'text-on-surface-variant tabular-nums'}`}
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ChartDataTable;
