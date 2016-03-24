/**
 * Created by ra on 3/22/2016.
 */

/* global jQuery:{} */
/* global Backbone:{} */
/* global _:{} */

/* global tdcDebug:{} */
/* global tdcAdminWrapperUI:{} */
/* global tdcOperationUI:{} */

var tdcAdminIFrameUI;

(function(jQuery, backbone, _, undefined) {

    'use strict';

    tdcAdminIFrameUI = {

        // Flag used by any function other than 'init'
        _initialized: false,

        init: function() {

            // Do nothing if it's already initialized
            if ( tdcAdminIFrameUI._initialized ) {
                return;
            }

            tdcAdminIFrameUI._tdcPostSettings = window.tdcPostSettings;


            if ( undefined === tdcAdminIFrameUI._tdcPostSettings || ! tdcAdminWrapperUI._tdcJqObjWrapper.length ) {

                // Here there will be a debug console window call
                alert('something wrong');

                return;
            }

            var tdcLiveIframe = jQuery( '<iframe id="tdc-live-iframe" src="' + tdcAdminIFrameUI._tdcPostSettings.postUrl + '?td_action=tdc_edit&post_id=' + tdcAdminIFrameUI._tdcPostSettings.postId + '" ' +
                'scrolling="auto" style="width: 100%; height: 100%"></iframe>' )
                .css({
                    height: jQuery(window).innerHeight()
                })
                .load(function(){

                    var $this = jQuery(this);

                    var iframeContents = jQuery(this).contents();


                    /**
                     * Add wrappers around all shortcode dom elements
                     */
                    var addWrappers = function() {
                        iframeContents.find( '.tdc-row' )
                            .wrapAll( '<div id="tdc-rows"></div>' )
                            .each(function( index, el ) {
                                jQuery( el ).find( '.tdc-column' ).wrapAll( '<div class="tdc-columns"></div>' );
                            });



                        // all tdc-inner-rows
                        // all tdc-elements
                        iframeContents.find( '.tdc-column' ).each(function( index, el ) {
                            //jQuery( el ).find( '.tdc-inner-row').wrapAll( '<div class="tdc-inner-rows"></div>');
                            //jQuery( el ).find( '.tdc-inner-rows').wrapAll( '<div class="tdc-element-inner-row"></div>');

                            jQuery( el ).find( '.tdc-inner-row').wrap( '<div class="tdc-element-inner-row"></div>');

                            jQuery( el ).find( '.td_block_wrap').wrap( '<div class="tdc-element"></div>' );
                        });



                        // all tdc-inner-columns
                        iframeContents.find( '.tdc-inner-row' ).each(function( index, el ) {
                            jQuery( el).find( '.tdc-inner-column').wrapAll( '<div class="tdc-inner-columns"></div>' );
                        });



                        // all tdc-element of the tdc-inner-column, moved to the tdc-elements
                        iframeContents.find( '.tdc-inner-column').each(function( index, el ) {
                            var tdcElement = jQuery( el ).find( '.tdc-element');

                            if ( tdcElement.length ) {
                                tdcElement.addClass( 'tdc-element-inner-column' ).wrapAll( '<div class="tdc-elements"></div>' );
                            } else {

                                // add sortable area if empty inner column
                                var innerMostElement = jQuery( el).find( '.wpb_wrapper' );

                                if ( innerMostElement.length ) {
                                    innerMostElement.append( '<div class="tdc-elements"></div>' );
                                }
                            }
                        });



                        // all tdc-elements not already moved to tdc-elements, moved to their new tdc-elements (columns can have their elements, which are not inside of an inner row > inner column)
                        iframeContents.find( '.tdc-column' ).each(function( index, el ) {

                            var tdcElement = jQuery( el).find( '.tdc-element, .tdc-element-inner-row');

                            if ( tdcElement.length ) {
                                tdcElement
                                    .not( '.tdc-element-inner-column' )
                                    .addClass( 'tdc-element-column' )
                                    .wrapAll( '<div class="tdc-elements"></div>' );

                                //tdcElement.attr( 'data-td_shorcode', 11);

                                var td_block_wrap = tdcElement.find( '.td_block_wrap' );
                                if ( td_block_wrap.length ) {

                                }

                            } else {

                                // add sortable area if empty columns
                                var innerMostElement = jQuery( el ).find( '.wpb_wrapper' );

                                if ( innerMostElement.length ) {
                                    innerMostElement.append( '<div class="tdc-elements"></div>' );
                                }
                            }
                        });
                    };

                    addWrappers();








                    ///**
                    // * Create views.
                    // * Bind views to DOM elements.
                    // * Bind models to views.
                    // * @param error
                    // */
                    //var bindViewsModelsWrappers = function( errors, collection, jqDOMElement, level ) {
                    //
                    //    if ( ! _.isEmpty( errors ) ) {
                    //        return;
                    //    }
                    //
                    //    if ( _.isUndefined( level ) ) {
                    //        level = 0;
                    //    }
                    //
                    //    if ( _.isUndefined( collection ) ) {
                    //
                    //        collection = tdcRows;
                    //
                    //        // Bind rows
                    //        var tdc_row = contents.find( '.tdc-row' );
                    //
                    //
                    //        // Stop if models number doesn't match the DOM elements number
                    //        if ( collection.models.length !== tdc_row.length ) {
                    //
                    //            errors[ _.keys(errors).length ] = {
                    //                collection: collection,
                    //                jqDOMElements: tdc_row,
                    //                info: 'Error at rows'
                    //            };
                    //            return;
                    //        }
                    //
                    //
                    //        // Increment the level, for the next bindViewsModelsWrappers call
                    //        level++;
                    //
                    //        _.each( tdc_row, function( element, index, list ) {
                    //
                    //            // Get the model
                    //            var model = collection.models[ index ],
                    //                $element = jQuery( element );
                    //
                    //            // Attach data 'model_id' to the DOM element
                    //            $element.data( 'model_id' , model.cid );
                    //
                    //            // Set the html attribute for the model (its changed is captured by view)
                    //            model.set( 'html', element.innerHTML );
                    //
                    //            // Create the view
                    //            new TdcLiveView({
                    //                model: model,
                    //                el: element
                    //            });
                    //
                    //            // Go deeper to the children
                    //            if ( model.has( 'childCollection' ) ) {
                    //
                    //                bindViewsModelsWrappers( errors, model.get( 'childCollection'), $element, level );
                    //            }
                    //        });
                    //
                    //        level--;
                    //
                    //    } else {
                    //
                    //        var jqDOMElements;
                    //
                    //        switch ( level ) {
                    //
                    //            case 1:
                    //
                    //                jqDOMElements = jqDOMElement.find( '.tdc-columns:first' ).children( '.tdc-column' );
                    //
                    //                // Stop if models number doesn't match the DOM elements number
                    //                if ( collection.models.length !== jqDOMElements.length ) {
                    //
                    //                    errors[ _.keys(errors).length ] = {
                    //                        collection: collection,
                    //                        jqDOMElements: jqDOMElements,
                    //                        info: 'Errors at columns',
                    //                        level: level
                    //                    };
                    //                    return;
                    //                }
                    //
                    //                break;
                    //
                    //            case 2:
                    //
                    //                jqDOMElements = jqDOMElement.find( '.tdc-elements:first' ).children( '.tdc-element, .tdc-element-inner-row' );
                    //
                    //                // Stop if models number doesn't match the DOM elements number
                    //                if ( collection.models.length !== jqDOMElements.length ) {
                    //
                    //                    errors[ _.keys(errors).length ] = {
                    //                        collection: collection,
                    //                        jqDOMElements: jqDOMElements,
                    //                        info: 'Errors at columns elements',
                    //                        level: level
                    //                    };
                    //                    return;
                    //                }
                    //
                    //                break;
                    //
                    //            case 3:
                    //
                    //                jqDOMElements = jqDOMElement.find( '.tdc-inner-columns:first' ).children( '.tdc-inner-column' );
                    //
                    //                // Stop if models number doesn't match the DOM elements number
                    //                if ( collection.models.length !== jqDOMElements.length ) {
                    //
                    //                    errors[ _.keys(errors).length ] = {
                    //                        collection: collection,
                    //                        jqDOMElements: jqDOMElements,
                    //                        info: 'Errors at inner columns',
                    //                        level: level
                    //                    };
                    //                    return;
                    //                }
                    //
                    //                break;
                    //
                    //            case 4:
                    //
                    //                jqDOMElements = jqDOMElement.find( '.tdc-elements:first' ).children( '.tdc-element' );
                    //
                    //                // Stop if models number doesn't match the DOM elements number
                    //                if ( collection.models.length !== jqDOMElements.length ) {
                    //
                    //                    errors[ _.keys(errors).length ] = {
                    //                        collection: collection,
                    //                        jqDOMElements: jqDOMElements,
                    //                        info: 'Errors at elements',
                    //                        level: level
                    //                    };
                    //                    return;
                    //                }
                    //
                    //                break;
                    //        }
                    //
                    //
                    //
                    //        // Increment the level, for the next bindViewsModelsWrappers call
                    //        level++;
                    //
                    //        _.each( jqDOMElements, function( element, index, list ) {
                    //
                    //            // Get the model
                    //            var model = collection.models[ index ],
                    //                $element = jQuery( element );
                    //
                    //            // Attach data 'model_id' to the DOM element
                    //            $element.data( 'model_id' , model.cid );
                    //
                    //            // Set the html attribute for the model (its changed is captured by view)
                    //            model.set( 'html', element.innerHTML );
                    //
                    //            // Create the view
                    //            new TdcLiveView({
                    //                model: model,
                    //                el: element
                    //            });
                    //
                    //            // Go deeper to the children, if the jq dom element is not tdc-element and the model has collection
                    //            if ( ! $element.hasClass( 'tdc-element') && model.has( 'childCollection' ) ) {
                    //
                    //                bindViewsModelsWrappers( errors, model.get( 'childCollection'), $element, level );
                    //            }
                    //        });
                    //
                    //        // Decrement the level, for the next bindViewsModelsWrappers call
                    //        level--;
                    //    }
                    //
                    //};
                    //
                    //var errors = {};
                    //
                    //bindViewsModelsWrappers( errors );
                    //
                    //if ( ! _.isEmpty( errors ) ) {
                    //    for ( var prop in errors ) {
                    //        tdcDebug.log( errors[ prop ] );
                    //    }
                    //}
                    //
                    //
                    //tdcDebug.log( tdcRows.models );














                    function setOperationUI() {

                        var

                        // The 'tdc-element' elements (tagdiv blocks)
                            tdcElement = iframeContents.find( '.tdc-element'),

                        // The 'tdc-elements' elements
                            tdcElements = iframeContents.find( '.tdc-elements'),

                        // The 'tdc-row' elements
                            tdcRow = iframeContents.find( '.tdc-row' ),

                        // The 'tdc-column' elements
                            tdcColumn = iframeContents.find( '.tdc-column' ),

                        // The 'tdc-element-inner-row' elements
                            tdcElementInnerRow = iframeContents.find( '.tdc-element-inner-row' ),

                        // The 'tdc-inner-column' elements
                            tdcInnerColumn = iframeContents.find( '.tdc-inner-column' ),

                        // The 'tdc-element', 'tdc-inner-column', 'tdc-element-inner-row', 'tdc-column' or 'tdc-row'  being dragged
                            draggedElement,

                        // The 'tdc-element', 'tdc-inner-column', 'tdc-element-inner-row', 'tdc-column' or 'tdc-row' where the 'draggedElement' is over
                            currentElementOver;


                        function activeDraggedElement( currentElement ) {
                            draggedElement = currentElement;

                            if ( ! draggedElement.hasClass( 'tdc-dragged' ) ) {
                                draggedElement.css({
                                    opacity: 0.5
                                });
                                draggedElement.addClass( 'tdc-dragged' );
                                //tdcDebug.log( 'ACTIVATE' );
                                //tdcDebug.log( draggedElement );
                            }
                        }

                        function deactiveDraggedElement() {
                            if ( ! _.isUndefined( draggedElement ) ) {
                                draggedElement.css({
                                    opacity: ''
                                });
                                draggedElement.removeClass( 'tdc-dragged' );

                                //tdcDebug.log( 'DEACTIVATE' );
                                //tdcDebug.log( draggedElement );

                                draggedElement = undefined;
                            } else {
                                //tdcDebug.log( 'dragged UNDEFINED' );
                            }
                        }

                        function showHelper( mouseEvent ) {
                            var $helper = tdcAdminWrapperUI._tdcJqObjHelper;
                            if ( ! _.isUndefined( draggedElement ) ) {
                                $helper.css({
                                    left: mouseEvent.clientX - 50,
                                    top: mouseEvent.clientY - 50
                                });
                                $helper.show();

                                if ( draggedElement.hasClass( 'tdc-row' ) ) {
                                    $helper.html( 'ROW' );
                                } else if ( draggedElement.hasClass( 'tdc-column' ) ) {
                                    $helper.html( 'COLUMN' );
                                } else if ( draggedElement.hasClass( 'tdc-element-inner-row' ) ) {
                                    $helper.html( 'INNER ROW' );
                                } else if ( draggedElement.hasClass( 'tdc-inner-column' ) ) {
                                    $helper.html( 'INNER COLUMN' );
                                } else if ( draggedElement.hasClass( 'tdc-element' ) ) {
                                    $helper.html( 'ELEMENT' );
                                } else {
                                    $helper.html( '' );
                                }
                            } else {
                                hideHelper();
                            }
                        }

                        function hideHelper() {
                            tdcAdminWrapperUI._tdcJqObjHelper.hide();
                        }





                        function isRowDragged() {
                            return !_.isUndefined( draggedElement ) && draggedElement.hasClass( 'tdc-row' );
                        }


                        /**
                         * Check the dragged element is a column.
                         * If the optional $siblingColumn parameter is used, it also checks to see if the sent column is sibling with the dragged element
                         *
                         * @param $siblingColumn - optional - jQuery column object under the mouse pointer
                         * @returns {boolean|*}
                         */
                        function isColumnDragged( $siblingColumn ) {

                            var result = !_.isUndefined( draggedElement ) && draggedElement.hasClass( 'tdc-column' );

                            if ( ! _.isUndefined( $siblingColumn ) ) {
                                result = result && ( $siblingColumn.closest( '.tdc-columns').find( '.tdc-column.tdc-dragged' ).length > 0 );
                            }
                            return result;
                        }


                        function isInnerRowDragged() {
                            return !_.isUndefined( draggedElement ) && draggedElement.hasClass( 'tdc-element-inner-row' );
                        }


                        function isInnerColumnDragged( $siblingInnerColumn ) {
                            var result = !_.isUndefined( draggedElement ) && draggedElement.hasClass( 'tdc-inner-column' );

                            if ( ! _.isUndefined( $siblingInnerColumn ) ) {
                                result = result && ( $siblingInnerColumn.closest( '.tdc-inner-columns').find( '.tdc-inner-column.tdc-dragged' ).length > 0 );
                            }
                            return result;
                        }


                        function isElementDragged() {
                            return !_.isUndefined( draggedElement ) && draggedElement.hasClass( 'tdc-element' );
                        }





                        function _setPlaceholder( classes, props ) {

                            var $placeholder = tdcAdminWrapperUI._tdcJqObjPlaceholder;

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
                        }

                        function setHorizontalPlaceholder() {
                            _setPlaceholder( null, {
                                'top': '',
                                'left': '',
                                'bottom': '',
                                'margin-left': '',
                                'position': ''
                            });
                        }

                        function setVerticalPlaceholder( props ) {
                            _setPlaceholder( ['vertical'], props);
                        }




                        window.previousMouseClientX = 0;
                        window.previousMouseClientY = 0;




                        function positionElementPlaceholder( event ) {

                            //tdcDebug.log( event );

                            var $placeholder = tdcAdminWrapperUI._tdcJqObjPlaceholder;

                            // Adapt the placeholder to look great when it's not on columns and inner-columns
                            setHorizontalPlaceholder();


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

                                mousePointerValue.X = iframeContents.scrollLeft() + window.previousMouseClientX;
                                mousePointerValue.Y = iframeContents.scrollTop() + window.previousMouseClientY;

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
                                tdcElement.each(function( index, element ) {

                                    if ( ! _.isUndefined( currentElementOver ) ) {
                                        // If it's not undefined, ( marked by 'fakemouseenterevent' event of the 'tdc-element' ) DO NOTHING (DO NOT TRIGGER ANY MORE 'fakemouseenterevent' EVENT)
                                        return;
                                    }
                                    jQuery( element ).trigger( jQuery.Event( 'fakemouseenterevent', eventProp ) );
                                });

                                tdcElementInnerRow.each(function( index, element ) {

                                    if ( ! _.isUndefined( currentElementOver ) ) {
                                        // If it's not undefined, ( marked by 'fakemouseenterevent' event of the 'tdc-element-inner-row' ) DO NOTHING (DO NOT TRIGGER ANY MORE 'fakemouseenterevent' EVENT)
                                        return;
                                    }
                                    jQuery( element ).trigger( jQuery.Event( 'fakemouseenterevent', eventProp ) );
                                });
                                return;
                            }

                            // Hide the placeholder and stop
                            if ( _.isUndefined( draggedElement ) ||
                                _.isUndefined( currentElementOver ) ) {

                                // Hide the placeholder when we are over the dragged element
                                //( ! _.isUndefined( currentElementOver ) && currentElementOver.hasClass( 'tdc-dragged' ) ) ) {

                                $placeholder.hide();
                                return;
                            }



                            // If a 'tdc-element' is dragged and the 'currentElementOver' is not undefined, show and position the placeholder

                            var elementOuterHeight = currentElementOver.outerHeight( true );
                            var elementOuterWidth = currentElementOver.innerWidth();
                            var elementOffset = currentElementOver.offset();

                            //tdcDebug.log( mousePointerValue.Y + ' : ' +  ( elementOffset.top + ( elementOuterHeight / 2 ) ) );

                            if ( mousePointerValue.Y > elementOffset.top + ( elementOuterHeight / 2 ) ) {

                                var $nextElement = currentElementOver.next();

                                if ( ! $nextElement.length || ( $nextElement.length && $nextElement.attr( 'id' ) !== tdcAdminWrapperUI._tdcJqObjPlaceholderId ) ) {
                                    currentElementOver.after($placeholder);
                                }

                                // Position the placeholder at the bottom of the screen
                                if (parseInt(elementOffset.top) + parseInt(elementOuterHeight) > parseInt(iframeContents.scrollTop()) + parseInt(window.innerHeight)) {
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
                                if (parseInt(elementOffset.top) < parseInt(iframeContents.scrollTop())) {
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





                        function positionRowPlaceholder( event ) {
                            //tdcDebug.log( event );

                            var $placeholder = tdcAdminWrapperUI._tdcJqObjPlaceholder;

                            // Adapt the placeholder to look great when it's not on columns and inner-columns
                            setHorizontalPlaceholder();

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

                                mousePointerValue.X = iframeContents.scrollLeft() + window.previousMouseClientX;
                                mousePointerValue.Y = iframeContents.scrollTop() + window.previousMouseClientY;

                                var eventProp = {
                                    'pageX' : mousePointerValue.X,
                                    'pageY' : mousePointerValue.Y
                                };

                                //tdcDebug.log( eventProp );


                                // Try to find where the mouse is.
                                // Trigger a custom event for all 'tdc-row' elements, but stop if one is found

                                // Set the 'currentElementOver' to undefined, to be find in the iteration
                                currentElementOver = undefined;

                                // Trigger an 'fakemouseenterevent' event, for all 'tdc-row' elements, or until the variable 'currentElementOver' is set to one of them
                                tdcRow.each(function( index, element ) {

                                    if ( ! _.isUndefined( currentElementOver ) ) {
                                        // If it's not undefined, ( marked by 'fakemouseenterevent' event of the 'tdc-row' ) DO NOTHING (DO NOT TRIGGER ANY MORE 'fakemouseenterevent' EVENT)
                                        return;
                                    }
                                    jQuery( element ).trigger( jQuery.Event( 'fakemouseenterevent', eventProp ) );
                                });
                                return;
                            }



                            // Hide the placeholder and stop
                            if ( _.isUndefined( draggedElement ) ||
                                _.isUndefined( currentElementOver ) ) {

                                // Hide the placeholder when we are over the dragged element
                                //( ! _.isUndefined( currentElementOver ) && currentElementOver.hasClass( 'tdc-dragged' ) ) ) {

                                $placeholder.hide();
                                return;
                            }



                            // If a 'tdc-row' is dragged and the 'currentElementOver' is not undefined, show and position the placeholder

                            var elementOuterHeight = currentElementOver.outerHeight( true );
                            var elementOuterWidth = currentElementOver.innerWidth();
                            var elementOffset = currentElementOver.offset();

                            //tdcDebug.log( mousePointerValue.Y + ' : ' +  ( elementOffset.top + ( elementOuterHeight / 2 ) ) );

                            if ( mousePointerValue.Y > elementOffset.top + ( elementOuterHeight / 2 ) ) {

                                var $nextElement = currentElementOver.next();

                                if ( ! $nextElement.length || ( $nextElement.length && $nextElement.attr( 'id' ) !== tdcAdminWrapperUI._tdcJqObjPlaceholderId ) ) {
                                    currentElementOver.after($placeholder);
                                }

                                // Position the placeholder at the bottom of the screen
                                if (parseInt(elementOffset.top) + parseInt(elementOuterHeight) > parseInt(iframeContents.scrollTop()) + parseInt(window.innerHeight)) {
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
                                if (parseInt(elementOffset.top) < parseInt(iframeContents.scrollTop())) {
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






                        function positionColumnPlaceholder( event ) {
                            //tdcDebug.log( event );

                            var $placeholder = tdcAdminWrapperUI._tdcJqObjPlaceholder;


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

                                mousePointerValue.X = iframeContents.scrollLeft() + window.previousMouseClientX;
                                mousePointerValue.Y = iframeContents.scrollTop() + window.previousMouseClientY;

                                var eventProp = {
                                    'pageX' : mousePointerValue.X,
                                    'pageY' : mousePointerValue.Y
                                };

                                //tdcDebug.log( eventProp );


                                // Try to find where the mouse is.
                                // Trigger a custom event for all 'tdc-column' elements, but stop if one is found

                                // Set the 'currentElementOver' to undefined, to be find in the iteration
                                currentElementOver = undefined;

                                // Trigger an 'fakemouseenterevent' event, for siblings 'tdc-column' elements, or until the variable 'currentElementOver' is set to one of them
                                draggedElement.closest( '.tdc-columns').find( '.tdc-column' ).each(function( index, element ) {

                                    if ( ! _.isUndefined( currentElementOver ) ) {
                                        // If it's not undefined, ( marked by 'fakemouseenterevent' event of the 'tdc-column' ) DO NOTHING (DO NOT TRIGGER ANY MORE 'fakemouseenterevent' EVENT)
                                        return;
                                    }
                                    jQuery( element ).trigger( jQuery.Event( 'fakemouseenterevent', eventProp ) );
                                });
                                return;
                            }



                            // Hide the placeholder and stop
                            if ( _.isUndefined( draggedElement ) ||
                                _.isUndefined( currentElementOver ) ) {

                                // Hide the placeholder when we are over the dragged element
                                //( ! _.isUndefined( currentElementOver ) && currentElementOver.hasClass( 'tdc-dragged' ) ) ) {

                                $placeholder.hide();
                                return;
                            }



                            // If a 'tdcRow' is dragged and the 'currentElementOver' is not undefined, show and position the placeholder

                            var elementOuterWidth = currentElementOver.find( '.tdc-elements:first').outerWidth( true );
                            var elementOffset = currentElementOver.offset();


                            // Being floated, all prev columns width must be considered when working with the offset().left
                            var extraLeft = 0;
                            var prevColumns = currentElementOver.prevAll();

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

                                if ( ! $nextElement.length || ( $nextElement.length && $nextElement.attr( 'id' ) !== tdcAdminWrapperUI._tdcJqObjPlaceholderId ) ) {
                                    currentElementOver.after($placeholder);
                                }
                                //tdcDebug.log( '>>>>>>>>>>>>>>>>>>>>>>>>>>' );

                                setVerticalPlaceholder({
                                    left: parseInt(extraLeft + elementOuterWidth),
                                    'margin-left': cssMarginLeftValue
                                });

                            } else {

                                var $prevElement = currentElementOver.prev();

                                if ( ! $prevElement.length || ( $prevElement.length && $prevElement.attr( 'id' ) !== tdcAdminWrapperUI._tdcJqObjPlaceholderId ) ) {
                                    currentElementOver.before($placeholder);
                                }

                                //tdcDebug.log( '<<<<<<<<<<<<<<<<<<<<<<<<<<<<<' );

                                setVerticalPlaceholder({
                                    left: parseInt(extraLeft),
                                    'margin-left': cssMarginLeftValue
                                });
                            }

                            // 'show' must be after setting placeholder (horizontal or vertical), to be shown at the first 'mousedown' event
                            $placeholder.show();

                            // Hide the placeholder if it's near the dragged element
                            //if ( $placeholder.next().length && $placeholder.next().hasClass( 'tdc-dragged' ) ||
                            //    $placeholder.prev().length && $placeholder.prev().hasClass( 'tdc-dragged' ) ) {
                            //    $placeholder.hide();
                            //}
                        }






                        function positionInnerRowPlaceholder( event ) {
                            //tdcDebug.log( event );

                            var $placeholder = tdcAdminWrapperUI._tdcJqObjPlaceholder;

                            // Adapt the placeholder to look great when it's not on columns and inner-columns
                            setHorizontalPlaceholder();


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

                                mousePointerValue.X = iframeContents.scrollLeft() + window.previousMouseClientX;
                                mousePointerValue.Y = iframeContents.scrollTop() + window.previousMouseClientY;

                                var eventProp = {
                                    'pageX' : mousePointerValue.X,
                                    'pageY' : mousePointerValue.Y
                                };

                                //tdcDebug.log( eventProp );


                                // Try to find where the mouse is.
                                // Trigger a custom event for all 'tdc-element' elements, but stop if one is found

                                // Set the 'currentElementOver' to undefined, to be find in the iteration
                                currentElementOver = undefined;

                                // Trigger an 'fakemouseenterevent' event, for all 'tdc-element' elements, or until the variable 'currentElementOver' is set to one of them
                                tdcElement.each(function( index, element ) {

                                    if ( ! _.isUndefined( currentElementOver ) ) {
                                        // If it's not undefined, ( marked by 'fakemouseenterevent' event of the 'tdc-element' ) DO NOTHING (DO NOT TRIGGER ANY MORE 'fakemouseenterevent' EVENT)
                                        return;
                                    }
                                    jQuery( element ).trigger( jQuery.Event( 'fakemouseenterevent', eventProp ) );
                                });

                                tdcElementInnerRow.each(function( index, element ) {

                                    if ( ! _.isUndefined( currentElementOver ) ) {
                                        // If it's not undefined, ( marked by 'fakemouseenterevent' event of the 'tdc-element-inner-row' ) DO NOTHING (DO NOT TRIGGER ANY MORE 'fakemouseenterevent' EVENT)
                                        return;
                                    }
                                    jQuery( element ).trigger( jQuery.Event( 'fakemouseenterevent', eventProp ) );
                                });

                                return;
                            }



                            // Hide the placeholder and stop
                            if ( _.isUndefined( draggedElement ) ||
                                _.isUndefined( currentElementOver ) ) {

                                // Hide the placeholder when we are over the dragged element
                                //( ! _.isUndefined( currentElementOver ) && currentElementOver.hasClass( 'tdc-dragged' ) ) ) {

                                $placeholder.hide();
                                return;
                            }



                            // If a 'tdc-row' is dragged and the 'currentElementOver' is not undefined, show and position the placeholder

                            var elementOuterHeight = currentElementOver.outerHeight( true );
                            var elementOuterWidth = currentElementOver.innerWidth();
                            var elementOffset = currentElementOver.offset();

                            //tdcDebug.log( mousePointerValue.Y + ' : ' +  ( elementOffset.top + ( elementOuterHeight / 2 ) ) );

                            if ( mousePointerValue.Y > elementOffset.top + ( elementOuterHeight / 2 ) ) {

                                var $nextElement = currentElementOver.next();

                                if ( ! $nextElement.length || ( $nextElement.length && $nextElement.attr( 'id' ) !== tdcAdminWrapperUI._tdcJqObjPlaceholderId ) ) {
                                    currentElementOver.after($placeholder);
                                }

                                // Position the placeholder at the bottom of the screen
                                if (parseInt(elementOffset.top) + parseInt(elementOuterHeight) > parseInt(iframeContents.scrollTop()) + parseInt(window.innerHeight)) {
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
                                if (parseInt(elementOffset.top) < parseInt(iframeContents.scrollTop())) {
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




                        function positionInnerColumnPlaceholder( event ) {
                            //tdcDebug.log( event );

                            var $placeholder = tdcAdminWrapperUI._tdcJqObjPlaceholder;

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

                                mousePointerValue.X = iframeContents.scrollLeft() + window.previousMouseClientX;
                                mousePointerValue.Y = iframeContents.scrollTop() + window.previousMouseClientY;

                                var eventProp = {
                                    'pageX' : mousePointerValue.X,
                                    'pageY' : mousePointerValue.Y
                                };

                                //tdcDebug.log( eventProp );


                                // Try to find where the mouse is.
                                // Trigger a custom event for all 'tdc-column' elements, but stop if one is found

                                // Set the 'currentElementOver' to undefined, to be find in the iteration
                                currentElementOver = undefined;

                                // Trigger an 'fakemouseenterevent' event, for siblings 'tdc-inner-column' elements, or until the variable 'currentElementOver' is set to one of them
                                draggedElement.closest( '.tdc-inner-columns').find( '.tdc-inner-column' ).each(function( index, element ) {

                                    if ( ! _.isUndefined( currentElementOver ) ) {
                                        // If it's not undefined, ( marked by 'fakemouseenterevent' event of the 'tdc-column' ) DO NOTHING (DO NOT TRIGGER ANY MORE 'fakemouseenterevent' EVENT)
                                        return;
                                    }
                                    jQuery( element ).trigger( jQuery.Event( 'fakemouseenterevent', eventProp ) );
                                });
                                return;
                            }



                            // Hide the placeholder and stop
                            if ( _.isUndefined( draggedElement ) ||
                                _.isUndefined( currentElementOver ) ) {

                                // Hide the placeholder when we are over the dragged element
                                //( ! _.isUndefined( currentElementOver ) && currentElementOver.hasClass( 'tdc-dragged' ) ) ) {

                                $placeholder.hide();
                                return;
                            }



                            // If a 'tdcRow' is dragged and the 'currentElementOver' is not undefined, show and position the placeholder

                            var elementOuterWidth = currentElementOver.find( '.tdc-elements:first').outerWidth( true );
                            var elementOffset = currentElementOver.offset();


                            // Being floated, all prev columns width must be considered when working with the offset().left
                            var extraLeft = 0;
                            var prevColumns = currentElementOver.prevAll();

                            if ( prevColumns.length ) {
                                prevColumns.each( function (index, element) {
                                    var $element = jQuery( element );
                                    if ( ! $element.hasClass( 'tdc-inner-column' ) ) {
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

                            //tdcDebug.log( mousePointerValue.X + ' : ' + (extraLeft + elementOffset.left + elementOuterWidth / 2 ) );

                            if ( mousePointerValue.X > ( extraLeft + elementOffset.left + ( elementOuterWidth / 2 ) ) ) {

                                var $nextElement = currentElementOver.next();

                                if ( ! $nextElement.length || ( $nextElement.length && $nextElement.attr( 'id' ) !== tdcAdminWrapperUI._tdcJqObjPlaceholderId ) ) {
                                    currentElementOver.after($placeholder);
                                }

                                //tdcDebug.log( '>>>>>>>>>>>>>>>>>>>>>>>>>> 1' );

                                setVerticalPlaceholder({
                                    left: parseInt(extraLeft + elementOuterWidth),
                                    'margin-left': cssMarginLeftValue
                                });

                            } else {

                                var $prevElement = currentElementOver.prev();

                                if ( ! $prevElement.length || ( $prevElement.length && $prevElement.attr( 'id' ) !== tdcAdminWrapperUI._tdcJqObjPlaceholderId ) ) {
                                    currentElementOver.before($placeholder);
                                }

                                //tdcDebug.log( '<<<<<<<<<<<<<<<<<<<<<<<<<<<<< 1' );

                                setVerticalPlaceholder({
                                    left: parseInt(extraLeft),
                                    'margin-left': cssMarginLeftValue
                                });
                            }

                            // 'show' must be after setting placeholder (horizontal or vertical), to be shown at the first 'mousedown' event
                            $placeholder.show();

                            // Hide the placeholder if it's near the dragged element
                            //if ( $placeholder.next().length && $placeholder.next().hasClass( 'tdc-dragged' ) ||
                            //    $placeholder.prev().length && $placeholder.prev().hasClass( 'tdc-dragged' ) ) {
                            //    $placeholder.hide();
                            //}
                        }







                        tdcElement.each(function( index, element ) {

                            var $element = jQuery( element );

                            $element.click(function( event ) {
                                //tdcDebug.log( 'click element' );

                                event.preventDefault();

                            }).mousedown(function( event ) {
                                //tdcDebug.log( 'element mouse down' );

                                event.preventDefault();
                                // Stop calling parents 'mousedown' (tdc-element-inner-column or tdc-column - each tdc-element must be in one of theme)
                                event.stopPropagation();

                                activeDraggedElement( jQuery( this ) );
                                showHelper( event );

                                currentElementOver = $element;
                                positionElementPlaceholder( event );

                            }).mouseup(function( event ) {

                                // Respond only if dragged element is 'tdc-element'
                                if ( isElementDragged() || ( isInnerRowDragged() && $element.hasClass( 'tdc-element-column' ) ) ) {
                                    //tdcDebug.log( 'element mouse up' );

                                    event.preventDefault();

                                    deactiveDraggedElement();
                                    hideHelper();

                                    currentElementOver = undefined;
                                    positionElementPlaceholder( event );
                                }

                            }).mousemove(function( event ) {

                                // Respond only if dragged element is 'tdc-element' or inner row
                                if ( isElementDragged() || ( isInnerRowDragged() && $element.hasClass( 'tdc-element-column' ) ) ) {
                                    //tdcDebug.log( 'element mouse move' );

                                    event.preventDefault();
                                    event.stopPropagation();

                                    showHelper( event );

                                    currentElementOver = $element;
                                    positionElementPlaceholder( event );
                                }

                            }).mouseenter(function( event ) {

                                // Respond only if dragged element is 'tdc-element' or inner row
                                if ( isElementDragged() || ( isInnerRowDragged() && $element.hasClass( 'tdc-element-column' ) ) ) {
                                    //tdcDebug.log( 'element mouse enter' );

                                    event.preventDefault();

                                    currentElementOver = $element;
                                    positionElementPlaceholder( event );
                                }

                            }).mouseleave(function( event ) {

                                // Respond only if dragged element is 'tdc-element' or inner row
                                if ( isElementDragged() || ( isInnerRowDragged() && $element.hasClass( 'tdc-element-column' ) ) ) {
                                    //tdcDebug.log( 'element mouse leave' );

                                    event.preventDefault();

                                    currentElementOver = undefined;
                                    positionElementPlaceholder(event);
                                }

                            }).on( 'fakemouseenterevent', function(event) {

                                // Respond only if dragged element is 'tdc-element' or inner row
                                if ( isElementDragged() || ( isInnerRowDragged() && $element.hasClass( 'tdc-element-column' ) ) ) {
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
                                        currentElementOver = $element;

                                        // Position the placeholder
                                        positionElementPlaceholder( event );
                                    }
                                }
                            });
                        });



                        tdcElements.each(function( index, element ) {

                            jQuery( element ).hover( function( event ) {
                                    //tdcDebug.log( 'tdc-elements mouse enter' );

                                    event.preventDefault();
                                },
                                function(event) {
                                    //tdcDebug.log( 'tdc-elements mouse leave' );

                                    event.preventDefault();
                                });
                        });





                        tdcRow.each(function( index, element ) {

                            var $element = jQuery( element );

                            $element.click( function( event ) {
                                //tdcDebug.log( 'click row' );

                                event.preventDefault();

                            }).mousedown(function( event ) {
                                //tdcDebug.log( 'row mouse down' );

                                event.preventDefault();
                                event.stopPropagation();

                                activeDraggedElement( jQuery( this ) );
                                showHelper( event );

                                currentElementOver = $element;
                                positionRowPlaceholder( event );

                            }).mouseup(function( event ) {

                                // Respond only if dragged element is 'tdc-row'
                                if ( isRowDragged() ) {
                                    //tdcDebug.log( 'row mouse up' );

                                    event.preventDefault();

                                    deactiveDraggedElement();
                                    hideHelper();
                                }

                            }).mousemove(function( event ) {

                                // Respond only if dragged element is 'tdc-row'
                                if ( isRowDragged() ) {
                                    //tdcDebug.log( 'row mouse move' );

                                    event.preventDefault();
                                    event.stopPropagation();

                                    showHelper( event );

                                    currentElementOver = $element;
                                    positionRowPlaceholder( event );
                                }

                            }).mouseenter(function( event ) {

                                // Respond only if dragged element is 'tdc-row'
                                if ( isRowDragged() ) {
                                    //tdcDebug.log('row mouse enter');

                                    event.preventDefault();

                                    currentElementOver = $element;
                                    positionRowPlaceholder( event );
                                }

                            }).mouseleave(function( event ) {

                                // Respond only if dragged element is 'tdc-row'
                                if ( isRowDragged() ) {
                                    //tdcDebug.log('row mouse leave');

                                    event.preventDefault();

                                    currentElementOver = undefined;
                                    positionRowPlaceholder( event );
                                }

                            }).on( 'fakemouseenterevent', function( event ) {

                                // Respond only if dragged element is 'tdc-row'
                                if ( isRowDragged() ) {
                                    tdcDebug.log( 'tdc-row FAKE MOUSE ENTER EVENT' );

                                    var outerHeight = $element.outerHeight( true );
                                    var outerWidth = $element.outerWidth();

                                    var offset = $element.offset();

                                    //tdcDebug.log( offset.left + ' : ' + event.pageX + ' : ' + (offset.left + outerWidth) );
                                    //tdcDebug.log( offset.top + ' : ' + event.pageY + ' : ' + (offset.top + outerHeight) );

                                    if ( ( parseInt( offset.left ) <= parseInt( event.pageX ) ) && ( parseInt( event.pageX ) <= parseInt( offset.left + outerWidth ) ) &&
                                        ( parseInt( offset.top ) <= parseInt( event.pageY ) ) && ( parseInt( event.pageY ) <= parseInt( offset.top + outerHeight ) ) ) {

                                        //tdcDebug.log( '***********************' );

                                        // Set the 'currentElementOver' variable to the current element
                                        currentElementOver = $element;

                                        // Position the placeholder
                                        positionRowPlaceholder( event );
                                    }
                                }
                            });
                        });





                        tdcColumn.each(function( index, element ) {

                            var $element = jQuery( element );

                            $element.click(function( event ) {
                                //tdcDebug.log( 'click column' );

                                event.preventDefault();


                            }).mousedown(function( event ) {
                                //tdcDebug.log( 'column mouse down' );

                                event.preventDefault();
                                event.stopPropagation();

                                activeDraggedElement( jQuery( this ) );
                                showHelper( event );

                                //setVerticalPlaceholder();

                                currentElementOver = $element;
                                positionColumnPlaceholder( event );

                            }).mouseup(function( event ) {

                                // Respond only if dragged element is 'tdc-column'
                                if ( isColumnDragged( $element ) ) {
                                    //tdcDebug.log( 'column mouse up' );

                                    event.preventDefault();

                                    deactiveDraggedElement();
                                    hideHelper();

                                    currentElementOver = undefined;
                                    positionColumnPlaceholder( event );
                                }

                            }).mousemove(function( event ) {

                                // Respond only if dragged element is 'tdc-column'
                                if ( isColumnDragged( $element ) ) {
                                    //tdcDebug.log( 'column mouse move' );

                                    event.preventDefault();
                                    event.stopPropagation();

                                    showHelper( event );

                                    currentElementOver = $element;
                                    positionColumnPlaceholder( event );
                                }

                            }).mouseenter(function( event ) {

                                // Respond only if dragged element is 'tdc-column'
                                if ( isColumnDragged( $element ) ) {
                                    //tdcDebug.log( 'column mouse enter' );

                                    event.preventDefault();

                                    currentElementOver = $element;
                                    positionColumnPlaceholder( event );
                                }

                            }).mouseleave(function(event) {

                                // Respond only if dragged element is 'tdc-column'
                                if ( isColumnDragged( $element ) ) {
                                    //tdcDebug.log( 'column mouse leave' );

                                    event.preventDefault();

                                    currentElementOver = undefined;
                                    positionColumnPlaceholder( event );
                                }

                            }).on( 'fakemouseenterevent', function(event) {

                                // Respond only if dragged element is 'tdc-column'
                                if ( isColumnDragged( $element ) ) {
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
                                        currentElementOver = $element;

                                        // Position the placeholder
                                        positionColumnPlaceholder( event );
                                    }
                                }
                            });
                        });








                        tdcElementInnerRow.each( function( index, element ) {

                            var $element = jQuery( element );

                            $element.click(function( event ) {
                                //tdcDebug.log( 'click inner row' );

                                event.preventDefault();

                            }).mousedown(function( event ) {
                                //tdcDebug.log( 'inner row mouse down' );

                                event.preventDefault();
                                event.stopPropagation();

                                activeDraggedElement( jQuery( this ) );
                                showHelper( event );

                                currentElementOver = $element;
                                positionInnerRowPlaceholder( event );

                            }).mouseup(function( event ) {
                                //tdcDebug.log( 'inner row element mouse up' );

                                event.preventDefault();

                                deactiveDraggedElement();
                                hideHelper();

                            }).mousemove(function( event ) {

                                // Respond only if dragged element is 'tdc-inner-row'
                                if ( isElementDragged() || isInnerRowDragged() ) {
                                    //tdcDebug.log( 'inner row element mouse move' );

                                    event.preventDefault();
                                    event.stopPropagation();

                                    showHelper(event);

                                    currentElementOver = $element;
                                    positionInnerRowPlaceholder( event );
                                }

                            }).mouseenter(function(event) {

                                // Respond only if dragged element is 'tdc-inner-row'
                                if ( isElementDragged() || isInnerRowDragged() ) {
                                    //tdcDebug.log('inner row mouse enter');

                                    event.preventDefault();

                                    currentElementOver = $element;
                                    positionInnerRowPlaceholder( event );
                                }

                            }).mouseleave(function(event) {

                                // Respond only if dragged element is 'tdc-inner-row'
                                if ( isElementDragged() || isInnerRowDragged() ) {
                                    //tdcDebug.log('inner row mouse leave');

                                    event.preventDefault();

                                    currentElementOver = undefined;
                                    positionInnerRowPlaceholder( event );
                                }

                            }).on( 'fakemouseenterevent', function(event) {

                                // Respond only if dragged element is 'tdc-inner-row'
                                if ( isElementDragged() || isInnerRowDragged() ) {
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
                                        currentElementOver = $element;

                                        // Position the placeholder
                                        positionInnerRowPlaceholder( event );
                                    }
                                }
                            });
                        });



                        tdcInnerColumn.each(function( index, element ) {

                            var $element = jQuery( element );

                            $element.click(function( event ) {
                                //tdcDebug.log( 'click inner column' );

                                event.preventDefault();

                            }).mousedown(function(event) {
                                //tdcDebug.log( 'inner column mouse down' );

                                event.preventDefault();
                                event.stopPropagation();

                                activeDraggedElement( jQuery( this ) );
                                showHelper( event );

                                currentElementOver = $element;
                                positionInnerColumnPlaceholder( event );

                            }).mouseup(function( event ) {

                                // Respond only if dragged element is 'tdc-inner-column'
                                if ( isInnerColumnDragged( $element ) ) {
                                    //tdcDebug.log( 'inner column mouse up' );

                                    event.preventDefault();

                                    deactiveDraggedElement();
                                    hideHelper();

                                    currentElementOver = undefined;
                                    positionInnerColumnPlaceholder( event );
                                }

                            }).mousemove(function( event ) {

                                // Respond only if dragged element is 'tdc-inner-column'
                                if ( isInnerColumnDragged( $element ) ) {
                                    //tdcDebug.log( 'inner column mouse move' );

                                    event.preventDefault();
                                    event.stopPropagation();

                                    showHelper(event);

                                    currentElementOver = $element;
                                    positionInnerColumnPlaceholder( event );
                                }

                            }).mouseenter(function( event ) {

                                // Respond only if dragged element is 'tdc-inner-column'
                                if ( isInnerColumnDragged( $element ) ) {
                                    //tdcDebug.log( 'inner column mouse enter' );

                                    event.preventDefault();

                                    currentElementOver = $element;
                                    positionInnerColumnPlaceholder( event );
                                }

                            }).mouseleave(function(event) {

                                // Respond only if dragged element is 'tdc-inner-column'
                                if ( isInnerColumnDragged( $element ) ) {
                                    //tdcDebug.log( 'column mouse leave' );

                                    event.preventDefault();

                                    currentElementOver = undefined;
                                    positionInnerColumnPlaceholder( event );
                                }

                            }).on( 'fakemouseenterevent', function(event) {

                                // Respond only if dragged element is 'tdc-inner-column'
                                if ( isInnerColumnDragged( $element ) ) {
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
                                    var prevColumns = $element.prevAll( '.tdc-inner-column' );

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
                                        currentElementOver = $element;

                                        // Position the placeholder
                                        positionInnerColumnPlaceholder( event );
                                    }
                                }
                            });
                        });











                        tdcAdminWrapperUI._tdcJqObjElements.find( '.tdc-sidebar-element').each(function( index, element ) {

                            jQuery(element).click(function( event ) {
                                //tdcDebug.log( 'element click' );

                                event.preventDefault();

                            }).mousedown(function( event ) {
                                //tdcDebug.log( 'element mouse down' );

                                event.preventDefault();

                                activeDraggedElement( jQuery( this ) );
                                showHelper( event );

                            }).mouseup(function(event) {
                                //tdcDebug.log( 'element mouse up' );

                                event.preventDefault();

                                deactiveDraggedElement();
                                hideHelper();
                            });
                        });



                        jQuery( window ).mouseup(function( event ) {
                            //tdcDebug.log( 'window mouse up' );

                            deactiveDraggedElement();
                            hideHelper();

                        }).mousemove(function( event ) {
                            //tdcDebug.log( 'window mouse move' );

                            showHelper( event );
                        });



                        iframeContents.mousedown(function(event) {
                            //tdcDebug.log( 'contents mouse down' );

                        }).mouseup(function(event) {
                            //tdcDebug.log( 'contents mouse up' );

                            deactiveDraggedElement();
                            hideHelper();

                            currentElementOver = undefined;
                            positionElementPlaceholder( event );

                        }).mousemove(function(event) {
                            //tdcDebug.log( 'contents mouse move' );

                            showHelper( event );

                            window.previousMouseClientX = event.clientX;
                            window.previousMouseClientY = event.clientY;

                        }).scroll(function( event ) {
                            //tdcDebug.log( '------------- content scroll -------------' );

                            if ( isElementDragged() ) {
                                positionElementPlaceholder( event );
                            } else if ( isInnerColumnDragged() ) {
                                positionInnerColumnPlaceholder( event );
                            } else if ( isInnerRowDragged() ) {
                                positionInnerRowPlaceholder( event );
                            } else if ( isColumnDragged() ) {
                                positionColumnPlaceholder( event );
                            } else if ( isRowDragged() ) {
                                positionRowPlaceholder( event);
                            }
                        });




                        tdcAdminWrapperUI._tdcJqObjHelper.mouseup(function( event ) {
                            //tdcDebug.log( 'helper mouse up' );

                            hideHelper();
                        });

                        window.test = function() {
                            tdcDebug.log( 1 );
                        };
                    }

                    //setOperationUI();






                    tdcOperationUI.init( iframeContents );






                });

            tdcAdminWrapperUI._tdcJqObjWrapper.append( tdcLiveIframe );

            // This should be marked as false if something wrong
            tdcAdminIFrameUI._initialized = true;
        }

    };

})(jQuery, Backbone, _);
