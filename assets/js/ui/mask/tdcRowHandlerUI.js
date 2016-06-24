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
 *   - it creates the handler jquery object for 'tc-row'
 *   - it has a reference to the 'tdc-row' jquery object
 *   - it registers to the mask as handler
 */

var tdcRowHandlerUI;

(function( jQuery, backbone, _, undefined ) {

    'use strict';

    tdcRowHandlerUI = {

        //_handlerId: tdcInnerColumnHandlerUI._elementCssClass,
        _handlerId: 'tdc-row',

        // Handler text
        _handlerText: 'Row',

        // Handler css class
        _handlerCssClass: 'tdc-mask-row',



        // Handler element
        $elementRow: undefined,

        // Handler jquery object
        _$handlerWrapper: undefined,

        // Initialization flag
        _isInitialized: false,




        init: function() {

            // Do nothing if it's already initialized
            if ( tdcRowHandlerUI._isInitialized ) {
                return;
            }

            var handleHtml =
                '<div id="' + tdcRowHandlerUI._handlerCssClass + '">' +
                    '<div class="tdc-mask-arrow-vertical"></div>' +
                    '<div class="tdc-mask-handler-drag">' + tdcRowHandlerUI._handlerText + '</div>' +
                    '<div class="tdc-mask-edit">' +
                        '<div class="tdc-icon-edit"></div>' +
                    '</div>' +
                '</div>',

            // Create the handler jquery object and append it to the mask wrapper
                $handlerWrapper = jQuery( handleHtml );

            tdcRowHandlerUI._$handlerWrapper = $handlerWrapper;

            tdcMaskUI.$handler.append( $handlerWrapper );



            // Define the events the $_handlerDrag object will respond to

            tdcRowHandlerUI._$handlerWrapper.mousedown( function( event ) {

                // Consider only the left button
                if ( 1 !== event.which ) {
                    return;
                }

                // Send the event to its 'tdc-row' element
                tdcRowHandlerUI._triggerEvent( event );

            }).mouseup( function() {

                // Send the event to its 'tdc-row' element
                tdcRowHandlerUI._triggerEvent( event );

            }).mousemove( function( event ) {

                // Send the event to its 'tdc-row' element
                tdcMaskUI.show();
                tdcRowHandlerUI._triggerEvent( event );

            }).mouseenter(function( event ) {

                // Send the event to its 'tdc-row' element
                tdcMaskUI.show();
                tdcRowHandlerUI._triggerEvent( event );

            }).mouseleave( function( event ) {

                // Send the event to its 'tdc-row' element
                tdcRowHandlerUI._triggerEvent( event );

            });



            // Define the events for _$handlerWrapper
            // Show/hide the mask when the header mask is wider than the element

            tdcRowHandlerUI._$handlerWrapper.mouseenter(function( event ) {

                event.preventDefault();
                tdcMaskUI.setCurrentContainer( tdcRowHandlerUI.$elementRow );
                tdcMaskUI.show();

            }).mouseleave( function( event ) {

                event.preventDefault();
                tdcMaskUI.setCurrentContainer( undefined );
                tdcMaskUI.hide();
            });



            // The final step of initialization is to add the handler object to the mask handlers and to mark it has initialized

            // Add the handler and its id to the mask handlers
            tdcMaskUI.addHandler( tdcRowHandlerUI._handlerId, tdcRowHandlerUI );

            // The handler is initialized here
            tdcRowHandlerUI._isInitialized = true;
        },


        /**
         * Set the element ( 'tdc-row' ) where this handler will send its proper events
         *
         * @param $element
         */
        setElement: function( $element ) {

            var $elementRow = tdcOperationUI.inRow( $element );

            if ( ! _.isUndefined( $elementRow ) ) {
                tdcRowHandlerUI.$elementRow = $elementRow;
                tdcRowHandlerUI._$handlerWrapper.show();
            } else {
                tdcRowHandlerUI._$handlerWrapper.hide();
            }
        },


        /**
         * Trigger the event to its element ( 'tdc-row' )
         *
         * @param event
         * @private
         */
        _triggerEvent: function( event ) {

            if ( ! _.isUndefined( event ) && ! _.isUndefined( tdcRowHandlerUI.$elementRow ) ) {
                tdcRowHandlerUI.$elementRow.trigger( event );
            }
        }

    };

})( jQuery, Backbone, _ );