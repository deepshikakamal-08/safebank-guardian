import React, { useState, useRef } from 'react';
import { 
  MessageSquareQuote, 
  Shield, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  RotateCcw,
  Lock,
  Upload,
  Image as ImageIcon,
  FileText,
  X,
  AlertCircle,
  Check,
  Edit3
} from 'lucide-react';
import { useGuardian } from '../../context/GuardianContext';
import { DEMO_SCENARIOS } from '../../data/mockData';
import { extractTextFromScreenshot, validateImageFile, SUPPORTED_IMAGE_TYPES } from '../../ml/screenshotOcr';
import { analyzeMessage } from '../../ml/scamClassifier';

export default function ScamContext() {
  const { 
    scamMessage, 
    setScamMessage, 
    performAnalysis, 
    isAnalyzing, 
    setActiveScreen,
    paymentDraft
  } = useGuardian();

  // Input mode: 'paste' (default) | 'screenshot'
  const [inputMode, setInputMode] = useState('paste');

  // Screenshot upload state
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [ocrStatus, setOcrStatus] = useState('idle'); // 'idle' | 'processing' | 'success' | 'error'
  const [ocrProgress, setOcrProgress] = useState(0);
  const [ocrError, setOcrError] = useState(null);
  const [extractedText, setExtractedText] = useState('');
  const [liveMlResult, setLiveMlResult] = useState(null);

  const fileInputRef = useRef(null);

  // Quick preset handler for text mode
  const handleSetExample = (text) => {
    setScamMessage(text);
  };

  // Process selected image file
  const processImage = async (fileOrUrl, fileName = 'screenshot.png') => {
    setOcrError(null);
    setOcrStatus('processing');
    setOcrProgress(5);

    if (fileOrUrl instanceof File) {
      const validation = validateImageFile(fileOrUrl);
      if (!validation.valid) {
        setOcrStatus('error');
        setOcrError(validation.error);
        return;
      }
      setImageFile(fileOrUrl);
      setImagePreview(URL.createObjectURL(fileOrUrl));
    } else {
      setImageFile({ name: fileName, size: 24500, type: 'image/png' });
      setImagePreview(fileOrUrl);
    }

    const result = await extractTextFromScreenshot(fileOrUrl, (pct) => {
      setOcrProgress(pct);
    });

    if (!result.success) {
      setOcrStatus('error');
      setOcrError(result.error);
      setExtractedText('');
      setLiveMlResult(null);
      return;
    }

    setOcrStatus('success');
    setExtractedText(result.text);
    setScamMessage(result.text);

    // Run existing ML inference on extracted text
    const ml = analyzeMessage(result.text);
    setLiveMlResult(ml);
  };

  // File input change handler
  const handleFileInputChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      processImage(file);
    }
  };

  // Drag and drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processImage(file);
    }
  };

  // User edits extracted text
  const handleExtractedTextChange = (e) => {
    const newText = e.target.value;
    setExtractedText(newText);
    setScamMessage(newText);

    if (newText.trim()) {
      const ml = analyzeMessage(newText);
      setLiveMlResult(ml);
    } else {
      setLiveMlResult(null);
    }
  };

  // Reset screenshot upload
  const handleClearScreenshot = () => {
    setImageFile(null);
    setImagePreview(null);
    setOcrStatus('idle');
    setOcrProgress(0);
    setOcrError(null);
    setExtractedText('');
    setLiveMlResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Trigger analysis for screenshot flow
  const handleAnalyzeScreenshot = () => {
    if (!extractedText.trim()) return;
    setScamMessage(extractedText.trim());
    performAnalysis();
  };

  return (
    <div className="scam-context-view" style={{ maxWidth: '760px', margin: '0 auto', paddingBottom: '32px' }}>
      <div className="card" style={{ padding: '24px 28px', borderRadius: 'var(--radius-xl)' }}>
        
        {/* Card Header */}
        <div className="card-header" style={{ marginBottom: '18px' }}>
          <div>
            <h2 className="card-title" style={{ fontSize: '1.28rem' }}>Scam Message &amp; Context Verification</h2>
            <p className="card-subtitle" style={{ fontSize: '0.84rem' }}>
              Evaluating manipulation cues for transfer of ₹{Number(paymentDraft.amount).toLocaleString('en-IN')} to {paymentDraft.recipientName}
            </p>
          </div>
          <span className="brand-badge">Step 3 of 5</span>
        </div>

        {/* Informative Prompt Banner */}
        <div className="message-prompt-banner" style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
            <MessageSquareQuote size={22} color="#0284c7" style={{ flexShrink: 0, marginTop: 2 }} />
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                Did someone call, text, or instruct you to initiate this transfer?
              </div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: 3 }}>
                Social engineering scammers create artificial panic to bypass security checks. Provide the suspicious message below via text or screenshot.
              </div>
            </div>
          </div>
        </div>

        {/* Input Method Selector Tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '18px', borderBottom: '1px solid var(--border-light)', paddingBottom: '10px' }}>
          <button
            type="button"
            onClick={() => setInputMode('paste')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              background: inputMode === 'paste' ? 'var(--brand-primary)' : 'var(--bg-subtle)',
              color: inputMode === 'paste' ? 'white' : 'var(--text-secondary)',
              fontWeight: 700,
              fontSize: '0.86rem',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <FileText size={15} />
            <span>Paste Message Text</span>
          </button>

          <button
            type="button"
            onClick={() => setInputMode('screenshot')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              background: inputMode === 'screenshot' ? 'var(--brand-primary)' : 'var(--bg-subtle)',
              color: inputMode === 'screenshot' ? 'white' : 'var(--text-secondary)',
              fontWeight: 700,
              fontSize: '0.86rem',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <Upload size={15} />
            <span>Upload Screenshot</span>
            <span style={{
              fontSize: '0.68rem',
              background: inputMode === 'screenshot' ? 'rgba(255,255,255,0.25)' : 'var(--brand-soft)',
              color: inputMode === 'screenshot' ? 'white' : 'var(--brand-primary)',
              padding: '1px 6px',
              borderRadius: '4px',
              fontWeight: 800
            }}>
              OCR
            </span>
          </button>
        </div>

        {/* MODE 1: PASTE TEXT (Preserves existing workflow) */}
        {inputMode === 'paste' && (
          <div className="form-group" style={{ marginBottom: '16px' }}>
            <label className="form-label" htmlFor="scamTextarea">
              <span>Suspicious Message Content</span>
              <span className="form-label-hint">Paste SMS, WhatsApp, or Call script</span>
            </label>
            <textarea
              id="scamTextarea"
              className="scam-textarea"
              value={scamMessage}
              onChange={(e) => setScamMessage(e.target.value)}
              placeholder="Paste message here... e.g., 'Your bank account will be blocked today...'"
              rows={4}
            />

            {/* Quick Preset Buttons */}
            <div className="sample-messages-box" style={{ marginTop: '10px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Quick demo samples:</span>
              <button
                type="button"
                className="sample-pill"
                onClick={() => handleSetExample(DEMO_SCENARIOS.highRisk.scamMessage)}
                title="Official demo message"
              >
                🚨 Bank Account Block Threat (₹50k)
              </button>
              <button
                type="button"
                className="sample-pill"
                onClick={() => handleSetExample(DEMO_SCENARIOS.mediumRisk.scamMessage)}
              >
                ⚠️ Medical Distress (₹15k)
              </button>
              <button
                type="button"
                className="sample-pill"
                onClick={() => handleSetExample(DEMO_SCENARIOS.lowRisk.scamMessage)}
              >
                ✅ Regular Friend Split (₹1.2k)
              </button>
            </div>
          </div>
        )}

        {/* MODE 2: UPLOAD SCREENSHOT WITH CLIENT-SIDE OCR */}
        {inputMode === 'screenshot' && (
          <div style={{ marginBottom: '18px' }}>
            {/* Hidden File Input */}
            <input
              type="file"
              ref={fileInputRef}
              accept="image/png, image/jpeg, image/jpg, image/webp"
              onChange={handleFileInputChange}
              style={{ display: 'none' }}
              id="screenshotFileInput"
            />

            {/* Dropzone area when no image selected */}
            {!imagePreview && (
              <div>
                <div
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    border: '2px dashed var(--border-medium)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '28px 20px',
                    textAlign: 'center',
                    background: 'var(--bg-subtle)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    marginBottom: '12px'
                  }}
                >
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    background: 'var(--brand-soft)',
                    color: 'var(--brand-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 12px'
                  }}>
                    <Upload size={22} />
                  </div>
                  <div style={{ fontSize: '0.94rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
                    Upload Screenshot
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                    Drag &amp; drop an SMS, WhatsApp, or Telegram screenshot, or <u>click to browse</u>
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    Accepted formats: PNG, JPG, JPEG, WEBP • Max 10MB
                  </div>
                </div>

                {/* Sample Test Screenshots */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '14px' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Try test screenshots:</span>
                  <button
                    type="button"
                    className="sample-pill"
                    onClick={() => processImage('/demo-scam-screenshot.png', 'demo-scam-screenshot.png')}
                  >
                    📸 Demo Scam SMS Screenshot
                  </button>
                  <button
                    type="button"
                    className="sample-pill"
                    onClick={() => processImage('/demo-legitimate-screenshot.png', 'demo-legitimate-screenshot.png')}
                  >
                    📸 Demo Friend Chat Screenshot
                  </button>
                </div>
              </div>
            )}

            {/* OCR Progress Loading State */}
            {ocrStatus === 'processing' && (
              <div style={{
                background: '#f0f9ff',
                border: '1px solid #bae6fd',
                borderRadius: 'var(--radius-lg)',
                padding: '20px',
                textAlign: 'center',
                marginBottom: '16px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '10px' }}>
                  <span className="pulse-dot" style={{ background: '#0284c7' }}></span>
                  <strong style={{ fontSize: '0.9rem', color: '#0369a1' }}>
                    Extracting text with browser-side OCR... ({ocrProgress}%)
                  </strong>
                </div>
                <div style={{
                  width: '100%',
                  height: '8px',
                  background: '#e0f2fe',
                  borderRadius: '4px',
                  overflow: 'hidden',
                  maxWidth: '380px',
                  margin: '0 auto 8px'
                }}>
                  <div style={{
                    width: `${ocrProgress}%`,
                    height: '100%',
                    background: '#0284c7',
                    transition: 'width 0.2s ease'
                  }}></div>
                </div>
                <div style={{ fontSize: '0.72rem', color: '#0284c7' }}>
                  Tesseract.js WebAssembly • Processing 100% locally in browser
                </div>
              </div>
            )}

            {/* OCR Error Notification */}
            {ocrStatus === 'error' && (
              <div style={{
                background: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: 'var(--radius-lg)',
                padding: '14px 18px',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px'
              }}>
                <AlertCircle size={18} color="#dc2626" style={{ flexShrink: 0, marginTop: 2 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.86rem', fontWeight: 700, color: '#991b1b', marginBottom: '2px' }}>
                    Unable to read screenshot
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#7f1d1d' }}>
                    {ocrError || 'No readable text could be detected. Please ensure the screenshot is high-contrast or paste text manually.'}
                  </div>
                  <button
                    type="button"
                    onClick={handleClearScreenshot}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#dc2626',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      padding: 0,
                      marginTop: '6px',
                      textDecoration: 'underline'
                    }}
                  >
                    Try another image
                  </button>
                </div>
              </div>
            )}

            {/* Successful OCR Result & Editable Text (Requirements 4, 5, 6) */}
            {ocrStatus === 'success' && imagePreview && (
              <div style={{ marginBottom: '16px' }}>
                {/* Image Preview Bar */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  background: 'var(--bg-subtle)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-light)',
                  marginBottom: '12px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <img 
                      src={imagePreview} 
                      alt="Uploaded screenshot" 
                      style={{ width: '44px', height: '32px', objectFit: 'cover', borderRadius: '4px', border: '1px solid var(--border-light)' }} 
                    />
                    <div>
                      <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {imageFile?.name || 'Screenshot'}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--safe-emerald)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Check size={12} />
                        <span>OCR extraction completed (Local WebAssembly)</span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleClearScreenshot}
                    style={{
                      border: 'none',
                      background: 'transparent',
                      color: 'var(--text-muted)',
                      cursor: 'pointer',
                      padding: '4px 8px',
                      fontSize: '0.76rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4
                    }}
                  >
                    <X size={14} />
                    <span>Remove</span>
                  </button>
                </div>

                {/* Requirement 5 & 6: Extracted Message Text (Editable) */}
                <div className="form-group" style={{ marginBottom: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <label className="form-label" htmlFor="extractedTextarea" style={{ margin: 0 }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Edit3 size={15} color="var(--brand-primary)" />
                        <strong>Extracted Message Text</strong>
                      </span>
                    </label>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      Editable: Correct any OCR typos below
                    </span>
                  </div>
                  
                  <textarea
                    id="extractedTextarea"
                    className="scam-textarea"
                    value={extractedText}
                    onChange={handleExtractedTextChange}
                    placeholder="Extracted text will appear here..."
                    rows={4}
                    style={{ fontFamily: 'var(--font-sans)', fontSize: '0.9rem', lineHeight: 1.45 }}
                  />
                </div>

                {/* Requirement 9: Display actual ML prediction, probability & top contributing features */}
                {liveMlResult && (
                  <div style={{
                    background: liveMlResult.label === 'SCAM' ? '#fef2f2' : '#f0fdf4',
                    border: `1.5px solid ${liveMlResult.label === 'SCAM' ? '#fca5a5' : '#bbf7d0'}`,
                    borderRadius: 'var(--radius-lg)',
                    padding: '14px 18px',
                    marginBottom: '16px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{
                          fontSize: '0.74rem',
                          fontWeight: 800,
                          textTransform: 'uppercase',
                          color: liveMlResult.label === 'SCAM' ? '#dc2626' : '#059669',
                          background: liveMlResult.label === 'SCAM' ? '#fee2e2' : '#dcfce7',
                          padding: '2px 8px',
                          borderRadius: '4px'
                        }}>
                          {liveMlResult.label}
                        </span>
                        <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                          Scam Probability: {(liveMlResult.scamProbability * 100).toFixed(1)}%
                        </span>
                      </div>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                        TF-IDF + Logistic Regression
                      </span>
                    </div>

                    {liveMlResult.topFeatures && liveMlResult.topFeatures.length > 0 && (
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        <span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>Top Contributing Features: </span>
                        {liveMlResult.topFeatures.slice(0, 3).map((f, i) => (
                          <span key={i} style={{
                            display: 'inline-block',
                            marginRight: '6px',
                            fontFamily: 'var(--font-mono)',
                            fontSize: '0.72rem',
                            background: f.direction === 'SCAM' ? '#fff1f2' : '#f0fdf4',
                            color: f.direction === 'SCAM' ? '#be123c' : '#047857',
                            padding: '1px 5px',
                            borderRadius: '3px',
                            border: `1px solid ${f.direction === 'SCAM' ? '#ffe4e6' : '#dcfce7'}`
                          }}>
                            {f.feature} ({f.direction === 'SCAM' ? '+' : ''}{f.contribution})
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Explicit Privacy & Zero Snooping Declaration (Requirement 10 & 11) */}
        <div className="privacy-callout" style={{ marginTop: '8px' }}>
          <Lock size={18} style={{ flexShrink: 0, marginTop: 2 }} />
          <div>
            <strong>Explicit Customer Consent &amp; Privacy Principle:</strong> SafeBank Guardian does <u>not</u> automatically scan or snoop on private SMS, WhatsApp messages, or gallery photos. <em>Screenshot analysis is performed only after you choose to upload it.</em> OCR runs 100% locally in your browser — zero images are uploaded to any external server.
          </div>
        </div>

        {/* Action Row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '22px' }}>
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => setActiveScreen('send')}
          >
            Back to Payment
          </button>

          {/* Screenshot-specific or standard Guardian Analysis button */}
          {inputMode === 'screenshot' && ocrStatus === 'success' ? (
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleAnalyzeScreenshot}
              disabled={isAnalyzing || !extractedText.trim()}
              style={{ padding: '12px 24px', fontSize: '0.98rem' }}
            >
              {isAnalyzing ? (
                <>
                  <span className="pulse-dot" style={{ background: 'white' }}></span>
                  <span>Correlating Signals...</span>
                </>
              ) : (
                <>
                  <Sparkles size={17} />
                  <span>Analyze Screenshot with Guardian</span>
                  <ArrowRight size={17} />
                </>
              )}
            </button>
          ) : (
            <button
              type="button"
              className="btn btn-primary"
              onClick={performAnalysis}
              disabled={isAnalyzing || !scamMessage.trim()}
              style={{ padding: '12px 24px', fontSize: '0.98rem' }}
            >
              {isAnalyzing ? (
                <>
                  <span className="pulse-dot" style={{ background: 'white' }}></span>
                  <span>Correlating Signals...</span>
                </>
              ) : (
                <>
                  <Sparkles size={17} />
                  <span>Analyze with Guardian</span>
                  <ArrowRight size={17} />
                </>
              )}
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
