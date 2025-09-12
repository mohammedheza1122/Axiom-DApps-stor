function NotConnected() {
  const settingsUrl = `${window.coscheduleHeadlineStudio.hs_admin_url_base}/options-general.php?page=headline-studio-settings`;
  return (
    <>
      <div className="headlinestudio-gutenberg-sidebar-not-connected">
        <h5>No account connected</h5>
        <p>Run the Headline Studio Setup Wizard to complete your connection.</p>
        <a href={settingsUrl} className="hs-wp-go-to-settings hs-wp-button blue">
          Go To Settings
        </a>
      </div>
    </>
  );
}

export default NotConnected;
