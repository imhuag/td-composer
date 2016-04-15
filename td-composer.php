<?php
/**
 * Plugin Name: tagDiv Composer
 * Plugin URI: http://tagdiv.com
 * Description: tagDiv Composer
 * Author: tagDiv
 * Version: 1.0
 * Author URI: http://tagdiv.com
 */










add_action('td_wp_booster_loaded', 'tdc_plugin_init',  10001);
function tdc_plugin_init() {

	// load the plugin config
	require_once('includes/tdc_config.php');


	// check if it's our theme
	// @todo add check for aurora version - probabil sa fie mai mare decat versiunea 4
	if ( ! defined( 'TD_AURORA_VERSION' ) /* or TD_AURORA_VERSION !== TDC_VERSION */ ) {
		add_action( 'admin_notices', 'tdc_aurora_msg' );
		function tdc_aurora_msg() {
			?>
			<div class="error">
				<p><?php echo '<strong>Please update the theme or the plugin to the same version of the Aurora plugin API. Now, the Theme Aurora version is: ' . TD_AURORA_VERSION . ' and plugin version: ' . TD_COMPOSER_VERSION . '!</strong>' ?></p>
				<p><?php echo '<strong style="color:red">TagDiv Compose plugin is not active</strong> to prevent unexpected behaviours.' ?></p>
				<p><?php echo 'File message: ' . __FILE__ ?></p>
			</div>
			<?php
		}
		// The plugin is deactivated if it's already active.
		if ( is_plugin_active( plugin_basename( __FILE__ ) ) ) {
			deactivate_plugins( plugin_basename( __FILE__ ) );
		}

		// stop the plugin - no more plugin code will run after this
		return;
	}


	// load the plugin
	require_once "includes/tdc_main.php";


}



