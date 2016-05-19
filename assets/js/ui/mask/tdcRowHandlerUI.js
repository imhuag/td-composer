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
 *   - it creates the handler jquery object for 'tc-row'
 *   - it has a reference to the 'tdc-row' jquery object
 *   - it registers to the mask as handler
 */

var tdcRowHandlerUI;

(function( jQuery, backbone, _, undefined ) {

    'use strict';

    tdcRowHandlerUI = {

        // The css class of the handler element
        _elementCssClass: 'tdc-row',

        //_handlerId: tdcInnerColumnHandlerUI._elementCssClass,
        _handlerId: 'tdc-row',

        // Handler text
        _handlerText: 'Row',

        // Handler css class
        _handlerCssClass: 'tdc-mask-row',



        // Handler element
        $elementRow: undefined,

        _$handlerWrapper: undefined,

        // Handler jquery object
        _$handlerDrag: undefined,

        _$handlerEdit: undefined,

        // Initialization flag
        _isInitialized: false,




        init: function() {

            // Do nothing if it's already initialized
            if ( tdcRowHandlerUI._isInitialized ) {
                return;
            }

            // Create the handler jquery object and append it to the mask wrapper
            var $handlerWrapper = jQuery( '<div id="' + tdcRowHandlerUI._handlerCssClass + '"></div>'),
                $handlerDrag = jQuery( '<div class="tdc-mask-handler-drag">&#10021;&nbsp;' + tdcRowHandlerUI._handlerText + '</div>' ),
                $handlerEdit = jQuery( '<div class="tdc-mask-handler-edit">&#10000;</div>' );

            $handlerWrapper.append( $handlerDrag );
            $handlerWrapper.append( $handlerEdit );

            tdcRowHandlerUI._$handlerDrag = $handlerDrag;
            tdcRowHandlerUI._$handlerEdit = $handlerEdit;
            tdcRowHandlerUI._$handlerWrapper = $handlerWrapper;

            tdcMaskUI.$handler.append( $handlerWrapper );



            // Define the events the $_handlerDrag object will respond to

            tdcRowHandlerUI._$handlerDrag.mousedown( function( event ) {

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
                tdcRowHandlerUI._triggerEvent( event );
                tdcMaskUI.show();

            }).mouseenter(function( event ) {

                // Send the event to its 'tdc-row' element
                tdcRowHandlerUI._triggerEvent( event );
                tdcMaskUI.show();

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



            // Define the events the _$handlerEdit object will respond to

            tdcRowHandlerUI._$handlerEdit.click( function( event ) {

                event.preventDefault();
                tdcRowHandlerUI._triggerEvent( event );

            }).mousemove( function( event ) {

                event.preventDefault();
                tdcMaskUI.show();

            }).mouseenter(function( event ) {

                event.preventDefault();
                tdcMaskUI.show();
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

            var $elementRow = tdcRowHandlerUI.inRow( $element );

            if ( ! _.isUndefined( $elementRow ) ) {
                tdcRowHandlerUI.$elementRow = $elementRow;
                tdcRowHandlerUI._$handlerWrapper.show();
            } else {
                tdcRowHandlerUI._$handlerWrapper.hide();
            }
        },


        ///**
        //* Set the row breadcrumb
        //*
        //* @param $element
        //*/
        //setBreadcrumb: function( $element ) {
        //    var $elementRow = tdcRowHandlerUI.inRow( $element );
        //
        //    if ( ! _.isUndefined( $elementRow ) || tdcRowHandlerUI.isRow( $element ) ) {
        //        tdcSidebar.activeBreadcrumbItem( tdcSidebar.$editRow, tdcRowHandlerUI.$elementRow );
        //        //tdcSidebar.setCurrentRow( tdcRowHandlerUI.$elementRow );
        //
        //        //tdcSidebar.setSettings({
        //        //    '$currentRow': tdcRowHandlerUI.$elementRow
        //        //});
        //    } else {
        //        //tdcSidebar.$editRow.hide();
        //        //tdcSidebar.setCurrentRow( undefined );
        //
        //        //tdcSidebar.setSettings();
        //    }
        //},


        /**
         * Check the $element param is child of a row. If it is, return the row
         *
         * @param $element
         * @returns {*}
         */
        inRow: function( $element ) {
            var $elementRow = $element.closest( '.' + tdcRowHandlerUI._elementCssClass );
            if ( $elementRow.length ) {
                return $elementRow;
            }
        },


        /**
         * Check the $element is row
         *
         * @param $element
         * @returns {*}
         */
        isRow: function( $element ) {
            return $element.hasClass( tdcRowHandlerUI._elementCssClass );
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