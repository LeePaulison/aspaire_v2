"use client";

export function IconButton({ children, label, className = "", ...props }) {
  return (
    <span className="IconButtonTooltipWrap">
      <button
        type="button"
        aria-label={label}
        className={`inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-surface hover:bg-surface-secondary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
        {...props}
      >
        {children}
      </button>
      <span role="tooltip" className="IconButtonTooltip">
        {label}
      </span>
    </span>
  );
}
