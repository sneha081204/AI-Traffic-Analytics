import React, { useRef, useEffect, useState } from 'react';

const VIDEO_FEEDS = [
  { id: 'cam-01', title: 'Corridor CCTV Feed A', src: '/videos/login_bg.mp4' },
  { id: 'cam-02', title: 'Highway Radar Feed B', src: '/videos/landing_bg.mp4' },
];

export const RealisticTrafficVideoBg = () => {
  const videoRef = useRef(null);
  const [activeFeedIdx, setActiveFeedIdx] = useState(0);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.load();
    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {});
    }
  }, [activeFeedIdx]);

  const handleVideoEnded = () => {
    // Automatically alternate to next traffic video
    setActiveFeedIdx((prev) => (prev + 1) % VIDEO_FEEDS.length);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', zIndex: 0, backgroundColor: '#05070B' }}>
      {/* 1. Pure Full-Screen Realistic Traffic Video Stream */}
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        onEnded={handleVideoEnded}
        key={`traffic-login-video-${activeFeedIdx}`}
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          minWidth: '100%',
          minHeight: '100%',
          width: 'auto',
          height: 'auto',
          transform: 'translate(-50%, -50%)',
          objectFit: 'cover',
          filter: 'brightness(0.9) contrast(1.1) saturate(1.15)',
        }}
      >
        <source src={VIDEO_FEEDS[activeFeedIdx].src} type="video/mp4" />
        <source src="/videos/traffic_bg_1.mp4" type="video/mp4" />
        <source src="/videos/traffic_bg.mp4" type="video/mp4" />
      </video>

      {/* 2. Ambient Cyber Vignette (Center is completely clear for transparent card) */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(circle at center, rgba(6, 8, 14, 0.05) 0%, rgba(4, 5, 8, 0.65) 90%)',
          pointerEvents: 'none',
        }}
      />

      {/* 3. Emergency Police Beacon Glow Sweeps (Red/Blue Ambient Sweeps) */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '240px',
          background: 'linear-gradient(90deg, rgba(225, 29, 72, 0.2) 0%, transparent 45%, rgba(37, 99, 235, 0.2) 100%)',
          pointerEvents: 'none',
          animation: 'policeSirenGlow 2.4s infinite alternate ease-in-out',
        }}
      />


      <style>{`
        @keyframes policeSirenGlow {
          0% { opacity: 0.25; }
          100% { opacity: 0.95; }
        }
      `}</style>
    </div>
  );
};
export default RealisticTrafficVideoBg;
