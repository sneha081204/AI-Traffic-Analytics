import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Camera,
  Video,
  FileCheck2,
  Clock,
  Receipt,
  History,
  User,
  LogOut,
  Shield,
  ArrowRightLeft,
} from 'lucide-react';
import { ROUTES } from '../../config/routes';
import { useAuth } from '../../context/AuthContext';

export const PoliceSidebar = ({ onCloseMobile }) => {
  const { user, logout, switchPortal } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate(ROUTES.LOGIN);
  };

  const menuItems = [
    { label: 'Officer Dashboard', path: ROUTES.POLICE.DASHBOARD, icon: LayoutDashboard },
    { label: 'Capture & Upload Evidence', path: ROUTES.POLICE.CAPTURE, icon: Camera },
    { label: 'Live Camera Detection', path: ROUTES.POLICE.LIVE_CAMERA, icon: Video },
    { label: 'My Violations', path: ROUTES.POLICE.MY_VIOLATIONS, icon: FileCheck2 },
    { label: 'Fines / Challans', path: ROUTES.POLICE.FINES, icon: Receipt },
    { label: 'Violation History', path: ROUTES.POLICE.HISTORY, icon: History },
    { label: 'Officer Profile', path: ROUTES.POLICE.PROFILE, icon: User },
  ];

  return (
    <aside
      style={{
        width: '260px',
        flexShrink: 0,
        height: '100vh',
        maxHeight: '100vh',
        backgroundColor: 'rgba(255, 255, 255, 0.82)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderRight: '1px solid rgba(226, 232, 240, 0.85)',
        boxShadow: '4px 0 24px rgba(15, 23, 42, 0.04)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        zIndex: 50,
      }}
    >
      {/* Portal Branding */}
      <div
        style={{
          padding: '1.25rem 1.25rem 1rem 1.25rem',
          borderBottom: '1px solid rgba(226, 232, 240, 0.85)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          flexShrink: 0,
        }}
      >
        <div
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #e11d48, #be123c)',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(225, 29, 72, 0.3)',
          }}
        >
          <Shield size={22} />
        </div>
        <div>
          <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#0F172A', lineHeight: 1.2 }}>
            TRAFFIC POLICE
          </div>
          <div style={{ fontSize: '0.7rem', color: '#e11d48', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Officer Portal
          </div>
        </div>
      </div>

      {/* Navigation List */}
      <nav style={{ flex: 1, padding: '0.75rem 0.65rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onCloseMobile}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.65rem 0.85rem',
                borderRadius: '8px',
                textDecoration: 'none',
                fontSize: '0.85rem',
                fontWeight: isActive ? 700 : 600,
                color: isActive ? '#e11d48' : '#475569',
                backgroundColor: isActive ? 'rgba(225, 29, 72, 0.1)' : 'transparent',
                border: isActive ? '1px solid rgba(225, 29, 72, 0.25)' : '1px solid transparent',
                boxShadow: isActive ? '0 2px 10px rgba(225, 29, 72, 0.12)' : 'none',
                transition: 'all 0.2s ease',
              })}
              onMouseEnter={(e) => {
                if (!e.currentTarget.classList.contains('active')) {
                  e.currentTarget.style.backgroundColor = 'rgba(241, 245, 249, 0.85)';
                  e.currentTarget.style.color = '#0F172A';
                }
              }}
              onMouseLeave={(e) => {
                if (!e.currentTarget.classList.contains('active')) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = '#475569';
                }
              }}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Logout Footer */}
      <div style={{ padding: '0.75rem', borderTop: '1px solid rgba(226, 232, 240, 0.85)', display: 'flex', flexDirection: 'column', gap: '0.5rem', flexShrink: 0 }}>
        <button
          onClick={handleLogout}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.6rem 0.85rem',
            borderRadius: '8px',
            border: '1px solid rgba(220, 38, 38, 0.2)',
            background: 'rgba(254, 242, 242, 0.8)',
            color: '#dc2626',
            fontSize: '0.82rem',
            fontWeight: 600,
            cursor: 'pointer',
            textAlign: 'left',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(254, 242, 242, 1)';
            e.currentTarget.style.borderColor = 'rgba(220, 38, 38, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(254, 242, 242, 0.8)';
            e.currentTarget.style.borderColor = 'rgba(220, 38, 38, 0.2)';
          }}
        >
          <LogOut size={16} />
          <span>Officer Logout</span>
        </button>
      </div>
    </aside>
  );
};
