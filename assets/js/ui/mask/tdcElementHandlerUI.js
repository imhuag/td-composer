/**
 * Created by tagdiv on 29.07.2016.
 */

/* global jQuery:{} */
/* global Backbone:{} */
/* global _:{} */

/* global tdcMaskUI:{} */
/* global tdcOperationUI:{} */

/*
 * The mask handler object
 *   - it creates the handler jquery object for 'tc-row'
 *   - it has a reference to the 'tdc-row' jquery object
 *   - it registers to the mask as handler
 */

var tdcElementHandlerUI;

(function( jQuery, backbone, _, undefined ) {

    'use strict';

    tdcElementHandlerUI = {

        //_handlerId: tdcInnerColumnHandlerUI._elementCssClass,
        _handlerId: 'tdc-element',

        // Handler css class
        _handlerCssClass: 'tdc-mask-element',

        _confirmDeletion: 'Do you want to delete element?',



        // Handler element
        $element: undefined,

        // Wrapper Handler jquery object
        _$handlerWrapper: undefined,

        // Clone Handler jquery object
        _$handlerClone: undefined,

        // Delete Handler jquery object
        _$handlerDelete: undefined,

        // Initialization flag
        _isInitialized: false,




        init: function( forceReinitialization ) {

            if ( ! _.isUndefined( forceReinitialization ) && true === forceReinitialization ) {
                tdcElementHandlerUI._isInitialized = false;
            }

            // Do nothing if it's already initialized
            if ( tdcElementHandlerUI._isInitialized ) {
                return;
            }

            var handlerHtml =
                '<div id="' + tdcElementHandlerUI._handlerCssClass + '"></div>';

            // Create the handler jquery object and append it to the mask wrapper
            tdcElementHandlerUI._$handlerWrapper = jQuery( handlerHtml );

            tdcElementHandlerUI._$handlerDelete = jQuery( '<div class="tdc-mask-element-delete"></div>' );
            tdcElementHandlerUI._$handlerClone = jQuery( '<div class="tdc-mask-element-clone"></div>' );

            tdcElementHandlerUI._$handlerWrapper.append( tdcElementHandlerUI._$handlerDelete );
            tdcElementHandlerUI._$handlerWrapper.append( tdcElementHandlerUI._$handlerClone );

            tdcMaskUI.$handlerStructure.append( tdcElementHandlerUI._$handlerWrapper );

            tdcElementHandlerUI._$handlerDelete.click(function(event) {
                event.preventDefault();

                // Important! The entire operation is done as tdcOperationUI._moveDraggedElement does

                if ( window.confirm( tdcElementHandlerUI._confirmDeletion ) ) {

                    tdcOperationUI.setDraggedElement( tdcElementHandlerUI.$element );
                    tdcOperationUI.setCurrentElementOver( tdcAdminWrapperUI.$recycle );

                    var $draggedElement = tdcOperationUI.getDraggedElement(),
                        $placeholder = tdcAdminWrapperUI.$placeholder,
                        $draggedElementContainer = $draggedElement.closest( '.tdc-elements' ),
                        $draggedElementContainerChildren = $draggedElementContainer.children(),
                        indexPlaceholder = $draggedElementContainerChildren.index( $placeholder );

                    if ( ( -1 === indexPlaceholder && 1 === $draggedElementContainerChildren.length ) || ( 2 === $draggedElementContainerChildren.length && -1 !== indexPlaceholder ) ) {

                        // Add the 'tdc-element-column' or the 'tdc-element-inner-column' class to the empty element
                        var structureClass = '';

                        var $tdcInnerColumnParentOfDraggedElement = tdcElementHandlerUI.$element.closest( '.tdc-inner-column' );
                        if ( $tdcInnerColumnParentOfDraggedElement.length ) {
                            structureClass = ' tdc-element-inner-column';
                        } else {
                            var $tdcColumnParentOfDraggedElement = tdcElementHandlerUI.$element.closest( '.tdc-column' );
                            if ( $tdcColumnParentOfDraggedElement.length ) {
                                structureClass = ' tdc-element-column';
                            }
                        }
                        var $emptyElement = jQuery( '<div class="' + tdcOperationUI._emptyElementClass + structureClass + '"></div>' );

                        tdcElementUI.bindEmptyElement( $emptyElement );

                        $draggedElementContainer.append( $emptyElement );
                    }

                    tdcIFrameData.changeData({
                        wasSidebarElementDragged: false,
                        wasElementDragged: true,
                        wasInnerColumnDragged: false,
                        wasInnerRowDragged: false,
                        wasTempInnerRowDragged: false,
                        wasColumnDragged: false,
                        wasRowDragged: false,
                        wasTempRowDragged: false,

                        draggedBlockUid: ''
                    });

                    tdcOperationUI.setDraggedElement( undefined );

                    // @todo Maybe this is not necessary
                    //tdcSidebarPanel.clearPanel();
                }
            });

            tdcElementHandlerUI._$handlerClone.click(function(event) {
                event.preventDefault();
                event.stopPropagation();

                var elementModelId = tdcElementHandlerUI.$element.data( 'model_id');

                // @todo This check should be removed - the content should have consistency
                if ( _.isUndefined( elementModelId ) ) {
                    new tdcNotice.notice( 'tdcElementHandlerUI -> tdcElementHandlerUI._$handlerClone Error: Element model id is not in $draggedElement data!', true, false );

                    //alert('changeData - Error: Element model id is not in $draggedElement data!');
                    return;
                }

                var elementModel = tdcIFrameData.getModel( elementModelId );

                // @todo This check should be removed - the content should have consistency
                if ( _.isUndefined(elementModel ) ) {
                    new tdcNotice.notice( 'tdcElementHandlerUI -> tdcElementHandlerUI._$handlerClone Error: Element model not in structure data!', true, false );

                    //alert('changeData Error: Element model not in structure data!');
                    return;
                }


                // Clone the element model
                var cloneModel = elementModel.clone(),
                    parentModel = elementModel.get( 'parentModel'),
                    childCollectionParentModel = parentModel.get( 'childCollection' );

                childCollectionParentModel.add( cloneModel, {
                    at: childCollectionParentModel.indexOf( elementModel ) + 1,
                    silent: true
                });


                // Insert the cloned element after the current element
                tdcOperationUI.setDraggedElement( jQuery( '<div class="tdc-element">Cloned Element</div>' ) );
                var $draggedElement = tdcOperationUI.getDraggedElement();

                $draggedElement.insertAfter( tdcElementHandlerUI.$element );
                tdcElementUI.bindElement( $draggedElement );

                var destinationModel = tdcIFrameData._getDestinationModel(['.tdc-inner-column', '.tdc-column']);

                if ( _.isUndefined( destinationModel ) ) {
                    //throw 'changeData Error: Destination model not in structure data!';

                    new tdcNotice.notice( 'tdcElementHandlerUI -> tdcElementHandlerUI._$handlerClone Error: Destination model not in structure data!', true, false );
                }

                var destinationColParam = tdcIFrameData._getDestinationCol();

                // Define the liveView
                var elementView = new tdcIFrameData.TdcLiveView({
                    model: cloneModel,
                    el: $draggedElement[0]
                });

                // Set the data model id to the liveView jquery element
                $draggedElement.data( 'model_id', cloneModel.cid );



                // Get the shortcode rendered
                cloneModel.getShortcodeRender( destinationColParam, '', true );

                tdcOperationUI.setDraggedElement( undefined );

            });


            // Define the events the $_handlerDrag object will respond to

            tdcElementHandlerUI._$handlerWrapper.mousedown( function( event ) {

                // Consider only the left button
                if ( 1 !== event.which ) {
                    return;
                }

                // Send the event to its 'tdc-row' element
                tdcElementHandlerUI._triggerEvent( event );

            }).mouseup( function( event ) {

                // Send the event to its 'tdc-row' element
                tdcElementHandlerUI._triggerEvent( event );

            }).mousemove( function( event ) {

                // Send the event to its 'tdc-row' element
                tdcMaskUI.show();
                tdcElementHandlerUI._triggerEvent( event );

            }).mouseenter(function( event ) {

                // Define the events for _$handlerWrapper
                // Show/hide the mask when the header mask is wider than the element
                event.preventDefault();
                tdcMaskUI.setCurrentElement( tdcElementHandlerUI.$element );
                tdcMaskUI.show();

            }).mouseleave( function( event ) {

                // Define the events for _$handlerWrapper
                // Show/hide the mask when the header mask is wider than the element
                event.preventDefault();
                tdcMaskUI.setCurrentElement( undefined );
                tdcMaskUI.hide();

            });



            // The final step of initialization is to add the handler object to the mask handlers and to mark it has initialized

            // Add the handler and its id to the mask handlers
            tdcMaskUI.addHandler( tdcElementHandlerUI._handlerId, tdcElementHandlerUI );

            // The handler is initialized here
            tdcElementHandlerUI._isInitialized = true;
        },


        /**
         * Set the element ( 'tdc-element' ) where this handler will send its proper events
         *
         * @param $element
         */
        setElement: function( $element ) {

            if ( ! _.isUndefined( $element ) && tdcOperationUI.isElement( $element ) ) {
                tdcElementHandlerUI.$element = $element;
                tdcElementHandlerUI._$handlerWrapper.show();
            } else {
                tdcElementHandlerUI._$handlerWrapper.hide();
            }
        },


        /**
         * Trigger the event to its element ( 'tdc-row' )
         *
         * @param event
         * @private
         */
        _triggerEvent: function( event ) {

            if ( ! _.isUndefined( event ) && ! _.isUndefined( tdcElementHandlerUI.$element ) ) {
                tdcElementHandlerUI.$element.trigger( event );
            }
        }

    };

})( jQuery, Backbone, _ );
