<?php
/**
 * Created by ra.
 * Date: 3/31/2016
 */

class tdc_mapper {


	private static $mapped_shortcodes;


	/**
	 * Mapper function - it registers a new shortcode in tagDiv Composer. Please note that you still have to manually register the shortcode
	 * in WordPress
	 * This does not use the 'map_in_visual_composer' attribute. We map anything that is sent here! the atribute is used in tdc_map.php
	 * @param $attributes
	 */
	static function map($attributes) {
		// 'base' attribute is requiered! is used as a key. It's probably some kind of backwards compatibility in VC
		if (!isset($attributes['base'])) {
			tdc_util::error(__FILE__, __FUNCTION__, 'The base attribute is requiered for all the shortcodes', $attributes);
		}

		if (isset(self::$mapped_shortcodes[$attributes['base']])) {
			tdc_util::error(__FILE__, __FUNCTION__, 'Shortcode ' . $attributes['base'] . ' already mapped, please use the update method to update it!', $attributes);
		}



		self::$mapped_shortcodes[$attributes['base']] = $attributes;
	}


	/**
	 * @param $base
	 * @return bool
	 */
	static function get_attributes($base) {
		if (isset(self::$mapped_shortcodes[$base])) {
			return self::$mapped_shortcodes[$base];
		}

		tdc_util::error(__FILE__, __FUNCTION__, 'Shortcode with base ' . $base . ' is not mapped!');
		return false;
	}



	static function get_mapped_shortcodes() {
		return self::$mapped_shortcodes;
	}



	// @todo this should be removed
	static function _debug_get_all() {
		return self::$mapped_shortcodes;
	}
}
