'use client';

import { useState, useEffect, useMemo } from 'react';

interface ConfigData {
  brandName?: string;
  siteUrl?: string;
  valueProp?: string;
  psOffer?: string;
  utmTemplate?: string;
  charLimits?: Record<string, number>;
}

interface Influencer {
  id: string;
  displayName: string;
  platform: string;
  handle: string;
  profileUrl?: string;
  email?: string;
  tags?: string;
  personalizationNotes?: string;
  recentContentHook?: string;
  status: string;
  lastContactedAt?: string;
  notes?: string;
}

interface TemplatesData {
  templates?: any;
  fallbackTemplates?: any;
}

export default function OutreachDashboard() {
  const [config, setConfig] = useState<ConfigData | null>(null);
  const [influencers, setInfluencers] = useState<Influencer[]>([]);
  const [templates, setTemplates] = useState<TemplatesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // UI state
  const [selectedInfluencer, setSelectedInfluencer] = useState<Influencer | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [platformFilter, setPlatformFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [templateType, setTemplateType] = useState('first_touch');
  const [includePs, setIncludePs] = useState(true);
  const [generatedMessage, setGeneratedMessage] = useState('');
  const [messageStatus, setMessageStatus] = useState<'idle' | 'generating' | 'ready'>('idle');
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied'>('idle');

  // Load all data
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError(null);

        const [configRes, influencersRes, templatesRes] = await Promise.all([
          fetch('/api/outreach/config'),
          fetch('/api/outreach/influencers'),
          fetch('/api/outreach/templates')
        ]);

        if (!configRes.ok || !influencersRes.ok || !templatesRes.ok) {
          throw new Error('Failed to load dashboard data');
        }

        const [configData, influencersData, templatesData] = await Promise.all([
          configRes.json(),
          influencersRes.json(),
          templatesRes.json()
        ]);

        setConfig(configData);
        setInfluencers(influencersData.influencers || []);
        setTemplates(templatesData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  // Filtered influencers
  const filteredInfluencers = useMemo(() => {
    return influencers.filter(inf => {
      const matchesSearch = !searchQuery ||
        inf.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inf.handle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inf.tags?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesPlatform = !platformFilter || inf.platform === platformFilter;
      const matchesStatus = !statusFilter || inf.status === statusFilter;

      return matchesSearch && matchesPlatform && matchesStatus;
    });
  }, [influencers, searchQuery, platformFilter, statusFilter]);

  // Generate message
  const generateMessage = async () => {
    if (!selectedInfluencer || !config || !templates) return;

    setMessageStatus('generating');

    try {
      // Use fallback templates for now (simplified version)
      const platform = selectedInfluencer.platform || 'other';
      const template = templates.fallbackTemplates?.[templateType]?.[platform] ||
                      templates.fallbackTemplates?.[templateType]?.other;

      if (!template) {
        throw new Error(`No template found for ${templateType} on ${platform}`);
      }

      // Simple placeholder replacement
      let message = template;
      const placeholders = {
        name: selectedInfluencer.displayName || selectedInfluencer.handle || 'there',
        handle: selectedInfluencer.handle || '',
        siteUrl: config.siteUrl || 'https://example.com',
        valueProp: config.valueProp || 'free personalized meal plans',
        brandName: config.brandName || 'Paws & Plates',
        hookLine: selectedInfluencer.recentContentHook ? ` — loved your ${selectedInfluencer.recentContentHook}` : '',
        psLine: includePs ? `\n\n${config.psOffer}` : ''
      };

      Object.entries(placeholders).forEach(([key, value]) => {
        message = message.replace(new RegExp(`\\{${key}\\}`, 'g'), value);
      });

      setGeneratedMessage(message);
      setMessageStatus('ready');
    } catch (err) {
      setGeneratedMessage(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setMessageStatus('ready');
    }
  };

  // Copy message to clipboard
  const copyMessage = async () => {
    if (!generatedMessage) return;

    try {
      await navigator.clipboard.writeText(generatedMessage);
      setCopyStatus('copied');
      setTimeout(() => setCopyStatus('idle'), 2000);

      // Play beep sound
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.2);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.2);
    } catch (err) {
      console.error('Failed to copy or play sound:', err);
    }
  };

  // Get character count and limit check
  const charCount = generatedMessage.length;
  const charLimit = config?.charLimits?.[selectedInfluencer?.platform || 'other'] || 450;
  const isOverLimit = charCount > charLimit;

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
        <div>Loading Outreach Dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: '#991b1b' }}>
        <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>❌</div>
        <div><strong>Error loading dashboard:</strong></div>
        <div style={{ marginTop: '1rem', fontFamily: 'monospace' }}>{error}</div>
      </div>
    );
  }

  return (
    <div style={{ padding: '1rem', fontFamily: 'system-ui, sans-serif', maxWidth: '1400px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '2rem', color: '#1f2937' }}>
        📧 Outreach Dashboard
      </h1>

      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '2rem', alignItems: 'start' }}>
        {/* Left Panel - Influencers */}
        <div style={{ border: '1px solid #d1d5db', borderRadius: '0.5rem', padding: '1rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>
            👥 Influencers ({filteredInfluencers.length})
          </h2>

          {/* Filters */}
          <div style={{ marginBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <input
              type="text"
              placeholder="Search name/handle/tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                padding: '0.5rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.25rem',
                width: '100%'
              }}
            />

            <select
              value={platformFilter}
              onChange={(e) => setPlatformFilter(e.target.value)}
              style={{
                padding: '0.5rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.25rem'
              }}
            >
              <option value="">All Platforms</option>
              <option value="instagram">Instagram</option>
              <option value="tiktok">TikTok</option>
              <option value="youtube">YouTube</option>
              <option value="x">X (Twitter)</option>
              <option value="threads">Threads</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                padding: '0.5rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.25rem'
              }}
            >
              <option value="">All Statuses</option>
              <option value="not_contacted">Not Contacted</option>
              <option value="contacted">Contacted</option>
              <option value="replied">Replied</option>
              <option value="follow_up">Follow Up</option>
              <option value="not_interested">Not Interested</option>
            </select>
          </div>

          {/* Influencer List */}
          <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
            {filteredInfluencers.map(inf => (
              <div
                key={inf.id}
                onClick={() => setSelectedInfluencer(inf)}
                style={{
                  padding: '0.75rem',
                  marginBottom: '0.5rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.25rem',
                  cursor: 'pointer',
                  backgroundColor: selectedInfluencer?.id === inf.id ? '#eff6ff' : 'white',
                  transition: 'background-color 0.2s'
                }}
              >
                <div style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>
                  {inf.displayName}
                </div>
                <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                  @{inf.handle} • {inf.platform}
                </div>
                <div style={{
                  fontSize: '0.75rem',
                  color: inf.status === 'contacted' ? '#059669' :
                         inf.status === 'replied' ? '#0891b2' :
                         inf.status === 'follow_up' ? '#d97706' :
                         inf.status === 'not_interested' ? '#dc2626' : '#6b7280',
                  marginTop: '0.25rem'
                }}>
                  {inf.status.replace('_', ' ').toUpperCase()}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Panel - Message Generation */}
        <div style={{ border: '1px solid #d1d5db', borderRadius: '0.5rem', padding: '1rem' }}>
          {selectedInfluencer ? (
            <>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>
                💬 Message for {selectedInfluencer.displayName}
              </h2>

              {/* Controls */}
              <div style={{ marginBottom: '1rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <select
                  value={templateType}
                  onChange={(e) => setTemplateType(e.target.value)}
                  style={{
                    padding: '0.5rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.25rem'
                  }}
                >
                  <option value="first_touch">First Touch</option>
                  <option value="follow_up">Follow Up</option>
                  <option value="affiliate_invite">Affiliate Invite</option>
                </select>

                <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <input
                    type="checkbox"
                    checked={includePs}
                    onChange={(e) => setIncludePs(e.target.checked)}
                  />
                  Include PS
                </label>

                <button
                  onClick={generateMessage}
                  disabled={messageStatus === 'generating'}
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.25rem',
                    cursor: messageStatus === 'generating' ? 'not-allowed' : 'pointer'
                  }}
                >
                  {messageStatus === 'generating' ? 'Generating...' : 'Generate Message'}
                </button>
              </div>

              {/* Message Display */}
              {generatedMessage && (
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span style={{ fontWeight: 'bold' }}>Generated Message:</span>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <span style={{
                        fontSize: '0.875rem',
                        color: isOverLimit ? '#dc2626' : '#059669'
                      }}>
                        {charCount}/{charLimit} chars
                      </span>
                      <button
                        onClick={copyMessage}
                        style={{
                          padding: '0.25rem 0.75rem',
                          backgroundColor: copyStatus === 'copied' ? '#059669' : '#6b7280',
                          color: 'white',
                          border: 'none',
                          borderRadius: '0.25rem',
                          cursor: 'pointer',
                          fontSize: '0.875rem'
                        }}
                      >
                        {copyStatus === 'copied' ? '✅ Copied!' : '📋 Copy'}
                      </button>
                    </div>
                  </div>

                  <textarea
                    value={generatedMessage}
                    readOnly
                    style={{
                      width: '100%',
                      minHeight: '200px',
                      padding: '0.75rem',
                      border: isOverLimit ? '2px solid #dc2626' : '1px solid #d1d5db',
                      borderRadius: '0.25rem',
                      fontFamily: 'monospace',
                      fontSize: '0.875rem',
                      resize: 'vertical'
                    }}
                  />
                </div>
              )}

              {/* Influencer Details */}
              <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: '#f9fafb', borderRadius: '0.25rem' }}>
                <h3 style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Influencer Details</h3>
                <div style={{ fontSize: '0.875rem', lineHeight: '1.5' }}>
                  <div><strong>Platform:</strong> {selectedInfluencer.platform}</div>
                  <div><strong>Handle:</strong> @{selectedInfluencer.handle}</div>
                  <div><strong>Status:</strong> {selectedInfluencer.status.replace('_', ' ')}</div>
                  {selectedInfluencer.tags && (
                    <div><strong>Tags:</strong> {selectedInfluencer.tags}</div>
                  )}
                  {selectedInfluencer.recentContentHook && (
                    <div><strong>Recent Content:</strong> {selectedInfluencer.recentContentHook}</div>
                  )}
                  {selectedInfluencer.personalizationNotes && (
                    <div><strong>Notes:</strong> {selectedInfluencer.personalizationNotes}</div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👈</div>
              <div>Select an influencer from the list to generate a message</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
