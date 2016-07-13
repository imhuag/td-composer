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
*   - it has a reference to the 'tdc-inner-column' jquery object
*   - it registers to the mask as handler
*/

var tdcInnerColumnHandlerUI;

(function( jQuery, backbone, _, undefined ) {

    'use strict';

    tdcInnerColumnHandlerUI = {

        //_handlerId: tdcInnerColumnHandlerUI._elementCssClass,
        _handlerId: 'tdc-inner-column',

        // Handler text
        _handlerText: 'Inner Column',

        // Handler css class
        _handlerCssClass: 'tdc-mask-inner-column',




        // Handler element
        $elementInnerColumn: undefined,

        // Handler jquery object
        _$handlerWrapper: undefined,

        // Initialization flag
        _isInitialized: false,




        init: function( forceReinitialization ) {

            if ( ! _.isUndefined( forceReinitialization ) && true === forceReinitialization ) {
                tdcInnerColumnHandlerUI._isInitialized = false;
            }

            // Do nothing if it's already initialized
            if ( tdcInnerColumnHandlerUI._isInitialized ) {
                return;
            }

            var handlerHtml =
                '<div id="' + tdcInnerColumnHandlerUI._handlerCssClass + '">' +
                    '<div class="tdc-mask-arrow-horizontal"></div>' +
                    '<div class="tdc-mask-handler-drag">' + tdcInnerColumnHandlerUI._handlerText + '</div>' +
                    '<div class="tdc-mask-edit">' +
                        '<div class="tdc-icon-edit"></div>' +
                    '</div>' +
                '</div>',

            // Create the handler jquery object and append it to the mask wrapper
                $handlerWrapper = jQuery( handlerHtml );

            tdcInnerColumnHandlerUI._$handlerWrapper = $handlerWrapper;

            tdcMaskUI.$handler.append( $handlerWrapper );



            // Define the events the $_handlerDrag object will respond to

            tdcInnerColumnHandlerUI._$handlerWrapper.mousedown( function( event ) {

                // Consider only the left button
                if ( 1 !== event.which ) {
                    return;
                }

                // Send the event to its 'tdc-inner-column' element
                tdcInnerColumnHandlerUI._triggerEvent( event );

            }).mouseup( function() {

                // Send the event to its 'tdc-inner-column' element
                tdcInnerColumnHandlerUI._triggerEvent( event );

            }).mousemove( function( event ) {

                // Send the event to its 'tdc-inner-column' element
                tdcMaskUI.show();
                tdcInnerColumnHandlerUI._triggerEvent( event );

            }).mouseenter(function( event ) {

                // Send the event to its 'tdc-inner-column' element
                tdcMaskUI.show();
                tdcInnerColumnHandlerUI._triggerEvent( event );

            }).mouseleave( function( event ) {

                // Send the event to its 'tdc-inner-column' element
                tdcInnerColumnHandlerUI._triggerEvent( event );
            });



            // Define the events for _$handlerWrapper
            // Show/hide the mask when the header mask is wider than the element

            tdcInnerColumnHandlerUI._$handlerWrapper.mouseenter(function( event ) {

                event.preventDefault();
                tdcMaskUI.setCurrentContainer( tdcInnerColumnHandlerUI.$elementInnerColumn );
                tdcMaskUI.show();

            }).mouseleave( function( event ) {

                event.preventDefault();
                tdcMaskUI.setCurrentContainer( undefined );
                tdcMaskUI.hide();
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

            var $elementInnerColumn = tdcOperationUI.inInnerColumn( $element );

            if ( ! _.isUndefined( $elementInnerColumn ) ) {
                tdcInnerColumnHandlerUI.$elementInnerColumn = $elementInnerColumn;
                tdcInnerColumnHandlerUI._$handlerWrapper.show();
            } else {
                tdcInnerColumnHandlerUI._$handlerWrapper.hide();
            }
        },


        /**
         * Trigger the event to its element ( 'tdc-inner-column' )
         *
         * @param event
         * @private
         */
        _triggerEvent: function( event ) {

            if ( ! _.isUndefined( event ) && ! _.isUndefined( tdcInnerColumnHandlerUI.$elementInnerColumn ) ) {
                tdcInnerColumnHandlerUI.$elementInnerColumn.trigger( event );
            }
        }

    };

})( jQuery, Backbone, _ );
