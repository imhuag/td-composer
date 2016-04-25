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

?>
	<script type="text/javascript">

		window.tdcPostSettings = {
			postId: '<?php echo $post->ID; ?>',
			postUrl: '<?php echo get_permalink($post->ID); ?>',
			postContent: '<?php echo $post->post_content; ?>',
			mappedShortcodes: []
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
			<div class="tdc-breadcrumbs-path">
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
		</div>


		<!-- the inspector -->
		<div class="tdc-inspector">
			<div class="tdc-current-element-title">
			</div>
			<div class="tdc-tabs">
				<a href="#" data-tab-id="td-tab-general" class="tdc-tab-active">General</a>
				<a href="#" data-tab-id="td-tab-filter">Filter</a>
				<a href="#" data-tab-id="td-tab-ajax-filter">Ajax filter</a>
				<a href="#" data-tab-id="td-tab-pagination">Pagination</a>
				<a href="#" data-tab-id="td-tab-row" class="tdc-layout tdc-layout-row">Settings Row</a>
				<a href="#" data-tab-id="td-tab-column" class="tdc-layout tdc-layout-column">Settings Column</a>
				<a href="#" data-tab-id="td-tab-inner-row" class="tdc-layout tdc-layout-inner-row">Settings Inner Row</a>
				<a href="#" data-tab-id="td-tab-inner-column" class="tdc-layout tdc-layout-inner-column">Settings Inner Column</a>
			</div>
			<div class="tdc-tab-content-wrap">
				<div class="tdc-tab-content tdc-tab-content-visible" id="td-tab-general">
					<!-- tab 1 -->

					GENERAL
				</div>
				<div class="tdc-tab-content" id="td-tab-filter">
					<!-- tab 1 -->

					FILTER
				</div>
				<div class="tdc-tab-content" id="td-tab-ajax-filter">
					<!-- tab 1 -->

					AJAX FILTER
				</div>
				<div class="tdc-tab-content" id="td-tab-pagination">
					<!-- tab 1 -->

					PAGINATION
				</div>
				<div class="tdc-tab-content" id="td-tab-row">
					<!-- tab 1 -->

					<div class="tdc-property-wrap tdc-property-dropdown">
						<div class="tdc-property-title">Columns:</div>
						<div class="tdc-property">
							<select name="tdc-row-column" data-option="">
								<option class="" value="11">1/1</option>
								<option class="" value="23_13">2/3 + 1/3</option>
								<option class="" value="13_23">1/3 + 2/3</option>
								<option class="" value="13_13_13">1/3 + 1/3 + 1/3</option>
							</select>
						</div>
					</div>

				</div>
				<div class="tdc-tab-content" id="td-tab-column">
					<!-- tab 1 -->

					column settings
				</div>
				<div class="tdc-tab-content" id="td-tab-inner-row">
					<!-- tab 1 -->

					<div class="tdc-property-wrap tdc-property-dropdown">
						<div class="tdc-property-title">Columns:</div>
						<div class="tdc-property">
							<select name="tdc-inner-row-inner-column" data-option="">
								<option class="" value="11">1/1</option>
								<option class="" value="12_12">1/2 + 1/2</option>
								<option class="" value="23_13">2/3 + 1/3</option>
								<option class="" value="13_23">1/3 + 2/3</option>
								<option class="" value="13_13_13">1/3 + 1/3 + 1/3</option>
							</select>
						</div>
					</div>

				</div>
				<div class="tdc-tab-content" id="td-tab-inner-column">
					<!-- tab 1 -->

					inner column settings
				</div>
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
							echo '<div class="tdc-sidebar-element tdc-row" data-shortcode-name="' . $mapped_shortcode['base'] . '">' . $mapped_shortcode['name'] . '</div>';
							?>
								<script>
									window.tdcPostSettings.mappedShortcodes.push( <?php echo '\'' . $mapped_shortcode['base'] . '\'' ?> );
								</script>
							<?php
							continue;
						}

						if ( 'vc_row_inner' === $mapped_shortcode['base'] ) {
							echo '<div class="tdc-sidebar-element tdc-element-inner-row" data-shortcode-name="' . $mapped_shortcode['base'] . '">' . $mapped_shortcode['name'] . '</div>';
							?>
								<script>
									window.tdcPostSettings.mappedShortcodes.push( <?php echo '\'' . $mapped_shortcode['base'] . '\'' ?> );
								</script>
							<?php
							continue;
						}

						if ( in_array( $mapped_shortcode['base'],
							array(
								'td_block_big_grid_slide',      // issues
								'td_block_trending_now',
								'td_block_video_youtube',
								'td_block_video_vimeo',
								'td_block_ad_box',              // issues
								'td_block_authors',
								'td_block_homepage_full_1',     // issues
								'td_block_popular_categories',
								'td_block_slide',               // issues
								'td_block_text_with_title',
								'td_block_weather',
								'td_block_exchange',
								'td_block_instagram',
								'td_block_social_counter') ) ) {

							echo '<div style="color: #FF0000" data-shortcode-name="' . $mapped_shortcode['base'] . '">' . $mapped_shortcode['name'] . '</div>';
							?>
								<script>
									window.tdcPostSettings.mappedShortcodes.push( <?php echo '\'' . $mapped_shortcode['base'] . '\'' ?> );
								</script>
							<?php
							continue;
						}

						if ( isset($mapped_shortcode['map_in_visual_composer']) && true === $mapped_shortcode['map_in_visual_composer'] ) {
							echo '<div class="tdc-sidebar-element tdc-element" data-shortcode-name="' . $mapped_shortcode['base'] . '">' . $mapped_shortcode['name'] . '</div>';
							?>
								<script>
									window.tdcPostSettings.mappedShortcodes.push( <?php echo '\'' . $mapped_shortcode['base'] . '\'' ?> );
								</script>
							<?php
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


