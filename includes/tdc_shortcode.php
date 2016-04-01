<?php
/**
 * Created by ra.
 * Date: 4/1/2016
 */

class tdc_shortcode {




	protected static function wpb_js_remove_wpautop( $content, $autop = false ) {
		if ( $autop ) {
			$content = wpautop( preg_replace( '/<\/?p\>/', "\n", $content ) . "\n" );
		}
		return do_shortcode( shortcode_unautop( $content ) );
	}
}