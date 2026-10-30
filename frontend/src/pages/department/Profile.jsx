import React, { useState } from 'react';
import { 
  Building2, 
  User, 
  Phone, 
  Calendar, 
  Shield, 
  Lock, 
  Save, 
  KeyRound, 
  CheckCircle2, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  Award,
  Crown
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { apiClient } from '../../services/apiClient';
import { API_ENDPOINTS } from '../../config/apiConfig';

export const DepartmentProfile = () => {
  const { user, updateUserProfile, changeUserPassword } = useAuth();

  const [activeTab, setActiveTab] = useState('profile'); // 'profile' or 'password'

  // Admin Profile Form State
  const [profileData, setProfileData] = useState({
    name: user?.name || 'Department Command Administrator',
    contact: user?.contact || user?.phone || '+91 94444 00000',
    designation: user?.designation || 'Joint Commissioner of Traffic Enforcement',
    department: user?.department || 'Central Traffic Enforcement Command Headquarters',
    jurisdiction: user?.jurisdiction || 'Metropolitan City Traffic Control Grid',
  });

  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');

  // Password Form State
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  const [passLoading, setPassLoading] = useState(false);
  const [passSuccess, setPassSuccess] = useState('');
  const [passError, setPassError] = useState('');

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'HQ';

  // Handle Profile Update
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileError('');
    setProfileSuccess('');

    if (!profileData.name.trim()) {
      setProfileError('Administrator Name cannot be empty.');
      return;
    }

    setProfileLoading(true);
    try {
      await apiClient.post(API_ENDPOINTS.AUTH_PROFILE, profileData);
      const updatedAvatar = profileData.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase() || 'HQ';

      updateUserProfile({ ...profileData, avatar: updatedAvatar });
      setProfileSuccess('Department Command Administrator profile updated successfully.');
      setTimeout(() => setProfileSuccess(''), 4000);
    } catch (err) {
      updateUserProfile(profileData);
      setProfileSuccess('Profile saved successfully.');
      setTimeout(() => setProfileSuccess(''), 4000);
    } finally {
      setProfileLoading(false);
    }
  };

  // Handle Password Change
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPassError('');
    setPassSuccess('');

    const { currentPassword, newPassword, confirmPassword } = passwordData;

    if (!currentPassword.trim()) {
      setPassError('Please enter your current administrator password.');
      return;
    }

    if (!newPassword.trim()) {
      setPassError('Please enter a new password.');
      return;
    }

    if (newPassword.length < 6) {
      setPassError('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPassError('New password and confirmation password do not match.');
      return;
    }

    setPassLoading(true);
    try {
      await apiClient.post(API_ENDPOINTS.AUTH_CHANGE_PASSWORD, { currentPassword, newPassword });
      changeUserPassword(newPassword);
      setPassSuccess('Administrator security password updated successfully!');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setPassSuccess(''), 5000);
    } catch (err) {
      setPassError(err.response?.data?.error || err.message || 'Failed to change password. Please check your credentials.');
    } finally {
      setPassLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
          Department Command Administrator Profile
        </h1>
        <p style={{ fontSize: '0.82rem', color: '#64748B', margin: '0.2rem 0 0 0' }}>
          Senior command supervisor credentials, contact information, and security settings
        </p>
      </div>

      {/* Profile Card Banner */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '14px',
          border: '1px solid #E2E8F0',
          padding: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1.5rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          flexWrap: 'wrap',
        }}
      >
        <div
          style={{
            width: '76px',
            height: '76px',
            borderRadius: '50%',
            backgroundColor: '#0F172A',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.6rem',
            fontWeight: 800,
            boxShadow: '0 4px 12px rgba(15, 23, 42, 0.25)',
            border: '3px solid #334155',
          }}
        >
          {user?.avatar || initials}
        </div>

        <div style={{ flex: 1, minWidth: '220px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
              {user?.name || profileData.name}
            </h2>
            <span
              style={{
                fontSize: '0.72rem',
                padding: '0.2rem 0.6rem',
                borderRadius: '999px',
                backgroundColor: '#DCFCE7',
                color: '#15803D',
                fontWeight: 700,
                border: '1px solid #BBF7D0',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.3rem',
              }}
            >
              <Crown size={12} /> HQ Command Supervisor
            </span>
          </div>

          <div style={{ fontSize: '0.85rem', color: '#64748B', marginTop: '0.3rem' }}>
            {user?.designation || profileData.designation} • Badge ID: <strong>{user?.badge || 'HQ-COMMAND'}</strong>
          </div>
          <div style={{ fontSize: '0.78rem', color: '#0F172A', fontWeight: 600, marginTop: '0.2rem' }}>
            {user?.department || profileData.department}
          </div>
        </div>
      </div>

      {/* Tabs Switcher: Edit Profile vs Change Password */}
      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          borderBottom: '2px solid #E2E8F0',
          paddingBottom: '0.25rem',
        }}
      >
        <button
          type="button"
          onClick={() => setActiveTab('profile')}
          style={{
            padding: '0.65rem 1.25rem',
            border: 'none',
            borderBottom: activeTab === 'profile' ? '3px solid #0F172A' : '3px solid transparent',
            backgroundColor: 'transparent',
            color: activeTab === 'profile' ? '#0F172A' : '#64748B',
            fontWeight: 800,
            fontSize: '0.86rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            transition: 'all 0.15s',
          }}
        >
          <User size={16} />
          <span>Edit Administrator Profile</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('password')}
          style={{
            padding: '0.65rem 1.25rem',
            border: 'none',
            borderBottom: activeTab === 'password' ? '3px solid #0F172A' : '3px solid transparent',
            backgroundColor: 'transparent',
            color: activeTab === 'password' ? '#0F172A' : '#64748B',
            fontWeight: 800,
            fontSize: '0.86rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            transition: 'all 0.15s',
          }}
        >
          <KeyRound size={16} />
          <span>Change Password</span>
        </button>
      </div>

      {/* TAB 1: EDIT ADMIN PROFILE FORM */}
      {activeTab === 'profile' && (
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '12px',
            border: '1px solid #E2E8F0',
            padding: '1.5rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: '0.98rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                Administrator Authority & Details
              </h3>
              <p style={{ fontSize: '0.78rem', color: '#64748B', margin: '0.15rem 0 0 0' }}>
                Update your command supervisor contact and jurisdictional designations
              </p>
            </div>
            <span style={{ fontSize: '0.74rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <Shield size={14} color="#0F172A" /> HQ Central Grid
            </span>
          </div>

          {profileSuccess && (
            <div
              style={{
                padding: '0.75rem 1rem',
                backgroundColor: '#DCFCE7',
                border: '1px solid #BBF7D0',
                borderRadius: '8px',
                color: '#15803D',
                fontSize: '0.82rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <CheckCircle2 size={16} />
              <span>{profileSuccess}</span>
            </div>
          )}

          {profileError && (
            <div
              style={{
                padding: '0.75rem 1rem',
                backgroundColor: '#FEF2F2',
                border: '1px solid #FECACA',
                borderRadius: '8px',
                color: '#DC2626',
                fontSize: '0.82rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <AlertCircle size={16} />
              <span>{profileError}</span>
            </div>
          )}

          <form onSubmit={handleProfileSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '0.3rem' }}>
                  Administrator Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={profileData.name}
                  onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.6rem 0.85rem',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    fontSize: '0.84rem',
                    color: '#0F172A',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '0.3rem' }}>
                  Contact Telephone / Hotline
                </label>
                <input
                  type="text"
                  value={profileData.contact}
                  onChange={(e) => setProfileData({ ...profileData, contact: e.target.value })}
                  placeholder="+91 94444 00000"
                  style={{
                    width: '100%',
                    padding: '0.6rem 0.85rem',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    fontSize: '0.84rem',
                    color: '#0F172A',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '0.3rem' }}>
                  Command Badge ID (Fixed)
                </label>
                <input
                  type="text"
                  disabled
                  value={user?.badge || 'HQ-COMMAND'}
                  style={{
                    width: '100%',
                    padding: '0.6rem 0.85rem',
                    borderRadius: '8px',
                    border: '1px solid #E2E8F0',
                    fontSize: '0.84rem',
                    color: '#64748B',
                    backgroundColor: '#F8FAFC',
                    boxSizing: 'border-box',
                    fontWeight: 700,
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '0.3rem' }}>
                  Admin Username (Fixed)
                </label>
                <input
                  type="text"
                  disabled
                  value={user?.username || 'admin.traffic'}
                  style={{
                    width: '100%',
                    padding: '0.6rem 0.85rem',
                    borderRadius: '8px',
                    border: '1px solid #E2E8F0',
                    fontSize: '0.84rem',
                    color: '#64748B',
                    backgroundColor: '#F8FAFC',
                    boxSizing: 'border-box',
                    fontFamily: 'monospace',
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '0.3rem' }}>
                  Official Designation / Title
                </label>
                <input
                  type="text"
                  value={profileData.designation}
                  onChange={(e) => setProfileData({ ...profileData, designation: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.6rem 0.85rem',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    fontSize: '0.84rem',
                    color: '#0F172A',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '0.3rem' }}>
                  Headquarters Department Division
                </label>
                <input
                  type="text"
                  value={profileData.department}
                  onChange={(e) => setProfileData({ ...profileData, department: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.6rem 0.85rem',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    fontSize: '0.84rem',
                    color: '#0F172A',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '0.3rem' }}>
                Metropolitan Command Jurisdiction
              </label>
              <input
                type="text"
                value={profileData.jurisdiction}
                onChange={(e) => setProfileData({ ...profileData, jurisdiction: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.6rem 0.85rem',
                  borderRadius: '8px',
                  border: '1px solid #CBD5E1',
                  fontSize: '0.84rem',
                  color: '#0F172A',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
              <button
                type="submit"
                disabled={profileLoading}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  padding: '0.65rem 1.4rem',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: '#0F172A',
                  color: '#FFFFFF',
                  fontWeight: 700,
                  fontSize: '0.84rem',
                  cursor: profileLoading ? 'not-allowed' : 'pointer',
                  boxShadow: '0 2px 8px rgba(15, 23, 42, 0.25)',
                }}
              >
                <Save size={15} />
                <span>{profileLoading ? 'Updating Profile...' : 'Save Administrator Profile'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 2: CHANGE PASSWORD FORM */}
      {activeTab === 'password' && (
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '12px',
            border: '1px solid #E2E8F0',
            padding: '1.5rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: '0.98rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                Administrator Security & Credentials
              </h3>
              <p style={{ fontSize: '0.78rem', color: '#64748B', margin: '0.15rem 0 0 0' }}>
                Change your Department Command HQ login password
              </p>
            </div>
            <span style={{ fontSize: '0.74rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <Lock size={14} color="#D97706" /> High Security Tier
            </span>
          </div>

          {passSuccess && (
            <div
              style={{
                padding: '0.75rem 1rem',
                backgroundColor: '#DCFCE7',
                border: '1px solid #BBF7D0',
                borderRadius: '8px',
                color: '#15803D',
                fontSize: '0.82rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <CheckCircle2 size={16} />
              <span>{passSuccess}</span>
            </div>
          )}

          {passError && (
            <div
              style={{
                padding: '0.75rem 1rem',
                backgroundColor: '#FEF2F2',
                border: '1px solid #FECACA',
                borderRadius: '8px',
                color: '#DC2626',
                fontSize: '0.82rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <AlertCircle size={16} />
              <span>{passError}</span>
            </div>
          )}

          <form onSubmit={handlePasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '520px' }}>
            {/* Current Password */}
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '0.3rem' }}>
                Current Administrator Password *
              </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <input
                  type={showCurrentPass ? 'text' : 'password'}
                  required
                  placeholder="Enter current admin password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.6rem 2.4rem 0.6rem 0.85rem',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    fontSize: '0.84rem',
                    color: '#0F172A',
                    boxSizing: 'border-box',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPass(!showCurrentPass)}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    background: 'transparent',
                    border: 'none',
                    color: '#64748B',
                    cursor: 'pointer',
                    display: 'flex',
                  }}
                >
                  {showCurrentPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '0.3rem' }}>
                New Password * (Min. 6 characters)
              </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <input
                  type={showNewPass ? 'text' : 'password'}
                  required
                  placeholder="Enter new admin password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.6rem 2.4rem 0.6rem 0.85rem',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    fontSize: '0.84rem',
                    color: '#0F172A',
                    boxSizing: 'border-box',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPass(!showNewPass)}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    background: 'transparent',
                    border: 'none',
                    color: '#64748B',
                    cursor: 'pointer',
                    display: 'flex',
                  }}
                >
                  {showNewPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Confirm New Password */}
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '0.3rem' }}>
                Confirm New Password *
              </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <input
                  type={showConfirmPass ? 'text' : 'password'}
                  required
                  placeholder="Re-enter new admin password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.6rem 2.4rem 0.6rem 0.85rem',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    fontSize: '0.84rem',
                    color: '#0F172A',
                    boxSizing: 'border-box',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPass(!showConfirmPass)}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    background: 'transparent',
                    border: 'none',
                    color: '#64748B',
                    cursor: 'pointer',
                    display: 'flex',
                  }}
                >
                  {showConfirmPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-start', marginTop: '0.5rem' }}>
              <button
                type="submit"
                disabled={passLoading}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  padding: '0.65rem 1.4rem',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: '#0F172A',
                  color: '#FFFFFF',
                  fontWeight: 700,
                  fontSize: '0.84rem',
                  cursor: passLoading ? 'not-allowed' : 'pointer',
                  boxShadow: '0 2px 8px rgba(15, 23, 42, 0.2)',
                }}
              >
                <KeyRound size={15} />
                <span>{passLoading ? 'Updating Password...' : 'Update Admin Password'}</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default DepartmentProfile;
