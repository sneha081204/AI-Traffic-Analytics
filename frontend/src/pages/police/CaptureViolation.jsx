import React, { useState, useRef, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Camera,
  UploadCloud,
  Video,
  CheckCircle2,
  AlertTriangle,
  FileCheck2,
  XCircle,
  Save,
  RotateCcw,
  Sparkles,
  Shield,
  Layers,
  FileText,
  MapPin,
  Clock,
  Car,
  Receipt,
  PlusCircle,
  Image,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { PlateBadge } from '../../components/common/PlateBadge';
import { LiveCameraDetector } from '../../components/camera/LiveCameraDetector';
import { ROUTES } from '../../config/routes';
import { aiDetectionService } from '../../services/aiDetectionService';

export const CaptureViolation = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'image';
  const [activeTab, setActiveTab] = useState(initialTab);

  const { user } = useAuth();
  const { violationRules, addViolation, sectors } = useApp();
  const navigate = useNavigate();

  // Upload states
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [fileInfo, setFileInfo] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [analyzed, setAnalyzed] = useState(false);
  const [activeOverlay, setActiveOverlay] = useState(true);

  // Analysis result state
  const videoRef = useRef(null);
  const [detectionResult, setDetectionResult] = useState(null);
  const [selectedViolationType, setSelectedViolationType] = useState('Compliant (No Violation)');
  const [manualPlateInput, setManualPlateInput] = useState('');
  const [isEditingPlate, setIsEditingPlate] = useState(false);
  const [actionSuccess, setActionSuccess] = useState(null);
  const [detectionError, setDetectionError] = useState(null);

  // Video state
  const [videoFrameCapture, setVideoFrameCapture] = useState(null);

  // Manual Violation Entry State (Starts completely clean without hardcoded plate, photo, or mock data)
  const [manualForm, setManualForm] = useState({
    vehicleNumber: '',
    vehicleType: '',
    violationType: '',
    ruleSection: '',
    fineAmount: '',
    location: '',
    status: 'Verified',
    forensics: '',
    evidenceUrl: '',
    date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
    time: new Date().toLocaleTimeString('en-US', { hour12: true }),
  });
  const [manualSubmitting, setManualSubmitting] = useState(false);
  const [manualPhotoPreview, setManualPhotoPreview] = useState(null);

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && (tab === 'image' || tab === 'video' || tab === 'camera' || tab === 'manual')) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  // Dynamically set location from logged-in officer's jurisdiction
  useEffect(() => {
    if (!manualForm.location && user?.assignedArea) {
      setManualForm((prev) => ({
        ...prev,
        location: user.assignedArea,
      }));
    } else if (!manualForm.location && sectors && sectors.length > 0) {
      const s0 = sectors[0];
      setManualForm((prev) => ({
        ...prev,
        location: s0.name || s0.corridor || s0.id || '',
      }));
    }
  }, [user, sectors]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
    resetForm();
  };

  const handleManualRuleChange = (ruleName) => {
    if (!ruleName) {
      setManualForm((prev) => ({
        ...prev,
        violationType: '',
        ruleSection: '',
        fineAmount: '',
      }));
      return;
    }
    const matched = violationRules?.find((r) => r.name === ruleName);
    setManualForm((prev) => ({
      ...prev,
      violationType: ruleName,
      ruleSection: matched?.ruleSection || matched?.rule_section || 'Section 177 Motor Vehicles Act',
      fineAmount: matched?.fine !== undefined ? matched.fine : 1000,
    }));
  };

  const handleManualImageUpload = (e) => {
    const uploadedFile = e.target.files?.[0];
    if (uploadedFile) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setManualPhotoPreview(event.target.result);
        setManualForm((prev) => ({ ...prev, evidenceUrl: event.target.result }));
      };
      reader.readAsDataURL(uploadedFile);
    }
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    if (!manualForm.vehicleNumber.trim()) {
      alert('Please enter a valid vehicle plate number.');
      return;
    }
    if (!manualForm.vehicleType) {
      alert('Please select a vehicle class / category.');
      return;
    }
    if (!manualForm.violationType) {
      alert('Please select a traffic violation offence.');
      return;
    }

    setManualSubmitting(true);
    const tsSuffix = Date.now().toString().slice(-6);
    const randSuffix = Math.floor(100 + Math.random() * 900);
    const caseId = `VIO-2026-${tsSuffix}-${randSuffix}`;
    const challanNo = `CH-2026-${tsSuffix}-${randSuffix}`;

    const newRecord = {
      id: caseId,
      challanNo: challanNo,
      vehicleNumber: manualForm.vehicleNumber.toUpperCase().replace(/\s+/g, ''),
      vehicleType: manualForm.vehicleType,
      violationType: manualForm.violationType,
      ruleSection: manualForm.ruleSection || 'Section 177 Motor Vehicles Act',
      fineAmount: Number(manualForm.fineAmount) || 1000,
      confidence: 1.0,
      time: manualForm.time || new Date().toLocaleTimeString('en-US', { hour12: true }),
      date: manualForm.date || new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      location: manualForm.location || user?.assignedArea || 'Metropolitan Traffic Division',
      officerName: user?.name || 'Enforcement Officer',
      officerBadge: user?.badge || 'TP-0000',
      detectionMethod: 'Manual Officer Enforcement',
      evidenceUrl: manualPhotoPreview || manualForm.evidenceUrl || null,
      status: manualForm.status || 'Verified',
      paymentStatus: 'Pending',
      forensics: manualForm.forensics || 'Officer on-site physical observation of statutory violation.',
      boundingBoxes: null,
    };

    try {
      await addViolation(newRecord);
      setActionSuccess({
        type: 'MANUAL_CHALLAN_ISSUED',
        caseId: caseId,
        challanNo: challanNo,
        message: `Manual Violation Record & e-Challan #${challanNo} Successfully Issued!`,
      });
    } catch (err) {
      alert(`Failed to save violation: ${err.message}`);
    } finally {
      setManualSubmitting(false);
    }
  };

  const resetForm = () => {
    setFile(null);
    setPreviewUrl(null);
    setFileInfo(null);
    setProcessing(false);
    setAnalyzed(false);
    setDetectionResult(null);
    setManualPlateInput('');
    setIsEditingPlate(false);
    setDetectionError(null);
    setActionSuccess(null);
    setVideoFrameCapture(null);
    setSelectedViolationType('Compliant (No Violation)');
  };

  // Dedicated video frame extractor for current playback position
  const handleAnalyzeCurrentVideoFrame = async () => {
    if (!videoRef.current) return;
    try {
      const vid = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = vid.videoWidth || 1280;
      canvas.height = vid.videoHeight || 720;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(vid, 0, 0, canvas.width, canvas.height);
      const base64Data = canvas.toDataURL('image/jpeg', 0.90);
      setProcessing(true);
      setDetectionError(null);
      const res = await aiDetectionService.detectFrame({
        image: base64Data,
        filename: file?.name ? `${file.name.replace(/\.[^/.]+$/, '')}_t${Math.floor(vid.currentTime || 0)}s.jpg` : 'video_frame.jpg',
        location: user?.assignedArea || 'Field Upload Station',
        officerId: user?.id,
      });
      if (res?.success && res.data) {
        const d = res.data;
        setDetectionResult(d);
        if (d.vehicleNumber && d.vehicleNumber !== 'UNREADABLE' && d.vehicleNumber !== 'UNKNOWN') {
          setManualPlateInput(d.vehicleNumber);
          setIsEditingPlate(false);
        } else {
          setManualPlateInput('');
          setIsEditingPlate(true);
        }
        if (d.hasViolation === false || !d.violationType || d.violationType.toLowerCase().includes('compliant') || d.violationType.toLowerCase().includes('no violation')) {
          setSelectedViolationType('Compliant (No Violation)');
        } else {
          const matched = findRuleByName(d.violationType);
          setSelectedViolationType(matched ? matched.name : d.violationType);
        }
      }
    } catch (err) {
      console.warn('Frame capture error:', err);
      setDetectionError(err.message || 'Failed to capture frame from video');
    } finally {
      setProcessing(false);
      setAnalyzed(true);
    }
  };

  // Load evidence and process through real backend AI detection engine
  const handleLoadSample = async (type) => {
    let sampleUrl = 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=900&auto=format&fit=crop&q=80';
    let sampleName = 'junction_rider_04.jpg';

    if (type === 'seatbelt') {
      sampleUrl = 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=900&auto=format&fit=crop&q=80';
      sampleName = 'expressway_sedan.jpg';
    } else if (type === 'redlight') {
      sampleUrl = 'https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?w=900&auto=format&fit=crop&q=80';
      sampleName = 'signal_junction_cam02.jpg';
    }

    setPreviewUrl(sampleUrl);
    setFileInfo({ name: sampleName, size: '2.5 MB', type: 'image/jpeg', uploadTime: new Date().toLocaleTimeString() });

    setProcessing(true);
    setAnalyzed(false);
    setDetectionError(null);

    try {
      let sampleFile = null;
      try {
        const imgFetch = await fetch(sampleUrl);
        const imgBlob = await imgFetch.blob();
        sampleFile = new File([imgBlob], sampleName, { type: 'image/jpeg' });
      } catch (blobErr) {
        console.warn('Browser direct fetch blocked by CORS, passing URL to backend AI vision:', blobErr.message);
      }

      if (sampleFile) {
        await runAiAnalysisWithFile(sampleFile);
      } else {
        // Send image URL directly to backend AI Vision detector (bypasses browser CORS)
        const res = await aiDetectionService.detectFrame({
          imageUrl: sampleUrl,
          image: sampleUrl,
          filename: sampleName,
          location: user?.assignedArea || 'Junction Corridor',
          officerId: user?.id,
        });

        if (res?.success && res.data) {
          const d = res.data;
          setDetectionResult(d);
          if (d.vehicleNumber && d.vehicleNumber !== 'UNREADABLE' && d.vehicleNumber !== 'UNKNOWN') {
            setManualPlateInput(d.vehicleNumber);
            setIsEditingPlate(false);
          } else {
            setManualPlateInput('');
            setIsEditingPlate(true);
          }
          if (d.hasViolation === false || !d.violationType || d.violationType.toLowerCase().includes('compliant') || d.violationType.toLowerCase().includes('no violation')) {
            setSelectedViolationType('Compliant (No Violation)');
          } else {
            const matched = findRuleByName(d.violationType);
            setSelectedViolationType(matched ? matched.name : d.violationType);
          }
          if (d.evidenceUrl) {
            setPreviewUrl(d.evidenceUrl);
          }
        }
      }
    } catch (err) {
      console.error('Error analyzing sample image:', err);
      setDetectionError(err.message || 'Error processing sample image');
    } finally {
      setProcessing(false);
      setAnalyzed(true);
    }
  };

  const extractFrameFromVideo = (videoFile) => {
    return new Promise((resolve) => {
      const video = document.createElement('video');
      video.preload = 'auto';
      video.muted = true;
      video.playsInline = true;
      const objectUrl = URL.createObjectURL(videoFile);
      video.src = objectUrl;

      const cleanup = () => {
        URL.revokeObjectURL(objectUrl);
        video.remove();
      };

      video.onloadeddata = () => {
        video.currentTime = Math.min(1.0, video.duration > 0 ? video.duration * 0.15 : 0.5);
      };

      video.onseeked = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = video.videoWidth || 1280;
          canvas.height = video.videoHeight || 720;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          canvas.toBlob((blob) => {
            cleanup();
            if (blob) {
              const frameFile = new File([blob], `${videoFile.name.replace(/\.[^/.]+$/, '')}_keyframe.jpg`, {
                type: 'image/jpeg',
              });
              resolve(frameFile);
            } else {
              resolve(videoFile);
            }
          }, 'image/jpeg', 0.90);
        } catch {
          cleanup();
          resolve(videoFile);
        }
      };

      video.onerror = () => {
        cleanup();
        resolve(videoFile);
      };
    });
  };

  const handleFileUpload = async (e) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setDetectionError(null);
    const url = URL.createObjectURL(selectedFile);
    setPreviewUrl(url);
    setFileInfo({
      name: selectedFile.name,
      size: `${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB`,
      type: selectedFile.type,
      uploadTime: new Date().toLocaleTimeString(),
    });

    // If it's a video file, extract a clean keyframe snapshot for AI analysis
    let fileToAnalyze = selectedFile;
    const isVideo = selectedFile.type?.startsWith('video/') || /\.(mp4|avi|mov|mkv|webm)$/i.test(selectedFile.name);
    if (isVideo) {
      try {
        fileToAnalyze = await extractFrameFromVideo(selectedFile);
      } catch (err) {
        console.warn('Video frame capture notice:', err);
        fileToAnalyze = selectedFile;
      }
    }

    // Run backend AI Vision upload & detect
    await runAiAnalysisWithFile(fileToAnalyze);
  };

  const runAiAnalysisWithFile = async (uploadedFile) => {
    setProcessing(true);
    setAnalyzed(false);
    setDetectionError(null);

    try {
      let res;
      try {
        res = await aiDetectionService.uploadAndDetect(uploadedFile, {
          location: user?.assignedArea || 'Field Upload Station',
          officerId: user?.id,
        });
      } catch (uploadErr) {
        console.warn('Direct multipart upload notice, attempting canvas/Base64 conversion:', uploadErr.message);
        let base64Data = null;
        try {
          const img = new Image();
          const objectUrl = URL.createObjectURL(uploadedFile);
          img.src = objectUrl;
          await new Promise((resolve) => {
            img.onload = resolve;
            img.onerror = resolve;
          });
          if (img.width && img.height) {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            base64Data = canvas.toDataURL('image/jpeg', 0.92);
          }
          URL.revokeObjectURL(objectUrl);
        } catch (_) {}

        if (!base64Data) {
          base64Data = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(uploadedFile);
          });
        }

        res = await aiDetectionService.detectFrame({
          image: base64Data,
          filename: uploadedFile.name ? uploadedFile.name.replace(/\.[^/.]+$/, '') + '.jpg' : 'upload.jpg',
          location: user?.assignedArea || 'Field Upload Station',
          officerId: user?.id,
        });
      }

      if (res?.success && res.data) {
        const d = res.data;
        setDetectionResult(d);
        if (d.vehicleNumber && d.vehicleNumber !== 'UNREADABLE' && d.vehicleNumber !== 'UNKNOWN') {
          setManualPlateInput(d.vehicleNumber);
          setIsEditingPlate(false);
        } else {
          setManualPlateInput('');
          setIsEditingPlate(true);
        }
        if (d.hasViolation === false || !d.violationType || d.violationType.toLowerCase().includes('compliant') || d.violationType.toLowerCase().includes('no violation')) {
          setSelectedViolationType('Compliant (No Violation)');
        } else {
          // Normalize to match available statutory rule list
          const matched = findRuleByName(d.violationType);
          setSelectedViolationType(matched ? matched.name : d.violationType);
        }
        if (d.evidenceUrl) {
          setPreviewUrl(d.evidenceUrl);
        }
      } else {
        throw new Error(res?.error || 'Detection engine returned no valid analysis');
      }
    } catch (err) {
      console.warn('Backend Vision API call notice:', err.message);
      setDetectionError(err.message || 'AI Vision Engine was unable to analyze this file. Please check server connection.');
    } finally {
      setProcessing(false);
      setAnalyzed(true);
    }
  };

  // Robust matching helper to associate AI classification with statutory database rules
  const findRuleByName = (type) => {
    if (!type) return null;
    const lower = type.toLowerCase().trim();
    if (lower.includes('compliant') || lower.includes('no violation')) {
      return {
        id: 'VR-COMPLIANT',
        name: 'Compliant (No Violation)',
        fine: 0,
        severity: 'NONE',
        ruleSection: 'N/A - Compliant',
        description: 'Vehicle is adhering to traffic regulations. No violation detected.'
      };
    }
    if (!violationRules || violationRules.length === 0) return null;
    
    // 1. Exact match
    const exact = violationRules.find((r) => r.name.toLowerCase() === lower);
    if (exact) return exact;
    
    // 2. Substring match
    const sub = violationRules.find((r) => r.name.toLowerCase().includes(lower) || lower.includes(r.name.toLowerCase()));
    if (sub) return sub;

    // 3. Heuristic domain keyword matching
    if (lower.includes('helmet')) return violationRules.find((r) => r.name.toLowerCase().includes('helmet'));
    if (lower.includes('seat') || lower.includes('belt')) return violationRules.find((r) => r.name.toLowerCase().includes('seat'));
    if (lower.includes('triple') || lower.includes('three') || lower.includes('pillion')) return violationRules.find((r) => r.name.toLowerCase().includes('triple'));
    if (lower.includes('red') || lower.includes('signal') || lower.includes('light')) return violationRules.find((r) => r.name.toLowerCase().includes('red'));
    if (lower.includes('phone') || lower.includes('mobile') || lower.includes('text')) return violationRules.find((r) => r.name.toLowerCase().includes('phone') || r.name.toLowerCase().includes('mobile'));
    if (lower.includes('direction') || lower.includes('wrong') || lower.includes('lane') || lower.includes('opposite')) return violationRules.find((r) => r.name.toLowerCase().includes('direction') || r.name.toLowerCase().includes('wrong'));
    if (lower.includes('park')) return violationRules.find((r) => r.name.toLowerCase().includes('park'));
    if (lower.includes('stop') || lower.includes('zebra')) return violationRules.find((r) => r.name.toLowerCase().includes('stop'));
    if (lower.includes('speed')) return violationRules.find((r) => r.name.toLowerCase().includes('speed'));
    if (lower.includes('danger') || lower.includes('reckless')) return violationRules.find((r) => r.name.toLowerCase().includes('danger'));

    return null;
  };

  const isCompliant = (!detectionResult?.hasViolation && detectionResult !== null) || selectedViolationType === 'Compliant (No Violation)' || selectedViolationType?.toLowerCase().includes('compliant');

  // Intelligent vehicle rule filtering (prevents helmet rules from showing on cars)
  const isFourWheeler = /car|automobile|suv|bus|truck|sedan|hatchback|van|lorry/i.test(detectionResult?.vehicleType || '');
  const filteredRules = isFourWheeler
    ? (violationRules || []).filter((r) => !/helmet|triple riding|pillion/i.test(r.name))
    : (violationRules || []);

  // Find matching rule for statutory fine calculation
  const currentRule = findRuleByName(selectedViolationType) || {
    fine: isCompliant ? 0 : (detectionResult?.fineAmount !== undefined ? detectionResult.fineAmount : 1000),
    ruleSection: isCompliant ? 'N/A - Compliant' : (detectionResult?.ruleSection || 'Section 177 Motor Vehicles Act'),
    severity: isCompliant ? 'NONE' : 'HIGH',
    description: isCompliant ? 'Vehicle is adhering to traffic regulations' : 'Traffic statutory infraction',
  };

  const handleVerifyAndGenerateFine = (status = 'Fine Generated') => {
    const tsSuffix = Date.now().toString().slice(-6);
    const randSuffix = Math.floor(100 + Math.random() * 900);
    const caseId = `VIO-2026-${tsSuffix}-${randSuffix}`;
    const challanNo = `CH-2026-${tsSuffix}-${randSuffix}`;
    const finalPlate = manualPlateInput.trim().toUpperCase() || detectionResult?.vehicleNumber || 'UNREADABLE';

    const isCompliantRecord = isCompliant || currentRule.fine === 0;
    const finalViolationType = isCompliantRecord ? 'Compliant (No Violation)' : (selectedViolationType || detectionResult?.violationType || 'Compliant (No Violation)');
    const finalStatus = isCompliantRecord ? 'Verified' : status;
    const finalPaymentStatus = isCompliantRecord ? 'Paid' : 'Pending';
    const finalFine = isCompliantRecord ? 0 : currentRule.fine;

    const newRecord = {
      id: caseId,
      challanNo: challanNo,
      vehicleType: detectionResult?.vehicleType || 'Motorcycle',
      vehicleNumber: finalPlate,
      violationType: finalViolationType,
      ruleSection: currentRule.ruleSection,
      fineAmount: finalFine,
      confidence: detectionResult?.confidence || 0.95,
      time: new Date().toLocaleTimeString(),
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      location: user?.assignedArea || 'Metropolitan Traffic Corridor',
      officerName: user?.name || 'Enforcement Officer',
      officerBadge: user?.badge || 'TP-0000',
      detectionMethod:
        activeTab === 'image'
          ? 'Uploaded Image'
          : activeTab === 'video'
          ? 'Uploaded Video'
          : 'Live Camera Capture',
      evidenceUrl: previewUrl || '/storage/evidence/violation_sample.jpg',
      status: finalStatus,
      forensics: detectionResult?.forensics || (isCompliantRecord ? `AI visual inspection verified vehicle ${detectionResult?.vehicleType || 'Vehicle'} (Plate: ${finalPlate}) is adhering to traffic regulations.` : `AI object detection confirmed ${selectedViolationType}. Verified by field officer.`),
      boxes: detectionResult?.boxes,
      bounding_boxes_json: detectionResult?.boxes ? JSON.stringify(detectionResult.boxes) : null,
      paymentStatus: finalPaymentStatus,
    };

    addViolation(newRecord);
    setActionSuccess({
      message:
        isCompliantRecord
          ? `Vehicle marked compliant & logged into case registry!`
          : status === 'Fine Generated'
          ? `e-Challan #${challanNo} generated successfully!`
          : `Violation verified and saved into case registry!`,
      caseId: caseId,
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
            Traffic Evidence Capture & AI Analysis
          </h1>
          <p style={{ fontSize: '0.8rem', color: '#64748B', margin: '0.2rem 0 0 0' }}>
            Multi-modal evidence intake: Image, Video, or Continuous Live Camera AI Detection
          </p>
        </div>

        {/* Three Evidence Source Tabs */}
        <div
          style={{
            display: 'flex',
            backgroundColor: '#FFFFFF',
            border: '1px solid #CBD5E1',
            borderRadius: '10px',
            padding: '0.3rem',
            gap: '0.3rem',
          }}
        >
          <button
            onClick={() => handleTabChange('image')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.5rem 1rem',
              borderRadius: '7px',
              border: 'none',
              backgroundColor: activeTab === 'image' ? '#2563EB' : 'transparent',
              color: activeTab === 'image' ? '#FFFFFF' : '#64748B',
              fontWeight: 700,
              fontSize: '0.82rem',
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
          >
            <Camera size={16} />
            <span>Upload Image</span>
          </button>

          <button
            onClick={() => handleTabChange('video')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.5rem 1rem',
              borderRadius: '7px',
              border: 'none',
              backgroundColor: activeTab === 'video' ? '#2563EB' : 'transparent',
              color: activeTab === 'video' ? '#FFFFFF' : '#64748B',
              fontWeight: 700,
              fontSize: '0.82rem',
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
          >
            <UploadCloud size={16} />
            <span>Upload Video</span>
          </button>

          <button
            onClick={() => handleTabChange('camera')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.5rem 1rem',
              borderRadius: '7px',
              border: 'none',
              backgroundColor: activeTab === 'camera' ? '#2563EB' : 'transparent',
              color: activeTab === 'camera' ? '#FFFFFF' : '#64748B',
              fontWeight: 700,
              fontSize: '0.82rem',
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
          >
            <Video size={16} />
            <span>Live Camera</span>
          </button>

          <button
            onClick={() => handleTabChange('manual')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.5rem 1rem',
              borderRadius: '7px',
              border: 'none',
              backgroundColor: activeTab === 'manual' ? '#2563EB' : 'transparent',
              color: activeTab === 'manual' ? '#FFFFFF' : '#64748B',
              fontWeight: 700,
              fontSize: '0.82rem',
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
          >
            <PlusCircle size={16} />
            <span>Manual Entry</span>
          </button>
        </div>
      </div>

      {/* Action Success Modal/Alert */}
      {actionSuccess && (
        <div
          style={{
            padding: '1.25rem',
            borderRadius: '12px',
            backgroundColor: '#F0FDF4',
            border: '1px solid #BBF7D0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 4px 12px rgba(22, 163, 74, 0.1)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ padding: '0.5rem', backgroundColor: '#DCFCE7', borderRadius: '50%', color: '#16A34A' }}>
              <CheckCircle2 size={24} />
            </div>
            <div>
              <div style={{ fontWeight: 800, color: '#15803D', fontSize: '0.95rem' }}>
                {actionSuccess.message}
              </div>
              <div style={{ fontSize: '0.78rem', color: '#166534', marginTop: '0.1rem' }}>
                Case Record ID: <strong>{actionSuccess.caseId}</strong> registered under officer badge {user?.badge || 'Enforcement Officer'}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={() => navigate(`/police/violations/${actionSuccess.caseId}`)}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#16A34A',
                color: '#FFFFFF',
                borderRadius: '8px',
                border: 'none',
                fontWeight: 700,
                fontSize: '0.8rem',
                cursor: 'pointer',
              }}
            >
              View Case / Challan →
            </button>
            <button
              onClick={resetForm}
              style={{
                padding: '0.5rem 0.85rem',
                backgroundColor: '#FFFFFF',
                color: '#334155',
                borderRadius: '8px',
                border: '1px solid #CBD5E1',
                fontWeight: 600,
                fontSize: '0.8rem',
                cursor: 'pointer',
              }}
            >
              Capture Another
            </button>
          </div>
        </div>
      )}

      {/* Tab 4: Manual Violation Entry Form */}
      {activeTab === 'manual' && (
        <form onSubmit={handleManualSubmit} style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.3fr) minmax(0, 1fr)', gap: '1.5rem' }}>
          {/* Left Column: Form Details */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '12px',
              border: '1px solid #E2E8F0',
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.25rem',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #F1F5F9', paddingBottom: '0.85rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <div style={{ padding: '0.45rem', backgroundColor: '#EFF6FF', borderRadius: '8px', color: '#2563EB' }}>
                  <PlusCircle size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                    Manual Traffic Violation Form
                  </h3>
                  <p style={{ fontSize: '0.75rem', color: '#64748B', margin: '0.15rem 0 0 0' }}>
                    Officer on-site physical observation or citizen report registration
                  </p>
                </div>
              </div>
              <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '0.25rem 0.65rem', borderRadius: '20px', backgroundColor: '#F1F5F9', color: '#475569' }}>
                DIRECT POLICE DISPATCH
              </span>
            </div>

            {/* Row 1: Vehicle Plate & Vehicle Category */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                  Vehicle Plate Number *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Enter vehicle plate number (e.g. KA05MN4821)"
                  value={manualForm.vehicleNumber}
                  onChange={(e) => setManualForm((prev) => ({ ...prev, vehicleNumber: e.target.value.toUpperCase().replace(/\s+/g, '') }))}
                  style={{
                    width: '100%',
                    padding: '0.55rem 0.75rem',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    fontFamily: 'monospace',
                    letterSpacing: '0.05em',
                    outline: 'none',
                    backgroundColor: '#F8FAFC',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                  Vehicle Class / Category *
                </label>
                <select
                  required
                  value={manualForm.vehicleType}
                  onChange={(e) => setManualForm((prev) => ({ ...prev, vehicleType: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '0.55rem 0.75rem',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    outline: 'none',
                    backgroundColor: '#FFFFFF',
                  }}
                >
                  <option value="">-- Select Vehicle Class / Category --</option>
                  <option value="Motorcycle">Two-Wheeler (Motorcycle / Scooter)</option>
                  <option value="Car (Sedan)">Car (Sedan / Hatchback)</option>
                  <option value="Car (SUV)">Four-Wheeler (SUV / MUV)</option>
                  <option value="Auto-Rickshaw">Three-Wheeler (Auto-Rickshaw)</option>
                  <option value="Bus">Public / Private Bus</option>
                  <option value="Heavy Commercial Vehicle">Heavy Commercial / Truck</option>
                </select>
              </div>
            </div>

            {/* Row 2: Violation Rule Selection */}
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                Traffic Violation Offence (Select from Department Rules) *
              </label>
              <select
                required
                value={manualForm.violationType}
                onChange={(e) => handleManualRuleChange(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.55rem 0.75rem',
                  borderRadius: '8px',
                  border: '1px solid #CBD5E1',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  color: manualForm.violationType ? '#0F172A' : '#64748B',
                  outline: 'none',
                  backgroundColor: '#EFF6FF',
                }}
              >
                <option value="">-- Select Traffic Violation Offence --</option>
                {violationRules?.map((rule) => (
                  <option key={rule.id} value={rule.name}>
                    {rule.name} — ₹{rule.fine} ({rule.severity})
                  </option>
                ))}
              </select>
            </div>

            {/* Row 3: Statutory Legal Section & Fine Amount */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                  Motor Vehicles Act Section (Auto-Filled)
                </label>
                <input
                  type="text"
                  placeholder="Auto-filled based on selected rule"
                  value={manualForm.ruleSection}
                  onChange={(e) => setManualForm((prev) => ({ ...prev, ruleSection: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '0.55rem 0.75rem',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    outline: 'none',
                    backgroundColor: '#F8FAFC',
                    color: '#475569',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                  Statutory Fine (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  step="100"
                  placeholder="Auto-calculated fine"
                  value={manualForm.fineAmount}
                  onChange={(e) => setManualForm((prev) => ({ ...prev, fineAmount: e.target.value === '' ? '' : Number(e.target.value) }))}
                  style={{
                    width: '100%',
                    padding: '0.55rem 0.75rem',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    fontSize: '0.85rem',
                    fontWeight: 800,
                    color: '#16A34A',
                    outline: 'none',
                    backgroundColor: '#F8FAFC',
                  }}
                />
              </div>
            </div>

            {/* Row 4: Location & Status */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                  Offence Location / Sector
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    list="manual-sector-datalist"
                    placeholder="Enter corridor or select surveillance sector..."
                    value={manualForm.location}
                    onChange={(e) => setManualForm((prev) => ({ ...prev, location: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '0.55rem 0.75rem',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      fontSize: '0.82rem',
                      outline: 'none',
                    }}
                  />
                  <datalist id="manual-sector-datalist">
                    {user?.assignedArea && <option value={user.assignedArea}>{user.assignedArea} (Assigned Jurisdiction)</option>}
                    {sectors?.map((sec) => (
                      <option key={sec.id} value={`${sec.id} - ${sec.name || sec.corridor}`}>
                        {sec.name} ({sec.corridor})
                      </option>
                    ))}
                  </datalist>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                  Enforcement Status
                </label>
                <select
                  value={manualForm.status}
                  onChange={(e) => setManualForm((prev) => ({ ...prev, status: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '0.55rem 0.75rem',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    outline: 'none',
                  }}
                >
                  <option value="Verified">Verified (Immediate Enforcement)</option>
                  <option value="Fine Generated">Fine Generated</option>
                  <option value="Pending Verification">Pending Verification</option>
                </select>
              </div>
            </div>

            {/* Row 5: Officer Forensics / Description */}
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                Officer Observations & Description
              </label>
              <textarea
                rows={3}
                value={manualForm.forensics}
                onChange={(e) => setManualForm((prev) => ({ ...prev, forensics: e.target.value }))}
                placeholder="Enter detailed description of observed infraction..."
                style={{
                  width: '100%',
                  padding: '0.55rem 0.75rem',
                  borderRadius: '8px',
                  border: '1px solid #CBD5E1',
                  fontSize: '0.82rem',
                  outline: 'none',
                  resize: 'vertical',
                }}
              />
            </div>
          </div>

          {/* Right Column: Live Digital e-Challan Preview & Photo Attachment */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1.25rem',
            }}
          >
            {/* Evidence Image Upload / Thumbnail */}
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '12px',
                border: '1px solid #E2E8F0',
                padding: '1.25rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Image size={16} color="#2563EB" /> Photographic Evidence Attachment
                </span>
                <span style={{ fontSize: '0.7rem', color: '#64748B' }}>Optional</span>
              </div>

              {manualPhotoPreview ? (
                <div style={{ position: 'relative', width: '100%', height: '160px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #E2E8F0' }}>
                  <img src={manualPhotoPreview} alt="Evidence Preview" style={{ width: '100%', height: '160px', objectFit: 'cover' }} />
                  <div style={{ position: 'absolute', bottom: '8px', right: '8px', display: 'flex', gap: '0.35rem' }}>
                    <label
                      style={{
                        padding: '0.3rem 0.65rem',
                        backgroundColor: 'rgba(15, 23, 42, 0.85)',
                        color: '#FFFFFF',
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        borderRadius: '6px',
                        cursor: 'pointer',
                      }}
                    >
                      Change Photo
                      <input type="file" accept="image/*" onChange={handleManualImageUpload} style={{ display: 'none' }} />
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setManualPhotoPreview(null);
                        setManualForm((p) => ({ ...p, evidenceUrl: '' }));
                      }}
                      style={{
                        padding: '0.3rem 0.65rem',
                        backgroundColor: 'rgba(220, 38, 38, 0.85)',
                        color: '#FFFFFF',
                        border: 'none',
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        borderRadius: '6px',
                        cursor: 'pointer',
                      }}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
                <label
                  style={{
                    border: '2px dashed #CBD5E1',
                    borderRadius: '8px',
                    padding: '1.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    backgroundColor: '#F8FAFC',
                    gap: '0.5rem',
                  }}
                >
                  <UploadCloud size={24} color="#64748B" />
                  <span style={{ fontSize: '0.78rem', color: '#475569', fontWeight: 600 }}>Click to attach evidence photo</span>
                  <input type="file" accept="image/*" onChange={handleManualImageUpload} style={{ display: 'none' }} />
                </label>
              )}

            </div>

            {/* Live Digital e-Challan Preview Card */}
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '12px',
                border: '1px solid #CBD5E1',
                padding: '1.25rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.85rem',
                boxShadow: '0 4px 12px rgba(15, 23, 42, 0.06)',
                background: 'linear-gradient(180deg, #FFFFFF 0%, #F8FAFC 100%)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px dashed #CBD5E1', paddingBottom: '0.65rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Shield size={16} color="#0F172A" />
                  <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#0F172A' }}>DIGITAL E-CHALLAN PREVIEW</span>
                </div>
                <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#16A34A', backgroundColor: '#DCFCE7', padding: '0.15rem 0.5rem', borderRadius: '4px' }}>
                  OFFICIAL
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', color: '#64748B' }}>Target Vehicle:</span>
                {manualForm.vehicleNumber.trim() ? (
                  <PlateBadge plate={manualForm.vehicleNumber} />
                ) : (
                  <span style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: 700, fontStyle: 'italic', padding: '0.2rem 0.5rem', backgroundColor: '#F1F5F9', borderRadius: '4px' }}>
                    Awaiting Plate Input
                  </span>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', color: '#64748B' }}>Offence:</span>
                <span style={{ fontSize: '0.8rem', fontWeight: 800, color: manualForm.violationType ? '#DC2626' : '#94A3B8' }}>
                  {manualForm.violationType || 'Awaiting Offence Selection'}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', color: '#64748B' }}>Law Section:</span>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: manualForm.ruleSection ? '#334155' : '#94A3B8' }}>
                  {manualForm.ruleSection || 'Awaiting Section'}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px dashed #CBD5E1', paddingTop: '0.65rem' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0F172A' }}>Fine Payable:</span>
                <span style={{ fontSize: '1.25rem', fontWeight: 900, color: '#16A34A' }}>
                  ₹{(Number(manualForm.fineAmount) || 0).toLocaleString()}
                </span>
              </div>

              <div style={{ fontSize: '0.72rem', color: '#94A3B8', display: 'flex', justifyContent: 'space-between', marginTop: '0.2rem' }}>
                <span>Officer: {user?.name || 'Enforcement Officer'}</span>
                <span>Badge: {user?.badge || 'TP-Officer'}</span>
              </div>

              {/* Action Buttons */}
              <button
                type="submit"
                disabled={manualSubmitting}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem',
                  backgroundColor: '#2563EB',
                  color: '#FFFFFF',
                  borderRadius: '8px',
                  border: 'none',
                  fontWeight: 800,
                  fontSize: '0.88rem',
                  cursor: manualSubmitting ? 'not-allowed' : 'pointer',
                  boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)',
                  marginTop: '0.5rem',
                  transition: 'background-color 0.2s',
                }}
              >
                <Receipt size={18} />
                <span>{manualSubmitting ? 'Issuing e-Challan...' : 'Issue & Persist Official e-Challan'}</span>
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Tab 3: Live Camera Screen */}
      {activeTab === 'camera' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <LiveCameraDetector
            onViolationDetected={(viol) => {
              // Automatically triggers de-duplicated violation creation
            }}
          />
        </div>
      )}

      {/* Tab 1 & 2: Image & Video Upload and AI Inspection */}
      {(activeTab === 'image' || activeTab === 'video') && (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.4fr) minmax(0, 1fr)', gap: '1.5rem' }}>
          {/* Left Column: Evidence Upload & Visual Bounding Box Canvas */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '12px',
              border: '1px solid #E2E8F0',
              padding: '1.25rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Layers size={18} color="#2563EB" />
                <span>Evidence Visual Canvas</span>
              </div>
              {analyzed && (
                <button
                  onClick={() => setActiveOverlay(!activeOverlay)}
                  style={{
                    fontSize: '0.75rem',
                    padding: '0.3rem 0.65rem',
                    borderRadius: '6px',
                    border: '1px solid #CBD5E1',
                    backgroundColor: activeOverlay ? '#EFF6FF' : '#F8FAFC',
                    color: activeOverlay ? '#2563EB' : '#64748B',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  {activeOverlay ? 'AI Overlays ON' : 'AI Overlays OFF'}
                </button>
              )}
            </div>

            {/* Upload Area / Canvas Preview */}
            {!previewUrl ? (
              <div
                style={{
                  border: '2px dashed #CBD5E1',
                  borderRadius: '10px',
                  padding: '3rem 2rem',
                  textAlign: 'center',
                  backgroundColor: '#F8FAFC',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '1rem',
                }}
              >
                <div
                  style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '50%',
                    backgroundColor: '#EFF6FF',
                    color: '#2563EB',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {activeTab === 'image' ? <Camera size={28} /> : <UploadCloud size={28} />}
                </div>
                <div>
                  <div style={{ fontWeight: 700, color: '#0F172A', fontSize: '0.95rem' }}>
                    Select or drag {activeTab === 'image' ? 'evidence photos (JPG, PNG, WEBP)' : 'traffic video (MP4, AVI, MOV, MKV)'}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '0.2rem' }}>
                    YOLO object & license plate recognition will run automatically upon upload.
                  </div>
                </div>

                <label
                  style={{
                    padding: '0.65rem 1.25rem',
                    borderRadius: '8px',
                    backgroundColor: '#2563EB',
                    color: '#FFFFFF',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(37, 99, 235, 0.25)',
                  }}
                >
                  Browse File
                  <input
                    type="file"
                    accept={activeTab === 'image' ? 'image/*' : 'video/*'}
                    onChange={handleFileUpload}
                    style={{ display: 'none' }}
                  />
                </label>

                {/* Pre-loaded Sample Shortcuts */}
                <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #E2E8F0', width: '100%' }}>
                  <div style={{ fontSize: '0.72rem', color: '#64748B', marginBottom: '0.5rem', fontWeight: 600 }}>
                    OR LOAD VERIFIED TEST INCIDENT EVIDENCE:
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      onClick={() => handleLoadSample('helmet')}
                      style={{
                        padding: '0.35rem 0.65rem',
                        borderRadius: '6px',
                        border: '1px solid #BFDBFE',
                        backgroundColor: '#EFF6FF',
                        color: '#1D4ED8',
                        fontSize: '0.74rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      Sample 1: No Helmet Two-Wheeler
                    </button>
                    <button
                      type="button"
                      onClick={() => handleLoadSample('seatbelt')}
                      style={{
                        padding: '0.35rem 0.65rem',
                        borderRadius: '6px',
                        border: '1px solid #BFDBFE',
                        backgroundColor: '#EFF6FF',
                        color: '#1D4ED8',
                        fontSize: '0.74rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      Sample 2: Unfastened Seat Belt Car
                    </button>
                    <button
                      type="button"
                      onClick={() => handleLoadSample('redlight')}
                      style={{
                        padding: '0.35rem 0.65rem',
                        borderRadius: '6px',
                        border: '1px solid #BFDBFE',
                        backgroundColor: '#EFF6FF',
                        color: '#1D4ED8',
                        fontSize: '0.74rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      Sample 3: Red Light Signal Video
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {/* Visual Viewport */}
                <div
                  style={{
                    position: 'relative',
                    width: '100%',
                    height: '380px',
                    backgroundColor: '#0F172A',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {file?.type?.startsWith('video/') || (fileInfo?.type && fileInfo.type.startsWith('video/')) || (previewUrl && (previewUrl.endsWith('.mp4') || previewUrl.includes('blob:'))) && activeTab === 'video' ? (
                    <video
                      ref={videoRef}
                      src={previewUrl}
                      controls
                      autoPlay
                      loop
                      muted
                      style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                    />
                  ) : (
                    <img
                      src={previewUrl}
                      alt="Evidence Preview"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  )}

                  {/* Processing Overlay Animation */}
                  {processing && (
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        backgroundColor: 'rgba(15, 23, 42, 0.75)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#FFFFFF',
                        gap: '0.75rem',
                      }}
                    >
                      <div
                        style={{
                          width: '40px',
                          height: '40px',
                          border: '3px solid rgba(255,255,255,0.3)',
                          borderTopColor: '#3B82F6',
                          borderRadius: '50%',
                          animation: 'spin 1s linear infinite',
                        }}
                      />
                      <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>
                        Running YOLO Object & Plate AI Forensics...
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
                        Scanning vehicle geometry, rider safety equipment, and optical number plate
                      </div>
                    </div>
                  )}

                  {/* AI Bounding Boxes Overlay */}
                  {analyzed && activeOverlay && detectionResult?.boxes && (
                    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
                      {/* Vehicle Box */}
                      {detectionResult.boxes.vehicle && typeof detectionResult.boxes.vehicle.x === 'number' && (
                        <div
                          style={{
                            position: 'absolute',
                            left: `${detectionResult.boxes.vehicle.x}%`,
                            top: `${detectionResult.boxes.vehicle.y}%`,
                            width: `${detectionResult.boxes.vehicle.w}%`,
                            height: `${detectionResult.boxes.vehicle.h}%`,
                            border: '2px solid #3B82F6',
                            backgroundColor: 'rgba(59, 130, 246, 0.1)',
                            boxSizing: 'border-box',
                          }}
                        >
                          <span
                            style={{
                              position: 'absolute',
                              top: '-20px',
                              left: '0',
                              backgroundColor: '#3B82F6',
                              color: '#FFFFFF',
                              fontSize: '10px',
                              fontWeight: 700,
                              padding: '2px 6px',
                              borderRadius: '3px',
                            }}
                          >
                            {detectionResult.boxes.vehicle.label || 'Vehicle'}
                          </span>
                        </div>
                      )}

                      {/* Violation Area Box - only shown when there is an actual infraction */}
                      {detectionResult.hasViolation && detectionResult.boxes?.violation && typeof detectionResult.boxes.violation.x === 'number' && (
                        <div
                          style={{
                            position: 'absolute',
                            left: `${detectionResult.boxes.violation.x}%`,
                            top: `${detectionResult.boxes.violation.y}%`,
                            width: `${detectionResult.boxes.violation.w}%`,
                            height: `${detectionResult.boxes.violation.h}%`,
                            border: '2px solid #DC2626',
                            backgroundColor: 'rgba(220, 38, 38, 0.15)',
                            boxSizing: 'border-box',
                          }}
                        >
                          <span
                            style={{
                              position: 'absolute',
                              top: '-20px',
                              left: '0',
                              backgroundColor: '#DC2626',
                              color: '#FFFFFF',
                              fontSize: '10px',
                              fontWeight: 700,
                              padding: '2px 6px',
                              borderRadius: '3px',
                            }}
                          >
                            {detectionResult.boxes.violation.label || 'Violation'}
                          </span>
                        </div>
                      )}

                      {/* Plate Box */}
                      {detectionResult.boxes.plate && typeof detectionResult.boxes.plate.x === 'number' && (
                        <div
                          style={{
                            position: 'absolute',
                            left: `${detectionResult.boxes.plate.x}%`,
                            top: `${detectionResult.boxes.plate.y}%`,
                            width: `${detectionResult.boxes.plate.w}%`,
                            height: `${detectionResult.boxes.plate.h}%`,
                            border: '2px solid #16A34A',
                            backgroundColor: 'rgba(220, 38, 38, 0.15)',
                            boxSizing: 'border-box',
                          }}
                        >
                          <span
                            style={{
                              position: 'absolute',
                              top: '-20px',
                              left: '0',
                              backgroundColor: '#16A34A',
                              color: '#FFFFFF',
                              fontSize: '10px',
                              fontWeight: 700,
                              padding: '2px 6px',
                              borderRadius: '3px',
                            }}
                          >
                            {detectionResult.boxes.plate.label || 'Plate'}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Video Playback & Instant Frame Re-analysis Bar */}
                {activeTab === 'video' && previewUrl && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.6rem 0.85rem',
                      backgroundColor: '#0F172A',
                      borderRadius: '8px',
                      color: '#F8FAFC',
                      flexWrap: 'wrap',
                      gap: '0.5rem',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', color: '#94A3B8' }}>
                      <Video size={14} style={{ color: '#38BDF8' }} />
                      <span>Video playback active. Pause or scrub to any frame to analyze that specific instant.</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleAnalyzeCurrentVideoFrame}
                      disabled={processing}
                      style={{
                        padding: '0.4rem 0.85rem',
                        borderRadius: '6px',
                        backgroundColor: '#2563EB',
                        color: '#FFFFFF',
                        border: 'none',
                        fontWeight: 700,
                        fontSize: '0.78rem',
                        cursor: processing ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                      }}
                    >
                      <Camera size={13} />
                      <span>{processing ? 'Analyzing Frame...' : '📸 Analyze Current Frame'}</span>
                    </button>
                  </div>
                )}

                {/* Evidence Metadata bar */}
                {fileInfo && (
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      backgroundColor: '#F8FAFC',
                      padding: '0.65rem 0.85rem',
                      borderRadius: '8px',
                      fontSize: '0.75rem',
                      color: '#64748B',
                      border: '1px solid #E2E8F0',
                    }}
                  >
                    <div>
                      File: <strong>{fileInfo.name}</strong> ({fileInfo.size})
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        onClick={resetForm}
                        style={{
                          border: 'none',
                          background: 'transparent',
                          color: '#DC2626',
                          cursor: 'pointer',
                          fontWeight: 600,
                          fontSize: '0.75rem',
                        }}
                      >
                        Clear Evidence
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Column: Violation Details & Fine Rule Calculation */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '12px',
              border: '1px solid #E2E8F0',
              padding: '1.25rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.25rem',
            }}
          >
            <div>
              <div style={{ fontWeight: 800, fontSize: '1rem', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Sparkles size={18} color="#2563EB" />
                <span>AI Analysis & Fine Calculation</span>
              </div>
              <p style={{ fontSize: '0.75rem', color: '#64748B', margin: '0.2rem 0 0 0' }}>
                Configurable department statutory rates applied automatically
              </p>
            </div>

            {analyzed && detectionResult ? (
              <>
                {/* Detected Vehicle & Number Plate */}
                <div
                  style={{
                    backgroundColor: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                    borderRadius: '10px',
                    padding: '1rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>DETECTED VEHICLE</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontWeight: 700, color: '#0F172A', fontSize: '0.95rem' }}>
                      {detectionResult.vehicleType}
                    </div>
                    <PlateBadge plate={manualPlateInput.trim().toUpperCase() || detectionResult.vehicleNumber} size="md" />
                  </div>

                  {/* Manual Plate Entry & Override Panel */}
                  {(!detectionResult.vehicleNumber || detectionResult.vehicleNumber === 'UNREADABLE' || detectionResult.vehicleNumber === 'UNKNOWN' || isEditingPlate) ? (
                    <div
                      style={{
                        backgroundColor: '#FEF3C7',
                        border: '1px solid #FCD34D',
                        borderRadius: '8px',
                        padding: '0.65rem 0.75rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.4rem',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#92400E' }}>
                          ⚠️ Plate Unreadable / Not Detected — Manually Add Number:
                        </span>
                        {isEditingPlate && detectionResult.vehicleNumber && detectionResult.vehicleNumber !== 'UNREADABLE' && (
                          <button
                            type="button"
                            onClick={() => setIsEditingPlate(false)}
                            style={{ background: 'none', border: 'none', color: '#B45309', fontSize: '0.72rem', cursor: 'pointer', fontWeight: 700 }}
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <input
                          type="text"
                          placeholder="e.g. KA05MN4821 or MH02AB1234"
                          value={manualPlateInput}
                          onChange={(e) => setManualPlateInput(e.target.value.toUpperCase())}
                          style={{
                            flex: 1,
                            padding: '0.4rem 0.6rem',
                            borderRadius: '6px',
                            border: '1px solid #F59E0B',
                            fontSize: '0.82rem',
                            fontWeight: 800,
                            fontFamily: 'monospace',
                            letterSpacing: '0.05em',
                            backgroundColor: '#FFFFFF',
                            color: '#0F172A',
                            outline: 'none',
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (manualPlateInput.trim()) {
                              setDetectionResult((prev) => ({
                                ...prev,
                                vehicleNumber: manualPlateInput.trim().toUpperCase(),
                              }));
                              setIsEditingPlate(false);
                            }
                          }}
                          style={{
                            padding: '0.4rem 0.75rem',
                            backgroundColor: '#D97706',
                            color: '#FFFFFF',
                            border: 'none',
                            borderRadius: '6px',
                            fontWeight: 700,
                            fontSize: '0.75rem',
                            cursor: 'pointer',
                          }}
                        >
                          Set Number
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '-0.2rem' }}>
                      <button
                        type="button"
                        onClick={() => {
                          setManualPlateInput(detectionResult.vehicleNumber || '');
                          setIsEditingPlate(true);
                        }}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#2563EB',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          textDecoration: 'underline',
                        }}
                      >
                        ✏️ Change / Manually Add Vehicle Number
                      </button>
                    </div>
                  )}
                </div>

                {/* Compliance Notification Banner if no violation was observed */}
                {isCompliant && (
                  <div
                    style={{
                      padding: '0.65rem 0.85rem',
                      borderRadius: '8px',
                      backgroundColor: '#F0FDF4',
                      border: '1px solid #86EFAC',
                      color: '#15803D',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                    }}
                  >
                    <CheckCircle2 size={16} style={{ color: '#16A34A', flexShrink: 0 }} />
                    <span>Vehicle Compliant: Visual analysis verified no statutory traffic violation.</span>
                  </div>
                )}

                {/* Violation Classification Form */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155' }}>
                      VIOLATION CLASSIFICATION
                    </label>
                    {isFourWheeler && (
                      <span style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 600 }}>
                        Filtered for 4-Wheeler (Car / Light Vehicle)
                      </span>
                    )}
                  </div>
                  <select
                    value={selectedViolationType}
                    onChange={(e) => setSelectedViolationType(e.target.value)}
                    style={{
                      padding: '0.65rem',
                      borderRadius: '8px',
                      border: `1px solid ${isCompliant ? '#86EFAC' : '#CBD5E1'}`,
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      color: isCompliant ? '#15803D' : '#0F172A',
                      backgroundColor: isCompliant ? '#F0FDF4' : '#FFFFFF',
                      outline: 'none',
                    }}
                  >
                    <option value="Compliant (No Violation)">
                      ✅ Compliant (No Violation Detected) — ₹0 (NONE)
                    </option>
                    {filteredRules.map((r) => (
                      <option key={r.id} value={r.name}>
                        {r.name} — ₹{r.fine} ({r.severity})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Statutory Fine Assessment Box */}
                <div
                  style={{
                    backgroundColor: isCompliant ? '#F0FDF4' : '#EFF6FF',
                    border: `1px solid ${isCompliant ? '#BBF7D0' : '#BFDBFE'}`,
                    borderRadius: '10px',
                    padding: '1rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.75rem', color: isCompliant ? '#15803D' : '#1E40AF', fontWeight: 700 }}>
                      {isCompliant ? 'STATUTORY COMPLIANCE STATUS' : 'STATUTORY FINE ASSESSMENT'}
                    </span>
                    <span
                      style={{
                        padding: '0.15rem 0.5rem',
                        backgroundColor: isCompliant ? '#DCFCE7' : '#DBEAFE',
                        color: isCompliant ? '#15803D' : '#1D4ED8',
                        borderRadius: '999px',
                        fontSize: '0.7rem',
                        fontWeight: 700,
                      }}
                    >
                      {isCompliant ? 'COMPLIANT' : `${currentRule.severity} SEVERITY`}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#334155' }}>
                    Rule: <strong>{isCompliant ? 'Compliant with Motor Vehicles Act (No Infraction)' : currentRule.ruleSection}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: '0.25rem' }}>
                    <span style={{ fontSize: '0.82rem', color: isCompliant ? '#15803D' : '#1E40AF', fontWeight: 600 }}>
                      {isCompliant ? 'Applicable Statutory Fine:' : 'Applicable Fine Amount:'}
                    </span>
                    <span style={{ fontSize: '1.4rem', fontWeight: 900, color: isCompliant ? '#15803D' : '#1E3A8A' }}>
                      ₹{currentRule.fine?.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                {/* Officer & Jurisdiction Sign-off Tag */}
                <div
                  style={{
                    fontSize: '0.75rem',
                    color: '#64748B',
                    padding: '0.5rem',
                    borderLeft: `3px solid ${isCompliant ? '#16A34A' : '#2563EB'}`,
                    backgroundColor: '#F8FAFC',
                  }}
                >
                  <div>Enforcing Officer: <strong>{user?.name || 'Enforcement Officer'}</strong> ({user?.badge || 'TP-0000'})</div>
                  <div>Location: <strong>{user?.assignedArea || 'Patrol Sector'}</strong></div>
                </div>

                {/* Enforcement Action Buttons */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: 'auto' }}>
                  <button
                    onClick={() => handleVerifyAndGenerateFine(isCompliant ? 'Verified' : 'Fine Generated')}
                    style={{
                      padding: '0.75rem',
                      borderRadius: '8px',
                      backgroundColor: isCompliant ? '#16A34A' : '#2563EB',
                      color: '#FFFFFF',
                      border: 'none',
                      fontWeight: 700,
                      fontSize: '0.88rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      cursor: 'pointer',
                      boxShadow: isCompliant ? '0 2px 8px rgba(22, 163, 74, 0.25)' : '0 2px 8px rgba(37, 99, 235, 0.25)',
                    }}
                  >
                    {isCompliant ? <CheckCircle2 size={16} /> : <Receipt size={16} />}
                    <span>{isCompliant ? 'Log Compliant Vehicle (₹0)' : `Verify & Generate Digital Challan (₹${currentRule.fine})`}</span>
                  </button>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                    <button
                      onClick={() => handleVerifyAndGenerateFine('Verified')}
                      style={{
                        padding: '0.6rem',
                        borderRadius: '8px',
                        backgroundColor: '#F0FDF4',
                        border: '1px solid #BBF7D0',
                        color: '#15803D',
                        fontWeight: 700,
                        fontSize: '0.8rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.4rem',
                        cursor: 'pointer',
                      }}
                    >
                      <CheckCircle2 size={15} />
                      <span>Verify Case Only</span>
                    </button>

                    <button
                      onClick={resetForm}
                      style={{
                        padding: '0.6rem',
                        borderRadius: '8px',
                        backgroundColor: '#FEF2F2',
                        border: '1px solid #FECACA',
                        color: '#DC2626',
                        fontWeight: 700,
                        fontSize: '0.8rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.4rem',
                        cursor: 'pointer',
                      }}
                    >
                      <XCircle size={15} />
                      <span>Reject Evidence</span>
                    </button>
                  </div>
                </div>
              </>
            ) : processing ? (
              <div
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center',
                  color: '#2563EB',
                  padding: '3rem 1.5rem',
                  gap: '1rem',
                }}
              >
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    border: '3px solid #BFDBFE',
                    borderTopColor: '#2563EB',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                  }}
                />
                <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#0F172A' }}>
                  Running AI Vision & ANPR Analysis...
                </div>
                <div style={{ fontSize: '0.78rem', color: '#64748B', maxWidth: '300px', lineHeight: 1.4 }}>
                  Scanning visual evidence, classifying vehicle & riders, and extracting number plate.
                </div>
              </div>
            ) : detectionError ? (
              <div
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center',
                  padding: '2.5rem 1.5rem',
                  gap: '0.85rem',
                  backgroundColor: '#FEF2F2',
                  borderRadius: '10px',
                  border: '1px solid #FECACA',
                }}
              >
                <AlertTriangle size={36} color="#DC2626" />
                <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#991B1B' }}>
                  AI Analysis Notice
                </div>
                <div style={{ fontSize: '0.78rem', color: '#B91C1C', maxWidth: '320px', lineHeight: 1.4 }}>
                  {detectionError}
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                  {file && (
                    <button
                      type="button"
                      onClick={() => runAiAnalysisWithFile(file)}
                      style={{
                        padding: '0.5rem 1rem',
                        backgroundColor: '#DC2626',
                        color: '#FFFFFF',
                        borderRadius: '6px',
                        border: 'none',
                        fontWeight: 700,
                        fontSize: '0.78rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                      }}
                    >
                      <RotateCcw size={14} />
                      <span>Retry Analysis</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleTabChange('manual')}
                    style={{
                      padding: '0.5rem 0.85rem',
                      backgroundColor: '#FFFFFF',
                      color: '#475569',
                      borderRadius: '6px',
                      border: '1px solid #CBD5E1',
                      fontWeight: 600,
                      fontSize: '0.78rem',
                      cursor: 'pointer',
                    }}
                  >
                    Manual Entry →
                  </button>
                </div>
              </div>
            ) : (
              <div
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center',
                  color: '#94A3B8',
                  padding: '2rem',
                }}
              >
                <FileText size={36} style={{ marginBottom: '0.5rem', opacity: 0.5 }} />
                <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>Awaiting Evidence Intake</div>
                <div style={{ fontSize: '0.75rem', marginTop: '0.2rem' }}>
                  Upload photo/video or select sample to view AI object detection & fine generation
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
