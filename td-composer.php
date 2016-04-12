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



	add_action( 'admin_head', 'tdc_on_admin_head' );
	function tdc_on_admin_head() {
		ob_start();
		?>
		<script>
			window.tdcAdminSettings = {
				admin_url: '<?php echo admin_url()?>',
				site_url: '<?php echo get_site_url() ?>'
			}
		</script>
		<?php
		$buffer = ob_get_clean();
		echo $buffer;
	}


	/**
	 * Registers the js script:
	 */
	add_action( 'admin_enqueue_scripts', 'tdc_on_admin_enqueue_scripts' );
	function tdc_on_admin_enqueue_scripts() {
		tdc_util::enqueue_js_files_array(tdc_config::$js_files_for_wp_admin, array('jquery'));
	}







	// The plugin is ready to init.
	tdc::init();
}





/**
 * Class tdc
 */
abstract class tdc {


	private function __construct() {
	}


	/**
	 * - The initialization method of the composer.
	 * - This should not do anything if there's no 'td_action' or 'post_id'
	 */
	static function init() {


		// Ready to load the shortcodes
		require_once('includes/tdc_ajax.php');
		require_once('includes/tdc_state.php');
		require_once('includes/tdc_util.php');

		// shortcodes
		require_once('includes/tdc_shortcode.php');
		require_once('includes/shortcodes/vc_row.php' );
		require_once('includes/shortcodes/vc_row_inner.php' );
		require_once('includes/shortcodes/vc_column.php' );
		require_once('includes/shortcodes/vc_column_inner.php' );
		require_once('includes/shortcodes/vc_column_text.php' );
		require_once('includes/shortcodes/vc_raw_html.php' );
		require_once('includes/shortcodes/vc_widget_sidebar.php' );

		// mapper and internal map
		require_once('includes/tdc_mapper.php');
		require_once('includes/tdc_map.php');


		add_action( 'wp_ajax_tdc_save_post', 'tdc_save_post' );
		function tdc_save_post() {

			$parameters = array();

			$action = $_POST[ 'action' ];
			$post_id = $_POST[ 'post_id' ];
			$post_content = $_POST[ 'content' ];

			if ( !isset($action) || 'tdc_save_post' !== $action || !isset($post_id) || !isset($post_content)) {

				$parameters['errors'][] = 'Invalid data';

			} else {
				$data_post = array(
					'ID'           => $post_id,
					'post_content' => $post_content
				);

				$post_id = wp_update_post( $data_post, true );
				if (is_wp_error($post_id)) {
					$errors = $post_id->get_error_messages();

					$parameters['errors'] = array();
					foreach ($errors as $error) {
						$parameters['errors'][] = $error;
					}
				}
			}
			die(json_encode($parameters));
		}


		if (!isset($_GET['td_action']) || !isset($_GET['post_id'])) {
			return; // we did not initialized!
		}


		$td_action = $_GET['td_action'];
		$post_id = $_GET['post_id'];
		switch ($td_action) {
			// Wrapper edit page
			case 'tdc':
				$current_post = get_post($post_id);
				do_action_ref_array( 'the_post', array( &$current_post ) );

				tdc_state::set_post($current_post);
				tdc_state::set_post_id($current_post->ID);
				tdc_state::set_post_url(get_permalink($current_post->ID));
				tdc_state::set_post_content($current_post->post_content);

				add_filter( 'admin_body_class', array(__CLASS__, 'on_admin_body_class_wrap'));
				add_action( 'current_screen', array(__CLASS__, 'on_current_screen_load_wrap'));
				break;

			// Iframe content post
			case 'tdc_edit':

				add_action( 'wp_enqueue_scripts', array(__CLASS__, 'on_wp_enqueue_scripts_iframe'));
				add_filter( 'show_admin_bar', '__return_false' );


				// This stops 'td_animation_stack' library to be applied
				td_global::$td_options['tds_animation_stack'] = 'lorem ipsum ..';


				break;

			default:

				// Ups! There should must be an action
				// we did not initialized!
				return;

				break;
		}


		// we are initialized
		tdc_state::set_initialized(true);

	}


	/**
	 * on wrapper current_screen
	 */
	static function on_current_screen_load_wrap() {

		tdc_util::enqueue_js_files_array(tdc_config::$js_files_for_wrapper, array(
			'jquery',
//			'jquery-ui-core',
//			'jquery-ui-sortable',
//			'jquery-ui-droppable',
			'backbone',
			'underscore'
		));


		//wp_enqueue_style('tdc', TDC_CSS_URL . '/style.css');
		wp_enqueue_style('td_composer_edit', TDC_URL . '/td_less_style.css.php?part=wrap_main', false, false);

		remove_all_actions('admin_notices', 3);
		remove_all_actions('network_admin_notices', 3);

		require_once('includes/templates/frontend.tpl.php');

		die;
	}


	/**
	 *  on wrap body class
	 */
	static function on_admin_body_class_wrap() {
		return 'tdc';
	}




	/**
	 * iframe enqueue scripts
	 */
	static function on_wp_enqueue_scripts_iframe() {

		tdc_util::enqueue_js_files_array(tdc_config::$js_files_for_iframe, array(
			'jquery',
//			'jquery-ui-core',
//			'jquery-ui-sortable',
//			'jquery-ui-droppable'
		));

		wp_enqueue_style('td_composer_edit', TDC_URL . '/td_less_style.css.php?part=iframe_main', false, false);
	}


}


/*
add_action('shutdown', function(){
	//print_r(tdc_mapper::_debug_get_all());

	//echo do_shortcode('[td_block_1 custom_title="Block title test 52"]');
	//die;
});
*/