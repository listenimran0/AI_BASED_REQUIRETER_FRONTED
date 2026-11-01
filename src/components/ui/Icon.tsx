const PATHS: Record<string, string> = {
  check: 'M5 12.5l4.5 4.5L19 7.5',
  x: 'M6 6l12 12M18 6L6 18',
  send: 'M4 12l16-8-6 16-3-7-7-1z',
  clip: 'M20 11.5l-8 8a5 5 0 01-7-7l8.5-8.5a3.3 3.3 0 014.7 4.7L10 17a1.7 1.7 0 01-2.4-2.4l7-7',
  plus: 'M12 5v14M5 12h14',
  chart: 'M5 20V10m7 10V4m7 16v-7',
  users: 'M16 19v-1a4 4 0 00-4-4H7a4 4 0 00-4 4v1m17 0v-1a4 4 0 00-3-3.9M14 4.1a4 4 0 010 7.8M9.5 10a3.5 3.5 0 100-7 3.5 3.5 0 000 7z',
  chat: 'M21 12a8 8 0 01-11.6 7.1L4 20l1-4.6A8 8 0 1121 12z',
  mail: 'M4 6h16v12H4zM4 7l8 6 8-6',
  link: 'M10 14a4 4 0 005.7 0l3-3a4 4 0 00-5.7-5.7l-1 1M14 10a4 4 0 00-5.7 0l-3 3a4 4 0 005.7 5.7l1-1',
  warn: 'M12 4l9 16H3L12 4zM12 10v4m0 3h.01',
  pause: 'M8 5v14M16 5v14',
  play: 'M7 5l12 7-12 7z',
  bolt: 'M13 3L5 14h6l-1 7 8-11h-6l1-7z',
  edit: 'M4 20h4l10-10-4-4L4 16v4zM13 7l4 4',
  chevron: 'M9 6l6 6-6 6',
  clock: 'M12 7v5l3 2M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  sparkle: 'M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3z',
};

export function Icon({ name, size = 16 }: { name: keyof typeof PATHS | string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d={PATHS[name] || ''} />
    </svg>
  );
}
