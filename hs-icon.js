import { withSelect } from '@wordpress/data';
import { getScoreState } from '../../lib/embed-utils';
import { getEditedPostAttribute } from '../../lib/wp-data-utils';

// must import the index file to kick off initialization of redux store
import { headlineStudioStoreKey } from '../../lib/data/index.js';

const { createElement } = wp.element;

const HeadlineStudioIcon = ({ score }) => {
  return createElement(
    'div',
    { className: `button-score-container ${getScoreState(score)}` },
    createElement(
      'svg',
      {
        width: 20,
        height: 20,
      },
      createElement('path', {
        d: 'M17.081,0.44L17.081,0.4L11.971,6.442L11.971,3.233C9.933,3.233 8.041,4.339 8.041,6.875L8.041,11.073L6.812,12.529L6.812,5.53C4.777,5.53 2.891,6.639 2.891,9.172L2.891,19.6C4.929,19.6 6.821,18.494 6.821,15.958L6.821,14.957L8.046,13.51L8.046,17.3C10.081,17.3 11.974,16.194 11.974,13.658L11.974,8.861L13.182,7.436L13.182,14.909C15.217,14.909 17.109,13.8 17.109,11.267L17.109,0.4L17.081,0.44Z',
      }),
    ),
    createElement('span', { text: score }, score),
  );
};

export default withSelect((select) => {
  const { cos_headline_score: headlineScore } = getEditedPostAttribute('meta');
  const headlineStudioHasMounted = select(headlineStudioStoreKey)?.getHeadlineStudioHasMounted();

  const score = headlineStudioHasMounted ? headlineScore : null;

  return { score };
})(HeadlineStudioIcon);
