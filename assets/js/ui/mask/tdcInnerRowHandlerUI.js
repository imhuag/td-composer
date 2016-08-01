/**
 * Created by tagdiv on 28.03.2016.
 */

/* global jQuery:{} */
/* global Backbone:{} */
/* global _:{} */

/* global tdcMaskUI:{} */
/* global tdcOperationUI:{} */

/*
 * The mask handler object
 *   - it creates the handler jquery object for 'tdc-inner-column'
 *   - it has a reference to the 'tdc-inner-row' jquery object
 *   - it registers to the mask as handler
 */

var tdcInnerRowHandlerUI;

(function( jQuery, backbone, _, undefined ) {

    'use strict';

    tdcInnerRowHandlerUI = {

        //_handlerId: tdcInnerColumnHandlerUI._elementCssClass,
        //_handlerId: 'tdc-inner-row',
        _handlerId: 'tdc-element-inner-row',

        // Handler text
        _handlerText: 'Inner Row',

        // Handler css class
        _handlerCssClass: 'tdc-mask-inner-row',




        // Handler element
        $elementInnerRow: undefined,

        // Wrapper Handler jquery object
        _$handlerWrapper: undefined,

        // Clone Handler jquery object
        _$handlerClone: undefined,

        // Initialization flag
        _isInitialized: false,




        init: function( forceReinitialization ) {

            if ( ! _.isUndefined( forceReinitialization ) && true === forceReinitialization ) {
                tdcInnerRowHandlerUI._isInitialized = false;
            }

            // Do nothing if it's already initialized
            if ( tdcInnerRowHandlerUI._isInitialized ) {
                return;
            }

            var handlerHtml =
                '<div id="' + tdcInnerRowHandlerUI._handlerCssClass + '">' +
                    '<div class="tdc-mask-arrow-vertical"></div>' +
                    '<div class="tdc-mask-handler-drag">' + tdcInnerRowHandlerUI._handlerText + '</div>' +
                '</div>';

            // Create the handler jquery object and append it to the mask wrapper
            tdcInnerRowHandlerUI._$handlerWrapper = jQuery( handlerHtml );

            tdcInnerRowHandlerUI._$handlerClone = jQuery( '<div class="tdc-mask-clone"></div>' );

            tdcInnerRowHandlerUI._$handlerWrapper.append( tdcInnerRowHandlerUI._$handlerClone );
            tdcMaskUI.$handlerStructure.append( tdcInnerRowHandlerUI._$handlerWrapper );



            // Define the events the $_handlerDrag object will respond to

            tdcInnerRowHandlerUI._$handlerWrapper.mousedown( function( event ) {

                // Consider only the left button
                if ( 1 !== event.which ) {
                    return;
                }

                // Send the event to its 'tdc-inner-row' element
                tdcInnerRowHandlerUI._triggerEvent( event );

            }).mouseup( function( event ) {

                // Send the event to its 'tdc-inner-row' element
                tdcInnerRowHandlerUI._triggerEvent( event );

            }).mousemove( function( event ) {

                // Send the event to its 'tdc-inner-row' element
                tdcMaskUI.show();
                tdcInnerRowHandlerUI._triggerEvent( event );

            }).mouseenter(function( event ) {

                // Define the events for _$handlerWrapper
                // Show/hide the mask when the header mask is wider than the element
                event.preventDefault();
                tdcMaskUI.setCurrentContainer( tdcInnerRowHandlerUI.$elementInnerRow );
                tdcMaskUI.show();

            }).mouseleave( function( event ) {

                // Define the events for _$handlerWrapper
                // Show/hide the mask when the header mask is wider than the element
                event.preventDefault();
                tdcMaskUI.setCurrentContainer( undefined );
                tdcMaskUI.hide();
            });


            tdcInnerRowHandlerUI._$handlerClone.mousedown( function( event ) {
                // Consider only the left button
                if ( 1 !== event.which ) {
                    return;
                }

                event.preventDefault();
                event.stopPropagation();

                var elementModelId = tdcInnerRowHandlerUI.$elementInnerRow.data( 'model_id');

                // @todo This check should be removed - the content should have consistency
                if ( _.isUndefined( elementModelId ) ) {
                    new tdcNotice.notice( 'tdcInnerRowHandlerUI -> tdcInnerRowHandlerUI._$handlerClone Error: Element model id is not in $draggedElement data!', true, false );
                    return;
                }

                var elementModel = tdcIFrameData.getModel( elementModelId );

                // @todo This check should be removed - the content should have consistency
                if ( _.isUndefined(elementModel ) ) {
                    new tdcNotice.notice( 'tdcInnerRowHandlerUI -> tdcInnerRowHandlerUI._$handlerClone Error: Element model not in structure data!', true, false );
                    return;
                }

                // Clone the element model
                var cloneModel = tdcIFrameData.cloneModel( elementModel );

                // Insert the cloned element after the current element
                tdcOperationUI.setDraggedElement( jQuery( '<div class="tdc-element-inner-row">Cloned Inner Row</div>' ) );
                var $draggedElement = tdcOperationUI.getDraggedElement();

                $draggedElement.insertAfter( tdcInnerRowHandlerUI.$elementInnerRow );
                tdcInnerRowUI.bindInnerRow( $draggedElement );

                var destinationColParam = tdcIFrameData._getDestinationCol();

                // Define the inner row liveView
                var innerRowView = new tdcIFrameData.TdcLiveView({
                    model: cloneModel,
                    el: $draggedElement[0]
                });

                // Set the data model id to the liveView jquery element
                $draggedElement.data( 'model_id', cloneModel.cid );

                // Get the shortcode rendered
                cloneModel.getShortcodeRender( destinationColParam, '', true);

                tdcOperationUI.setDraggedElement( undefined );
            });


            // The final step of initialization is to add the handler object to the mask handlers and to mark it has initialized

            // Add the handler and its id to the mask handlers
            tdcMaskUI.addHandler( tdcInnerRowHandlerUI._handlerId, tdcInnerRowHandlerUI );

            // The handler is initialized here
            tdcInnerRowHandlerUI._isInitialized = true;
        },


        /**
         * Set the element ( 'tdc-element-inner-row' ) where this handler will send its proper events
         *
         * @param $element
         */
        setElement: function( $element ) {

            var $elementInnerRow = tdcOperationUI.inInnerRow( $element );

            if ( ! _.isUndefined( $elementInnerRow ) ) {
                tdcInnerRowHandlerUI.$elementInnerRow = $elementInnerRow;
                tdcInnerRowHandlerUI._$handlerWrapper.show();
            } else {
                tdcInnerRowHandlerUI._$handlerWrapper.hide();
            }
        },


        /**
         * Trigger the event to its element ( 'tdc-inner-row' )
         *
         * @param event
         * @private
         */
        _triggerEvent: function( event ) {

            if ( ! _.isUndefined( event ) && ! _.isUndefined( tdcInnerRowHandlerUI.$elementInnerRow ) ) {
                tdcInnerRowHandlerUI.$elementInnerRow.trigger( event );
            }
        }

    };

})( jQuery, Backbone, _ );