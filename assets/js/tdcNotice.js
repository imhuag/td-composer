/**
 * Created by tagdiv on 23.06.2016.
 */

/* global jQuery: {} */

var tdcNotice;

(function( jQuery, undefined ) {

    'use strict';

    tdcNotice = {

        $_noticeWrapper: undefined,

        _isInitialized: false,

        notice: function( msg, isError, hasClose ) {

            if ( ! tdcNotice._isInitialized ) {
                return;
            }

            this.msg = msg;

            var errorClass = '';
            if ( 'undefined' !== typeof isError && true === isError ) {
                errorClass = 'tdc-notice-error';
            }
            var closeElement = '';
            if ( 'undefined' !== typeof hasClose && true === hasClose ) {
                closeElement = '<div class="tdc-close-notice"></div>';
            }

            this.$element = jQuery( '<div class="tdc-notice ' + errorClass + '">' + msg + closeElement + '</div>' );

            tdcNotice.$_noticeWrapper.append( this.$element );

            //var that = this;
            //
            //setTimeout(function() {
            //
            //    that.$element.remove();
            //
            //}, 2000 );
        },

        init: function() {

            if ( tdcNotice._isInitialized ) {
                return;
            }

            tdcNotice.$_noticeWrapper = jQuery( '<div class="tdc-notice-wrapper"></div>' );

            tdcNotice.$_noticeWrapper.on( 'click', '.tdc-close-notice', function( event ) {
                jQuery( this ).closest( '.tdc-notice' ).remove();
            });

            jQuery( '#tdc-live-iframe-wrapper').append( tdcNotice.$_noticeWrapper );

            tdcNotice._isInitialized = true;
        }

    };
    tdcNotice.init();

})( jQuery );
