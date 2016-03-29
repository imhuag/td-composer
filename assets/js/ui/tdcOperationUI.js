/**
 * Created by tagdiv on 24.03.2016.
 */

/* global jQuery:{} */
/* global Backbone:{} */
/* global _:{} */

/* global tdcAdminWrapperUI:{} */
/* global tdcMaskUI:{} */
/* global tdcRowUI:{} */
/* global tdcColumnUI:{} */
/* global tdcInnerRowUI:{} */
/* global tdcInnerColumnUI:{} */
/* global tdcElementUI:{} */

var tdcOperationUI;

(function(jQuery, backbone, _, undefined) {

    'use strict';

    tdcOperationUI = {

        iframeContents: undefined,

        // The 'tdc-element', 'tdc-inner-column', 'tdc-element-inner-row', 'tdc-column' or 'tdc-row'  being dragged
        _draggedElement: undefined,

        // The 'tdc-element', 'tdc-inner-column', 'tdc-element-inner-row', 'tdc-column' or 'tdc-row' where the 'draggedElement' is over
        _currentElementOver: undefined,

        _emptyElementClass: 'tdc-element-empty',

        _isPlaceholderVisible: false,

        _intervalUpdateInfoHelper: undefined,


        init: function( iframeContents ) {

            window.previousMouseClientX = 0;
            window.previousMouseClientY = 0;

            tdcOperationUI.iframeContents = iframeContents;


            tdcRowUI.init();
            tdcColumnUI.init();
            tdcInnerRowUI.init();
            tdcInnerColumnUI.init();
            tdcElementUI.init();


            tdcAdminWrapperUI.$mask = jQuery('<div id="' + tdcAdminWrapperUI.maskId + '"></div>');
            tdcOperationUI.iframeContents.find('body').append( tdcAdminWrapperUI.$mask );
            tdcMaskUI.init( tdcAdminWrapperUI.$mask );


            jQuery( window ).mouseup(function( event ) {
                //tdcDebug.log( 'window mouse up' );

                tdcOperationUI.deactiveDraggedElement();
                tdcOperationUI.hideHelper();

            }).mousemove(function( event ) {
                //tdcDebug.log( 'window mouse move' );

                tdcOperationUI.showHelper( event );
            });



            iframeContents.mousedown(function(event) {
                //tdcDebug.log( 'contents mouse down' );

            }).mouseup(function(event) {
                //tdcDebug.log( 'contents mouse up' );

                tdcOperationUI.deactiveDraggedElement();
                tdcOperationUI.hideHelper();

                tdcOperationUI.setCurrentElementOver( undefined );
                tdcElementUI.positionElementPlaceholder( event );

                // Hide the mask
                //tdcMaskUI.setCurrentElement( undefined );


            }).mousemove(function(event) {
                //tdcDebug.log( 'contents mouse move' );

                tdcOperationUI.showHelper( event );

                window.previousMouseClientX = event.clientX;
                window.previousMouseClientY = event.clientY;

            }).scroll(function( event ) {
                //tdcDebug.log( '------------- content scroll -------------' );

                if ( tdcOperationUI.isElementDragged() ) {
                    tdcElementUI.positionElementPlaceholder( event );
                } else if ( tdcOperationUI.isInnerColumnDragged() ) {
                    tdcInnerColumnUI.positionInnerColumnPlaceholder( event );
                } else if ( tdcOperationUI.isInnerRowDragged() ) {
                    tdcInnerRowUI.positionInnerRowPlaceholder( event );
                } else if ( tdcOperationUI.isColumnDragged() ) {
                    tdcColumnUI.positionColumnPlaceholder( event );
                } else if ( tdcOperationUI.isRowDragged() ) {
                    tdcRowUI.positionRowPlaceholder( event);
                }
            });




            tdcAdminWrapperUI.$helper.mouseup(function( event ) {
                //tdcDebug.log( 'helper mouse up' );

                tdcOperationUI.hideHelper();
            });

            window.test = function() {
                tdcDebug.log( 1 );
            };
        },




        setDraggedElement: function( draggedElement ) {
            tdcOperationUI._draggedElement = draggedElement;
        },


        getDraggedElement: function() {
            return tdcOperationUI._draggedElement;
        },




        setCurrentElementOver: function( currentElementOver ) {
            tdcOperationUI._currentElementOver = currentElementOver;
        },


        getCurrentElementOver: function() {
            return tdcOperationUI._currentElementOver;
        },




        activeDraggedElement: function( currentElement ) {
            tdcOperationUI.setDraggedElement( currentElement );

            if ( ! tdcOperationUI._draggedElement.hasClass( 'tdc-dragged' ) ) {
                tdcOperationUI._draggedElement.css({
                    opacity: 0.5
                });
                tdcOperationUI._draggedElement.addClass( 'tdc-dragged' );
                //tdcDebug.log( 'ACTIVATE' );
                //tdcDebug.log( draggedElement );
            }
        },


        deactiveDraggedElement: function() {

            var draggedElement = tdcOperationUI.getDraggedElement();

            if ( ! _.isUndefined( draggedElement ) ) {
                draggedElement.css({
                    opacity: ''
                });
                draggedElement.removeClass( 'tdc-dragged' );

                tdcOperationUI._moveDraggedElement();

                //tdcDebug.log( 'DEACTIVATE' );
                //tdcDebug.log( draggedElement );

                tdcOperationUI.setDraggedElement( undefined );
            } else {
                //tdcDebug.log( 'dragged UNDEFINED' );
            }
        },



        /**
         * Show/hide, position the helper and set its 'tdcElementType' data
         *
         * @param mouseEvent
         */
        showHelper: function( mouseEvent ) {

            var $helper = tdcAdminWrapperUI.$helper,
                $draggedElement = tdcOperationUI.getDraggedElement();

            if ( ! _.isUndefined( $draggedElement ) ) {
                $helper.css({
                    left: mouseEvent.clientX - 50,
                    top: mouseEvent.clientY - 50
                });
                $helper.show();

                if ( $draggedElement.hasClass( 'tdc-row' ) ) {
                    $helper.data( 'tdcElementType', 'ROW' );
                } else if ( $draggedElement.hasClass( 'tdc-column' ) ) {
                    $helper.data( 'tdcElementType', 'COLUMN' );
                } else if ( $draggedElement.hasClass( 'tdc-element-inner-row' ) ) {
                    $helper.data( 'tdcElementType', 'INNER ROW' );
                } else if ( $draggedElement.hasClass( 'tdc-inner-column' ) ) {
                    $helper.data( 'tdcElementType', 'INNER COLUMN' );
                } else if ( $draggedElement.hasClass( 'tdc-element' ) ) {
                    $helper.data( 'tdcElementType', 'ELEMENT' );
                } else {
                    $helper.data( 'tdcElementType', '' );
                }
            } else {
                tdcOperationUI.hideHelper();
            }
        },


        /**
         * Hide the helper
         */
        hideHelper: function() {
            tdcAdminWrapperUI.$helper.hide();
        },


        /**
         * - Get the helper data 'tdcElementType' and update the helper info using an interval.
         * - If there's already an interval started earlier, stop it and start a new one.
         * - The interval does nothing if the placeholder is not visible. It waits for the placeholder visibility.
         *
         * @param resetInfo boolean - just reset the helper info, without starting an interval
         */
        updateInfoHelper: function( resetInfo ) {

            if ( ! _.isUndefined( resetInfo ) && true === resetInfo ) {

                var $helper = tdcAdminWrapperUI.$helper,
                    tdcElementTypeData = $helper.data( 'tdcElementType' );

                $helper.html( tdcElementTypeData );
                return;
            }


            if ( ! _.isUndefined( tdcOperationUI._intervalUpdateInfoHelper ) ) {
                clearInterval( tdcOperationUI._intervalUpdateInfoHelper );
            }


            tdcOperationUI._intervalUpdateInfoHelper = setInterval( function(){

                if ( ! tdcOperationUI.isPlaceholderVisible() ) {
                    return;
                }

                clearInterval(tdcOperationUI._intervalUpdateInfoHelper);


                var $helper = tdcAdminWrapperUI.$helper,
                    $draggedElement = tdcOperationUI.getDraggedElement(),

                // The axis that will be checked ('x' or 'y')
                    axis = '',
                    tdcElementTypeData = $helper.data( 'tdcElementType' );

                if ( ! _.isUndefined( tdcElementTypeData ) && ( '' !== tdcElementTypeData ) && ! _.isUndefined( $draggedElement ) ) {

                    switch ( tdcElementTypeData ) {
                        case 'ROW' : axis = 'y'; break;
                        case 'COLUMN' : axis = 'x'; break;
                        case 'INNER ROW' : axis = 'y'; break;
                        case 'INNER COLUMN' : axis = 'x'; break;
                        case 'ELEMENT' : axis = 'y'; break;
                    }
                    if ( '' !== axis ) {

                        var $helperOffset = tdcAdminWrapperUI.$helper.offset(),
                            $placeholderOffset = tdcAdminWrapperUI.$placeholder.offset(),
                            direction = '';

                        if ( 'x' === axis ) {
                            if ( $helperOffset.left > $placeholderOffset.left ) {
                                //direction = 'left';
                                direction = '&#x2190;';
                            } else {
                                //direction = 'right';
                                direction = '&#x2192;';
                            }
                        } else if ( 'y' === axis ) {
                            if ( ( $helperOffset.top + tdcOperationUI.iframeContents.scrollTop() ) > $placeholderOffset.top ) {
                                //direction = 'up';
                                direction = '&#x2191;';
                            } else {
                                //direction = 'down';
                                direction = '&#x2193;';
                            }
                        }
                        $helper.html( tdcElementTypeData + ' ' + direction );
                    }
                }
            }, 100 );
        },


        /**
         * - Hide the placeholder
         * - Update the helper info
         * - Update the _isPlaceholderVisible flag
         */
        showPlaceholder: function() {
            var $placeholder = tdcAdminWrapperUI.$placeholder;

            if ( false === tdcOperationUI._isPlaceholderVisible ) {
                tdcOperationUI._isPlaceholderVisible = true;
                $placeholder.show();

                tdcOperationUI.updateInfoHelper();
            }
        },


        /**
         * - Show the placeholder
         * - Update the helper info
         * - Update the _isPlaceholderVisible flag
         */
        hidePlaceholder: function() {
            var $placeholder = tdcAdminWrapperUI.$placeholder;

            if ( true === tdcOperationUI._isPlaceholderVisible ) {
                tdcOperationUI._isPlaceholderVisible = false;
                $placeholder.hide();

                tdcOperationUI.updateInfoHelper( true );
            }
        },


        /**
         * Get the internally _isPlaceholderVisible flag
         *
         * @returns {boolean}
         */
        isPlaceholderVisible: function() {
            return tdcOperationUI._isPlaceholderVisible;
        },


        /**
         * Check the dragged element is a row
         *
         * @returns {boolean|*}
         */
        isRowDragged: function() {
            var draggedElement = tdcOperationUI.getDraggedElement();

            return !_.isUndefined( draggedElement ) && draggedElement.hasClass( 'tdc-row' );
        },


        /**
         * Check the dragged element is a column.
         * If the optional $siblingColumn parameter is used, it also checks to see if the sent column is sibling with the dragged element
         *
         * @param $siblingColumn - optional - jQuery column object under the mouse pointer
         * @returns {boolean|*}
         */
        isColumnDragged: function( $siblingColumn ) {

            var draggedElement = tdcOperationUI.getDraggedElement(),
                result = !_.isUndefined( draggedElement ) && draggedElement.hasClass( 'tdc-column' );

            if ( ! _.isUndefined( $siblingColumn ) ) {
                result = result && ( $siblingColumn.closest( '.tdc-columns').find( '.tdc-column.tdc-dragged' ).length > 0 );
            }
            return result;
        },


        /**
         * Check the current element is a inner row
         *
         * @returns {boolean|*}
         */
        isInnerRowDragged: function() {
            var draggedElement = tdcOperationUI.getDraggedElement();

            return !_.isUndefined( draggedElement ) && draggedElement.hasClass( 'tdc-element-inner-row' );
        },


        /**
         * Check the current dragged element is a 'tdc-inner-column' one.
         * If the '$siblingInnerColumn' parameter is specified, it also checks the dragged element and the $siblingInnerColumn are siblings
         *
         * @param $siblingInnerColumn - optional
         * @returns {boolean|*}
         */
        isInnerColumnDragged: function( $siblingInnerColumn ) {

            var draggedElement = tdcOperationUI.getDraggedElement(),
                result = !_.isUndefined( draggedElement ) && draggedElement.hasClass( 'tdc-inner-column' );

            if ( ! _.isUndefined( $siblingInnerColumn ) ) {
                result = result && ( $siblingInnerColumn.closest( '.tdc-inner-columns').find( '.tdc-inner-column.tdc-dragged' ).length > 0 );
            }
            return result;
        },


        /**
         * Check the current dragged element is a 'tdc-element' one
         *
         * @returns {boolean|*}
         */
        isElementDragged: function() {
            var draggedElement = tdcOperationUI.getDraggedElement();

            return !_.isUndefined( draggedElement ) && draggedElement.hasClass( 'tdc-element' );
        },


        /**
         * Helper function used by 'setHorizontalPlaceholder' and 'setVerticalPlaceholder' functions
         *
         * @param classes
         * @param props
         * @private
         */
        _setPlaceholder: function( classes, props ) {

            var $placeholder = tdcAdminWrapperUI.$placeholder;

            if ( _.isArray( classes ) ) {
                _.each( classes, function( element, index, list) {
                    $placeholder.addClass( element );
                });
            } else if ( _.isString( classes ) ) {
                $placeholder.addClass( classes );
            } else {
                $placeholder.attr( 'class', '' );
            }

            if ( _.isObject( props ) ) {
                $placeholder.css( props );
            }
        },


        /**
         * Set the placeholder as horizontal (its default css settings) for element, row and inner-row
         */
        setHorizontalPlaceholder: function() {
            tdcOperationUI._setPlaceholder( null, {
                'top': '',
                'left': '',
                'bottom': '',
                'margin-left': '',
                'position': ''
            });
        },


        /**
         * Set the placeholder as vertical for column and inner-column
         *
         * @param props
         */
        setVerticalPlaceholder: function( props ) {
            tdcOperationUI._setPlaceholder( ['vertical'], props);
        },


        /**
         * Move the dragged element to the placeholder position
         *
         * @private
         */
        _moveDraggedElement: function() {
            var $draggedElement = tdcOperationUI.getDraggedElement(),
                $currentElementOver = tdcOperationUI.getCurrentElementOver(),
                $placeholder = tdcAdminWrapperUI.$placeholder,

                $tdcInnerColumnParentOfDraggedElement,
                $tdcColumnParentOfDraggedElement;

            if ( ! _.isUndefined( $draggedElement ) && ! _.isUndefined( $currentElementOver ) && ! _.isUndefined( $placeholder ) ) {

                var $emptyElement,
                    $tdcElements = $draggedElement.closest( '.tdc-elements');

                // An empty element is added to the remaining '.tdc-elements' list, to allow drag&drop operations over it
                // At drop, any empty element is removed from the target list
                if ( 1 === $tdcElements.children().length ) {

                    // Add the 'tdc-element-column' or the 'tdc-element-inner-column' class to the empty element
                    var structureClass = '';

                    $tdcInnerColumnParentOfDraggedElement = $draggedElement.closest( '.tdc-inner-column' );
                    if ( $tdcInnerColumnParentOfDraggedElement.length ) {
                        structureClass = ' tdc-element-inner-column';
                    } else {
                        $tdcColumnParentOfDraggedElement = $draggedElement.closest( '.tdc-column' );
                        if ( $tdcColumnParentOfDraggedElement.length ) {
                            structureClass = ' tdc-element-column';
                        }
                    }
                    $emptyElement = jQuery( '<div class="' + tdcOperationUI._emptyElementClass + structureClass + '"></div>' );

                    tdcElementUI.defineOperationsForEmptyElement( $emptyElement );

                    $tdcElements.append( $emptyElement );
                }

                $placeholder.replaceWith( $draggedElement );



                // Update the 'tdc-element-inner-column' or the 'tdc-element-column' of the dragged element (AFTER IT HAS BEEN MOVED TO THE DROP POSITION)

                $tdcInnerColumnParentOfDraggedElement = $draggedElement.closest( '.tdc-inner-column' );
                if ( $tdcInnerColumnParentOfDraggedElement.length ) {
                    $draggedElement.removeClass( 'tdc-element-column' );
                    $draggedElement.addClass( 'tdc-element-inner-column' );
                } else {
                    $tdcColumnParentOfDraggedElement = $draggedElement.closest( '.tdc-column' );
                    if ( $tdcColumnParentOfDraggedElement.length ) {
                        $draggedElement.removeClass( 'tdc-element-inner-column' );
                        $draggedElement.addClass( 'tdc-element-column' );
                    }
                }



                // Remove the empty element if exists (after the dragged element has been dragged)

                var $prevDraggedElement = $draggedElement.prev();
                if ( $prevDraggedElement.hasClass( tdcOperationUI._emptyElementClass ) ) {
                    $prevDraggedElement.remove();
                    return;
                }

                var $nextDraggedElement = $draggedElement.next();
                if ( $nextDraggedElement.hasClass( tdcOperationUI._emptyElementClass ) ) {
                    $nextDraggedElement.remove();
                }



                if ( $draggedElement.hasClass( 'tdc-element' ) ) {
                    // Change the structured data
                    tdcIFrameData.changeData();
                }
            }
        }
    };

})(jQuery, Backbone, _);