import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Building2,
  LayoutDashboard,
  Users,
  Compass,
  Activity,
  FileCheck,
  Receipt,
  BarChart3,
  FileText,
  Sliders,
  Scale,
  User,
  LogOut,
  ArrowRightLeft,
} from 'lucide-react';
import { ROUTES } from '../../config/routes';
import { useAuth } from '../../context/AuthContext';

export const DepartmentSidebar = ({ onCloseMobile }) => {
  const { user, logout, switchPortal } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate(ROUTES.LOGIN);
  };

  const menuItems = [
    { label: 'Dept. Dashboard', path: ROUTES.DEPARTMENT.DASHBOARD, icon: LayoutDashboard },
    { label: 'Traffic Analytics', path: ROUTES.DEPARTMENT.ANALYTICS, icon: BarChart3 },
    { label: 'Police Officers', path: ROUTES.DEPARTMENT.OFFICERS, icon: Users },
    { label: 'Traffic Sectors', path: ROUTES.DEPARTMENT.SECTORS, icon: Compass },
    { label: 'All Violations', path: ROUTES.DEPARTMENT.VIOLATIONS, icon: FileCheck },
    { label: 'Fines & Challans', path: ROUTES.DEPARTMENT.FINES, icon: Receipt },
    { label: 'Violation Rules', path: ROUTES.DEPARTMENT.VIOLATION_RULES, icon: Scale },
    { label: 'AI Configuration', path: ROUTES.DEPARTMENT.AI_CONFIG, icon: Sliders },
    { label: 'HQ Admin Profile', path: ROUTES.DEPARTMENT.PROFILE, icon: User },
  ];

  return (
    <aside
      style={{
        width: '270px',
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
      {/* Department Branding */}
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
            background: 'linear-gradient(135deg, #2563EB, #1D4ED8)',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)',
          }}
        >
          <Building2 size={22} />
        </div>
        <div>
          <div style={{ fontWeight: 800, fontSize: '0.92rem', color: '#0F172A', lineHeight: 1.2 }}>
            TRAFFIC POLICE DEPT.
          </div>
          <div style={{ fontSize: '0.68rem', color: '#2563EB', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Command Headquarters
          </div>
        </div>
      </div>

      {/* Navigation List */}
      <nav style={{ flex: 1, padding: '0.65rem 0.55rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
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
                gap: '0.7rem',
                padding: '0.6rem 0.8rem',
                borderRadius: '8px',
                textDecoration: 'none',
                fontSize: '0.82rem',
                fontWeight: isActive ? 700 : 600,
                color: isActive ? '#2563EB' : '#475569',
                backgroundColor: isActive ? 'rgba(37, 99, 235, 0.1)' : 'transparent',
                border: isActive ? '1px solid rgba(37, 99, 235, 0.25)' : '1px solid transparent',
                boxShadow: isActive ? '0 2px 10px rgba(37, 99, 235, 0.12)' : 'none',
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
              <Icon size={17} />
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
          <span>Admin Logout</span>
        </button>
      </div>
    </aside>
  );
};
