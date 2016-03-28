/**
 * Created by tagdiv on 28.03.2016.
 */

/* global jQuery:{} */
/* global Backbone:{} */
/* global _:{} */

/* global tdcMaskUI:{} */



var tdcInnerColumnHandlerUI;

(function( jQuery, backbone, _, undefined ) {

    'use strict';

    tdcInnerColumnHandlerUI = {

        _elementCssClass: 'tdc-inner-column',

        //_handlerId: tdcInnerColumnHandlerUI._elementCssClass,
        _handlerId: 'tdc-inner-column',

        _handlerText: 'Inner Column',

        _handlerCssClass: 'tdc-mask-inner-column',




        $elementInnerColumn: undefined,

        _$handler: undefined,


        _isInitialized: false,




        init: function() {

            if ( tdcInnerColumnHandlerUI._isInitialized ) {
                return;
            }

            tdcInnerColumnHandlerUI._$handler = jQuery( '<div id="' + tdcInnerColumnHandlerUI._handlerCssClass + '">' + tdcInnerColumnHandlerUI._handlerText + '</div>' );

            tdcMaskUI.$wrapper.append( tdcInnerColumnHandlerUI._$handler );


            tdcInnerColumnHandlerUI._$handler.mousedown( function( event ) {

            }).mouseup( function() {

            }).mousemove( function( event ) {

                event.preventDefault();

                tdcMaskUI.show();

            }).mouseenter(function( event ) {

                event.preventDefault();

                tdcMaskUI.show();

            }).mouseleave( function( event ) {

            });

            tdcMaskUI.addHandler( tdcInnerColumnHandlerUI._handlerId, tdcInnerColumnHandlerUI );

            tdcInnerColumnHandlerUI._isInitialized = true;
        },


        setElement: function( $element ) {

            var $elementInnerColumn = $element.closest( '.' + tdcInnerColumnHandlerUI._elementCssClass );
            if ( $elementInnerColumn.length ) {
                tdcInnerColumnHandlerUI.$elementInnerColumn = $elementInnerColumn;
                tdcInnerColumnHandlerUI._$handler.show();
            } else {
                tdcInnerColumnHandlerUI._$handler.hide();
            }
        }

    };

})( jQuery, Backbone, _ );
