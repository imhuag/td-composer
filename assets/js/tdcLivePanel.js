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

        $tdcIframeCover: undefined,

        _iframeSrc: undefined,

        $panel: undefined,



        init: function() {

            tdcLivePanel.$panel = jQuery( '#tdc-live-panel' );
            tdcLivePanel.$tdcAction = tdcLivePanel.$panel.find( '#tdc_action' );
            tdcLivePanel.$tdcContent = tdcLivePanel.$panel.find( '#tdc_content' );
            tdcLivePanel.$tdcPageTemplate = tdcLivePanel.$panel.find( '#tdc_page_template' );

            tdcLivePanel.$tdcIframeCover = jQuery( '#tdc-iframe-cover' );
            //tdcLivePanel.$tdcIframeCover.hide();

            tdcLivePanel.$panel.submit({
                //test: 'testare'
            }, function( eventData ) {
                //tdcDebug.log( 'eventData' );
                //tdcDebug.log( eventData );

                var $newTdcLiveIframe = jQuery( '#tdc-live-iframe-temp' );

                $newTdcLiveIframe.load(function() {

                    var $this = jQuery( this );

                    // Just call 'tdcAdminIFrameUI.checkIframe', the load function has been called because of the 'reload frame' browse operation
                    if ( 'tdc-live-iframe-temp' !== $this.attr( 'id' ) ) {
                        tdcAdminIFrameUI.checkIframe( $this );
                        return;
                    }

                    var $iframeToRemove = jQuery( '#tdc-live-iframe' );

                    tdcLivePanel.$tdcIframeCover.removeClass( 'tdc-iframe-cover-show' );
                    $iframeToRemove.addClass( 'tdc-remove-iframe' );

                    setTimeout(function() {

                        tdcLivePanel.$tdcIframeCover.hide();
                        $iframeToRemove.remove();

                        $newTdcLiveIframe.attr( 'id', 'tdc-live-iframe' );

                        tdcAdminIFrameUI.checkIframe( $newTdcLiveIframe );

                        tdcLivePanel.$panel.attr( 'action', '' );

                    }, 400);
                });
            });

            tdcLivePanel.$panel.on( 'change', '#page_template', function(event) {

                event.preventDefault();

                // Update the hidden field
                var $this = jQuery(this),
                    wrapper_id = $this.data('control-id');

                jQuery('#hidden_' + wrapper_id).val(jQuery(this).closest( '.td-box').attr( 'id' ) );

                tdcLivePanel.$tdcPageTemplate.val( $this.val() );


                // Create new iframe

                var $tdcLiveIframe = jQuery( '#tdc-live-iframe' );

                if ( _.isUndefined( tdcLivePanel._iframeSrc ) ) {
                    tdcLivePanel._iframeSrc = $tdcLiveIframe.attr( 'src' );
                }

                var uniqueId = 'uid_' + Math.floor((Math.random() * 10000) + 1) + '_' + Math.floor((Math.random() * 100) + 1 ),
                    $newTdcLiveIframe = jQuery( '<iframe id="tdc-live-iframe-temp" name="' + uniqueId + '" scrolling="auto" src="about:blank" style="width: 100%; height: 100%" class="tdc-live-iframe-temp"></iframe>' );

                $newTdcLiveIframe.insertAfter( $tdcLiveIframe );


                tdcLivePanel.$panel.attr( 'target', uniqueId );
                tdcLivePanel.$panel.attr( 'action', tdcLivePanel._iframeSrc );

                tdcLivePanel.$tdcIframeCover.show();
                tdcLivePanel.$tdcIframeCover.addClass( 'tdc-iframe-cover-show' );


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


                // Do a normal submit
                tdcLivePanel.$panel.submit();

            });

            tdcLivePanel.$panel.on( 'click', '.td-radio-control-option', function(event) {

                event.preventDefault();

                // Update the hidden field
                var wrapper_id = jQuery(this).data('control-id');
                jQuery('#hidden_' + wrapper_id).val(jQuery(this).data('option-value'));


                // Create new iframe

                var $tdcLiveIframe = jQuery( '#tdc-live-iframe' );

                if ( _.isUndefined( tdcLivePanel._iframeSrc ) ) {
                    tdcLivePanel._iframeSrc = $tdcLiveIframe.attr( 'src' );
                }

                var uniqueId = 'uid_' + Math.floor((Math.random() * 10000) + 1) + '_' + Math.floor((Math.random() * 100) + 1 ),
                    $newTdcLiveIframe = jQuery( '<iframe id="tdc-live-iframe-temp" name="' + uniqueId + '" scrolling="auto" src="about:blank" style="width: 100%; height: 100%" class="tdc-live-iframe-temp"></iframe>' );

                $newTdcLiveIframe.insertAfter( $tdcLiveIframe );


                tdcLivePanel.$panel.attr( 'target', uniqueId );
                tdcLivePanel.$panel.attr( 'action', tdcLivePanel._iframeSrc );

                tdcLivePanel.$tdcIframeCover.show();
                tdcLivePanel.$tdcIframeCover.addClass( 'tdc-iframe-cover-show' );


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


                // Do a normal submit
                tdcLivePanel.$panel.submit();
            });
        }
    };

    tdcLivePanel.init();

})( _ );
