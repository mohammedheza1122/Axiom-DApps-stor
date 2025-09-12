<?php
/**
 * Plugin Name: Headline Analyzer
 * Plugin URI: https://headlines.coschedule.com
 * Description: A headline analyzer from CoSchedule that helps you confidently create headlines that drive maximum traffic, engagement, & SEO.
 * Version: 1.3.6
 * Requires at least: 5.6
 * Requires PHP: 7.0
 * Author: CoSchedule
 * Author URI: https://coschedule.com
 * License: GPLv2 or later
 * License URI: http://www.gnu.org/licenses/gpl-2.0.html
 *
 * @package Headline Studio
 */

// Exit if accessed directly.
defined( 'ABSPATH' ) || exit;

/**
 * Define the plugin constants.
 */
function cos_headlinestudio_define_constants() {
	define( 'HEADLINE_STUDIO_PLUGIN_FILE', __FILE__ );
	define( 'HEADLINE_STUDIO_PLUGIN_PATH', dirname( HEADLINE_STUDIO_PLUGIN_FILE ) . '/' );
	define( 'HEADLINE_STUDIO_PLUGIN_URL', plugins_url( '', HEADLINE_STUDIO_PLUGIN_FILE ) . '/' );
	define( 'HEADLINE_STUDIO_POST_META_KEY', 'cos_headlinestudio_analysis' );
	define(
		'HEADLINE_STUDIO_POST_META_KEYS',
		array(
			'cos_headline_score',
			'cos_seo_score',
			'cos_headline_text',
			'cos_last_analyzed_headline',
			'cos_headline_has_been_analyzed',
		)
	);
}

cos_headlinestudio_define_constants();

// Load Required Files.
require_once plugin_dir_path( __FILE__ ) . 'includes/utils.php';
require_once plugin_dir_path( __FILE__ ) . 'includes/settings-page.php';
require_once plugin_dir_path( __FILE__ ) . 'includes/custom-posts-columns.php';
require_once plugin_dir_path( __FILE__ ) . 'includes/custom-endpoints.php';
require_once plugin_dir_path( __FILE__ ) . 'includes/onboarding.php';

/**
 * Initializes Plugin Setup
 *
 * @return void
 */
function cos_headlinestudio_setup() {
	// Register custom post meta for both front-end and admin.
	cos_headlinestudio_register_post_meta();

	// All setup past this point is for the admin dashboard only.
	if ( ! is_admin() ) {
		return;
	}

	cos_headlinestudio_gutenberg_setup();
	cos_headlinestudio_classic_editor_setup();
}

add_action( 'init', 'cos_headlinestudio_setup' );
add_action( 'register_activation_hook', 'flush_rewrite_rules' );
add_action( 'rest_api_init', 'cos_headlinestudio_register_custom_endpoints' );

/**
 * Sets up Gutenberg editor
 *
 * @return void
 */
function cos_headlinestudio_gutenberg_setup() {
	$block_editor_not_available = ! function_exists( 'register_block_type' );
	$is_not_connected           = ! cos_headlinestudio_is_connected();
	if ( $block_editor_not_available || $is_not_connected ) {
		return;
	}

	register_block_type( 'headlinestudio/gutenberg-sidebar', array( 'editor_script' => 'hs-sidebar' ) );
}

/**
 * Initializes Scores in Publish metabox
 *
 * @return void
 */
function add_publish_meta_options() {
	global $post;

	$cos_headline_score = cos_headline_studio_get_headline_field_value( $post->ID, $post->post_title, 'cos_headline_score' );
	$cos_seo_score      = cos_headline_studio_get_headline_field_value( $post->ID, $post->post_title, 'cos_seo_score' );
	$post_title = $post->post_title;

	function createAnalyzeButton($score, $post_title) {
		if ($score) {
			echo '<strong>'.$score.'</strong>';
			return;
		}
    if ($post_title) {
	    echo '
            <a
                class="hide-if-no-js"
                role="button"
                href="#"
                onclick="window.coscheduleHeadlineStudio.classicEditorApp.triggerAnalyzeFromPostMetaBox()"
            >
                <span>Analyze</span>
            </a>
        ';
      return;
    }
	  echo '
            <a
                class="hide-if-no-js disabled"
                role="button"
                disabled="disabled"
            >
                <span>Analyze</span>
            </a>
        ';
	}

	?>
  	<div class="misc-pub-section misc-pub-section-last misc-pub-section-headline-studio">
			<svg width="20" height="20">
				<path d="M17.081,0.44L17.081,0.4L11.971,6.442L11.971,3.233C9.933,3.233 8.041,4.339 8.041,6.875L8.041,11.073L6.812,12.529L6.812,5.53C4.777,5.53 2.891,6.639 2.891,9.172L2.891,19.6C4.929,19.6 6.821,18.494 6.821,15.958L6.821,14.957L8.046,13.51L8.046,17.3C10.081,17.3 11.974,16.194 11.974,13.658L11.974,8.861L13.182,7.436L13.182,14.909C15.217,14.909 17.109,13.8 17.109,11.267L17.109,0.4L17.081,0.44Z"></path>
			</svg>
			<span>Headline Score: &nbsp;</span><span id="meta-option-headline-score"><?php createAnalyzeButton($cos_headline_score, $post_title) ?></span>
	  </div>
		<div class="misc-pub-section misc-pub-section-last misc-pub-section-headline-studio">
			<svg width="20" height="20">
				<path d="M17.081,0.44L17.081,0.4L11.971,6.442L11.971,3.233C9.933,3.233 8.041,4.339 8.041,6.875L8.041,11.073L6.812,12.529L6.812,5.53C4.777,5.53 2.891,6.639 2.891,9.172L2.891,19.6C4.929,19.6 6.821,18.494 6.821,15.958L6.821,14.957L8.046,13.51L8.046,17.3C10.081,17.3 11.974,16.194 11.974,13.658L11.974,8.861L13.182,7.436L13.182,14.909C15.217,14.909 17.109,13.8 17.109,11.267L17.109,0.4L17.081,0.44Z"></path>
			</svg>
			<span>SEO Score: &nbsp;</span><span id="meta-option-seo-score"><?php createAnalyzeButton($cos_seo_score, $post_title) ?></span>
		</div>
	<?php
}

/*
 * Add the extra options to the 'Publish' box
 */
add_action( 'post_submitbox_misc_actions', 'add_publish_meta_options' );

/**
 * Set up Headline Studio for the Classic editor
 */
function cos_headlinestudio_classic_editor_setup() {
	cos_headlinestudio_register_admin_hooks();
	cos_headlinestudio_register_post_save_hooks();
}

function is_classic_editor_plugin_active() {
  if ( ! function_exists( 'is_plugin_active' ) ) {
    include_once( ABSPATH . 'wp-admin/includes/plugin.php' );
  }

  return is_plugin_active( 'classic-editor/classic-editor.php' );
}

// Add warning banner to WordPress admin
function classic_editor_warning_banner() {

  if( !is_classic_editor_plugin_active() ) {
    return;
  }

  // Print the banner HTML
  echo '<div class="classic-editor-alert-banner update-nag notice notice-warning inline" style="display: none;">';
  echo '</div>';
}

add_action('admin_notices', 'classic_editor_warning_banner');
/**
 * Display the metabox content
 *
 * @param object $post the post under analysis.
 */
function cos_headlinestudio_metabox( $post ) {
	$embed_token = get_option( 'cos_headlinestudio_embed_token' );

	if ( ! $embed_token ) {
		?>
			<div style="display: flex; flex-direction: column; padding: 10px 10px 30px;" className="headlinestudio-gutenberg-sidebar-not-connected">
				<h5>No account connected</h5>
				<p>Run the Headline Studio Setup Wizard to complete your connection.</p>
				<a style="margin: 0 auto;" class="hs-wp-button blue" href="<?php echo esc_url( get_admin_url() ) . 'options-general.php?page=headline-studio-settings'; ?>">Go To Settings</a>
			</div>
		<?php
		return;
	}

	$post_id      = $post->ID;
	$query_params = array(
		'platform'        => 'wordpress',
		'source'          => 'WordPress',
		'embedToken'      => $embed_token,
		'headline'        => $post->post_title,
		'embedSourceType' => 'post',
		'embedSourceId'   => rawurlencode( $post_id ),
		'wordPressEditor' => 'classic',
	);

	$url = 'https://headlines.coschedule.com/headlines/import?' . http_build_query( $query_params );

	?>
		<script type="text/JavaScript">
			window.coscheduleHeadlineStudio.currentPostId = Number('<?php echo $post_id; ?>');
		</script>
		<iframe id='headlinestudio-gutenberg-sidebar-iframe' src='<?php echo esc_url_raw( $url ); ?>' width='100%' style='border:none; height: 700px'></iframe>
	<?php
}

/**
 * Add metabox
 */
function cos_headlinestudio_meta_box_setup() {
	add_meta_box(
		'cos-headline-studio',              // Unique ID.
		'Headline Studio',                  // Title.
		'cos_headlinestudio_metabox',       // Callback function.
		null,                               // Admin page (or post type).
		'side',                             // Context.
		'default',                          // Priority.
		'post'                              // Content callback.
	);
}

/**
 * Adds action to insert a meta box
 */
function cos_headlinestudio_meta_box_action() {
	$current_screen = get_current_screen();
	if ( ! $current_screen->is_block_editor ) {
		add_action( 'add_meta_boxes', 'cos_headlinestudio_meta_box_setup' );
	}
}

/**
 * Add meta box setup actions to post edit screen.
 */
function cos_headlinestudio_register_admin_hooks() {
	add_action( 'load-post.php', 'cos_headlinestudio_meta_box_action' );
	add_action( 'load-post-new.php', 'cos_headlinestudio_meta_box_action' );
	add_action( 'load-page.php', 'cos_headlinestudio_meta_box_action' );
	add_action( 'load-page-new.php', 'cos_headlinestudio_meta_box_action' );
}


/**
 * Registers the hooks to run after a post is saved
 */
function cos_headlinestudio_register_post_save_hooks() {
	add_action( 'save_post', 'cos_headlinestudio_reconcile_headline_info', 10, 3 );
}

/**
 * When a post is saved, reset the headline scores if the title has changed
 *
 * @param int     $post_id The post id.
 * @param WP_Post $post The post being saved.
 * @param bool    $update Whether this is an existing post being updated.
 */
function cos_headlinestudio_reconcile_headline_info( $post_id, $post, $update ) {
	$current_headline_text = get_post_meta( $post_id, 'cos_headline_text' );
	$current_post_title    = $post->post_title;

	if ( $current_headline_text !== $current_post_title ) {
		update_post_meta( $post_id, 'cos_headline_text', $current_post_title );
		update_post_meta( $post_id, 'cos_seo_score', 0 );
		update_post_meta( $post_id, 'cos_headline_score', 0 );
	}
}

/**
 * Enqueues the appropriate scripts depending on which editor is being used.
 */
function cos_headlinestudio_conditionally_enqueue_scripts() {
	$current_screen = get_current_screen();
  $post           = get_post();
	$assets         = include plugin_dir_path( __FILE__ ) . 'build/index.asset.php';

	if ( $current_screen->is_block_editor ) {
		wp_enqueue_script(
			'hs-sidebar',
			plugins_url( 'build/index.js', __FILE__ ),
			$assets['dependencies'],
			$assets['version'],
			false
		);
	} else if ($post) {
		wp_enqueue_script(
			'hs-sidebar',
			plugins_url( 'build/classic.js', __FILE__ ),
			$assets['dependencies'],
			$assets['version'],
			false
		);
	}

    // Localize the script with new data
    $permission_array = array(
        'nonce' => wp_create_nonce('wp_rest')
    );
    wp_localize_script('hs-sidebar', 'wpSecurity', $permission_array);

	cos_headlinestudio_register_window_object();
	cos_headlinestudio_register_embed_token();
	cos_headlinestudio_register_user_id();
	cos_headlinestudio_register_admin_url();
}

add_action( 'admin_enqueue_scripts', 'cos_headlinestudio_conditionally_enqueue_scripts' );
