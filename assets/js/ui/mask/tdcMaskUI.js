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

/* global tdcRowUI:{} */
///* global tdcColumnUI:{} */
///* global tdcInnerRowUI:{} */
///* global tdcInnerColumnUI:{} */



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

        // Flag checked at mouse up, at bubbling
        // It's used to set the current container or the current element for the mask
        // It's set to true by the inner most element (usually a '.tdc-element'), and then reset to false by the outer most element (usually a '.tdc-row')
        _inMouseUpBubbling: false,

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

            var cssClass = '';

            if ( tdcOperationUI.isRow( tdcMaskUI.$currentContainer ) ) {

                $refObj = tdcMaskUI.$currentContainer;
                cssClass = 'tdc-content-row';

            } else if ( tdcOperationUI.isColumn( tdcMaskUI.$currentContainer ) ) {

                $refObj = tdcMaskUI.$currentContainer.find( '.tdc-elements:first' );
                cssClass = 'tdc-content-column';

            } else if ( tdcOperationUI.isInnerRow( tdcMaskUI.$currentContainer ) ) {

                $refObj = tdcMaskUI.$currentContainer;
                cssClass = 'tdc-content-inner-row';

            } else if ( tdcOperationUI.isInnerColumn( tdcMaskUI.$currentContainer ) ) {

                $refObj = tdcMaskUI.$currentContainer.find( '.tdc-elements:first' );
                cssClass = 'tdc-content-inner-column';
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

            tdcMaskUI.$content.attr( 'class', cssClass );

            tdcMaskUI.$content.show();

            var modelId = tdcMaskUI.$currentContainer.data( 'model_id' );

            if ( ! _.isUndefined( modelId ) ) {
                var model = tdcIFrameData.getModel( modelId );

                tdcSidebar.setSidebarInfo( model.get( 'tag' ) );
            }

        } else {
            tdcMaskUI.$content.css({
                top: '',
                left: '',
                width: '',
                height: ''
            });

            tdcMaskUI.$content.hide();

            tdcSidebar.setSidebarInfo( '' );
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

            tdcMaskUI.$content.removeAttr( 'class' );

            tdcMaskUI.$wrapper.show();
            tdcMaskUI.$content.show();

            tdcMaskUI.setHandlers();

            var modelId = tdcMaskUI.$currentElement.data( 'model_id' );

            if ( ! _.isUndefined( modelId ) ) {
                var model = tdcIFrameData.getModel( modelId ),
                    customTitle =  model.attributes.attrs.custom_title;

                if ( '' === customTitle ) {
                    tdcSidebar.setSidebarInfo( model.get( 'tag' ) );
                } else {
                    tdcSidebar.setSidebarInfo( customTitle );
                }
            }



            //tdcDebug.log( offset.top + ' : ' + offset.left + ' : ' + width + ' : ' + height );

        } else {
            tdcMaskUI.$wrapper.hide();
            tdcMaskUI.$content.hide();

            //tdcDebug.log( 'current element undefined' );
        }
    },


    /**
     * It set the current container or the current element of the mask, depending where the mouseup event was bubbled.
     *
     * This function is called at mouseup for rows, columns, inner-rows, inner-columns and elements
     * It check the tdcMaskUI._inMouseUpBubbling flag and if it's not set, the bubbling is beginning
     * The bubbling finishes at the outer most structure elements (.tdc-row)
     *
     * @param $element - the dragged element
     */
    setContentAtMouseUp: function( $element ) {

        // Check the $element to set the mask current container or the mask current element
        if ( $element.hasClass( 'tdc-row' ) ) {

            if ( tdcMaskUI._inMouseUpBubbling ) {
                // Reset the flag because this is the last bubbling phase
                tdcMaskUI._inMouseUpBubbling = false;

                return;
            }
            tdcMaskUI.setCurrentContainer( $element );

        } else if ( $element.hasClass( 'tdc-column' ) ) {

            if ( tdcMaskUI._inMouseUpBubbling ) {
                return;
            }
            // Set the flag
            tdcMaskUI._inMouseUpBubbling = true;

            tdcMaskUI.setCurrentContainer( $element );

        } else if ( $element.hasClass( 'tdc-element-inner-row' ) ) {

            if ( tdcMaskUI._inMouseUpBubbling ) {
                return;
            }
            // Set the flag
            tdcMaskUI._inMouseUpBubbling = true;

            tdcMaskUI.setCurrentContainer( $element );

        } else if ( $element.hasClass( 'tdc-inner-column' ) ) {
            if ( tdcMaskUI._inMouseUpBubbling ) {
                return;
            }
            // Set the flag
            tdcMaskUI._inMouseUpBubbling = true;

            tdcMaskUI.setCurrentContainer( $element );

        } else if ( $element.hasClass( 'tdc-element' ) ) {
            tdcMaskUI.setCurrentElement( $element );

            // Set the flag
            tdcMaskUI._inMouseUpBubbling = true;
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


    ///**
    // * Calls the handler setBreadcrumb
    // *
    // * @param $element - the 'tdc-row', 'tdc-column', 'tdc-element-inner-row', 'tdc-inner-column' or the 'tdc-element' element
    // * @param sidebarCurrentElementContent - optional - the html content of the sidebar current element
    // */
    //setBreadcrumb: function( $element, sidebarCurrentElementContent ) {
    //
    //    if ( ! tdcMaskUI._isInitialized ) {
    //        return;
    //    }
    //
    //    _.map( tdcMaskUI._handlers, function( handler, handlerId ) {
    //        handler.setBreadcrumb( $element );
    //
    //        // Set html content of the sidebar current element
    //        if ( ! _.isUndefined( sidebarCurrentElementContent ) ) {
    //            tdcSidebar.setCurrentElementContent( sidebarCurrentElementContent );
    //        }
    //
    //        // Close the sidebar modal 'Add Elements'
    //        tdcSidebar.closeModal();
    //    });
    //}
};


})( jQuery, Backbone, _ );