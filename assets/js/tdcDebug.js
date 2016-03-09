/**
 * Created by tagdiv on 09.03.2016.
 */

/* global jQuery:{} */

var tdcDebug;

(function( jQuery, undefined ) {

    'use strict';

    tdcDebug = {

        _debug: true,

        _logWindowObj: undefined,

        _content: undefined,

        _disabled: false,

        log: function( msg ) {
            if ( tdcDebug._debug ) {
                console.log( msg );
            }
        },

        logWindow: function( msg ) {

            if ( undefined === tdcDebug._logWindowObj ) {
                tdcDebug._logWindowObj = jQuery( '<div></div>' );

                var clearButton = jQuery( '<div style="width: 50px; cursor: pointer; float: left; border: 1px solid black">Clear</div>' );
                var disableButton = jQuery( '<div style="width: 50px; cursor: pointer; float: left; border: 1px solid black">Disable</div>' );

                tdcDebug._content = jQuery( '<div style="clear: both"></div>' );

                tdcDebug._logWindowObj.append( clearButton );
                tdcDebug._logWindowObj.append( disableButton );

                clearButton.click(function(event) {
                    tdcDebug._content.html( '' );
                });

                disableButton.click(function(event) {
                    tdcDebug._disabled = !tdcDebug._disabled;

                    if ( tdcDebug._disabled ) {
                        jQuery(this).css( 'background-color', '#FF000' );
                    } else {
                        jQuery(this).css( 'background-color', '' );
                    }
                });

                tdcDebug._logWindowObj.append( tdcDebug._content );

                jQuery( 'body' ).append(tdcDebug._logWindowObj);

                tdcDebug._logWindowObj.css({
                    width: 300,
                    height: 500,
                    border: '1px solid red',
                    position: 'fixed',
                    bottom: 0,
                    right: 20,
                    'background-color': '#FFFFFF',
                    overflow: 'scroll',
                    'z-index': 10000
                });
            }

            if ( !tdcDebug._disabled ) {
                tdcDebug._content.html( msg + '<br>' + tdcDebug._content.html() );
            }
        }
    };

})(jQuery);


