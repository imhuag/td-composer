/**
 * Created by tagdiv on 24.03.2016.
 */

/* global jQuery:{} */
/* global Backbone:{} */
/* global _:{} */

/* global tdcAdminWrapperUI:{} */
/* global tdcSidebar:{} */
/* global tdcOperationUI:{} */
/* global tdcMaskUI:{} */



var tdcInnerColumnUI;

(function( jQuery, backbone, _, undefined ) {

    'use strict';

    tdcInnerColumnUI = {

        // The css class of the handler element
        _elementCssClass: 'tdc-inner-column',

        // The '.tdc-inner-column' elements
        tdcInnerColumn: undefined,


        /**
         *
         * @param $content
         */
        init: function( $content ) {

            if ( _.isUndefined( $content ) ) {
                $content = tdcOperationUI.iframeContents;
            }

            tdcInnerColumnUI.tdcInnerColumn = $content.find( '.' + tdcInnerColumnUI._elementCssClass );

            tdcInnerColumnUI.tdcInnerColumn.each(function( index, element ) {
                tdcInnerColumnUI.bindInnerColumn( jQuery( element ) );
            });
        },


        // SOLVE A CHROME BUG - mousemove event triggered after mousedown!
        _mouseCoordinates: undefined,

        _setMouseCoordinates: function( _mouseCoordinates ) {
            tdcInnerColumnUI._mouseCoordinates = _mouseCoordinates;
        },

        _getMouseCoordinates: function() {
            return tdcInnerColumnUI._mouseCoordinates;
        },


        /**
         *
         * @param $element
         */
        bindInnerColumn: function( $element ) {

            // Unbind any event.
            // This allows us to reuse the 'bindInnerColumn' method for the same elements
            $element.unbind();

            $element.click(function( event ) {
                //tdcDebug.log( 'click inner column' );

                event.preventDefault();
                event.stopPropagation();

            }).mousedown(function(event) {
                //tdcDebug.log( 'inner column mouse down' );

                // Consider only the left button
                if ( 1 !== event.which ) {
                    return;
                }

                event.preventDefault();
                event.stopPropagation();

                tdcOperationUI.activeDraggedElement( jQuery( this ) );
                //tdcOperationUI.showHelper( event );

                tdcOperationUI.hideHelper();

                tdcOperationUI.setCurrentElementOver( $element );
                tdcInnerColumnUI.positionInnerColumnPlaceholder( event, true );

                //tdcMaskUI.hide();

                tdcSidebar.setSettings({
                    '$currentRow': tdcOperationUI.inRow( $element ),
                    '$currentColumn': tdcOperationUI.inColumn( $element ),
                    '$currentInnerRow': tdcOperationUI.inInnerRow( $element ),
                    '$currentInnerColumn': tdcOperationUI.inInnerColumn( $element )
                });

                // Set the mouse coordinates
                // SOLVE A CHROME BUG - mousemove event triggered after mousedown!
                tdcInnerColumnUI._setMouseCoordinates({
                    screenX: event.screenX,
                    screenY: event.screenY
                });

                // Set the 'tdc-ready-to-move' class
                tdcOperationUI.setReadyToMove();

            }).mouseup(function( event ) {

                // Respond only if dragged element is 'tdc-inner-column'
                if ( tdcOperationUI.isInnerColumnDragged( $element ) ) {
                    //tdcDebug.log( 'inner column mouse up' );

                    event.preventDefault();

                    // Clear the 'tdc-ready-to-move' class
                    tdcOperationUI.clearReadyToMove();

                    tdcOperationUI.deactiveDraggedElement();
                    tdcOperationUI.hideHelper();

                    tdcOperationUI.setCurrentElementOver( undefined );
                    tdcInnerColumnUI.positionInnerColumnPlaceholder( event );

                    // Reset the mouse coordinates
                    // SOLVE A CHROME BUG - mousemove event triggered after mousedown!
                    tdcInnerColumnUI._setMouseCoordinates( undefined );
                }
                // Set the mask current container at mouse up
                tdcMaskUI.setContentAtMouseUp( $element );

            }).mousemove(function( event ) {

                // Respond only if dragged element is 'tdc-inner-column'
                if ( tdcOperationUI.isInnerColumnDragged( $element ) ) {
                    //tdcDebug.log( 'inner column mouse move' );

                    // Do not continue if the mouse coordinates are the same
                    // SOLVE A CHROME BUG - mousemove event triggered after mousedown!
                    if ( _.isEqual( {
                            screenX: event.screenX,
                            screenY: event.screenY
                        }, tdcInnerColumnUI._getMouseCoordinates() ) ) {

                        // Do not let the 'mousemove' event to go upper
                        // The structure elements maybe does not catch the event (they have checks), but the there are events handlers on window and iframeContents (because the in drag, the helper must be shown over them) @see tdcOperationUI
                        event.stopPropagation();

                        tdcOperationUI.hideHelper();
                        return;
                    }

                    event.preventDefault();
                    event.stopPropagation();

                    tdcOperationUI.showHelper(event);

                    tdcOperationUI.setCurrentElementOver( $element );
                    tdcInnerColumnUI.positionInnerColumnPlaceholder( event );

                    tdcMaskUI.hide();

                    // Reset the mouse coordinates
                    // SOLVE A CHROME BUG - mousemove event triggered after mousedown!
                    tdcInnerColumnUI._setMouseCoordinates( undefined );

                    // Clear the 'tdc-ready-to-move' class
                    tdcOperationUI.clearReadyToMove();
                }

            }).mouseenter(function( event ) {

                // Respond only if dragged element is 'tdc-inner-column'
                if ( tdcOperationUI.isInnerColumnDragged( $element ) ) {
                    //tdcDebug.log( 'inner column mouse enter' );

                    event.preventDefault();

                    tdcOperationUI.setCurrentElementOver( $element );
                    tdcInnerColumnUI.positionInnerColumnPlaceholder( event );

                } else if ( _.isUndefined( tdcOperationUI.getDraggedElement() ) ) {

                    // Otherwise, set to '$element' the current container for the mask, and stop event propagation
                    tdcMaskUI.setCurrentContainer( $element );

                    // Do not let the inner row mouseenter event to trigger
                    event.stopPropagation();
                }

            }).mouseleave(function(event) {

                // Respond only if dragged element is 'tdc-inner-column'
                if ( tdcOperationUI.isInnerColumnDragged( $element ) ) {
                    //tdcDebug.log( 'column mouse leave' );

                    event.preventDefault();

                    tdcOperationUI.setCurrentElementOver( undefined );
                    tdcInnerColumnUI.positionInnerColumnPlaceholder( event );

                } else {

                    // Otherwise, reset to 'undefined' the current container for the mask, and manually trigger an 'mouseenter' event for its inner-row parent
                    tdcMaskUI.setCurrentContainer( undefined );

                    var $tdcInnerRow = tdcOperationUI.inInnerRow( $element );
                    if ( ! _.isUndefined( $tdcInnerRow ) ) {
                        $tdcInnerRow.mouseenter();
                    }
                }

            }).on( 'fakemouseenterevent', function(event) {

                // Respond only if dragged element is 'tdc-inner-column'
                if ( tdcOperationUI.isInnerColumnDragged( $element ) ) {
                    //tdcDebug.log( 'tdc-inner-column FAKE MOUSE ENTER EVENT' );

                    var list_tdc_elements = $element.find( '.tdc-elements:first' );

                    if ( ! list_tdc_elements.length ) {
                        return;
                    }

                    var outerHeight = list_tdc_elements.outerHeight(true);
                    var outerWidth = list_tdc_elements.outerWidth();

                    var offset = $element.offset();

                    // Being floated, all prev columns width must be considered when working with the offset().left
                    var extraLeft = 0;
                    var prevColumns = $element.prevAll( '.' + tdcInnerColumnUI._elementCssClass );

                    if ( prevColumns.length ) {
                        prevColumns.each( function (index, element) {
                            extraLeft += parseInt( jQuery(element).find( '.tdc-elements:first').width() );
                        });
                    }

                    extraLeft += offset.left;


                    //tdcDebug.log( extraLeft + ' : ' + event.pageX + ' : ' + ( extraLeft + outerWidth ) );
                    //tdcDebug.log( offset.top + ' : ' + event.pageY + ' : ' + ( offset.top + outerHeight ) );


                    if ( ( parseInt( extraLeft ) <= parseInt( event.pageX ) ) && ( parseInt( event.pageX ) <= parseInt( extraLeft + outerWidth ) ) &&
                        ( parseInt( offset.top ) <= parseInt( event.pageY ) ) && ( parseInt( event.pageY ) <= parseInt( offset.top + outerHeight ) ) ) {

                        //tdcDebug.log( '***********************' );

                        // Set the 'currentElementOver' variable to the current element
                        tdcOperationUI.setCurrentElementOver( $element );

                        // Position the placeholder
                        tdcInnerColumnUI.positionInnerColumnPlaceholder( event );
                    }
                }
            });
        },


        /**
         * Position and show/hide the placeholder.
         * Important! There are some situations when even the placeholder is positioned, we don't want to show it
         *
         * For example, before mousemove event. We don't want to show it, but want to position it, because it is used by the the mouseup event to
         * check if the drag operation must be done. A drag operation is done when the placeholder and the dragged element are not siblings. And this
         * means that placeholder position must be computed before.
         *
         * @param event
         * @param positionAndHide
         */
        positionInnerColumnPlaceholder: function( event, positionAndHide ) {
            //tdcDebug.log( event );

            var $placeholder = tdcAdminWrapperUI.$placeholder;

            // The mouse position.
            // This is used as a mark value.
            // When an element is in 'drag' operation, the 'scroll' of the contents does not fire 'hover' ('mouseenter' and 'mouseleave') event
            // over the content, and, to solve this issue, a custom event ('fakemouseenterevent') with the mouse position, must be triggered to all 'tdcElement' elements,
            // to see which has the mouse over
            var mousePointerValue = {
                X: 0,
                Y: 0
            };

            // Check if we have 'mousemove' or 'fakemouseenterevent'
            if ( 'mousedown' === event.type || 'mousemove' === event.type || 'fakemouseenterevent' === event.type ) {

                mousePointerValue.X = event.pageX;
                mousePointerValue.Y = event.pageY;

                // These are saved here, and used at 'scroll', for computing the mouse position over a 'tdc-element' element
                if ( !_.isUndefined( event.clientX ) && !_.isUndefined( event.clientY ) ) {
                    window.previousMouseClientX = event.clientX;
                    window.previousMouseClientY = event.clientY;
                }

            } else if ( 'scroll' === event.type ) {
                //tdcDebug.log( event.delegateTarget.scrollingElement.scrollTop + ' : ' + window.previousMouseClientY );

                mousePointerValue.X = tdcOperationUI.iframeContents.scrollLeft() + window.previousMouseClientX;
                mousePointerValue.Y = tdcOperationUI.iframeContents.scrollTop() + window.previousMouseClientY;

                var eventProp = {
                    'pageX' : mousePointerValue.X,
                    'pageY' : mousePointerValue.Y
                };

                //tdcDebug.log( eventProp );


                // Try to find where the mouse is.
                // Trigger a custom event for all 'tdc-column' elements, but stop if one is found

                // Set the 'currentElementOver' to undefined, to be find in the iteration
                tdcOperationUI.setCurrentElementOver( undefined );

                // Trigger an 'fakemouseenterevent' event, for siblings 'tdc-inner-column' elements, or until the variable 'currentElementOver' is set to one of them
                tdcOperationUI.getDraggedElement().closest( '.tdc-inner-columns').find( '.tdc-inner-column' ).each(function( index, element ) {

                    if ( ! _.isUndefined( tdcOperationUI.getCurrentElementOver() ) ) {
                        // If it's not undefined, ( marked by 'fakemouseenterevent' event of the 'tdc-column' ) DO NOTHING (DO NOT TRIGGER ANY MORE 'fakemouseenterevent' EVENT)
                        return;
                    }
                    jQuery( element ).trigger( jQuery.Event( 'fakemouseenterevent', eventProp ) );
                });
                return;
            }


            var currentElementOver = tdcOperationUI.getCurrentElementOver();

            // Hide the placeholder and stop
            if ( _.isUndefined( tdcOperationUI.getDraggedElement() ) ||
                _.isUndefined( currentElementOver ) ) {

                // Hide the placeholder when we are over the dragged element
                //( ! _.isUndefined( currentElementOver ) && currentElementOver.hasClass( 'tdc-dragged' ) ) ) {

                tdcOperationUI.hidePlaceholder();
                return;
            }



            // If a 'tdcRow' is dragged and the 'currentElementOver' is not undefined, show and position the placeholder

            var elementOuterWidth = currentElementOver.find( '.vc_column_container:first' ).outerWidth( true ),
                elementOffset = currentElementOver.offset(),

            // Being floated, all prev columns width must be considered when working with the offset().left
                extraLeft = 0,
                cssMarginLeftValue = -24,
                prevColumns = currentElementOver.prevAll();

            if ( prevColumns.length ) {
                prevColumns.each( function (index, element) {
                    var $element = jQuery( element );
                    if ( ! $element.hasClass( 'tdc-inner-column' ) ) {
                        return;
                    }
                    extraLeft += parseInt( $element.find( '.vc_column_container:first' ).outerWidth( true ) );
                });
            }

            //tdcDebug.log( mousePointerValue.X + ' : ' + extraLeft + ' : ' + elementOffset.left + ' : ' + elementOuterWidth );

            //tdcDebug.log( mousePointerValue.X + ' : ' + (extraLeft + elementOffset.left + elementOuterWidth / 2 ) );

            if ( mousePointerValue.X > ( extraLeft + elementOffset.left + ( elementOuterWidth / 2 ) ) ) {

                var $nextElement = currentElementOver.next();

                if ( ! $nextElement.length || ( $nextElement.length && $nextElement.attr( 'id' ) !== tdcAdminWrapperUI.placeholderId ) ) {
                    currentElementOver.after($placeholder);

                    // Update the helper
                    tdcOperationUI.updateInfoHelper();
                }

                //tdcDebug.log( '>>>>>>>>>>>>>>>>>>>>>>>>>> 1' );

                tdcOperationUI.setVerticalPlaceholder({
                    left: parseInt( extraLeft + elementOuterWidth ),
                    'margin-left': cssMarginLeftValue
                });

            } else {

                var $prevElement = currentElementOver.prev();

                if ( ! $prevElement.length || ( $prevElement.length && $prevElement.attr( 'id' ) !== tdcAdminWrapperUI.placeholderId ) ) {
                    currentElementOver.before($placeholder);

                    // Update the helper
                    tdcOperationUI.updateInfoHelper();
                }

                //tdcDebug.log( '<<<<<<<<<<<<<<<<<<<<<<<<<<<<< 1' );

                tdcOperationUI.setVerticalPlaceholder({
                    left: parseInt(extraLeft),
                    'margin-left': cssMarginLeftValue
                });
            }

            if ( ! _.isUndefined( positionAndHide ) && true === positionAndHide ) {
                tdcOperationUI.hidePlaceholder();
                return;
            }

            // 'show' must be after setting placeholder (horizontal or vertical), to be shown at the first 'mousedown' event
            tdcOperationUI.showPlaceholder();

            // Hide the placeholder if it's near the dragged element
            //if ( $placeholder.next().length && $placeholder.next().hasClass( 'tdc-dragged' ) ||
            //    $placeholder.prev().length && $placeholder.prev().hasClass( 'tdc-dragged' ) ) {
            //    $placeholder.hide();
            //}
        },


        /**
         *
         * @returns {string}
         */
        getElementCssClass: function() {
            return tdcInnerColumnUI._elementCssClass;
        }
    };

})( jQuery, Backbone, _ );
