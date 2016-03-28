/**
 * Created by tagdiv on 28.03.2016.
 */

/* global jQuery:{} */
/* global Backbone:{} */
/* global _:{} */

/* global tdcMaskUI:{} */


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

        // The css class of the handler element
        _elementCssClass: 'tdc-column',

        //_handlerId: tdcInnerColumnHandlerUI._elementCssClass,
        _handlerId: 'tdc-column',

        // Handler text
        _handlerText: 'Column',

        // Handler css class
        _handlerCssClass: 'tdc-mask-column',




        // Handler element
        $elementColumn: undefined,

        // Handler jquery object
        _$handler: undefined,

        // Initialization flag
        _isInitialized: false,




        init: function() {

            // Do nothing if it's already initialized
            if ( tdcColumnHandlerUI._isInitialized ) {
                return;
            }

            // Create the handler jquery object and append it to the mask wrapper
            tdcColumnHandlerUI._$handler = jQuery( '<div id="' + tdcColumnHandlerUI._handlerCssClass + '">' + tdcColumnHandlerUI._handlerText + '</div>' );
            tdcMaskUI.$wrapper.append( tdcColumnHandlerUI._$handler );


            // Define the events the handler will respond to

            tdcColumnHandlerUI._$handler.mousedown( function( event ) {

                // Send the event to its 'tdc-column' element
                tdcColumnHandlerUI._triggerEvent( event );

            }).mouseup( function() {

                // Send the event to its 'tdc-column' element
                tdcColumnHandlerUI._triggerEvent( event );

            }).mousemove( function( event ) {

                // Send the event to its 'tdc-column' element
                tdcColumnHandlerUI._triggerEvent( event );
                tdcMaskUI.show();

            }).mouseenter(function( event ) {

                // Send the event to its 'tdc-column' element
                tdcColumnHandlerUI._triggerEvent( event );
                tdcMaskUI.show();

            }).mouseleave( function( event ) {

                // Send the event to its 'tdc-column' element
                tdcColumnHandlerUI._triggerEvent( event );
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

            var $elementColumn = $element.closest( '.' + tdcColumnHandlerUI._elementCssClass );
            if ( $elementColumn.length ) {
                tdcColumnHandlerUI.$elementColumn = $elementColumn;
                tdcColumnHandlerUI._$handler.show();
            } else {
                tdcColumnHandlerUI._$handler.hide();
            }
        },


        /**
         * Trigger the event to its element ( 'tdc-column' )
         *
         * @param event
         * @private
         */
        _triggerEvent: function( event ) {

            if ( ! _.isUndefined( tdcColumnHandlerUI.$elementColumn ) ) {
                tdcColumnHandlerUI.$elementColumn.trigger( event );
            }
        }

    };

})( jQuery, Backbone, _ );