import { hsAppEndpoint, isDebug } from './constants.js';

function logError(...args) {
  if (isDebug) {
    // eslint-disable-next-line no-console
    console.error('ERROR: window-messaging:', ...args);
  }
}

function logDebug(...args) {
  if (isDebug) {
    // eslint-disable-next-line no-console
    console.log('DEBUG: window-messaging:', ...args);
  }
}

function addWindowMessageListener(listener) {
  window.addEventListener('message', async (message) => {
    try {
      logDebug('hs-wp onMessage:', JSON.stringify(message, null, 0));
      await listener(message);
    } catch (err) {
      logError('onMessage:', JSON.stringify(message, null, 0), (err && err.stack) || err);
    }
  });
}

/**
 * @param {Window} targetWindow
 * @param {object} message
 */
function postMessage(targetWindow, message) {
  logDebug('hs-wp postMessage:', JSON.stringify(message, null, 0));
  targetWindow.postMessage(message, hsAppEndpoint);
}

export { logError, logDebug, addWindowMessageListener, postMessage };
