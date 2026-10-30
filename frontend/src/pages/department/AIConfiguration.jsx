import React, { useState, useEffect } from 'react';
import {
  Sliders,
  KeyRound,
  CheckCircle2,
  RefreshCw,
  Save,
  Cpu,
  ShieldCheck,
  AlertCircle,
  Eye,
  EyeOff
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { aiDetectionService } from '../../services/aiDetectionService';

export const DepartmentAIConfiguration = () => {
  const { aiConfig, saveAiConfig } = useApp();

  const [provider, setProvider] = useState(aiConfig.provider || 'Google Gemini Vision AI');
  const [apiKey, setApiKey] = useState(() => {
    const lk = localStorage.getItem('GEMINI_API_KEY') || '';
    if (lk && lk.length > 25 && !lk.toLowerCase().includes('demo') && !lk.includes('••••')) return lk;
    return aiConfig.apiKey || '';
  });
  const [showKey, setShowKey] = useState(false);
  const [model, setModel] = useState(aiConfig.model || 'gemini-2.5-flash');
  const [confidenceThreshold, setConfidenceThreshold] = useState(aiConfig.confidenceThreshold || 0.75);
  const [violationThreshold, setViolationThreshold] = useState(aiConfig.violationThreshold || 0.70);
  const [enabled, setEnabled] = useState(aiConfig.enabled ?? true);
  const [dedupCooldown, setDedupCooldown] = useState(aiConfig.dedupCooldownSeconds || 30);

  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Load latest configuration from backend
  useEffect(() => {
    (async () => {
      try {
        const res = await aiDetectionService.getConfiguration();
        if (res?.data) {
          const isGenuine = (k) => k && typeof k === 'string' && k.length > 25 && !k.toLowerCase().includes('demo') && !k.includes('••••');
          const backendKey = res.data.apiKey || '';
          const localKey = localStorage.getItem('GEMINI_API_KEY') || '';
          const resolvedKey = isGenuine(backendKey) ? backendKey : (isGenuine(localKey) ? localKey : backendKey);
          
          if (resolvedKey) {
            setApiKey(resolvedKey);
            if (isGenuine(resolvedKey)) {
              localStorage.setItem('GEMINI_API_KEY', resolvedKey);
            }
          }
          if (res.data.model) setModel(res.data.model);
          if (res.data.provider) setProvider(res.data.provider);
          if (res.data.confidenceThreshold !== undefined) setConfidenceThreshold(res.data.confidenceThreshold);
          if (res.data.violationThreshold !== undefined) setViolationThreshold(res.data.violationThreshold);
          if (res.data.enabled !== undefined) setEnabled(res.data.enabled);

          // Auto-test on load if key is configured
          if (resolvedKey) {
            try {
              const testRes = await aiDetectionService.testAiEngine({ apiKey: resolvedKey });
              if (testRes?.apiKeyValid) {
                setTestResult({
                  success: true,
                  status: testRes.status || 'Connected',
                  latency: testRes.latency_ms ? `${testRes.latency_ms}ms` : 'Ready',
                  message: `API Key verified and active (${testRes.activeModel || res.data.model || 'Gemini'}).`,
                });
              } else {
                setTestResult({
                  success: false,
                  status: testRes?.status || 'API Notice',
                  latency: testRes?.latency_ms ? `${testRes.latency_ms}ms` : '--',
                  message: testRes?.error || testRes?.message || 'Key validation returned notice.',
                });
              }
            } catch (tErr) {
              console.warn('Initial AI test:', tErr);
            }
          }
        }
      } catch (err) {
        console.warn('Failed to load AI config from server:', err);
      }
    })();
  }, []);

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const activeKey = apiKey.trim() || localStorage.getItem('GEMINI_API_KEY') || aiConfig.apiKey || '';
      const res = await aiDetectionService.testAiEngine({
        apiKey: activeKey || undefined,
      });

      if (res?.apiKeyValid) {
        setTestResult({
          success: true,
          status: res.status || 'Connected',
          latency: res.latency_ms ? `${res.latency_ms}ms` : 'Ready',
          message: `API Key verified and active (${res.activeModel || model}).`,
        });
      } else {
        setTestResult({
          success: false,
          status: res?.status || 'Connection Error',
          latency: res?.latency_ms ? `${res.latency_ms}ms` : '--',
          message: res?.error || res?.message || 'Invalid API Key or server unreachable.',
        });
      }
    } catch (err) {
      setTestResult({
        success: false,
        status: 'Error',
        latency: '--',
        message: err.message || 'Connection test failed.',
      });
    } finally {
      setTesting(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const effectiveKey = apiKey.trim();
    
    await saveAiConfig({
      provider,
      apiKey: effectiveKey,
      model,
      confidenceThreshold: parseFloat(confidenceThreshold),
      violationThreshold: parseFloat(violationThreshold),
      enabled,
      dedupCooldownSeconds: parseInt(dedupCooldown, 10) || 30,
    });

    if (
      effectiveKey &&
      effectiveKey.length > 25 &&
      !effectiveKey.includes('••••') &&
      !effectiveKey.toLowerCase().includes('demo')
    ) {
      localStorage.setItem('GEMINI_API_KEY', effectiveKey);
    }

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3500);

    // Auto test after save
    setTimeout(() => {
      handleTestConnection();
    }, 300);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
          AI Model & Vision Configuration
        </h1>
        <p style={{ fontSize: '0.82rem', color: '#64748B', margin: '0.25rem 0 0 0' }}>
          Configure AI detection parameters, vision models, and Gemini API keys.
        </p>
      </div>

      {/* AI Connection Status Banner */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '12px',
          border: '1px solid #E2E8F0',
          padding: '1.25rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              backgroundColor: enabled ? '#F0FDF4' : '#FEF2F2',
              color: enabled ? '#16A34A' : '#DC2626',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Cpu size={22} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <span style={{ fontWeight: 800, fontSize: '0.95rem', color: '#0F172A' }}>
                AI Vision Engine
              </span>
              <span
                style={{
                  padding: '0.15rem 0.5rem',
                  borderRadius: '999px',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  backgroundColor: enabled ? '#DCFCE7' : '#FEE2E2',
                  color: enabled ? '#15803D' : '#991B1B',
                }}
              >
                {enabled ? 'SYSTEM ACTIVE' : 'DISABLED'}
              </span>
            </div>
            {testResult ? (
              <div style={{ fontSize: '0.75rem', color: testResult.success ? '#16A34A' : '#DC2626', marginTop: '0.2rem', fontWeight: 600 }}>
                {testResult.message} {testResult.latency !== '--' && `(${testResult.latency})`}
              </div>
            ) : (
              <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '0.2rem' }}>
                Provider: {provider} • Model: {model}
              </div>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={handleTestConnection}
          disabled={testing}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            padding: '0.55rem 1rem',
            borderRadius: '8px',
            border: '1px solid #CBD5E1',
            backgroundColor: '#F8FAFC',
            color: '#0F172A',
            fontWeight: 700,
            fontSize: '0.82rem',
            cursor: testing ? 'not-allowed' : 'pointer',
          }}
        >
          <RefreshCw size={14} className={testing ? 'animate-spin' : ''} />
          <span>{testing ? 'Testing...' : 'Test Connection'}</span>
        </button>
      </div>

      {saveSuccess && (
        <div
          style={{
            padding: '0.85rem 1rem',
            borderRadius: '8px',
            backgroundColor: '#F0FDF4',
            border: '1px solid #BBF7D0',
            color: '#15803D',
            fontSize: '0.82rem',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <CheckCircle2 size={16} />
          <span>AI configuration and API key saved permanently to database!</span>
        </div>
      )}

      {/* Configuration Form */}
      <form
        onSubmit={handleSave}
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
        {/* Enable AI Detection Toggle */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingBottom: '1rem',
            borderBottom: '1px solid #F1F5F9',
          }}
        >
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0F172A' }}>
              Automated AI Violation Detection
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '0.1rem' }}>
              Run automatic multimodal violation detection on uploaded and captured evidence
            </div>
          </div>
          <input
            type="checkbox"
            checked={enabled}
            onChange={(e) => setEnabled(e.target.checked)}
            style={{ width: '18px', height: '18px', accentColor: '#0F172A', cursor: 'pointer' }}
          />
        </div>

        {/* AI Provider */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155' }}>
            AI Provider
          </label>
          <select
            value={provider}
            onChange={(e) => setProvider(e.target.value)}
            style={{
              padding: '0.65rem 0.85rem',
              borderRadius: '8px',
              border: '1px solid #CBD5E1',
              fontSize: '0.85rem',
              color: '#0F172A',
              backgroundColor: '#FFFFFF',
            }}
          >
            <option value="Google Gemini Vision AI">Google Gemini Vision AI</option>
            <option value="Custom YOLOv8 Engine">Custom YOLOv8 Engine</option>
            <option value="Hybrid Vision Pipeline">Hybrid Vision Pipeline</option>
          </select>
        </div>

        {/* API Key Input with Visibility Toggle */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <KeyRound size={14} color="#0F172A" />
              <span>Google Gemini API Key</span>
            </label>
            <span style={{ fontSize: '0.72rem', color: apiKey ? '#16A34A' : '#94A3B8', fontWeight: 600 }}>
              {apiKey ? '● Key Configured' : 'No Key Entered'}
            </span>
          </div>

          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <input
              type={showKey ? 'text' : 'password'}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Paste your Gemini API key (e.g. AIzaSy...)"
              style={{
                width: '100%',
                padding: '0.65rem 2.5rem 0.65rem 0.85rem',
                borderRadius: '8px',
                border: '1px solid #CBD5E1',
                fontSize: '0.85rem',
                color: '#0F172A',
                backgroundColor: '#FFFFFF',
                boxSizing: 'border-box'
              }}
            />
            <button
              type="button"
              onClick={() => setShowKey(!showKey)}
              style={{
                position: 'absolute',
                right: '10px',
                background: 'transparent',
                border: 'none',
                color: '#64748B',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                padding: '4px'
              }}
              title={showKey ? 'Hide Key' : 'Show Key'}
            >
              {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <span style={{ fontSize: '0.72rem', color: '#64748B' }}>
            Saved permanently in the server database and encrypted environment. Preserved across all tab restarts.
          </span>
        </div>

        {/* Model Selection */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155' }}>
            Vision Model
          </label>
          <select
            value={model}
            onChange={(e) => setModel(e.target.value)}
            style={{
              padding: '0.65rem 0.85rem',
              borderRadius: '8px',
              border: '1px solid #CBD5E1',
              fontSize: '0.85rem',
              color: '#0F172A',
              backgroundColor: '#FFFFFF',
            }}
          >
            <option value="gemini-flash-lite-latest">gemini-flash-lite-latest (Recommended - High Speed & Quota)</option>
            <option value="gemini-flash-latest">gemini-flash-latest (Ultra-Fast Multimodal)</option>
            <option value="gemini-3.8-flash">gemini-3.8-flash (Latest Model)</option>
            <option value="gemini-3.5-flash">gemini-3.5-flash</option>
            <option value="gemini-2.5-flash">gemini-2.5-flash</option>
            <option value="gemini-2.5-pro">gemini-2.5-pro (Deep Reasoning)</option>
            <option value="yolov8-custom">yolov8-custom (Edge CV)</option>
          </select>
        </div>

        {/* Threshold Sliders */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155' }}>
                Confidence Threshold
              </label>
              <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0F172A' }}>
                {(confidenceThreshold * 100).toFixed(0)}%
              </span>
            </div>
            <input
              type="range"
              min="0.4"
              max="0.95"
              step="0.05"
              value={confidenceThreshold}
              onChange={(e) => setConfidenceThreshold(e.target.value)}
              style={{ width: '100%', accentColor: '#0F172A' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155' }}>
                Violation Threshold
              </label>
              <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#DC2626' }}>
                {(violationThreshold * 100).toFixed(0)}%
              </span>
            </div>
            <input
              type="range"
              min="0.5"
              max="0.95"
              step="0.05"
              value={violationThreshold}
              onChange={(e) => setViolationThreshold(e.target.value)}
              style={{ width: '100%', accentColor: '#DC2626' }}
            />
          </div>
        </div>

        {/* Cooldown */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155' }}>
            De-duplication Window (Seconds)
          </label>
          <input
            type="number"
            min="5"
            max="300"
            value={dedupCooldown}
            onChange={(e) => setDedupCooldown(e.target.value)}
            style={{
              padding: '0.65rem 0.85rem',
              borderRadius: '8px',
              border: '1px solid #CBD5E1',
              fontSize: '0.85rem',
              width: '160px',
            }}
          />
        </div>

        {/* Save Button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '1rem', borderTop: '1px solid #F1F5F9' }}>
          <button
            type="submit"
            style={{
              padding: '0.65rem 1.4rem',
              borderRadius: '8px',
              backgroundColor: '#0F172A',
              color: '#FFFFFF',
              border: 'none',
              fontWeight: 700,
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              cursor: 'pointer',
            }}
          >
            <Save size={15} />
            <span>Save Configuration</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default DepartmentAIConfiguration;
