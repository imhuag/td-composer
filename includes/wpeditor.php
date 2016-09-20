<?php
/**
 * Created by PhpStorm.
 * User: tagdiv
 * Date: 16.09.2016
 * Time: 15:00
 */

define('WP_USE_THEMES', false);

//require_once( '../../../../wp-load.php' );
$parse_uri = explode( 'wp-content', $_SERVER['SCRIPT_FILENAME'] );
require_once( $parse_uri[0] . 'wp-load.php' );

//<link rel="stylesheet"  href="../wp-admin/load-styles.php?c=1&dir=ltr&load%5B%5D=dashicons,admin-bar,buttons,media-views,common,forms,admin-menu,dashboard,list-tables,edit,revisions,media,themes,about,nav-menu&load%5B%5D=s,widgets,site-icon,l10n,wp-auth-check,wp-color-picker&ver=4.6.1" type="text/css" >

?>

<html>
	<head>

		<?php

			wp_enqueue_style( 'common' );
			wp_enqueue_style( 'forms' );
			wp_enqueue_style( 'admin-menu' );
			wp_enqueue_style( 'dashboard' );
			wp_enqueue_style( 'list-tables' );
			wp_enqueue_style( 'edit' );
			wp_enqueue_style( 'revisions' );
			wp_enqueue_style( 'media' );

		?>

		<style>

			.tdc-wpeditor {
				position: absolute;
				top: 50%;
				left: 50%;
				margin-right: -50%;
				transform: translate(-50%, -50%)
			}

		</style>

		<script>
			window.loadIframe = function() {

				var $body = jQuery( 'body' ),
					$tdcWpeditor = jQuery( '.tdc-wpeditor' ),
					$outerDocument = jQuery( window.parent.document ),
					$tdcIframeWpeditor = $outerDocument.find( '#tdc-iframe-wpeditor' ),
					modelId = $tdcIframeWpeditor.data( 'model_id' ),
					model = window.parent.tdcIFrameData.getModel( modelId ),
					editorWidth = model.get( 'cssWidth' ),
					mappedParameterName = $tdcIframeWpeditor.data( 'mapped_parameter_name' ),
					mappedParameterValue = model.get('attrs')[mappedParameterName];

				$tdcWpeditor.width( editorWidth );

				var editor = window.tinymce.activeEditor;

				// The editor should not be null
				if ( _.isNull( editor ) ) {
					alert ( 'editor null' );
				} else {
					editor.setContent( mappedParameterValue );

					editor.on( 'keyup undo change', function( event ) {

						var currentValue = editor.getContent({format: 'html'}),

						// @todo This should be the content before change
							previousValue = currentValue;

						window.parent.tdcSidebarController.onUpdate (
							model,
							'content',    // the name of the parameter
							previousValue,                  // the old value
							currentValue                    // the new value
						);
					});

					$body.on( 'keyup change', '#tdc-wpeditor', function(event) {

						var currentValue = jQuery(this).val(),

						// @todo This should be the content before change
							previousValue = currentValue;

						window.parent.tdcSidebarController.onUpdate (
							model,
							'content',    // the name of the parameter
							previousValue,                  // the old value
							currentValue                    // the new value
						);
					});
				}
			}
		</script>



	</head>
	<body class="test" onload="loadIframe()">

		<div class="tdc-wpeditor">

			<?php

				// This make the js editor to be instantiated (it's not null)
				add_filter( 'wp_default_editor', create_function('', 'return "tmce";') );

				$wpeditorId = 'tdc-wpeditor';

				wp_editor(
					'',
					$wpeditorId
				);
			?>

		</div>

		<?php

		// Dialog internal linking
		_WP_Editors::enqueue_scripts();
		do_action('admin_print_footer_scripts');
		do_action( 'admin_footer' );
		_WP_Editors::editor_js();

		wp_enqueue_media();

		//do_action('admin_print_styles');

		?>

	</body>
</html>
