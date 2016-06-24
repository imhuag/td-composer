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

        // Handler jquery object
        _$handlerWrapper: undefined,

        // Initialization flag
        _isInitialized: false,




        init: function() {

            // Do nothing if it's already initialized
            if ( tdcInnerRowHandlerUI._isInitialized ) {
                return;
            }

            var handleHtml =
                '<div id="' + tdcInnerRowHandlerUI._handlerCssClass + '">' +
                    '<div class="tdc-mask-arrow-vertical"></div>' +
                    '<div class="tdc-mask-handler-drag">' + tdcInnerRowHandlerUI._handlerText + '</div>' +
                    '<div class="tdc-mask-edit">' +
                        '<div class="tdc-icon-edit"></div>' +
                    '</div>' +
                '</div>',

            // Create the handler jquery object and append it to the mask wrapper
                $handlerWrapper = jQuery( handleHtml );

            tdcInnerRowHandlerUI._$handlerWrapper = $handlerWrapper;

            tdcMaskUI.$handler.append( $handlerWrapper );



            // Define the events the $_handlerDrag object will respond to

            tdcInnerRowHandlerUI._$handlerWrapper.mousedown( function( event ) {

                // Consider only the left button
                if ( 1 !== event.which ) {
                    return;
                }

                // Send the event to its 'tdc-inner-row' element
                tdcInnerRowHandlerUI._triggerEvent( event );

            }).mouseup( function() {

                // Send the event to its 'tdc-inner-row' element
                tdcInnerRowHandlerUI._triggerEvent( event );

            }).mousemove( function( event ) {

                // Send the event to its 'tdc-inner-row' element
                tdcMaskUI.show();
                tdcInnerRowHandlerUI._triggerEvent( event );

            }).mouseenter(function( event ) {

                // Send the event to its 'tdc-inner-row' element
                tdcMaskUI.show();
                tdcInnerRowHandlerUI._triggerEvent( event );

            }).mouseleave( function( event ) {

                // Send the event to its 'tdc-inner-row' element
                tdcInnerRowHandlerUI._triggerEvent( event );
            });



            // Define the events for _$handlerWrapper
            // Show/hide the mask when the header mask is wider than the element

            tdcInnerRowHandlerUI._$handlerWrapper.mouseenter(function( event ) {

                event.preventDefault();
                tdcMaskUI.setCurrentContainer( tdcInnerRowHandlerUI.$elementInnerRow );
                tdcMaskUI.show();

            }).mouseleave( function( event ) {

                event.preventDefault();
                tdcMaskUI.setCurrentContainer( undefined );
                tdcMaskUI.hide();
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