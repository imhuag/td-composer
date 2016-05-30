<?php
/**
 * Created by PhpStorm.
 * User: tagdiv
 * Date: 11.02.2016
 * Time: 13:04
 */

/*
 * frontend.tpl.php can't be used without 'tdc' class
 */


global $post;

$post = tdc_state::get_post();

// check if we have a post set in the state.
if (empty($post)) {
	tdc_util::error(__FILE__, __FUNCTION__, 'Invalid post ID, or permission denied');
	die;
}



add_thickbox();
wp_enqueue_media( array( 'post' => $post->ID ) );

require_once( ABSPATH . 'wp-admin/admin-header.php' );



//@todo - refactorizare aici json_encode
?>
	<script type="text/javascript">

		window.tdcPostSettings = {
			postId: '<?php echo $post->ID; ?>',
			postUrl: '<?php echo get_permalink($post->ID); ?>',
			postContent: '<?php echo $post->post_content; ?>',
		};

	</script>


	<!-- the composer sidebar -->
	<div id="tdc-sidebar">
		<div class="tdc-top-buttons">
			<a href="#" class="tdc-save-page">Save page</a>
			<a href="#" class="tdc-add-element">Add element</a>
		</div>


		<!-- breadcrumbs browser -->
		<div class="tdc-breadcrumbs">
			<div id="tdc-breadcrumb-row">
				<a href="#">row</a>
			</div>
			<div id="tdc-breadcrumb-column">
				<span class="tdc-breadcrumb-arrow"></span>
				<a href="#">column</a>
			</div>
			<div id="tdc-breadcrumb-inner-row">
				<span class="tdc-breadcrumb-arrow"></span>
				<a href="#">inner-row</a>
			</div>
			<div id="tdc-breadcrumb-inner-column">
				<span class="tdc-breadcrumb-arrow"></span>
				<a href="#">inner-column</a>
			</div>
		</div>


		<!-- the inspector -->
		<div class="tdc-inspector">
			<div class="tdc-current-element-head">
			</div>
			<div class="tdc-tabs-wrapper">
			</div>
		</div>



		<div class="tdc-sidebar-bottom">
			<div id="tdc-recycle">
				Recycle
			</div>
		</div>



		<!-- modal window -->
		<div class="tdc-sidebar-modal tdc-sidebar-modal-elements">
			<div class="tdc-sidebar-modal-title">
				Add Element
				<a href="#" class="tdc-modal-close"></a>
			</div>
			<div class="tdc-sidebar-modal-content">
				<!-- sidebar elements list -->
				<div class="tdc-sidebar-elements">
					<?php

					$mapped_shortcodes = tdc_mapper::get_mapped_shortcodes();

					$contor = 0;

					foreach ($mapped_shortcodes as $mapped_shortcode ) {

						if ( 'vc_row' === $mapped_shortcode['base'] ) {
							echo '<div class="tdc-sidebar-element tdc-row-temp" data-shortcode-name="' . $mapped_shortcode['base'] . '">' . $mapped_shortcode['name'] . '</div>';
							continue;
						}

						if ( 'vc_row_inner' === $mapped_shortcode['base'] ) {
							echo '<div class="tdc-sidebar-element tdc-element-inner-row-temp" data-shortcode-name="' . $mapped_shortcode['base'] . '">' . $mapped_shortcode['name'] . '</div>';
							continue;
						}

						if ( in_array( $mapped_shortcode['base'],
							array(
								'td_block_big_grid_slide',      // s-ar putea sa mearga cu render pe td_block_big_grid_2 in loc la slide
								'td_block_trending_now',        // trebuie refactorizat
								'td_block_video_youtube',       // lipsesc wrappers + ceva js custom
								'td_block_video_vimeo',         // lipsesc wrappers + ceva js custom
								'td_block_ad_box',              // issues - lipseste wrapper-ul - probabil din cauza la adblock
								//'td_block_authors',
								//'td_block_popular_categories',
								'td_block_slide',               // issues - trebuie facut sa scoata doar 1 slide fara script!
								//'td_block_text_with_title',
								//'td_block_weather',             // animation sprite item + weather item
								//'td_block_exchange',
								//'td_block_instagram',
								//'td_block_social_counter'
							) ) ) {

							echo '<div style="color: #FF0000" data-shortcode-name="' . $mapped_shortcode['base'] . '">' . $mapped_shortcode['name'] . '</div>';
							continue;
						}

						if ( isset($mapped_shortcode['map_in_visual_composer']) && true === $mapped_shortcode['map_in_visual_composer'] ) {
							echo '<div class="tdc-sidebar-element tdc-element" data-shortcode-name="' . $mapped_shortcode['base'] . '">' . $mapped_shortcode['name'] . '</div>';
						}
					}

					?>
				</div>
			</div>
		</div>


	</div>


	<!-- The live iFrame loads in this wrapper :) -->
	<div id="tdc-live-iframe-wrapper"></div>

	<div style="height: 1px; visibility: hidden; overflow: hidden;">

		<?php
		$is_IE = false;   // used by wp-admin/edit-form-advanced.php
		require_once ABSPATH . 'wp-admin/edit-form-advanced.php';
		?>

	</div>

<?php
require_once( ABSPATH . 'wp-admin/admin-footer.php' );


