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

$postContent = str_replace( '\'', '\\\'', $post->post_content );
$postContent = str_replace( array( "\r\n", "\n", "\r" ), array( "\r\n'+'" ), $postContent );


//@todo - refactorizare aici json_encode
//<link rel="stylesheet" href="http://basehold.it/22">
?>


	<script type="text/javascript">

		// Add 'td_composer' class to html element
		window.document.documentElement.className += ' td_composer';

		// "Starting in Chrome 51, a custom string will no longer be shown to the user. Chrome will still show a dialog to prevent users from losing data, but it’s contents will be set by the browser instead of the web page."
		// https://developers.google.com/web/updates/2016/04/chrome-51-deprecations?hl=en#remove-custom-messages-in-onbeforeload-dialogs
		window.onbeforeunload = function ( event) {
			if ( ! tdcMain.getContentModified() ) {
				return;
			}
			return 'Dialog text here';
		}

		window.tdcPostSettings = {
			postId: '<?php echo $post->ID; ?>',
			postUrl: '<?php echo get_permalink($post->ID); ?>',
			postContent: '<?php echo $postContent; ?>',
			postMetaDirtyContent: '<?php echo get_post_meta( $post->ID, 'tdc_dirty_content', true ) ?>',
			postMetaVcJsStatus: '<?php echo get_post_meta( $post->ID, '_wpb_vc_js_status', true ) ?>',
		};

	</script>

	<!-- the composer sidebar -->
	<div id="tdc-sidebar">
		<div class="tdc-top-buttons">
			<div class="tdc-add-element">
				Add element
				<span class="tdc-icon-add"></span>
			</div>
			<div class="tdc-save-page">
				<span class="tdc-icon-save"></span>
			</div>
			<div class="tdc-close-page">
				<span class="tdc-icon-close"></span>
			</div>
		</div>

		<div class="tdc-empty-sidebar" style="text-align: left">
			<div class="tdc-start-tips">
				<span>Welcome!</span>
				Add or click an element to begin. Thanks for using tagDiv Composer!
			</div>

			<div id="tdc-theme-panel">
				<?php
				require_once( plugin_dir_path( __FILE__ ) . '../panel/tdc_header.php');
				?>
			</div>
		</div>


		<!-- the inspector -->
		<div class="tdc-inspector-wrap">
			<div class="tdc-inspector">
				<!-- breadcrumbs browser -->
				<div class="tdc-breadcrumbs">
					<div id="tdc-breadcrumb-row">
						<a href="#" title="The parent row.">row</a>
					</div>
					<div id="tdc-breadcrumb-column">
						<span class="tdc-breadcrumb-arrow"></span>
						<a href="#" title="The parent column.">column</a>
					</div>
					<div id="tdc-breadcrumb-inner-row">
						<span class="tdc-breadcrumb-arrow"></span>
						<a href="#" title="The parent inner row.">inner-row</a>
					</div>
					<div id="tdc-breadcrumb-inner-column">
						<span class="tdc-breadcrumb-arrow"></span>
						<a href="#" title="The parent inner column.">inner-column</a>
					</div>
				</div>
				<div class="tdc-current-element-head" title="This is the type (shortcode) of the current selected element.">
				</div>
				<div class="tdc-tabs-wrapper">
				</div>
			</div>
		</div>


		<div class="tdc-sidebar-bottom">
			<div class="tdc-sidebar-close">
				<span class="tdc-icon-sidebar-close"></span>
			</div>
			<div class="tdc-sidebar-open">
				<span class="tdc-icon-sidebar-open"></span>
			</div>
			<div class="tdc-bullet">
				<span class="tdc-icon-bullet"></span>
			</div>
			<div class="tdc-sidebar-info"></div>
		</div>

		<div id="tdc-restore">
			Restore
		</div>

		<div id="tdc-restore-content">
		</div>

		<!-- modal window -->
		<div class="tdc-sidebar-modal tdc-sidebar-modal-elements">
			<div class="tdc-sidebar-modal-search">
				<input type="text" placeholder="Search" name="Search">
				<span class="tdc-modal-magnifier"></span>
			</div>
			<div class="tdc-sidebar-modal-content">
				<!-- sidebar elements list -->
				<div class="tdc-sidebar-elements">
					<?php

					$top_mapped_shortcodes = array();
					$middle_mapped_shortcodes = array();
					$bottom_mapped_shortcodes = array();

					$mapped_shortcodes = tdc_mapper::get_mapped_shortcodes();

					foreach ($mapped_shortcodes as &$mapped_shortcode ) {

						if ( 'vc_row' === $mapped_shortcode['base'] ||
						     'vc_row_inner' === $mapped_shortcode['base'] ||
						     'vc_empty_space' === $mapped_shortcode['base'] ) {
							$top_mapped_shortcodes[$mapped_shortcode['base']] = $mapped_shortcode;

						} else if ( false === strpos( $mapped_shortcode['name'], 'Block' ) && false === strpos( $mapped_shortcode['name'], 'Big Grid' ) ) {
							$bottom_mapped_shortcodes[] = $mapped_shortcode;
						} else {
							$middle_mapped_shortcodes[] = $mapped_shortcode;
						}
					}

					function tdc_sort_name( $mapped_shortcode_1, $mapped_shortcode_2 ) {
						return strcmp( $mapped_shortcode_1['name'], $mapped_shortcode_2['name'] );
					}

					usort( $bottom_mapped_shortcodes, 'tdc_sort_name');



					// Row
					echo '<div class="tdc-sidebar-element tdc-row-temp" data-shortcode-name="' . $top_mapped_shortcodes['vc_row']['base'] . '">' .
							'<div class="tdc-element-ico tdc-ico-' . $top_mapped_shortcodes['vc_row']['base'] . '"></div>' .
							'<div class="tdc-element-id">' . $top_mapped_shortcodes['vc_row']['name'] . '</div>' .
				        '</div>';

					// Inner Row
					echo
						'<div class="tdc-sidebar-element tdc-element-inner-row-temp" data-shortcode-name="' . $top_mapped_shortcodes['vc_row_inner']['base'] . '">' .
							'<div class="tdc-element-ico tdc-ico-' . $top_mapped_shortcodes['vc_row_inner']['base'] . '"></div>' .
							'<div class="tdc-element-id">' . $top_mapped_shortcodes['vc_row_inner']['name'] . '</div>' .
					    '</div>';

					// Empty space
					echo
						'<div class="tdc-sidebar-element tdc-element" data-shortcode-name="' . $top_mapped_shortcodes['vc_empty_space']['base'] . '">' .
							'<div class="tdc-element-ico tdc-ico-' . $top_mapped_shortcodes['vc_empty_space']['base'] . '"></div>' .
							'<div class="tdc-element-id">' . $top_mapped_shortcodes['vc_empty_space']['name'] . '</div>' .
						'</div>';

					foreach ($middle_mapped_shortcodes as $mapped_shortcode ) {
						if ( isset($mapped_shortcode['map_in_visual_composer']) && true === $mapped_shortcode['map_in_visual_composer'] ) {
							$buffer =
								'<div class="tdc-sidebar-element tdc-element" data-shortcode-name="' . $mapped_shortcode['base'] . '">' .
									'<div class="tdc-element-ico tdc-ico-' . $mapped_shortcode['base'] . '"></div>' .
									'<div class="tdc-element-id">' . $mapped_shortcode['name'] . '</div>' .
								'</div>';

							echo $buffer;
						}
					}

					foreach ($bottom_mapped_shortcodes as $mapped_shortcode ) {
						if ( isset($mapped_shortcode['map_in_visual_composer']) && true === $mapped_shortcode['map_in_visual_composer'] ) {
							$buffer =
								'<div class="tdc-sidebar-element tdc-element" data-shortcode-name="' . $mapped_shortcode['base'] . '">' .
									'<div class="tdc-element-ico tdc-ico-' . $mapped_shortcode['base'] . '"></div>' .
									'<div class="tdc-element-id">' . $mapped_shortcode['name'] . '</div>' .
								'</div>';

							echo $buffer;
						}
					}

					?>
				</div>
			</div>
		</div>
	</div>


	<!-- The live iFrame loads in this wrapper :) -->
	<div id="tdc-live-iframe-wrapper" class="tdc-live-iframe-wrapper-full"></div>

	<div style="height: 1px; visibility: hidden; overflow: hidden;">

		<?php
		$is_IE = false;   // used by wp-admin/edit-form-advanced.php
		require_once ABSPATH . 'wp-admin/edit-form-advanced.php';
		?>

	</div>




<?php
require_once( ABSPATH . 'wp-admin/admin-footer.php' );


