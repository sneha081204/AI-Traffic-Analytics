import React, { useState } from 'react';
import {
  Compass,
  MapPin,
  Shield,
  Video,
  Gauge,
  AlertTriangle,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Edit2,
  Trash2,
  Activity,
  Layers,
  Users,
  Navigation,
  RefreshCw,
  X,
  Radio,
  Clock
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const DepartmentSectors = () => {
  const { sectors, addSector, updateSector, deleteSector, officers, refreshSectors } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedZone, setSelectedZone] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSector, setEditingSector] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Form State
  const initialFormState = {
    name: '',
    code: '',
    zone: 'North Zone',
    assignedOfficerId: '',
    assignedOfficerName: '',
    assignedOfficerBadge: '',
    jurisdictionArea: '',
    speedLimit: 60,
    violationHotspotLevel: 'Moderate',
    description: '',
  };

  const [formData, setFormData] = useState(initialFormState);
  const [formError, setFormError] = useState('');

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshSectors();
    setTimeout(() => setRefreshing(false), 500);
  };

  const openAddModal = () => {
    setEditingSector(null);
    setFormData({
      ...initialFormState,
      assignedOfficerId: officers[0]?.id || '',
      assignedOfficerName: officers[0]?.name || 'Inspector Vikram Singh',
      assignedOfficerBadge: officers[0]?.badge || 'TP-8421',
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (sector) => {
    setEditingSector(sector);
    setFormData({
      name: sector.name || '',
      code: sector.code || '',
      zone: sector.zone || 'North Zone',
      assignedOfficerId: sector.assignedOfficerId || '',
      assignedOfficerName: sector.assignedOfficerName || '',
      assignedOfficerBadge: sector.assignedOfficerBadge || '',
      jurisdictionArea: sector.jurisdictionArea || '',
      speedLimit: sector.speedLimit || 60,
      violationHotspotLevel: sector.violationHotspotLevel || 'Moderate',
      description: sector.description || '',
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleOfficerChange = (e) => {
    const offId = e.target.value;
    const off = officers.find((o) => o.id === offId);
    setFormData((prev) => ({
      ...prev,
      assignedOfficerId: offId,
      assignedOfficerName: off ? off.name : '',
      assignedOfficerBadge: off ? off.badge : '',
    }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setFormError('Sector Name is required.');
      return;
    }

    if (editingSector) {
      await updateSector(editingSector.id, formData);
    } else {
      await addSector(formData);
    }
    setIsModalOpen(false);
  };

  const handleDelete = async (id) => {
    await deleteSector(id);
    setDeleteConfirmId(null);
  };

  // Filtered Sectors
  const filteredSectors = (sectors || []).filter((s) => {
    const matchesSearch =
      (s.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.code || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.assignedOfficerName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.jurisdictionArea || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchesZone = selectedZone === 'All' || s.zone === selectedZone;

    return matchesSearch && matchesZone;
  });

  // KPI Metrics
  const totalSectors = sectors.length;
  const assignedOfficersCount = sectors.filter((s) => s.assignedOfficerName && s.assignedOfficerName !== 'Unassigned').length;
  const highAlertSectors = sectors.filter((s) => s.violationHotspotLevel === 'Critical' || s.violationHotspotLevel === 'High').length;
  const avgSpeedLimit = totalSectors > 0 ? Math.round(sectors.reduce((acc, s) => acc + (Number(s.speedLimit) || 0), 0) / totalSectors) : 60;

  const getHotspotBadgeColor = (level) => {
    switch ((level || '').toLowerCase()) {
      case 'critical':
        return { bg: '#7F1D1D', text: '#FFFFFF', border: '#991B1B' };
      case 'high':
        return { bg: '#FEE2E2', text: '#DC2626', border: '#FECACA' };
      case 'moderate':
        return { bg: '#FEF3C7', text: '#B45309', border: '#FDE68A' };
      default:
        return { bg: '#DCFCE7', text: '#15803D', border: '#BBF7D0' };
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header Section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <h1 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
              Traffic Sectors & Patrol Surveillance
            </h1>
            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                padding: '0.2rem 0.6rem',
                borderRadius: '999px',
                backgroundColor: '#DCFCE7',
                color: '#15803D',
                border: '1px solid #BBF7D0',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.3rem',
              }}
            >
              <Radio size={12} className="animate-pulse" />
              LIVE PATROL GRID
            </span>
          </div>
          <p style={{ fontSize: '0.82rem', color: '#64748B', margin: '0.25rem 0 0 0' }}>
            Metropolitan zones, speed corridors, ANPR camera networks, and officer patrol jurisdictions
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <button
            type="button"
            onClick={handleRefresh}
            disabled={refreshing}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.55rem 0.85rem',
              borderRadius: '8px',
              border: '1px solid #CBD5E1',
              backgroundColor: '#FFFFFF',
              color: '#0F172A',
              fontWeight: 700,
              fontSize: '0.82rem',
              cursor: 'pointer',
            }}
          >
            <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
            <span>Sync Grid</span>
          </button>

          <button
            type="button"
            onClick={openAddModal}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.55rem 1.1rem',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: '#0F172A',
              color: '#FFFFFF',
              fontWeight: 700,
              fontSize: '0.82rem',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(15, 23, 42, 0.2)',
            }}
          >
            <Plus size={16} />
            <span>Add Traffic Sector</span>
          </button>
        </div>
      </div>

      {/* Hero Operational Metrics Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '12px',
            padding: '1.15rem',
            border: '1px solid #E2E8F0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.9rem',
          }}
        >
          <div style={{ padding: '0.65rem', backgroundColor: '#EFF6FF', borderRadius: '10px', color: '#2563EB' }}>
            <Compass size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.74rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>
              Total Sectors
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0F172A' }}>
              {totalSectors}
            </div>
          </div>
        </div>

        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '12px',
            padding: '1.15rem',
            border: '1px solid #E2E8F0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.9rem',
          }}
        >
          <div style={{ padding: '0.65rem', backgroundColor: '#FEE2E2', borderRadius: '10px', color: '#DC2626' }}>
            <AlertTriangle size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.74rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>
              High Alert Hotspots
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#DC2626' }}>
              {highAlertSectors}
            </div>
          </div>
        </div>

        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '12px',
            padding: '1.15rem',
            border: '1px solid #E2E8F0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.9rem',
          }}
        >
          <div style={{ padding: '0.65rem', backgroundColor: '#DCFCE7', borderRadius: '10px', color: '#16A34A' }}>
            <Shield size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.74rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>
              Assigned Officers
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#15803D' }}>
              {assignedOfficersCount} <span style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 600 }}>/ {totalSectors}</span>
            </div>
          </div>
        </div>

        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '12px',
            padding: '1.15rem',
            border: '1px solid #E2E8F0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.9rem',
          }}
        >
          <div style={{ padding: '0.65rem', backgroundColor: '#FEF3C7', borderRadius: '10px', color: '#D97706' }}>
            <Gauge size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.74rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>
              Avg Speed Limit
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0F172A' }}>
              {avgSpeedLimit} <span style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 600 }}>km/h</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '12px',
          padding: '1rem 1.25rem',
          border: '1px solid #E2E8F0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        {/* Search Input */}
        <div style={{ position: 'relative', minWidth: '280px', flex: '1 1 300px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search sectors by name, code, officer, or jurisdiction..."
            style={{
              width: '100%',
              padding: '0.55rem 0.85rem 0.55rem 2.2rem',
              borderRadius: '8px',
              border: '1px solid #CBD5E1',
              fontSize: '0.84rem',
              color: '#0F172A',
              boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Zone Filters */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 700 }}>Zone:</span>
          {['All', 'North Zone', 'South Zone', 'Central Zone', 'East Zone', 'West Zone'].map((z) => (
            <button
              key={z}
              type="button"
              onClick={() => setSelectedZone(z)}
              style={{
                padding: '0.35rem 0.75rem',
                borderRadius: '6px',
                border: '1px solid',
                borderColor: selectedZone === z ? '#0F172A' : '#E2E8F0',
                backgroundColor: selectedZone === z ? '#0F172A' : '#F8FAFC',
                color: selectedZone === z ? '#FFFFFF' : '#475569',
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              {z}
            </button>
          ))}
        </div>
      </div>

      {/* Sector Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.25rem' }}>
        {filteredSectors.map((sector) => {
          const hotStyle = getHotspotBadgeColor(sector.violationHotspotLevel);

          return (
            <div
              key={sector.id}
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '12px',
                border: '1px solid #E2E8F0',
                padding: '1.25rem',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '1rem',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Sector Header */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                      <span
                        style={{
                          fontSize: '0.7rem',
                          fontWeight: 800,
                          padding: '0.15rem 0.5rem',
                          borderRadius: '4px',
                          backgroundColor: '#0F172A',
                          color: '#FFFFFF',
                          fontFamily: 'monospace',
                        }}
                      >
                        {sector.code}
                      </span>
                      <span
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          padding: '0.15rem 0.5rem',
                          borderRadius: '4px',
                          backgroundColor: '#EFF6FF',
                          color: '#1D4ED8',
                        }}
                      >
                        {sector.zone}
                      </span>
                    </div>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A', margin: '0.4rem 0 0.1rem 0' }}>
                      {sector.name}
                    </h3>
                  </div>
                </div>

                <p style={{ fontSize: '0.78rem', color: '#64748B', margin: '0 0 0.75rem 0', lineHeight: 1.4 }}>
                  {sector.jurisdictionArea}
                </p>

                {/* Key Attributes Tags */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem', marginBottom: '0.85rem' }}>
                  {/* Speed Limit */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                      padding: '0.25rem 0.55rem',
                      borderRadius: '6px',
                      backgroundColor: '#F8FAFC',
                      border: '1px solid #E2E8F0',
                      fontSize: '0.74rem',
                      fontWeight: 700,
                      color: '#0F172A',
                    }}
                  >
                    <Gauge size={13} color="#D97706" />
                    <span>{sector.speedLimit} km/h Limit</span>
                  </div>

                  {/* Hotspot Severity */}
                  <div
                    style={{
                      padding: '0.25rem 0.55rem',
                      borderRadius: '6px',
                      backgroundColor: hotStyle.bg,
                      border: `1px solid ${hotStyle.border}`,
                      color: hotStyle.text,
                      fontSize: '0.72rem',
                      fontWeight: 700,
                    }}
                  >
                    Hotspot: {sector.violationHotspotLevel}
                  </div>
                </div>

                {/* Assigned Police Officer Box */}
                <div
                  style={{
                    padding: '0.65rem 0.75rem',
                    backgroundColor: '#F8FAFC',
                    borderRadius: '8px',
                    border: '1px solid #E2E8F0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        backgroundColor: '#0F172A',
                        color: '#FFFFFF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                      }}
                    >
                      👮
                    </div>
                    <div>
                      <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0F172A' }}>
                        {sector.assignedOfficerName || 'Unassigned'}
                      </div>
                      <div style={{ fontSize: '0.68rem', color: '#64748B' }}>
                        Badge: {sector.assignedOfficerBadge || 'TP-0000'}
                      </div>
                    </div>
                  </div>
                  <span style={{ fontSize: '0.7rem', color: '#15803D', fontWeight: 700 }}>
                    ASSIGNED
                  </span>
                </div>
              </div>

              {/* Action Buttons Footer */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  alignItems: 'center',
                  paddingTop: '0.75rem',
                  borderTop: '1px solid #F1F5F9',
                }}
              >
                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  <button
                    type="button"
                    onClick={() => openEditModal(sector)}
                    style={{
                      padding: '0.35rem 0.65rem',
                      borderRadius: '6px',
                      border: '1px solid #CBD5E1',
                      backgroundColor: '#FFFFFF',
                      color: '#0F172A',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                    }}
                  >
                    <Edit2 size={13} />
                    <span>Edit</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeleteConfirmId(sector.id)}
                    style={{
                      padding: '0.35rem 0.65rem',
                      borderRadius: '6px',
                      border: '1px solid #FECACA',
                      backgroundColor: '#FEF2F2',
                      color: '#DC2626',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                    }}
                  >
                    <Trash2 size={13} />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredSectors.length === 0 && (
        <div
          style={{
            textAlign: 'center',
            padding: '3.5rem 1rem',
            backgroundColor: '#FFFFFF',
            borderRadius: '12px',
            border: '1px solid #E2E8F0',
            color: '#64748B',
          }}
        >
          <Compass size={44} style={{ margin: '0 auto 0.75rem auto', color: '#94A3B8' }} />
          <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0F172A', margin: '0 0 0.25rem 0' }}>
            No Traffic Sectors Match Criteria
          </h3>
          <p style={{ fontSize: '0.8rem', margin: '0 0 1rem 0' }}>
            Try adjusting your zone filters, search terms, or add a new surveillance sector.
          </p>
          <button
            type="button"
            onClick={openAddModal}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#0F172A',
              color: '#FFFFFF',
              borderRadius: '8px',
              border: 'none',
              fontWeight: 700,
              fontSize: '0.8rem',
              cursor: 'pointer',
            }}
          >
            + Add New Sector
          </button>
        </div>
      )}

      {/* Add / Edit Sector Modal */}
      {isModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(3px)',
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
              width: '100%',
              maxWidth: '560px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
              overflow: 'hidden',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: '1.15rem 1.35rem',
                borderBottom: '1px solid #E2E8F0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: '#F8FAFC',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ padding: '0.4rem', backgroundColor: '#0F172A', color: '#FFFFFF', borderRadius: '6px' }}>
                  <Compass size={18} />
                </div>
                <div>
                  <h3 style={{ fontSize: '0.98rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                    {editingSector ? 'Edit Traffic Sector' : 'Register New Traffic Sector'}
                  </h3>
                  <div style={{ fontSize: '0.72rem', color: '#64748B' }}>
                    Surveillance jurisdiction & speed regulation zone
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                style={{ background: 'transparent', border: 'none', color: '#64748B', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleFormSubmit} style={{ padding: '1.25rem 1.35rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {formError && (
                <div style={{ padding: '0.65rem 0.85rem', backgroundColor: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '6px', color: '#DC2626', fontSize: '0.78rem', fontWeight: 700 }}>
                  {formError}
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '0.85rem' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155' }}>Sector Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Sector 4 Highway Corridor"
                    style={{
                      width: '100%',
                      padding: '0.55rem 0.75rem',
                      borderRadius: '6px',
                      border: '1px solid #CBD5E1',
                      fontSize: '0.82rem',
                      marginTop: '0.25rem',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155' }}>Sector Code</label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    placeholder="SEC-N04"
                    style={{
                      width: '100%',
                      padding: '0.55rem 0.75rem',
                      borderRadius: '6px',
                      border: '1px solid #CBD5E1',
                      fontSize: '0.82rem',
                      marginTop: '0.25rem',
                      boxSizing: 'border-box',
                      fontFamily: 'monospace',
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155' }}>Metropolitan Zone</label>
                  <select
                    value={formData.zone}
                    onChange={(e) => setFormData({ ...formData, zone: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.55rem 0.75rem',
                      borderRadius: '6px',
                      border: '1px solid #CBD5E1',
                      fontSize: '0.82rem',
                      marginTop: '0.25rem',
                      boxSizing: 'border-box',
                      backgroundColor: '#FFFFFF',
                    }}
                  >
                    <option value="North Zone">North Zone</option>
                    <option value="South Zone">South Zone</option>
                    <option value="Central Zone">Central Zone</option>
                    <option value="East Zone">East Zone</option>
                    <option value="West Zone">West Zone</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155' }}>Assigned Police Officer</label>
                  <select
                    value={formData.assignedOfficerId}
                    onChange={handleOfficerChange}
                    style={{
                      width: '100%',
                      padding: '0.55rem 0.75rem',
                      borderRadius: '6px',
                      border: '1px solid #CBD5E1',
                      fontSize: '0.82rem',
                      marginTop: '0.25rem',
                      boxSizing: 'border-box',
                      backgroundColor: '#FFFFFF',
                    }}
                  >
                    {officers.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.name} ({o.badge})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155' }}>Jurisdiction Area & Landmarks</label>
                <input
                  type="text"
                  value={formData.jurisdictionArea}
                  onChange={(e) => setFormData({ ...formData, jurisdictionArea: e.target.value })}
                  placeholder="e.g. NH-44 Express Km 12 to 26, Northern Junction"
                  style={{
                    width: '100%',
                    padding: '0.55rem 0.75rem',
                    borderRadius: '6px',
                    border: '1px solid #CBD5E1',
                    fontSize: '0.82rem',
                    marginTop: '0.25rem',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155' }}>Speed Limit (km/h)</label>
                  <input
                    type="number"
                    min="20"
                    max="140"
                    value={formData.speedLimit}
                    onChange={(e) => setFormData({ ...formData, speedLimit: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.55rem 0.75rem',
                      borderRadius: '6px',
                      border: '1px solid #CBD5E1',
                      fontSize: '0.82rem',
                      marginTop: '0.25rem',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155' }}>Violation Hotspot Level</label>
                  <select
                    value={formData.violationHotspotLevel}
                    onChange={(e) => setFormData({ ...formData, violationHotspotLevel: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.55rem 0.75rem',
                      borderRadius: '6px',
                      border: '1px solid #CBD5E1',
                      fontSize: '0.82rem',
                      marginTop: '0.25rem',
                      boxSizing: 'border-box',
                      backgroundColor: '#FFFFFF',
                    }}
                  >
                    <option value="Low">Low</option>
                    <option value="Moderate">Moderate</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
              </div>

              {/* Modal Footer */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '0.6rem',
                  paddingTop: '0.75rem',
                  borderTop: '1px solid #F1F5F9',
                  marginTop: '0.5rem',
                }}
              >
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{
                    padding: '0.55rem 1rem',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    backgroundColor: '#FFFFFF',
                    color: '#475569',
                    fontWeight: 700,
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  style={{
                    padding: '0.55rem 1.25rem',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: '#0F172A',
                    color: '#FFFFFF',
                    fontWeight: 700,
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                  }}
                >
                  {editingSector ? 'Save Changes' : 'Register Sector'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteConfirmId && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(3px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 110,
            padding: '1rem',
          }}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '12px',
              padding: '1.5rem',
              maxWidth: '420px',
              width: '100%',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#DC2626', marginBottom: '0.75rem' }}>
              <AlertTriangle size={24} />
              <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: 0, color: '#0F172A' }}>
                Decommission Traffic Sector?
              </h3>
            </div>
            <p style={{ fontSize: '0.82rem', color: '#64748B', lineHeight: 1.5, margin: '0 0 1.25rem 0' }}>
              Are you sure you want to remove this traffic surveillance sector? Associated AI camera mappings and patrol records will be unlinked.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.6rem' }}>
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                style={{
                  padding: '0.5rem 0.85rem',
                  borderRadius: '6px',
                  border: '1px solid #CBD5E1',
                  backgroundColor: '#FFFFFF',
                  color: '#475569',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDelete(deleteConfirmId)}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: '#DC2626',
                  color: '#FFFFFF',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
