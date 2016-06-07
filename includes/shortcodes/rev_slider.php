<?php
/**
 * Created by PhpStorm.
 * User: tagdiv
 * Date: 07.06.2016
 * Time: 10:40
 */

class rev_slider extends td_block {

	/**
	 * Disable loop block features. This block does not use a loop and it dosn't need to run a query.
	 */
	function __construct() {
		parent::disable_loop_block_features();
	}


	function render($atts, $content = null) {


		//print_r($this->get_custom_css_att($atts['css']));
		global $td_row_count;
		$td_row_count = 0;
		$td_row_count++;


		$buffy = do_shortcode( shortcode_unautop( '<div class="td_block_wrap tdc-rev-slider"></div>' ) );

		$td_row_count--;

		return $buffy;
	}




	// we don't use blockUid's yet for rows and columns / AKA structure elements
	function js_tdc_get_composer_block() {
		return '';
	}
}