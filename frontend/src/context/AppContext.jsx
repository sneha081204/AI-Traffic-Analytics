import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { officerService } from '../services/officerService';
import { violationService } from '../services/violationService';
import { ruleService } from '../services/ruleService';
import { aiDetectionService } from '../services/aiDetectionService';
import { sectorService } from '../services/sectorService';

const AppContext = createContext(null);

const DEFAULT_OFFICERS = [
  {
    id: 'off-101',
    name: 'Inspector Vikram Singh',
    username: 'officer.vikram',
    password: 'police123',
    badge: 'TP-8421',
    designation: 'Senior Traffic Sub-Inspector',
    department: 'North Traffic Zone Directorate',
    assignedArea: 'North Zone — Sector 4 Highway Corridor',
    status: 'Active',
    violationsDetected: 28,
    violationsVerified: 26,
    finesGenerated: 26000,
    casesRejected: 2,
    lastActive: 'Active Now',
    cameraActive: true,
    phone: '+91 98765 43210',
    joiningDate: '12-Mar-2022',
    avatar: 'VS',
  },
  {
    id: 'off-102',
    name: 'Sub-Inspector Ananya Sharma',
    username: 'officer.ananya',
    password: 'police123',
    badge: 'TP-3194',
    designation: 'Traffic Sub-Inspector',
    department: 'Central Traffic Headquarters',
    assignedArea: 'Central Zone — Central Plaza Junction',
    status: 'Active',
    violationsDetected: 34,
    violationsVerified: 31,
    finesGenerated: 35500,
    casesRejected: 3,
    lastActive: '10 mins ago',
    cameraActive: true,
    phone: '+91 98765 11223',
    joiningDate: '05-Jan-2023',
    avatar: 'AS',
  },
  {
    id: 'off-103',
    name: 'Assistant Sub-Inspector Rajesh Kumar',
    username: 'officer.rajesh',
    password: 'police123',
    badge: 'TP-5520',
    designation: 'Assistant Sub-Inspector',
    department: 'South Zone Traffic Division',
    assignedArea: 'South Zone — South Expressway Tollway',
    status: 'Active',
    violationsDetected: 19,
    violationsVerified: 18,
    finesGenerated: 19500,
    casesRejected: 1,
    lastActive: '25 mins ago',
    cameraActive: false,
    phone: '+91 98765 44556',
    joiningDate: '18-Aug-2021',
    avatar: 'RK',
  },
  {
    id: 'off-104',
    name: 'Sub-Inspector Priya Patel',
    username: 'officer.priya',
    password: 'police123',
    badge: 'TP-7719',
    designation: 'Traffic Sub-Inspector',
    department: 'East Zone Highway Patrol',
    assignedArea: 'East Zone — Airport Outer Ring Road',
    status: 'Active',
    violationsDetected: 22,
    violationsVerified: 20,
    finesGenerated: 21000,
    casesRejected: 2,
    lastActive: 'Active Now',
    cameraActive: true,
    phone: '+91 98765 77889',
    joiningDate: '10-Nov-2023',
    avatar: 'PP',
  },
  {
    id: 'off-105',
    name: 'Inspector Mohammad Arshad',
    username: 'officer.arshad',
    password: 'police123',
    badge: 'TP-6208',
    designation: 'Senior Traffic Sub-Inspector',
    department: 'West Traffic Zone Directorate',
    assignedArea: 'West Zone — Western Tech Park Boulevard',
    status: 'Active',
    violationsDetected: 41,
    violationsVerified: 38,
    finesGenerated: 44000,
    casesRejected: 3,
    lastActive: '1 hour ago',
    cameraActive: true,
    phone: '+91 98765 99001',
    joiningDate: '14-Feb-2022',
    avatar: 'MA',
  },
  {
    id: 'off-106',
    name: 'Assistant Sub-Inspector Suresh Patil',
    username: 'officer.suresh',
    password: 'police123',
    badge: 'TP-4190',
    designation: 'Assistant Sub-Inspector',
    department: 'Metropolitan Traffic Command',
    assignedArea: 'South Zone — Metro Transit Junction',
    status: 'Active',
    violationsDetected: 16,
    violationsVerified: 15,
    finesGenerated: 16000,
    casesRejected: 1,
    lastActive: '3 hours ago',
    cameraActive: false,
    phone: '+91 98765 33445',
    joiningDate: '01-Jun-2024',
    avatar: 'SP',
  },
  {
    id: 'off-972',
    name: 'hello',
    username: 'hello',
    password: 'hello',
    badge: 'TP-1851',
    designation: 'Traffic Sub-Inspector',
    department: 'North Traffic Zone Directorate',
    assignedArea: 'East Zone — Airport Outer Ring Road',
    status: 'Active',
    violationsDetected: 15,
    violationsVerified: 15,
    finesGenerated: 13500,
    casesRejected: 0,
    lastActive: 'Active Now',
    cameraActive: true,
    phone: '+91 98765 00000',
    joiningDate: '25 Oct 2026',
    avatar: 'H',
  },
];

export const AppProvider = ({ children }) => {
  // 1. Configurable Department Violation Rules
  const [violationRules, setViolationRules] = useState([
    { id: 'VR-01', name: 'Riding without a helmet', description: 'Two-wheeler rider is not wearing a protective helmet', fine: 1000, severity: 'HIGH', ruleSection: 'Section 129 / 194D Motor Vehicles Act', status: 'Active' },
    { id: 'VR-02', name: 'Pillion rider without a helmet', description: 'Passenger on a two-wheeler is not wearing a protective helmet', fine: 1000, severity: 'HIGH', ruleSection: 'Section 129 / 194D Motor Vehicles Act', status: 'Active' },
    { id: 'VR-03', name: 'Triple riding', description: 'More than two people are riding a motorcycle or scooter', fine: 1000, severity: 'HIGH', ruleSection: 'Section 128 / 194C Motor Vehicles Act', status: 'Active' },
    { id: 'VR-04', name: 'Not wearing a seat belt', description: 'Vehicle occupant (driver or front passenger) is not wearing a safety seat belt', fine: 1000, severity: 'MEDIUM', ruleSection: 'Section 194B Motor Vehicles Act', status: 'Active' },
    { id: 'VR-05', name: 'Red-light jumping', description: 'Vehicle crosses the stop line or intersection after the signal turns red', fine: 1000, severity: 'CRITICAL', ruleSection: 'Section 184 / 119 Motor Vehicles Act', status: 'Active' },
    { id: 'VR-06', name: 'Stop-line violation', description: 'Vehicle crosses the stop line when required to stop at junction', fine: 500, severity: 'LOW', ruleSection: 'Section 177 Motor Vehicles Act', status: 'Active' },
    { id: 'VR-07', name: 'Wrong-side driving', description: 'Vehicle travels against the authorized traffic direction or one-way', fine: 2000, severity: 'CRITICAL', ruleSection: 'Section 119 / 177 Motor Vehicles Act', status: 'Active' },
    { id: 'VR-08', name: 'Over-speeding', description: 'Vehicle exceeds the applicable corridor speed limit', fine: 2000, severity: 'HIGH', ruleSection: 'Section 112 / 183 Motor Vehicles Act', status: 'Active' },
    { id: 'VR-09', name: 'Illegal parking', description: 'Vehicle is parked in a prohibited or no-parking zone obstructing flow', fine: 500, severity: 'LOW', ruleSection: 'Section 122 / 177 Motor Vehicles Act', status: 'Active' },
    { id: 'VR-10', name: 'Footpath driving', description: 'Vehicle is driven on a pedestrian footpath or sidewalk', fine: 1000, severity: 'HIGH', ruleSection: 'Section 123 / 177 Motor Vehicles Act', status: 'Active' },
    { id: 'VR-11', name: 'Zebra-crossing obstruction', description: 'Vehicle stops on or obstructs a pedestrian zebra crossing', fine: 500, severity: 'LOW', ruleSection: 'Section 177 Motor Vehicles Act', status: 'Active' },
    { id: 'VR-12', name: 'Lane violation', description: 'Vehicle violates designated lane markings or lane discipline', fine: 1000, severity: 'MEDIUM', ruleSection: 'Section 177 Motor Vehicles Act', status: 'Active' },
    { id: 'VR-13', name: 'Dangerous or zigzag driving', description: 'Vehicle exhibits reckless maneuvers or zigzag driving endangering public safety', fine: 5000, severity: 'CRITICAL', ruleSection: 'Section 184 Motor Vehicles Act', status: 'Active' },
    { id: 'VR-14', name: 'Illegal U-turn', description: 'Vehicle makes a prohibited U-turn at restricted junction or intersection', fine: 1000, severity: 'MEDIUM', ruleSection: 'Section 177 Motor Vehicles Act', status: 'Active' },
    { id: 'VR-15', name: 'No-entry violation', description: 'Vehicle enters a restricted road, one-way street, or prohibited zone', fine: 2000, severity: 'HIGH', ruleSection: 'Section 115 / 177 Motor Vehicles Act', status: 'Active' },
    { id: 'VR-16', name: 'Mobile phone use while driving', description: 'Driver uses or holds a mobile phone while operating vehicle in motion', fine: 1500, severity: 'HIGH', ruleSection: 'Section 184(c) Motor Vehicles Act', status: 'Active' },
    { id: 'VR-17', name: 'Wrong overtaking', description: 'Driver overtakes in a prohibited, dangerous manner or over solid double white lines', fine: 2000, severity: 'HIGH', ruleSection: 'Section 184 Motor Vehicles Act', status: 'Active' },
    { id: 'VR-18', name: 'Blocking an intersection', description: 'Vehicle obstructs a junction or remains stopped within a yellow box junction', fine: 1000, severity: 'MEDIUM', ruleSection: 'Section 177 Motor Vehicles Act', status: 'Active' },
    { id: 'VR-19', name: 'Driving in a bus-only lane', description: 'Unauthorized vehicle enters a lane reserved for public buses or emergency vehicles', fine: 2000, severity: 'HIGH', ruleSection: 'Section 119 / 177 Motor Vehicles Act', status: 'Active' },
    { id: 'VR-20', name: 'Unauthorised vehicle in a restricted zone', description: 'Commercial or heavy vehicle enters restricted zone during prohibited hours', fine: 5000, severity: 'CRITICAL', ruleSection: 'Section 115 / 194 Motor Vehicles Act', status: 'Active' },
    { id: 'VR-21', name: 'Wearing non-standard / half helmet', description: 'Two-wheeler rider or pillion wearing a non-standard half helmet, cap helmet, or unapproved headgear without ISI certification', fine: 1000, severity: 'HIGH', ruleSection: 'Section 129 / 194D Motor Vehicles Act', status: 'Active' },
  ]);

  // 2. Configurable Department AI Configuration
  const [aiConfig, setAiConfig] = useState({
    provider: 'Google Gemini Vision AI (Multimodal)',
    apiKey: (() => {
      const k = localStorage.getItem('GEMINI_API_KEY') || '';
      return (k.startsWith('AIzaSyDemo') || k.includes('••••')) ? '' : k;
    })(),
    model: 'gemini-2.5-flash',
    confidenceThreshold: 0.75,
    violationThreshold: 0.70,
    processingMode: 'Edge + Cloud Multimodal Assist',
    enabled: true,
    lastTested: 'Connected (Live)',
    dedupCooldownSeconds: 30,
  });

  // 3. Police Officers Network (Department view & Auth registry)
  const [officers, setOfficers] = useState(() => {
    try {
      const saved = localStorage.getItem('POLICE_OFFICERS_LIST');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length >= 3) return parsed;
      }
    } catch {}
    return DEFAULT_OFFICERS;
  });

  // 4. Violation Enforcement Cases (Central Database)
  const [violations, setViolations] = useState([]);
  
  // 5. Traffic Surveillance & Enforcement Sectors
  const [sectors, setSectors] = useState(() => {
    try {
      const saved = localStorage.getItem('TRAFFIC_SECTORS_LIST');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return [];
  });
  const [loading, setLoading] = useState(true);

  // Sync state to LocalStorage for offline reliability
  useEffect(() => {
    try {
      localStorage.setItem('POLICE_OFFICERS_LIST', JSON.stringify(officers));
    } catch {}
  }, [officers]);

  useEffect(() => {
    try {
      localStorage.setItem('TRAFFIC_SECTORS_LIST', JSON.stringify(sectors));
    } catch {}
  }, [sectors]);

  // Initial Data Fetching from Database API Endpoints
  const refreshAllData = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch Officers
      const officersRes = await officerService.getAllOfficers();
      if (officersRes?.data && officersRes.data.length > 0) {
        setOfficers(officersRes.data);
      }

      // Fetch Violations
      const violationsRes = await violationService.getAllViolations();
      if (violationsRes?.data) {
        setViolations(violationsRes.data);
      }

      // Fetch Sectors
      const sectorsRes = await sectorService.getSectors();
      if (sectorsRes?.data && sectorsRes.data.length > 0) {
        setSectors(sectorsRes.data);
      }

      // Fetch Rules
      const rulesRes = await ruleService.getAllRules();
      if (rulesRes?.data && rulesRes.data.length > 0) {
        setViolationRules(rulesRes.data);
      }

      // Fetch AI Config
      const aiRes = await aiDetectionService.getConfiguration();
      if (aiRes?.data) {
        setAiConfig((prev) => ({ ...prev, ...aiRes.data }));
        const remoteKey = aiRes.data.apiKey;
        if (
          remoteKey &&
          typeof remoteKey === 'string' &&
          remoteKey.length > 25 &&
          !remoteKey.includes('••••') &&
          !remoteKey.toLowerCase().includes('demo')
        ) {
          localStorage.setItem('GEMINI_API_KEY', remoteKey.trim());
        }
      }
    } catch (err) {
      console.warn('Backend API sync notice (using cached/fallback state):', err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshAllData();
  }, [refreshAllData]);

  // Action: Add Officer (persisting to DB)
  const addOfficer = async (officerData) => {
    const initials = officerData.name
      .split(' ')
      .map((w) => w[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || 'PO';

    const tempId = `off-${Date.now().toString().slice(-3)}`;
    const newOfficer = {
      id: tempId,
      violationsDetected: 0,
      violationsVerified: 0,
      finesGenerated: 0,
      casesRejected: 0,
      lastActive: 'Just registered',
      cameraActive: false,
      avatar: initials,
      joiningDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      status: 'Active',
      password: officerData.password || 'police123',
      ...officerData,
    };

    // Optimistic state update
    setOfficers((prev) => [newOfficer, ...prev]);

    try {
      const res = await officerService.createOfficer(newOfficer);
      if (res?.data) {
        setOfficers((prev) => prev.map((o) => (o.id === tempId ? res.data : o)));
        return res.data;
      }
    } catch (e) {
      console.warn('Persisted to local cache:', e.message);
    }
    return newOfficer;
  };

  // Action: Update Officer Status
  const updateOfficerStatus = async (id, newStatus) => {
    setOfficers((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status: newStatus } : o))
    );
    try {
      await officerService.updateOfficerStatus(id, newStatus);
    } catch (e) {
      console.warn('Officer status updated locally:', e.message);
    }
  };

  // Action: Update Officer Profile & Jurisdiction
  const updateOfficerProfile = async (id, updatedFields) => {
    setOfficers((prev) =>
      prev.map((o) => (o.id === id ? { ...o, ...updatedFields } : o))
    );
    try {
      const res = await officerService.updateOfficerProfile(id, updatedFields);
      if (res?.data) {
        setOfficers((prev) => prev.map((o) => (o.id === id ? res.data : o)));
        return res.data;
      }
    } catch (e) {
      console.warn('Officer profile update notice:', e.message);
    }
  };

  // Action: Add Violation (persisting to DB)
  const addViolation = async (newViolation) => {
    // Prevent duplicate entries
    setViolations((prev) => {
      if (prev.some((v) => v.id === newViolation.id || (v.challanNo && v.challanNo === newViolation.challanNo))) {
        return prev;
      }
      return [newViolation, ...prev];
    });

    try {
      const res = await violationService.createViolation(newViolation);
      if (res?.data) {
        setViolations((prev) =>
          prev.map((v) => (v.id === newViolation.id ? res.data : v))
        );
      }
    } catch (e) {
      console.warn('Violation registered locally:', e.message);
    }
  };

  // Action: Update Violation Status / Payment
  const updateViolationStatus = async (id, newStatus, extra = {}) => {
    setViolations((prev) =>
      prev.map((v) => (v.id === id ? { ...v, status: newStatus, ...extra } : v))
    );
    try {
      await violationService.updateViolation(id, { status: newStatus, ...extra });
    } catch (e) {
      console.warn('Violation status updated locally:', e.message);
    }
  };

  // Action: Update Violation Details (e.g. Manually adding / correcting vehicle plate number)
  const updateViolationDetails = async (id, updatedFields = {}) => {
    setViolations((prev) =>
      prev.map((v) => (v.id === id ? { ...v, ...updatedFields } : v))
    );
    try {
      await violationService.updateViolation(id, updatedFields);
    } catch (e) {
      console.warn('Violation details updated locally:', e.message);
    }
  };

  // Action: Rules Engine Actions
  const addRule = async (rule) => {
    const tempRule = { ...rule, id: `VR-${Date.now().toString().slice(-2)}` };
    setViolationRules((prev) => [...prev, tempRule]);
    try {
      const res = await ruleService.createRule(tempRule);
      if (res?.data) {
        setViolationRules((prev) => prev.map((r) => (r.id === tempRule.id ? res.data : r)));
      }
    } catch (e) {
      console.warn('Rule saved locally:', e.message);
    }
  };

  const updateRule = async (id, updatedFields) => {
    setViolationRules((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...updatedFields } : r))
    );
    try {
      await ruleService.updateRule(id, updatedFields);
    } catch (e) {
      console.warn('Rule updated locally:', e.message);
    }
  };

  const deleteRule = (id) => {
    setViolationRules((prev) => prev.filter((r) => r.id !== id));
  };

  // Action: Traffic Sectors Management
  const addSector = async (sectorData) => {
    const tempId = sectorData.id || `SEC-${Date.now().toString().slice(-3)}`;
    const tempSector = {
      id: tempId,
      name: sectorData.name,
      code: sectorData.code || `SEC-${sectorData.name?.slice(0, 3).toUpperCase() || 'NEW'}`,
      zone: sectorData.zone || 'North Zone',
      assignedOfficerName: sectorData.assignedOfficerName || 'Enforcement Officer',
      assignedOfficerBadge: sectorData.assignedOfficerBadge || 'TP-0000',
      jurisdictionArea: sectorData.jurisdictionArea || 'Metropolitan Traffic Corridor',
      speedLimit: Number(sectorData.speedLimit || 60),
      activeCamerasCount: Number(sectorData.activeCamerasCount || 4),
      congestionLevel: sectorData.congestionLevel || 'Moderate',
      violationHotspotLevel: sectorData.violationHotspotLevel || 'Moderate',
      status: sectorData.status || 'Active',
      patrolFrequency: sectorData.patrolFrequency || 'Continuous 24/7 Patrol',
      description: sectorData.description || '',
      ...sectorData,
    };

    setSectors((prev) => [tempSector, ...prev]);

    try {
      const res = await sectorService.createSector(tempSector);
      if (res?.data) {
        setSectors((prev) => prev.map((s) => (s.id === tempId ? res.data : s)));
        return res.data;
      }
    } catch (e) {
      console.warn('Sector saved locally:', e.message);
    }
    return tempSector;
  };

  const updateSector = async (id, updatedFields) => {
    setSectors((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updatedFields } : s))
    );
    try {
      const res = await sectorService.updateSector(id, updatedFields);
      if (res?.data) {
        setSectors((prev) => prev.map((s) => (s.id === id ? res.data : s)));
      }
    } catch (e) {
      console.warn('Sector updated locally:', e.message);
    }
  };

  const deleteSector = async (id) => {
    setSectors((prev) => prev.filter((s) => s.id !== id));
    try {
      await sectorService.deleteSector(id);
    } catch (e) {
      console.warn('Sector deleted locally:', e.message);
    }
  };

  const refreshSectors = async () => {
    try {
      const res = await sectorService.getSectors();
      if (res?.data) {
        setSectors(res.data);
      }
    } catch (e) {
      console.warn('Failed to refresh sectors:', e);
    }
  };

  // Action: AI Detection & Gemini Configuration Management
  const saveAiConfig = async (newConfig) => {
    setAiConfig((prev) => ({ ...prev, ...newConfig }));
    if (newConfig.apiKey) {
      localStorage.setItem('GEMINI_API_KEY', newConfig.apiKey);
    }
    try {
      const res = await aiDetectionService.updateConfiguration(newConfig);
      if (res?.data) {
        setAiConfig((prev) => ({ ...prev, ...res.data }));
      }
      return res;
    } catch (e) {
      console.warn('AI config save notice:', e.message);
    }
  };

  return (
    <AppContext.Provider
      value={{
        violationRules,
        addRule,
        updateRule,
        deleteRule,
        aiConfig,
        saveAiConfig,
        officers,
        addOfficer,
        updateOfficerStatus,
        updateOfficerProfile,
        violations,
        addViolation,
        updateViolationStatus,
        updateViolationDetails,
        sectors,
        addSector,
        updateSector,
        deleteSector,
        refreshSectors,
        refreshAllData,
        loading,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
