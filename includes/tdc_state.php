<?php
/**
 * Created by ra.
 * Date: 3/4/2016
 */


class tdc_state {


	/**
	 * the current post that we're editing
	 * @var WP_Post
	 */
	private static $post;


	/**
	 * @var bool
	 */
	private static $is_live_editor_iframe;


	/**
	 * @var bool
	 */
	private static $is_live_editor_ajax;


	//private static $


	/**
	 * @param $new_state bool
	 */
	public static function set_is_live_editor_iframe( $new_state ) {
		if ( isset( self::$is_live_editor_iframe ) ) {
			tdc_util::error(__FILE__, __FUNCTION__, 'The tdc_state::$is_live_editor_iframe is already set' );
		}
		self::$is_live_editor_iframe = $new_state;
	}

	/**
	 * Returns true if we are in the first loaded iframe. Note that ajax requests do not toggle this to true
	 * @return bool
	 */
	public static function is_live_editor_iframe() {
		if ( ! isset( self::$is_live_editor_iframe ) ) {
			tdc_util::error(__FILE__, __FUNCTION__, 'The tdc_state::$is_live_editor_iframe is NOT set' );
		}
		return self::$is_live_editor_iframe;
	}


	/**
	 * @param $new_state
	 */
	public static function set_is_live_editor_ajax( $new_state ) {
		if ( isset( self::$is_live_editor_ajax ) ) {
			tdc_util::error(__FILE__, __FUNCTION__, 'The tdc_state::$is_live_editor_ajax is already set' );
		}
		self::$is_live_editor_ajax = $new_state;
	}


	/**
	 * return true if we are in an ajax request done by the composer. It does not return true if we are in the iframe (ex not ajax)
	 * @return bool
	 */
	public static function is_live_editor_ajax() {
		if ( ! isset( self::$is_live_editor_ajax ) ) {
			tdc_util::error(__FILE__, __FUNCTION__, 'The tdc_state::$is_live_editor_ajax is NOT set' );
		}
		return self::$is_live_editor_ajax;
	}




	/**
	 * Returns the current post/page/CTP that we are editing
	 * @return mixed
	 */
	public static function get_post() {
		return self::$post;
	}

	/**
	 * Sets the current post/page/CTP that we are editing
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