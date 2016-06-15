<?php
/**
 * Created by PhpStorm.
 * User: tagdiv
 * Date: 16.02.2016
 * Time: 13:11
 */


// we inherit from td_block to add easier support for ajax + js on the frontend in the future
// @todo trebuie vazut daca lasam mostenirea asta....
class vc_row extends td_block {

	/**
	 * Disable loop block features. This block does not use a loop and it dosn't need to run a query.
	 */
	function __construct() {
		parent::disable_loop_block_features();
	}


	function render($atts, $content = null) {
		global $td_row_count;
		$td_row_count = 0; //@todo trebuie refactoriza, nu mai e necesara incrementarea
		$td_row_count++;

		$el_class = '';
		if (!empty($atts['el_class'])) {
			$el_class = ' ' . $atts['el_class'];
		}

		$el_id = '';
		if (!empty($atts['el_class'])) {
			$el_id = 'id="' . $atts['el_class'] . '" ';
		}


		$row_content = '<div ' . $el_id . 'class="vc_row wpb_row td-pb-row' . $el_class . '">' .   $content  . '</div>';

		// the tdc-row wrapper is not present on the frontend when using vc.
		// We show it only when the live editor is active
		if (tdc_state::is_live_editor_iframe() || tdc_state::is_live_editor_ajax() ) {
			$row_content = '<div class="tdc-row">' . $row_content . '</div>';
		}


		$buffy = do_shortcode( shortcode_unautop( $row_content ) );

		$td_row_count--;

		return $buffy;
	}




	// we don't use blockUid's yet for rows and columns / AKA structure elements
	function js_tdc_get_composer_block() {
		return '';
	}
}