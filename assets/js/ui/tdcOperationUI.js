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
/* global tdcSidebar:{} */

/* global tdcRecycleUI:{} */

/* global tdcDebug:{} */

var tdcOperationUI;

(function(jQuery, backbone, _, undefined) {

    'use strict';

    tdcOperationUI = {

        iframeContents: undefined,

        // The 'tdc-element', 'tdc-inner-column', 'tdc-element-inner-row', 'tdc-column' or 'tdc-row'  being dragged
        _draggedElement: {
            $element: undefined
        },

        // The 'tdc-element', 'tdc-inner-column', 'tdc-element-inner-row', 'tdc-column' or 'tdc-row' where the 'draggedElement' is over
        _currentElementOver: {
            $element: undefined
        },

        // Css class of empty element
        _emptyElementClass: 'tdc-element-empty',

        // Flag of placeholder visibility
        _isPlaceholderVisible: false,

        _intervalUpdateInfoHelper: undefined,



        init: function( iframeContents ) {

            // @todo Not ok window variables
            window.previousMouseClientX = 0;
            window.previousMouseClientY = 0;

            tdcOperationUI.iframeContents = iframeContents;


            tdcRowUI.init( tdcOperationUI.iframeContents );
            tdcColumnUI.init( tdcOperationUI.iframeContents );
            tdcInnerRowUI.init( tdcOperationUI.iframeContents );
            tdcInnerColumnUI.init( tdcOperationUI.iframeContents );
            tdcElementUI.init( tdcOperationUI.iframeContents );

            tdcRecycleUI.init();



            tdcAdminWrapperUI.$mask = jQuery('<div id="' + tdcAdminWrapperUI.maskId + '"></div>');
            tdcOperationUI.iframeContents.find( 'body' ).append( tdcAdminWrapperUI.$mask );
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

                tdcSidebar.setSettings({
                    '$currentRow': undefined,
                    '$currentColumn': undefined,
                    '$currentInnerRow': undefined,
                    '$currentInnerColumn': undefined,
                    '$currentElement' : undefined
                });

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
                } else if ( tdcOperationUI.isInnerRowDragged() || tdcOperationUI.isTempInnerRowDragged() ) {
                    tdcInnerRowUI.positionInnerRowPlaceholder( event );
                } else if ( tdcOperationUI.isColumnDragged() ) {
                    tdcColumnUI.positionColumnPlaceholder( event );
                } else if ( tdcOperationUI.isRowDragged() || tdcOperationUI.isTempRowDragged() ) {
                    tdcRowUI.positionRowPlaceholder( event);
                }
            });




            tdcAdminWrapperUI.$helper.mouseup(function( event ) {
                //tdcDebug.log( 'helper mouse up' );

                tdcOperationUI.hideHelper();
            });
        },




        setDraggedElement: function( $draggedElement ) {
            tdcOperationUI._draggedElement.$element = $draggedElement;

            if ( ! _.isUndefined( $draggedElement ) ) {

                tdcOperationUI._draggedElement.classes = $draggedElement[0].className.split( ' ' );
            }
        },

        getDraggedElement: function() {
            return tdcOperationUI._draggedElement.$element;
        },

        /**
         * Helper function used to work with tdcOperationUI._draggedElement
         * Important! It was added to avoid working with tdcOperationUI._draggedElement.$element, which can involve supplementary jquery callbacks
         *
         * @param cssClass
         * @returns {boolean}
         */
        hasClassDraggedElement: function( cssClass ) {
            if ( ! _.isUndefined( tdcOperationUI._draggedElement.$element ) ) {
                return -1 !== tdcOperationUI._draggedElement.classes.indexOf( cssClass );
            }
        },

        /**
         * Helper function used to work with tdcOperationUI._draggedElement
         * Important! It was added to avoid working with tdcOperationUI._draggedElement.$element, which can involve supplementary jquery callbacks
         *
         * @param cssClass
         */
        addClassDraggedElement: function( cssClass ) {
            if ( ! _.isUndefined( tdcOperationUI._draggedElement.$element ) ) {
                tdcOperationUI._draggedElement.$element.addClass( cssClass );
            }
        },




        setCurrentElementOver: function( $currentElementOver ) {

            // Do not set if the existing tdcOperationUI._currentElementOver.$element and the $currentElementOver are the same objects
            if ( _.isUndefined( $currentElementOver ) && _.isUndefined( tdcOperationUI._currentElementOver.$element ) ) {
                return;
            }

            // Do not set if the existing tdcOperationUI._currentElementOver.$element and the $currentElementOver are the same objects
            if ( ! _.isUndefined( $currentElementOver ) && ! _.isUndefined( tdcOperationUI._currentElementOver.$element ) && $currentElementOver.is( tdcOperationUI._currentElementOver.$element.get(0) ) ) {
                return;
            }

            tdcOperationUI._currentElementOver.$element = $currentElementOver;

            if ( ! _.isUndefined( $currentElementOver ) ) {
                tdcOperationUI._currentElementOver.elementOuterHeight = $currentElementOver.outerHeight( true);
                tdcOperationUI._currentElementOver.elementOuterWidth = $currentElementOver.outerWidth( true );
                tdcOperationUI._currentElementOver.elementOffset = $currentElementOver.offset();
            }
        },


        getCurrentElementOver: function() {
            return tdcOperationUI._currentElementOver.$element;
        },

        /**
         * Helper function
         *
         * @returns {*}
         */
        getCurrentElementOverOuterHeight: function() {
            if ( ! _.isUndefined( tdcOperationUI._currentElementOver.$element ) && ! _.isUndefined( tdcOperationUI._currentElementOver.elementOuterHeight ) ) {
            //if ( 'undefined' !== typeof tdcOperationUI._currentElementOver.$element && 'undefined' !== typeof tdcOperationUI._currentElementOver.elementOuterHeight ) {
                return tdcOperationUI._currentElementOver.elementOuterHeight;
            }
        },

        /**
         * Helper function
         *
         * @returns {*}
         */
        getCurrentElementOverOuterWidth: function() {
            if ( ! _.isUndefined( tdcOperationUI._currentElementOver.$element ) && ! _.isUndefined( tdcOperationUI._currentElementOver.elementOuterWidth ) ) {
            //if ( 'undefined' !== typeof tdcOperationUI._currentElementOver.$element && 'undefined' !== typeof tdcOperationUI._currentElementOver.elementOuterWidth ) {
                return tdcOperationUI._currentElementOver.elementOuterWidth;
            }
        },

        /**
         * Helper function
         *
         * @returns {*}
         */
        getCurrentElementOverOffset: function() {
            if ( ! _.isUndefined( tdcOperationUI._currentElementOver.$element ) && ! _.isUndefined( tdcOperationUI._currentElementOver.elementOffset ) ) {
            //if ( 'undefined' !== typeof tdcOperationUI._currentElementOver.$element && 'undefined' !== typeof tdcOperationUI._currentElementOver.elementOffset ) {
                return tdcOperationUI._currentElementOver.elementOffset;
            }
        },



        _placeholderCacheCssSettings: {
            classes: undefined,
            props: undefined
        },

        setPlaceholderCss: function( cssSettings ) {

            if ( _.isUndefined( tdcOperationUI._placeholderCacheCssSettings ) || ! _.isEqual( tdcOperationUI._placeholderCacheCssSettings, cssSettings ) ) {

                tdcOperationUI._placeholderCacheCssSettings = cssSettings;
                tdcAdminWrapperUI.$placeholder.css( cssSettings );
            }
        },




        activeDraggedElement: function( currentElement ) {
            tdcOperationUI.setDraggedElement( currentElement );

            if ( ! tdcOperationUI.hasClassDraggedElement( 'tdc-dragged' ) ) {
                tdcOperationUI.addClassDraggedElement( 'tdc-dragged' );
                //tdcDebug.log( 'ACTIVATE' );
                //tdcDebug.log( draggedElement );
            }
        },


        deactiveDraggedElement: function() {

            var draggedElement = tdcOperationUI.getDraggedElement();

            if ( ! _.isUndefined( draggedElement ) ) {

                draggedElement.removeClass( 'tdc-dragged' );

                tdcOperationUI._moveDraggedElement();


                // setSettings set the Sidebar panel
                // It's called once at mousedown to set the sidebar panel (at mousedown because we needed it before mousemove)
                // It's called later at mouseup to set the sidebar panel, actually to update the breadcrumbs of the sidebar panel
                // Being called twice, the bindPanelToModel method is called twice
                tdcSidebar.setSettings({
                    '$currentRow': tdcOperationUI.inRow( draggedElement ),
                    '$currentColumn': tdcOperationUI.inColumn( draggedElement ),
                    '$currentInnerRow': tdcOperationUI.inInnerRow( draggedElement ),
                    '$currentInnerColumn': tdcOperationUI.inInnerColumn( draggedElement ),
                    '$currentElement' : draggedElement
                });



                //tdcDebug.log( 'DEACTIVATE' );
                //tdcDebug.log( draggedElement );

                tdcOperationUI.setDraggedElement( undefined );
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

                // If sidebar is inline, consider it at $helper position
                var addLeft = 0;

                if ( true === tdcMain.getSidebarInline() &&
                    false === tdcMain.getSidebarHidden() &&
                    ! jQuery( mouseEvent.target ).closest( '#tdc-sidebar' ).length ) {
                    //! jQuery( '#tdc-sidebar').find( mouseEvent.target ).length ) {

                    addLeft = tdcSidebar.$_sidebar.width();
                }

                //if ( mouseEvent.target.ownerDocument === tdcLiveIframeWrapper.contentWindow.document && jQuery( tdcLiveIframeWrapper.parentElement).hasClass( 'tdc-responsive-tablet-landscape' ) ) {
                //    addLeft = parseInt( jQuery( tdcLiveIframeWrapper.parentElement).css( 'margin-left').replace( 'px', '') );
                //}

                //tdcDebug.log(mouseEvent.screenX + ' : ' + mouseEvent.screenY);
                //tdcDebug.log(mouseEvent.clientX + ' : ' + mouseEvent.clientY);

                $helper.css({
                    left: mouseEvent.clientX - 50 + addLeft,
                    top: mouseEvent.clientY - 50
                });
                $helper.show();

                //if ( $draggedElement.hasClass( 'tdc-row' ) ) {
                //    $helper.data( 'tdcElementType', 'ROW' );
                //} else if ( $draggedElement.hasClass( 'tdc-column' ) ) {
                //    $helper.data( 'tdcElementType', 'COLUMN' );
                //} else if ( $draggedElement.hasClass( 'tdc-element-inner-row' ) ) {
                //    $helper.data( 'tdcElementType', 'INNER ROW' );
                //} else if ( $draggedElement.hasClass( 'tdc-inner-column' ) ) {
                //    $helper.data( 'tdcElementType', 'INNER COLUMN' );
                //} else if ( $draggedElement.hasClass( 'tdc-element' ) ) {
                //    $helper.data( 'tdcElementType', 'ELEMENT' );
                //} else {
                //    $helper.data( 'tdcElementType', '' );
                //}

                tdcRecycleUI.show();

            } else {
                tdcOperationUI.hideHelper();

                tdcRecycleUI.hide();
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
        updateInfoHelper: function( resetInfo ) { return;

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

                tdcOperationUI.updateInfoHelper( undefined );
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

            // 'tdc-row-temp' is the row of the sidebar
            // This has been added to differentiate between the empty row template from the sidebar and an existing row template

            return !_.isUndefined( draggedElement ) && tdcOperationUI.hasClassDraggedElement( tdcRowUI.getElementCssClass() ) ;
        },


        /**
         * Check the $element param is child of a row. If it is, return the row
         *
         * @param $element
         * @returns {*}
         */
        inRow: function( $element ) {
            var $elementRow = $element.closest( '.' + tdcRowUI.getElementCssClass() );
            if ( $elementRow.length ) {
                return $elementRow;
            }
        },


        /**
         * Check the $element is row
         *
         * @param $element
         * @returns {*}
         */
        isRow: function( $element ) {
            return $element.hasClass( tdcRowUI.getElementCssClass() );
        },


        /**
         * Check the dragged element is a row
         *
         * @returns {boolean|*}
         */
        isTempRowDragged: function() {
            var draggedElement = tdcOperationUI.getDraggedElement();

            // 'tdc-row-temp' is the row of the sidebar
            // This has been added to differentiate between the empty row template from the sidebar and an existing row template

            return !_.isUndefined( draggedElement ) && tdcOperationUI.hasClassDraggedElement( 'tdc-row-temp' ) ;
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
                result = !_.isUndefined( draggedElement ) && tdcOperationUI.hasClassDraggedElement( tdcColumnUI.getElementCssClass() );

            if ( ! _.isUndefined( $siblingColumn ) ) {
                //result = result && ( $siblingColumn.closest( '.tdc-columns').find( '.tdc-column.tdc-dragged' ).length > 0 );
                result = result && ( ( $siblingColumn.siblings( '.tdc-column.tdc-dragged' ).length > 0 ) || $siblingColumn.hasClass( 'tdc-dragged' ) );
            }
            return result;
        },



        /**
         * Check the $element param is child of a column. If it is, return the column
         *
         * @param $element
         * @returns {*}
         */
        inColumn: function( $element ) {
            var $elementColumn = $element.closest( '.' + tdcColumnUI.getElementCssClass() );
            if ( $elementColumn.length ) {
                return $elementColumn;
            }
        },


        /**
         * Check the $element is column
         *
         * @param $element
         * @returns {*}
         */
        isColumn: function( $element ) {
            return $element.hasClass( tdcColumnUI.getElementCssClass() );
        },


        /**
         * Check the current element is a inner row
         *
         * @returns {boolean|*}
         */
        isInnerRowDragged: function() {
            var draggedElement = tdcOperationUI.getDraggedElement();

            // 'tdc-element-inner-row-temp' is the inner row of the sidebar
            // This has been added to differentiate between the empty inner row template from the sidebar and an existing inner row template

            return !_.isUndefined( draggedElement ) && tdcOperationUI.hasClassDraggedElement( tdcInnerRowUI.getElementCssClass() ) ;
        },



        /**
         * Check the $element param is child of an inner row. If it is, return the inner row
         *
         * @param $element
         * @returns {*}
         */
        inInnerRow: function( $element ) {
            var $elementInnerRow = $element.closest( '.' + tdcInnerRowUI.getElementCssClass() );
            if ( $elementInnerRow.length ) {
                return $elementInnerRow;
            }
        },


        /**
         * Check the $element is inner row
         *
         * @param $element
         * @returns {*}
         */
        isInnerRow: function( $element ) {
            return $element.hasClass( tdcInnerRowUI.getElementCssClass() );
        },




        /**
         * Check the current element is a inner row
         *
         * @returns {boolean|*}
         */
        isTempInnerRowDragged: function() {
            var draggedElement = tdcOperationUI.getDraggedElement();

            // 'tdc-element-inner-row-temp' is the inner row of the sidebar
            // This has been added to differentiate between the empty inner row template from the sidebar and an existing inner row template

            return !_.isUndefined( draggedElement ) && tdcOperationUI.hasClassDraggedElement( 'tdc-element-inner-row-temp' );
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
                result = !_.isUndefined( draggedElement ) && tdcOperationUI.hasClassDraggedElement( tdcInnerColumnUI.getElementCssClass() );

            if ( ! _.isUndefined( $siblingInnerColumn ) ) {
                //result = result && ( $siblingInnerColumn.closest( '.tdc-inner-columns').find( '.tdc-inner-column.tdc-dragged' ).length > 0 );
                result = result && ( ( $siblingInnerColumn.siblings( '.tdc-inner-column.tdc-dragged' ).length > 0 ) || $siblingInnerColumn.hasClass( 'tdc-dragged' ) );
            }
            return result;
        },


        /**
         * Check the $element param is child of an inner column. If it is, return the inner column
         *
         * @param $element
         * @returns {*}
         */
        inInnerColumn: function( $element ) {
            var $elementInnerColumn = $element.closest( '.' + tdcInnerColumnUI.getElementCssClass() );
            if ( $elementInnerColumn.length ) {
                return $elementInnerColumn;
            }
        },


        /**
         * Check the $element is inner column
         *
         * @param $element
         * @returns {*}
         */
        isInnerColumn: function( $element ) {
            return $element.hasClass( tdcInnerColumnUI.getElementCssClass() );
        },


        /**
         * Check the current dragged element is a 'tdc-element' one
         *
         * @returns {boolean|*}
         */
        isElementDragged: function() {
            var draggedElement = tdcOperationUI.getDraggedElement();

            return !_.isUndefined( draggedElement ) && tdcOperationUI.hasClassDraggedElement( 'tdc-element' );
        },


        /**
         * Check the current dragged element is a 'tdc-sidebar-element' one
         *
         * @returns {boolean|*}
         */
        isSidebarElementDragged: function() {
            var draggedElement = tdcOperationUI.getDraggedElement();

            return !_.isUndefined( draggedElement ) && tdcOperationUI.hasClassDraggedElement( 'tdc-sidebar-element' );
        },


        /**
         * Helper function used by 'setHorizontalPlaceholder' and 'setVerticalPlaceholder' functions
         *
         * @param classes - string
         * @param props - object
         */
        setPlaceholder: function( classes, props ) {

            var $placeholder = tdcAdminWrapperUI.$placeholder;

            // cache - classes
            if ( _.isUndefined( tdcOperationUI._placeholderCacheCssSettings.classes ) ||
                ( ! _.isUndefined( tdcOperationUI._placeholderCacheCssSettings.classes ) &&
                tdcOperationUI._placeholderCacheCssSettings.classes !== classes ) )  {

                tdcOperationUI._placeholderCacheCssSettings.classes = classes;

                if ( classes.length ) {
                    $placeholder.addClass( classes );
                } else {
                    $placeholder.attr( 'class', '' );
                }

                //if ( _.isArray( classes ) ) {
                //    _.each( classes, function( element, index, list) {
                //        $placeholder.addClass( element );
                //    });
                //} else
                //if ( _.isString( classes ) ) {
                //    $placeholder.addClass( classes );
                //} else {
                //    $placeholder.attr( 'class', '' );
                //}
            }

            // cache - props
            if ( _.isObject( props ) ) {

                if ( _.isUndefined( tdcOperationUI._placeholderCacheCssSettings.props ) ||
                    ( ! _.isUndefined( tdcOperationUI._placeholderCacheCssSettings.props ) &&
                    ! _.isEqual( tdcOperationUI._placeholderCacheCssSettings.props, props ) ) ) {

                    tdcOperationUI._placeholderCacheCssSettings.props = props;
                    $placeholder.css( props );
                }
            }
        },


        /**
         * Set the placeholder as horizontal (its default css settings) for element, row and inner-row
         */
        setHorizontalPlaceholder: function( props ) {
            tdcOperationUI.setPlaceholder( '', props );
        },


        /**
         * Set the placeholder as vertical for column and inner-column
         *
         * @param props
         */
        setVerticalPlaceholder: function( props ) {
            tdcOperationUI.setPlaceholder( 'vertical', props);
        },


        /**
         * Move the dragged element to the placeholder position
         * @todo IMPORTANT! This operation must be ATOMIC. For now this is accomplished just checking the $draggedElement, the $currentElementOver and the $placeholder. We'll see in tests if these are enough. Maybe a better solution would be a main flag, checked by all helper functions.
         *
         * @private
         */
        _moveDraggedElement: function() {
            var $draggedElement = tdcOperationUI.getDraggedElement(),
                $currentElementOver = tdcOperationUI.getCurrentElementOver(),
                $placeholder = tdcAdminWrapperUI.$placeholder,

                $tdcInnerColumnParentOfDraggedElement,
                $tdcColumnParentOfDraggedElement;


            if ( ! _.isUndefined( $draggedElement ) &&
                ! _.isUndefined( $currentElementOver ) &&
                ! _.isUndefined( $placeholder ) ) {

                // This check has been added because the placeholder position is computed at mousedown, and when the element is inside of an inner row and it's clicked at the top (@see tdcElementUI._innerColumnGap),
                // the placeholder is positioned outside of the inner row (actually its moved to the row parent), and the drag operation is allowed, even the mousemove event wasn't triggered.
                // At the same time, the recycle case must be considered, because it does not have a visible placeholder
                if ( ! $placeholder.is( ':visible' ) && $currentElementOver !== tdcAdminWrapperUI.$recycle ) {
                    return;
                }

                // IMPORTANT! The next steps are:
                //  Step 1. Check the dragged element to see if it's element, inner-column, inner-row, column or row
                //  Step 2. Check the dragged element and the placeholder are siblings. If they are, do not continue.
                //  Step 3. Add an empty element (to allow drop over it), if the dragged element is the last element or the last inner row in its container.
                //  Step 4. Replace the placeholder with the dragged element
                //  Step 5. If the dragged element was element or inner-row, set the css settings of the dragged element, according with the destination position
                //  Step 6. Remove the empty element from the destination position, if it exists
                //  Step 7. Change data structure
                //  Step 8. Missing! Here some checks must be done

                // Step 1 ----------

                var wasSidebarElementDragged = tdcOperationUI.isSidebarElementDragged(),
                    wasElementDragged = tdcOperationUI.isElementDragged(),
                    wasInnerColumnDragged = false,
                    wasInnerRowDragged = false,
                    wasTempInnerRowDragged = false,
                    wasColumnDragged = false,
                    wasRowDragged = false,
                    wasTempRowDragged = false,

                    // The container of the $draggedElement
                    $draggedElementContainer;

                if ( wasElementDragged ) {
                    $draggedElementContainer = $draggedElement.closest( '.tdc-elements' );

                } else {
                    wasInnerColumnDragged = tdcOperationUI.isInnerColumnDragged();

                    if ( wasInnerColumnDragged ) {
                        $draggedElementContainer = $draggedElement.closest( '.tdc-inner-columns' );
                    }
                }

                if ( ! wasInnerColumnDragged ) {
                    wasInnerRowDragged = tdcOperationUI.isInnerRowDragged();
                    wasTempInnerRowDragged = tdcOperationUI.isTempInnerRowDragged();

                    if ( wasInnerRowDragged || wasTempInnerRowDragged ) {
                        $draggedElementContainer = $draggedElement.closest( '.tdc-elements' );
                    }
                }

                if ( ! wasInnerRowDragged && ! wasTempInnerRowDragged ) {
                    wasColumnDragged = tdcOperationUI.isColumnDragged();

                    if ( wasColumnDragged ) {
                        $draggedElementContainer = $draggedElement.closest( '.tdc-columns' );
                    }
                }

                if ( ! wasColumnDragged ) {
                    wasRowDragged = tdcOperationUI.isRowDragged();
                    wasTempRowDragged = tdcOperationUI.isTempRowDragged();

                    if ( wasRowDragged || wasTempRowDragged ) {
                        $draggedElementContainer = $draggedElement.closest( '#tdc-rows' );
                    }
                }

                if ( ! wasSidebarElementDragged && ! wasElementDragged && ! wasInnerColumnDragged && ! wasInnerRowDragged && ! wasTempInnerRowDragged && ! wasColumnDragged && ! wasRowDragged && ! wasTempRowDragged ) {

                    new tdcNotice.notice( '_moveDraggedElement Error: $draggedElement not valid!', true, false );

                    //alert( '_moveDraggedElement Error: $draggedElement not valid!' );
                    return;
                }





                // Get the dragged element id
                var draggedBlockUid = '',
                    $tdBlockInner = $draggedElement.find( '.td_block_inner');

                if ( $tdBlockInner.length ) {
                    draggedBlockUid = $tdBlockInner.attr( 'id' );
                }








                // Step 2 ----------

                // If $draggedElement and $placeholder are siblings, and the $draggedElement is not recycled, do not continue
                // Also, do nothing in this step if a sidebar element is dragged

                if ( ! wasSidebarElementDragged && ! _.isUndefined( $draggedElementContainer ) && $draggedElementContainer.length ) {

                    var $draggedElementContainerChildren = $draggedElementContainer.children(),
                        indexDraggedElement = $draggedElementContainerChildren.index( $draggedElement ),
                        indexPlaceholder = $draggedElementContainerChildren.index( $placeholder );

                    //tdcDebug.log( indexDraggedElement );
                    //tdcDebug.log( indexPlaceholder );

                    if ( $currentElementOver !== tdcAdminWrapperUI.$recycle && -1 !== indexPlaceholder && 1 === Math.abs( indexDraggedElement - indexPlaceholder ) ) {

                        return;
                    }




                    // Step 3 ----------

                    // An empty element is added to the remaining '.tdc-elements' list, to allow drag&drop operations over it
                    // At drop, any empty element is removed from the target list

                    if ( wasElementDragged || wasInnerRowDragged || wasTempInnerRowDragged || wasRowDragged || wasTempRowDragged )  {

                        var $emptyElement;

                        if ( ( -1 === indexPlaceholder && 1 === $draggedElementContainerChildren.length ) || ( 2 === $draggedElementContainerChildren.length && -1 !== indexPlaceholder ) ) {


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

                            tdcElementUI.bindEmptyElement( $emptyElement );

                            $draggedElementContainer.append( $emptyElement );
                        }
                    }
                }






                // Remove the ('tdc-element' or the 'tdc-element-inner-row') element from the structure data
                // Just call the changeData and do not continue. The changeData function will do the job
                if ( ( wasElementDragged || wasInnerRowDragged || wasRowDragged ) && $currentElementOver === tdcAdminWrapperUI.$recycle ) {

                    tdcIFrameData.changeData({
                        wasSidebarElementDragged: wasSidebarElementDragged,
                        wasElementDragged: wasElementDragged,
                        wasInnerColumnDragged: wasInnerColumnDragged,
                        wasInnerRowDragged: wasInnerRowDragged,
                        wasTempInnerRowDragged: wasTempInnerRowDragged,
                        wasColumnDragged: wasColumnDragged,
                        wasRowDragged: wasRowDragged,
                        wasTempRowDragged: wasTempRowDragged,

                        draggedBlockUid: draggedBlockUid
                    });

                    tdcSidebarPanel.clearPanel();

                    return;
                }







                // Step 4 ----------
                // The placeholder is replaced by the dragged element

                // For sidebar dragged elements, there is need a copy of the $draggedElement, otherwise we can't use jquery replaceWith ($draggedElement is removed from sidebar)
                if ( wasSidebarElementDragged ) {

                    var cssClass = '';

                    if ( wasElementDragged ) {
                        cssClass = 'tdc-element';
                    } else if ( wasTempInnerRowDragged ) {
                        cssClass = 'tdc-element-inner-row-temp';
                    } else if ( wasInnerRowDragged ) {
                        cssClass = 'tdc-element-inner-row';
                    } else if ( wasTempRowDragged ) {
                        cssClass = 'tdc-row-temp';
                    } else if ( wasRowDragged ) {
                        cssClass = 'tdc-row';
                    }

                    // Copy a shallow clone of the $draggedElement
                    var $fakeDraggedElement = jQuery( '<div class="' + cssClass + '">' + $draggedElement.html() + '</div>' );
                    $fakeDraggedElement.data( 'shortcodeName', $draggedElement.data( 'shortcodeName' ) );

                    tdcOperationUI.setDraggedElement( $fakeDraggedElement );
                    $draggedElement = tdcOperationUI.getDraggedElement();
                }

                $placeholder.replaceWith( $draggedElement );






                // Step 5 ----------
                // Update the 'tdc-element-inner-column' or the 'tdc-element-column' of the dragged element (AFTER IT HAS BEEN MOVED TO THE DROP POSITION)
                // An element can be dragged from:
                //  1. column to column
                //  2. inner-column to inner-column
                //  3. column to inner-column
                //  4. inner-column to column

                if ( wasSidebarElementDragged || wasElementDragged ) {

                    // If the $draggedElement is in a inner-column, add the class 'tdc-element-inner-column', but remove the class 'tdc-element-column' (if it exists)
                    // Obs. We do not check from where it comes

                    $tdcInnerColumnParentOfDraggedElement = $draggedElement.closest('.tdc-inner-column');
                    if ($tdcInnerColumnParentOfDraggedElement.length) {
                        $draggedElement.removeClass( 'tdc-element-column' );
                        $draggedElement.addClass( 'tdc-element-inner-column' );

                    } else {

                        // If the $draggedElement is in a column, add the class 'tdc-element-column', but remove the class 'tdc-element-inner-column' (if it exists)
                        // Obs. We do not check from where it comes

                        $tdcColumnParentOfDraggedElement = $draggedElement.closest('.tdc-column');
                        if ($tdcColumnParentOfDraggedElement.length) {
                            $draggedElement.removeClass('tdc-element-inner-column');
                            $draggedElement.addClass('tdc-element-column');
                        }
                    }
                }





                // Step 6 ----------
                // Remove the empty element if exists (after the dragged element has been dragged)

                var $prevDraggedElement = $draggedElement.prev();
                if ( $prevDraggedElement.hasClass( tdcOperationUI._emptyElementClass ) ) {
                    $prevDraggedElement.remove();
                }

                var $nextDraggedElement = $draggedElement.next();
                if ( $nextDraggedElement.hasClass( tdcOperationUI._emptyElementClass ) ) {
                    $nextDraggedElement.remove();
                }



                // Step 7 ----------
                // Change the data structure
                // Here any UI changes has been done

                tdcIFrameData.changeData({
                    wasSidebarElementDragged: wasSidebarElementDragged,
                    wasElementDragged: wasElementDragged,
                    wasInnerColumnDragged: wasInnerColumnDragged,
                    wasInnerRowDragged: wasInnerRowDragged,
                    wasTempInnerRowDragged: wasTempInnerRowDragged,
                    wasColumnDragged: wasColumnDragged,
                    wasRowDragged: wasRowDragged,
                    wasTempRowDragged: wasTempRowDragged,

                    draggedBlockUid: draggedBlockUid
                });
            }
        }
    };

})(jQuery, Backbone, _);