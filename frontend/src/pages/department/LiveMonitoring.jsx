import React, { useState, useMemo } from 'react';
import {
  Activity,
  Camera,
  Video,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Layers,
  Sparkles,
  Maximize2,
  Shield,
  Radio,
  Eye,
  Sliders,
  MapPin,
  Clock,
  Car,
  Play,
  Pause,
  Grid,
  Square,
  X,
  Send,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { PlateBadge } from '../../components/common/PlateBadge';
import { CctvLivePlayer } from '../../components/camera/CctvLivePlayer';

export const DepartmentLiveMonitoring = () => {
  const { officers, violations, aiConfig, addViolation } = useApp();
  const [filterMode, setFilterMode] = useState('all'); // 'all' | 'active' | 'high_incident'
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'focus'
  const [focusedCamId, setFocusedCamId] = useState(null);
  const [inspectedCam, setInspectedCam] = useState(null);
  const [allStreaming, setAllStreaming] = useState(true);

  // Dynamic Camera Feeds derived from Database Officers and Active Locations
  const cameras = useMemo(() => {
    if (!officers || officers.length === 0) {
      return [];
    }

    const corridorTypes = ['highway', 'city', 'expressway', 'junction'];

    return officers.map((off, idx) => {
      const offViolations = violations.filter(
        (v) => v.officerName === off.name || v.officerBadge === off.badge || v.location === off.assignedArea
      );
      const isActive = off.status === 'Active' || off.cameraActive !== false;
      return {
        id: `CAM-${String(idx + 1).padStart(2, '0')}`,
        rawId: off.id,
        location: off.assignedArea || `Metropolitan Sector ${idx + 1} Corridor`,
        officer: off.name,
        badge: off.badge,
        status: isActive ? 'LIVE 1080P' : 'STANDBY',
        fps: isActive ? 60 : 0,
        detections: offViolations.length || off.violationsDetected || 0,
        corridorType: corridorTypes[idx % corridorTypes.length],
        active: isActive,
      };
    });
  }, [officers, violations]);

  // Set default focused camera on load
  const activeFocusCam = useMemo(() => {
    if (focusedCamId) {
      return cameras.find((c) => c.id === focusedCamId) || cameras[0];
    }
    return cameras[0];
  }, [cameras, focusedCamId]);

  const activeFeedsCount = cameras.filter((c) => c.active).length;

  const filteredCameras = useMemo(() => {
    if (filterMode === 'active') return cameras.filter((c) => c.active);
    if (filterMode === 'high_incident') return cameras.filter((c) => c.detections > 0);
    return cameras;
  }, [cameras, filterMode]);

  const recentCorridorIncidents = useMemo(() => {
    return violations.slice(0, 8);
  }, [violations]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Top Header & Global Status */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <h1 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
              Department Central Live CCTV Surveillance Grid
            </h1>
            <span
              style={{
                fontSize: '0.72rem',
                padding: '0.2rem 0.65rem',
                borderRadius: '999px',
                backgroundColor: '#DCFCE7',
                color: '#15803D',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
              }}
            >
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#16A34A' }} />
              HQ LIVE SURVEILLANCE ACTIVE
            </span>
          </div>
          <p style={{ fontSize: '0.82rem', color: '#64748B', margin: '0.25rem 0 0 0' }}>
            Real-time optical CCTV feeds streamed from field stations · Automated AI Vision Engine Active
          </p>
        </div>

        {/* Global Surveillance Metric Pills */}
        <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div
            style={{
              padding: '0.45rem 0.85rem',
              borderRadius: '8px',
              backgroundColor: '#EFF6FF',
              border: '1px solid #BFDBFE',
              color: '#1D4ED8',
              fontWeight: 700,
              fontSize: '0.78rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}
          >
            <Radio size={14} />
            <span>{activeFeedsCount} Active CCTV Nodes</span>
          </div>

          <div
            style={{
              padding: '0.45rem 0.85rem',
              borderRadius: '8px',
              backgroundColor: '#F0FDF4',
              border: '1px solid #BBF7D0',
              color: '#15803D',
              fontWeight: 700,
              fontSize: '0.78rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}
          >
            <Sparkles size={14} />
            <span>HQ AI Connected</span>
          </div>
        </div>
      </div>

      {/* Surveillance Control Bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: '#FFFFFF',
          padding: '0.75rem 1.25rem',
          borderRadius: '10px',
          border: '1px solid #CBD5E1',
          flexWrap: 'wrap',
          gap: '0.75rem',
        }}
      >
        {/* Left: View Mode Switches */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ display: 'flex', backgroundColor: '#F1F5F9', padding: '0.2rem', borderRadius: '7px', border: '1px solid #E2E8F0' }}>
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.35rem 0.75rem',
                borderRadius: '5px',
                border: 'none',
                backgroundColor: viewMode === 'grid' ? '#FFFFFF' : 'transparent',
                color: viewMode === 'grid' ? '#2563EB' : '#64748B',
                fontWeight: 700,
                fontSize: '0.75rem',
                cursor: 'pointer',
                boxShadow: viewMode === 'grid' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              }}
            >
              <Grid size={14} />
              <span>Multi-Matrix Grid</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('focus')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.35rem 0.75rem',
                borderRadius: '5px',
                border: 'none',
                backgroundColor: viewMode === 'focus' ? '#FFFFFF' : 'transparent',
                color: viewMode === 'focus' ? '#2563EB' : '#64748B',
                fontWeight: 700,
                fontSize: '0.75rem',
                cursor: 'pointer',
                boxShadow: viewMode === 'focus' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              }}
            >
              <Maximize2 size={14} />
              <span>Focus Command View</span>
            </button>
          </div>

          <div style={{ display: 'flex', backgroundColor: '#F1F5F9', padding: '0.2rem', borderRadius: '7px', border: '1px solid #E2E8F0' }}>
            <button
              type="button"
              onClick={() => setFilterMode('all')}
              style={{
                padding: '0.35rem 0.65rem',
                borderRadius: '5px',
                border: 'none',
                backgroundColor: filterMode === 'all' ? '#FFFFFF' : 'transparent',
                color: filterMode === 'all' ? '#0F172A' : '#64748B',
                fontWeight: 700,
                fontSize: '0.75rem',
                cursor: 'pointer',
              }}
            >
              All ({cameras.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterMode('active')}
              style={{
                padding: '0.35rem 0.65rem',
                borderRadius: '5px',
                border: 'none',
                backgroundColor: filterMode === 'active' ? '#FFFFFF' : 'transparent',
                color: filterMode === 'active' ? '#0F172A' : '#64748B',
                fontWeight: 700,
                fontSize: '0.75rem',
                cursor: 'pointer',
              }}
            >
              Active Streams
            </button>
            <button
              type="button"
              onClick={() => setFilterMode('high_incident')}
              style={{
                padding: '0.35rem 0.65rem',
                borderRadius: '5px',
                border: 'none',
                backgroundColor: filterMode === 'high_incident' ? '#FFFFFF' : 'transparent',
                color: filterMode === 'high_incident' ? '#0F172A' : '#64748B',
                fontWeight: 700,
                fontSize: '0.75rem',
                cursor: 'pointer',
              }}
            >
              High Violations
            </button>
          </div>
        </div>

        {/* Right: Pause All / Resume Controls */}
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <button
            type="button"
            onClick={() => setAllStreaming(!allStreaming)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.45rem 0.85rem',
              borderRadius: '7px',
              border: '1px solid #CBD5E1',
              backgroundColor: allStreaming ? '#FEF2F2' : '#F0FDF4',
              color: allStreaming ? '#DC2626' : '#15803D',
              fontWeight: 700,
              fontSize: '0.75rem',
              cursor: 'pointer',
            }}
          >
            {allStreaming ? <Pause size={13} /> : <Play size={13} />}
            <span>{allStreaming ? 'Pause All Live Feeds' : 'Resume All Streams'}</span>
          </button>
        </div>
      </div>

      {/* Main Multi-Camera Surveillance Matrix */}
      {viewMode === 'focus' && activeFocusCam ? (
        /* Focus Command View: 1 Huge Primary Viewport + 3 Sub-feeds */
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)', gap: '1.5rem', alignItems: 'start' }}>
          {/* Main Focus Feed */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '12px',
              border: '2px solid #2563EB',
              overflow: 'hidden',
              boxShadow: '0 4px 14px rgba(37,99,235,0.12)',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div style={{ position: 'relative', height: '420px', backgroundColor: '#020617' }}>
              <CctvLivePlayer
                cameraId={activeFocusCam.id}
                locationName={activeFocusCam.location}
                officerName={activeFocusCam.officer}
                officerBadge={activeFocusCam.badge}
                corridorType={activeFocusCam.corridorType}
                isStreaming={allStreaming && activeFocusCam.active}
                onInspect={() => setInspectedCam(activeFocusCam)}
              />
            </div>
            <div style={{ padding: '1rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FFFFFF' }}>
              <div>
                <div style={{ fontWeight: 800, fontSize: '1rem', color: '#0F172A' }}>
                  {activeFocusCam.location}
                </div>
                <div style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '0.15rem' }}>
                  Station Officer: <strong>{activeFocusCam.officer}</strong> ({activeFocusCam.badge}) · AI ANPR Confidence: <strong>98.4%</strong>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setInspectedCam(activeFocusCam)}
                  style={{
                    padding: '0.5rem 1rem',
                    borderRadius: '7px',
                    backgroundColor: '#2563EB',
                    color: '#FFFFFF',
                    border: 'none',
                    fontWeight: 700,
                    fontSize: '0.78rem',
                    cursor: 'pointer',
                  }}
                >
                  Inspect Full Screen →
                </button>
              </div>
            </div>
          </div>

          {/* Side Thumbnail List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0F172A' }}>
              Switch Camera Feed
            </div>
            {cameras.map((c) => (
              <div
                key={c.id}
                onClick={() => setFocusedCamId(c.id)}
                style={{
                  padding: '0.75rem',
                  borderRadius: '10px',
                  backgroundColor: activeFocusCam.id === c.id ? '#EFF6FF' : '#FFFFFF',
                  border: activeFocusCam.id === c.id ? '2px solid #2563EB' : '1px solid #E2E8F0',
                  cursor: 'pointer',
                  display: 'flex',
                  gap: '0.75rem',
                  alignItems: 'center',
                }}
              >
                <div style={{ width: '80px', height: '50px', borderRadius: '6px', overflow: 'hidden', flexShrink: 0 }}>
                  <CctvLivePlayer
                    cameraId={c.id}
                    corridorType={c.corridorType}
                    isStreaming={allStreaming && c.active}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: '0.82rem', color: '#0F172A' }}>
                    {c.id} • {c.location}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#64748B' }}>
                    Officer: {c.officer} · {c.detections} Logged
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Multi-Matrix Grid View: 2x2 or 3x3 Live CCTV Grid + Incident Stream */
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.9fr) minmax(0, 1fr)', gap: '1.5rem', alignItems: 'start' }}>
          {/* Left: Multi-Camera Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
            {filteredCameras.map((cam) => (
              <div
                key={cam.id}
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '12px',
                  border: '1px solid #CBD5E1',
                  overflow: 'hidden',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'all 0.2s',
                }}
              >
                {/* 3D Real-Time CCTV Feed Canvas Window */}
                <div style={{ position: 'relative', height: '210px', backgroundColor: '#020617', overflow: 'hidden' }}>
                  <CctvLivePlayer
                    cameraId={cam.id}
                    locationName={cam.location}
                    officerName={cam.officer}
                    officerBadge={cam.badge}
                    corridorType={cam.corridorType}
                    isStreaming={allStreaming && cam.active}
                    onInspect={() => setInspectedCam(cam)}
                  />
                </div>

                {/* Footer Metadata */}
                <div style={{ padding: '0.85rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontWeight: 800, fontSize: '0.88rem', color: '#0F172A' }}>
                      {cam.location}
                    </div>
                    <button
                      type="button"
                      onClick={() => setInspectedCam(cam)}
                      style={{
                        padding: '0.25rem 0.55rem',
                        borderRadius: '6px',
                        border: '1px solid #CBD5E1',
                        backgroundColor: '#F8FAFC',
                        color: '#2563EB',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      Inspect Feed
                    </button>
                  </div>

                  <div style={{ fontSize: '0.74rem', color: '#64748B', display: 'flex', justifyContent: 'space-between' }}>
                    <span>Officer: <strong>{cam.officer}</strong> ({cam.badge})</span>
                    <span style={{ fontWeight: 700, color: '#2563EB' }}>{cam.detections} Logged</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Right: Live Corridor Incident Ticker */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '12px',
              border: '1px solid #CBD5E1',
              padding: '1.25rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
            }}
          >
            <div>
              <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <AlertTriangle size={17} color="#EA580C" />
                <span>Live Corridor Incident Stream</span>
              </div>
              <div style={{ fontSize: '0.74rem', color: '#64748B', marginTop: '0.15rem' }}>
                Real-time violations captured across department cameras
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', maxHeight: '560px', overflowY: 'auto' }}>
              {recentCorridorIncidents.map((v) => (
                <div
                  key={v.id}
                  style={{
                    padding: '0.75rem 0.85rem',
                    borderRadius: '8px',
                    backgroundColor: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.82rem', color: '#0F172A' }}>
                      {v.violationType}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                      <PlateBadge plate={v.vehicleNumber} size="sm" />
                      <span style={{ fontSize: '0.7rem', color: '#64748B' }}>{v.vehicleType}</span>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 800, color: '#DC2626', fontSize: '0.88rem' }}>
                      ₹{Number(v.fineAmount || 1000).toLocaleString()}
                    </div>
                    <div style={{ fontSize: '0.68rem', color: '#64748B', fontFamily: 'monospace' }}>
                      {v.time}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* HD Video Stream Inspection Modal */}
      {inspectedCam && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(2, 6, 23, 0.85)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
          }}
        >
          <div
            style={{
              backgroundColor: '#0F172A',
              borderRadius: '14px',
              border: '1px solid #334155',
              width: '100%',
              maxWidth: '920px',
              overflow: 'hidden',
              boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* Modal Header */}
            <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #1E293B', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#FFFFFF' }}>
              <div>
                <div style={{ fontWeight: 800, fontSize: '1rem' }}>
                  {inspectedCam.id} · {inspectedCam.location}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
                  Enforcing Officer: <strong>{inspectedCam.officer}</strong> ({inspectedCam.badge}) · Stream: <strong>1080P HD 60FPS</strong>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setInspectedCam(null)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#94A3B8',
                  cursor: 'pointer',
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* High Definition Stream Window */}
            <div style={{ position: 'relative', height: '420px', backgroundColor: '#020617' }}>
              <CctvLivePlayer
                cameraId={inspectedCam.id}
                locationName={inspectedCam.location}
                officerName={inspectedCam.officer}
                officerBadge={inspectedCam.badge}
                corridorType={inspectedCam.corridorType}
                isStreaming={true}
              />
            </div>

            {/* Modal Footer Telemetry */}
            <div style={{ padding: '1rem 1.25rem', backgroundColor: '#1E293B', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#FFFFFF', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div style={{ fontSize: '0.8rem', color: '#94A3B8' }}>
                Total Corridor Violations in Database: <strong style={{ color: '#38BDF8' }}>{inspectedCam.detections}</strong>
              </div>

              <div style={{ display: 'flex', gap: '0.65rem' }}>
                <button
                  type="button"
                  onClick={() => {
                    alert(`Alert notification dispatched to Officer ${inspectedCam.officer} (${inspectedCam.badge}) on corridor ${inspectedCam.location}.`);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '0.5rem 1rem',
                    borderRadius: '8px',
                    backgroundColor: '#2563EB',
                    color: '#FFFFFF',
                    border: 'none',
                    fontWeight: 700,
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                  }}
                >
                  <Send size={14} />
                  <span>Dispatch Alert to Officer</span>
                </button>

                <button
                  type="button"
                  onClick={() => setInspectedCam(null)}
                  style={{
                    padding: '0.5rem 1rem',
                    borderRadius: '8px',
                    backgroundColor: '#334155',
                    color: '#FFFFFF',
                    border: 'none',
                    fontWeight: 600,
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                  }}
                >
                  Close Inspection
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
