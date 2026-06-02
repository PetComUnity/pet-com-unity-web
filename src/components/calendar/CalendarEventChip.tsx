interface CalendarEventChipProps {
  title: string;
  color: string;
}

function hexToRgba(hex: string, alpha: number): string {
  const h = hex.replace('#', '');
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

export function CalendarEventChip({ title, color }: CalendarEventChipProps) {
  return (
    <div
      className="text-xs px-1 py-[3px] rounded cursor-pointer truncate max-w-full font-medium"
      style={{
        backgroundColor: hexToRgba(color, 0.1),
        color,
        fontFamily: 'Inter, sans-serif',
      }}
      title={title}
    >
      {title}
    </div>
  );
}
