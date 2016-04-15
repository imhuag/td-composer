<?php
/**
 * Created by ra.
 * Date: 3/4/2016
 */


class tdc_state {


	/**
	 * @var WP_Post
	 */
	private static $post;


	/**
	 * @var bool
	 */
	private static $is_live_editor_iframe = false;


	/**
	 * @var bool
	 */
	private static $is_live_editor_ajax = false;


	/**
	 * @param $new_state bool
	 */
	public static function set_is_live_editor_iframe($new_state) {
		self::$is_live_editor_iframe = $new_state;
	}

	/**
	 * @return bool
	 */
	public static function is_live_editor_iframe() {
		return self::$is_live_editor_iframe;
	}





	public static function set_is_live_editor_ajax($new_state){
		self::$is_live_editor_ajax = $new_state;
	}

	public static function is_live_editor_ajax() {
		return self::$is_live_editor_ajax;
	}




	/**
	 * @return mixed
	 */
	public static function get_post() {
		return self::$post;
	}

	/**
	 * @param WP_Post $post
	 */
	public static function set_post( $post ) {
		// we can add here additional checks if needed
		if (get_class($post) != 'WP_Post') {
			tdc_util::error(__FILE__, __FUNCTION__, '$post is not a WP_Post class');
			die;
		}
		self::$post = $post;
	}




}