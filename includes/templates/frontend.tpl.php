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
			<div class="tdc-current-element">
			</div>
			<div class="tdc-tabs">
				<a href="#" data-tab-id="td-tab-id-1" class="tdc-tab-active">General</a>
				<a href="#" data-tab-id="td-tab-id-2">Filter</a>
				<a href="#" data-tab-id="td-tab-id-3">Ajax filter</a>
				<a href="#" data-tab-id="td-tab-id-4">Pagination</a>
			</div>
			<div class="tdc-tab-content-wrap">
				<div class="tdc-tab-content tdc-tab-content-visible" id="td-tab-id-1">
					<!-- tab 1 -->


					<div class="tdc-property-wrap tdc-property-textfield">
						<div class="tdc-property-title">My control title:</div>
						<div class="tdc-property">
							<input name="my_name" type="text" value="Block title"/>
						</div>
					</div>


					<!-- textfield -->
					<div class="tdc-property-wrap tdc-property-textfield">
						<div class="tdc-property-title">My random shit:</div>
						<div class="tdc-property">
							<input name="my_name" type="text" value="Block title"/>
						</div>
					</div>


					<!-- dropdown -->
					<div class="tdc-property-wrap tdc-property-dropdown">
						<div class="tdc-property-title">My prop:</div>
						<div class="tdc-property">
							<select name="category_id" data-option=""><option class="" value="">- All categories -</option><option class="988" value="988">Fashion</option><option class="2" value="2">Featured</option><option class="982" value="982">Lifestyle</option><option class="984" value="984"> - Health</option><option class="985" value="985"> - Music</option><option class="986" value="986"> - Recipes</option><option class="983" value="983"> - Travel</option><option class="990" value="990">Music</option><option class="991" value="991">Photography</option><option class="989" value="989">Sport</option><option class="1" value="1">Uncategorized</option><option class="987" value="987">World</option></select>
						</div>
					</div>



					<!-- colorpicker -->
					<?php
					$widget_color_picker_id = tdc_util::generate_unique_id();
					?>
					<div class="tdc-property-wrap tdc-property-colorpicker">
						<div class="tdc-property-title">My colorpicker:</div>
						<div class="tdc-property">
							<input id="<?php echo $widget_color_picker_id ?>" name="my_name" type="text" value="#dd3333"/>
						</div>
					</div>
					<script>
						jQuery( document ).ready(function() {
							jQuery("#<?php echo $widget_color_picker_id ?>").cs_wpColorPicker();
						});
					</script>





				</div>
				<div class="tdc-tab-content" id="td-tab-id-2">
					<!-- tab 1 -->

					Leberkas shank venison meatball turducken frankfurter tenderloin shoulder. Leberkas turkey spare ribs shankle ribeye sausage. Frankfurter pork ribeye tenderloin filet mignon jerky boudin pig tri-tip chuck brisket jowl. Pork chop flank tri-tip tenderloin kevin pork loin landjaeger biltong, turkey alcatra pastrami ham hock swine drumstick jowl. Salami alcatra chuck biltong, leberkas ham hock chicken ground round andouille pancetta beef bacon short ribs strip steak shoulder. Sausage doner strip steak filet mignon. Pork chop bresaola bacon hamburger boudin filet mignon capicola kielbasa pig venison short loin cupim jerky shoulder.
					Salami porchetta leberkas, pancetta ground round frankfurter shoulder tenderloin andouille shankle ham picanha. Sausage shoulder short ribs, brisket cupim tri-tip hamburger beef. Kielbasa shank pastrami, landjaeger rump leberkas ribeye ham venison tri-tip tenderloin. Jerky chicken ham andouille, jowl sausage venison salami. Spare ribs pork chop pork loin, prosciutto beef ribs tri-tip capicola salami. Porchetta t-bone meatball salami filet mignon short ribs.
				</div>
				<div class="tdc-tab-content" id="td-tab-id-3">
					<!-- tab 1 -->

					Salami porchetta leberkas, pancetta ground round frankfurter shoulder tenderloin andouille shankle ham picanha. Sausage shoulder short ribs, brisket cupim tri-tip hamburger beef. Kielbasa shank pastrami, landjaeger rump leberkas ribeye ham venison tri-tip tenderloin. Jerky chicken ham andouille, jowl sausage venison salami. Spare ribs pork chop pork loin, prosciutto beef ribs tri-tip capicola salami. Porchetta t-bone meatball salami filet mignon short ribs.
					Does your lorem ipsum text long for something a little meatier? Give our generator a try… it’s tasty!
				</div>
				<div class="tdc-tab-content" id="td-tab-id-4">
					<!-- tab 1 -->

					Turkey prosciutto short loin chicken pork loin turducken. Doner beef turducken, biltong pastrami pork prosciutto short ribs tri-tip frankfurter brisket leberkas. Hamburger doner venison tongue chicken shank pig sirloin corned beef filet mignon rump alcatra. Frankfurter venison porchetta strip steak short ribs.
					Swine prosciutto picanha, flank corned beef meatloaf turkey chicken hamburger short loin. Salami meatball prosciutto tongue pork. Pork chop biltong boudin bresaola, tail tongue pancetta prosciutto sausage. Pork belly landjaeger cupim cow shoulder, tail tenderloin. Brisket picanha pork porchetta flank chicken ham bresaola capicola beef cupim jowl short loin. Turkey biltong spare ribs corned beef, shoulder pancetta filet mignon hamburger meatball.
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


