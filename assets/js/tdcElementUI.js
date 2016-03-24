/**
 * Created by tagdiv on 24.03.2016.
 */

/* global jQuery:{} */
/* global Backbone:{} */
/* global _:{} */

/* global tdcAdminWrapperUI:{} */
/* global tdcAdminIFrameUI:{} */
/* global tdcOperationUI:{} */



var tdcElementUI;

(function(jQuery, backbone, _, undefined) {

    'use strict';

    tdcElementUI = {

        // The 'tdc-element' elements (tagdiv blocks)
        tdcElement: undefined,

        // The 'tdc-elements' elements
        tdcElements: undefined,




        init: function() {

            tdcElementUI.tdcElement = tdcOperationUI.iframeContents.find( '.tdc-element' );

            tdcElementUI.tdcElements = tdcOperationUI.iframeContents.find( '.tdc-elements' );


            tdcElementUI.tdcElement.each(function( index, element ) {

                var $element = jQuery( element );

                $element.click(function( event ) {
                    //tdcDebug.log( 'click element' );

                    event.preventDefault();

                }).mousedown(function( event ) {
                    //tdcDebug.log( 'element mouse down' );

                    event.preventDefault();
                    // Stop calling parents 'mousedown' (tdc-element-inner-column or tdc-column - each tdc-element must be in one of theme)
                    event.stopPropagation();

                    tdcOperationUI.activeDraggedElement( $element );
                    tdcOperationUI.showHelper( event );

                    tdcOperationUI.setCurrentElementOver( $element );
                    tdcElementUI.positionElementPlaceholder( event );

                }).mouseup(function( event ) {

                    // Respond only if dragged element is 'tdc-element'
                    if ( tdcOperationUI.isElementDragged() || ( tdcOperationUI.isInnerRowDragged() && $element.hasClass( 'tdc-element-column' ) ) ) {
                        //tdcDebug.log( 'element mouse up' );

                        event.preventDefault();

                        tdcOperationUI.deactiveDraggedElement();
                        tdcOperationUI.hideHelper();

                        tdcAdminIFrameUI.currentElementOver = undefined;
                        tdcElementUI.positionElementPlaceholder( event );
                    }

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
                    }

                }).mouseleave(function( event ) {

                    // Respond only if dragged element is 'tdc-element' or inner row
                    if ( tdcOperationUI.isElementDragged() || ( tdcOperationUI.isInnerRowDragged() && $element.hasClass( 'tdc-element-column' ) ) ) {
                        //tdcDebug.log( 'element mouse leave' );

                        event.preventDefault();

                        tdcOperationUI.setCurrentElementOver( undefined );
                        tdcElementUI.positionElementPlaceholder( event );
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
            });


            tdcElementUI.tdcElements.each(function( index, element ) {

                jQuery( element ).hover( function( event ) {
                        //tdcDebug.log( 'tdc-elements mouse enter' );

                        event.preventDefault();
                    },
                    function(event) {
                        //tdcDebug.log( 'tdc-elements mouse leave' );

                        event.preventDefault();
                    });
            });
        },


        positionElementPlaceholder: function( event ) {

            //tdcDebug.log( event );

            var $placeholder = tdcAdminWrapperUI._tdcJqObjPlaceholder;

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
                currentElementOver = undefined;

                // Trigger a 'fakemouseenterevent' event, for all 'tdc-element' elements, or until the variable 'currentElementOver' is set to one of them
                tdcElementUI.tdcElement.each(function( index, element ) {

                    if ( ! _.isUndefined( currentElementOver ) ) {
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

                $placeholder.hide();
                return;
            }



            // If a 'tdc-element' is dragged and the 'currentElementOver' is not undefined, show and position the placeholder

            var elementOuterHeight = currentElementOver.outerHeight( true),
                elementOuterWidth = currentElementOver.innerWidth(),
                elementOffset = currentElementOver.offset();

            //tdcDebug.log( mousePointerValue.Y + ' : ' +  ( elementOffset.top + ( elementOuterHeight / 2 ) ) );

            if ( mousePointerValue.Y > elementOffset.top + ( elementOuterHeight / 2 ) ) {

                var $nextElement = currentElementOver.next();

                if ( ! $nextElement.length || ( $nextElement.length && $nextElement.attr( 'id' ) !== tdcAdminWrapperUI._tdcJqObjPlaceholderId ) ) {
                    currentElementOver.after($placeholder);
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

                var $prevElement = currentElementOver.prev();

                if ( ! $prevElement.length || ( $prevElement.length && $prevElement.attr( 'id' ) !== tdcAdminWrapperUI._tdcJqObjPlaceholderId ) ) {
                    currentElementOver.before($placeholder);
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
            $placeholder.show();


            // Hide the placeholder if it's near the dragged element
            //if ( $placeholder.next().length && $placeholder.next().hasClass( 'tdc-dragged' ) ||
            //    $placeholder.prev().length && $placeholder.prev().hasClass( 'tdc-dragged' ) ) {
            //    $placeholder.hide();
            //}
        }
    };

})(jQuery, Backbone, _);
