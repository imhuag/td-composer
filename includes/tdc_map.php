<?php
/**
 * Created by ra.
 * Date: 3/31/2016
 * Internal map file
 */


// map the blocks from our themes
add_action('td_wp_booster_loaded', 'tdc_map_theme_blocks');
function tdc_map_theme_blocks() {
	foreach (td_api_block::get_all() as $block) {
		if (isset($block['map_in_visual_composer']) && $block['map_in_visual_composer'] === true) { // map only shortcodes that have to appear in the composer
			tdc_mapper::map($block);
		}
	}
}


// overwrites or just loads the shortcodes that come with the plugin
add_action('td_wp_booster_loaded', 'tdc_load_internal_shortcodes',  10002);
function tdc_load_internal_shortcodes() {
	td_global_blocks::add_lazy_shortcode('vc_row');
	td_global_blocks::add_lazy_shortcode('vc_column');
	td_global_blocks::add_lazy_shortcode('vc_row_inner');
	td_global_blocks::add_lazy_shortcode('vc_column_inner');
}



tdc_mapper::map(array(
	'base' => 'vc_row',
	'name' => __('Row' , 'td_composer'),
	'is_container' => true,
	'icon' => 'tdc-icon-row',
	'category' => __('Content', 'td_composer'),
	'description' => __('some desc', 'td_composer'),
	'params' => array(
		array(
			'type' => 'css_editor',
			'heading' => __('CSS box', 'td_composer'),
			'param_name' => 'css',
			'group' => __('Design Options', 'td_composer'),
		),
	)
));


tdc_mapper::map(
	array(
		'base' => 'vc_column',
		'name' => __('Column', 'td_composer' ),
		'icon' => 'tdc-icon-column',
		'is_container' => true,
		'content_element' => false, // hide from the list of elements on the ui
		'description' => __( 'Place content elements inside the column', 'td_composer' ),
		'params' => array(
			array(
				'type' => 'css_editor',
				'heading' => __( 'CSS box', 'td_composer' ),
				'param_name' => 'css',
				'group' => __( 'Design Options', 'td_composer' ),
			)
		)
	)
);


tdc_mapper::map(
	array(
		'base' => 'vc_row_inner',
		'name' => __('Inner Row', 'td_composer'),
		'content_element' => false, // hide from the list of elements on the ui
		'is_container' => true,
		'icon' => 'icon-wpb-row',
		'description' => __('Place content elements inside the inner row', 'td_composer'),
		'params' => array(
			array(
				'type' => 'css_editor',
				'heading' => __('CSS box', 'td_composer'),
				'param_name' => 'css',
				'group' => __('Design Options', 'td_composer'),
			),
		)
	)
);


tdc_mapper::map(
	array(
		'base' => 'vc_column_inner',
		'name' => __( 'Inner Column', 'td_composer' ),
		'icon' => 'icon-wpb-row',
		'allowed_container_element' => false, // if it can contain other container elements (other blocks that have is_container = true)
		'content_element' => false, // hide from the list of elements on the ui
		'is_container' => true,
		'description' => __( 'Place content elements inside the inner column', 'td_composer' ),
		'params' => array(
			array(
				'type' => 'css_editor',
				'heading' => __( 'CSS box', 'td_composer' ),
				'param_name' => 'css',
				'group' => __( 'Design Options', 'td_composer' ),
			),
		)
	)
);






/*
@todo mai trebuie adougate astea la toate elementele
array(
	'type' => 'el_id',
	'heading' => __('Row ID', 'td_composer'),
	'param_name' => 'el_id',
	'description' => __('Enter row ID (Note: make sure it is unique and valid', 'td_composer'),
),
array(
	'type' => 'textfield',
	'heading' => __('Extra class name', 'td_composer'),
	'param_name' => 'el_class',
	'description' => __( 'Style particular content element differently - add a class name and refer to it in custom CSS.', 'td_composer'),
),
*/