<?php
/**
 * Created by PhpStorm.
 * User: tagdiv
 * Date: 16.02.2016
 * Time: 13:55
 */

class vc_row_inner extends vc_shortcode {

	function render($atts, $content = null) {

		global $td_row_count;
		$td_row_count++;
		$buffy = '<div class="tdc_inner_row"><div class="vc_row vc_inner wpb_row td-pb-row">' . do_shortcode($content) . '</div></div>';
		$td_row_count--;

		return $buffy;
	}
}