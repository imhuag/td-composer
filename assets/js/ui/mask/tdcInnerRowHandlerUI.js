/**
 * Created by tagdiv on 28.03.2016.
 */

/* global jQuery:{} */
/* global Backbone:{} */
/* global _:{} */

/* global tdcMaskUI:{} */



var tdcInnerRowHandlerUI;

(function( jQuery, backbone, _, undefined ) {

    'use strict';

    tdcInnerRowHandlerUI = {

        _elementCssClass: 'tdc-inner-row',

        //_handlerId: tdcInnerColumnHandlerUI._elementCssClass,
        _handlerId: 'tdc-inner-row',

        _handlerText: 'Inner Row',

        _handlerCssClass: 'tdc-mask-inner-row',




        $elementInnerColumn: undefined,

        _$handler: undefined,


        _isInitialized: false,




        init: function() {

            if ( tdcInnerRowHandlerUI._isInitialized ) {
                return;
            }

            tdcInnerRowHandlerUI._$handler = jQuery( '<div id="' + tdcInnerRowHandlerUI._handlerCssClass + '">' + tdcInnerRowHandlerUI._handlerText + '</div>' );

            tdcMaskUI.$wrapper.append( tdcInnerRowHandlerUI._$handler );


            tdcInnerRowHandlerUI._$handler.mousedown( function( event ) {

            }).mouseup( function() {

            }).mousemove( function( event ) {

                event.preventDefault();

                tdcMaskUI.show();

            }).mouseenter(function( event ) {

                event.preventDefault();

                tdcMaskUI.show();

            }).mouseleave( function( event ) {

            });

            tdcMaskUI.addHandler( tdcInnerRowHandlerUI._handlerId, tdcInnerRowHandlerUI );

            tdcInnerRowHandlerUI._isInitialized = true;
        },


        setElement: function( $element ) {

            var $elementInnerColumn = $element.closest( '.' + tdcInnerRowHandlerUI._elementCssClass );
            if ( $elementInnerColumn.length ) {
                tdcInnerRowHandlerUI.$elementInnerColumn = $elementInnerColumn;
                tdcInnerRowHandlerUI._$handler.show();
            } else {
                tdcInnerRowHandlerUI._$handler.hide();
            }
        }

    };

})( jQuery, Backbone, _ );