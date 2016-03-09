<?php
/**
 * Created by ra.
 * Date: 3/4/2016
 */


class tdc_state {
	private static $is_initialized = false;
	private static $post;
	private static $post_id;
	private static $post_url;
	private static $post_content;





	public static function set_initialized($new_value) {
		self::$is_initialized = $new_value;
	}

	public static function is_initialized() {
		return self::$is_initialized &&
		       !empty(self::$post) &&
		       !empty(self::$post_id) &&
		       !empty(self::$post_url);
	}




	/**
	 * @return mixed
	 */
	public static function get_post() {
		return self::$post;
	}

	/**
	 * @param mixed $post
	 */
	public static function set_post( $post ) {
		self::$post = $post;
	}




	/**
	 * @return mixed
	 */
	public static function get_post_id() {
		return self::$post_id;
	}

	/**
	 * @param mixed $post_id
	 */
	public static function set_post_id( $post_id ) {
		self::$post_id = $post_id;
	}



	/**
	 * @return mixed
	 */
	public static function get_post_url() {
		return self::$post_url;
	}

	/**
	 * @param mixed $post_url
	 */
	public static function set_post_url( $post_url ) {
		self::$post_url = $post_url;
	}


	/**
	 * @return mixed $post_content
	 */
	public static function get_post_content() {
		return self::$post_content;
	}

	/**
	 * @param $post_content
	 */
	public static function set_post_content( $post_content ) {
		self::$post_content = $post_content;
	}
}