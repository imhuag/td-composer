<?php
/**
 * Created by ra.
 * Date: 3/4/2016
 */


// ajax: save post hook
//add_action('wp_ajax_tdc_ajax_save_post',        array('tdc_ajax', 'on_ajax_save_post'));


add_action( 'rest_api_init', 'tdc_register_api_routes');
function tdc_register_api_routes() {
	$namespace = 'td-composer';

	register_rest_route($namespace, '/do_job/', array(
		'methods'  => 'POST',
		'callback' => array ('tdc_ajax', 'on_ajax_render_shortcode'),
	));


	register_rest_route($namespace, '/save_post/', array(
		'methods'  => 'POST',
		'callback' => array ('tdc_ajax', 'on_ajax_save_post'),
	));

	register_rest_route($namespace, '/decode_html_content/', array(
		'methods'  => 'POST',
		'callback' => array ('tdc_ajax', 'on_ajax_decode_html_content'),
	));
}


add_action( 'save_post', 'tdc_on_save_post', 10, 3 );
function tdc_on_save_post( $post_id, $post, $update) {
	if ($update === false) {
		update_post_meta($post_id, 'tdc_dirty_content', 1);
	} else {
		$tdcContent = get_post_meta($post_id, 'tdc_content', true);
		if ( $tdcContent !== $post->post_content) {
			update_post_meta($post_id, 'tdc_dirty_content', 1);
		}
	}
}


add_action( 'current_screen', 'tdc_on_current_screen' );
function tdc_on_current_screen() {

	$current_screen = get_current_screen();

	if ($current_screen->post_type === 'page' && isset($_GET['post'])) {

		$isTdcDirtyContent = get_post_meta($_GET['post'], 'tdc_dirty_content', true);

		if (isset($isTdcDirtyContent) && $isTdcDirtyContent === '0') {
			ob_start();
			?>

			<script>

				alert( 'Content compatible with TagDiv Composer! Modify it carefully' );

			</script>

			<?php
			echo ob_get_clean();
		}
	}
}



class tdc_ajax {
	static $_td_block__get_block_js_buffer = '';
	static $_td_block__get_block_uid = '';

	static function on_ajax_render_shortcode (WP_REST_Request $request ) {

		//sleep(5);


		if (!current_user_can( 'edit_pages' )) {
			//@todo - ceva eroare sa afisam aici
			echo 'no permission';
			die;
		}

		// change the main state
		//tdc_state::set_is_live_editor_ajax(true);


		// get the $_POST parameters only
		$parameters = $request->get_body_params();



		td_util::vc_set_column_number($request->get_param('columns'));


		/**
		 * hook td_block__get_block_js so we can receive the JS for EVAL form the block when do_shortcode is called below
		 */
		add_action('td_block__get_block_js', 'tdc_on_td_block__get_block_js', 10, 1);
		/** @param $by_ref_block_obj td_block */
		function tdc_on_td_block__get_block_js($by_ref_block_obj) {
			// APPEND to the buffer for eval(). We may do eval on multiple shortcodes and we must gather all the js form all the blocks
			tdc_ajax::$_td_block__get_block_js_buffer .= $by_ref_block_obj->js_tdc_callback_ajax();
			tdc_ajax::$_td_block__get_block_uid = $by_ref_block_obj->block_uid;
		}


		/*
		 * DEPRECATED, WE FIXED THE BLOCKS!!!
			- we need to call the shortcode with output buffering because our style generator from our blocks just echoes it's generated
				style. No bueno :(
			- when the do_shortcode runs, our blocks usually call @see td_block->get_block_js(). get_block_js() calls the do_action for td_block__get_block_js hook.
				we hook td_block__get_block_js above to read that reply
			- that reply contains the JS for EVAL
		*/
//		ob_start();
//		echo do_shortcode(stripslashes($request->get_param('shortcode')));  // do shortcode usually renders with the blocks td_block->render method
//		$reply_html = ob_get_clean();

		//tdc_map_not_registered_shortcodes($request->get_param('postId'));

		$reply_html =  do_shortcode(stripslashes($request->get_param('shortcode')));


		// read the buffer that was set by the 'td_block__get_block_js' hook above
		if (!empty(self::$_td_block__get_block_js_buffer)) {
			$parameters['replyJsForEval'] = self::$_td_block__get_block_js_buffer;
		}

		$parameters['blockUid'] = self::$_td_block__get_block_uid;


		$parameters['replyHtml'] = $reply_html;



		//sleep(rand(0, 1));


//		if (rand(0,1)) {
//			echo 'fuckshit';
//			die;
//		}

		//print_r($request);
		//die;

		die(json_encode($parameters));
	}




	static function on_ajax_save_post(WP_REST_Request $request) {
		if (!current_user_can( 'edit_pages' )) {
			//@todo - ceva eroare sa afisam aici
			echo 'no permission';
			die;
		}

		$parameters = array();

		// get the $_POST parameters only
		//$parameters = $request->get_body_params();


		//print_r($request);

		$action = $_POST[ 'action' ];
		$post_id = $_POST[ 'post_id' ];
		$post_content = $_POST[ 'content' ];

		if ( !isset($action) || 'tdc_ajax_save_post' !== $action || !isset($post_id) || !isset($post_content)) {

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
			} else {
				update_post_meta($post_id, 'tdc_dirty_content', 0);
				update_post_meta($post_id, 'tdc_content', $post_content);
			}
		}
		die(json_encode($parameters));
	}


	static function on_ajax_decode_html_content(WP_REST_Request $request) {
		if (!current_user_can( 'edit_pages' )) {
			//@todo - ceva eroare sa afisam aici
			echo 'no permission';
			die;
		}

		$parameters = array();

		$action = $_POST[ 'action' ];
		$post_id = $_POST[ 'post_id' ];
		$content = $_POST[ 'content' ];

		if ( !isset($action) || 'tdc_ajax_decode_html_content' !== $action || !isset($post_id) || !isset($content)) {
			$parameters['errors'][] = 'Invalid data';

		} else {
			$parameters['parsed_content'] = htmlentities( rawurldecode( base64_decode( strip_tags( $content ) ) ) );
		}
		die(json_encode($parameters));
	}
}