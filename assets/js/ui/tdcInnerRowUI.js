/**
 * Created by tagdiv on 24.03.2016.
 */

/* global jQuery:{} */
/* global Backbone:{} */
/* global _:{} */

/* global tdcAdminWrapperUI:{} */
/* global tdcOperationUI:{} */
/* global tdcElementUI:{} */
/* global tdcSidebar:{} */
/* global tdcMaskUI:{} */



var tdcInnerRowUI;

(function( jQuery, backbone, _, undefined ) {

    'use strict';

    tdcInnerRowUI = {

        // The css class of the handler element
        _elementCssClass: 'tdc-element-inner-row',

        // The '.tdc-element-inner-row' elements
        tdcElementInnerRow: undefined,


        /**
         *
         * @param $content
         */
        init: function( $content ) {

            if ( _.isUndefined( $content ) ) {
                $content = tdcOperationUI.iframeContents;
            }

            tdcInnerRowUI.tdcElementInnerRow = $content.find( '.tdc-element-inner-row' );

            tdcInnerRowUI.tdcElementInnerRow.each(function( index, element ) {
                tdcInnerRowUI.bindInnerRow( jQuery( element ) );
            });
        },


        // SOLVE A CHROME BUG - mousemove event triggered after mousedown!
        _mouseCoordinates: undefined,

        _setMouseCoordinates: function( _mouseCoordinates ) {
            tdcInnerRowUI._mouseCoordinates = _mouseCoordinates;
        },

        _getMouseCoordinates: function() {
            return tdcInnerRowUI._mouseCoordinates;
        },


        /**
         *
         * @param $element
         */
        bindInnerRow: function( $element ) {

            // Unbind any event.
            // This allows us to reuse the 'bindInnerRow' method for the same elements
            $element.unbind();


            $element.click(function( event ) {
                //tdcDebug.log( 'click inner row' );

                event.preventDefault();
                event.stopPropagation();

            }).mousedown(function( event ) {
                //tdcDebug.log( 'inner row mouse down' );

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
                tdcInnerRowUI.positionInnerRowPlaceholder( event, true );

                //tdcMaskUI.hide();

                tdcSidebar.setSettings({
                    '$currentRow': tdcOperationUI.inRow( $element ),
                    '$currentColumn': tdcOperationUI.inColumn( $element ),
                    '$currentInnerRow': tdcOperationUI.inInnerRow( $element )
                });

                // Set the mouse coordinates
                // SOLVE A CHROME BUG - mousemove event triggered after mousedown!
                tdcInnerRowUI._setMouseCoordinates({
                    screenX: event.screenX,
                    screenY: event.screenY
                });

            }).mouseup(function( event ) {
                //tdcDebug.log( 'inner row element mouse up' );

                event.preventDefault();

                tdcOperationUI.deactiveDraggedElement();
                tdcOperationUI.hideHelper();

                // Set the mask current container at mouse up
                tdcMaskUI.setContentAtMouseUp( $element );

            }).mousemove(function( event ) {

                // Respond only if dragged element is 'tdc-element', 'tdc-element-inner-row' or 'tdc-element-inner-row-temp'
                if ( tdcOperationUI.isElementDragged() || tdcOperationUI.isInnerRowDragged() || tdcOperationUI.isTempInnerRowDragged() ) {
                    //tdcDebug.log( 'inner row element mouse move' );

                    // Do not continue if the mouse coordinates are the same
                    // SOLVE A CHROME BUG - mousemove event triggered after mousedown!
                    if ( _.isEqual( {
                            screenX: event.screenX,
                            screenY: event.screenY
                        }, tdcInnerRowUI._getMouseCoordinates() ) ) {

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
                    tdcInnerRowUI.positionInnerRowPlaceholder( event );

                    tdcMaskUI.hide();

                    // Reset the mouse coordinates
                    // SOLVE A CHROME BUG - mousemove event triggered after mousedown!
                    tdcInnerRowUI._setMouseCoordinates( undefined );
                }

            }).mouseenter(function(event) {

                // Respond only if dragged element is 'tdc-element', 'tdc-element-inner-row' or 'tdc-element-inner-row-temp'
                if ( tdcOperationUI.isElementDragged() || tdcOperationUI.isInnerRowDragged() || tdcOperationUI.isTempInnerRowDragged() ) {
                    //tdcDebug.log('inner row mouse enter');

                    event.preventDefault();

                    tdcOperationUI.setCurrentElementOver( $element );
                    tdcInnerRowUI.positionInnerRowPlaceholder( event );

                } else if ( _.isUndefined( tdcOperationUI.getDraggedElement() ) ) {

                    // Otherwise, set to '$element' the current container for the mask, and stop event propagation
                    tdcMaskUI.setCurrentContainer( $element );

                    // Do not let the column mouseenter event to trigger
                    event.stopPropagation();
                }

            }).mouseleave(function(event) {

                // Respond only if dragged element is 'tdc-element', 'tdc-element-inner-row' or 'tdc-element-inner-row-temp'
                if ( tdcOperationUI.isElementDragged() || tdcOperationUI.isInnerRowDragged() || tdcOperationUI.isTempInnerRowDragged() ) {
                    //tdcDebug.log('inner row mouse leave');

                    event.preventDefault();

                    tdcOperationUI.setCurrentElementOver( undefined );
                    tdcInnerRowUI.positionInnerRowPlaceholder( event );

                } else {

                    // Otherwise, reset to 'undefined' the current container for the mask, and manually trigger an 'mouseenter' event for its column parent
                    tdcMaskUI.setCurrentContainer( undefined );

                    var $tdcColumn = tdcOperationUI.inColumn( $element );
                    if ( ! _.isUndefined( $tdcColumn ) ) {
                        $tdcColumn.mouseenter();
                    }
                }

            }).on( 'fakemouseenterevent', function(event) {

                // Respond only if dragged element is 'tdc-element', 'tdc-element-inner-row' or 'tdc-element-inner-row-temp'
                if ( tdcOperationUI.isElementDragged() || tdcOperationUI.isInnerRowDragged() || tdcOperationUI.isTempInnerRowDragged() ) {
                    //tdcDebug.log( 'tdc-inner-row FAKE MOUSE ENTER EVENT' );

                    var outerHeight = $element.outerHeight(true);
                    var outerWidth = $element.outerWidth();

                    var offset = $element.offset();

                    //tdcDebug.log( offset.left + ' : ' + event.pageX + ' : ' + (offset.left + outerWidth) );
                    //tdcDebug.log( offset.top + ' : ' + event.pageY + ' : ' + (offset.top + outerHeight) );

                    if ( ( parseInt( offset.left ) <= parseInt( event.pageX ) ) && ( parseInt( event.pageX ) <= parseInt( offset.left + outerWidth ) ) &&
                        ( parseInt( offset.top ) <= parseInt( event.pageY ) ) && ( parseInt( event.pageY ) <= parseInt( offset.top + outerHeight ) ) ) {

                        //tdcDebug.log( '***********************' );

                        // Set the 'currentElementOver' variable to the current element
                        tdcOperationUI.setCurrentElementOver( $element );

                        // Position the placeholder
                        tdcInnerRowUI.positionInnerRowPlaceholder( event );
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
        positionInnerRowPlaceholder: function( event, positionAndHide ) {
            //tdcDebug.log( event );

            var $placeholder = tdcAdminWrapperUI.$placeholder;


            // The mouse position.
            // This is used as a mark value.
            // When an element is in 'drag' operation, the 'scroll' of the contents does not fire 'hover' ('mouseenter' and 'mouseleave') event
            // over the content, and, to solve this issue, a custom event ('fakemouseenterevent') with the mouse position, must be triggered to all 'tdc-element' elements,
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
                // Trigger a custom event for all 'tdc-element' elements, but stop if one is found

                // Set the 'currentElementOver' to undefined, to be find in the iteration
                tdcOperationUI.setCurrentElementOver( undefined );

                // Trigger an 'fakemouseenterevent' event, for all 'tdc-element' elements, or until the variable 'currentElementOver' is set to one of them
                tdcElementUI.tdcElement.each(function( index, element ) {

                    if ( ! _.isUndefined( tdcOperationUI.getCurrentElementOver() ) ) {
                        // If it's not undefined, ( marked by 'fakemouseenterevent' event of the 'tdc-element' ) DO NOTHING (DO NOT TRIGGER ANY MORE 'fakemouseenterevent' EVENT)
                        return;
                    }
                    jQuery( element ).trigger( jQuery.Event( 'fakemouseenterevent', eventProp ) );
                });

                tdcInnerRowUI.tdcElementInnerRow.each(function( index, element ) {

                    if ( ! _.isUndefined( tdcOperationUI.getCurrentElementOver() ) ) {
                        // If it's not undefined, ( marked by 'fakemouseenterevent' event of the 'tdc-element-inner-row' ) DO NOTHING (DO NOT TRIGGER ANY MORE 'fakemouseenterevent' EVENT)
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



            // If a 'tdc-row' is dragged and the 'currentElementOver' is not undefined, show and position the placeholder

            var elementOuterHeight = currentElementOver.outerHeight( true),
                elementOuterWidth = currentElementOver.innerWidth(),
                elementOffset = currentElementOver.offset();

            //tdcDebug.log( mousePointerValue.Y + ' : ' +  ( elementOffset.top + ( elementOuterHeight / 2 ) ) );

            if ( mousePointerValue.Y > elementOffset.top + ( elementOuterHeight / 2 ) ) {

                var $nextElement = currentElementOver.next();

                if ( ! $nextElement.length || ( $nextElement.length && $nextElement.attr( 'id' ) !== tdcAdminWrapperUI.placeholderId ) ) {
                    currentElementOver.after($placeholder);

                    // Update the helper
                    tdcOperationUI.updateInfoHelper( undefined );
                }

                // Position the placeholder at the bottom of the screen
                if ( parseInt( elementOffset.top ) + parseInt( elementOuterHeight ) > parseInt( tdcOperationUI.iframeContents.scrollTop()) + parseInt( window.innerHeight ) ) {
                    tdcOperationUI.setHorizontalPlaceholder({
                        'position': 'fixed',
                        'top': '',
                        'left': '',
                        'margin-top': '',
                        'margin-left': '',
                        'bottom': '0',
                        'width': elementOuterWidth
                    });
                } else {
                    // Reset
                    tdcOperationUI.setHorizontalPlaceholder({
                        'position': 'absolute',
                        'top': '',
                        'left': '',
                        'margin-top': '',
                        'margin-left': '',
                        'bottom': '',
                        'width': elementOuterWidth
                    });
                }

            } else {

                var $prevElement = currentElementOver.prev();

                if ( ! $prevElement.length || ( $prevElement.length && $prevElement.attr( 'id' ) !== tdcAdminWrapperUI.placeholderId ) ) {
                    currentElementOver.before($placeholder);

                    // Update the helper
                    tdcOperationUI.updateInfoHelper( undefined );
                }

                // Position the placeholder at the top of the screen
                if ( parseInt( elementOffset.top ) < parseInt( tdcOperationUI.iframeContents.scrollTop() ) ) {
                    tdcOperationUI.setHorizontalPlaceholder({
                        'position': 'fixed',
                        'top': '0',
                        'left': '',
                        'margin-top': '0',
                        'margin-left': '',
                        'bottom': '',
                        'width': elementOuterWidth
                    });
                } else {
                    // Reset
                    tdcOperationUI.setHorizontalPlaceholder({
                        'position': 'absolute',
                        'top': '',
                        'left': '',
                        'margin-top': '',
                        'margin-left': '',
                        'bottom': '',
                        'width': elementOuterWidth
                    });
                }
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
            return tdcInnerRowUI._elementCssClass;
        }
    };

})( jQuery, Backbone, _ );