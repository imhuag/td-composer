/**
 * Created by tagdiv on 23.06.2016.
 */

/* global jQuery: {} */
/* global tdcSidebar: {} */

var tdcEvents;

(function( jQuery ) {

    'use strict';

    tdcEvents = {

        // True to make a first check when init() is called
        _resizeCheckInterval: true,


        /**
         * Force a manual check. Usually when we need it, not at resize.
         */
        doCheck: function() {
            tdcEvents._resizeCheckInterval = true;
        },


        init: function() {

            jQuery(window).resize(function( event ) {
                tdcEvents._resizeCheckInterval = true;
            });

            setInterval(function() {

                if ( true === tdcEvents._resizeCheckInterval ) {

                    // Sidebar height
                    var $tdcSidebar = jQuery( '#tdc-sidebar' ),
                        $tdcLiveIframeWrapper = jQuery( '#tdc-live-iframe-wrapper' ),
                        newWidth = window.innerWidth;

                    $tdcSidebar.css( 'height', window.innerHeight );


                    // Inspector height
                    $tdcSidebar.find( '.tdc-inspector' ).css( 'height', window.innerHeight - 110 );


                    // Modal height
                    $tdcSidebar.find( '.tdc-sidebar-modal' ).css( 'height', window.innerHeight - 100 );


                    // Modal content height
                    $tdcSidebar.find( '.tdc-sidebar-modal-content' ).css( 'height', window.innerHeight - 150 );


                    // Iframe
                    if ( $tdcLiveIframeWrapper.hasClass( 'tdc-live-iframe-wrapper-inline' ) ) {
                        newWidth -= $tdcSidebar.width();
                    }
                    $tdcLiveIframeWrapper.css({
                        'width': newWidth,
                        'height': window.innerHeight
                    });

                    tdcEvents._resizeCheckInterval = false;
                }

            }, 500);
        }
    };

})( jQuery );
