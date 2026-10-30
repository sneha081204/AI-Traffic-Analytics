import React, { useRef, useEffect, useState } from 'react';
import { Maximize2, Play, Pause, AlertTriangle, Shield, Radio, Sparkles } from 'lucide-react';

export const CctvLivePlayer = ({
  cameraId = 'CAM-01',
  locationName = 'Sector 4 Highway Corridor',
  officerName = 'Traffic Inspector',
  officerBadge = 'TP-0000',
  corridorType = 'highway', // 'highway' | 'junction' | 'expressway' | 'city'
  isStreaming = true,
  onInspect,
}) => {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(isStreaming);
  const [currentViolation, setCurrentViolation] = useState(null);

  useEffect(() => {
    setIsPlaying(isStreaming);
  }, [isStreaming]);

  // Vehicle states with 3D perspective coordinates (z: 0 [distant] to 1 [near])
  const vehiclesRef = useRef([
    { id: 1, z: 0.1, lane: 0, speed: 0.007, type: 'car', color: '#38BDF8', plate: 'KA 05 MN 4821', speedKm: 84, alert: 'Over-speeding' },
    { id: 2, z: 0.45, lane: 1, speed: 0.005, type: 'bike', color: '#EF4444', plate: 'KA 02 HV 6226', speedKm: 52, alert: 'No Helmet' },
    { id: 3, z: 0.75, lane: 2, speed: 0.008, type: 'suv', color: '#10B981', plate: 'DL 01 AA 9912', speedKm: 68, alert: null },
    { id: 4, z: 0.25, lane: 1, speed: 0.004, type: 'bike', color: '#F59E0B', plate: 'MH 12 AB 3456', speedKm: 42, alert: 'Triple Riding' },
  ]);

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

      // 1. Sky & Distant City Horizon
      const skyGrad = ctx.createLinearGradient(0, 0, 0, h * 0.35);
      skyGrad.addColorStop(0, '#020617');
      skyGrad.addColorStop(1, '#0F172A');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, w, h * 0.35);

      // Distant City Skyline Silhouettes
      ctx.fillStyle = '#1E293B';
      const buildings = [
        { x: 20, w: 35, h: 45 }, { x: 60, w: 25, h: 60 }, { x: 90, w: 40, h: 35 },
        { x: 140, w: 50, h: 55 }, { x: 200, w: 30, h: 70 }, { x: 240, w: 45, h: 40 },
        { x: 300, w: 35, h: 65 }, { x: 345, w: 55, h: 50 }, { x: 410, w: 40, h: 60 },
      ];
      buildings.forEach((b) => {
        ctx.fillRect(b.x, h * 0.35 - b.h, b.w, b.h);
      });

      // 2. 3D Perspective Road Asphalt
      const roadTopY = h * 0.35;
      const roadTopW = w * 0.3;
      const roadTopX = (w - roadTopW) / 2;

      ctx.fillStyle = '#111827';
      ctx.beginPath();
      ctx.moveTo(roadTopX, roadTopY);
      ctx.lineTo(roadTopX + roadTopW, roadTopY);
      ctx.lineTo(w + 30, h);
      ctx.lineTo(-30, h);
      ctx.closePath();
      ctx.fill();

      // Road Shoulders / Curbs
      ctx.strokeStyle = '#E2E8F0';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(roadTopX, roadTopY);
      ctx.lineTo(-30, h);
      ctx.moveTo(roadTopX + roadTopW, roadTopY);
      ctx.lineTo(w + 30, h);
      ctx.stroke();

      // Perspective Lane Dividers (3 Lanes)
      for (let l = 1; l <= 2; l++) {
        const topLaneX = roadTopX + (roadTopW / 3) * l;
        const botLaneX = -30 + ((w + 60) / 3) * l;

        ctx.strokeStyle = '#FCD34D';
        ctx.lineWidth = 2;
        ctx.setLineDash([12, 10]);
        ctx.beginPath();
        ctx.moveTo(topLaneX, roadTopY);
        ctx.lineTo(botLaneX, h);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // 3. Optical ANPR Radar Grid Overlay
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.12)';
      ctx.lineWidth = 1;
      for (let y = roadTopY; y < h; y += 30) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      // 4. Update and Draw Moving Vehicles with 3D Depth Scaling
      const sortedVehicles = [...vehiclesRef.current].sort((a, b) => a.z - b.z);

      sortedVehicles.forEach((veh) => {
        if (isPlaying) {
          veh.z += veh.speed;
          if (veh.z > 1.05) {
            veh.z = 0.05 + Math.random() * 0.1;
            veh.lane = Math.floor(Math.random() * 3);
          }
        }

        // Perspective Interpolation
        const z = Math.min(Math.max(veh.z, 0.05), 1);
        const curRoadW = roadTopW + (w + 60 - roadTopW) * z;
        const curRoadLeft = roadTopX + (-30 - roadTopX) * z;
        const laneW = curRoadW / 3;
        const vCenterX = curRoadLeft + laneW * (veh.lane + 0.5);
        const vCenterY = roadTopY + (h - roadTopY) * z;

        // Size scaling with depth
        const scale = 0.3 + z * 0.9;
        const isBike = veh.type === 'bike';
        const vW = (isBike ? 28 : 56) * scale;
        const vH = (isBike ? 38 : 58) * scale;
        const vX = vCenterX - vW / 2;
        const vY = vCenterY - vH / 2;

        // Draw Vehicle Shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
        ctx.beginPath();
        ctx.ellipse(vCenterX, vY + vH + 2, vW * 0.6, 4 * scale, 0, 0, Math.PI * 2);
        ctx.fill();

        // Draw Vehicle Body
        ctx.fillStyle = veh.color;
        if (isBike) {
          // Motorcycle body
          ctx.beginPath();
          ctx.roundRect(vX, vY, vW, vH, 4 * scale);
          ctx.fill();
          // Rider helmet
          ctx.fillStyle = veh.alert ? '#EF4444' : '#FCD34D';
          ctx.beginPath();
          ctx.arc(vCenterX, vY + vH * 0.3, 6 * scale, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Car / SUV Body
          ctx.beginPath();
          ctx.roundRect(vX, vY, vW, vH, 6 * scale);
          ctx.fill();
          // Rear/Front Windshield
          ctx.fillStyle = '#0F172A';
          ctx.fillRect(vX + 4 * scale, vY + 6 * scale, vW - 8 * scale, vH * 0.35);
          // Tail lights
          ctx.fillStyle = '#EF4444';
          ctx.fillRect(vX + 2, vY + vH - 4 * scale, 6 * scale, 3 * scale);
          ctx.fillRect(vX + vW - 8 * scale, vY + vH - 4 * scale, 6 * scale, 3 * scale);
        }

        // 5. Dynamic ANPR Bounding Box & Target Crosshairs
        if (z > 0.2) {
          ctx.strokeStyle = veh.alert ? '#EF4444' : '#38BDF8';
          ctx.lineWidth = 1.5;
          ctx.strokeRect(vX - 4, vY - 4, vW + 8, vH + 8);

          // Plate & Infraction Label Tag
          const tagW = Math.max(80 * scale, 68);
          const tagH = 14 * scale;
          ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
          ctx.fillRect(vX - 4, vY - 18 * scale, tagW, Math.max(tagH, 13));

          ctx.fillStyle = veh.alert ? '#F87171' : '#38BDF8';
          ctx.font = `bold ${Math.max(8 * scale, 8)}px monospace`;
          ctx.fillText(`${veh.plate.slice(0, 10)}`, vX - 2, vY - 6 * scale);

          if (veh.alert && z > 0.45) {
            ctx.fillStyle = '#EF4444';
            ctx.font = `bold ${Math.max(7 * scale, 7)}px sans-serif`;
            ctx.fillText(`! ${veh.alert}`, vX + tagW - 45, vY - 6 * scale);
          }
        }
      });

      // 6. Laser Scanner Sweep Line
      if (isPlaying) {
        scanLineY += scanDirection * 2;
        if (scanLineY > h || scanLineY < roadTopY) {
          scanDirection *= -1;
        }

        const scanGrad = ctx.createLinearGradient(0, scanLineY - 6, 0, scanLineY + 6);
        scanGrad.addColorStop(0, 'rgba(56, 189, 248, 0)');
        scanGrad.addColorStop(0.5, 'rgba(56, 189, 248, 0.7)');
        scanGrad.addColorStop(1, 'rgba(56, 189, 248, 0)');
        ctx.fillStyle = scanGrad;
        ctx.fillRect(0, scanLineY - 6, w, 12);
      }

      // 7. Top HUD Metadata Bar
      ctx.fillStyle = 'rgba(2, 6, 23, 0.85)';
      ctx.fillRect(8, 8, 240, 22);
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1;
      ctx.strokeRect(8, 8, 240, 22);

      ctx.fillStyle = isPlaying ? '#22C55E' : '#EF4444';
      ctx.beginPath();
      ctx.arc(18, 19, 4, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 9px monospace';
      ctx.fillText(`${cameraId} · ${isPlaying ? 'LIVE 1080P' : 'PAUSED'} · 60FPS · ANPR ON`, 28, 22);

      // Top Right Timestamp
      const nowStr = new Date().toLocaleTimeString();
      ctx.fillStyle = 'rgba(2, 6, 23, 0.85)';
      ctx.fillRect(w - 110, 8, 102, 22);
      ctx.strokeRect(w - 110, 8, 102, 22);
      ctx.fillStyle = '#38BDF8';
      ctx.font = 'bold 9px monospace';
      ctx.fillText(nowStr, w - 100, 22);

      if (isPlaying) {
        animRef.current = requestAnimationFrame(render);
      }
    };

    animRef.current = requestAnimationFrame(render);

    return () => {
      if (animRef.current) {
        cancelAnimationFrame(animRef.current);
      }
    };
  }, [isPlaying, cameraId]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', backgroundColor: '#020617' }}>
      <canvas
        ref={canvasRef}
        width={560}
        height={315}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          display: 'block',
        }}
      />

      {/* Floating Control Overlay */}
      <div
        style={{
          position: 'absolute',
          bottom: '8px',
          right: '8px',
          display: 'flex',
          gap: '0.35rem',
          zIndex: 10,
        }}
      >
        <button
          type="button"
          onClick={() => setIsPlaying(!isPlaying)}
          title={isPlaying ? 'Pause Feed' : 'Resume Feed'}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '26px',
            height: '26px',
            borderRadius: '4px',
            border: '1px solid rgba(255,255,255,0.3)',
            backgroundColor: 'rgba(15, 23, 42, 0.85)',
            color: '#FFFFFF',
            cursor: 'pointer',
          }}
        >
          {isPlaying ? <Pause size={12} /> : <Play size={12} />}
        </button>

        {onInspect && (
          <button
            type="button"
            onClick={onInspect}
            title="Inspect HD Feed"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '26px',
              height: '26px',
              borderRadius: '4px',
              border: '1px solid rgba(255,255,255,0.3)',
              backgroundColor: 'rgba(37, 99, 235, 0.9)',
              color: '#FFFFFF',
              cursor: 'pointer',
            }}
          >
            <Maximize2 size={12} />
          </button>
        )}
      </div>
    </div>
  );
};
