// Outreach Dashboard Frontend

// State management
let influencers = [];
let filteredInfluencers = [];
let selectedInfluencer = null;
let config = {};
let templates = {};
let saveTimeout = null;

// DOM elements
const elements = {};

/**
 * Play a short beep sound using Web Audio API
 * Used when copying messages to clipboard
 */
function playBeep() {
  try {
    // Check if Web Audio API is supported
    if (!window.AudioContext && !window.webkitAudioContext) {
      console.warn('Web Audio API not supported');
      return;
    }

    const AudioContext = window.AudioContext || window.webkitAudioContext;
    const audioContext = new AudioContext();

    // Create oscillator for beep sound
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    // Connect nodes
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // Configure beep sound
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime); // 800Hz beep
    oscillator.type = 'sine';

    // Configure volume envelope
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.1, audioContext.currentTime + 0.01); // Quick attack
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2); // Quick decay

    // Play beep
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.2); // 200ms beep

  } catch (error) {
    console.warn('Failed to play beep:', error);
    // Silently fail - beep is not critical functionality
  }
}

// Initialize the app
document.addEventListener('DOMContentLoaded', async () => {
    cacheElements();
    setupEventListeners();
    await loadData();
    renderTable();
    updateStatusIndicator('Ready');
});

// Cache DOM elements for performance
function cacheElements() {
    elements.tableBody = document.getElementById('influencers-tbody');
    elements.detailsPanel = document.getElementById('details-panel');
    elements.statusIndicator = document.getElementById('status-indicator');

    // Filters
    elements.statusFilter = document.getElementById('status-filter');
    elements.platformFilter = document.getElementById('platform-filter');
    elements.searchInput = document.getElementById('search-input');
    elements.limitSelect = document.getElementById('limit-select');

    // Message controls
    elements.templateSelect = document.getElementById('template-select');
    elements.sourceSelect = document.getElementById('source-select');
    elements.includePsToggle = document.getElementById('include-ps-toggle');

    // Details panel
    elements.detailsName = document.getElementById('details-name');
    elements.editStatus = document.getElementById('edit-status');
    elements.editNotes = document.getElementById('edit-notes');
    elements.editRecentContent = document.getElementById('edit-recent-content');
    elements.editPersonalization = document.getElementById('edit-personalization');
    elements.editEmail = document.getElementById('edit-email');
    elements.editProfileUrl = document.getElementById('edit-profile-url');

    // Actions
    elements.openProfileBtn = document.getElementById('open-profile-btn');
    elements.generateMessageBtn = document.getElementById('generate-message-btn');
    elements.markContactedBtn = document.getElementById('mark-contacted-btn');

    // Message area
    elements.messageTextarea = document.getElementById('message-textarea');
    elements.charCounter = document.getElementById('char-counter');
    elements.copyMessageBtn = document.getElementById('copy-message-btn');
    elements.warnings = document.getElementById('warnings');
}

// Setup event listeners
function setupEventListeners() {
    // Filters
    elements.statusFilter.addEventListener('change', applyFilters);
    elements.platformFilter.addEventListener('change', applyFilters);
    elements.searchInput.addEventListener('input', applyFilters);
    elements.limitSelect.addEventListener('change', applyFilters);

    // Refresh button
    document.getElementById('refresh-btn').addEventListener('click', () => loadData());

    // Details panel
    document.getElementById('close-details').addEventListener('click', closeDetailsPanel);

    // Edit fields (autosave)
    [elements.editStatus, elements.editNotes, elements.editRecentContent,
     elements.editPersonalization, elements.editEmail, elements.editProfileUrl]
        .filter(Boolean)
        .forEach(el => el.addEventListener('input', () => scheduleAutosave()));

    // Action buttons
    elements.openProfileBtn.addEventListener('click', openProfile);
    elements.generateMessageBtn.addEventListener('click', generateMessage);
    elements.markContactedBtn.addEventListener('click', markContacted);
    elements.copyMessageBtn.addEventListener('click', copyMessage);

    // Message textarea
    elements.messageTextarea.addEventListener('input', updateCharCounter);
}

// Load all data from API
async function loadData() {
    try {
        updateStatusIndicator('Loading...');

        // Load config first with error handling
        let configRes;
        try {
            configRes = await fetch('/api/config');
        } catch (fetchError) {
            console.error('Failed to fetch config:', fetchError);
            throw new Error('Failed to load outreach config. Check server logs.');
        }

        if (!configRes.ok) {
            const errorText = await configRes.text();
            console.error('Config API error:', configRes.status, errorText);
            throw new Error('Failed to load outreach config. Check server logs.');
        }

        config = await configRes.json();
        console.log('[outreach] loaded config', config);

        // Load other data
        const [influencersRes, templatesRes] = await Promise.all([
            fetch('/api/influencers'),
            fetch('/api/templates')
        ]);

        if (!influencersRes.ok || !templatesRes.ok) {
            throw new Error('Failed to load influencers or templates');
        }

        influencers = await influencersRes.json();
        templates = await templatesRes.json();

        filteredInfluencers = [...influencers];
        updateStatusIndicator(`Loaded ${influencers.length} influencers`);

    } catch (error) {
        console.error('Error loading data:', error);
        updateStatusIndicator(`Error: ${error.message}`, 'error');

        // Show error UI instead of blank page
        showErrorUI(error.message);
    }
}

// Apply filters to influencer list
function applyFilters() {
    const statusFilter = elements.statusFilter.value;
    const platformFilter = elements.platformFilter.value;
    const searchTerm = elements.searchInput.value.toLowerCase();
    const limit = parseInt(elements.limitSelect.value);

    filteredInfluencers = influencers.filter(influencer => {
        // Status filter
        if (statusFilter && influencer.status !== statusFilter) return false;

        // Platform filter
        if (platformFilter && influencer.platform !== platformFilter) return false;

        // Search filter
        if (searchTerm) {
            const searchable = [
                influencer.displayName,
                influencer.handle,
                influencer.tags,
                influencer.platform
            ].join(' ').toLowerCase();

            if (!searchable.includes(searchTerm)) return false;
        }

        return true;
    });

    // Apply limit
    filteredInfluencers = filteredInfluencers.slice(0, limit);

    renderTable();
}

// Render the influencers table
function renderTable() {
    elements.tableBody.innerHTML = '';

    if (filteredInfluencers.length === 0) {
        const emptyRow = document.createElement('tr');
        emptyRow.innerHTML = '<td colspan="6" class="empty-message">No influencers match your filters</td>';
        elements.tableBody.appendChild(emptyRow);
        return;
    }

    filteredInfluencers.forEach(influencer => {
        const row = document.createElement('tr');
        row.className = 'influencer-row';
        row.dataset.id = influencer.id;

        const lastContact = influencer.lastContactedAt
            ? new Date(influencer.lastContactedAt).toLocaleDateString()
            : 'Never';

        row.innerHTML = `
            <td><span class="platform-badge platform-${influencer.platform}">${influencer.platform}</span></td>
            <td>${escapeHtml(influencer.displayName || '')}</td>
            <td>${escapeHtml(influencer.handle || '')}</td>
            <td><span class="status-badge status-${influencer.status}">${formatStatus(influencer.status)}</span></td>
            <td>${escapeHtml(influencer.tags || '')}</td>
            <td>${lastContact}</td>
        `;

        row.addEventListener('click', () => selectInfluencer(influencer));
        elements.tableBody.appendChild(row);
    });
}

// Select an influencer and open details panel
function selectInfluencer(influencer) {
    selectedInfluencer = influencer;

    // Update header
    elements.detailsName.textContent = influencer.displayName || influencer.handle || 'Unknown';

    // Populate form fields
    if (elements.editStatus) elements.editStatus.value = influencer.status || 'not_contacted';
    if (elements.editNotes) elements.editNotes.value = influencer.notes || '';
    if (elements.editRecentContent) elements.editRecentContent.value = influencer.recentContentHook || '';
    if (elements.editPersonalization) elements.editPersonalization.value = influencer.personalizationNotes || '';
    if (elements.editEmail) elements.editEmail.value = influencer.email || '';
    if (elements.editProfileUrl) elements.editProfileUrl.value = influencer.profileUrl || '';

    // Clear message area
    elements.messageTextarea.value = '';
    elements.charCounter.textContent = '0 characters';
    elements.warnings.innerHTML = '';

    // Show panel
    elements.detailsPanel.classList.add('open');
}

// Close details panel
function closeDetailsPanel() {
    selectedInfluencer = null;
    elements.detailsPanel.classList.remove('open');
}

// Open profile in new tab
function openProfile() {
    if (!selectedInfluencer?.profileUrl) {
        alert('No profile URL available');
        return;
    }
    window.open(selectedInfluencer.profileUrl, '_blank');
}

// Generate personalized message
async function generateMessage() {
    if (!selectedInfluencer) return;

    try {
        elements.generateMessageBtn.disabled = true;
        elements.generateMessageBtn.textContent = 'Generating...';

        const options = {
            templateType: elements.templateSelect.value,
            source: elements.sourceSelect.value,
            includePs: elements.includePsToggle.checked,
            forceNoEmojis: false
        };

        const response = await fetch('/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ influencer: selectedInfluencer, options })
        });

        if (!response.ok) throw new Error('Failed to generate message');

        const result = await response.json();

        elements.messageTextarea.value = result.message || '';
        updateCharCounter();

        // Show warnings
        elements.warnings.innerHTML = '';
        if (result.warnings && result.warnings.length > 0) {
            result.warnings.forEach(warning => {
                const div = document.createElement('div');
                div.className = 'warning';
                div.textContent = warning;
                elements.warnings.appendChild(div);
            });
        }

    } catch (error) {
        console.error('Error generating message:', error);
        elements.warnings.innerHTML = '<div class="warning">Failed to generate message</div>';
    } finally {
        elements.generateMessageBtn.disabled = false;
        elements.generateMessageBtn.textContent = '✨ Generate Message';
    }
}

// Copy message to clipboard and play beep
async function copyMessage() {
    const message = elements.messageTextarea.value;
    if (!message) return;

    try {
        await navigator.clipboard.writeText(message);
        playBeep();

        // Visual feedback
        const originalText = elements.copyMessageBtn.textContent;
        elements.copyMessageBtn.textContent = '✅ Copied!';
        elements.copyMessageBtn.classList.add('copied');

        setTimeout(() => {
            elements.copyMessageBtn.textContent = originalText;
            elements.copyMessageBtn.classList.remove('copied');
        }, 2000);

    } catch (error) {
        console.error('Failed to copy message:', error);
        alert('Failed to copy message to clipboard');
    }
}

// Mark influencer as contacted
function markContacted() {
    if (!selectedInfluencer) return;

    // Update status and timestamp
    selectedInfluencer.status = 'contacted';
    selectedInfluencer.lastContactedAt = new Date().toISOString();

    // Update form
    elements.editStatus.value = 'contacted';

    // Save changes
    scheduleAutosave();

    // Visual feedback
    elements.markContactedBtn.textContent = '✅ Marked!';
    setTimeout(() => {
        elements.markContactedBtn.textContent = '✅ Mark Contacted';
    }, 2000);
}

// Schedule autosave (debounced)
function scheduleAutosave() {
    if (saveTimeout) clearTimeout(saveTimeout);
    saveTimeout = setTimeout(() => {
        saveInfluencerChanges();
    }, 1000);
}

// Save changes to selected influencer
async function saveInfluencerChanges() {
    if (!selectedInfluencer) return;

    // Update influencer with form values
    if (elements.editStatus) selectedInfluencer.status = elements.editStatus.value;
    if (elements.editNotes) selectedInfluencer.notes = elements.editNotes.value;
    if (elements.editRecentContent) selectedInfluencer.recentContentHook = elements.editRecentContent.value;
    if (elements.editPersonalization) selectedInfluencer.personalizationNotes = elements.editPersonalization.value;
    if (elements.editEmail) selectedInfluencer.email = elements.editEmail.value;
    if (elements.editProfileUrl) selectedInfluencer.profileUrl = elements.editProfileUrl.value;

    try {
        const response = await fetch('/api/influencers', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(influencers)
        });

        if (!response.ok) throw new Error('Failed to save');

        updateStatusIndicator('Saved', 'success');

        // Refresh table to show changes
        applyFilters();

    } catch (error) {
        console.error('Error saving:', error);
        updateStatusIndicator('Save failed', 'error');
    }
}

// Update character counter
function updateCharCounter() {
    const text = elements.messageTextarea.value;
    const length = text.length;
    const platform = selectedInfluencer?.platform || 'other';
    const limit = config.charLimits?.[platform] || 450;

    elements.charCounter.textContent = `${length}/${limit} characters`;

    if (length > limit) {
        elements.charCounter.classList.add('over-limit');
    } else {
        elements.charCounter.classList.remove('over-limit');
    }
}

// Update status indicator
function updateStatusIndicator(message, type = '') {
    elements.statusIndicator.textContent = message;
    elements.statusIndicator.className = type;
}

function showErrorUI(message) {
    const mainContent = document.querySelector('main') || document.body;
    mainContent.innerHTML = `
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 50vh; padding: 2rem; text-align: center;">
            <div style="background: #fee2e2; border: 1px solid #fecaca; border-radius: 0.5rem; padding: 1.5rem; max-width: 500px;">
                <h2 style="color: #dc2626; margin: 0 0 1rem 0; font-size: 1.25rem;">Outreach Dashboard Error</h2>
                <p style="color: #991b1b; margin: 0; line-height: 1.5;">${message}</p>
                <button onclick="location.reload()" style="margin-top: 1rem; padding: 0.5rem 1rem; background: #dc2626; color: white; border: none; border-radius: 0.25rem; cursor: pointer;">
                    Retry
                </button>
            </div>
        </div>
    `;
}

// Utility functions
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatStatus(status) {
    return status.split('_').map(word =>
        word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
}

// Event listeners are now set up in setupEventListeners() function
