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

if (!tdc_state::is_initialized()) {
	return;
}


global $post;

$post = tdc_state::get_post();
$post_ID = tdc_state::get_post_id();
$post_url = tdc_state::get_post_url();
$post_content = tdc_state::get_post_content();



add_thickbox();
wp_enqueue_media( array( 'post' => $post_ID ) );

require_once( ABSPATH . 'wp-admin/admin-header.php' );

?>
	<script type="text/javascript">

		window.tdcPostSettings = {
			postId: '<?php echo $post_ID; ?>',
			postUrl: '<?php echo $post_url; ?>',
			postContent: '<?php echo $post_content; ?>'
		};

	</script>


	<!-- the composer sidebar -->
	<div id="tdc-sidebar">
		<div class="tdc-top-buttons">
			<a href="#" class="tdc-add-element">Add element</a>
			<a href="#" class="tdc-save-page">Save page</a>
		</div>


		<!-- breadcrumbs browser -->
		<div class="tdc-breadcrumbs">
			<div class="tdc-breadcrumbs-path">
				<a href="#">row</a>
				<span class="tdc-breadcrumb-arrow"></span>
				<a href="#">column</a>
			</div>
			<div class="tdc-current-element">
				Block 14
			</div>
		</div>


		<!-- the inspector -->
		<div class="tdc-inspector">

		</div>



		<!-- modal window -->
		<div class="tdc-sidebar-modal tdc-modal-open">
			<div class="tdc-sidebar-modal-title">
				Add Element
				<a href="#" class="tdc-modal-close"></a>
			</div>
			<div class="tdc-sidebar-modal-content">
				<!-- sidebar elements list -->
				<div class="tdc-sidebar-elements">
					<div class="tdc-sidebar-element">Block 1</div>
					<div class="tdc-sidebar-element">Block 2</div>
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


