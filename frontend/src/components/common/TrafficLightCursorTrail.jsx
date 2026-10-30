import React, { useEffect, useRef } from 'react';

/**
 * TrafficLightCursorTrail
 * Features:
 * 1. Exactly 3 glowing Traffic Light dots (Red, Yellow, Green) trailing the cursor.
 * 2. Active on both Landing Page and Login Page.
 * 3. When NOT MOVING, the colors AUTOMATICALLY CHANGE & CYCLE through traffic light colors:
 *    🔴 Red -> 🟡 Yellow -> 🟢 Green.
 * 4. Smoothly hides / fades out after 2 seconds without cursor movement.
 * 5. On click, triggers 3 sequential expanding traffic light pulses (Red -> Yellow -> Green).
 */
export const TrafficLightCursorTrail = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationFrameId;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const mouse = {
      x: width / 2,
      y: height / 2,
      lastX: width / 2,
      lastY: height / 2,
      speed: 0,
      active: false,
    };

    // 5-second inactivity auto-hide
    let lastMoveTime = Date.now();
    let currentOpacity = 0;
    const HIDE_TIMEOUT_MS = 5000;

    // Click ripples array
    const clickRipples = [];

    // Continuous color shift cycle tracker
    let colorCycle = 0;

    // Helper to calculate smooth transition between Traffic Light colors:
    // 0 = Red (#EF4444), 1 = Yellow (#F59E0B), 2 = Green (#10B981)
    const getTrafficColor = (cycleValue) => {
      const normalized = ((cycleValue % 3) + 3) % 3;
      let r, g, b;

      if (normalized < 1) {
        // Red (239, 68, 68) -> Yellow (245, 158, 11)
        const t = normalized;
        r = Math.round(239 + (245 - 239) * t);
        g = Math.round(68 + (158 - 68) * t);
        b = Math.round(68 + (11 - 68) * t);
      } else if (normalized < 2) {
        // Yellow (245, 158, 11) -> Green (16, 185, 129)
        const t = normalized - 1;
        r = Math.round(245 + (16 - 245) * t);
        g = Math.round(158 + (185 - 158) * t);
        b = Math.round(11 + (129 - 11) * t);
      } else {
        // Green (16, 185, 129) -> Red (239, 68, 68)
        const t = normalized - 2;
        r = Math.round(16 + (239 - 16) * t);
        g = Math.round(185 + (68 - 185) * t);
        b = Math.round(129 + (68 - 129) * t);
      }

      return {
        rgb: `${r}, ${g}, ${b}`,
        color: `rgb(${r}, ${g}, ${b})`,
      };
    };

    // Exactly 3 traffic light dots
    const dots = [
      {
        radius: 7,
        x: width / 2,
        y: height / 2,
        ease: 0.36,
        colorOffset: 0, // Starts at Red
      },
      {
        radius: 6.5,
        x: width / 2,
        y: height / 2,
        ease: 0.28,
        colorOffset: 1, // Starts at Yellow
      },
      {
        radius: 6,
        x: width / 2,
        y: height / 2,
        ease: 0.22,
        colorOffset: 2, // Starts at Green
      },
    ];

    const handleMouseMove = (e) => {
      mouse.active = true;
      const dx = e.clientX - mouse.lastX;
      const dy = e.clientY - mouse.lastY;
      mouse.speed = Math.hypot(dx, dy);
      mouse.lastX = mouse.x;
      mouse.lastY = mouse.y;
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      lastMoveTime = Date.now(); // Reset 2-second timer
    };

    const handleMouseLeave = () => {
      mouse.active = false;
    };

    // Click handler: trigger sequential Red -> Yellow -> Green circle blinks
    const handleClick = (e) => {
      lastMoveTime = Date.now();
      mouse.active = true;
      mouse.x = e.clientX;
      mouse.y = e.clientY;

      clickRipples.push({
        x: e.clientX,
        y: e.clientY,
        startTime: Date.now(),
      });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('click', handleClick, { passive: true });

    // Click pulse definition
    const CLICK_LIGHTS = [
      { color: '#EF4444', rgb: '239, 68, 68', delay: 0 },
      { color: '#F59E0B', rgb: '245, 158, 11', delay: 110 },
      { color: '#10B981', rgb: '16, 185, 129', delay: 220 },
    ];
    const PULSE_DURATION = 320;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      const now = Date.now();
      const isIdle = (now - lastMoveTime) >= HIDE_TIMEOUT_MS;
      const isNotMoving = mouse.speed < 0.8;

      // Automatically advance color cycle faster when NOT moving
      // so colors change dynamically through Red -> Yellow -> Green while resting!
      if (isNotMoving) {
        colorCycle += 0.038; // Smooth automatic traffic light color shift
      } else {
        colorCycle += 0.012;
      }

      // Smooth decay of mouse speed
      mouse.speed *= 0.88;

      // Fade in on move, fade out after 2s of stillness
      if (mouse.active && !isIdle) {
        currentOpacity = Math.min(1, currentOpacity + 0.08);
      } else {
        currentOpacity = Math.max(0, currentOpacity - 0.04);
      }

      // 1. Draw Trailing 3 Dots with Dynamic Automatic Color Changes
      if (currentOpacity > 0.01) {
        // Dot 1 trails cursor
        dots[0].x += (mouse.x - dots[0].x) * dots[0].ease;
        dots[0].y += (mouse.y - dots[0].y) * dots[0].ease;

        // Dot 2 trails Dot 1
        dots[1].x += (dots[0].x - dots[1].x) * dots[1].ease;
        dots[1].y += (dots[0].y - dots[1].y) * dots[1].ease;

        // Dot 3 trails Dot 2
        dots[2].x += (dots[1].x - dots[2].x) * dots[2].ease;
        dots[2].y += (dots[1].y - dots[2].y) * dots[2].ease;

        ctx.save();
        ctx.globalAlpha = currentOpacity;

        // Render each dot with its automatically cycling traffic light color
        for (let i = dots.length - 1; i >= 0; i--) {
          const dot = dots[i];
          const dynamicColor = getTrafficColor(colorCycle + dot.colorOffset);

          ctx.save();
          // Soft ambient neon glow
          const grad = ctx.createRadialGradient(dot.x, dot.y, 0, dot.x, dot.y, dot.radius * 2.8);
          grad.addColorStop(0, `rgba(${dynamicColor.rgb}, 0.75)`);
          grad.addColorStop(0.5, `rgba(${dynamicColor.rgb}, 0.25)`);
          grad.addColorStop(1, 'transparent');

          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(dot.x, dot.y, dot.radius * 2.8, 0, Math.PI * 2);
          ctx.fill();

          // Vibrant neon solid circle
          ctx.fillStyle = dynamicColor.color;
          ctx.shadowColor = dynamicColor.color;
          ctx.shadowBlur = 12;
          ctx.beginPath();
          ctx.arc(dot.x, dot.y, dot.radius, 0, Math.PI * 2);
          ctx.fill();

          // Bright glossy white highlight center
          ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
          ctx.shadowBlur = 0;
          ctx.beginPath();
          ctx.arc(dot.x, dot.y, dot.radius * 0.35, 0, Math.PI * 2);
          ctx.fill();

          ctx.restore();
        }

        ctx.restore();
      }

      // 2. Render Click Circles (Blinks Red -> Yellow -> Green One-by-One)
      for (let i = clickRipples.length - 1; i >= 0; i--) {
        const ripple = clickRipples[i];
        const elapsed = now - ripple.startTime;

        let activePulseCount = 0;

        CLICK_LIGHTS.forEach((light) => {
          const pulseElapsed = elapsed - light.delay;

          if (pulseElapsed >= 0 && pulseElapsed < PULSE_DURATION) {
            activePulseCount++;
            const progress = pulseElapsed / PULSE_DURATION;

            const radius = 3 + progress * 20;
            const alpha = Math.sin(progress * Math.PI) * 0.95;

            ctx.save();
            ctx.shadowColor = light.color;
            ctx.shadowBlur = 14;

            // Outer expanding ring
            ctx.strokeStyle = `rgba(${light.rgb}, ${alpha})`;
            ctx.lineWidth = 2.5 * (1 - progress * 0.5);
            ctx.beginPath();
            ctx.arc(ripple.x, ripple.y, radius, 0, Math.PI * 2);
            ctx.stroke();

            // Inner soft glowing fill
            const fillGrad = ctx.createRadialGradient(ripple.x, ripple.y, 0, ripple.x, ripple.y, radius);
            fillGrad.addColorStop(0, `rgba(${light.rgb}, ${alpha * 0.6})`);
            fillGrad.addColorStop(0.7, `rgba(${light.rgb}, ${alpha * 0.2})`);
            fillGrad.addColorStop(1, 'transparent');
            ctx.fillStyle = fillGrad;
            ctx.beginPath();
            ctx.arc(ripple.x, ripple.y, radius, 0, Math.PI * 2);
            ctx.fill();

            // Bright center blink dot
            ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.9})`;
            ctx.beginPath();
            ctx.arc(ripple.x, ripple.y, 3, 0, Math.PI * 2);
            ctx.fill();

            ctx.restore();
          } else if (pulseElapsed < 0) {
            activePulseCount++;
          }
        });

        if (activePulseCount === 0 || elapsed > 700) {
          clickRipples.splice(i, 1);
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('click', handleClick);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 9999,
      }}
    />
  );
};
