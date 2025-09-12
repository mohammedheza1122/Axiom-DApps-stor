import jQuery from 'jquery';
import { addAction, doAction } from '@wordpress/hooks';
import apiFetch from '@wordpress/api-fetch';
import { initMessagingBus, handleTitleChange, reanalyzeFromExternal } from './lib/embed-utils.js';
import { editPostMeta, POST_META_KEYS } from './lib/wp-data-utils';

class ClassicEditor {
  headlineElement;
  errorMapping;

  constructor() {
    this.errorMapping = {
      HEADLINE_LIMIT_REACHED: ({ date, upgradeRedirect }) => {
        const metaBox = 'Headline limit reached';
        // eslint-disable-next-line operator-linebreak
        const banner =
          // eslint-disable-next-line no-template-curly-in-string
          `You’ve reached your basic headline limit. Your plan will reset on ${date}. Or upgrade now to Headline Studio Pro to continue analyzing. <a target="_blank" rel="noopener noreferrer" href="${upgradeRedirect}">Upgrade To Pro</a>`;

        return [metaBox, banner];
      },
      UNKNOWN: () => ['Something went wrong', 'Something went wrong'],
    };
  }

  setup() {
    this.setCurrentHeadline();
    initMessagingBus(true);
    this.onHeadlineStudioLoad = this.onHeadlineStudioLoad.bind(this);
    addAction('headline_studio_loaded', 'hs-sidebar', this.onHeadlineStudioLoad, 0);
    this.reanalyzeFromExternal = reanalyzeFromExternal;

    // eslint-disable-next-line no-undef
    apiFetch.use(apiFetch.createNonceMiddleware(wpSecurity.nonce));
  }

  get currentHeadline() {
    return this.headlineElement?.value;
  }

  get postId() {
    return window.coscheduleHeadlineStudio.currentPostId;
  }

  onHeadlineStudioLoad() {
    this.registerTitleChangeListener();
  }

  registerTitleChangeListener() {
    this.headlineElement.addEventListener('keyup', () => {
      this.onTitleChange();
    });
  }

  async onTitleChange() {
    const {
      last_headline_text: lastHeadlineText,
      last_headline_score: lastHeadlineScore,
      last_seo_score: lastSeoScore,
    } = await this.getLastAnalyzedHeadline();

    handleTitleChange(this.headlineElement.value);

    let newScore = 0;
    let newHeadlineText = '';
    let newSeoScore = 0;

    if (this.currentHeadline !== lastHeadlineText) {
      console.log('headlines do not match');
    }

    if (this.currentHeadline === lastHeadlineText) {
      console.log('headlines match');
      newHeadlineText = lastHeadlineText;
      newScore = lastHeadlineScore;
      newSeoScore = lastSeoScore;
    }

    editPostMeta(
      {
        [POST_META_KEYS.cos_headline_text]: newHeadlineText,
        [POST_META_KEYS.cos_headline_score]: newScore,
        [POST_META_KEYS.cos_seo_score]: newSeoScore,
        [POST_META_KEYS.cos_last_analyzed_headline]: {
          last_headline_text: lastHeadlineText,
          last_headline_score: lastHeadlineScore,
          last_seo_score: lastSeoScore,
        },
      },
      {
        isClassicEditor: true,
      },
    );

    return this.updatePublishMetaBoxValues(newScore, newSeoScore);
  }

  triggerAnalyzeFromPostMetaBox() {
    this.setMetaBoxButtonsToPending();
    this.reanalyzeFromExternal();
  }

  getMetaBoxNodes() {
    return {
      $headlineScore: jQuery('#meta-option-headline-score'),
      $seoScore: jQuery('#meta-option-seo-score'),
    };
  }

  setMetaBoxButtonsToPending() {
    const { $headlineScore, $seoScore } = this.getMetaBoxNodes();
    $headlineScore.text('Analyzing...');
    $seoScore.text('Analyzing...');
  }

  createAnalyzeButton(lastHeadlineText) {
    const reAnalyzeButton = document.createElement('a');
    reAnalyzeButton.role = 'button';
    reAnalyzeButton.innerHTML = lastHeadlineText ? 'Reanalyze' : 'Analyze';
    reAnalyzeButton.className = 'hide-if-no-js';

    if (this.currentHeadline) {
      reAnalyzeButton.href = '#';
      reAnalyzeButton.onclick = () => this.triggerAnalyzeFromPostMetaBox();
    }

    return reAnalyzeButton;
  }

  updateAlertBanner(data) {
    const errorCode = data?.state?.errors?.[0]?.extensions?.code ?? 'UNKNOWN';

    const banner = document.getElementsByClassName('classic-editor-alert-banner')[0];
    banner.style.display = 'block';
    banner.innerHTML = this.errorMapping[errorCode]?.(data?.state?.userData)[1];
  }

  updateMetaBoxValuesError(errorCode = 'UNKNOWN', data) {
    if (typeof errorCode !== 'string' || [null, undefined].includes(errorCode)) {
      // eslint-disable-next-line no-param-reassign
      errorCode = 'UNKNOWN';
    }

    const { $headlineScore, $seoScore } = this.getMetaBoxNodes();
    const errorText = this.errorMapping[errorCode](data?.state?.userData)[0];
    $headlineScore.html(errorText);
    $seoScore.html(errorText);
  }

  async updatePublishMetaBoxValues(newScore, newSeoScore) {
    const { $headlineScore, $seoScore } = this.getMetaBoxNodes();
    const { last_headline_text: lastHeadlineText } = await this.getLastAnalyzedHeadline();

    if (!newScore) {
      $headlineScore.html(this.createAnalyzeButton(lastHeadlineText));
    } else {
      $headlineScore.html(`<strong>${newScore}</strong>`);
    }
    if (!newSeoScore) {
      $seoScore.html(this.createAnalyzeButton(lastHeadlineText));
    } else {
      $seoScore.html(`<strong>${newSeoScore}</strong>`);
    }
  }

  async getPostMeta() {
    let postMeta;

    if (!this.postId) return null;
    try {
      postMeta = await wp.apiFetch({
        path: `/cos_headline_studio/v1/get_headline_post_meta/${this.postId}`,
        method: 'GET',
      });
    } catch (err) {
      console.error('Could not fetch post meta');
    }

    return postMeta;
  }

  async getLastAnalyzedHeadline() {
    const postMeta = await this.getPostMeta();
    return postMeta?.cos_last_analyzed_headline;
  }

  setCurrentHeadline() {
    this.headlineElement = document.querySelector('#titlewrap > input[id="title"]');
  }
}

jQuery(() => {
  window.coscheduleHeadlineStudio.classicEditorApp = new ClassicEditor();
  window.coscheduleHeadlineStudio.classicEditorApp.setup();
});

jQuery(window).on('load', () => {
  jQuery.when(jQuery.ready).then(() => {
    doAction('headline_studio_loaded');
  });
});
