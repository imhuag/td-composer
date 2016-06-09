/**3
 * Created by tagdiv on 24.03.2016.
 */

/* global jQuery:{} */
/* global Backbone:{} */
/* global _:{} */

/* global tdcAdminWrapperUI:{} */
/* global tdcOperationUI:{} */
/* global tdcSidebar:{} */
/* global tdcMaskUI:{} */



var tdcRowUI;

(function( jQuery, backbone, _, undefined ) {

    'use strict';

    tdcRowUI = {

        // The css class of the handler element
        _elementCssClass: 'tdc-row',

        // The 'tdc-row' elements
        tdcRow: undefined,


        /**
         *
         * @param $content
         */
        init: function( $content ) {

            if ( _.isUndefined( $content ) ) {
                $content = tdcOperationUI.iframeContents;
            }

            tdcRowUI.tdcRow = $content.find( '.tdc-row' );

            tdcRowUI.tdcRow.each(function (index, element) {
                tdcRowUI.bindRow( jQuery( element ) );
            });
        },

        // SOLVE A CHROME BUG - mousemove event triggered after mousedown!
        _mouseCoordinates: undefined,

        _setMouseCoordinates: function( _mouseCoordinates ) {
            tdcRowUI._mouseCoordinates = _mouseCoordinates;
        },

        _getMouseCoordinates: function() {
            return tdcRowUI._mouseCoordinates;
        },


        /**
         *
         * @param $element
         */
        bindRow: function( $element ) {

            // Unbind any event.
            // This allows us to reuse the 'bindRow' method for the same elements
            $element.unbind();


            $element.click( function( event ) {
                //tdcDebug.log( 'click row' );

                event.preventDefault();
                event.stopPropagation();

            }).mousedown(function( event ) {
                //tdcDebug.log( 'row mouse down' );

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
                tdcRowUI.positionRowPlaceholder( event, true );

                //tdcMaskUI.hide();

                tdcSidebar.setSettings({
                    '$currentRow': tdcOperationUI.inRow( $element )
                });

                // Set the mouse coordinates
                // SOLVE A CHROME BUG - mousemove event triggered after mousedown!
                tdcRowUI._setMouseCoordinates({
                    screenX: event.screenX,
                    screenY: event.screenY
                });

            }).mouseup(function( event ) {

                // Respond only if dragged element is 'tdc-row'
                if ( tdcOperationUI.isRowDragged() || tdcOperationUI.isTempRowDragged() ) {
                    //tdcDebug.log( 'row mouse up' );

                    event.preventDefault();

                    tdcOperationUI.deactiveDraggedElement();
                    tdcOperationUI.hideHelper();

                    // Reset the mouse coordinates
                    // SOLVE A CHROME BUG - mousemove event triggered after mousedown!
                    tdcRowUI._setMouseCoordinates( undefined );
                }

            }).mousemove(function( event ) {

                // Respond only if dragged element is 'tdc-row'
                if ( tdcOperationUI.isRowDragged() || tdcOperationUI.isTempRowDragged() ) {
                    //tdcDebug.log( 'row mouse move' );

                    // Do not continue if the mouse coordinates are the same
                    // SOLVE A CHROME BUG - mousemove event triggered after mousedown!
                    if ( _.isEqual( {
                            screenX: event.screenX,
                            screenY: event.screenY
                        }, tdcRowUI._getMouseCoordinates() ) ) {

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
                    tdcRowUI.positionRowPlaceholder( event );

                    tdcMaskUI.hide();

                    // Reset the mouse coordinates
                    // SOLVE A CHROME BUG - mousemove event triggered after mousedown!
                    tdcRowUI._setMouseCoordinates( undefined );
                }

            }).mouseenter(function( event ) {

                // Respond only if dragged element is 'tdc-row'
                if ( tdcOperationUI.isRowDragged() || tdcOperationUI.isTempRowDragged() ) {
                    //tdcDebug.log('row mouse enter');

                    event.preventDefault();

                    tdcOperationUI.setCurrentElementOver( $element );
                    tdcRowUI.positionRowPlaceholder( event );
                }

            }).mouseleave(function( event ) {

                // Respond only if dragged element is 'tdc-row'
                if ( tdcOperationUI.isRowDragged() || tdcOperationUI.isTempRowDragged() ) {
                    //tdcDebug.log('row mouse leave');

                    event.preventDefault();

                    tdcOperationUI.setCurrentElementOver( undefined );
                    tdcRowUI.positionRowPlaceholder( event );
                }

            }).on( 'fakemouseenterevent', function( event ) {

                // Respond only if dragged element is 'tdc-row'
                if ( tdcOperationUI.isRowDragged() || tdcOperationUI.isTempRowDragged() ) {
                    //tdcDebug.log( 'tdc-row FAKE MOUSE ENTER EVENT' );

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
                        tdcRowUI.positionRowPlaceholder( event );
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
        positionRowPlaceholder: function( event, positionAndHide ) {
            //tdcDebug.log( event );

            var $placeholder = tdcAdminWrapperUI.$placeholder;

            // Adapt the placeholder to look great when it's not on columns and inner-columns
            tdcOperationUI.setHorizontalPlaceholder();

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

                // These are saved here, and used at 'scroll', for computing the mouse position over a 'tdcElement' element
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
                // Trigger a custom event for all 'tdc-row' elements, but stop if one is found

                // Set the 'currentElementOver' to undefined, to be find in the iteration
                tdcOperationUI.setCurrentElementOver( undefined );

                // Trigger an 'fakemouseenterevent' event, for all 'tdc-row' elements, or until the variable 'currentElementOver' is set to one of them
                tdcRowUI.tdcRow.each(function( index, element ) {

                    if ( ! _.isUndefined( tdcOperationUI.getCurrentElementOver() ) ) {
                        // If it's not undefined, ( marked by 'fakemouseenterevent' event of the 'tdc-row' ) DO NOTHING (DO NOT TRIGGER ANY MORE 'fakemouseenterevent' EVENT)
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

            var elementOuterHeight = currentElementOver.outerHeight( true ),
                elementOuterWidth = currentElementOver.innerWidth(),
                elementOffset = currentElementOver.offset();

            //tdcDebug.log( mousePointerValue.Y + ' : ' +  ( elementOffset.top + ( elementOuterHeight / 2 ) ) );

            if ( mousePointerValue.Y > elementOffset.top + ( elementOuterHeight / 2 ) ) {

                var $nextElement = currentElementOver.next();

                if ( ! $nextElement.length || ( $nextElement.length && $nextElement.attr( 'id' ) !== tdcAdminWrapperUI.placeholderId ) ) {
                    currentElementOver.after($placeholder);

                    // Update the helper
                    tdcOperationUI.updateInfoHelper();
                }

                // Position the placeholder at the bottom of the screen
                if ( parseInt( elementOffset.top ) + parseInt( elementOuterHeight ) > parseInt( tdcOperationUI.iframeContents.scrollTop() ) + parseInt( window.innerHeight ) ) {
                    $placeholder.css({
                        'position': 'fixed',
                        'top': '',
                        'right': 'auto',
                        'bottom': '0',
                        'width': parseInt(elementOuterWidth / 2) + 'px'
                    });
                } else {
                    // Reset
                    $placeholder.css({
                        'position': 'absolute',
                        'top': '',
                        'right': '0',
                        'bottom': '',
                        'width': ''
                    });
                }

            } else {

                var $prevElement = currentElementOver.prev();

                if ( ! $prevElement.length || ( $prevElement.length && $prevElement.attr( 'id' ) !== tdcAdminWrapperUI.placeholderId ) ) {
                    currentElementOver.before( $placeholder );

                    // Update the helper
                    tdcOperationUI.updateInfoHelper();
                }

                // Position the placeholder at the top of the screen
                if ( parseInt( elementOffset.top ) < parseInt( tdcOperationUI.iframeContents.scrollTop() ) ) {
                    $placeholder.css({
                        'position': 'fixed',
                        'top': '0',
                        'right': 'auto',
                        'bottom': '',
                        'width': parseInt(elementOuterWidth / 2) + 'px'
                    });
                } else {
                    // Reset
                    $placeholder.css({
                        'position': 'absolute',
                        'top': '',
                        'right': '0',
                        'bottom': '',
                        'width': ''
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
            return tdcRowUI._elementCssClass;
        }
    };

})( jQuery, Backbone, _ );