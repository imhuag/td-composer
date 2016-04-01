<?php
/**
 * Created by PhpStorm.
 * User: tagdiv
 * Date: 16.02.2016
 * Time: 13:11
 */


class vc_row extends tdc_shortcode {

	function render($atts, $content = null) {

		global $td_row_count;
		$td_row_count++;
		$buffy = self::wpb_js_remove_wpautop('<div class="tdc-row"><div class="vc_row wpb_row td-pb-row">' .   $content  . '</div></div>');
		$td_row_count--;

		return $buffy;
	}
}