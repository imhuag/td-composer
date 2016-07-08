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


var tdcElementUI;

(function(jQuery, backbone, _, undefined) {

    'use strict';

    tdcElementUI = {

        // Gap top, gap bottom - set the placeholder outside of inner column
        _innerColumnGap: 10,

        // The 'tdc-elements' elements
        tdcElements: undefined,



        init: function( $content ) {

            if ( _.isUndefined( $content ) ) {
                $content = tdcOperationUI.iframeContents;
            }

            tdcElementUI.tdcElement = $content.find( '.tdc-element' );

            tdcElementUI.tdcElement.each(function( index, element ) {

                tdcElementUI.bindElement( jQuery( element ) );
            });
        },


        /**
         * Position and show/hide the placeholder.
         * Important! There are some situations when even the placeholder is positioned, we don't want to show it
         *
         * Eor example, before mousemove event. We don't want to show it, but want to position it, because it is used by the the mouseup event to
         * check if the drag operation must be done. A drag operation is done when the placeholder and the dragged element are not siblings. And this
         * means that placeholder position must be computed before.
         *
         * @param event
         * @param positionAndHide - even the placeholder is eligible to be shown, it is hidden, but its position is computed
         */
        positionElementPlaceholder: function( event, positionAndHide ) {

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

                // Trigger a 'fakemouseenterevent' event, for all 'tdc-element' elements, or until the variable 'currentElementOver' is set to one of them
                tdcElementUI.tdcElement.each(function( index, element ) {

                    if ( ! _.isUndefined( tdcOperationUI.getCurrentElementOver() ) ) {
                        // If it's not undefined, ( marked by 'fakemouseenterevent' event of the 'tdc-element' ) DO NOTHING (DO NOT TRIGGER ANY MORE 'fakemouseenterevent' EVENT)
                        return;
                    }
                    jQuery( element ).trigger( jQuery.Event( 'fakemouseenterevent', eventProp ) );
                });

                //tdcElementInnerRowUI.tdcElementInnerRow.each(function( index, element ) {
                //
                //    if ( ! _.isUndefined( currentElementOver ) ) {
                //        // If it's not undefined, ( marked by 'fakemouseenterevent' event of the 'tdc-element-inner-row' ) DO NOTHING (DO NOT TRIGGER ANY MORE 'fakemouseenterevent' EVENT)
                //        return;
                //    }
                //    jQuery( element ).trigger( jQuery.Event( 'fakemouseenterevent', eventProp ) );
                //});
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


            // If a 'tdc-element' is dragged and the 'currentElementOver' is not undefined, show and position the placeholder
            var elementOuterHeight = tdcOperationUI.getCurrentElementOverOuterHeight(),
                elementOuterWidth = tdcOperationUI.getCurrentElementOverOuterWidth(),
                elementOffset = tdcOperationUI.getCurrentElementOverOffset();

            //tdcDebug.log( mousePointerValue.Y + ' : ' +  ( elementOffset.top + ( elementOuterHeight / 2 ) ) );

            if ( mousePointerValue.Y > elementOffset.top + ( elementOuterHeight / 2 ) ) {





                // Check the bottom of the inner-column, to position the placeholder out

                var isInnerColumnLastElement = false;

                if ( tdcElementUI.isInnerColumnLastElement( currentElementOver ) && ( mousePointerValue.Y > elementOffset.top + elementOuterHeight - tdcElementUI._innerColumnGap ) ) {
                    //tdcDebug.log( 'last of inner column' );

                    isInnerColumnLastElement = true;
                }







                // Position the placeholder

                var $nextElement;

                // Position the placeholder
                if ( isInnerColumnLastElement ) {

                    // Rare case:
                    // Position the placeholder outside the inner-column

                    var $innerRowParent = currentElementOver.closest( '.tdc-element-inner-row' );

                    // The width of the placeholder is the width of the '.tdc-element-inner-row' element
                    elementOuterWidth = $innerRowParent.outerWidth( true );

                    $nextElement = $innerRowParent.next();

                    // Important! The 'id' check create troubles on FF/IE
                    //if ( ! $nextElement.length || ( $nextElement.length && $nextElement.attr( 'id' ) !== tdcAdminWrapperUI.placeholderId ) ) {
                    if ( ! $nextElement.length ) {
                        $innerRowParent.after($placeholder);

                        // Update the helper
                        tdcOperationUI.updateInfoHelper( undefined );
                    }

                } else {

                    // Usual case:
                    // Position the placeholder inside the inner-column

                    $nextElement = currentElementOver.next();

                    // Important! The 'id' check create troubles on FF/IE
                    //if ( ! $nextElement.length || ( $nextElement.length && $nextElement.attr( 'id' ) !== tdcAdminWrapperUI.placeholderId ) ) {
                    if ( ! $nextElement.length ) {
                        currentElementOver.after($placeholder);

                        // Update the helper
                        tdcOperationUI.updateInfoHelper( undefined );
                    }
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






                // Check the top of the inner-column, to position the placeholder out

                var isInnerColumnFirstElement = false;

                if ( tdcElementUI.isInnerColumnFirstElement( currentElementOver ) && ( mousePointerValue.Y < elementOffset.top + tdcElementUI._innerColumnGap ) ) {
                    //tdcDebug.log( 'first of inner column' );

                    isInnerColumnFirstElement = true;
                }






                // Position the placeholder

                var $prevElement;

                if ( isInnerColumnFirstElement ) {

                    // Rare case:
                    // Position the placeholder outside the inner-column

                    var $innerRowParent = currentElementOver.closest( '.tdc-element-inner-row' );

                    // The width of the placeholder is the width of the '.tdc-element-inner-row' element
                    elementOuterWidth = $innerRowParent.outerWidth( true );

                    $prevElement = $innerRowParent.prev();

                    // Important! The 'id' check create troubles on FF/IE
                    //if ( ! $prevElement.length || ( $prevElement.length && $prevElement.attr( 'id' ) !== tdcAdminWrapperUI.placeholderId ) ) {
                    if ( ! $prevElement.length ) {
                        $innerRowParent.before($placeholder);

                        // Update the helper
                        tdcOperationUI.updateInfoHelper( undefined );
                    }

                } else {

                    // Usual case:
                    // Position the placeholder inside the inner-column

                    $prevElement = currentElementOver.prev();

                    // Important! The 'id' check create troubles on FF/IE
                    //if ( ! $prevElement.length || ( $prevElement.length && $prevElement.attr( 'id' ) !== tdcAdminWrapperUI.placeholderId ) ) {
                    if ( ! $prevElement.length ) {
                        currentElementOver.before($placeholder);

                        // Update the helper
                        tdcOperationUI.updateInfoHelper( undefined );
                    }
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
         * Position the placeholder.
         *
         * @param event
         */
        positionEmptyElementPlaceholder: function( event ) {

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

                // Trigger a 'fakemouseenterevent' event, for all 'tdc-element' elements, or until the variable 'currentElementOver' is set to one of them
                tdcElementUI.tdcElement.each(function( index, element ) {

                    if ( ! _.isUndefined( tdcOperationUI.getCurrentElementOver() ) ) {
                        // If it's not undefined, ( marked by 'fakemouseenterevent' event of the 'tdc-element' ) DO NOTHING (DO NOT TRIGGER ANY MORE 'fakemouseenterevent' EVENT)
                        return;
                    }
                    jQuery( element ).trigger( jQuery.Event( 'fakemouseenterevent', eventProp ) );
                });

                //tdcElementInnerRowUI.tdcElementInnerRow.each(function( index, element ) {
                //
                //    if ( ! _.isUndefined( currentElementOver ) ) {
                //        // If it's not undefined, ( marked by 'fakemouseenterevent' event of the 'tdc-element-inner-row' ) DO NOTHING (DO NOT TRIGGER ANY MORE 'fakemouseenterevent' EVENT)
                //        return;
                //    }
                //    jQuery( element ).trigger( jQuery.Event( 'fakemouseenterevent', eventProp ) );
                //});
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



            // If a 'tdc-element' is dragged and the 'currentElementOver' is not undefined, show and position the placeholder

            //var elementOuterHeight = currentElementOver.outerHeight( true),
            //    elementOuterWidth = currentElementOver.outerWidth( true ),
            //    elementOffset = currentElementOver.offset();

            var elementOuterHeight = tdcOperationUI.getCurrentElementOverOuterHeight(),
                elementOuterWidth = tdcOperationUI.getCurrentElementOverOuterWidth(),
                elementOffset = tdcOperationUI.getCurrentElementOverOffset();

            //tdcDebug.log( mousePointerValue.Y + ' : ' +  ( elementOffset.top + ( elementOuterHeight / 2 ) ) );

            if ( mousePointerValue.Y > elementOffset.top + ( elementOuterHeight / 2 ) ) {






                // Check the bottom of the inner-column, to position the placeholder out

                var isInnerColumnLastElement = false;

                if ( tdcElementUI.isInnerColumnLastElement( currentElementOver ) && ( mousePointerValue.Y > elementOffset.top + elementOuterHeight - tdcElementUI._innerColumnGap ) ) {
                    //tdcDebug.log( 'last of inner column' );

                    isInnerColumnLastElement = true;
                }







                // Position the placeholder

                var $nextElement;

                // Position the placeholder
                if ( isInnerColumnLastElement ) {

                    // Rare case:
                    // Position the placeholder outside the inner-column

                    var $innerRowParent = currentElementOver.closest( '.tdc-element-inner-row' );

                    // The width of the placeholder is the width of the '.tdc-element-inner-row' element
                    elementOuterWidth = $innerRowParent.outerWidth( true );

                    $nextElement = $innerRowParent.next();

                    //if ( ! $nextElement.length || ( $nextElement.length && $nextElement.attr( 'id' ) !== tdcAdminWrapperUI.placeholderId ) ) {
                    if ( ! $nextElement.length ) {
                        $innerRowParent.after($placeholder);

                        // Update the helper
                        tdcOperationUI.updateInfoHelper( undefined );
                    }

                } else {

                    // Usual case:
                    // Position the placeholder inside the inner-column

                    $nextElement = currentElementOver.next();

                    //if ( ! $nextElement.length || ( $nextElement.length && $nextElement.attr( 'id' ) !== tdcAdminWrapperUI.placeholderId ) ) {
                    if ( ! $nextElement.length ) {
                        currentElementOver.after($placeholder);

                        // Update the helper
                        tdcOperationUI.updateInfoHelper( undefined );
                    }
                }







                // Position the placeholder at the bottom of the screen
                if ( parseInt( elementOffset.top ) + parseInt( elementOuterHeight ) > parseInt( tdcOperationUI.iframeContents.scrollTop()) + parseInt( window.innerHeight ) ) {
                    tdcOperationUI.setHorizontalPlaceholder({
                        'position': 'fixed',
                        'top': '',
                        'left': '',
                        'margin-top': '',
                        'margin-left': '',
                        'bottom': 0,
                        'width': elementOuterWidth
                    });
                } else {
                    // Reset
                    tdcOperationUI.setHorizontalPlaceholder({
                        'position': 'absolute',
                        'top': '',
                        'left': '',
                        'margin-top': -50,
                        'margin-left': '',
                        'bottom': '',
                        'width': elementOuterWidth
                    });
                }

            } else {






                // Check the top of the inner-column, to position the placeholder out

                var isInnerColumnFirstElement = false;

                if ( tdcElementUI.isInnerColumnFirstElement( currentElementOver ) && ( mousePointerValue.Y < elementOffset.top + tdcElementUI._innerColumnGap ) ) {
                    //tdcDebug.log( 'first of inner column' );

                    isInnerColumnFirstElement = true;
                }






                // Position the placeholder

                var $prevElement;

                if ( isInnerColumnFirstElement ) {

                    // Rare case:
                    // Position the placeholder outside the inner-column

                    var $innerRowParent = currentElementOver.closest( '.tdc-element-inner-row' );

                    // The width of the placeholder is the width of the '.tdc-element-inner-row' element
                    elementOuterWidth = $innerRowParent.outerWidth( true );

                    $prevElement = $innerRowParent.prev();

                    //if ( ! $prevElement.length || ( $prevElement.length && $prevElement.attr( 'id' ) !== tdcAdminWrapperUI.placeholderId ) ) {
                    if ( ! $prevElement.length ) {
                        $innerRowParent.before($placeholder);

                        // Update the helper
                        tdcOperationUI.updateInfoHelper( undefined );
                    }

                } else {

                    // Usual case:
                    // Position the placeholder inside the inner-column

                    $prevElement = currentElementOver.prev();

                    //if ( ! $prevElement.length || ( $prevElement.length && $prevElement.attr( 'id' ) !== tdcAdminWrapperUI.placeholderId ) ) {
                    if ( ! $prevElement.length ) {
                        currentElementOver.before($placeholder);

                        // Update the helper
                        tdcOperationUI.updateInfoHelper( undefined );
                    }
                }






                // Position the placeholder at the top of the screen
                if ( parseInt( elementOffset.top ) < parseInt( tdcOperationUI.iframeContents.scrollTop() ) ) {
                    tdcOperationUI.setHorizontalPlaceholder({
                        'position': 'fixed',
                        'top': 0,
                        'left': '',
                        'margin-top': 0,
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
                        'margin-top': 0,
                        'margin-left': '',
                        'bottom': '',
                        'width': elementOuterWidth
                    });
                }
            }

            // 'show' must be after setting placeholder (horizontal or vertical), to be shown at the first 'mousedown' event
            tdcOperationUI.showPlaceholder();

            // Hide the placeholder if it's near the dragged element
            //if ( $placeholder.next().length && $placeholder.next().hasClass( 'tdc-dragged' ) ||
            //    $placeholder.prev().length && $placeholder.prev().hasClass( 'tdc-dragged' ) ) {
            //    $placeholder.hide();
            //}
        },


        // SOLVE A CHROME BUG - mousemove event triggered after mousedown!
        _mouseCoordinates: undefined,

        _setMouseCoordinates: function( _mouseCoordinates ) {
            tdcElementUI._mouseCoordinates = _mouseCoordinates;
        },

        _getMouseCoordinates: function() {
            return tdcElementUI._mouseCoordinates;
        },



        bindElement: function( $element ) {

            $element.click(function( event ) {
                //tdcDebug.log( 'click element' );

                event.preventDefault();
                event.stopPropagation();

            }).mousedown(function( event ) {
                tdcDebug.log( 'element mouse down' );

                // Consider only the left button
                if ( 1 !== event.which ) {
                    return;
                }

                event.preventDefault();
                // Stop calling parents 'mousedown' (tdc-element-inner-column or tdc-column - each tdc-element must be in one of theme)
                event.stopPropagation();

                tdcOperationUI.activeDraggedElement( $element );
                //tdcOperationUI.showHelper( event );

                tdcOperationUI.hideHelper();

                tdcOperationUI.setCurrentElementOver( $element );
                tdcElementUI.positionElementPlaceholder( event, true );

                //tdcMaskUI.hide();

                tdcSidebar.setSettings({
                    '$currentRow': tdcOperationUI.inRow( $element ),
                    '$currentColumn': tdcOperationUI.inColumn( $element ),
                    '$currentInnerRow': tdcOperationUI.inInnerRow( $element ),
                    '$currentInnerColumn': tdcOperationUI.inInnerColumn( $element ),
                    '$currentElement' : $element
                });

                // Set the mouse coordinates
                // SOLVE A CHROME BUG - mousemove event triggered after mousedown!
                tdcElementUI._setMouseCoordinates({
                    screenX: event.screenX,
                    screenY: event.screenY
                });

            }).mouseup(function( event ) {

                // Respond only if dragged element is 'tdc-element'
                if ( tdcOperationUI.isElementDragged() || ( ( tdcOperationUI.isInnerRowDragged() || tdcOperationUI.isTempInnerRowDragged() ) && $element.hasClass( 'tdc-element-column' ) ) ) {
                    //tdcDebug.log( 'element mouse up' );

                    event.preventDefault();

                    tdcOperationUI.deactiveDraggedElement();
                    tdcOperationUI.hideHelper();

                    // @todo The current element over must be undefined?
                    //tdcOperationUI.setCurrentElementOver( undefined );
                    tdcElementUI.positionElementPlaceholder( event );

                    // Reset the mouse coordinates
                    // SOLVE A CHROME BUG - mousemove event triggered after mousedown!
                    tdcElementUI._setMouseCoordinates( undefined );
                }
                // Set the mask current container at mouse up
                tdcMaskUI.setContentAtMouseUp( $element );

            }).mousemove(function( event ) {

                // Respond only if dragged element is 'tdc-element' or inner row
                if ( tdcOperationUI.isElementDragged() || ( ( tdcOperationUI.isInnerRowDragged() || tdcOperationUI.isTempInnerRowDragged() ) && $element.hasClass( 'tdc-element-column' ) ) ) {
                    //tdcDebug.log( 'element mouse move' );

                    // Do not continue if the mouse coordinates are the same
                    // SOLVE A CHROME BUG - mousemove event triggered after mousedown!
                    if ( _.isEqual( {
                            screenX: event.screenX,
                            screenY: event.screenY
                        }, tdcElementUI._getMouseCoordinates() ) ) {

                        // Do not let the 'mousemove' event to go upper
                        // The structure elements maybe does not catch the event (they have checks), but the there are events handlers on window and iframeContents (because the in drag, the helper must be shown over them) @see tdcOperationUI
                        event.stopPropagation();

                        tdcOperationUI.hideHelper();
                        return;
                    }

                    event.preventDefault();
                    event.stopPropagation();

                    tdcOperationUI.showHelper( event );

                    tdcOperationUI.setCurrentElementOver( $element );
                    tdcElementUI.positionElementPlaceholder( event );

                    tdcMaskUI.hide();

                    // Reset the mouse coordinates
                    // SOLVE A CHROME BUG - mousemove event triggered after mousedown!
                    tdcElementUI._setMouseCoordinates( undefined );
                }

            }).mouseenter(function( event ) {

                // Respond only if dragged element is 'tdc-element' or inner row
                if ( tdcOperationUI.isElementDragged() || ( ( tdcOperationUI.isInnerRowDragged() || tdcOperationUI.isTempInnerRowDragged() ) && $element.hasClass( 'tdc-element-column' ) ) ) {
                    //tdcDebug.log( 'element mouse enter' );

                    event.preventDefault();

                    tdcOperationUI.setCurrentElementOver( $element );
                    tdcElementUI.positionElementPlaceholder( event );

                } else if ( _.isUndefined( tdcOperationUI.getDraggedElement() ) ) {
                    tdcMaskUI.setCurrentElement( $element );

                    // Otherwise, set to '$element' the current container for the mask, and stop event propagation
                    // Do not let the inner column or column mouseenter to trigger
                    event.stopPropagation();
                }

            }).mouseleave(function( event ) {

                // Respond only if dragged element is 'tdc-element' or inner row
                if ( tdcOperationUI.isElementDragged() || ( ( tdcOperationUI.isInnerRowDragged() || tdcOperationUI.isTempInnerRowDragged() ) && $element.hasClass( 'tdc-element-column' ) ) ) {
                    //tdcDebug.log( 'element mouse leave' );

                    event.preventDefault();

                    tdcOperationUI.setCurrentElementOver( undefined );
                    tdcElementUI.positionElementPlaceholder( event );

                } else if ( _.isUndefined( tdcOperationUI.getDraggedElement() ) ) {
                    tdcMaskUI.setCurrentElement( undefined );

                    // Otherwise, reset to 'undefined' the current container for the mask, and manually trigger an 'mouseenter' event for its inner-column or column parent
                    tdcMaskUI.setCurrentContainer( undefined );

                    var $tdcInnerColumn = tdcOperationUI.inInnerColumn( $element );
                    if ( ! _.isUndefined( $tdcInnerColumn ) ) {
                        $tdcInnerColumn.mouseenter();
                    } else {
                        var $tdcColumn = tdcOperationUI.inColumn( $element );
                        if ( ! _.isUndefined( $tdcColumn ) ) {
                            $tdcColumn.mouseenter();
                        }
                    }
                }

            }).on( 'fakemouseenterevent', function(event) {

                // Respond only if dragged element is 'tdc-element' or inner row
                if ( tdcOperationUI.isElementDragged() || ( ( tdcOperationUI.isInnerRowDragged() || tdcOperationUI.isTempInnerRowDragged() ) && $element.hasClass( 'tdc-element-column' ) ) ) {
                    //tdcDebug.log( 'element FAKE MOUSE ENTER EVENT' );

                    event.preventDefault();
                    event.stopPropagation();

                    var outerHeight = $element.outerHeight( true );
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
                        tdcElementUI.positionElementPlaceholder( event );
                    }
                }
            });
        },


        bindEmptyElement: function( $element ) {

            $element.click(function( event ) {
                //tdcDebug.log( 'click empty element' );

                event.preventDefault();

                tdcSidebar.setSettings({
                    '$currentRow': undefined,
                    '$currentColumn': undefined,
                    '$currentInnerRow': undefined,
                    '$currentInnerColumn': undefined,
                    '$currentElement' : undefined
                });

            }).mousedown(function( event ) {
                //tdcDebug.log( 'empty element mouse down' );

                // Consider only the left button
                if ( 1 !== event.which ) {
                    return;
                }

                event.preventDefault();
                // Stop calling parents 'mousedown' (tdc-element-inner-column or tdc-column - each tdc-element must be in one of theme)
                event.stopPropagation();

                tdcMaskUI.hide();

            }).mouseup(function( event ) {

                // Respond only if dragged element is 'tdc-element'
                if ( tdcOperationUI.isElementDragged() || ( ( tdcOperationUI.isInnerRowDragged() || tdcOperationUI.isTempInnerRowDragged() ) && $element.hasClass( 'tdc-element-column' ) ) ) {
                    //tdcDebug.log( 'empty element mouse up' );

                    event.preventDefault();
                    event.stopPropagation();

                    tdcOperationUI.deactiveDraggedElement();
                    tdcOperationUI.hideHelper();

                    // @todo The current element over must be undefined?
                    //tdcOperationUI.setCurrentElementOver( undefined );
                    tdcElementUI.positionEmptyElementPlaceholder( event );

                } else {
                    tdcMaskUI.setCurrentElement( $element );
                }

            }).mousemove(function( event ) {

                // Respond only if dragged element is 'tdc-element' or inner row
                //console.log( tdcOperationUI.getDraggedElement() );
                //console.log( $element );
                if ( tdcOperationUI.isElementDragged() || ( ( tdcOperationUI.isInnerRowDragged() || tdcOperationUI.isTempInnerRowDragged() ) && $element.hasClass( 'tdc-element-column' ) ) ) {
                    //tdcDebug.log( 'empty element mouse move' );

                    event.preventDefault();
                    event.stopPropagation();

                    tdcOperationUI.showHelper( event );

                    tdcOperationUI.setCurrentElementOver( $element );
                    tdcElementUI.positionEmptyElementPlaceholder( event );
                }

            }).mouseenter(function( event ) {

                // Respond only if dragged element is 'tdc-element' or inner row
                if ( tdcOperationUI.isElementDragged() || ( ( tdcOperationUI.isInnerRowDragged() || tdcOperationUI.isTempInnerRowDragged() ) && $element.hasClass( 'tdc-element-column' ) ) ) {
                    //tdcDebug.log( 'empty element mouse enter' );

                    event.preventDefault();

                    tdcOperationUI.setCurrentElementOver( $element );
                    tdcElementUI.positionEmptyElementPlaceholder( event );

                } else if ( _.isUndefined( tdcOperationUI.getDraggedElement() ) ) {
                    tdcMaskUI.setCurrentElement( $element );
                }

            }).mouseleave(function( event ) {

                // Respond only if dragged element is 'tdc-element' or inner row
                if ( tdcOperationUI.isElementDragged() || ( ( tdcOperationUI.isInnerRowDragged() || tdcOperationUI.isTempInnerRowDragged() ) && $element.hasClass( 'tdc-element-column' ) ) ) {
                    //tdcDebug.log( 'empty element mouse leave' );

                    event.preventDefault();

                    tdcOperationUI.setCurrentElementOver( undefined );
                    tdcElementUI.positionEmptyElementPlaceholder( event );

                } else if ( _.isUndefined( tdcOperationUI.getDraggedElement() ) ) {
                    tdcMaskUI.setCurrentElement( undefined );
                }

            });
        },


        /**
         * Check an element is the first of its inner column parent
         *
         * @param $element
         * @returns {boolean}
         */
        isInnerColumnFirstElement: function( $element ) {

            // Not implemented yet!
            //return $element.hasClass( 'tdc-first-element' );

            var $column = $element.closest( '.tdc-column' ),
                $innerColumn = $column.find( '.tdc-inner-column' );

            // The checked element is also inside of the inner column
            if ( $innerColumn.length ) {

                var $innerColumnElements = $innerColumn.find( '.tdc-element-inner-column' );

                if ( $innerColumnElements.length && 0 === $innerColumnElements.index( $element ) ) {
                    return true;
                }
            }

            return false;
        },


        /**
         * Check an element is the last of its inner column parent
         *
         * @param $element
         * @returns {boolean}
         */
        isInnerColumnLastElement: function( $element ) {

            // Not implemented yet!
            //return $element.hasClass( 'tdc-last-element' );

            var $column = $element.closest( '.tdc-column' ),
                $innerColumn = $column.find( '.tdc-inner-column' );

            // The checked element is also inside of the inner column
            if ( $innerColumn.length ) {

                var $innerColumnElements = $innerColumn.find( '.tdc-element-inner-column' );

                if ( $innerColumnElements.length && $innerColumnElements.length === $innerColumnElements.index( $element ) + 1 ) {
                    return true;
                }
            }

            return false;
        }


        ///**
        // * Get the model custom title or, if it does not exist, the model tag
        // *
        // * @param $element
        // */
        //getSidebarCurrentElementContent: function( $element ) {
        //    var sidebarCurrentElementContent;
        //
        //    var model = tdcIFrameData.getModel( $element.data( 'model_id' ) ),
        //        modelAtts = model.get( 'attrs' );
        //
        //    //if (_.has( modelAtts, 'custom_title' ) ) {
        //    if (_.has( modelAtts, 'custom_title' ) && ! _.isUndefined( modelAtts.custom_title ) && '' !== modelAtts.custom_title ) {
        //        sidebarCurrentElementContent = modelAtts.custom_title;
        //    } else {
        //        sidebarCurrentElementContent = model.get( 'tag' );
        //    }
        //
        //    return sidebarCurrentElementContent;
        //}
    };

})(jQuery, Backbone, _);
