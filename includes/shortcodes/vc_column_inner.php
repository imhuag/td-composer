<?php
/**
 * Created by PhpStorm.
 * User: tagdiv
 * Date: 16.02.2016
 * Time: 13:55
 */

class vc_column_inner extends td_block {

	/**
	 * Disable loop block features. This block does not use a loop and it dosn't need to run a query.
	 */
	function __construct() {
		parent::disable_loop_block_features();
	}



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


		ob_start();
		?><div class="tdc-inner-column"><div class="<?php echo $td_pb_class ?> wpb_column vc_column_container"><div class="vc_column-inner"><div class="wpb_wrapper"><?php echo do_shortcode( shortcode_unautop( $content )); ?></div></div></div></div><?php
		return ob_get_clean();
	}


	// we don't use blockUid's yet for rows and columns / AKA structure elements
	function js_tdc_get_composer_block() {
		return '';
	}
}