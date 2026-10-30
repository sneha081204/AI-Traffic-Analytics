import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Shield, Building2, Clock, Menu } from 'lucide-react';
import { ROUTES } from '../../config/routes';
import { useAuth } from '../../context/AuthContext';

export const Header = ({ onToggleMobileSidebar }) => {
  const navigate = useNavigate();
  const { user, isPolice, isDepartment, switchPortal } = useAuth();
  const [timeStr, setTimeStr] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString('en-US', { hour12: true }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header
      style={{
        height: '64px',
        backgroundColor: 'rgba(255, 255, 255, 0.85)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(226, 232, 240, 0.85)',
        boxShadow: '0 4px 20px rgba(15, 23, 42, 0.04)',
        padding: '0 2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 40,
      }}
    >
      {/* Left: Global Search */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flex: 1, maxWidth: '640px' }}>
        {/* Global Search Bar */}
        <div style={{ position: 'relative', width: '100%', maxWidth: '360px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748B' }} />
          <input
            type="text"
            placeholder={isPolice ? 'Search vehicle plate, violation ID...' : 'Search officer, case ID, zone, rule...'}
            style={{
              width: '100%',
              padding: '0.45rem 0.85rem 0.45rem 2.2rem',
              fontSize: '0.82rem',
              backgroundColor: 'rgba(241, 245, 249, 0.85)',
              border: '1px solid rgba(203, 213, 225, 0.7)',
              borderRadius: '8px',
              outline: 'none',
              color: '#0F172A',
              transition: 'all 0.2s',
            }}
            onFocus={(e) => {
              e.target.style.backgroundColor = '#FFFFFF';
              e.target.style.borderColor = '#e11d48';
              e.target.style.boxShadow = '0 0 0 3px rgba(225, 29, 72, 0.12)';
            }}
            onBlur={(e) => {
              e.target.style.backgroundColor = 'rgba(241, 245, 249, 0.85)';
              e.target.style.borderColor = 'rgba(203, 213, 225, 0.7)';
              e.target.style.boxShadow = 'none';
            }}
          />
        </div>
      </div>

      {/* Right: Clock & User Info */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
        {/* Live Digital Clock */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            fontSize: '0.8rem',
            fontFamily: 'var(--font-mono)',
            fontWeight: 600,
            color: '#0F172A',
            backgroundColor: 'rgba(241, 245, 249, 0.85)',
            backdropFilter: 'blur(10px)',
            padding: '0.35rem 0.75rem',
            borderRadius: '8px',
            border: '1px solid rgba(226, 232, 240, 0.9)',
          }}
        >
          <Clock size={14} color="#e11d48" />
          <span>{timeStr || '10:42 AM'}</span>
        </div>

        {/* Officer / Admin Badge Profile */}
        <div
          onClick={() => navigate(isPolice ? ROUTES.POLICE.PROFILE : ROUTES.DEPARTMENT.PROFILE)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            borderLeft: '1px solid rgba(226, 232, 240, 0.8)',
            paddingLeft: '1.25rem',
            cursor: 'pointer',
          }}
        >
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: isPolice ? 'linear-gradient(135deg, #e11d48, #be123c)' : 'linear-gradient(135deg, #2563EB, #1D4ED8)',
              color: '#FFFFFF',
              fontWeight: 800,
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: isPolice ? '0 2px 8px rgba(225, 29, 72, 0.3)' : '0 2px 8px rgba(37, 99, 235, 0.3)',
            }}
          >
            {user?.avatar || 'TP'}
          </div>
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0F172A', lineHeight: 1.2 }}>
              {user?.name || 'Officer'}
            </div>
            <div style={{ fontSize: '0.72rem', color: '#64748B' }}>
              Badge: <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: '#0F172A' }}>{user?.badge || 'TP-0000'}</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
