import React from 'react';
import { LiveCameraDetector } from '../../components/camera/LiveCameraDetector';
import { Video, Shield, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const PoliceLiveCamera = () => {
  const { user } = useAuth();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
              Live Traffic AI Camera Enforcement Terminal
            </h1>
            <span
              style={{
                fontSize: '0.72rem',
                padding: '0.2rem 0.6rem',
                borderRadius: '999px',
                backgroundColor: '#DCFCE7',
                color: '#15803D',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.3rem',
              }}
            >
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#16A34A' }} />
              LIVE RADAR ON
            </span>
          </div>
          <p style={{ fontSize: '0.8rem', color: '#64748B', margin: '0.2rem 0 0 0' }}>
            Station: <strong>{user?.assignedArea || 'Metropolitan Traffic Division'}</strong> • Enforcing Officer: <strong>{user?.name || 'Enforcement Officer'}</strong>
          </p>
        </div>
      </div>

      {/* Main Detector Component */}
      <LiveCameraDetector />
    </div>
  );
};
