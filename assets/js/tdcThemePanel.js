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
        }
    };

    tdcThemePanel.init();

})( _ );
