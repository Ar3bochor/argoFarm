const STAR_FULL  = "★";
const STAR_EMPTY = "☆";

/**
 * RatingStars — displays a 1-5 star rating with optional review count.
 *
 * Props:
 *   value   – numeric rating (0–5), supports decimals
 *   count   – number of reviews to show beside the stars (optional)
 *   compact – if true, hides the count label (useful in tight spaces)
 */
export default function RatingStars({ value = 0, count = 0, compact = false }) {
  const rating = Math.min(5, Math.max(0, Number(value) || 0));
  const stars = Array.from({ length: 5 }, (_, i) => i + 1);

  return (
    <span
      style={{ display: "inline-flex", alignItems: "center", gap: 2 }}
      aria-label={`${rating.toFixed(1)} out of 5 stars`}
    >
      {stars.map((star) => (
        <span
          key={star}
          style={{
            fontSize: 13,
            lineHeight: 1,
            color: star <= Math.round(rating) ? "#f59e0b" : "#d1d5db",
          }}
        >
          {star <= Math.round(rating) ? STAR_FULL : STAR_EMPTY}
        </span>
      ))}
      {!compact && count > 0 && (
        <span
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: "#9ca3af",
            marginLeft: 4,
          }}
        >
          ({count})
        </span>
      )}
    </span>
  );
}