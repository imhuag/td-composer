<?php
/**
 * Created by PhpStorm.
 * User: tagdiv
 * Date: 20.07.2016
 * Time: 16:21
 */

/*
 * At runtime:
 * - the 'action' of the 'tdc-live-panel' frame is set to the tdcAdminIFrameUI._$liveIframe url parameter
 * - the 'tdc_content' hidden param is set to the current content (the content generated from the backbone structure)
 */
?>

<form id="tdc-live-panel" method="post">

	<input type="hidden" name="td_magic_token" value="<?php echo wp_create_nonce("td-update-panel") ?>"/>

	<?php
		// - 'tdc_action' hidden field can have one of the values: 'tdc_ajax_save_post' or 'preview'
		// - at 'preview' nothing is saved to the database
		// - at 'tdc_ajax_save_post' the content and the live panel settings are saved to the database
	?>

	<input type="hidden" id="tdc_action" name="tdc_action" value="tdc_ajax_save_post">
	<input type="hidden" id="tdc_post_id" name="tdc_post_id" value="<?php echo $post->ID ?>">

	<?php
		// - 'tdc_content' hidden field is the shortcode of the new content
	?>

	<input type="hidden" id="tdc_content" name="tdc_content" value="">
	<input type="hidden" id="tdc_customized" name="tdc_customized" value="">

	<!-- WP SETTINGS -->
	<?php echo td_panel_generator::box_start('Template settings', false); ?>

		<select name="tdc_page_template" id="tdc_page_template">
			<?php
			/**
			 * Filter the title of the default page template displayed in the drop-down.
			 *
			 * @since 4.1.0
			 *
			 * @param string $label   The display value for the default page template title.
			 * @param string $context Where the option label is displayed. Possible values
			 *                        include 'meta-box' or 'quick-edit'.
			 */
			$template = !empty($post->page_template) ? $post->page_template : false;
			$default_title = apply_filters( 'default_page_template_title',  __( 'Default Template' ), 'meta-box' );
			?>
			<option value="default"><?php echo esc_html( $default_title ); ?></option>
			<?php page_template_dropdown($template); ?>
		</select>

	<?php echo td_panel_generator::box_end();?>

	<!-- HEADER STYLE -->
	<?php echo td_panel_generator::box_start('Header Style', false); ?>


	<!-- HEADER STYLE -->
	<div class="td-box-row">
		<div class="td-box-description">
			<span class="td-box-title">HEADER STYLE</span>
			<p>Select the order in which the header elements will be arranged</p>
		</div>
		<div class="td-box-control-full">
			<?php
			echo td_panel_generator::radio_button_control(array(
				'ds' => 'td_option',
				'option_id' => 'tds_header_style',
				'values' => td_api_header_style::_helper_generate_tds_header_style()
			));
			?>
		</div>
	</div>

	<?php echo td_panel_generator::box_end();?>

	<!-- WP SETTINGS -->
	<?php echo td_panel_generator::box_start('Menu Settings', false); ?>

	<?php

	// Get menus
	$menus = wp_get_nav_menus();

	$buffer = '<ul>';
	foreach ( $menus as $menu ) {
		$buffer .= '<li class="tdc-panel-menu" data-menu_id="' . $menu->term_id . '" data-menu_name="' . esc_html( $menu->name ) . '">' . esc_html( $menu->name ) . '</li>';
	}
	$buffer .= '</ul>';

	echo $buffer;

	?>
	
	<?php echo td_panel_generator::box_end();?>


</form>

