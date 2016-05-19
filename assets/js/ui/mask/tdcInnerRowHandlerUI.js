/**
 * Created by tagdiv on 28.03.2016.
 */

/* global jQuery:{} */
/* global Backbone:{} */
/* global _:{} */

/* global tdcMaskUI:{} */
/* global tdcSidebar:{} */


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
        //_elementCssClass: 'tdc-inner-row',
        _elementCssClass: 'tdc-element-inner-row',

        //_handlerId: tdcInnerColumnHandlerUI._elementCssClass,
        //_handlerId: 'tdc-inner-row',
        _handlerId: 'tdc-element-inner-row',

        // Handler text
        _handlerText: 'Inner Row',

        // Handler css class
        _handlerCssClass: 'tdc-mask-inner-row',




        // Handler element
        $elementInnerRow: undefined,

        _$handlerWrapper: undefined,

        // Handler jquery object
        _$handlerDrag: undefined,

        _$handlerEdit: undefined,

        // Initialization flag
        _isInitialized: false,




        init: function() {

            // Do nothing if it's already initialized
            if ( tdcInnerRowHandlerUI._isInitialized ) {
                return;
            }

            // Create the handler jquery object and append it to the mask wrapper
            var $handlerWrapper = jQuery( '<div id="' + tdcInnerRowHandlerUI._handlerCssClass + '"></div>'),
                $handlerDrag = jQuery( '<div class="tdc-mask-handler-drag">&#10021;&nbsp;' + tdcInnerRowHandlerUI._handlerText + '</div>' ),
                $handlerEdit = jQuery( '<div class="tdc-mask-handler-edit">&#10000;</div>' );

            $handlerWrapper.append( $handlerDrag );
            $handlerWrapper.append( $handlerEdit );

            tdcInnerRowHandlerUI._$handlerDrag = $handlerDrag;
            tdcInnerRowHandlerUI._$handlerEdit = $handlerEdit;
            tdcInnerRowHandlerUI._$handlerWrapper = $handlerWrapper;

            tdcMaskUI.$handler.append( $handlerWrapper );



            // Define the events the $_handlerDrag object will respond to

            tdcInnerRowHandlerUI._$handlerDrag.mousedown( function( event ) {

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



            // Define the events the _$handlerEdit object will respond to

            tdcInnerRowHandlerUI._$handlerEdit.click( function( event ) {

                event.preventDefault();
                tdcInnerRowHandlerUI._triggerEvent( event );

            }).mousemove( function( event ) {

                event.preventDefault();
                tdcMaskUI.show();

            }).mouseenter(function( event ) {

                event.preventDefault();
                tdcMaskUI.show();
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

            var $elementInnerRow = tdcInnerRowHandlerUI.inInnerRow( $element );

            if ( ! _.isUndefined( $elementInnerRow ) ) {
                tdcInnerRowHandlerUI.$elementInnerRow = $elementInnerRow;
                tdcInnerRowHandlerUI._$handlerWrapper.show();
            } else {
                tdcInnerRowHandlerUI._$handlerWrapper.hide();
            }
        },


        /**
         * Check the $element param is child of an inner row. If it is, return the inner row
         *
         * @param $element
         * @returns {*}
         */
        inInnerRow: function( $element ) {
            var $elementInnerRow = $element.closest( '.' + tdcInnerRowHandlerUI._elementCssClass );
            if ( $elementInnerRow.length ) {
                return $elementInnerRow;
            }
        },


        /**
         * Check the $element is inner row
         *
         * @param $element
         * @returns {*}
         */
        isInnerRow: function( $element ) {
            return $element.hasClass( tdcInnerRowHandlerUI._elementCssClass );
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