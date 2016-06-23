<?php
/**
 * Created by PhpStorm.
 * User: tagdiv
 * Date: 16.02.2016
 * Time: 14:31
 */

class vc_column_text extends tdc_composer_block {

	function render($atts, $content = null) {

		parent::render($atts);

		$atts = shortcode_atts(
			array(
				'content' => '',
				'el_class' => '',
				'css_editor' => ''
			), $atts, 'vc_column_text' );

		// As vc does
		$content = wpautop( preg_replace( '/<\/?p\>/', "\n", $content ) . "\n" );

		if ( ! ( tdc_state::is_live_editor_iframe() || tdc_state::is_live_editor_ajax() ) ) {
			$content = $this->do_shortcode($content);
		}

		return '<div class="wpb_wrapper td_block_wrap ' . $this->get_block_classes( array( $atts['el_class'] ) ) . '">' . $this->get_block_css() . $content . '</div>';
	}
}