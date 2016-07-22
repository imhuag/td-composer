/**
 * Created by tagdiv on 20.07.2016.
 */

/* global jQuery:{} */
/* global _:{} */

var tdcThemePanel;

(function( _, undefined ) {

    'use strict';

    tdcThemePanel = {

        $_panel: undefined,

        init: function() {

            tdcThemePanel.$_panel = jQuery( '#tdc-theme-panel' );

            jQuery( '#td_panel_big_form').attr( 'action', document.getElementById('tdc-live-iframe').src );

            jQuery( '#tdc_button_save_panel').click(function(event) {

                event.preventDefault();

                var data = {
                    error: undefined,
                    getShortcode: ''
                };

                tdcIFrameData.getShortcodeFromData( data );

                if ( !_.isUndefined( data.error ) ) {
                    tdcDebug.log( data.error );
                }

                if ( !_.isUndefined( data.getShortcode ) ) {
                    jQuery( '#tdc_content').val( data.getShortcode );
                    window.tdcPostSettings.postContent = data.getShortcode;
                }

                jQuery(this).closest('form').submit();
            });
        }
    };

    tdcThemePanel.init();

})( _ );
