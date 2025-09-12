import { dispatch, select } from '@wordpress/data';
import apiFetch from '@wordpress/api-fetch';
import { headlineStudioStoreKey } from './dataStore';

/**
 * The structure for the post meta is created in the file wordpress-plugin/headline-studio/includes/utils/php
 *
 * Wordpress will not accept any keys or types that do not match the schema
 * Observe the register_post_meta hooks in the aforementioned php file for the types/schemas
 */
const POST_META_KEYS = {
  cos_headline_score: 'cos_headline_score',
  cos_seo_score: 'cos_seo_score',
  cos_headline_text: 'cos_headline_text',
  cos_last_analyzed_headline: 'cos_last_analyzed_headline',
  last_headline_score: 'last_headline_score',
  last_seo_score: 'last_seo_score',
  last_headline_text: 'last_headline_text',
  cos_headline_has_been_analyzed: 'cos_headline_has_been_analyzed',
};

function persistPostMeta(postMeta = {}, options = {}) {
  let postId;
  if (options.isClassicEditor) {
    postId = window.coscheduleHeadlineStudio?.classicEditorApp?.postId;
  } else {
    const { id } = select('core/editor').getCurrentPost();
    postId = id;
  }

  try {
    apiFetch({
      path: `/cos_headline_studio/v1/set_headline_post_meta/${postId}`,
      method: 'POST',
      data: postMeta,
    });
  } catch (err) {
    console.log(err);
  }
}

function editPostMeta(edits = {}, options = {}) {
  persistPostMeta(edits, options);
  return options.isClassicEditor ? null : dispatch('core/editor').editPost({ meta: { ...edits } }, options);
}

function savePost() {
  return dispatch('core/editor').savePost();
}

function isCurrentPostPublished() {
  return select('core/editor').isCurrentPostPublished();
}

function currentPostHasBeenAnalyzed() {
  const { cos_headline_has_been_analyzed: beenAnalyzed } = select('core/editor').getCurrentPostAttribute('meta');

  return beenAnalyzed;
}

// REFERENCE https://wholesomecode.ltd/getpostmeta-wordpress-block-editor-gutenberg-equivalent-is-geteditedpostattributemeta
function getEditedPostAttribute(attribute) {
  return select('core/editor').getEditedPostAttribute(attribute);
}

function getCurrentPostAttribute(attribute) {
  return select('core/editor').getCurrentPostAttribute(attribute);
}

function getPostData(isClassicEditor = false) {
  let postData = {};
  if (isClassicEditor) {
    postData.title = window.coscheduleHeadlineStudio.classicEditorApp.currentHeadline;
  } else if (typeof select('core/editor').getPostEdits().title !== 'undefined') {
    postData = select('core/editor').getPostEdits();
  } else {
    postData = select('core/editor').getCurrentPost();
  }

  return postData || {};
}

function getLastAnalyzedHeadline(isClassicEditor) {
  if (isClassicEditor) {
    return window.coscheduleHeadlineStudio?.classicEditorApp?.getLastAnalyzedHeadline();
  }
  return getEditedPostAttribute('meta').cos_last_analyzed_headline;
}

function setHeadlineStudioHasMounted() {
  return dispatch(headlineStudioStoreKey).setHeadlineStudioHasMounted();
}

export {
  POST_META_KEYS,
  editPostMeta,
  savePost,
  isCurrentPostPublished,
  currentPostHasBeenAnalyzed,
  getEditedPostAttribute,
  getCurrentPostAttribute,
  getPostData,
  getLastAnalyzedHeadline,
  setHeadlineStudioHasMounted,
  persistPostMeta,
};
