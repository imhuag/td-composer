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
 *   - it creates the handler jquery object for 'tdc-column'
 *   - it has a reference to the 'tdc-column' jquery object
 *   - it registers to the mask as handler
 */

var tdcColumnHandlerUI;

(function( jQuery, backbone, _, undefined ) {

    'use strict';

    tdcColumnHandlerUI = {

        //_handlerId: tdcInnerColumnHandlerUI._elementCssClass,
        _handlerId: 'tdc-column',

        // Handler text
        _handlerText: 'Column',

        // Handler css class
        _handlerCssClass: 'tdc-mask-column',




        // Handler element
        $elementColumn: undefined,

        _$handlerWrapper: undefined,

        // Handler jquery object
        _$handlerDrag: undefined,

        // Initialization flag
        _isInitialized: false,




        init: function() {

            // Do nothing if it's already initialized
            if ( tdcColumnHandlerUI._isInitialized ) {
                return;
            }


            // Create the handler jquery object and append it to the mask wrapper
            var $handlerWrapper = jQuery( '<div id="' + tdcColumnHandlerUI._handlerCssClass + '"></div>'),
                $handlerDrag = jQuery( '<div class="tdc-mask-handler-drag">' + tdcColumnHandlerUI._handlerText + '</div>' );

            $handlerWrapper.append( $handlerDrag );

            tdcColumnHandlerUI._$handlerDrag = $handlerDrag;
            tdcColumnHandlerUI._$handlerWrapper = $handlerWrapper;

            tdcMaskUI.$handler.append( $handlerWrapper );



            // Define the events the $_handlerDrag object will respond to

            tdcColumnHandlerUI._$handlerDrag.mousedown( function( event ) {

                // Consider only the left button
                if ( 1 !== event.which ) {
                    return;
                }

                // Send the event to its 'tdc-column' element
                tdcColumnHandlerUI._triggerEvent( event );

            }).mouseup( function() {

                // Send the event to its 'tdc-column' element
                tdcColumnHandlerUI._triggerEvent( event );

            }).mousemove( function( event ) {

                // Send the event to its 'tdc-column' element
                tdcMaskUI.show();
                tdcColumnHandlerUI._triggerEvent( event );

            }).mouseenter(function( event ) {

                // Send the event to its 'tdc-column' element
                tdcMaskUI.show();
                tdcColumnHandlerUI._triggerEvent( event );

            }).mouseleave( function( event ) {

                // Send the event to its 'tdc-column' element
                tdcColumnHandlerUI._triggerEvent( event );
            });



            // Define the events for _$handlerWrapper
            // Show/hide the mask when the header mask is wider than the element

            tdcColumnHandlerUI._$handlerWrapper.mouseenter(function( event ) {

                event.preventDefault();
                tdcMaskUI.setCurrentContainer( tdcColumnHandlerUI.$elementColumn );
                tdcMaskUI.show();

            }).mouseleave( function( event ) {

                event.preventDefault();
                tdcMaskUI.setCurrentContainer( undefined );
                tdcMaskUI.hide();
            });



           // The final step of initialization is to add the handler object to the mask handlers and to mark it has initialized

            // Add the handler and its id to the mask handlers
            tdcMaskUI.addHandler( tdcColumnHandlerUI._handlerId, tdcColumnHandlerUI );

            // The handler is initialized here
            tdcColumnHandlerUI._isInitialized = true;
        },


        /**
         * Set the element ( 'tdc-column' ) where this handler will send its proper events
         *
         * @param $element
         */
        setElement: function( $element ) {

            var $elementColumn = tdcOperationUI.inColumn( $element );

            if ( ! _.isUndefined( $elementColumn ) ) {
                tdcColumnHandlerUI.$elementColumn = $elementColumn;
                tdcColumnHandlerUI._$handlerWrapper.show();
            } else {
                tdcColumnHandlerUI._$handlerWrapper.hide();
            }
        },


        /**
         * Trigger the event to its element ( 'tdc-column' )
         *
         * @param event
         * @private
         */
        _triggerEvent: function( event ) {

            if ( ! _.isUndefined( event ) && ! _.isUndefined( tdcColumnHandlerUI.$elementColumn ) ) {
                tdcColumnHandlerUI.$elementColumn.trigger( event );
            }
        }

    };

})( jQuery, Backbone, _ );