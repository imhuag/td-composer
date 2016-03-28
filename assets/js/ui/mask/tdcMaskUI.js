/**
 * Created by tagdiv on 25.03.2016.
 */

/* global jQuery:{} */
/* global Backbone:{} */
/* global _:{} */

/* global tdcAdminWrapperUI:{} */
/* global tdcAdminIFrameUI:{} */
/* global tdcOperationUI:{} */



var tdcMaskUI;

(function(jQuery, backbone, _, undefined) {

    'use strict';

    tdcMaskUI = {

        $currentElement: undefined,

        $wrapper: undefined,

        $handlerRow: undefined,
        $handlerColumn: undefined,
        $handlerInnerRow: undefined,
        $handlerInnerColumn: undefined,

        $elementRow: undefined,
        $elementColumn: undefined,
        $elementInnerRow: undefined,
        $elementInnerColumn: undefined,

        _isInitialized: false,

        // key - value handlers ( row, column, inner row and inner column)
        _handlers: undefined,



        init: function( $wrapper ) {

            if ( tdcMaskUI._isInitialized ) {
                return;
            }

            tdcMaskUI.$wrapper = $wrapper;

            tdcMaskUI.$wrapper.append( jQuery( '<div id="tdc-mask-content"></div>' ) );

            tdcInnerColumnHandlerUI.init();
            tdcInnerRowHandlerUI.init();
            tdcColumnHandlerUI.init();
            tdcRowHandlerUI.init();

            tdcMaskUI._isInitialized = true;
        },


        setCurrentElement: function( $currentElement ) {

            if ( ! tdcMaskUI._isInitialized ) {
                return;
            }

            tdcMaskUI.$currentElement = $currentElement;

            if ( ! _.isUndefined( tdcMaskUI.$currentElement ) ) {

                var offset = tdcMaskUI.$currentElement.offset(),
                    width = tdcMaskUI.$currentElement.outerWidth(),
                    height = tdcMaskUI.$currentElement.outerHeight( true );

                tdcMaskUI.$wrapper.css({
                    top: offset.top,
                    left: offset.left,
                    width: width,
                    height: height
                });

                tdcMaskUI.$wrapper.show();
                tdcMaskUI.setHandlers();



                //tdcDebug.log( offset.top + ' : ' + offset.left + ' : ' + width + ' : ' + height );

            } else {
                tdcMaskUI.$wrapper.hide();
            }
        },


        setHandlers: function() {

            if ( ! tdcMaskUI._isInitialized ) {
                return;
            }

            if ( ! _.isUndefined( tdcMaskUI.$currentElement ) && ! _.isUndefined( tdcMaskUI._handlers ) ) {

                _.map( tdcMaskUI._handlers, function( handler, handlerId ) {
                    handler.setElement( tdcMaskUI.$currentElement );
                });

                //var $elementInnerColumn = tdcMaskUI.$currentElement.closest( '.tdc-inner-column' );
                //if ( $elementInnerColumn.length ) {
                //    tdcMaskUI.$elementInnerColumn = $elementInnerColumn;
                //    tdcMaskUI.$handlerInnerColumn.show();
                //} else {
                //    tdcMaskUI.$handlerInnerColumn.hide();
                //}
                //
                //var $elementInnerRow = tdcMaskUI.$currentElement.closest( '.tdc-inner-row' );
                //if ( $elementInnerRow.length ) {
                //    tdcMaskUI.$elementInnerRow = $elementInnerRow;
                //    tdcMaskUI.$handlerInnerRow.show();
                //} else {
                //    tdcMaskUI.$handlerInnerRow.hide();
                //}
                //
                //var $elementColumn = tdcMaskUI.$currentElement.closest( '.tdc-column' );
                //if ( $elementColumn.length ) {
                //    tdcMaskUI.$elementColumn = $elementColumn;
                //}
                //
                //var $elementRow = tdcMaskUI.$currentElement.closest( '.tdc-row' );
                //if ( $elementRow.length ) {
                //    tdcMaskUI.$elementRow = $elementRow;
                //}
            }
        },


        addHandler: function( handlerId, handler ) {
            if ( _.isUndefined( tdcMaskUI._handlers ) ) {

                tdcMaskUI._handlers = {};
                tdcMaskUI._handlers[ handlerId ] = handler;

            } else if ( ! _.has( tdcMaskUI._handlers, handlerId ) ) {
                tdcMaskUI._handlers[ handlerId ] = handler;
            }
        },


        show: function() {
            if ( ! _.isUndefined( tdcMaskUI.$wrapper ) ) {
                tdcMaskUI.$wrapper.show();
            }
        },

        hide: function() {
            if ( ! _.isUndefined( tdcMaskUI.$wrapper ) ) {
                tdcMaskUI.$wrapper.hide();
            }
        }
    };


})( jQuery, Backbone, _ );