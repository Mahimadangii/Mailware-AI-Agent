// src/components/BrandMark.jsx

/**
 * BrandMark — the Mailware envelope logo mark.
 * @param {number} size - width & height of the container square
 * @param {string} color - background fill color
 * @param {number} radius - border radius
 */
export function BrandMark({ size = 36, color = "#1a73e8", radius = 8 }) {
  const iconW = size * 0.56;
  const iconH = size * 0.44;

  return (
    <div
      style={{
        width: size,
        height: size,
        background: color,
        borderRadius: radius,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      <svg
        width={iconW}
        height={iconH}
        viewBox="0 0 20 14"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect
          x="0.75" y="0.75"
          width="18.5" height="12.5"
          rx="2.25"
          stroke="white"
          strokeWidth="1.5"
        />
        <path
          d="M1 3.5l9 6 9-6"
          stroke="white"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}
