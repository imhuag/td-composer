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
*   - it has a reference to the 'tdc-inner-column' jquery object
*   - it registers to the mask as handler
*/

var tdcInnerColumnHandlerUI;

(function( jQuery, backbone, _, undefined ) {

    'use strict';

    tdcInnerColumnHandlerUI = {

        // The css class of the handler element
        _elementCssClass: 'tdc-inner-column',

        //_handlerId: tdcInnerColumnHandlerUI._elementCssClass,
        _handlerId: 'tdc-inner-column',

        // Handler text
        _handlerText: 'Inner Column',

        // Handler css class
        _handlerCssClass: 'tdc-mask-inner-column',




        // Handler element
        $elementInnerColumn: undefined,

        // Handler jquery object
        _$handler: undefined,

        // Initialization flag
        _isInitialized: false,




        init: function() {

            // Do nothing if it's already initialized
            if ( tdcInnerColumnHandlerUI._isInitialized ) {
                return;
            }

            // Create the handler jquery object and append it to the mask wrapper
            tdcInnerColumnHandlerUI._$handler = jQuery( '<div id="' + tdcInnerColumnHandlerUI._handlerCssClass + '">' + tdcInnerColumnHandlerUI._handlerText + '</div>' );
            tdcMaskUI.$wrapper.append( tdcInnerColumnHandlerUI._$handler );


            // Define the events the handler will respond to

            tdcInnerColumnHandlerUI._$handler.mousedown( function( event ) {

                // Send the event to its 'tdc-inner-column' element
                tdcInnerColumnHandlerUI._triggerEvent( event );

            }).mouseup( function() {

                // Send the event to its 'tdc-inner-column' element
                tdcInnerColumnHandlerUI._triggerEvent( event );

            }).mousemove( function( event ) {

                // Send the event to its 'tdc-inner-column' element
                tdcInnerColumnHandlerUI._triggerEvent( event );
                tdcMaskUI.show();

            }).mouseenter(function( event ) {

                // Send the event to its 'tdc-inner-column' element
                tdcInnerColumnHandlerUI._triggerEvent( event );
                tdcMaskUI.show();

            }).mouseleave( function( event ) {

                // Send the event to its 'tdc-inner-column' element
                tdcInnerColumnHandlerUI._triggerEvent( event );

            });



            // The final step of initialization is to add the handler object to the mask handlers and to mark it has initialized

            // Add the handler and its id to the mask handlers
            tdcMaskUI.addHandler( tdcInnerColumnHandlerUI._handlerId, tdcInnerColumnHandlerUI );


            // The handler is initialized here
            tdcInnerColumnHandlerUI._isInitialized = true;
        },


        /**
         * Set the element ( 'tdc-inner-column' ) where this handler will send its proper events
         *
         * @param $element
         */
        setElement: function( $element ) {

            var $elementInnerColumn = $element.closest( '.' + tdcInnerColumnHandlerUI._elementCssClass );
            if ( $elementInnerColumn.length ) {
                tdcInnerColumnHandlerUI.$elementInnerColumn = $elementInnerColumn;
                tdcInnerColumnHandlerUI._$handler.show();
            } else {
                tdcInnerColumnHandlerUI._$handler.hide();
            }
        },


        /**
         * Trigger the event to its element ( 'tdc-inner-column' )
         *
         * @param event
         * @private
         */
        _triggerEvent: function( event ) {

            if ( ! _.isUndefined( tdcInnerColumnHandlerUI.$elementInnerColumn ) ) {
                tdcInnerColumnHandlerUI.$elementInnerColumn.trigger( event );
            }
        }

    };

})( jQuery, Backbone, _ );
