const loaderCss = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:wght@400;600&display=swap');

  @keyframes km-spin {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }
  @keyframes km-orbit {
    from { transform: rotate(0deg) translateX(22px) rotate(0deg); }
    to   { transform: rotate(360deg) translateX(22px) rotate(-360deg); }
  }
  @keyframes km-pulse-ring {
    0%   { transform: scale(0.85); opacity: 0.6; }
    50%  { transform: scale(1.1);  opacity: 0.2; }
    100% { transform: scale(0.85); opacity: 0.6; }
  }
  @keyframes km-fade-up {
    from { opacity: 0; transform: translateY(8px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes km-skel-wave {
    0%   { background-position: -400px 0; }
    100% { background-position: 400px 0; }
  }
  @keyframes km-dot-bounce {
    0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
    40%            { transform: translateY(-6px); opacity: 1; }
  }

  /* ── Page Loader ── */
  .km-page-loader {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 45vh;
    width: 100%;
    padding: 32px;
    font-family: 'DM Sans', sans-serif;
  }

  .km-loader-card {
    background: #fff;
    border: 1px solid rgba(45,125,45,0.12);
    border-radius: 28px;
    padding: 40px 48px;
    text-align: center;
    box-shadow: 0 8px 40px rgba(15,38,16,0.09);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0;
    animation: km-fade-up 0.4s ease both;
  }

  /* Spinner assembly */
  .km-spinner-wrap {
    position: relative;
    width: 64px;
    height: 64px;
    margin-bottom: 20px;
  }

  /* Pulsing background ring */
  .km-spinner-pulse {
    position: absolute;
    inset: -8px;
    border-radius: 50%;
    background: rgba(76,175,80,0.12);
    animation: km-pulse-ring 2s ease-in-out infinite;
  }

  /* Main spinning arc */
  .km-spinner-arc {
    position: absolute;
    inset: 0;
    border-radius: 50%;
    border: 3px solid rgba(45,125,45,0.1);
    border-top-color: #2d7d2d;
    border-right-color: #66bb6a;
    animation: km-spin 1s cubic-bezier(0.5,0.1,0.5,0.9) infinite;
  }

  /* Orbiting dot */
  .km-spinner-dot {
    position: absolute;
    top: 50%; left: 50%;
    width: 8px; height: 8px;
    border-radius: 50%;
    background: #4caf50;
    margin: -4px;
    animation: km-orbit 1s linear infinite;
    box-shadow: 0 0 6px rgba(76,175,80,0.6);
  }

  /* Center icon */
  .km-spinner-icon {
    position: absolute;
    inset: 0;
    display: flex; align-items: center; justify-content: center;
    font-size: 22px;
    line-height: 1;
  }

  .km-loader-label {
    font-size: 14px;
    font-weight: 600;
    color: #4a5e4a;
    margin-bottom: 10px;
  }

  /* Bouncing dots */
  .km-loader-dots {
    display: flex;
    gap: 5px;
    align-items: center;
    justify-content: center;
  }

  .km-loader-dot {
    width: 5px; height: 5px;
    border-radius: 50%;
    background: #a5d6a7;
    animation: km-dot-bounce 1.2s ease-in-out infinite;
  }
  .km-loader-dot:nth-child(2) { animation-delay: 0.15s; }
  .km-loader-dot:nth-child(3) { animation-delay: 0.30s; }

  /* ── Skeleton Card ── */
  .km-skeleton {
    background: #fff;
    border: 1px solid rgba(45,125,45,0.07);
    border-radius: 24px;
    overflow: hidden;
    box-shadow: 0 2px 12px rgba(0,0,0,0.04);
  }

  .km-skel-img {
    height: 180px;
    background: linear-gradient(90deg, #f0f7ef 25%, #e0eed8 50%, #f0f7ef 75%);
    background-size: 800px 100%;
    animation: km-skel-wave 1.6s ease-in-out infinite;
    position: relative;
  }

  /* Simulated category pill on image */
  .km-skel-img::after {
    content: '';
    position: absolute;
    top: 14px; left: 14px;
    width: 64px; height: 20px;
    border-radius: 100px;
    background: rgba(255,255,255,0.5);
  }

  .km-skel-body {
    padding: 16px 18px 18px;
  }

  .km-skel-bar {
    border-radius: 8px;
    background: linear-gradient(90deg, #f0f7ef 25%, #e2eed8 50%, #f0f7ef 75%);
    background-size: 800px 100%;
    animation: km-skel-wave 1.6s ease-in-out infinite;
  }

  .km-skel-bar-title  { height: 16px; width: 70%; margin-bottom: 8px; }
  .km-skel-bar-sub    { height: 11px; width: 40%; margin-bottom: 16px; }
  .km-skel-row        { display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; }
  .km-skel-bar-stars  { height: 11px; width: 90px; }
  .km-skel-bar-price  { height: 16px; width: 52px; }
  .km-skel-bar-btn    { height: 40px; width: 100%; border-radius: 12px; }
`;

/* ── Page Loader ───────────────────────────────────── */
export const PageLoader = ({ label = "Loading fresh data..." }) => (
  <>
    <style>{loaderCss}</style>
    <div className="km-page-loader">
      <div className="km-loader-card">
        <div className="km-spinner-wrap">
          <div className="km-spinner-pulse" />
          <div className="km-spinner-arc" />
          <div className="km-spinner-dot" />
          <div className="km-spinner-icon">🌾</div>
        </div>
        <p className="km-loader-label">{label}</p>
        <div className="km-loader-dots">
          <div className="km-loader-dot" />
          <div className="km-loader-dot" />
          <div className="km-loader-dot" />
        </div>
      </div>
    </div>
  </>
);

/* ── Skeleton Card ─────────────────────────────────── */
export const SkeletonCard = () => (
  <>
    <style>{loaderCss}</style>
    <div className="km-skeleton">
      <div className="km-skel-img" />
      <div className="km-skel-body">
        <div className="km-skel-bar km-skel-bar-title" />
        <div className="km-skel-bar km-skel-bar-sub" />
        <div className="km-skel-row">
          <div className="km-skel-bar km-skel-bar-stars" />
          <div className="km-skel-bar km-skel-bar-price" />
        </div>
        <div className="km-skel-bar km-skel-bar-btn" />
      </div>
    </div>
  </>
);