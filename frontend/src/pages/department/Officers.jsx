import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Search,
  MapPin,
  Eye,
  Phone,
  UserPlus,
  ShieldCheck,
  CheckCircle2,
  LogIn,
  KeyRound,
  BadgeAlert,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { ROUTES } from '../../config/routes';

export const DepartmentOfficers = () => {
  const { officers, addOfficer, updateOfficerStatus, sectors, refreshSectors, violations } = useApp();
  const { loginAsOfficer } = useAuth();
  const navigate = useNavigate();

  const handleDirectLoginAsOfficer = (off) => {
    if (loginAsOfficer) {
      loginAsOfficer(off);
      navigate('/police/profile');
    }
  };

  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [addedSuccess, setAddedSuccess] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    password: 'police123',
    badge: '',
    designation: 'Traffic Sub-Inspector',
    department: 'North Traffic Zone Directorate',
    assignedArea: '',
    phone: '+91 98765 00000',
    status: 'Active',
  });

  // Dynamically load sectors from backend and set default assigned jurisdiction
  useEffect(() => {
    if (refreshSectors) {
      refreshSectors();
    }
  }, [refreshSectors]);

  useEffect(() => {
    if (sectors && sectors.length > 0) {
      setFormData((prev) => {
        if (!prev.assignedArea || prev.assignedArea.includes('Zone A — Sector 4')) {
          const first = sectors[0];
          const defaultArea = first.zone ? `${first.zone} — ${first.name}` : first.name;
          return { ...prev, assignedArea: defaultArea };
        }
        return prev;
      });
    }
  }, [sectors]);

  const handleNameChange = (val) => {
    const autoUsername = `officer.${val.toLowerCase().replace(/[^a-z0-9]/g, '')}`;
    const randomBadgeNum = Math.floor(1000 + Math.random() * 9000);
    setFormData((prev) => ({
      ...prev,
      name: val,
      username: prev.username ? prev.username : autoUsername,
      badge: prev.badge ? prev.badge : `TP-${randomBadgeNum}`,
    }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.badge.trim() || isSubmitting) return;

    try {
      setIsSubmitting(true);
      const newOfficer = await addOfficer(formData);
      setShowAddModal(false);
      setAddedSuccess(newOfficer || { ...formData });
    } catch (err) {
      console.error('Failed to add officer:', err);
      setShowAddModal(false);
      setAddedSuccess({ ...formData });
    } finally {
      setIsSubmitting(false);
    }

    // Reset Form
    const defaultSector = sectors && sectors.length > 0 
      ? (sectors[0].zone ? `${sectors[0].zone} — ${sectors[0].name}` : sectors[0].name)
      : '';
    setFormData({
      name: '',
      username: '',
      password: 'police123',
      badge: '',
      designation: 'Traffic Sub-Inspector',
      department: 'North Traffic Zone Directorate',
      assignedArea: defaultSector,
      phone: '+91 98765 00000',
      status: 'Active',
    });
  };

  const filtered = officers.filter(
    (o) =>
      o.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.badge.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.assignedArea?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.username?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
            Police Officers Roster & Operational Monitoring
          </h1>
          <p style={{ fontSize: '0.8rem', color: '#64748B', margin: '0.2rem 0 0 0' }}>
            Enrolled field officers, active duty shifts, assigned zones, and enforcement credentials
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Search size={15} style={{ position: 'absolute', left: '10px', color: '#94A3B8' }} />
            <input
              type="text"
              placeholder="Search officer / badge / zone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                padding: '0.5rem 0.75rem 0.5rem 2rem',
                borderRadius: '8px',
                border: '1px solid #CBD5E1',
                fontSize: '0.82rem',
                outline: 'none',
                width: '230px',
              }}
            />
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.55rem 1rem',
              backgroundColor: '#0F172A',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(15, 23, 42, 0.2)',
            }}
          >
            <UserPlus size={16} />
            <span>Add Police Officer</span>
          </button>
        </div>
      </div>

      {/* Officer Added Success Notification Banner */}
      {addedSuccess && (
        <div
          style={{
            padding: '1rem 1.25rem',
            borderRadius: '12px',
            backgroundColor: '#F0FDF4',
            border: '1px solid #BBF7D0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
            boxShadow: '0 4px 12px rgba(22, 163, 74, 0.1)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ padding: '0.4rem', backgroundColor: '#DCFCE7', borderRadius: '50%', color: '#16A34A' }}>
              <CheckCircle2 size={22} />
            </div>
            <div>
              <div style={{ fontWeight: 800, color: '#15803D', fontSize: '0.92rem' }}>
                Officer {addedSuccess?.name || 'Officer'} (Badge: {addedSuccess?.badge || 'N/A'}) enrolled successfully!
              </div>
              <div style={{ fontSize: '0.75rem', color: '#166534', marginTop: '0.15rem' }}>
                Login Credentials: Username: <strong>{addedSuccess?.username || 'officer'}</strong> | Password: <strong>{addedSuccess?.password || 'police123'}</strong>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={() => {
                if (addedSuccess?.badge) {
                  setSearchTerm(addedSuccess.badge);
                }
                setAddedSuccess(null);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.45rem 0.85rem',
                backgroundColor: '#16A34A',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '6px',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              <CheckCircle2 size={14} />
              <span>View in Roster</span>
            </button>
            <button
              onClick={() => setAddedSuccess(null)}
              style={{
                padding: '0.45rem 0.75rem',
                backgroundColor: '#FFFFFF',
                border: '1px solid #CBD5E1',
                borderRadius: '6px',
                fontSize: '0.78rem',
                color: '#475569',
                cursor: 'pointer',
              }}
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Officers Grid Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(330px, 1fr))', gap: '1.25rem' }}>
        {filtered.map((off) => (
          <div
            key={off.id}
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '12px',
              border: '1px solid #E2E8F0',
              padding: '1.25rem',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              transition: 'border-color 0.2s',
            }}
          >
            {/* Header with Status */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    backgroundColor: '#EFF6FF',
                    color: '#2563EB',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: '0.9rem',
                    border: '1px solid #BFDBFE',
                  }}
                >
                  {off.avatar || 'TP'}
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#0F172A' }}>{off.name}</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
                    {off.designation} • Badge: <strong>{off.badge}</strong>
                  </div>
                </div>
              </div>

              <span
                style={{
                  padding: '0.15rem 0.5rem',
                  borderRadius: '999px',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  backgroundColor: off.status === 'Active' ? '#DCFCE7' : '#F1F5F9',
                  color: off.status === 'Active' ? '#15803D' : '#64748B',
                }}
              >
                {off.status}
              </span>
            </div>

            {/* Jurisdiction Zone */}
            <div style={{ fontSize: '0.78rem', color: '#334155', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <MapPin size={14} color="#2563EB" />
              <span>{off.assignedArea}</span>
            </div>

            {/* Login Username Pill */}
            <div
              style={{
                fontSize: '0.72rem',
                backgroundColor: '#F8FAFC',
                padding: '0.35rem 0.65rem',
                borderRadius: '6px',
                border: '1px solid #E2E8F0',
                display: 'flex',
                justifyContent: 'space-between',
                color: '#64748B',
              }}
            >
              <span>Login ID: <strong style={{ color: '#0F172A' }}>{off.username || off.badge}</strong></span>
              <span>Pass: <strong style={{ color: '#0F172A' }}>{off.password || 'police123'}</strong></span>
            </div>

            {/* Dynamic Officer Metrics Row */}
            {(() => {
              const offCases = (violations || []).filter((v) => {
                const offName = (off.name || '').trim().toLowerCase();
                const offBadge = (off.badge || '').trim().toLowerCase();
                const offUser = (off.username || '').trim().toLowerCase();
                const offId = (off.id || '').trim().toLowerCase();

                const vName = (v.officerName || '').trim().toLowerCase();
                const vBadge = (v.officerBadge || '').trim().toLowerCase();
                const vId = (v.officerId || '').trim().toLowerCase();

                if (offBadge && vBadge && offBadge === vBadge) return true;
                if (offId && vId && offId === vId) return true;
                if (offName && vName) {
                  if (vName === offName) return true;
                  if (vName.startsWith(offName) || offName.startsWith(vName)) return true;
                }
                if (offUser && vName && (vName === offUser || vName.startsWith(offUser))) return true;

                return false;
              });

              const detCount = offCases.length || off.violationsDetected || 0;
              const verCount = offCases.filter((c) => c.status === 'Verified' || c.status === 'Fine Generated' || c.status === 'Paid').length || off.violationsVerified || 0;
              const finesTotal = offCases.reduce((sum, c) => sum + (Number(c.fineAmount) || 0), 0) || off.finesGenerated || 0;

              return (
                <div
                  style={{
                    backgroundColor: '#F8FAFC',
                    borderRadius: '8px',
                    padding: '0.65rem',
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr 1fr',
                    gap: '0.4rem',
                    textAlign: 'center',
                    border: '1px solid #E2E8F0',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '0.65rem', color: '#64748B', fontWeight: 600 }}>DETECTED</div>
                    <div style={{ fontWeight: 800, fontSize: '1rem', color: '#0F172A' }}>{detCount}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.65rem', color: '#64748B', fontWeight: 600 }}>VERIFIED</div>
                    <div style={{ fontWeight: 800, fontSize: '1rem', color: '#16A34A' }}>{verCount}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.65rem', color: '#64748B', fontWeight: 600 }}>FINES</div>
                    <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#2563EB' }}>
                      ₹{(finesTotal / 1000).toFixed(1)}k
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Actions: View Profile & 1-Click Login As Officer */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '0.45rem', marginTop: 'auto' }}>
              <button
                onClick={() => handleDirectLoginAsOfficer(off)}
                style={{
                  padding: '0.45rem 0.65rem',
                  borderRadius: '6px',
                  backgroundColor: '#2563EB',
                  color: '#FFFFFF',
                  border: 'none',
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.3rem',
                  boxShadow: '0 2px 6px rgba(37, 99, 235, 0.2)',
                }}
              >
                <LogIn size={13} />
                <span>Login As Officer</span>
              </button>

              <button
                onClick={() => navigate(`/department/officers/${off.id}`)}
                style={{
                  padding: '0.45rem 0.65rem',
                  borderRadius: '6px',
                  backgroundColor: '#F8FAFC',
                  color: '#0F172A',
                  border: '1px solid #CBD5E1',
                  fontSize: '0.74rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.3rem',
                }}
              >
                <Eye size={13} />
                <span>Profile</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Police Officer Modal Form */}
      {showAddModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '1rem',
          }}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '14px',
              padding: '1.75rem',
              maxWidth: '560px',
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.25rem',
              boxShadow: '0 20px 40px rgba(0,0,0,0.25)',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #E2E8F0', paddingBottom: '0.85rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ padding: '0.4rem', backgroundColor: '#EFF6FF', borderRadius: '8px', color: '#2563EB' }}>
                  <UserPlus size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#0F172A' }}>
                    Enroll New Police Officer
                  </h3>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748B' }}>
                    Officer will be able to log in to the Police Field Portal immediately
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#94A3B8', fontSize: '1.3rem' }}
              >
                ✕
              </button>
            </div>

            {/* Form Fields */}
            <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155' }}>
                  OFFICER FULL NAME *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sub-Inspector Ramesh Verma"
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.6rem 0.75rem',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    fontSize: '0.85rem',
                    marginTop: '0.25rem',
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155' }}>
                    LOGIN USERNAME *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. officer.ramesh"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.6rem 0.75rem',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      fontSize: '0.85rem',
                      marginTop: '0.25rem',
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155' }}>
                    LOGIN PASSWORD *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.6rem 0.75rem',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      fontSize: '0.85rem',
                      marginTop: '0.25rem',
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155' }}>
                    BADGE NUMBER *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. TP-9920"
                    value={formData.badge}
                    onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.6rem 0.75rem',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      fontSize: '0.85rem',
                      marginTop: '0.25rem',
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155' }}>
                    DESIGNATION
                  </label>
                  <select
                    value={formData.designation}
                    onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.6rem 0.75rem',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      fontSize: '0.85rem',
                      marginTop: '0.25rem',
                      backgroundColor: '#FFFFFF',
                    }}
                  >
                    <option value="Senior Traffic Sub-Inspector">Senior Traffic Sub-Inspector</option>
                    <option value="Traffic Sub-Inspector">Traffic Sub-Inspector</option>
                    <option value="Assistant Sub-Inspector">Assistant Sub-Inspector</option>
                    <option value="Head Constable">Head Constable</option>
                    <option value="Patrol Officer">Patrol Officer</option>
                  </select>
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155' }}>
                    ASSIGNED JURISDICTION SECTOR / CORRIDOR
                  </label>
                  <span style={{ fontSize: '0.72rem', color: '#2563EB', fontWeight: 600 }}>
                    {sectors && sectors.length > 0 ? `(${sectors.length} Dynamic Sectors Loaded)` : 'Loading Sectors...'}
                  </span>
                </div>
                <select
                  value={formData.assignedArea}
                  onChange={(e) => setFormData({ ...formData, assignedArea: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.6rem 0.75rem',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    fontSize: '0.85rem',
                    backgroundColor: '#FFFFFF',
                  }}
                >
                  {sectors && sectors.length > 0 ? (
                    sectors.map((sec) => {
                      const areaValue = sec.zone ? `${sec.zone} — ${sec.name}` : sec.name;
                      return (
                        <option key={sec.id || sec.code} value={areaValue}>
                          {areaValue} {sec.code ? `[${sec.code}]` : ''}
                        </option>
                      );
                    })
                  ) : (
                    <option value="Sector 4 Highway Corridor">Sector 4 Highway Corridor (Default)</option>
                  )}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155' }}>
                    CONTACT PHONE NUMBER
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.6rem 0.75rem',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      fontSize: '0.85rem',
                      marginTop: '0.25rem',
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155' }}>
                    DUTY STATUS
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.6rem 0.75rem',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      fontSize: '0.85rem',
                      marginTop: '0.25rem',
                      backgroundColor: '#FFFFFF',
                    }}
                  >
                    <option value="Active">Active Duty</option>
                    <option value="Offline">Offline / Shift End</option>
                  </select>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.65rem', marginTop: '0.5rem', paddingTop: '0.85rem', borderTop: '1px solid #F1F5F9' }}>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  style={{
                    padding: '0.6rem 1.25rem',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    backgroundColor: '#FFFFFF',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '0.6rem 1.5rem',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: '#0F172A',
                    color: '#FFFFFF',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(15, 23, 42, 0.25)',
                  }}
                >
                  Save & Enroll Officer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
