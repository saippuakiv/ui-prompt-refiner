export function DashedIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      className="text-black/40 flex-shrink-0"
    >
      <rect
        x="2.5"
        y="2.5"
        width="15"
        height="15"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeDasharray="3 2.5"
      />
    </svg>
  );
}

export function ChevronRight() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      className="text-black/25"
    >
      <path
        d="M6 3.5L10.5 8L6 12.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
