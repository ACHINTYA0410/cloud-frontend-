interface Props {
  className?: string;
}

export default function PulseReadLogo({ className }: Props) {
  return (
    <svg
      viewBox="0 0 40 32"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={className}
    >
      <defs>
        <filter id="pulseGlow" x="-20%" y="-120%" width="140%" height="320%">
          <feGaussianBlur stdDeviation="1.6" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <path d="M23 2L6 17h10l-2 13 20-18H24z" fill="#C8593A" filter="url(#pulseGlow)">
        <animate
          attributeName="opacity"
          values="0.82;1;0.82"
          dur="2.2s"
          repeatCount="indefinite"
        />
      </path>
    </svg>
  );
}
