import React, { useRef, useEffect } from 'react';

export const LiveCorridorCanvas = ({
  cameraId = 'CAM-01',
  corridorType = 'highway', // 'highway' | 'junction' | 'expressway' | 'city'
  isStreaming = true,
}) => {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const vehiclesRef = useRef([]);

  // Initialize corridor vehicles
  useEffect(() => {
    const configs = {
      highway: [
        { x: 50, y: 40, speed: 2.8, type: 'car', color: '#38BDF8', plate: 'KA 05 MN 4821', speedKm: 84, alert: 'Overspeeding' },
        { x: 220, y: 95, speed: 1.9, type: 'bike', color: '#EF4444', plate: 'KA 02 HV 6226', speedKm: 52, alert: 'No Helmet' },
        { x: 380, y: 48, speed: 3.2, type: 'suv', color: '#10B981', plate: 'DL 01 AA 9912', speedKm: 68, alert: null },
      ],
      junction: [
        { x: 80, y: 65, speed: 1.6, type: 'bike', color: '#F59E0B', plate: 'MH 12 AB 3456', speedKm: 42, alert: 'Triple Riding' },
        { x: 280, y: 95, speed: 2.1, type: 'car', color: '#818CF8', plate: 'KA 03 MM 7711', speedKm: 58, alert: null },
      ],
      expressway: [
        { x: 40, y: 35, speed: 3.4, type: 'suv', color: '#38BDF8', plate: 'KA 01 EK 5522', speedKm: 92, alert: 'Overspeeding' },
        { x: 200, y: 85, speed: 2.6, type: 'car', color: '#F43F5E', plate: 'DL 08 CC 3311', speedKm: 74, alert: 'Seat Belt Violation' },
        { x: 340, y: 42, speed: 3.0, type: 'car', color: '#A855F7', plate: 'MH 02 BB 1029', speedKm: 80, alert: null },
      ],
      city: [
        { x: 100, y: 75, speed: 1.5, type: 'bike', color: '#EF4444', plate: 'KA 04 JJ 8833', speedKm: 38, alert: 'No Helmet' },
        { x: 260, y: 45, speed: 2.0, type: 'car', color: '#10B981', plate: 'KA 51 ME 4410', speedKm: 48, alert: null },
      ],
    };

    vehiclesRef.current = JSON.parse(JSON.stringify(configs[corridorType] || configs.highway));
  }, [corridorType]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let scanLineY = 0;
    let scanDirection = 1;

    const render = () => {
      const w = canvas.width;
      const h = canvas.height;

      // 1. Asphalt Ground
      ctx.fillStyle = '#0B1120';
      ctx.fillRect(0, 0, w, h);

      // 2. Road surface
      ctx.fillStyle = '#1E293B';
      ctx.fillRect(0, 25, w, h - 50);

      // 3. Lane Dash Dividers
      ctx.strokeStyle = '#FCD34D';
      ctx.lineWidth = 2;
      ctx.setLineDash([16, 14]);
      ctx.beginPath();
      ctx.moveTo(0, h / 2);
      ctx.lineTo(w, h / 2);
      ctx.stroke();
      ctx.setLineDash([]);

      // 4. Optical Radar Grid
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.08)';
      ctx.lineWidth = 1;
      for (let x = 0; x < w; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }

      // 5. Update and Draw Moving Vehicles
      vehiclesRef.current.forEach((veh) => {
        if (isStreaming) {
          veh.x -= veh.speed * 1.5;
          if (veh.x < -80) {
            veh.x = w + 40 + Math.random() * 60;
          }
        }

        const isBike = veh.type === 'bike';
        const vW = isBike ? 36 : 68;
        const vH = isBike ? 22 : 34;

        // Vehicle Body
        ctx.fillStyle = veh.color;
        if (isBike) {
          ctx.beginPath();
          ctx.roundRect(veh.x, veh.y, vW, vH, 4);
          ctx.fill();
          // Rider helmet/head
          ctx.fillStyle = veh.alert ? '#EF4444' : '#FCD34D';
          ctx.beginPath();
          ctx.arc(veh.x + 18, veh.y + 11, 5, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.beginPath();
          ctx.roundRect(veh.x, veh.y, vW, vH, 5);
          ctx.fill();
          // Windshield
          ctx.fillStyle = '#0F172A';
          ctx.fillRect(veh.x + 16, veh.y + 5, 22, vH - 10);
          // Headlights
          ctx.fillStyle = '#FEF08A';
          ctx.fillRect(veh.x - 2, veh.y + 3, 3, 6);
          ctx.fillRect(veh.x - 2, veh.y + vH - 9, 3, 6);
        }

        // ANPR Bounding Box Overlay
        ctx.strokeStyle = veh.alert ? '#EF4444' : '#38BDF8';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(veh.x - 4, veh.y - 4, vW + 8, vH + 8);

        // Vehicle Tag
        ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
        ctx.fillRect(veh.x - 4, veh.y - 18, 80, 13);
        ctx.fillStyle = veh.alert ? '#F87171' : '#38BDF8';
        ctx.font = 'bold 8px monospace';
        ctx.fillText(`${veh.plate.slice(0, 10)}`, veh.x - 2, veh.y - 8);
      });

      // 6. Laser Scanner Line
      if (isStreaming) {
        scanLineY += scanDirection * 1.5;
        if (scanLineY > h || scanLineY < 0) {
          scanDirection *= -1;
        }

        ctx.strokeStyle = 'rgba(56, 189, 248, 0.5)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, scanLineY);
        ctx.lineTo(w, scanLineY);
        ctx.stroke();
      }

      // 7. Live Camera HUD
      ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
      ctx.fillRect(6, 6, 150, 18);
      ctx.fillStyle = isStreaming ? '#22C55E' : '#94A3B8';
      ctx.beginPath();
      ctx.arc(14, 15, 3, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 9px monospace';
      ctx.fillText(`${cameraId} · ${isStreaming ? 'LIVE 1080P' : 'PAUSED'} · 30FPS`, 22, 18);

      if (isStreaming) {
        animRef.current = requestAnimationFrame(render);
      }
    };

    animRef.current = requestAnimationFrame(render);

    return () => {
      if (animRef.current) {
        cancelAnimationFrame(animRef.current);
      }
    };
  }, [isStreaming, cameraId]);

  return (
    <canvas
      ref={canvasRef}
      width={480}
      height={270}
      style={{
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        display: 'block',
      }}
    />
  );
};
