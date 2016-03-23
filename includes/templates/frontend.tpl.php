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
			<a href="#" class="tdc-save-page">Save page</a>
			<a href="#" class="tdc-add-element">Add element</a>
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
			<div class="tdc-tabs">
				<a href="#" data-tab-id="td-tab-id-1" class="tdc-tab-active">General</a>
				<a href="#" data-tab-id="td-tab-id-2">Filter</a>
				<a href="#" data-tab-id="td-tab-id-3">Ajax filter</a>
				<a href="#" data-tab-id="td-tab-id-4">Pagination</a>
			</div>
			<div class="tdc-tab-content-wrap">
				<div class="tdc-tab-content tdc-tab-content-visible" id="td-tab-id-1">
					Bacon ipsum dolor amet brisket tenderloin short ribs leberkas ground round bacon. Swine fatback ribeye tail. Cupim ball tip shankle kevin tail turkey. Pastrami t-bone turkey meatloaf pancetta bacon picanha turducken salami landjaeger flank filet mignon beef. Strip steak swine shank brisket venison.
					Boudin pig strip steak ball tip landjaeger tongue. Tongue ground round meatball, cupim bresaola venison tail capicola ham hock kevin chuck swine. Jowl rump shank turducken porchetta. T-bone biltong sirloin alcatra andouille shank.
				</div>
				<div class="tdc-tab-content" id="td-tab-id-2">
					Leberkas shank venison meatball turducken frankfurter tenderloin shoulder. Leberkas turkey spare ribs shankle ribeye sausage. Frankfurter pork ribeye tenderloin filet mignon jerky boudin pig tri-tip chuck brisket jowl. Pork chop flank tri-tip tenderloin kevin pork loin landjaeger biltong, turkey alcatra pastrami ham hock swine drumstick jowl. Salami alcatra chuck biltong, leberkas ham hock chicken ground round andouille pancetta beef bacon short ribs strip steak shoulder. Sausage doner strip steak filet mignon. Pork chop bresaola bacon hamburger boudin filet mignon capicola kielbasa pig venison short loin cupim jerky shoulder.
					Salami porchetta leberkas, pancetta ground round frankfurter shoulder tenderloin andouille shankle ham picanha. Sausage shoulder short ribs, brisket cupim tri-tip hamburger beef. Kielbasa shank pastrami, landjaeger rump leberkas ribeye ham venison tri-tip tenderloin. Jerky chicken ham andouille, jowl sausage venison salami. Spare ribs pork chop pork loin, prosciutto beef ribs tri-tip capicola salami. Porchetta t-bone meatball salami filet mignon short ribs.
				</div>
				<div class="tdc-tab-content" id="td-tab-id-3">
					Salami porchetta leberkas, pancetta ground round frankfurter shoulder tenderloin andouille shankle ham picanha. Sausage shoulder short ribs, brisket cupim tri-tip hamburger beef. Kielbasa shank pastrami, landjaeger rump leberkas ribeye ham venison tri-tip tenderloin. Jerky chicken ham andouille, jowl sausage venison salami. Spare ribs pork chop pork loin, prosciutto beef ribs tri-tip capicola salami. Porchetta t-bone meatball salami filet mignon short ribs.
					Does your lorem ipsum text long for something a little meatier? Give our generator a try… it’s tasty!
				</div>
				<div class="tdc-tab-content" id="td-tab-id-4">
					Turkey prosciutto short loin chicken pork loin turducken. Doner beef turducken, biltong pastrami pork prosciutto short ribs tri-tip frankfurter brisket leberkas. Hamburger doner venison tongue chicken shank pig sirloin corned beef filet mignon rump alcatra. Frankfurter venison porchetta strip steak short ribs.
					Swine prosciutto picanha, flank corned beef meatloaf turkey chicken hamburger short loin. Salami meatball prosciutto tongue pork. Pork chop biltong boudin bresaola, tail tongue pancetta prosciutto sausage. Pork belly landjaeger cupim cow shoulder, tail tenderloin. Brisket picanha pork porchetta flank chicken ham bresaola capicola beef cupim jowl short loin. Turkey biltong spare ribs corned beef, shoulder pancetta filet mignon hamburger meatball.
				</div>
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


