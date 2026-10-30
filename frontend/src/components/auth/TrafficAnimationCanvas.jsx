import React, { useEffect, useRef } from 'react';

export const TrafficAnimationCanvas = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    };
    window.addEventListener('resize', handleResize);

    // Realistic Multi-Lane Highway Vehicle Objects
    const lanes = 5;
    const laneWidth = () => width / lanes;

    const vehicles = [];
    const violationTypes = [
      { type: 'NO HELMET VIOLATION', fine: '₹1,000', color: '#E11D48', icon: '⛑️' },
      { type: 'TRIPLE RIDING DETECTED', fine: '₹2,000', color: '#FF2A54', icon: '👥' },
      { type: 'OVERSPEEDING (88 KM/H)', fine: '₹2,000', color: '#F59E0B', icon: '⚡' },
      { type: 'RED LIGHT JUMP', fine: '₹1,500', color: '#EF4444', icon: '🛑' },
      { type: 'PHONE USAGE ON WHEEL', fine: '₹1,500', color: '#EC4899', icon: '📱' },
    ];

    const plates = [
      'KA04TR2954', 'KA01MJ8821', 'KA05EB4412', 'KA03AX9910', 
      'MH12RN4501', 'DL01AB1109', 'TN09BQ7732', 'TS08CD9021',
      'KA51HY8820', 'MH02EK3119', 'KA04TR2942', 'KA04TR2938'
    ];

    for (let i = 0; i < 22; i++) {
      const isMotorbike = Math.random() > 0.45;
      const isViolating = Math.random() > 0.4;
      const vViolation = violationTypes[Math.floor(Math.random() * violationTypes.length)];
      const vPlate = plates[Math.floor(Math.random() * plates.length)];

      vehicles.push({
        lane: Math.floor(Math.random() * lanes),
        x: (Math.floor(Math.random() * lanes) + 0.5) * (width / lanes),
        y: Math.random() * height,
        speed: 2.2 + Math.random() * 2.8,
        length: isMotorbike ? 36 : 60 + Math.random() * 20,
        width: isMotorbike ? 18 : 34,
        isMotorbike,
        isViolating,
        violation: vViolation,
        plate: vPlate,
        lightColor: isMotorbike ? '#FFD700' : '#FFFFFF',
        tailColor: '#EF4444',
        radarPulse: 0,
        scanFlash: Math.random() > 0.5,
      });
    }

    // Speed camera & Radar towers
    const cameras = [
      { x: width * 0.15, y: height * 0.25, angle: 0 },
      { x: width * 0.85, y: height * 0.65, angle: Math.PI },
    ];

    // Police Beacon Flash State
    let policeFlash = 0;
    let scanY = 0;

    const render = () => {
      policeFlash += 0.08;

      // 1. Cyber Asphalt Roadway Background
      ctx.fillStyle = '#06080D';
      ctx.fillRect(0, 0, width, height);

      // 2. Animated Perspective Road Grid
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
      ctx.lineWidth = 1;
      const gridGap = 35;
      for (let x = 0; x < width; x += gridGap) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }

      // Highway Lane Dividers with Road Markings
      const lWidth = laneWidth();
      for (let l = 1; l < lanes; l++) {
        const lx = l * lWidth;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
        ctx.lineWidth = 2;
        ctx.setLineDash([20, 20]);
        ctx.lineDashOffset = -scanY * 0.5;
        ctx.beginPath();
        ctx.moveTo(lx, 0);
        ctx.lineTo(lx, height);
        ctx.stroke();
      }
      ctx.setLineDash([]);

      // 3. Police Emergency Beacon Light Sweeps across top & edges
      const redFlashAlpha = Math.max(0, Math.sin(policeFlash) * 0.25);
      const blueFlashAlpha = Math.max(0, Math.cos(policeFlash) * 0.25);

      // Red Police Siren Left
      const redGlow = ctx.createRadialGradient(width * 0.1, 0, 10, width * 0.1, 0, width * 0.6);
      redGlow.addColorStop(0, `rgba(225, 29, 72, ${redFlashAlpha})`);
      redGlow.addColorStop(1, 'transparent');
      ctx.fillStyle = redGlow;
      ctx.fillRect(0, 0, width, height);

      // Blue Police Siren Right
      const blueGlow = ctx.createRadialGradient(width * 0.9, 0, 10, width * 0.9, 0, width * 0.6);
      blueGlow.addColorStop(0, `rgba(37, 99, 235, ${blueFlashAlpha})`);
      blueGlow.addColorStop(1, 'transparent');
      ctx.fillStyle = blueGlow;
      ctx.fillRect(0, 0, width, height);

      // 4. Moving AI Radar Laser Scanline
      scanY += 2.5;
      if (scanY > height) scanY = 0;
      const laserGrad = ctx.createLinearGradient(0, scanY - 40, 0, scanY);
      laserGrad.addColorStop(0, 'rgba(225, 29, 72, 0)');
      laserGrad.addColorStop(0.7, 'rgba(225, 29, 72, 0.15)');
      laserGrad.addColorStop(1, 'rgba(225, 29, 72, 0.6)');
      ctx.fillStyle = laserGrad;
      ctx.fillRect(0, scanY - 40, width, 40);

      ctx.strokeStyle = '#E11D48';
      ctx.lineWidth = 2.5;
      ctx.shadowColor = '#E11D48';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.moveTo(0, scanY);
      ctx.lineTo(width, scanY);
      ctx.stroke();
      ctx.shadowBlur = 0;

      // 5. Render Vehicles, Headlight Beams, and AI Violation Targets
      vehicles.forEach((v) => {
        v.y += v.speed;
        v.x = (v.lane + 0.5) * lWidth;

        // Reset vehicle when leaving screen
        if (v.y > height + 100) {
          v.y = -100;
          v.lane = Math.floor(Math.random() * lanes);
          v.isViolating = Math.random() > 0.4;
          v.violation = violationTypes[Math.floor(Math.random() * violationTypes.length)];
          v.plate = plates[Math.floor(Math.random() * plates.length)];
        }

        const vx = v.x - v.width / 2;
        const vy = v.y - v.length / 2;

        // Headlight Beams (Projected forward in direction of motion)
        const beamGrad = ctx.createLinearGradient(v.x, v.y + v.length / 2, v.x, v.y + v.length / 2 + 70);
        beamGrad.addColorStop(0, 'rgba(255, 255, 200, 0.45)');
        beamGrad.addColorStop(1, 'rgba(255, 255, 200, 0)');
        ctx.fillStyle = beamGrad;
        ctx.beginPath();
        ctx.moveTo(v.x - v.width * 0.4, v.y + v.length / 2);
        ctx.lineTo(v.x - v.width * 0.8, v.y + v.length / 2 + 70);
        ctx.lineTo(v.x + v.width * 0.8, v.y + v.length / 2 + 70);
        ctx.lineTo(v.x + v.width * 0.4, v.y + v.length / 2);
        ctx.fill();

        // Taillight Red Glow behind vehicle
        const tailGrad = ctx.createRadialGradient(v.x, v.y - v.length / 2, 2, v.x, v.y - v.length / 2, 25);
        tailGrad.addColorStop(0, 'rgba(239, 68, 68, 0.7)');
        tailGrad.addColorStop(1, 'rgba(239, 68, 68, 0)');
        ctx.fillStyle = tailGrad;
        ctx.fillRect(v.x - 25, v.y - v.length / 2 - 25, 50, 50);

        // Vehicle Body (Motorcycle or Car)
        if (v.isMotorbike) {
          // Motorcycle Silhouette
          ctx.fillStyle = '#1E293B';
          ctx.beginPath();
          ctx.roundRect(vx, vy, v.width, v.length, 6);
          ctx.fill();

          // Rider Helmet
          ctx.fillStyle = v.isViolating ? '#E11D48' : '#38BDF8';
          ctx.beginPath();
          ctx.arc(v.x, v.y - 4, 6, 0, Math.PI * 2);
          ctx.fill();

          // Pillion if triple/double
          if (v.violation.type.includes('TRIPLE')) {
            ctx.fillStyle = '#E11D48';
            ctx.beginPath();
            ctx.arc(v.x, v.y + 7, 5, 0, Math.PI * 2);
            ctx.arc(v.x, v.y + 16, 5, 0, Math.PI * 2);
            ctx.fill();
          }
        } else {
          // Car Body
          ctx.fillStyle = '#131A26';
          ctx.beginPath();
          ctx.roundRect(vx, vy, v.width, v.length, 8);
          ctx.fill();

          // Car Roof / Glass
          ctx.fillStyle = '#0F172A';
          ctx.beginPath();
          ctx.roundRect(vx + 4, vy + 12, v.width - 8, v.length - 24, 4);
          ctx.fill();
        }

        // Taillights
        ctx.fillStyle = '#EF4444';
        ctx.fillRect(vx + 2, vy - 2, 4, 3);
        ctx.fillRect(vx + v.width - 6, vy - 2, 4, 3);

        // Headlights
        ctx.fillStyle = '#FEF08A';
        ctx.fillRect(vx + 2, vy + v.length - 1, 5, 3);
        ctx.fillRect(vx + v.width - 7, vy + v.length - 1, 5, 3);

        // =============================================================
        // AI SPATIAL BOUNDING BOX & VIOLATION ENFORCEMENT HUD
        // =============================================================
        const targetColor = v.isViolating ? '#E11D48' : '#10B981';

        // Bounding Box
        ctx.strokeStyle = targetColor;
        ctx.lineWidth = v.isViolating ? 2 : 1.5;
        const boxPad = 6;
        ctx.strokeRect(vx - boxPad, vy - boxPad, v.width + boxPad * 2, v.length + boxPad * 2);

        // Corner Reticles
        const cornerLen = 7;
        ctx.fillStyle = targetColor;
        // Top-Left
        ctx.fillRect(vx - boxPad - 1, vy - boxPad - 1, cornerLen, 2.5);
        ctx.fillRect(vx - boxPad - 1, vy - boxPad - 1, 2.5, cornerLen);
        // Top-Right
        ctx.fillRect(vx + v.width + boxPad - cornerLen + 1, vy - boxPad - 1, cornerLen, 2.5);
        ctx.fillRect(vx + v.width + boxPad - 1, vy - boxPad - 1, 2.5, cornerLen);
        // Bottom-Left
        ctx.fillRect(vx - boxPad - 1, vy + v.length + boxPad - 1, cornerLen, 2.5);
        ctx.fillRect(vx - boxPad - 1, vy + v.length + boxPad - cornerLen + 1, 2.5, cornerLen);
        // Bottom-Right
        ctx.fillRect(vx + v.width + boxPad - cornerLen + 1, vy + v.length + boxPad - 1, cornerLen, 2.5);
        ctx.fillRect(vx + v.width + boxPad - 1, vy + v.length + boxPad - cornerLen + 1, 2.5, cornerLen);

        // ANPR License Plate Header
        const plateTagWidth = Math.max(v.width + boxPad * 2, 75);
        ctx.fillStyle = v.isViolating ? '#E11D48' : '#0F172A';
        ctx.beginPath();
        ctx.roundRect(vx - boxPad, vy - boxPad - 18, plateTagWidth, 16, [4, 4, 0, 0]);
        ctx.fill();

        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 9px "JetBrains Mono", monospace';
        ctx.fillText(v.plate, vx - boxPad + 4, vy - boxPad - 6);

        // Violation Enforcement Banner
        if (v.isViolating) {
          // Pulsing Target Lock Radar Ring
          v.radarPulse += 0.05;
          const pulseR = 25 + Math.sin(v.radarPulse) * 8;
          ctx.strokeStyle = 'rgba(225, 29, 72, 0.4)';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(v.x, v.y, pulseR, 0, Math.PI * 2);
          ctx.stroke();

          // Violation Notice Box
          const noticeW = 135;
          ctx.fillStyle = 'rgba(225, 29, 72, 0.95)';
          ctx.beginPath();
          ctx.roundRect(vx - boxPad, vy + v.length + boxPad + 2, noticeW, 28, 4);
          ctx.fill();

          ctx.fillStyle = '#FFFFFF';
          ctx.font = 'bold 8.5px "Plus Jakarta Sans", sans-serif';
          ctx.fillText(`🚨 ${v.violation.type}`, vx - boxPad + 4, vy + v.length + boxPad + 13);

          ctx.fillStyle = '#FEF08A';
          ctx.font = 'bold 8px "JetBrains Mono", monospace';
          ctx.fillText(`FINE: ${v.violation.fine} • CAPTURED`, vx - boxPad + 4, vy + v.length + boxPad + 24);
        }
      });

      // 6. HUD Corner CCTV Telemetry Framing
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.font = 'bold 10px "JetBrains Mono", monospace';
      ctx.fillText(`[REC] 🔴 BANGALORE CCTV JUNCTION 04 • ${new Date().toLocaleTimeString()}`, 20, 30);
      ctx.fillText(`AI MULTI-OBJECT DETECTOR: 99.6% • ADVANCED AI VISION`, 20, 48);

      ctx.textAlign = 'right';
      ctx.fillText(`ENFORCEMENT MATRIX: ACTIVE`, width - 20, 30);
      ctx.fillText(`SPEED RADAR: 60 FPS • 0-LATENCY SYNC`, width - 20, 48);
      ctx.textAlign = 'left';

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        width: '100%',
        height: '100%',
        display: 'block',
      }}
    />
  );
};
export default TrafficAnimationCanvas;
