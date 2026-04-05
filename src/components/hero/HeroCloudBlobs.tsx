/** Decorative mist behind hero copy; `prefers-reduced-motion` disables motion in CSS. */
export function HeroCloudBlobs() {
  return (
    <div className="hero__blobs" aria-hidden>
      <svg
        className="hero__blob hero__blob--a"
        viewBox="0 0 200 200"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          fill="currentColor"
          d="M100 18c32 0 58 20 68 48 12 34-4 72-38 88-24 12-54 10-78-6-38-26-48-78-22-118 16-26 42-42 70-12z"
        />
      </svg>
      <svg
        className="hero__blob hero__blob--b"
        viewBox="0 0 200 200"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          fill="currentColor"
          d="M48 52c18-28 52-36 82-22 38 18 56 62 40 102-14 34-52 52-88 44-36-8-62-40-62-78 0-20 10-38 28-46z"
        />
      </svg>
      <svg
        className="hero__blob hero__blob--c"
        viewBox="0 0 200 200"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          fill="currentColor"
          d="M128 40c40-8 76 24 72 64-4 34-34 58-68 60-40 2-76-28-80-68-4-36 28-68 64-56 4 20 12 0 12 0z"
        />
      </svg>
    </div>
  )
}
