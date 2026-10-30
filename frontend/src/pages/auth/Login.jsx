import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { 
  Shield, 
  Building2, 
  Eye, 
  EyeOff, 
  Lock, 
  User, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  ShieldCheck,
  ChevronLeft,
  ArrowLeft,
  Info
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ROUTES } from '../../config/routes';
import { RealisticTrafficVideoBg } from '../../components/auth/RealisticTrafficVideoBg';

export const Login = () => {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const queryRole = searchParams.get('role');
  const redirectUrl = searchParams.get('redirect') || location.state?.from?.pathname;

  const [selectedRole, setSelectedRole] = useState(() => {
    return queryRole === 'department' ? 'department' : 'police';
  });

  const { loginWithCredentials } = useAuth();
  const navigate = useNavigate();

  // Inputs for police start empty (No hardcode for police)
  const [username, setUsername] = useState(() => {
    return queryRole === 'department' ? 'admin.traffic' : '';
  });
  const [password, setPassword] = useState(() => {
    return queryRole === 'department' ? 'admin123' : '';
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // Security CAPTCHA State
  const [captchaCode, setCaptchaCode] = useState('');
  const [userCaptchaInput, setUserCaptchaInput] = useState('');

  // Generate dynamic random security CAPTCHA
  const generateCaptcha = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptchaCode(code);
    setUserCaptchaInput('');
  };

  useEffect(() => {
    generateCaptcha();
  }, []);

  // Synchronize when queryRole changes
  useEffect(() => {
    if (queryRole === 'department') {
      setSelectedRole('department');
      setUsername('admin.traffic');
      setPassword('admin123');
    } else if (queryRole === 'police') {
      setSelectedRole('police');
      setUsername('');
      setPassword('');
    }
  }, [queryRole]);

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setError('');
    setSuccessMsg('');
    generateCaptcha();
    if (role === 'police') {
      // Clean blank inputs for police (No hardcoded credentials)
      setUsername('');
      setPassword('');
    } else {
      // Hardcoded default credentials for Department Command
      setUsername('admin.traffic');
      setPassword('admin123');
    }
  };

  const handleLogin = (e) => {
    e?.preventDefault();
    setError('');
    setSuccessMsg('');

    // Step 1: Check inputs
    if (!username.trim() || !password.trim()) {
      setError(selectedRole === 'police' 
        ? 'Please enter your registered officer username/badge and password.' 
        : 'Please enter department administrator credentials.');
      return;
    }

    // Step 2: Validate Security CAPTCHA
    if (!userCaptchaInput.trim()) {
      setError('Security verification required. Please enter the CAPTCHA code.');
      return;
    }

    if (userCaptchaInput.trim().toLowerCase() !== captchaCode.toLowerCase()) {
      setError('Incorrect CAPTCHA code! Please enter the exact characters shown in the security box.');
      generateCaptcha();
      return;
    }

    setLoading(true);

    setTimeout(() => {
      try {
        if (selectedRole === 'department') {
          loginWithCredentials(username.trim(), password.trim(), 'department');
          setSuccessMsg('Department Command verified. Launching HQ Central Wall...');
          const targetUrl = redirectUrl && redirectUrl.startsWith('/department') 
            ? redirectUrl 
            : ROUTES.DEPARTMENT.DASHBOARD;
          setTimeout(() => navigate(targetUrl, { replace: true }), 350);
        } else {
          // Strictly authenticate against officers enrolled in Department Portal
          loginWithCredentials(username.trim(), password.trim(), 'police');
          setSuccessMsg('Officer credential verified. Launching Police Field Terminal...');
          const targetUrl = redirectUrl && redirectUrl.startsWith('/police') 
            ? redirectUrl 
            : ROUTES.POLICE.DASHBOARD;
          setTimeout(() => navigate(targetUrl, { replace: true }), 350);
        }
      } catch (err) {
        setError(err.message || 'Authentication failed. Please check your credentials.');
        generateCaptcha();
        setLoading(false);
      }
    }, 350);
  };


  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100%',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.25rem',
        overflow: 'hidden',
        fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif"
      }}
    >
      {/* ===================================================================
          FULL-SCREEN REALISTIC TRAFFIC VIDEO BACKGROUND
          =================================================================== */}
      <RealisticTrafficVideoBg />

      {/* Return to Landing Page Button */}
      <button
        type="button"
        onClick={() => navigate(ROUTES.LANDING)}
        title="Back to Astro Home"
        aria-label="Back to Astro Home"
        style={{
          position: 'fixed',
          top: '1.25rem',
          left: '1.25rem',
          zIndex: 50,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '38px',
          height: '38px',
          color: '#FFFFFF',
          background: 'rgba(10, 14, 26, 0.75)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '10px',
          cursor: 'pointer',
          transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
          boxShadow: '0 4px 14px rgba(0, 0, 0, 0.4)'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#E11D48';
          e.currentTarget.style.borderColor = '#E11D48';
          e.currentTarget.style.transform = 'translateX(-3px)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(10, 14, 26, 0.75)';
          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
          e.currentTarget.style.transform = 'translateX(0px)';
        }}
      >
        <ArrowLeft size={18} />
      </button>

      {/* ===================================================================
          COMPLETELY TRANSPARENT GLASSMORPHIC LOGIN CARD
          =================================================================== */}
      <div
        className="login-glass-card"
        style={{
          position: 'relative',
          zIndex: 10,
          maxWidth: '430px',
          width: '100%',
          padding: '2rem 1.75rem',
        }}
      >
        {/* System Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              background: selectedRole === 'police' ? '#E11D48' : 'rgba(30, 41, 59, 0.85)',
              color: '#FFFFFF',
              marginBottom: '0.6rem',
              boxShadow: selectedRole === 'police' ? '0 0 20px rgba(225, 29, 72, 0.6)' : '0 0 20px rgba(59, 130, 246, 0.5)',
              transition: 'all 0.25s ease',
              border: '1px solid rgba(255, 255, 255, 0.25)'
            }}
          >
            {selectedRole === 'police' ? <Shield size={24} /> : <Building2 size={24} />}
          </div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#FFFFFF', letterSpacing: '-0.02em', margin: 0, textShadow: '0 2px 8px rgba(0,0,0,0.8)' }}>
            AI Traffic Portal
          </h1>
          <p style={{ fontSize: '0.76rem', color: '#E2E8F0', marginTop: '0.25rem', textShadow: '0 1px 4px rgba(0,0,0,0.8)' }}>
            Automated Enforcement & Command System
          </p>
        </div>

        {/* Portal Role Selector Tabs */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '0.35rem',
            padding: '0.25rem',
            backgroundColor: 'rgba(0, 0, 0, 0.35)',
            borderRadius: '10px',
            border: '1px solid rgba(255, 255, 255, 0.18)',
            marginBottom: '1rem',
          }}
        >
          <button
            type="button"
            onClick={() => handleRoleSelect('police')}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: '0.5rem 0.35rem',
              borderRadius: '8px',
              border: selectedRole === 'police' ? '1.5px solid #E11D48' : '1px solid transparent',
              backgroundColor: selectedRole === 'police' ? 'rgba(225, 29, 72, 0.35)' : 'transparent',
              color: selectedRole === 'police' ? '#FF6B8B' : '#CBD5E1',
              boxShadow: selectedRole === 'police' ? '0 0 14px rgba(225, 29, 72, 0.4)' : 'none',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 800, fontSize: '0.8rem' }}>
              <Shield size={14} />
              <span>Traffic Police</span>
            </div>
            <span style={{ fontSize: '0.64rem', color: selectedRole === 'police' ? '#FDA4AF' : '#94A3B8', marginTop: '1px' }}>
              Field Officer Login
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleRoleSelect('department')}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: '0.5rem 0.35rem',
              borderRadius: '8px',
              border: selectedRole === 'department' ? '1.5px solid #3B82F6' : '1px solid transparent',
              backgroundColor: selectedRole === 'department' ? 'rgba(59, 130, 246, 0.35)' : 'transparent',
              color: selectedRole === 'department' ? '#93C5FD' : '#CBD5E1',
              boxShadow: selectedRole === 'department' ? '0 0 14px rgba(59, 130, 246, 0.4)' : 'none',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 800, fontSize: '0.8rem' }}>
              <Building2 size={14} />
              <span>Department HQ</span>
            </div>
            <span style={{ fontSize: '0.64rem', color: selectedRole === 'department' ? '#BFDBFE' : '#94A3B8', marginTop: '1px' }}>
              Command Admin Access
            </span>
          </button>
        </div>

        {/* Helpful notice for Police role */}
        {selectedRole === 'police' && (
          <div
            style={{
              padding: '0.45rem 0.65rem',
              backgroundColor: 'rgba(225, 29, 72, 0.22)',
              border: '1px solid rgba(225, 29, 72, 0.45)',
              borderRadius: '6px',
              color: '#FFE4E6',
              fontSize: '0.72rem',
              marginBottom: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              textShadow: '0 1px 2px rgba(0,0,0,0.7)'
            }}
          >
            <Info size={13} style={{ flexShrink: 0 }} />
            <span>Only officers enrolled by Department HQ can sign in.</span>
          </div>
        )}

        {/* Error notification if any */}
        {error && (
          <div
            style={{
              padding: '0.55rem 0.75rem',
              backgroundColor: 'rgba(239, 68, 68, 0.3)',
              border: '1px solid rgba(239, 68, 68, 0.5)',
              borderRadius: '6px',
              color: '#FEE2E2',
              fontSize: '0.75rem',
              marginBottom: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              lineHeight: 1.35,
              textShadow: '0 1px 2px rgba(0,0,0,0.7)'
            }}
          >
            <AlertCircle size={15} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {/* Success notification if any */}
        {successMsg && (
          <div
            style={{
              padding: '0.55rem 0.75rem',
              backgroundColor: 'rgba(16, 185, 129, 0.3)',
              border: '1px solid rgba(16, 185, 129, 0.5)',
              borderRadius: '6px',
              color: '#D1FAE5',
              fontSize: '0.75rem',
              marginBottom: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              textShadow: '0 1px 2px rgba(0,0,0,0.7)'
            }}
          >
            <CheckCircle2 size={15} style={{ flexShrink: 0 }} />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#F1F5F9', marginBottom: '0.25rem', textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}>
              {selectedRole === 'police' ? 'Officer Username / Badge Number' : 'Department Administrator ID'}
            </label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <User size={14} style={{ position: 'absolute', left: '10px', color: '#E2E8F0' }} />
              <input
                type="text"
                placeholder={selectedRole === 'police' ? 'e.g. officer.priya or TP-7719' : 'admin.traffic'}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.55rem 0.75rem 0.55rem 2rem',
                  borderRadius: '7px',
                  border: '1px solid rgba(255, 255, 255, 0.28)',
                  backgroundColor: 'rgba(0, 0, 0, 0.35)',
                  color: '#FFFFFF',
                  fontSize: '0.82rem',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
                required
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#F1F5F9', marginBottom: '0.25rem', textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}>
              Password
            </label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Lock size={14} style={{ position: 'absolute', left: '10px', color: '#E2E8F0' }} />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder={selectedRole === 'police' ? 'Enter officer password' : '••••••••'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.55rem 2rem 0.55rem 2rem',
                  borderRadius: '7px',
                  border: '1px solid rgba(255, 255, 255, 0.28)',
                  backgroundColor: 'rgba(0, 0, 0, 0.35)',
                  color: '#FFFFFF',
                  fontSize: '0.82rem',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '10px',
                  background: 'transparent',
                  border: 'none',
                  color: '#CBD5E1',
                  cursor: 'pointer',
                  display: 'flex',
                }}
              >
                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          {/* SECURITY CAPTCHA SECTION */}
          <div style={{ background: 'rgba(0, 0, 0, 0.35)', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.22)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.72rem', fontWeight: 700, color: '#F8FAFC', textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}>
                <ShieldCheck size={13} color="#E11D48" />
                <span>Security CAPTCHA</span>
              </label>
              <button
                type="button"
                onClick={generateCaptcha}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#E2E8F0',
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.2rem',
                  cursor: 'pointer'
                }}
                title="Generate fresh captcha"
              >
                <RefreshCw size={11} /> Refresh
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: '0.5rem', alignItems: 'center' }}>
              {/* Stylized Captcha Canvas Box */}
              <div
                style={{
                  background: 'rgba(0, 0, 0, 0.65)',
                  color: '#FFFFFF',
                  padding: '0.45rem 0.6rem',
                  borderRadius: '6px',
                  textAlign: 'center',
                  letterSpacing: '0.25em',
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: '1.05rem',
                  fontWeight: 900,
                  userSelect: 'none',
                  textDecoration: 'line-through',
                  textDecorationColor: '#E11D48',
                  textShadow: '0 0 10px rgba(225, 29, 72, 0.8)',
                  border: '1px solid rgba(225, 29, 72, 0.8)'
                }}
              >
                {captchaCode}
              </div>

              {/* Captcha Input Box */}
              <div>
                <input
                  type="text"
                  placeholder="Enter Code"
                  value={userCaptchaInput}
                  onChange={(e) => setUserCaptchaInput(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.5rem 0.55rem',
                    borderRadius: '6px',
                    border: '1px solid rgba(255, 255, 255, 0.28)',
                    backgroundColor: 'rgba(0, 0, 0, 0.35)',
                    color: '#FFFFFF',
                    fontSize: '0.8rem',
                    fontFamily: "'JetBrains Mono', monospace",
                    letterSpacing: '0.05em',
                    fontWeight: 700,
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                  required
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: '0.25rem',
              padding: '0.68rem',
              borderRadius: '7px',
              border: 'none',
              backgroundColor: '#E11D48',
              color: '#FFFFFF',
              fontWeight: 800,
              fontSize: '0.84rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: '0 0 20px rgba(225, 29, 72, 0.45)',
              transition: 'all 0.2s',
            }}
          >
            {loading ? (
              <span>Verifying Credentials...</span>
            ) : (
              <>
                <span>Sign In to {selectedRole === 'police' ? 'Traffic Police Portal' : 'Department Portal'}</span>
                <ArrowRight size={14} />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
export default Login;
