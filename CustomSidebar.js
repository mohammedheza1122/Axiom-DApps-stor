import { PluginSidebar, PluginSidebarMoreMenuItem } from '@wordpress/edit-post';
import { PanelBody } from '@wordpress/components';
import { withSelect } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import PluginIframeContainer from './components/PluginIframeContainer.js';

const CustomSidebar = () => {
  return (
    <>
      <PluginSidebarMoreMenuItem target="hs-doc-sidebar">{__('Headline Studio', 'hs')}</PluginSidebarMoreMenuItem>

      <PluginSidebar name="hs-doc-sidebar" title={__('Headline Studio', 'hs')}>
        <PanelBody intialOpen={true}>
          <PluginIframeContainer />
        </PanelBody>
      </PluginSidebar>
    </>
  );
};

export default withSelect(() => {})(CustomSidebar);
