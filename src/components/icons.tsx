type IconProps = {
  className?: string
}

/** Звёздочка логотипа, 11×11 (Figma 127:7929) */
export function StarIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      width="11"
      height="11"
      viewBox="0 0 11 11"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M9.36364 10.0913L8.22727 11L5.54545 6.83913L2.81818 11L1.68182 10.0913L4.59091 6.16957L0 4.78261L0.454545 3.3L4.90909 4.97391L4.77273 0H6.22727L6.09091 4.97391L10.5455 3.3L11 4.78261L6.45455 6.16957L9.36364 10.0913Z"
        fill="currentColor"
      />
    </svg>
  )
}

/** Стрелка ↗ для маленьких ссылок, 24×24, штрих 1.5 (Figma 127:7955) */
export function ArrowSmall({ className }: IconProps) {
  return (
    <svg
      className={className}
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M17 17V7H7M17 7L7 17"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  )
}

/** Стрелка ↗ для большой ссылки, 24×24, штрих 4 (Figma 127:7949) */
export function ArrowLarge({ className }: IconProps) {
  return (
    <svg
      className={className}
      width="24"
      height="24"
      viewBox="0 0 28 28"
      fill="none"
      overflow="visible"
      aria-hidden="true"
    >
      <path
        d="M26 26V2H2M26 2L2 26"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
      />
    </svg>
  )
}
