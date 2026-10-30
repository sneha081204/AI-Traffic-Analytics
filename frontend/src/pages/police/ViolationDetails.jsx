import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Shield,
  ArrowLeft,
  Printer,
  CheckCircle2,
  AlertTriangle,
  Receipt,
  MapPin,
  Clock,
  Car,
  FileCheck2,
  Cpu,
  QrCode,
  Sparkles,
  Edit3,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { PlateBadge } from '../../components/common/PlateBadge';
import { ROUTES } from '../../config/routes';

export const PoliceViolationDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { violations, updateViolationStatus, updateViolationDetails } = useApp();

  const violation = violations.find((v) => v.id === id) || violations[0];

  const [isEditingPlate, setIsEditingPlate] = useState(false);
  const [plateInput, setPlateInput] = useState('');
  const [plateSaveSuccess, setPlateSaveSuccess] = useState(false);

  const handleVerify = () => {
    if (violation) updateViolationStatus(violation.id, 'Verified');
  };

  const handleGenerateChallan = () => {
    if (violation) updateViolationStatus(violation.id, 'Fine Generated');
  };

  const handleMarkPaid = () => {
    if (violation) updateViolationStatus(violation.id, 'Paid', { paymentStatus: 'Paid' });
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSavePlate = async () => {
    if (!violation || !plateInput.trim()) return;
    const cleanPlate = plateInput.trim().toUpperCase();
    await updateViolationDetails(violation.id, { vehicleNumber: cleanPlate });
    setIsEditingPlate(false);
    setPlateSaveSuccess(true);
    setTimeout(() => setPlateSaveSuccess(false), 3500);
  };

  if (!violation) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h2>Violation Case Not Found</h2>
        <button onClick={() => navigate(ROUTES.POLICE.MY_VIOLATIONS)}>Back to Violations</button>
      </div>
    );
  }

  // Parse dynamic bounding boxes if present
  let dynamicBoxes = null;
  try {
    if (violation.boxes && typeof violation.boxes === 'object') {
      dynamicBoxes = violation.boxes;
    } else if (violation.bounding_boxes_json) {
      dynamicBoxes = typeof violation.bounding_boxes_json === 'string'
        ? JSON.parse(violation.bounding_boxes_json)
        : violation.bounding_boxes_json;
    }
  } catch (e) {
    dynamicBoxes = null;
  }

  const vBox = dynamicBoxes?.vehicle || { x: 30, y: 32, w: 40, h: 58, label: violation.vehicleType || 'Vehicle' };
  const vioBox = dynamicBoxes?.violation || { x: 36, y: 28, w: 26, h: 22, label: `Violation: ${violation.violationType}` };
  const pBox = dynamicBoxes?.plate || { x: 42, y: 74, w: 18, h: 9, label: violation.vehicleNumber || 'Plate' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}>
      {/* Action Navigation Bar (Hidden during Print) */}
      <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            background: 'transparent',
            border: 'none',
            color: '#64748B',
            fontWeight: 700,
            fontSize: '0.85rem',
            cursor: 'pointer',
          }}
        >
          <ArrowLeft size={16} /> Back to Case List
        </button>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={handlePrint}
            style={{
              padding: '0.55rem 1rem',
              backgroundColor: '#2563EB',
              border: 'none',
              borderRadius: '8px',
              fontSize: '0.82rem',
              fontWeight: 700,
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              cursor: 'pointer',
              boxShadow: '0 2px 4px rgba(37,99,235,0.2)',
            }}
          >
            <Printer size={15} /> Print Official e-Challan
          </button>
          {violation.status !== 'Paid' && (
            <button
              onClick={handleMarkPaid}
              style={{
                padding: '0.55rem 1rem',
                backgroundColor: '#16A34A',
                border: 'none',
                borderRadius: '8px',
                fontSize: '0.82rem',
                fontWeight: 700,
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                cursor: 'pointer',
              }}
            >
              <CheckCircle2 size={15} /> Mark Fine as Paid
            </button>
          )}
        </div>
      </div>

      {/* Case Header Status Card (Hidden during Print) */}
      <div
        className="no-print"
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '12px',
          border: '1px solid #E2E8F0',
          padding: '1.25rem 1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A' }}>
              Case File: {violation.id}
            </span>
            <span
              style={{
                padding: '0.2rem 0.6rem',
                borderRadius: '999px',
                fontSize: '0.75rem',
                fontWeight: 700,
                backgroundColor: violation.status === 'Paid' ? '#DCFCE7' : '#EFF6FF',
                color: violation.status === 'Paid' ? '#15803D' : '#2563EB',
              }}
            >
              Status: {violation.status}
            </span>
          </div>
          <div style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '0.2rem' }}>
            Challan Reference: <strong>{violation.challanNo || 'Awaiting Issue'}</strong> • Captured: {violation.date} at {violation.time}
          </div>
        </div>

        <PlateBadge plate={violation.vehicleNumber} size="lg" />
      </div>

      {/* Main Container: On-screen details & Printable e-Challan */}
      <div className="printable-challan-wrapper">
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '12px',
            border: '2px solid #CBD5E1',
            padding: '1.75rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem',
            boxShadow: '0 4px 14px rgba(0,0,0,0.06)',
          }}
        >
          {/* Government Official Header */}
          <div style={{ borderBottom: '2px solid #0F172A', paddingBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '10px',
                  backgroundColor: '#0F172A',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 900,
                  fontSize: '1.2rem',
                }}
              >
                <Shield size={26} color="#38BDF8" />
              </div>
              <div>
                <div style={{ fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.1em', color: '#64748B', textTransform: 'uppercase' }}>
                  STATE POLICE DEPARTMENT • TRAFFIC ENFORCEMENT COMMAND
                </div>
                <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#0F172A', letterSpacing: '-0.02em', marginTop: '0.1rem' }}>
                  STATUTORY TRAFFIC VIOLATION DIGITAL E-CHALLAN
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '0.1rem' }}>
                  Issued under Section 133 / Section 208 of the Motor Vehicles Act 1988 (as amended)
                </div>
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 700 }}>CHALLAN REFERENCE</div>
              <div style={{ fontSize: '1rem', fontWeight: 900, color: '#2563EB', letterSpacing: '0.05em' }}>
                {violation.challanNo || `CH-2026-${violation.id.split('-').pop()}`}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '0.15rem' }}>
                Case ID: {violation.id}
              </div>
            </div>
          </div>

          {/* Grid Layout: Visual Evidence & Case Particulars */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: '1.5rem', alignItems: 'start' }}>
            {/* Left: Real Photographic Evidence with Bounding Boxes */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ fontWeight: 800, fontSize: '0.85rem', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Cpu size={16} color="#2563EB" />
                <span>PHOTOGRAPHIC EVIDENCE & OPTICAL AI OVERLAY</span>
              </div>

              <div
                style={{
                  position: 'relative',
                  width: '100%',
                  height: '240px',
                  backgroundColor: '#0F172A',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  border: '1px solid #CBD5E1',
                }}
              >
                <img
                  src={violation.evidenceUrl || '/storage/evidence/violation_sample.jpg'}
                  alt="Evidence Frame"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />

                {/* Dynamic Vehicle Box */}
                <div
                  style={{
                    position: 'absolute',
                    left: `${vBox.x}%`,
                    top: `${vBox.y}%`,
                    width: `${vBox.w}%`,
                    height: `${vBox.h}%`,
                    border: '2px solid #3B82F6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    boxSizing: 'border-box',
                  }}
                >
                  <span style={{ position: 'absolute', top: '-18px', left: 0, backgroundColor: '#3B82F6', color: '#FFFFFF', fontSize: '9px', fontWeight: 800, padding: '1px 5px', borderRadius: '2px' }}>
                    {vBox.label || violation.vehicleType}
                  </span>
                </div>

                {/* Dynamic Violation Box */}
                <div
                  style={{
                    position: 'absolute',
                    left: `${vioBox.x}%`,
                    top: `${vioBox.y}%`,
                    width: `${vioBox.w}%`,
                    height: `${vioBox.h}%`,
                    border: '2px solid #DC2626',
                    backgroundColor: 'rgba(220, 38, 38, 0.15)',
                    boxSizing: 'border-box',
                  }}
                >
                  <span style={{ position: 'absolute', top: '-18px', left: 0, backgroundColor: '#DC2626', color: '#FFFFFF', fontSize: '9px', fontWeight: 800, padding: '1px 5px', borderRadius: '2px' }}>
                    {vioBox.label || `Violation: ${violation.violationType}`}
                  </span>
                </div>

                {/* Dynamic Plate Box */}
                <div
                  style={{
                    position: 'absolute',
                    left: `${pBox.x}%`,
                    top: `${pBox.y}%`,
                    width: `${pBox.w}%`,
                    height: `${pBox.h}%`,
                    border: '2px solid #16A34A',
                    backgroundColor: 'rgba(22, 163, 74, 0.15)',
                    boxSizing: 'border-box',
                  }}
                >
                  <span style={{ position: 'absolute', top: '-18px', left: 0, backgroundColor: '#16A34A', color: '#FFFFFF', fontSize: '9px', fontWeight: 800, padding: '1px 5px', borderRadius: '2px' }}>
                    {pBox.label || violation.vehicleNumber}
                  </span>
                </div>
              </div>

              {/* AI Forensic Summary Box */}
              <div style={{ backgroundColor: '#F8FAFC', padding: '0.75rem', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '0.75rem' }}>
                <div style={{ fontWeight: 800, color: '#334155', marginBottom: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <Sparkles size={13} color="#2563EB" />
                  <span>AI FORENSIC ANALYSIS REPORT:</span>
                </div>
                <p style={{ margin: 0, color: '#475569', lineHeight: 1.45 }}>
                  {violation.forensics || `Multimodal AI computer vision localized ${violation.vehicleType} and verified infraction: ${violation.violationType} with high confidence metrics.`}
                </p>
              </div>
            </div>

            {/* Right: Statutory Challan Particulars Table */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div style={{ fontWeight: 800, fontSize: '0.85rem', color: '#0F172A' }}>
                STATUTORY OFFENCE & VEHICLE PARTICULARS
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.8rem' }}>
                {/* Registration Number Row with Manual Entry & Editing */}
                <div style={{ borderBottom: '1px solid #F1F5F9', paddingBottom: '0.45rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#64748B', fontWeight: 600 }}>Registration Number:</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <PlateBadge plate={violation.vehicleNumber} size="sm" />
                      <button
                        type="button"
                        onClick={() => {
                          setPlateInput(violation.vehicleNumber && violation.vehicleNumber !== 'UNREADABLE' && violation.vehicleNumber !== 'UNKNOWN' ? violation.vehicleNumber : '');
                          setIsEditingPlate(!isEditingPlate);
                        }}
                        style={{
                          background: isEditingPlate ? '#F1F5F9' : '#EFF6FF',
                          border: `1px solid ${isEditingPlate ? '#CBD5E1' : '#BFDBFE'}`,
                          color: isEditingPlate ? '#64748B' : '#2563EB',
                          padding: '0.2rem 0.5rem',
                          borderRadius: '4px',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                        }}
                      >
                        <Edit3 size={11} />
                        <span>
                          {isEditingPlate ? 'Cancel' : (!violation.vehicleNumber || violation.vehicleNumber === 'UNREADABLE' || violation.vehicleNumber === 'UNKNOWN' ? '+ Manually Add Plate' : 'Edit Plate')}
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Manual Plate Entry Input Box */}
                  {isEditingPlate && (
                    <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.45rem', backgroundColor: '#FEF3C7', padding: '0.45rem 0.6rem', borderRadius: '6px', border: '1px solid #FCD34D' }}>
                      <input
                        type="text"
                        placeholder="Enter Vehicle Plate (e.g. KA05MN4821)"
                        value={plateInput}
                        onChange={(e) => setPlateInput(e.target.value.toUpperCase())}
                        style={{
                          flex: 1,
                          padding: '0.35rem 0.55rem',
                          borderRadius: '4px',
                          border: '1px solid #F59E0B',
                          fontSize: '0.8rem',
                          fontWeight: 800,
                          fontFamily: 'monospace',
                          letterSpacing: '0.05em',
                          outline: 'none',
                          backgroundColor: '#FFFFFF',
                          color: '#0F172A',
                        }}
                      />
                      <button
                        type="button"
                        onClick={handleSavePlate}
                        style={{
                          padding: '0.35rem 0.75rem',
                          backgroundColor: '#D97706',
                          color: '#FFFFFF',
                          border: 'none',
                          borderRadius: '4px',
                          fontWeight: 700,
                          fontSize: '0.75rem',
                          cursor: 'pointer',
                        }}
                      >
                        Save Plate
                      </button>
                    </div>
                  )}

                  {plateSaveSuccess && (
                    <div style={{ fontSize: '0.72rem', color: '#16A34A', fontWeight: 700, marginTop: '0.25rem' }}>
                      ✓ Vehicle plate saved to database successfully!
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', paddingBottom: '0.35rem' }}>
                  <span style={{ color: '#64748B', fontWeight: 600 }}>Vehicle Category:</span>
                  <span style={{ fontWeight: 700, color: '#0F172A' }}>{violation.vehicleType}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', paddingBottom: '0.35rem' }}>
                  <span style={{ color: '#64748B', fontWeight: 600 }}>Detected Offence:</span>
                  <span style={{ fontWeight: 800, color: '#DC2626' }}>{violation.violationType}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', paddingBottom: '0.35rem' }}>
                  <span style={{ color: '#64748B', fontWeight: 600 }}>Statutory Section:</span>
                  <span style={{ fontWeight: 700, color: '#0F172A' }}>{violation.ruleSection || 'Section 129 Motor Vehicles Act'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', paddingBottom: '0.35rem' }}>
                  <span style={{ color: '#64748B', fontWeight: 600 }}>Date & Timestamp:</span>
                  <span style={{ fontWeight: 700, color: '#0F172A' }}>{violation.date} at {violation.time}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', paddingBottom: '0.35rem' }}>
                  <span style={{ color: '#64748B', fontWeight: 600 }}>Location Jurisdiction:</span>
                  <span style={{ fontWeight: 700, color: '#0F172A' }}>{violation.location}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', paddingBottom: '0.35rem' }}>
                  <span style={{ color: '#64748B', fontWeight: 600 }}>Enforcing Officer:</span>
                  <span style={{ fontWeight: 700, color: '#0F172A' }}>{violation.officerName} ({violation.officerBadge})</span>
                </div>
              </div>

              {/* Penalty Amount Card */}
              <div
                style={{
                  backgroundColor: '#EFF6FF',
                  border: '1.5px solid #BFDBFE',
                  borderRadius: '8px',
                  padding: '0.75rem 1rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <div style={{ fontSize: '0.7rem', color: '#1E40AF', fontWeight: 700, textTransform: 'uppercase' }}>
                    STATUTORY FINE ASSESSED
                  </div>
                  <div style={{ fontSize: '0.75rem', color: violation.paymentStatus === 'Paid' ? '#16A34A' : '#DC2626', fontWeight: 800 }}>
                    Status: {violation.paymentStatus === 'Paid' ? 'PAID IN FULL' : 'PAYMENT PENDING'}
                  </div>
                </div>
                <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#1E3A8A' }}>
                  ₹{violation.fineAmount?.toLocaleString('en-IN')}
                </div>
              </div>
            </div>
          </div>

          {/* Statutory Instructions & Digital Verification Footer */}
          <div
            style={{
              borderTop: '1px solid #E2E8F0',
              paddingTop: '0.85rem',
              display: 'grid',
              gridTemplateColumns: '2fr 1fr',
              gap: '1.5rem',
              fontSize: '0.72rem',
              color: '#64748B',
            }}
          >
            <div>
              <div style={{ fontWeight: 800, color: '#0F172A', marginBottom: '0.2rem' }}>
                PAYMENT INSTRUCTIONS & STATUTORY NOTICE:
              </div>
              <p style={{ margin: 0, lineHeight: 1.4 }}>
                1. Remit penalty within 60 days of notice via the Parivahan portal (<strong>https://echallan.parivahan.gov.in</strong>) or at authorized Traffic Police Helpdesks.
                <br />
                2. Non-payment of fine within statutory period will lead to automatic summons under Section 208 MV Act before the Metropolitan Traffic Court.
              </p>
            </div>

            <div style={{ borderLeft: '1px solid #E2E8F0', paddingLeft: '1rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div style={{ fontWeight: 800, color: '#0F172A' }}>DIGITALLY AUTHENTICATED</div>
              <div style={{ color: '#16A34A', fontWeight: 700, fontSize: '0.7rem', marginTop: '0.1rem' }}>
                ✓ Official Traffic Core Seal
              </div>
              <div style={{ fontSize: '0.65rem', color: '#94A3B8', marginTop: '0.2rem' }}>
                Verified by {violation.officerName} ({violation.officerBadge})
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
