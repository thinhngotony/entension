// Background service worker for context menu and translation
chrome.runtime.onInstalled.addListener(() => {
  // Create context menu for translation
  chrome.contextMenus.create({
    id: "translateText",
    title: "Translate with Entension",
    contexts: ["selection"]
  });
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "translateText" && info.selectionText) {
    const selectedText = info.selectionText.trim();
    
    // Send message to content script to show translation
    chrome.tabs.sendMessage(tab.id, {
      action: "translate",
      text: selectedText
    });
  }
});

// Handle messages from content script and popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "translateText") {
    translateText(request.text, request.sourceLang, request.targetLang)
      .then(translation => {
        sendResponse({ success: true, translation: translation });
      })
      .catch(error => {
        sendResponse({ success: false, error: error.message });
      });
    return true; // Keep channel open for async response
  } else if (request.action === "saveTranslation") {
    saveTranslation(request.data)
      .then(() => {
        sendResponse({ success: true });
      })
      .catch(error => {
        sendResponse({ success: false, error: error.message });
      });
    return true;
  } else if (request.action === "getTranslations") {
    getTranslations()
      .then(translations => {
        sendResponse({ success: true, translations: translations });
      })
      .catch(error => {
        sendResponse({ success: false, error: error.message });
      });
    return true;
  } else if (request.action === "deleteTranslation") {
    deleteTranslation(request.id)
      .then(() => {
        sendResponse({ success: true });
      })
      .catch(error => {
        sendResponse({ success: false, error: error.message });
      });
    return true;
  } else if (request.action === "clearAllTranslations") {
    clearAllTranslations()
      .then(() => {
        sendResponse({ success: true });
      })
      .catch(error => {
        sendResponse({ success: false, error: error.message });
      });
    return true;
  }
});

// Translation function using a simple API
async function translateText(text, sourceLang = "auto", targetLang = "vi") {
  try {
    // Detect if text is Vietnamese or English
    const isVietnamese = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i.test(text);
    
    if (sourceLang === "auto") {
      sourceLang = isVietnamese ? "vi" : "en";
      targetLang = isVietnamese ? "en" : "vi";
    }
    
    // Use MyMemory Translation API (free, no API key required)
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${sourceLang}|${targetLang}`;
    
    // Add timeout for better error handling
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);
    const data = await response.json();
    
    if (data.responseStatus === 200 && data.responseData) {
      return {
        original: text,
        translated: data.responseData.translatedText,
        sourceLang: sourceLang,
        targetLang: targetLang
      };
    } else {
      throw new Error("Translation failed");
    }
  } catch (error) {
    console.error("Translation error:", error);
    throw error;
  }
}

// Save translation to storage
async function saveTranslation(translationData) {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(['translations'], (result) => {
      const translations = result.translations || [];
      
      // Add timestamp and ID
      const newTranslation = {
        id: Date.now().toString(),
        ...translationData,
        timestamp: new Date().toISOString(),
        reviewCount: 0
      };
      
      translations.unshift(newTranslation);
      
      chrome.storage.local.set({ translations: translations }, () => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve();
        }
      });
    });
  });
}

// Get all translations
async function getTranslations() {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(['translations'], (result) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve(result.translations || []);
      }
    });
  });
}

// Delete a translation
async function deleteTranslation(id) {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(['translations'], (result) => {
      const translations = result.translations || [];
      const filtered = translations.filter(t => t.id !== id);
      
      chrome.storage.local.set({ translations: filtered }, () => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve();
        }
      });
    });
  });
}

// Clear all translations
async function clearAllTranslations() {
  return new Promise((resolve, reject) => {
    chrome.storage.local.set({ translations: [] }, () => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve();
      }
    });
  });
}
