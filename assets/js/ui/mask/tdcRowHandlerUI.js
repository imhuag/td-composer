/**
 * Created by tagdiv on 28.03.2016.
 */

/* global jQuery:{} */
/* global Backbone:{} */
/* global _:{} */

/* global tdcMaskUI:{} */



var tdcRowHandlerUI;

(function( jQuery, backbone, _, undefined ) {

    'use strict';

    tdcRowHandlerUI = {

        _elementCssClass: 'tdc-row',

        //_handlerId: tdcInnerColumnHandlerUI._elementCssClass,
        _handlerId: 'tdc-row',

        _handlerText: 'Row',

        _handlerCssClass: 'tdc-mask-row',




        $elementInnerColumn: undefined,

        _$handler: undefined,


        _isInitialized: false,




        init: function() {

            if ( tdcRowHandlerUI._isInitialized ) {
                return;
            }

            tdcRowHandlerUI._$handler = jQuery( '<div id="' + tdcRowHandlerUI._handlerCssClass + '">' + tdcRowHandlerUI._handlerText + '</div>' );

            tdcMaskUI.$wrapper.append( tdcRowHandlerUI._$handler );


            tdcRowHandlerUI._$handler.mousedown( function( event ) {

            }).mouseup( function() {

            }).mousemove( function( event ) {

                event.preventDefault();

                tdcMaskUI.show();

            }).mouseenter(function( event ) {

                event.preventDefault();

                tdcMaskUI.show();

            }).mouseleave( function( event ) {

            });

            tdcMaskUI.addHandler( tdcRowHandlerUI._handlerId, tdcRowHandlerUI );

            tdcRowHandlerUI._isInitialized = true;
        },


        setElement: function( $element ) {

            var $elementInnerColumn = $element.closest( '.' + tdcRowHandlerUI._elementCssClass );
            if ( $elementInnerColumn.length ) {
                tdcRowHandlerUI.$elementInnerColumn = $elementInnerColumn;
                tdcRowHandlerUI._$handler.show();
            } else {
                tdcRowHandlerUI._$handler.hide();
            }
        }

    };

})( jQuery, Backbone, _ );