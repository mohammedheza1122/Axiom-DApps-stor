/* eslint-disable camelcase */
import { useState, useEffect } from '@wordpress/element';
import { subscribe } from '@wordpress/data';
import { hasEmbedToken, initMessagingBus, handleTitleChange } from '../../lib/embed-utils';
import {
  savePost,
  getPostData,
  getEditedPostAttribute,
  editPostMeta,
  currentPostHasBeenAnalyzed,
  getLastAnalyzedHeadline,
  POST_META_KEYS,
} from '../../lib/wp-data-utils';
import NotConnected from './NotConnected.js';
import AnalyzeButtonPanel from './AnalyzeButtonPanel.js';
import IframeEmbed from './IframeEmbed.js';

let MOUNTED = false;
let canSetOldTitle = false; // flag variable used to prevent the subscribe hook from setting the title endlessly
let currentPostTitle;

function PluginIframeContainer() {
  if (!hasEmbedToken()) {
    return NotConnected();
  }

  const [isAnalyzed, setIsAnalyzed] = useState(false);
  const [showAnalyzeButton, setShowAnalyzeButton] = useState(true);

  const { id: postId, type: postType, title: postTitle, guid: postUrl } = getPostData();

  const onAnalyzeClick = () => {
    // set flag to determine if it has been analyzed
    editPostMeta({ [POST_META_KEYS.cos_headline_has_been_analyzed]: true });

    // must wait until after post saves, because the embedSourceId will be null
    savePost().then(() => setShowAnalyzeButton(false));
  };

  useEffect(() => {
    const hasBeenAnalyzed = currentPostHasBeenAnalyzed();

    setIsAnalyzed(hasBeenAnalyzed);
    setShowAnalyzeButton(!hasBeenAnalyzed);
  }, []);

  if (showAnalyzeButton) {
    return (
      <>
        {' '}
        <AnalyzeButtonPanel onAnalyzeClick={onAnalyzeClick} />{' '}
      </>
    );
  }

  // Don't emit title change events until the messaging bus has been initialized
  if (!MOUNTED) {
    initMessagingBus();

    currentPostTitle = postTitle;
    MOUNTED = true;

    // can't use useEffect, must use references because subscribe is a closure
    subscribe(() => {
      const maybeEditedPostTitle = getEditedPostAttribute('title');
      const { last_headline_text, last_headline_score, last_seo_score } = getLastAnalyzedHeadline();

      if (currentPostTitle !== maybeEditedPostTitle) {
        currentPostTitle = maybeEditedPostTitle;
        canSetOldTitle = true;

        handleTitleChange(currentPostTitle);

        editPostMeta({
          [POST_META_KEYS.cos_headline_text]: '',
          [POST_META_KEYS.cos_headline_score]: 0,
          [POST_META_KEYS.cos_seo_score]: 0,
          [POST_META_KEYS.cos_last_analyzed_headline]: {
            last_headline_text,
            last_headline_score,
            last_seo_score,
          },
        });
      } else if (last_headline_text === currentPostTitle && canSetOldTitle) {
        // if titles match, set all fields to most recent headline state
        canSetOldTitle = false;

        editPostMeta({
          [POST_META_KEYS.cos_headline_text]: last_headline_text,
          [POST_META_KEYS.cos_headline_score]: last_headline_score,
          [POST_META_KEYS.cos_seo_score]: last_seo_score,
        });
      }
    });
  }

  return (
    <>
      <div className="headlinestudio-gutenberg-sidebar-iframe-container">
        <IframeEmbed isAnalyzed={isAnalyzed} />
      </div>
    </>
  );
}

export default PluginIframeContainer;
