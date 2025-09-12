<?php
/** Uninstall functions
 *
 * @package Headline Studio
 */

if ( ! defined( 'WP_UNINSTALL_PLUGIN' ) ) {
	die;
}

delete_option( 'cos_headlinestudio_embed_token' );
delete_option( 'cos_headlinestudio_user_id' );
delete_option( 'cos_headlinestudio_user_email' );
delete_option( 'cos_headlinestudio_account_connected_at' );
delete_option( 'cos_headlinestudio_prefer_classic_experience' );
delete_option( 'cos_headlinestudio_is_onboarded' );
