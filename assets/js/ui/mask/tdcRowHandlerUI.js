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

        // Wrapper Handler jquery object
        _$handlerWrapper: undefined,

        // Clone Handler jquery object
        _$handlerClone: undefined,

        // Initialization flag
        _isInitialized: false,




        init: function( forceReinitialization ) {

            if ( ! _.isUndefined( forceReinitialization ) && true === forceReinitialization ) {
                tdcRowHandlerUI._isInitialized = false;
            }

            // Do nothing if it's already initialized
            if ( tdcRowHandlerUI._isInitialized ) {
                return;
            }

            var handlerHtml =
                '<div id="' + tdcRowHandlerUI._handlerCssClass + '">' +
                    '<div class="tdc-mask-arrow-vertical"></div>' +
                    '<div class="tdc-mask-handler-drag">' + tdcRowHandlerUI._handlerText + '</div>' +
                '</div>';

            // Create the handler jquery object and append it to the mask wrapper
            tdcRowHandlerUI._$handlerWrapper = jQuery( handlerHtml );

            tdcRowHandlerUI._$handlerClone = jQuery( '<div class="tdc-mask-clone"></div>' );

            tdcRowHandlerUI._$handlerWrapper.append( tdcRowHandlerUI._$handlerClone );
            tdcMaskUI.$handlerStructure.append( tdcRowHandlerUI._$handlerWrapper );


            // Define the events the $_handlerDrag object will respond to

            tdcRowHandlerUI._$handlerWrapper.mousedown( function( event ) {

                // Consider only the left button
                if ( 1 !== event.which ) {
                    return;
                }

                // Send the event to its 'tdc-row' element
                tdcRowHandlerUI._triggerEvent( event );

            }).mouseup( function( event ) {

                // Send the event to its 'tdc-row' element
                tdcRowHandlerUI._triggerEvent( event );

            }).mousemove( function( event ) {

                // Send the event to its 'tdc-row' element
                tdcMaskUI.show();
                tdcRowHandlerUI._triggerEvent( event );

            }).mouseenter(function( event ) {

                // Define the events for _$handlerWrapper
                // Show/hide the mask when the header mask is wider than the element
                event.preventDefault();
                tdcMaskUI.setCurrentContainer( tdcRowHandlerUI.$elementRow );
                tdcMaskUI.show();

            }).mouseleave( function( event ) {

                // Define the events for _$handlerWrapper
                // Show/hide the mask when the header mask is wider than the element
                event.preventDefault();
                tdcMaskUI.setCurrentContainer( undefined );
                tdcMaskUI.hide();

            });



            tdcRowHandlerUI._$handlerClone.mousedown( function( event ) {
                // Consider only the left button
                if ( 1 !== event.which ) {
                    return;
                }

                event.preventDefault();
                event.stopPropagation();

                var rowModelId = tdcRowHandlerUI.$elementRow.data( 'model_id');

                // @todo This check should be removed - the content should have consistency
                if ( _.isUndefined( rowModelId ) ) {
                    new tdcNotice.notice( 'tdcRowHandlerUI -> tdcRowHandlerUI._$handlerClone Error: Element model id is not in $draggedElement data!', true, false );
                    return;
                }

                var rowModel = tdcIFrameData.getModel( rowModelId );

                // @todo This check should be removed - the content should have consistency
                if ( _.isUndefined(rowModel ) ) {
                    new tdcNotice.notice( 'tdcRowHandlerUI -> tdcRowHandlerUI._$handlerClone Error: Element model not in structure data!', true, false );
                    return;
                }

                // New sibling model for the element model

                // Insert the cloned element after the current element
                tdcOperationUI.setDraggedElement( jQuery( '<div class="tdc-row">Cloned row</div>' ) );
                var $draggedElement = tdcOperationUI.getDraggedElement();

                $draggedElement.insertAfter( tdcRowHandlerUI.$elementRow );
                tdcRowUI.bindRow( $draggedElement );

                var newPosition = $draggedElement.prevAll().length;


                // Define the row model
                var cloneRowModel = new tdcIFrameData.TdcModel({
                        'content': '',
                        'attrs': {},
                        'tag': 'vc_row',
                        'type': 'closed',
                        'level': 0,
                        'parentModel': undefined
                    }),

                // Define the row liveView
                    cloneRowView = new tdcIFrameData.TdcLiveView({
                        model: cloneRowModel,
                        el: $draggedElement[0]
                    }),

                // Define the column model
                    cloneColumnModel = new tdcIFrameData.TdcModel({
                        'content': '',
                        'attrs': {},
                        'tag': 'vc_column',
                        'type': 'closed',
                        'level': 1,
                        'parentModel': cloneRowModel
                    });

                // Set the data model id to the liveView jquery element
                $draggedElement.data( 'model_id', cloneRowModel.cid );

                tdcIFrameData.tdcRows.add( cloneRowModel, { at: newPosition } );

                var childCollectionRow = new tdcIFrameData.TdcCollection();
                childCollectionRow.add( cloneColumnModel );
                cloneRowModel.set( 'childCollection', childCollectionRow );

                var childCollectionColumn = new tdcIFrameData.TdcCollection();
                cloneColumnModel.set( 'childCollection', childCollectionColumn );

                // Get the shortcode rendered
                cloneRowModel.getShortcodeRender( 1, '', true, rowModel );

                tdcOperationUI.setDraggedElement( undefined );
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