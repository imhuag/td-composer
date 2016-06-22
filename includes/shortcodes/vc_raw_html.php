<?php
/**
 * Created by PhpStorm.
 * User: tagdiv
 * Date: 16.02.2016
 * Time: 14:31
 */

class vc_raw_html extends tdc_composer_block {

	function render($atts, $content = null) {
		parent::render($atts);

		$atts = shortcode_atts(
			array(
				'content' => '',
				'el_class' => '',
				'css_editor' => ''
			), $atts, 'vc_raw_html' );

		$content = rawurldecode( base64_decode( strip_tags( $content ) ) );

		return '<div class="wpb_wrapper td_block_wrap ' . $this->get_block_classes( array( $atts['el_class'] ) ) . '">' . $this->get_block_css() . $content . '</div>';
	}
}