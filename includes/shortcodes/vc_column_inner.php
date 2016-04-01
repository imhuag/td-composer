<?php
/**
 * Created by PhpStorm.
 * User: tagdiv
 * Date: 16.02.2016
 * Time: 13:55
 */

class vc_column_inner extends tdc_shortcode {

	function render($atts, $content = null) {

		extract(shortcode_atts( array(
			'width' => '1/1'
		), $atts));


		$td_pb_class = '';

		switch ($width) {
			case '1/1': //full
				$td_pb_class = 'td-pb-span12';
				break;
			case '2/3': //2 of 3
				$td_pb_class = 'td-pb-span8';
				break;
			case '1/3': // 1 of 3
				$td_pb_class = 'td-pb-span4';
				break;
			case '1/2': // 1 of 2
				$td_pb_class = 'td-pb-span6';
				break;
		}

		// The global $td_column_count must be set here
		// Usually it's set by vc_column template, but VC plugin is not active
		global $td_column_count;
		$td_column_count = $width;


		ob_start();
		?><div class="tdc-inner-column"><div class="<?php echo $td_pb_class ?> wpb_column vc_column_container"><div class="vc_column-inner"><div class="wpb_wrapper"><?php echo self::wpb_js_remove_wpautop( $content ); ?></div></div></div></div><?php
		return ob_get_clean();
	}
}