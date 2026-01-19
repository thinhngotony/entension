// Content script for in-page translation display
let translationBubble = null;

// Listen for messages from background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "translate") {
    showTranslationUI(request.text);
  }
});

// Show translation UI bubble
function showTranslationUI(text) {
  // Remove existing bubble if any
  if (translationBubble) {
    translationBubble.remove();
  }
  
  // Create bubble container
  translationBubble = document.createElement('div');
  translationBubble.className = 'entension-bubble';
  translationBubble.innerHTML = `
    <div class="entension-bubble-content">
      <div class="entension-bubble-header">
        <span class="entension-title">⚡ Entension</span>
        <button class="entension-close">×</button>
      </div>
      <div class="entension-bubble-body">
        <div class="entension-loading">
          <div class="entension-spinner"></div>
          <span>Translating...</span>
        </div>
      </div>
    </div>
  `;
  
  // Position near the selection with viewport boundary checks
  const selection = window.getSelection();
  if (selection.rangeCount > 0) {
    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    
    let top = window.scrollY + rect.bottom + 10;
    let left = window.scrollX + rect.left;
    
    // Ensure bubble stays within viewport
    const bubbleWidth = 320; // min-width from CSS
    const bubbleHeight = 300; // estimated height
    
    // Keep within horizontal bounds
    if (left + bubbleWidth > window.innerWidth) {
      left = window.innerWidth - bubbleWidth - 10;
    }
    if (left < 10) {
      left = 10;
    }
    
    // Keep within vertical bounds - show above if needed
    if (top + bubbleHeight > window.scrollY + window.innerHeight) {
      top = window.scrollY + rect.top - bubbleHeight - 10;
      // If still out of bounds, just position at bottom with some margin
      if (top < window.scrollY + 10) {
        top = window.scrollY + window.innerHeight - bubbleHeight - 10;
      }
    }
    
    translationBubble.style.top = `${top}px`;
    translationBubble.style.left = `${left}px`;
  }
  
  document.body.appendChild(translationBubble);
  
  // Add close button handler
  const closeBtn = translationBubble.querySelector('.entension-close');
  closeBtn.addEventListener('click', () => {
    translationBubble.remove();
    translationBubble = null;
  });
  
  // Fetch translation
  chrome.runtime.sendMessage({
    action: "translateText",
    text: text,
    sourceLang: "auto",
    targetLang: "vi"
  }, (response) => {
    if (response.success) {
      displayTranslation(response.translation);
    } else {
      displayError(response.error || "Translation failed");
    }
  });
}

// Display translation result
function displayTranslation(translation) {
  if (!translationBubble) return;
  
  const bodyDiv = translationBubble.querySelector('.entension-bubble-body');
  bodyDiv.innerHTML = `
    <div class="entension-result">
      <div class="entension-text-block">
        <div class="entension-label">${translation.sourceLang === 'vi' ? '🇻🇳 Vietnamese' : '🇬🇧 English'}</div>
        <div class="entension-text-original">${escapeHtml(translation.original)}</div>
      </div>
      <div class="entension-arrow">→</div>
      <div class="entension-text-block">
        <div class="entension-label">${translation.targetLang === 'vi' ? '🇻🇳 Vietnamese' : '🇬🇧 English'}</div>
        <div class="entension-text-translated">${escapeHtml(translation.translated)}</div>
      </div>
      <button class="entension-save-btn">💾 Save</button>
    </div>
  `;
  
  // Add save button handler
  const saveBtn = translationBubble.querySelector('.entension-save-btn');
  saveBtn.addEventListener('click', () => {
    chrome.runtime.sendMessage({
      action: "saveTranslation",
      data: translation
    }, (response) => {
      if (response.success) {
        saveBtn.textContent = "✓ Saved!";
        saveBtn.disabled = true;
        saveBtn.classList.add('saved');
      }
    });
  });
}

// Display error message
function displayError(error) {
  if (!translationBubble) return;
  
  const bodyDiv = translationBubble.querySelector('.entension-bubble-body');
  bodyDiv.innerHTML = `
    <div class="entension-error">
      <span>❌ ${escapeHtml(error)}</span>
    </div>
  `;
}

// Utility function to escape HTML
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Close bubble when clicking outside
document.addEventListener('click', (e) => {
  if (translationBubble && !translationBubble.contains(e.target)) {
    translationBubble.remove();
    translationBubble = null;
  }
});
