<?php
/**
 * Created by PhpStorm.
 * User: tagdiv
 * Date: 16.02.2016
 * Time: 14:06
 */


require_once('vc_row.php' );
require_once('vc_row_inner.php' );
require_once('vc_column.php' );
require_once('vc_column_inner.php' );
require_once('vc_column_text.php' );
require_once('vc_raw_html.php' );
require_once('vc_widget_sidebar.php' );

class vc_shortcode {

	private static $shortcodes;

	private static $column_width_list;

	static function init() {
		if ( !isset( self::$shortcodes ) ) {

			// This informs there's a builder activated
			global $td_use_page_builder;
			$td_use_page_builder = true;


			self::$column_width_list = array(
				__( '1 column - 1/12', TD_THEME_NAME) => '1/12',
				__( '2 columns - 1/6', TD_THEME_NAME) => '1/6',
				__( '3 columns - 1/4', TD_THEME_NAME) => '1/4',
				__( '4 columns - 1/3', TD_THEME_NAME) => '1/3',
				__( '5 columns - 5/12', TD_THEME_NAME) => '5/12',
				__( '6 columns - 1/2', TD_THEME_NAME) => '1/2',
				__( '7 columns - 7/12', TD_THEME_NAME) => '7/12',
				__( '8 columns - 2/3', TD_THEME_NAME) => '2/3',
				__( '9 columns - 3/4', TD_THEME_NAME) => '3/4',
				__( '10 columns - 5/6', TD_THEME_NAME) => '5/6',
				__( '11 columns - 11/12', TD_THEME_NAME) => '11/12',
				__( '12 columns - 1/1', TD_THEME_NAME) => '1/1',
			);

			self::$shortcodes = td_api_block::get_all();

			self::$shortcodes['vc_row'] = array(
				'name'              => __('Row', TD_THEME_NAME),
				'base'              => 'vc_row',
				'is_container'      => true,
				'icon'              => 'icon-wpb-row',
				'category'          => __('Content', TD_THEME_NAME),
				'description'       => __('Row - element description', TD_THEME_NAME),
				'params'            => array_merge(
					self::get_el_id(),
					self::get_el_class(),
					self::get_designer_options()
				)
			);

			self::$shortcodes['vc_row_inner'] = array(
				'name'              => __('Inner Row', TD_THEME_NAME),
				'base'              => 'vc_row_inner',
				'content_element'   => false,
				'is_container'      => true,
				'icon'              => 'icon-wpb-row',
				'description'       => __('Inner Row - element description', TD_THEME_NAME),
				'params'            => array_merge(
					self::get_el_id(),
					self::get_el_class(),
					self::get_designer_options()
				)
			);

			self::$shortcodes['vc_column'] = array(
				'name'              => __('Column', TD_THEME_NAME),
				'base'              => 'vc_column',
				'content_element'   => false,
				'is_container'      => true,
				'icon'              => 'icon-wpb-row',
				'description'       => __('Column - element description', TD_THEME_NAME),
				'params'            => array_merge(
					self::get_el_class(),
					self::get_el_width(),
					self::get_designer_options()
				)
			);

			self::$shortcodes['vc_column_inner'] = array(
				'name'                      => __('Inner Column', TD_THEME_NAME),
				'base'                      => 'vc_column_inner',
				'controls'                  => 'full',
				'allowed_container_element' => false,
				'content_element'           => false,
				'is_container'              => true,
				'icon'                      => 'icon-wpb-row',
				'description'               => __('Inner Column - element description', TD_THEME_NAME),
				'params'                    => array_merge(
					self::get_el_class(),
					self::get_el_width(),
					self::get_designer_options()
				)
			);

			foreach (self::$shortcodes as $block_settings_key => $block_settings_value) {
				td_global_blocks::add_lazy_shortcode($block_settings_key);
			}
		}
	}


	private static function get_el_id() {
		return array(
			array(
				'param_name'    => 'el_id',
				'type'          => 'el_id',
				'heading'       => __('Row ID', TD_THEME_NAME),
				'description'   => __('Add an unique id', TD_THEME_NAME),
			)
		);
	}

	private static function get_el_class() {
		return array(
			array(
				'param_name'    => 'el_class',
				'type'          => 'textfield',
				'heading'       => __('Extra class name', TD_THEME_NAME),
				'description'   => __('Add extra css class', TD_THEME_NAME),
			)
		);
	}

	private static function get_el_width() {
		return array(
			array(
				'param_name' => 'width',
				'type' => 'dropdown',
				'heading' => __('Width', TD_THEME_NAME),
				'value' => self::$column_width_list,
				'group' => __('Responsive Options', TD_THEME_NAME),
				'description' => __('Select column width.', TD_THEME_NAME),
				'std' => '1/1',
			),
		);
	}

	private static function get_designer_options() {
		return array(
			array(
				'param_name'    => 'css',
				'type'          => 'css_editor',
				'heading'       => __('CSS box', TD_THEME_NAME),
				'group'         => __('Design Options', TD_THEME_NAME),
			)
		);
	}


	protected static function wpb_js_remove_wpautop( $content, $autop = false ) {
		if ( $autop ) {
			$content = wpautop( preg_replace( '/<\/?p\>/', "\n", $content ) . "\n" );
		}
		return do_shortcode( shortcode_unautop( $content ) );
	}
}