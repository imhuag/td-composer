/**
 * Created by tagdiv on 28.03.2016.
 */

/* global jQuery:{} */
/* global Backbone:{} */
/* global _:{} */

/* global tdcMaskUI:{} */


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

        // The css class of the handler element
        _elementCssClass: 'tdc-inner-row',

        //_handlerId: tdcInnerColumnHandlerUI._elementCssClass,
        _handlerId: 'tdc-inner-row',

        // Handler text
        _handlerText: 'Inner Row',

        // Handler css class
        _handlerCssClass: 'tdc-mask-inner-row',




        // Handler element
        $elementInnerRow: undefined,

        // Handler jquery object
        _$handler: undefined,

        // Initialization flag
        _isInitialized: false,




        init: function() {

            // Do nothing if it's already initialized
            if ( tdcInnerRowHandlerUI._isInitialized ) {
                return;
            }

            // Create the handler jquery object and append it to the mask wrapper
            tdcInnerRowHandlerUI._$handler = jQuery( '<div id="' + tdcInnerRowHandlerUI._handlerCssClass + '">' + tdcInnerRowHandlerUI._handlerText + '</div>' );
            tdcMaskUI.$wrapper.append( tdcInnerRowHandlerUI._$handler );


            // Define the events the handler will respond to

            tdcInnerRowHandlerUI._$handler.mousedown( function( event ) {

                // Send the event to its 'tdc-inner-row' element
                tdcInnerRowHandlerUI._triggerEvent( event );

            }).mouseup( function() {

                // Send the event to its 'tdc-inner-row' element
                tdcInnerRowHandlerUI._triggerEvent( event );

            }).mousemove( function( event ) {

                // Send the event to its 'tdc-inner-row' element
                tdcInnerRowHandlerUI._triggerEvent( event );
                tdcMaskUI.show();

            }).mouseenter(function( event ) {

                // Send the event to its 'tdc-inner-row' element
                tdcInnerRowHandlerUI._triggerEvent( event );
                tdcMaskUI.show();

            }).mouseleave( function( event ) {

                // Send the event to its 'tdc-inner-row' element
                tdcInnerRowHandlerUI._triggerEvent( event );
            });



            // The final step of initialization is to add the handler object to the mask handlers and to mark it has initialized

            // Add the handler and its id to the mask handlers
            tdcMaskUI.addHandler( tdcInnerRowHandlerUI._handlerId, tdcInnerRowHandlerUI );

            // The handler is initialized here
            tdcInnerRowHandlerUI._isInitialized = true;
        },


        /**
         * Set the element ( 'tdc-inner-row' ) where this handler will send its proper events
         *
         * @param $element
         */
        setElement: function( $element ) {

            var $elementInnerRow = $element.closest( '.' + tdcInnerRowHandlerUI._elementCssClass );
            if ( $elementInnerRow.length ) {
                tdcInnerRowHandlerUI.$elementInnerRow = $elementInnerRow;
                tdcInnerRowHandlerUI._$handler.show();
            } else {
                tdcInnerRowHandlerUI._$handler.hide();
            }
        },


        /**
         * Trigger the event to its element ( 'tdc-inner-row' )
         *
         * @param event
         * @private
         */
        _triggerEvent: function( event ) {

            if ( ! _.isUndefined( tdcInnerRowHandlerUI.$elementInnerRow ) ) {
                tdcInnerRowHandlerUI.$elementInnerRow.trigger( event );
            }
        }

    };

})( jQuery, Backbone, _ );