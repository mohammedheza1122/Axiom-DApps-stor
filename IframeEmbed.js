import { getHSEmbedToken } from '../../lib/constants';
import { buildIframeUrl } from '../../lib/embed-utils';
import { getPostData } from '../../lib/wp-data-utils';

function IframeEmbed({ isAnalyzed }) {
  const embedToken = getHSEmbedToken();
  const postData = getPostData();
  const { id: postId, type: postType, title: postTitle, guid: postUrl } = postData || {};

  const options = {
    embedToken,
    postType,
    postId,
    postTitle,
    postUrl,
    analyze: !isAnalyzed,
  };

  const iframeUrl = buildIframeUrl(options);

  return (
    <>
      <iframe
        id="headlinestudio-gutenberg-sidebar-iframe"
        className="headlinestudio-gutenberg-sidebar-iframe"
        src={iframeUrl}
      ></iframe>
    </>
  );
}

export default IframeEmbed;
