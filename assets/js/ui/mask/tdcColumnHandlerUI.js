/**
 * Created by tagdiv on 28.03.2016.
 */

/* global jQuery:{} */
/* global Backbone:{} */
/* global _:{} */

/* global tdcMaskUI:{} */



var tdcColumnHandlerUI;

(function( jQuery, backbone, _, undefined ) {

    'use strict';

    tdcColumnHandlerUI = {

        _elementCssClass: 'tdc-column',

        //_handlerId: tdcInnerColumnHandlerUI._elementCssClass,
        _handlerId: 'tdc-column',

        _handlerText: 'Column',

        _handlerCssClass: 'tdc-mask-column',




        $elementInnerColumn: undefined,

        _$handler: undefined,


        _isInitialized: false,




        init: function() {

            if ( tdcColumnHandlerUI._isInitialized ) {
                return;
            }

            tdcColumnHandlerUI._$handler = jQuery( '<div id="' + tdcColumnHandlerUI._handlerCssClass + '">' + tdcColumnHandlerUI._handlerText + '</div>' );

            tdcMaskUI.$wrapper.append( tdcColumnHandlerUI._$handler );


            tdcColumnHandlerUI._$handler.mousedown( function( event ) {

            }).mouseup( function() {

            }).mousemove( function( event ) {

                event.preventDefault();

                tdcMaskUI.show();

            }).mouseenter(function( event ) {

                event.preventDefault();

                tdcMaskUI.show();

            }).mouseleave( function( event ) {

            });

            tdcMaskUI.addHandler( tdcColumnHandlerUI._handlerId, tdcColumnHandlerUI );

            tdcColumnHandlerUI._isInitialized = true;
        },


        setElement: function( $element ) {

            var $elementInnerColumn = $element.closest( '.' + tdcColumnHandlerUI._elementCssClass );
            if ( $elementInnerColumn.length ) {
                tdcColumnHandlerUI.$elementInnerColumn = $elementInnerColumn;
                tdcColumnHandlerUI._$handler.show();
            } else {
                tdcColumnHandlerUI._$handler.hide();
            }
        }

    };

})( jQuery, Backbone, _ );