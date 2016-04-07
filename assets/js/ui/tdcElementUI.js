/**
 * Created by tagdiv on 24.03.2016.
 */

/* global jQuery:{} */
/* global Backbone:{} */
/* global _:{} */

/* global tdcAdminWrapperUI:{} */
/* global tdcAdminIFrameUI:{} */
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



        init: function() {

            tdcElementUI.tdcElement = tdcOperationUI.iframeContents.find( '.tdc-element' );

            tdcElementUI.tdcElement.each(function( index, element ) {

                tdcElementUI.defineOperations( jQuery( element ) );
            });
        },


        positionElementPlaceholder: function( event ) {

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

            var elementOuterHeight = currentElementOver.outerHeight( true),
                elementOuterWidth = currentElementOver.innerWidth(),
                elementOffset = currentElementOver.offset();

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

                    $nextElement = $innerRowParent.next();

                    if ( ! $nextElement.length || ( $nextElement.length && $nextElement.attr( 'id' ) !== tdcAdminWrapperUI.placeholderId ) ) {
                        $innerRowParent.after($placeholder);

                        // Update the helper
                        tdcOperationUI.updateInfoHelper();
                    }

                } else {

                    // Usual case:
                    // Position the placeholder inside the inner-column

                    $nextElement = currentElementOver.next();

                    if ( ! $nextElement.length || ( $nextElement.length && $nextElement.attr( 'id' ) !== tdcAdminWrapperUI.placeholderId ) ) {
                        currentElementOver.after($placeholder);

                        // Update the helper
                        tdcOperationUI.updateInfoHelper();
                    }
                }







                // Position the placeholder at the bottom of the screen
                if ( parseInt( elementOffset.top ) + parseInt( elementOuterHeight ) > parseInt( tdcOperationUI.iframeContents.scrollTop()) + parseInt( window.innerHeight ) ) {
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

                    $prevElement = $innerRowParent.prev();

                    if ( ! $prevElement.length || ( $prevElement.length && $prevElement.attr( 'id' ) !== tdcAdminWrapperUI.placeholderId ) ) {
                        $innerRowParent.before($placeholder);

                        // Update the helper
                        tdcOperationUI.updateInfoHelper();
                    }

                } else {

                    // Usual case:
                    // Position the placeholder inside the inner-column

                    $prevElement = currentElementOver.prev();

                    if ( ! $prevElement.length || ( $prevElement.length && $prevElement.attr( 'id' ) !== tdcAdminWrapperUI.placeholderId ) ) {
                        currentElementOver.before($placeholder);

                        // Update the helper
                        tdcOperationUI.updateInfoHelper();
                    }
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

            // 'show' must be after setting placeholder (horizontal or vertical), to be shown at the first 'mousedown' event
            tdcOperationUI.showPlaceholder();

            // Hide the placeholder if it's near the dragged element
            //if ( $placeholder.next().length && $placeholder.next().hasClass( 'tdc-dragged' ) ||
            //    $placeholder.prev().length && $placeholder.prev().hasClass( 'tdc-dragged' ) ) {
            //    $placeholder.hide();
            //}
        },


        defineOperations: function( $element ) {

            $element.click(function( event ) {
                //tdcDebug.log( 'click element' );

                event.preventDefault();
                event.stopPropagation();

                tdcMaskUI.setBreadcrumb( $element );

            }).mousedown(function( event ) {
                //tdcDebug.log( 'element mouse down' );

                event.preventDefault();
                // Stop calling parents 'mousedown' (tdc-element-inner-column or tdc-column - each tdc-element must be in one of theme)
                event.stopPropagation();

                tdcOperationUI.activeDraggedElement( $element );
                tdcOperationUI.showHelper( event );

                tdcOperationUI.setCurrentElementOver( $element );
                tdcElementUI.positionElementPlaceholder( event );

                tdcMaskUI.hide();

            }).mouseup(function( event ) {

                // Respond only if dragged element is 'tdc-element'
                if ( tdcOperationUI.isElementDragged() || ( tdcOperationUI.isInnerRowDragged() && $element.hasClass( 'tdc-element-column' ) ) ) {
                    //tdcDebug.log( 'element mouse up' );

                    event.preventDefault();

                    tdcOperationUI.deactiveDraggedElement();
                    tdcOperationUI.hideHelper();

                    // @todo The current element over must be undefined?
                    //tdcOperationUI.setCurrentElementOver( undefined );
                    tdcElementUI.positionElementPlaceholder( event );
                }
                tdcMaskUI.setCurrentElement( $element );

            }).mousemove(function( event ) {

                // Respond only if dragged element is 'tdc-element' or inner row
                if ( tdcOperationUI.isElementDragged() || ( tdcOperationUI.isInnerRowDragged() && $element.hasClass( 'tdc-element-column' ) ) ) {
                    //tdcDebug.log( 'element mouse move' );

                    event.preventDefault();
                    event.stopPropagation();

                    tdcOperationUI.showHelper( event );

                    tdcOperationUI.setCurrentElementOver( $element );
                    tdcElementUI.positionElementPlaceholder( event );
                }

            }).mouseenter(function( event ) {

                // Respond only if dragged element is 'tdc-element' or inner row
                if ( tdcOperationUI.isElementDragged() || ( tdcOperationUI.isInnerRowDragged() && $element.hasClass( 'tdc-element-column' ) ) ) {
                    //tdcDebug.log( 'element mouse enter' );

                    event.preventDefault();

                    tdcOperationUI.setCurrentElementOver( $element );
                    tdcElementUI.positionElementPlaceholder( event );

                } else if ( _.isUndefined( tdcOperationUI.getDraggedElement() ) ) {
                    tdcMaskUI.setCurrentElement( $element );
                }

            }).mouseleave(function( event ) {

                // Respond only if dragged element is 'tdc-element' or inner row
                if ( tdcOperationUI.isElementDragged() || ( tdcOperationUI.isInnerRowDragged() && $element.hasClass( 'tdc-element-column' ) ) ) {
                    //tdcDebug.log( 'element mouse leave' );

                    event.preventDefault();

                    tdcOperationUI.setCurrentElementOver( undefined );
                    tdcElementUI.positionElementPlaceholder( event );

                } else if ( _.isUndefined( tdcOperationUI.getDraggedElement() ) ) {
                    tdcMaskUI.setCurrentElement( undefined );
                }

            }).on( 'fakemouseenterevent', function(event) {

                // Respond only if dragged element is 'tdc-element' or inner row
                if ( tdcOperationUI.isElementDragged() || ( tdcOperationUI.isInnerRowDragged() && $element.hasClass( 'tdc-element-column' ) ) ) {
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


        defineOperationsForEmptyElement: function( $element ) {

            $element.click(function( event ) {
                //tdcDebug.log( 'click empty element' );

                event.preventDefault();

            }).mousedown(function( event ) {
                //tdcDebug.log( 'empty element mouse down' );

                event.preventDefault();
                // Stop calling parents 'mousedown' (tdc-element-inner-column or tdc-column - each tdc-element must be in one of theme)
                event.stopPropagation();

                tdcMaskUI.hide();

            }).mouseup(function( event ) {

                // Respond only if dragged element is 'tdc-element'
                if ( tdcOperationUI.isElementDragged() || ( tdcOperationUI.isInnerRowDragged() && $element.hasClass( 'tdc-element-column' ) ) ) {
                    //tdcDebug.log( 'empty element mouse up' );

                    event.preventDefault();

                    tdcOperationUI.deactiveDraggedElement();
                    tdcOperationUI.hideHelper();

                    // @todo The current element over must be undefined?
                    //tdcOperationUI.setCurrentElementOver( undefined );
                    tdcElementUI.positionElementPlaceholder( event );

                } else {
                    tdcMaskUI.setCurrentElement( $element );
                }

            }).mousemove(function( event ) {

                // Respond only if dragged element is 'tdc-element' or inner row
                //console.log( tdcOperationUI.getDraggedElement() );
                //console.log( $element );
                if ( tdcOperationUI.isElementDragged() || ( tdcOperationUI.isInnerRowDragged() && $element.hasClass( 'tdc-element-column' ) ) ) {
                    //tdcDebug.log( 'empty element mouse move' );

                    event.preventDefault();
                    event.stopPropagation();

                    tdcOperationUI.showHelper( event );

                    tdcOperationUI.setCurrentElementOver( $element );
                    tdcElementUI.positionElementPlaceholder( event );
                }

            }).mouseenter(function( event ) {

                // Respond only if dragged element is 'tdc-element' or inner row
                if ( tdcOperationUI.isElementDragged() || ( tdcOperationUI.isInnerRowDragged() && $element.hasClass( 'tdc-element-column' ) ) ) {
                    //tdcDebug.log( 'empty element mouse enter' );

                    event.preventDefault();

                    tdcOperationUI.setCurrentElementOver( $element );
                    tdcElementUI.positionElementPlaceholder( event );

                } else if ( _.isUndefined( tdcOperationUI.getDraggedElement() ) ) {
                    tdcMaskUI.setCurrentElement( $element );
                }

            }).mouseleave(function( event ) {

                // Respond only if dragged element is 'tdc-element' or inner row
                if ( tdcOperationUI.isElementDragged() || ( tdcOperationUI.isInnerRowDragged() && $element.hasClass( 'tdc-element-column' ) ) ) {
                    //tdcDebug.log( 'empty element mouse leave' );

                    event.preventDefault();

                    tdcOperationUI.setCurrentElementOver( undefined );
                    tdcElementUI.positionElementPlaceholder( event );

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

            var $innerColumn = $element.closest( '.tdc-inner-column' );

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
         * Check an element is the first of its inner column parent
         *
         * @param $element
         * @returns {boolean}
         */
        isInnerColumnLastElement: function( $element ) {

            var $innerColumn = $element.closest( '.tdc-inner-column' );

            // The checked element is also inside of the inner column
            if ( $innerColumn.length ) {

                var $innerColumnElements = $innerColumn.find( '.tdc-element-inner-column' );

                if ( $innerColumnElements.length && $innerColumnElements.length === $innerColumnElements.index( $element ) + 1 ) {
                    return true;
                }
            }

            return false;
        }
    };

})(jQuery, Backbone, _);
