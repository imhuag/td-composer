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



var tdcColumnUI;

(function( jQuery, backbone, _, undefined ) {

    'use strict';

    tdcColumnUI = {

        // The 'tdc-column' elements
        tdcColumn: undefined,




        init: function() {

            tdcColumnUI.tdcColumn = tdcOperationUI.iframeContents.find( '.tdc-column' );

            tdcColumnUI.tdcColumn.each(function( index, element ) {

                var $element = jQuery( element );

                $element.click(function( event ) {
                    //tdcDebug.log( 'click column' );

                    event.preventDefault();


                }).mousedown(function( event ) {
                    //tdcDebug.log( 'column mouse down' );

                    event.preventDefault();
                    event.stopPropagation();

                    tdcOperationUI.activeDraggedElement( jQuery( this ) );
                    tdcOperationUI.showHelper( event );

                    //setVerticalPlaceholder();

                    tdcOperationUI.setCurrentElementOver( $element );
                    tdcColumnUI.positionColumnPlaceholder( event );

                    tdcMaskUI.hide();
                    
                    tdcMaskUI.setBreadcrumb( $element );

                }).mouseup(function( event ) {

                    // Respond only if dragged element is 'tdc-column'
                    if ( tdcOperationUI.isColumnDragged( $element ) ) {
                        //tdcDebug.log( 'column mouse up' );

                        event.preventDefault();

                        tdcOperationUI.deactiveDraggedElement();
                        tdcOperationUI.hideHelper();

                        tdcOperationUI.setCurrentElementOver( undefined );
                        tdcColumnUI.positionColumnPlaceholder( event );
                    }

                }).mousemove(function( event ) {

                    // Respond only if dragged element is 'tdc-column'
                    if ( tdcOperationUI.isColumnDragged( $element ) ) {
                        //tdcDebug.log( 'column mouse move' );

                        event.preventDefault();
                        event.stopPropagation();

                        tdcOperationUI.showHelper( event );

                        tdcOperationUI.setCurrentElementOver( $element );
                        tdcColumnUI.positionColumnPlaceholder( event );
                    }

                }).mouseenter(function( event ) {

                    // Respond only if dragged element is 'tdc-column'
                    if ( tdcOperationUI.isColumnDragged( $element ) ) {
                        //tdcDebug.log( 'column mouse enter' );

                        event.preventDefault();

                        tdcOperationUI.setCurrentElementOver( $element );
                        tdcColumnUI.positionColumnPlaceholder( event );
                    }

                }).mouseleave(function(event) {

                    // Respond only if dragged element is 'tdc-column'
                    if ( tdcOperationUI.isColumnDragged( $element ) ) {
                        //tdcDebug.log( 'column mouse leave' );

                        event.preventDefault();

                        tdcOperationUI.setCurrentElementOver( undefined );
                        tdcColumnUI.positionColumnPlaceholder( event );
                    }

                }).on( 'fakemouseenterevent', function(event) {

                    // Respond only if dragged element is 'tdc-column'
                    if ( tdcOperationUI.isColumnDragged( $element ) ) {
                        //tdcDebug.log( 'tdc-column FAKE MOUSE ENTER EVENT' );

                        var list_tdc_elements = $element.find( '.tdc-elements:first' );

                        if ( ! list_tdc_elements.length ) {
                            return;
                        }

                        var outerHeight = list_tdc_elements.outerHeight( true );
                        var outerWidth = list_tdc_elements.outerWidth();

                        var offset = $element.offset();

                        // Being floated, all prev columns width must be considered when working with the offset().left
                        var extraLeft = 0;
                        var prevColumns = $element.prevAll( '.tdc-column' );

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

                            // Set the 'current_element_over' variable to the current element
                            tdcOperationUI.setCurrentElementOver( $element );

                            // Position the placeholder
                            tdcColumnUI.positionColumnPlaceholder( event );
                        }
                    }
                });
            });
        },


        positionColumnPlaceholder: function( event ) {
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
                // Trigger a custom event for all 'tdc-column' elements, but stop if one is found

                // Set the 'currentElementOver' to undefined, to be find in the iteration
                tdcOperationUI.setCurrentElementOver( undefined );

                // Trigger an 'fakemouseenterevent' event, for siblings 'tdc-column' elements, or until the variable 'currentElementOver' is set to one of them
                tdcOperationUI.getDraggedElement().closest( '.tdc-columns').find( '.tdc-column' ).each(function( index, element ) {

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

            var elementOuterWidth = currentElementOver.find( '.tdc-elements:first').outerWidth( true ),
                elementOffset = currentElementOver.offset(),

            // Being floated, all prev columns width must be considered when working with the offset().left
                extraLeft = 0,
                prevColumns = currentElementOver.prevAll();

            if ( prevColumns.length ) {
                prevColumns.each( function (index, element) {
                    var $element = jQuery( element );
                    if ( ! $element.hasClass( 'tdc-column' ) ) {
                        return;
                    }
                    extraLeft += parseInt( $element.find( '.tdc-elements:first').width() );
                });
            }

            //tdcDebug.log( mousePointerValue.X + ' : ' + extraLeft + ' : ' + elementOffset.left + ' : ' + elementOuterWidth );

            var cssMarginLeftValue = 0;

            if ( extraLeft !== 0 ) {
                cssMarginLeftValue = 48;
            }

            extraLeft += elementOffset.left;


            if ( mousePointerValue.X > (extraLeft + ( elementOuterWidth / 2 ) ) ) {

                var $nextElement = currentElementOver.next();

                if ( ! $nextElement.length || ( $nextElement.length && $nextElement.attr( 'id' ) !== tdcAdminWrapperUI.placeholderId ) ) {
                    currentElementOver.after($placeholder);

                    // Update the helper
                    tdcOperationUI.updateInfoHelper();
                }
                //tdcDebug.log( '>>>>>>>>>>>>>>>>>>>>>>>>>>' );

                tdcOperationUI.setVerticalPlaceholder({
                    left: parseInt(extraLeft + elementOuterWidth),
                    'margin-left': cssMarginLeftValue
                });

            } else {

                var $prevElement = currentElementOver.prev();

                if ( ! $prevElement.length || ( $prevElement.length && $prevElement.attr( 'id' ) !== tdcAdminWrapperUI.placeholderId ) ) {
                    currentElementOver.before($placeholder);

                    // Update the helper
                    tdcOperationUI.updateInfoHelper();
                }

                //tdcDebug.log( '<<<<<<<<<<<<<<<<<<<<<<<<<<<<<' );

                tdcOperationUI.setVerticalPlaceholder({
                    left: parseInt(extraLeft),
                    'margin-left': cssMarginLeftValue
                });
            }

            // 'show' must be after setting placeholder (horizontal or vertical), to be shown at the first 'mousedown' event
            tdcOperationUI.showPlaceholder();

            // Hide the placeholder if it's near the dragged element
            //if ( $placeholder.next().length && $placeholder.next().hasClass( 'tdc-dragged' ) ||
            //    $placeholder.prev().length && $placeholder.prev().hasClass( 'tdc-dragged' ) ) {
            //    $placeholder.hide();
            //}
        }
    };

})( jQuery, Backbone, _ );