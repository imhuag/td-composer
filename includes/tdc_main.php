<?php
/**
 * Created by ra.
 * Date: 4/14/2016
 */





// Ready to load the shortcodes
require_once('tdc_ajax.php');
require_once('tdc_state.php');
require_once('tdc_util.php');

// shortcodes
require_once('tdc_shortcode.php');
require_once('shortcodes/vc_row.php' );
require_once('shortcodes/vc_row_inner.php' );
require_once('shortcodes/vc_column.php' );
require_once('shortcodes/vc_column_inner.php' );
require_once('shortcodes/vc_column_text.php' );
require_once('shortcodes/vc_raw_html.php' );
require_once('shortcodes/vc_widget_sidebar.php' );

// mapper and internal map
require_once('tdc_mapper.php');
require_once('tdc_map.php');





/**
 * WP-admin - add js in header on all the admin pages (wp-admin and the iframe Wrapper. Does not run in the iframe)
 */
add_action( 'admin_head', 'tdc_on_admin_head' );
function tdc_on_admin_head() {

	// the settings that we load in wp-admin and wrapper. We need json to be sure we don't get surprises with the encoding/escaping
	$tdc_admin_settings = array(
		'admin_url' => admin_url(),
		'site_url' => get_site_url(),
		'wp_rest_nonce' => wp_create_nonce('wp_rest'),
		'wp_rest_url' => rest_url(),
		'permalink_structure' => get_option('permalink_structure')
	);

	ob_start();
	?>
	<script>
		window.tdcAdminSettings = <?php echo json_encode($tdc_admin_settings, JSON_PRETTY_PRINT);?>;
	</script>
	<?php
	$buffer = ob_get_clean();
	echo $buffer;
}


/**
 * WP-admin - Edit page with tagDiv composer
 */
add_action('admin_bar_menu', 'tdc_on_admin_bar_menu', 100);
function tdc_on_admin_bar_menu() {
	global $wp_admin_bar, $post;
	//print_r($wp_admin_bar);
	//die;

	if (!current_user_can('edit_pages') || !is_admin_bar_showing() || !is_page()) {
		return;
	}


	$wp_admin_bar->add_menu(array(
		'id'   => 'tdc_edit',
		'meta' => array (
			'title' => 'Edit with TD Composer'
		),

		'title' => 'Edit with TD Composer',
		'href' => admin_url('post.php?post_id=' . $post->ID . '&td_action=tdc')
	));

}





/**
 * Registers the js script:
 */
add_action( 'admin_enqueue_scripts', 'tdc_on_admin_enqueue_scripts' );
function tdc_on_admin_enqueue_scripts() {
	tdc_util::enqueue_js_files_array(tdc_config::$js_files_for_wp_admin, array('jquery'));

	// Disable the confirmation messages at leaving pages
	wp_dequeue_script( 'autosave' );
}









$td_action = tdc_util::get_get_val('td_action');
if (!empty($td_action)) {

	// $_GET['post_id'] is requiered from now on
	$post_id = tdc_util::get_get_val('post_id');
	if (empty($post_id)) {
		tdc_util::error(__FILE__, __FUNCTION__, 'No post_id received via GET');
		die;
	}




	switch ($td_action) {

		case 'tdc':
			// Wrapper edit page
			$current_post = get_post($post_id);
			do_action_ref_array( 'the_post', array( &$current_post ) );

			tdc_state::set_post($current_post);



			/**
			 *  on wrap body class
			 */
			add_filter( 'admin_body_class', 'on_admin_body_class_wrap');
			function on_admin_body_class_wrap() {
				return 'tdc';
			}


			/**
			 * on wrapper current_screen
			 */
			add_action( 'current_screen', 'on_current_screen_load_wrap');
			function on_current_screen_load_wrap() {
				tdc_util::enqueue_js_files_array(tdc_config::$js_files_for_wrapper, array(
					'jquery',
					'backbone',
					'underscore'
				));

				//wp_enqueue_style('tdc', TDC_CSS_URL . '/style.css');
				wp_enqueue_style('td_composer_edit', TDC_URL . '/td_less_style.css.php?part=wrap_main', false, false);

				remove_all_actions('admin_notices', 3);
				remove_all_actions('network_admin_notices', 3);

				require_once('templates/frontend.tpl.php');
				die;
			}
			break;


		case 'tdc_edit':

			tdc_state::set_is_live_editor_iframe(true);


			// Iframe content post
			add_filter( 'show_admin_bar', '__return_false' );

			/**
			 * iframe enqueue scripts
			 */
			add_action( 'wp_enqueue_scripts', 'on_wp_enqueue_scripts_iframe', 1010); // load them last
			function on_wp_enqueue_scripts_iframe() {
				tdc_util::enqueue_js_files_array(tdc_config::$js_files_for_iframe, array(
					'jquery',
				));
				wp_enqueue_style('td_composer_edit', TDC_URL . '/td_less_style.css.php?part=iframe_main', false, false);
			}





			// This stops 'td_animation_stack' library to be applied
			// @todo - trebuie sa fie din thema?
			td_global::$td_options['tds_animation_stack'] = 'lorem ipsum ..';
			break;



		default:
			// Unknown td_action - kill execution
			tdc_util::error(__FILE__, __FUNCTION__, 'Unknown td_action received: ' . $td_action);
			die;
	}


}



























