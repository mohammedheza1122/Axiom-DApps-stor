/* eslint-disable no-console */
import { addWindowMessageListener, logDebug, logError, postMessage } from './window-messaging';
import {
  getPostData,
  persistPostMeta,
  editPostMeta,
  getCurrentPostAttribute,
  getLastAnalyzedHeadline,
  setHeadlineStudioHasMounted,
  POST_META_KEYS,
} from './wp-data-utils';
import { hsAppEndpoint, getHSEmbedToken } from './constants.js';

function hasEmbedToken() {
  return !!getHSEmbedToken();
}

function getHeadlinesImportUrl() {
  return new URL(`${hsAppEndpoint}/headlines/import`);
}

/**
 * Generates the src url for the iframe embed.
 *
 * @param {object} options
 * @param {string} options.embedToken
 * @param {string} options.postType
 * @param {number|string} options.postId
 * @param {string} options.postTitle
 * @param {string} [options.postUrl]
 * @param {boolean} [options.analyze]
 * @returns {string} iframeUrl
 */
function buildIframeUrl(options) {
  const { embedToken, postType, postId, postTitle, postUrl, analyze } = options || {};

  const headlinesImportUrl = getHeadlinesImportUrl();
  const { searchParams } = headlinesImportUrl;
  searchParams.append('platform', 'wordpress');
  searchParams.append('source', 'WordPress'); // originType
  if (embedToken) searchParams.append('embedToken', embedToken);
  if (postTitle) searchParams.append('headline', postTitle);
  if (postType) searchParams.append('embedSourceType', postType);
  if (postId) searchParams.append('embedSourceId', postId);
  // if (postUrl) searchParams.append('url', postUrl); // originUrl // TODO: window.location.href vs postUrl handling
  // searchParams.append('url', window.location.href); // originUrl // TODO: window.location.href vs postUrl handling
  if (analyze) searchParams.append('analyze', 'true');
  return headlinesImportUrl.toString();
}

function safelyPostMessage(message) {
  const hsIframe = document.getElementById('headlinestudio-gutenberg-sidebar-iframe');

  if (hsIframe) {
    try {
      postMessage(hsIframe.contentWindow, message);
    } catch (err) {
      console.error(err);
    }
  } else {
    console.log('handleTitleChange: hsIframe not found');
  }
}

function reanalyzeFromExternal() {
  const message = {
    type: 'REANALYZE_FROM_EXTERNAL',
  };

  safelyPostMessage(message);
}

function handleTitleChange(title) {
  const message = {
    type: 'UPDATE_STATE',
    state: {
      headline: {
        text: title,
      },
    },
  };

  safelyPostMessage(message);
}

function handleErrorState(data, isClassicEditor) {
  logError('Received error code:', data?.state?.errors?.[0]?.extensions?.code ?? 'UNKNOWN');

  if (isClassicEditor) {
    window.coscheduleHeadlineStudio.classicEditorApp.updateAlertBanner(data);
    window.coscheduleHeadlineStudio.classicEditorApp.updateMetaBoxValuesError(
      data?.state?.errors?.[0]?.extensions?.code ?? 'UNKNOWN',
      data,
    );
  }
}

async function handleUpdateState(data, isClassicEditor) {
  try {
    const {
      state: { fromApp, context },
      state: {
        headline: { text: title, headlineGroupId, headlineId, score: headlineScore, seoScore, isInitialAnalyze } = {},
      } = {},
    } = data || {};

    const lastAnalyzedHeadline = await getLastAnalyzedHeadline(isClassicEditor);
    if (fromApp && context === 'competitionAnalysis') {
      editPostMeta(
        {
          [POST_META_KEYS.cos_headline_score]: headlineScore,
          [POST_META_KEYS.cos_headline_text]: title,
          [POST_META_KEYS.cos_seo_score]: seoScore,
          [POST_META_KEYS.cos_last_analyzed_headline]: {
            [POST_META_KEYS.last_headline_score]: headlineScore,
            [POST_META_KEYS.last_headline_text]: title,
            [POST_META_KEYS.last_seo_score]: seoScore,
          },
          [POST_META_KEYS.cos_headline_has_been_analyzed]: true,
        },
        {
          isClassicEditor,
        },
      );
      if (isClassicEditor && window.coscheduleHeadlineStudio?.classicEditorApp) {
        window.coscheduleHeadlineStudio.classicEditorApp.updatePublishMetaBoxValues(headlineScore, seoScore);
      }
      return;
    }

    if (fromApp && headlineScore && title) {
      editPostMeta(
        {
          [POST_META_KEYS.cos_headline_score]: headlineScore,
          [POST_META_KEYS.cos_headline_text]: title,
          [POST_META_KEYS.cos_last_analyzed_headline]: {
            ...lastAnalyzedHeadline,
            [POST_META_KEYS.last_headline_score]: headlineScore,
            [POST_META_KEYS.last_headline_text]: title,
          },
          [POST_META_KEYS.cos_headline_has_been_analyzed]: true,
        },
        {
          isClassicEditor,
        },
      );
    }
  } catch (err) {
    console.error(err);
  }
}

function handleAuthState(data) {
  // setup function for auth
}

async function handleEmbedState(data, isClassicEditor) {
  const { action, isMounted } = data.state;
  if (action === 'reanalyzed') {
    logDebug('HS-WP reanalyze:', data);
    // potentially need for later
  }

  if (action === 'mountStatus') {
    logDebug('HS-WP mountStatus:', data);
    const { title } = getPostData(isClassicEditor);
    const { text } = data.state.headline;

    if (!isClassicEditor) setHeadlineStudioHasMounted();

    // once mounted, if the text does not match, change the iframe title to match the post title
    if (isMounted && title !== text) {
      handleTitleChange(title, isClassicEditor);
      const lastAnalyzedHeadline = await getLastAnalyzedHeadline(isClassicEditor);
      editPostMeta(
        {
          [POST_META_KEYS.cos_headline_score]: 0,
          [POST_META_KEYS.cos_seo_score]: 0,
          [POST_META_KEYS.cos_headline_text]: '',
          [POST_META_KEYS.cos_last_analyzed_headline]: lastAnalyzedHeadline,
        },
        {
          isClassicEditor,
        },
      );
    }
  }
}

function initMessagingBus(isClassicEditor = false) {
  addWindowMessageListener((event) => {
    const { data, origin } = event;
    const { type } = data;

    if (!origin.includes('coschedule.com') && origin !== window.origin) {
      return;
    }

    logDebug('HS-WP Incoming event:', origin, data);

    if (type === 'UPDATE_ERROR') {
      handleErrorState(data, isClassicEditor);
    }

    if (type === 'UPDATE_STATE') {
      logDebug('HS-WP handleUpdateState:', data);
      handleUpdateState(data, isClassicEditor);
    }

    if (type === 'AUTH_STATE') {
      logDebug('HS-WP handleAuthState:', data);
      handleAuthState(data);
    }

    if (type === 'EMBED_STATE') {
      handleEmbedState(data, isClassicEditor);
    }

    if (type === 'COS_SAVE_POST_META') {
      const postData = getPostData();
      logDebug('HS-WP savePost:', postData);
      const { meta: postMeta } = postData;

      if (postMeta) {
        persistPostMeta(postMeta);
      }
    }
  });
}

function getScoreState(score) {
  if (!score) {
    return 'neutral';
  }

  if (score >= 70) {
    // 70-100
    return 'good';
  }

  if (score >= 40) {
    // 40-69
    return 'warning';
  }

  if (score <= 39) {
    // 0-39
    return 'issue';
  }

  return 'neutral';
}

export {
  hasEmbedToken,
  getHeadlinesImportUrl,
  buildIframeUrl,
  initMessagingBus,
  handleUpdateState,
  handleErrorState,
  handleAuthState,
  handleTitleChange,
  getScoreState,
  reanalyzeFromExternal,
};
