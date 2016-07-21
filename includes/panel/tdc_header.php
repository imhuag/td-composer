<?php
/**
 * Created by PhpStorm.
 * User: tagdiv
 * Date: 20.07.2016
 * Time: 16:21
 */
?>

<form id="td_panel_big_form" action="?page=td_theme_panel" method="post" target="tdc-live-iframe">


	<input type="hidden" name="td_magic_token" value="<?php echo wp_create_nonce("td-update-panel") ?>"/>
	<input type="hidden" name="action" value="td_ajax_update_panel">
	<input type="hidden" name="tdc_action" value="preview">

<!-- HEADER STYLE -->
<?php echo td_panel_generator::box_start('Header Style'); ?>


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

	<input type="submit" id="tdc_button_save_panel" value="SAVE SETTINGS">

</form>

