/**
 * Created by tagdiv on 25.03.2016.
 */

/* global jQuery:{} */
/* global Backbone:{} */
/* global _:{} */

/* global tdcAdminWrapperUI:{} */
/* global tdcAdminIFrameUI:{} */
/* global tdcOperationUI:{} */
/* global tdcSidebar:{} */

/* global tdcRowHandlerUI:{} */
/* global tdcColumnHandlerUI:{} */
/* global tdcInnerRowHandlerUI:{} */
/* global tdcInnerColumnHandlerUI:{} */




var tdcMaskUI;

(function(jQuery, backbone, _, undefined) {

    'use strict';

    tdcMaskUI = {

        // Element having 'tdc-row', 'tdc-column', 'tdc-element-inner-row' or 'tdc-inner-column' class
        $currentContainer: undefined,

        // Element having 'tdc-element' class
        $currentElement: undefined,

        $wrapper: undefined,

        $content: undefined,

        //$handlerRow: undefined,
        //$handlerColumn: undefined,
        //$handlerInnerRow: undefined,
        //$handlerInnerColumn: undefined,

        //$elementRow: undefined,
        //$elementColumn: undefined,
        //$elementInnerRow: undefined,
        //$elementInnerColumn: undefined,

        _isInitialized: false,

        // key - value handlers ( row, column, inner row and inner column)
        _handlers: undefined,


        contentSettings: {
            innerColumn: {
                top: 0,
                left: 0
            },
            innerRow: {
                top: 0,
                left: 0
            },
            column: {
                top: 0,
                left: 0
            },
            row: {
                top: 0,
                left: 0
            }
        },



    init: function( $wrapper ) {

        if ( tdcMaskUI._isInitialized ) {
            return;
        }

        tdcMaskUI.$wrapper = $wrapper;

        tdcMaskUI.$content = jQuery( '<div id="tdc-mask-content"></div>' );
        tdcMaskUI.$handler = jQuery( '<div id="tdc-mask-handler"></div>' );

        tdcMaskUI.$wrapper.after( tdcMaskUI.$content );
        tdcMaskUI.$wrapper.append( tdcMaskUI.$handler );


        tdcRowHandlerUI.init();
        tdcColumnHandlerUI.init();
        tdcInnerRowHandlerUI.init();
        tdcInnerColumnHandlerUI.init();

        tdcMaskUI._isInitialized = true;
    },


    setCurrentContainer: function( $currentContainer ) {

        if ( ! tdcMaskUI._isInitialized ) {
            return;
        }

        tdcMaskUI.$currentContainer = $currentContainer;

        if ( ! _.isUndefined( tdcMaskUI.$currentContainer ) ) {

            var $refObj,
                refObjOffset,
                top,
                left,
                width,
                height;

            if ( tdcColumnHandlerUI.isColumn( tdcMaskUI.$currentContainer ) || tdcInnerColumnHandlerUI.isInnerColumn( tdcMaskUI.$currentContainer ) ) {

                $refObj = tdcMaskUI.$currentContainer.find( '.tdc-elements:first' );

            } else if ( tdcRowHandlerUI.isRow( tdcMaskUI.$currentContainer ) || tdcInnerRowHandlerUI.isInnerRow( tdcMaskUI.$currentContainer ) ) {

                $refObj = tdcMaskUI.$currentContainer;
            }

            refObjOffset = $refObj.offset();

            top = refObjOffset.top;
            left = refObjOffset.left;
            width = $refObj.outerWidth();
            height = $refObj.outerHeight( true );

            tdcMaskUI.$content.css({
                top: top,
                left: left,
                width: width,
                height: height
            });

            tdcMaskUI.$content.show();

        } else {
            tdcMaskUI.$content.css({
                top: '',
                left: '',
                width: '',
                height: ''
            });

            tdcMaskUI.$content.hide();
        }
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

            tdcMaskUI.$content.css({
                top: offset.top,
                left: offset.left,
                width: width,
                height: height
            });

            tdcMaskUI.$wrapper.show();
            tdcMaskUI.$content.show();

            tdcMaskUI.setHandlers();



            //tdcDebug.log( offset.top + ' : ' + offset.left + ' : ' + width + ' : ' + height );

        } else {
            tdcMaskUI.$wrapper.hide();
            tdcMaskUI.$content.hide();

            //tdcDebug.log( 'current element undefined' );
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
        }
    },


    addHandler: function( handlerId, handler ) {

        if ( tdcMaskUI._isInitialized ) {
            return;
        }

        if ( _.isUndefined( tdcMaskUI._handlers ) ) {

            tdcMaskUI._handlers = {};
            tdcMaskUI._handlers[ handlerId ] = handler;

        } else if ( ! _.has( tdcMaskUI._handlers, handlerId ) ) {
            tdcMaskUI._handlers[ handlerId ] = handler;
        }
    },


    show: function() {

        if ( ! tdcMaskUI._isInitialized ) {
            return;
        }

        if ( ! _.isUndefined( tdcMaskUI.$wrapper ) ) {
            tdcMaskUI.$wrapper.show();
            tdcMaskUI.$content.show();
        }
    },


    hide: function() {

        if ( ! tdcMaskUI._isInitialized ) {
            return;
        }

        if ( ! _.isUndefined( tdcMaskUI.$wrapper ) ) {
            tdcMaskUI.$wrapper.hide();
            tdcMaskUI.$content.hide();
        }
    },


    /**
     * Calls the handler setBreadcrumb
     *
     * @param $element - the 'tdc-row', 'tdc-column', 'tdc-element-inner-row', 'tdc-inner-column' or the 'tdc-element' element
     * @param sidebarCurrentElementContent - optional - the html content of the sidebar current element
     */
    setBreadcrumb: function( $element, sidebarCurrentElementContent ) {

        if ( ! tdcMaskUI._isInitialized ) {
            return;
        }

        _.map( tdcMaskUI._handlers, function( handler, handlerId ) {
            handler.setBreadcrumb( $element );

            // Set html content of the sidebar current element
            if ( ! _.isUndefined( sidebarCurrentElementContent ) ) {
                tdcSidebar.setCurrentElementContent( sidebarCurrentElementContent );
            }

            // Close the sidebar modal 'Add Elements'
            tdcSidebar.closeModal();
        });
    }
};


})( jQuery, Backbone, _ );