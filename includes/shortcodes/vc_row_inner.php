<?php
/**
 * Created by PhpStorm.
 * User: tagdiv
 * Date: 16.02.2016
 * Time: 13:55
 */

class vc_row_inner extends tdc_composer_block {



	function render($atts, $content = null) {
		parent::render($atts);


		global $td_row_count;
		$td_row_count++;


		$buffy = '<div ' . $this->get_block_dom_id() . 'class="' . $this->get_block_classes(array('vc_row', 'vc_inner', 'wpb_row', 'td-pb-row')) . '" >';
			//get the block css
			$buffy .= $this->get_block_css();
			$buffy .= $this->do_shortcode($content);
		$buffy .= '</div>';


		if (tdc_state::is_live_editor_iframe() || tdc_state::is_live_editor_ajax()) {
			$buffy = '<div class="tdc-inner-row">' . $buffy . '</div>';
		}



		$td_row_count--;




		return $buffy;
	}


}