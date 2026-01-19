// Popup script for managing saved translations
let allTranslations = [];
let filteredTranslations = [];
let currentTab = 'all';

// Initialize popup
document.addEventListener('DOMContentLoaded', () => {
  loadTranslations();
  setupEventListeners();
});

// Setup event listeners
function setupEventListeners() {
  // Search input
  const searchInput = document.getElementById('searchInput');
  searchInput.addEventListener('input', (e) => {
    filterTranslations(e.target.value);
  });

  // Tab buttons
  const tabButtons = document.querySelectorAll('.tab-btn');
  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      tabButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentTab = btn.dataset.tab;
      filterTranslations(searchInput.value);
    });
  });

  // Export button
  document.getElementById('exportBtn').addEventListener('click', exportTranslations);

  // Clear all button
  document.getElementById('clearBtn').addEventListener('click', clearAllTranslations);
}

// Load translations from storage
function loadTranslations() {
  chrome.runtime.sendMessage({ action: "getTranslations" }, (response) => {
    if (response.success) {
      allTranslations = response.translations || [];
      updateStats();
      filterTranslations('');
    }
  });
}

// Update statistics
function updateStats() {
  const totalWords = allTranslations.length;
  const today = new Date().toDateString();
  const todayWords = allTranslations.filter(t => {
    const tDate = new Date(t.timestamp).toDateString();
    return tDate === today;
  }).length;

  document.getElementById('totalWords').textContent = totalWords;
  document.getElementById('todayWords').textContent = todayWords;
}

// Filter translations based on search and tab
function filterTranslations(searchQuery) {
  let filtered = [...allTranslations];

  // Apply tab filter
  if (currentTab === 'recent') {
    const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    filtered = filtered.filter(t => new Date(t.timestamp).getTime() > oneWeekAgo);
  } else if (currentTab === 'review') {
    // Show items that haven't been reviewed much
    filtered = filtered.filter(t => (t.reviewCount || 0) < 5);
  }

  // Apply search filter
  if (searchQuery.trim()) {
    const query = searchQuery.toLowerCase();
    filtered = filtered.filter(t => 
      t.original.toLowerCase().includes(query) || 
      t.translated.toLowerCase().includes(query)
    );
  }

  filteredTranslations = filtered;
  renderTranslations();
}

// Render translations to the UI
function renderTranslations() {
  const container = document.getElementById('translationsContainer');

  if (filteredTranslations.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">📚</div>
        <p>No translations found!</p>
        <p class="empty-hint">Try a different search or tab</p>
      </div>
    `;
    return;
  }

  container.innerHTML = filteredTranslations.map(translation => `
    <div class="translation-card" data-id="${translation.id}">
      <div class="card-header">
        <span class="card-date">${formatDate(translation.timestamp)}</span>
        <div class="card-actions">
          <button class="icon-btn" onclick="speakText('${escapeQuotes(translation.original)}')" title="Speak original">🔊</button>
          <button class="icon-btn" onclick="deleteTranslation('${translation.id}')" title="Delete">🗑️</button>
        </div>
      </div>
      <div class="card-content">
        <div class="text-row">
          <span class="text-label">${translation.sourceLang === 'vi' ? '🇻🇳' : '🇬🇧'}</span>
          <span class="text-content">${escapeHtml(translation.original)}</span>
        </div>
        <div class="text-row">
          <span class="text-label">${translation.targetLang === 'vi' ? '🇻🇳' : '🇬🇧'}</span>
          <span class="text-content translated">${escapeHtml(translation.translated)}</span>
        </div>
      </div>
    </div>
  `).join('');
}

// Format date for display
function formatDate(timestamp) {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return date.toLocaleDateString();
}

// Speak text using Web Speech API
window.speakText = function(text) {
  if ('speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    speechSynthesis.speak(utterance);
  }
};

// Delete a translation
window.deleteTranslation = function(id) {
  if (confirm('Delete this translation?')) {
    chrome.runtime.sendMessage({ 
      action: "deleteTranslation", 
      id: id 
    }, (response) => {
      if (response.success) {
        loadTranslations();
      }
    });
  }
};

// Export translations as JSON
function exportTranslations() {
  const dataStr = JSON.stringify(allTranslations, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `entension-translations-${new Date().toISOString().split('T')[0]}.json`;
  link.click();
  
  URL.revokeObjectURL(url);
}

// Clear all translations
function clearAllTranslations() {
  if (confirm('Are you sure you want to delete all translations? This cannot be undone!')) {
    chrome.storage.local.set({ translations: [] }, () => {
      allTranslations = [];
      loadTranslations();
    });
  }
}

// Utility functions
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function escapeQuotes(text) {
  return text.replace(/'/g, "\\'").replace(/"/g, '\\"');
}
