/**
 * Created by tagdiv on 20.07.2016.
 */

/* global jQuery:{} */
/* global _:{} */

var tdcLivePanel;

(function( _, undefined ) {

    'use strict';

    tdcLivePanel = {

        $tdcAction: undefined,
        $tdcContent: undefined,

        $panel: undefined,

        init: function() {

            tdcLivePanel.$panel = jQuery( '#tdc-live-panel' );
            tdcLivePanel.$tdcAction = tdcLivePanel.$panel.find( '#tdc_action' );
            tdcLivePanel.$tdcContent = tdcLivePanel.$panel.find( '#tdc_content' );

            tdcLivePanel.$panel.on( 'click', '.td-radio-control-option', function(event){

                // Update the hidden field
                var wrapper_id = jQuery(this).data('control-id');
                jQuery('#hidden_' + wrapper_id).val(jQuery(this).data('option-value'));


                // Create new iframe
                //document.getElementById( 'tdc-live-iframe' ).src

                var $tdcLiveIframe = jQuery( '#tdc-live-iframe' );

                tdcLivePanel.$panel.attr( 'action', $tdcLiveIframe.attr( 'src' ) );



                // Get the new content (the post shortcode) and preview it
                var data = {
                    error: undefined,
                    getShortcode: ''
                };

                tdcIFrameData.getShortcodeFromData( data );

                if ( !_.isUndefined( data.error ) ) {
                    tdcDebug.log( data.error );
                }

                if ( !_.isUndefined( data.getShortcode ) ) {

                    tdcLivePanel.$tdcContent.val( data.getShortcode );

                    // The new post content is set to the global 'window.tdcPostSettings.postContent'
                    window.tdcPostSettings.postContent = data.getShortcode;
                }

                // This ensure that nothing will be save to the database
                // This field is restored to 'tdc_ajax_save_post' by the Save button
                tdcLivePanel.$tdcAction.val( 'preview' );


                //tdcAdminIFrameUI._$liveIframe.attr( 'id', 'test' );

                // Do a normal submit
                tdcLivePanel.$panel.submit();
            });
        }
    };

    tdcLivePanel.init();

})( _ );
