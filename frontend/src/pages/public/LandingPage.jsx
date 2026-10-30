import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Shield, 
  Eye, 
  Cpu, 
  Zap, 
  ArrowUpRight, 
  ArrowRight, 
  Activity, 
  Camera, 
  Play, 
  CheckCircle2, 
  Radio, 
  Layers, 
  Building2, 
  UserCheck, 
  RefreshCw,
  Sliders,
  ChevronRight
} from 'lucide-react';
import { ROUTES } from '../../config/routes';
import { useAuth } from '../../context/AuthContext';
import './LandingPage.css';

export const LandingPage = () => {
  const navigate = useNavigate();
  const { user, isPolice, isDepartment } = useAuth();

  const handleOpenPoliceLiveCam = () => {
    if (user && isPolice) {
      navigate(ROUTES.POLICE.LIVE_CAMERA);
    } else {
      navigate(`/login?role=police&redirect=${encodeURIComponent(ROUTES.POLICE.LIVE_CAMERA)}`);
    }
  };

  const handleOpenCCTVWall = () => {
    if (user && isDepartment) {
      navigate(ROUTES.DEPARTMENT.DASHBOARD);
    } else {
      navigate(`/login?role=department&redirect=${encodeURIComponent(ROUTES.DEPARTMENT.DASHBOARD)}`);
    }
  };

  const handleOpenPolicePortal = () => {
    if (user && isPolice) {
      navigate(ROUTES.POLICE.DASHBOARD);
    } else {
      navigate(`/login?role=police&redirect=${encodeURIComponent(ROUTES.POLICE.DASHBOARD)}`);
    }
  };

  const handleOpenDepartmentPortal = () => {
    if (user && isDepartment) {
      navigate(ROUTES.DEPARTMENT.DASHBOARD);
    } else {
      navigate(`/login?role=department&redirect=${encodeURIComponent(ROUTES.DEPARTMENT.DASHBOARD)}`);
    }
  };


  // Intro Sequence State (plays automatically on load/refresh)
  const [showIntro, setShowIntro] = useState(true);
  const [introProgress, setIntroProgress] = useState(0);
  const [introPhaseText, setIntroPhaseText] = useState('INITIALIZING ASTRO ENGINE...');
  const [introFading, setIntroFading] = useState(false);
  
  // Mouse Parallax coordinates
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Interactive Live Radar Demo State
  const [radarTarget, setRadarTarget] = useState({
    type: 'NO_HELMET_VIOLATION',
    plate: 'KA-01-MJ-8821',
    confidence: '99.4%',
    fine: '₹1,000',
    status: 'RECORDED',
    timestamp: 'Just now'
  });
  const [isScanning, setIsScanning] = useState(false);

  // Intro Loading Counter Effect
  useEffect(() => {
    if (!showIntro) return;

    const interval = setInterval(() => {
      setIntroProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIntroFading(true);
          setTimeout(() => {
            setShowIntro(false);
            setIntroFading(false);
          }, 450);
          return 100;
        }

        const next = prev + 1;
        if (next < 25) {
          setIntroPhaseText('BOOTING ASTRO ENFORCEMENT ENGINE...');
        } else if (next < 55) {
          setIntroPhaseText('SYNCING CCTV CAMERAS & ANPR NODES...');
        } else if (next < 85) {
          setIntroPhaseText('CALIBRATING ADVANCED AI VISION CORE...');
        } else {
          setIntroPhaseText('SMART TRAFFIC MATRIX ONLINE & SECURE.');
        }
        return next;
      });
    }, 16);

    return () => clearInterval(interval);
  }, [showIntro]);

  // Typewriter effect for "ASTRO TRAFFIC"
  const line1Text = "ASTRO";
  const line2Text = "TRAFFIC";
  const [typedLine1, setTypedLine1] = useState('');
  const [typedLine2, setTypedLine2] = useState('');
  const [caretLine, setCaretLine] = useState(1);

  useEffect(() => {
    if (showIntro) return;

    let charIndex = 0;
    let isDeleting = false;
    let timer;

    const tick = () => {
      const totalChars = line1Text.length + line2Text.length;

      if (!isDeleting) {
        charIndex++;
        if (charIndex <= line1Text.length) {
          setTypedLine1(line1Text.slice(0, charIndex));
          setTypedLine2('');
          setCaretLine(1);
        } else {
          setTypedLine1(line1Text);
          setTypedLine2(line2Text.slice(0, charIndex - line1Text.length));
          setCaretLine(2);
        }

        if (charIndex === totalChars) {
          isDeleting = true;
          timer = setTimeout(tick, 3500);
          return;
        }
        const typeSpeed = 120 + Math.floor(Math.random() * 35);
        timer = setTimeout(tick, typeSpeed);
      } else {
        charIndex--;
        if (charIndex <= line1Text.length) {
          setTypedLine1(line1Text.slice(0, Math.max(0, charIndex)));
          setTypedLine2('');
          setCaretLine(1);
        } else {
          setTypedLine1(line1Text);
          setTypedLine2(line2Text.slice(0, charIndex - line1Text.length));
          setCaretLine(2);
        }

        if (charIndex === 0) {
          isDeleting = false;
          timer = setTimeout(tick, 600);
          return;
        }
        timer = setTimeout(tick, 50);
      }
    };

    timer = setTimeout(tick, 250);

    return () => clearTimeout(timer);
  }, [showIntro]);

  // Mouse Move Parallax Handler
  const handleMouseMove = (e) => {
    const { innerWidth, innerHeight } = window;
    const x = (e.clientX / innerWidth - 0.5) * 20;
    const y = (e.clientY / innerHeight - 0.5) * 20;
    setMousePos({ x, y });
  };

  // Trigger Radar Simulation
  const triggerSimulation = (type, plate, fine, conf) => {
    setIsScanning(true);
    setTimeout(() => {
      setRadarTarget({
        type,
        plate,
        fine,
        confidence: conf,
        status: 'ENFORCED',
        timestamp: new Date().toLocaleTimeString()
      });
      setIsScanning(false);
    }, 500);
  };

  const skipIntro = () => {
    setIntroProgress(100);
    setShowIntro(false);
  };

  const replayIntro = () => {
    setIntroProgress(0);
    setShowIntro(true);
  };

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Calculate intro typewriter text based on loading progress
  const introFullText = "AI TRAFFIC ANALYTICS & CITY MATRIX.";
  const introCharCount = Math.min(
    introFullText.length,
    Math.floor((introProgress / 88) * introFullText.length)
  );
  const typedIntro = introFullText.slice(0, introCharCount);

  const renderTypedIntroTitle = () => {
    if (introCharCount <= 11) {
      return <span>{typedIntro}</span>;
    } else if (introCharCount <= 20) {
      return (
        <>
          <span>AI TRAFFIC </span>
          <span className="highlight">{typedIntro.slice(11)}</span>
        </>
      );
    } else {
      return (
        <>
          <span>AI TRAFFIC </span>
          <span className="highlight">ANALYTICS</span>
          <span>{typedIntro.slice(20)}</span>
        </>
      );
    }
  };

  return (
    <div className="astro-root" onMouseMove={handleMouseMove}>
      {/* ===================================================================
          CINEMATIC INTRO (50% CENTER DISPLAY WITH BLURRED SCREEN BACKDROP)
          =================================================================== */}
      {showIntro && (
        <div className={`astro-intro-overlay ${introFading ? 'hidden' : ''}`}>
          {/* Real CCTV Surveillance Video in Intro Backdrop */}
          <video
            autoPlay
            loop
            muted
            playsInline
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              opacity: 0.25,
              zIndex: 0,
              pointerEvents: 'none',
              filter: 'blur(3px) brightness(0.65)',
            }}
          >
            <source src="/videos/login_bg.mp4" type="video/mp4" />
            <source src="/videos/landing_bg.mp4" type="video/mp4" />
          </video>

          <div className="astro-intro-grid" style={{ zIndex: 1 }} />

          <div className="astro-intro-content" style={{ zIndex: 10 }}>
            {/* Intro Top Header */}
            <div className="astro-intro-top">
              <div className="astro-intro-brand">
                <div className="astro-intro-logo-badge">
                  <img src="/images/astro-hero.jpg" alt="Astro Logo Icon" />
                </div>
                <div>
                  <div style={{ fontFamily: 'var(--astro-font-display)', fontWeight: 900, fontSize: '1.35rem', color: '#FFFFFF', letterSpacing: '-0.03em' }}>
                    ASTRO<span style={{ color: '#e11d48' }}>.</span> TRAFFIC
                  </div>
                  <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#FFFFFF', letterSpacing: '0.12em' }}>
                    AUTONOMOUS ENFORCEMENT ENGINE
                  </div>
                </div>
              </div>
            </div>

            {/* Intro Center Hero & Logo Section */}
            <div className="astro-intro-center">
              <div className="astro-intro-status">
                <Radio size={14} className="animate-pulse" />
                {introPhaseText}
              </div>
              <h1 className="astro-intro-title" aria-label="AI TRAFFIC ANALYTICS & CITY MATRIX.">
                {renderTypedIntroTitle()}
                <span className="astro-intro-caret" />
              </h1>
              <div className="astro-intro-bar-track">
                <div className="astro-intro-bar-fill" style={{ width: `${introProgress}%` }} />
              </div>
            </div>

            {/* Intro Bottom Digits & Loading Status */}
            <div className="astro-intro-bottom">
              <div className="astro-intro-digits">
                {introProgress.toString().padStart(2, '0')}<span className="pct">%</span>
              </div>
              <div className="astro-intro-loading-tag">
                <span className="astro-intro-loading-spinner" />
                LOADING SYSTEM MATRIX
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================
          IMMERSIVE FULL-PAGE FIXED TRAFFIC VIDEO BACKGROUND
          =================================================================== */}
      <div 
        className="astro-fullscreen-video-bg"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 0,
          overflow: 'hidden',
          backgroundColor: '#05070D',
          pointerEvents: 'none',
          width: '100vw',
          height: '100vh'
        }}
      >
        <video
          autoPlay
          loop
          muted
          playsInline
          key="landing-page-full-stream"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            minWidth: '100vw',
            minHeight: '100vh',
            objectFit: 'cover',
            opacity: 0.88,
            filter: 'contrast(1.06) brightness(0.92)',
          }}
        >
          <source src="/videos/landing_bg.mp4" type="video/mp4" />
          <source src="/videos/traffic_bg_2.mp4" type="video/mp4" />
          <source src="/videos/login_bg.mp4" type="video/mp4" />
          <source src="/videos/traffic_bg.mp4" type="video/mp4" />
        </video>

        {/* Ambient Frosted White Glass Veil (Luminous White Transparency) */}
        <div 
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'radial-gradient(circle at center, rgba(255, 255, 255, 0.08) 0%, rgba(15, 23, 42, 0.35) 100%)',
          }} 
        />
      </div>

      {/* ===================================================================
          TOP NAVIGATION BAR (With Exact Dribbble Style + Top-Right Login)
          =================================================================== */}
      <header className="astro-navbar" style={{ position: 'relative', zIndex: 10 }}>
        <a href="#" className="astro-brand-lockup">
          <div>
            <div className="astro-brand-title">
              ASTRO<span className="dot">.</span> TRAFFIC
            </div>
            <div className="astro-brand-sub">AI ENFORCEMENT ENGINE</div>
          </div>
        </a>

        <nav className="astro-nav-links">
          <button onClick={() => scrollToSection('who-we-are')} className="astro-nav-link" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            Who we are
          </button>
          <a href="#" className="astro-nav-link active">Home</a>
          <button onClick={() => scrollToSection('advantages')} className="astro-nav-link" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            Advantages
          </button>
          <button onClick={() => scrollToSection('live-demo')} className="astro-nav-link" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            Live Radar Demo
          </button>
        </nav>

        {/* Top Right Action Area with Login Button */}
        <div className="astro-nav-actions">
          <button 
            id="top-login-button"
            onClick={() => navigate(ROUTES.LOGIN)} 
            className="astro-btn-primary astro-btn-login"
            style={{ 
              padding: '0.55rem 1.4rem', 
              fontSize: '0.85rem', 
              fontWeight: 700, 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.4rem',
              backgroundColor: 'rgba(255, 255, 255, 0.22)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              border: '1px solid rgba(255, 255, 255, 0.45)',
              color: '#ffffff',
              borderRadius: '6px',
              boxShadow: '0 4px 15px rgba(0, 0, 0, 0.15), inset 0 1px 1px rgba(255, 255, 255, 0.5)'
            }}
          >
            <UserCheck size={15} /> Login <ArrowUpRight size={14} />
          </button>
        </div>
      </header>

      {/* ===================================================================
          HERO SECTION (MATCHING DRIBBBLE EXACTLY)
          =================================================================== */}
      <main className="astro-hero">
        {/* Left Column */}
        <div className="astro-hero-left">
          {/* Top block with mini helmet badge and tag */}
          <div className="astro-hero-top-block">
            <div className="astro-mini-badge-container">
              <img 
                src="/images/astro-hero.png" 
                alt="Astro Helmet Unit" 
              />
            </div>
            <div className="astro-tagline-block">
              <div className="astro-tagline-icon" />
              <div className="astro-tagline-text">
                Targeted <span className="red">traffic</span>.<br />
                Real business<br />
                growth.
              </div>
            </div>
          </div>

            {/* Bottom Headline block with Typewriter format */}
            <div className="astro-hero-headline-block">
              <h1 className="astro-massive-title astro-typewriter-title" aria-label="ASTRO TRAFFIC">
                <span className="astro-type-word word-astro">
                  {typedLine1}
                  {caretLine === 1 && <span className="astro-typewriter-caret" />}
                </span>
                <br />
                <span className="astro-type-word word-traffic">
                  {typedLine2}
                  {caretLine === 2 && <span className="astro-typewriter-caret" />}
                </span>
              </h1>

              <div className="astro-hero-bottom-desc">
                <p className="astro-hero-paragraph">
                  We're here for results. With data, vision AI, and automated fine optimization, we turn ad spend and enforcement into municipal order. Ready to grow?
                </p>
                <div>
                  <a onClick={() => navigate(ROUTES.LOGIN)} className="astro-hero-cta-link">
                    Get Started <ArrowRight size={14} />
                  </a>
                </div>
              </div>
            </div>
          </div>

        {/* Right Column (Hero Visual with Robot Scanning the Landing Page) */}
        <div className="astro-hero-right">
          <div className="astro-visual-wrapper">
            {/* Ambient Red Glow Halo */}
            <div className="astro-hero-halo" />

            {/* Cyber HUD Grid Rings Behind Robot */}
            <div className="astro-robot-hud-ring ring-1" />
            <div className="astro-robot-hud-ring ring-2" />

            {/* Horizontal Crimson-Red Banner Slice */}
            <div 
              className="astro-red-slice-banner"
              style={{
                transform: `translateY(${mousePos.y * 0.4}px)`
              }}
            >
              {/* Square Black Action Button on bottom left of red banner */}
              <button 
                onClick={() => navigate(ROUTES.LOGIN)} 
                className="astro-red-banner-action-btn"
                title="Launch Intelligent Portal"
              >
                <ArrowUpRight size={26} />
              </button>
            </div>

            {/* Standing Robot Surveillance Visual Container */}
            <div className="astro-robot-parallax-wrapper">
              <div className="astro-robot-movement-box">
                {/* Luminous Helmet Backlight & Cyber HUD Target for Head Visibility */}
                <div className="astro-robot-head-backlight" />
                <div className="astro-robot-helmet-target" />

                {/* Robot Eyes / Helmet Optical Laser Origin (Directly on Robot Face) */}
                <div className="astro-robot-eye-origin">
                  {/* Glowing Eye Visor Flare */}
                  <div className="astro-robot-visor-flare" />
                  
                  {/* Focused Laser Beam Radiating from Eyes Across Landing Page */}
                  <div className="astro-robot-laser-beam" />

                  {/* Wide Holographic Radar Cone Radiating from Eyes Across Landing Page */}
                  <div className="astro-robot-radar-cone" />
                </div>

                {/* Visor Specular Glass Reflection */}
                <div className="astro-robot-visor-reflection" />

                {/* Robot Thruster / Levitation Energy Pulse */}
                <div className="astro-robot-thruster-ring" />

                <img 
                  src="/images/astro-hero.png?v=4" 
                  alt="Astro Cyber Robot Vision Core" 
                  className="astro-astronaut-image"
                />
                <div className="astro-robot-shadow" />
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ===================================================================
          DUAL PORTAL DIRECT LAUNCHPAD
          =================================================================== */}
      <section id="portal-selector" className="astro-portal-strip">
        <div className="astro-portal-cards-grid">
          {/* Police Portal Card */}
          <div 
            className="astro-portal-card"
            onClick={handleOpenPolicePortal}
            style={{ cursor: 'pointer' }}
          >
            <div>
              <div className="astro-portal-card-header">
                <div className="astro-portal-icon-box">
                  <Camera size={24} />
                </div>
                <span className="astro-portal-badge">PORTAL 01 • FIELD OFFICERS</span>
              </div>
              <h3 className="astro-portal-card-title">Traffic Police Portal</h3>
              <p className="astro-portal-card-desc">
                High-speed mobile device camera detector with automated snapshot capture, instant AI violation parsing under 5s, and digital fine receipt generation.
              </p>
            </div>
          </div>

          {/* Department Portal Card */}
          <div 
            className="astro-portal-card"
            onClick={handleOpenDepartmentPortal}
            style={{ cursor: 'pointer' }}
          >
            <div>
              <div className="astro-portal-card-header">
                <div className="astro-portal-icon-box">
                  <Building2 size={24} />
                </div>
                <span className="astro-portal-badge">PORTAL 02 • CENTRAL HQ</span>
              </div>
              <h3 className="astro-portal-card-title">Department Command HQ</h3>
              <p className="astro-portal-card-desc">
                Real-time 60 FPS CCTV monitoring across 8 city corridors, department-wide AI rule calibration, officer performance tracking, and live revenue analytics.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================================
          WHO WE ARE SECTION
          =================================================================== */}
      <section id="who-we-are" className="astro-section">
        <div className="astro-section-header">
          <div>
            <div className="astro-section-subtitle">
              <Shield size={14} /> WHO WE ARE
            </div>
            <h2 className="astro-section-title">
              Next-Gen Autonomous<br />Traffic Intelligence.
            </h2>
          </div>
          <p className="astro-section-desc">
            Engineered with an Advanced AI Vision Matrix, ASTRO TRAFFIC delivers municipal-grade computer vision directly into field officer hands and central command centers.
          </p>
        </div>

        {/* Real-time stats matrix */}
        <div className="astro-stats-grid">
          <div className="astro-stat-box">
            <div className="astro-stat-num">
              99.8<span className="accent">%</span>
            </div>
            <div className="astro-stat-label">Detection Precision</div>
            <div className="astro-stat-sub">Helmet, Triple Riding, Red Light, Speeding</div>
          </div>

          <div className="astro-stat-box">
            <div className="astro-stat-num">
              &lt;4.5<span className="accent">s</span>
            </div>
            <div className="astro-stat-label">End-to-End Latency</div>
            <div className="astro-stat-sub">From frame capture to fine computation</div>
          </div>

          <div className="astro-stat-box">
            <div className="astro-stat-num">
              60<span className="accent">FPS</span>
            </div>
            <div className="astro-stat-label">CCTV Stream Pipeline</div>
            <div className="astro-stat-sub">Simultaneous corridor feeds & monitoring</div>
          </div>

          <div className="astro-stat-box">
            <div className="astro-stat-num">
              100<span className="accent">%</span>
            </div>
            <div className="astro-stat-label">Evidence Verification</div>
            <div className="astro-stat-sub">Cryptographically linked image records</div>
          </div>
        </div>
      </section>

      {/* ===================================================================
          ADVANTAGES SECTION
          =================================================================== */}
      <section id="advantages" className="astro-section">
        <div className="astro-section-header">
          <div>
            <div className="astro-section-subtitle">
              <Zap size={14} /> SYSTEM ADVANTAGES
            </div>
            <h2 className="astro-section-title">
              Why Cities Trust<br />Astro Traffic.
            </h2>
          </div>
          <p className="astro-section-desc">
            Replace manual officer ticketing with instantaneous, automated AI detection. Eliminates human bias, records pristine photo evidence, and optimizes traffic flow.
          </p>
        </div>

        <div className="astro-adv-grid">
          <div className="astro-adv-card">
            <div className="astro-adv-index">01 / VISION ENGINE</div>
            <h3>Sub-Second AI Frame Parsing</h3>
            <p>
              Optimized neural pipelines and cached rule definitions ensure instantaneous AI vision inference within 4.5 seconds.
            </p>
          </div>

          <div className="astro-adv-card">
            <div className="astro-adv-index">02 / AUTOMATIC EVIDENCE</div>
            <h3>Zero-Click Photo Snapshot</h3>
            <p>
              Every detected violation automatically triggers an HD evidence snapshot with license plate zoom, saved securely to local storage.
            </p>
          </div>

          <div className="astro-adv-card">
            <div className="astro-adv-index">03 / REAL-TIME ANPR</div>
            <h3>High Accuracy License OCR</h3>
            <p>
              Extracts alphanumeric plates across Indian state formats under extreme lighting, rain, glare, and high-speed motion blur.
            </p>
          </div>

          <div className="astro-adv-card">
            <div className="astro-adv-index">04 / MULTI-CORRIDOR CCTV</div>
            <h3>Central Department Wall</h3>
            <p>
              Command centers can monitor multiple intersection corridors simultaneously with live overlay indicators and instant violation logs.
            </p>
          </div>

          <div className="astro-adv-card">
            <div className="astro-adv-index">05 / REVENUE & FINES</div>
            <h3>Automated Penalty Calculation</h3>
            <p>
              Applies exact municipal Motor Vehicle Act violation fine brackets automatically with tamper-proof receipt issuance.
            </p>
          </div>

          <div className="astro-adv-card">
            <div className="astro-adv-index">06 / OFFICER ATTRIBUTION</div>
            <h3>Full Audit Trail</h3>
            <p>
              Track individual officer metrics, duty locations, fine collection rates, and real-time precinct coverage maps.
            </p>
          </div>
        </div>
      </section>

      {/* ===================================================================
          LIVE RADAR TERMINAL DEMO
          =================================================================== */}
      <section id="live-demo" className="astro-section">
        <div className="astro-section-header">
          <div>
            <div className="astro-section-subtitle">
              <Radio size={14} /> INTERACTIVE DEMO
            </div>
            <h2 className="astro-section-title">
              Live AI Radar Terminal.
            </h2>
          </div>
          <p className="astro-section-desc">
            Test the live enforcement matrix below. Select a violation scenario to trigger real-time AI spatial localization and ticket creation.
          </p>
        </div>

        <div className="astro-demo-terminal">
          <div className="astro-demo-terminal-header">
            <div className="astro-terminal-dots">
              <div className="astro-dot red" />
              <div className="astro-dot yellow" />
              <div className="astro-dot green" />
            </div>
            <div style={{ fontFamily: 'var(--astro-font-mono)', fontSize: '0.8rem', color: '#ff4d6d' }}>
              TERMINAL // BANGALORE CORRIDOR 04 • CAMERA 102
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button 
                onClick={() => triggerSimulation('NO_HELMET_VIOLATION', 'KA-01-MJ-8821', '₹1,000', '99.4%')}
                style={{ background: 'rgba(255, 255, 255, 0.20)', color: '#fff', border: '1px solid rgba(255, 255, 255, 0.40)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', padding: '5px 12px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
              >
                Simulate No Helmet
              </button>
              <button 
                onClick={() => triggerSimulation('TRIPLE_RIDING', 'KA-05-EB-4412', '₹2,000', '98.9%')}
                style={{ background: 'rgba(255, 255, 255, 0.20)', color: '#fff', border: '1px solid rgba(255, 255, 255, 0.40)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', padding: '5px 12px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
              >
                Simulate Triple Riding
              </button>
              <button 
                onClick={() => triggerSimulation('RED_LIGHT_JUMP', 'KA-03-AX-9910', '₹1,500', '99.7%')}
                style={{ background: 'rgba(255, 255, 255, 0.20)', color: '#fff', border: '1px solid rgba(255, 255, 255, 0.40)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', padding: '5px 12px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
              >
                Simulate Red Light Jump
              </button>
            </div>
          </div>

          <div className="astro-terminal-view">
            {/* Simulated Radar Screen with Real Traffic Stream */}
            <div className="astro-radar-screen" style={{ position: 'relative', overflow: 'hidden' }}>
              <video
                autoPlay
                loop
                muted
                playsInline
                style={{
                  position: 'absolute',
                  inset: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  opacity: 0.88,
                  zIndex: 0,
                }}
              >
                <source src="/videos/corridor_camera_102.mp4" type="video/mp4" />
                <source src="/videos/landing_bg.mp4" type="video/mp4" />
                <source src="/videos/traffic_bg_2.mp4" type="video/mp4" />
                <source src="/videos/login_bg.mp4" type="video/mp4" />
                <source src="/videos/traffic_bg.mp4" type="video/mp4" />
              </video>
              <div className="astro-radar-grid" style={{ zIndex: 1 }} />
              <div className="astro-radar-crosshair" style={{ zIndex: 1 }} />
            </div>

            {/* Simulated Telemetry Data */}
            <div className="astro-demo-telemetry">
              <div style={{ background: 'rgba(255, 255, 255, 0.14)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', padding: '1.25rem', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.32)', boxShadow: 'inset 0 1px 1px rgba(255, 255, 255, 0.4)' }}>
                <div style={{ fontFamily: 'var(--astro-font-mono)', fontSize: '0.75rem', color: '#FFFFFF', fontWeight: 800, marginBottom: '0.75rem', letterSpacing: '0.06em' }}>
                  AI INFERENCE TELEMETRY
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.85rem' }}>
                  <div>
                    <span style={{ color: '#FFFFFF', fontSize: '0.75rem', fontWeight: 700 }}>VIOLATION:</span>
                    <div style={{ fontWeight: 800, color: '#ff4d6d' }}>{radarTarget.type}</div>
                  </div>
                  <div>
                    <span style={{ color: '#FFFFFF', fontSize: '0.75rem', fontWeight: 700 }}>LICENSE PLATE:</span>
                    <div style={{ fontWeight: 700, color: '#FFFFFF', fontFamily: 'var(--astro-font-mono)' }}>{radarTarget.plate}</div>
                  </div>
                  <div>
                    <span style={{ color: '#FFFFFF', fontSize: '0.75rem', fontWeight: 700 }}>FINE AMOUNT:</span>
                    <div style={{ fontWeight: 800, color: '#10b981' }}>{radarTarget.fine}</div>
                  </div>
                  <div>
                    <span style={{ color: '#FFFFFF', fontSize: '0.75rem', fontWeight: 700 }}>CONFIDENCE:</span>
                    <div style={{ fontWeight: 700, color: '#FFFFFF' }}>{radarTarget.confidence}</div>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem' }}>
                <button 
                  onClick={handleOpenPoliceLiveCam} 
                  className="astro-btn-primary" 
                  style={{ flex: 1, justifyContent: 'center', background: 'rgba(255, 255, 255, 0.22)', border: '1px solid rgba(255, 255, 255, 0.45)', color: '#ffffff', backdropFilter: 'blur(10px)' }}
                >
                  <Camera size={16} /> Open Police Live Cam
                </button>
                <button 
                  onClick={handleOpenCCTVWall} 
                  className="astro-btn-outline" 
                  style={{ flex: 1, justifyContent: 'center', borderColor: 'rgba(255, 255, 255, 0.45)', color: '#fff', background: 'rgba(255, 255, 255, 0.12)', backdropFilter: 'blur(10px)' }}
                >
                  <Radio size={16} /> Open CCTV Wall
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================================
          FOOTER
          =================================================================== */}
      <footer className="astro-footer">
        <div className="astro-footer-content">
          <div>
            <div className="astro-brand-title" style={{ color: '#ffffff' }}>
              ASTRO<span className="dot">.</span> TRAFFIC
            </div>
            <p style={{ color: '#FFFFFF', fontSize: '0.85rem', maxWidth: '360px', marginTop: '0.5rem', opacity: 0.95 }}>
              Autonomous municipal traffic enforcement platform powered by high-speed AI Vision.
            </p>
          </div>

          <div className="astro-engineered-box">
            <div className="astro-engineered-header">
              <div className="astro-engineered-tag">
                <span className="astro-engineered-pulse" />
                <span>ENGINEERED BY</span>
              </div>
            </div>

            <div className="astro-engineered-team-grid">
              <div className="astro-team-chip">
                <div className="astro-chip-avatar">AR</div>
                <div className="astro-chip-info">
                  <span className="astro-chip-name">ANUPIRYA R</span>
                </div>
              </div>

              <div className="astro-team-chip">
                <div className="astro-chip-avatar">AH</div>
                <div className="astro-chip-info">
                  <span className="astro-chip-name">ANKITHA H T</span>
                </div>
              </div>

              <div className="astro-team-chip">
                <div className="astro-chip-avatar">LB</div>
                <div className="astro-chip-info">
                  <span className="astro-chip-name">LOKESH B V</span>
                </div>
              </div>

              <div className="astro-team-chip">
                <div className="astro-chip-avatar">SM</div>
                <div className="astro-chip-info">
                  <span className="astro-chip-name">SNEHA M S</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="astro-footer-bottom">
          <div>© 2026 ASTRO TRAFFIC ANALYTICS. ALL RIGHTS RESERVED.</div>
        </div>
      </footer>
    </div>
  );
};
export default LandingPage;
