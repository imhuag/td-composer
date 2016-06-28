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
?>
	<script type="text/javascript">

		// Add 'td_composer' class to html element
		window.document.documentElement.className += ' td_composer';

		window.onbeforeunload = function ( event) {
			if ( ! tdcMain.getContentModified() ) {
				return;
			}
			return 'Dialog text here';
//			if ( ! tdcMain.getContentModified() ) {
//
//				alert(111);
//				return false;
//			}
//			var dialogText = 'Dialog text here';
//			event.returnValue = dialogText;
//			return dialogText;
		}

		window.tdcPostSettings = {
			postId: '<?php echo $post->ID; ?>',
			postUrl: '<?php echo get_permalink($post->ID); ?>',
			postContent: '<?php echo $postContent; ?>',
			postMetaDirtyContent: '<?php echo get_post_meta( $post->ID, 'tdc_dirty_content', true ) ?>',
			postMetaVcJsStatus: '<?php echo get_post_meta( $post->ID, '_wpb_vc_js_status', true ) ?>'
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


		<!-- the inspector -->
		<div class="tdc-inspector-wrap">
			<div class="tdc-inspector">
				<div class="tdc-empty-sidebar">
					<div class="tdc-builder-logo"></div>
					<div class="tdc-start-tips">
						<span>Welcome!</span>
						Add an element to begin
					</div>
					<div class="tdc-documentation">
						For more information, please read the <a href="#">DOCUMENTATION</a>
					</div>
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
				<div class="tdc-current-element-head">
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
			<div id="tdc-recycle">
				<div class="tdc-delete-text"><span>Delete</span></div>
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

					$mapped_shortcodes = tdc_mapper::get_mapped_shortcodes();

					foreach ($mapped_shortcodes as $mapped_shortcode ) {

						if ( 'vc_row' === $mapped_shortcode['base'] ) {
							echo '<div class="tdc-sidebar-element tdc-row-temp" data-shortcode-name="' . $mapped_shortcode['base'] . '"><div class="tdc-element-ico tdc-ico-' . $mapped_shortcode['base'] . '"></div><div class="tdc-element-id">' . $mapped_shortcode['name'] . '</div></div>';
							continue;
						}

						if ( 'vc_row_inner' === $mapped_shortcode['base'] ) {
							echo '<div class="tdc-sidebar-element tdc-element-inner-row-temp" data-shortcode-name="' . $mapped_shortcode['base'] . '"><div class="tdc-element-ico tdc-ico-' . $mapped_shortcode['base'] . '"></div><div class="tdc-element-id">' . $mapped_shortcode['name'] . '</div></div>';
							continue;
						}

						if ( isset($mapped_shortcode['map_in_visual_composer']) && true === $mapped_shortcode['map_in_visual_composer'] ) {
							echo '<div class="tdc-sidebar-element tdc-element" data-shortcode-name="' . $mapped_shortcode['base'] . '"><div class="tdc-element-ico tdc-ico-' . $mapped_shortcode['base'] . '"></div><div class="tdc-element-id">' . $mapped_shortcode['name'] . '</div></div>';
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


