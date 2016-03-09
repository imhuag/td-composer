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



	<!--<div id="tdc_inspector">-->
	<!--	<div class="tdc_title">Inspector</div>-->
	<!--	<div class="tdc_wrapper">-->
	<!--	</div>-->
	<!--</div>-->
	<!---->
	<!--<div id="tdc_elements">-->
	<!--	<div class="tdc_title">Elements</div>-->
	<!--	<div class="tdc_wrapper">-->
	<!--		<div class="tdc_element">Block 1</div>-->
	<!--		<div class="tdc_element">Block 2</div>-->
	<!--	</div>-->
	<!--</div>-->
	<!---->
	<!--<div id="tdc_masque">-->
	<!--	<div class="tdc_masque_content">-->
	<!--	</div>-->
	<!--	<div id="tdc_row">-->
	<!--		Row-->
	<!--		<div id="tdc_column">-->
	<!--			Column-->
	<!--		</div>-->
	<!--	</div>-->
	<!--</div>-->


	<div id="tdc_wrapper"></div>

	<div style="height: 1px; visibility: hidden; overflow: hidden;">

		<?php
		$is_IE = false;   // used by wp-admin/edit-form-advanced.php
		require_once ABSPATH . 'wp-admin/edit-form-advanced.php';
		?>

	</div>

<?php
require_once( ABSPATH . 'wp-admin/admin-footer.php' );


