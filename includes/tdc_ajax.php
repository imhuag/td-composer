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

}



class tdc_ajax {
	static function on_ajax_render_shortcode (WP_REST_Request $request ) {

		if (!current_user_can( 'edit_pages' )) {
			//@todo - ceva eroare sa afisam aici
			echo 'no permission';
			die;
		}

		// change the main state
		tdc_state::set_is_live_editor_ajax(true);


		// get the $_POST parameters only
		$parameters = $request->get_body_params();



		td_util::vc_set_column_number($request->get_param('columns'));


		/*
			we need to call the shortcode with output buffering because our style generator from our blocks just echoes it's generated
			style. No bueno :(
		*/
		ob_start();
		echo do_shortcode(stripslashes($request->get_param('shortcode')));
		$reply_html = ob_get_clean();




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
			}
		}
		die(json_encode($parameters));
	}
}