// Background service worker for the extension
// Handles extension lifecycle events and downloads

// Listen for extension installation
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('Page to Markdown extension installed successfully');
  } else if (details.reason === 'update') {
    console.log('Page to Markdown extension updated');
  }
});

// Listen for download events to handle errors
chrome.downloads.onChanged.addListener((delta) => {
  if (delta.error) {
    console.error('Download error:', delta.error);
  } else if (delta.state && delta.state.current === 'complete') {
    console.log('Download completed successfully');
  }
});

// Error handler for any unhandled errors
self.addEventListener('error', (event) => {
  console.error('Background script error:', event.error);
});

// Handle messages from popup or content scripts if needed
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  try {
    if (request.action === 'ping') {
      sendResponse({ status: 'ok' });
    }
  } catch (error) {
    console.error('Message handling error:', error);
    sendResponse({ status: 'error', message: error.message });
  }
  return true; // Keep message channel open for async response
});
