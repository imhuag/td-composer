/**
 * Created by ra on 3/23/2016.
 */

/* global jQuery:{} */
/* global Backbone:{} */
/* global _:{} */

var tdcSidebar;

(function( jQuery, _, undefined ) {

    'use strict';

    tdcSidebar = {

        $editRow: undefined,
        $editColumn: undefined,
        $editInnerRow: undefined,
        $editInnerColumn: undefined,

        // Current model of the CLICKED element (_$currentElement, _$currentRow, _$currentColumn, _$currentInnerRow OR _$currentInnerColumn)
        _currentModel: undefined,

        _$currentElement: undefined,

        _$currentRow: undefined,
        _$currentColumn: undefined,
        _$currentInnerRow: undefined,
        _$currentInnerColumn: undefined,

        $currentElementHead: undefined,
        $inspector: undefined,




        init: function() {

            tdcSidebar.$editRow = jQuery( '#tdc-breadcrumb-row' );
            tdcSidebar.$editRow.data( 'name', 'Row' );

            tdcSidebar.$editColumn = jQuery( '#tdc-breadcrumb-column' );
            tdcSidebar.$editColumn.data( 'name', 'Column' );

            tdcSidebar.$editInnerRow = jQuery( '#tdc-breadcrumb-inner-row' );
            tdcSidebar.$editInnerRow.data( 'name', 'Inner Row' );

            tdcSidebar.$editInnerColumn = jQuery( '#tdc-breadcrumb-inner-column' );
            tdcSidebar.$editInnerColumn.data( 'name', 'Inner Column' );

            tdcSidebar.$currentElementHead = jQuery( '.tdc-current-element-head' );
            tdcSidebar.$inspector = jQuery( '.tdc-inspector' );


            tdcSidebar.$editRow.click(function() {

                tdcSidebar.setSettings({
                    '$currentRow': tdcSidebar.getCurrentRow()
                });

            }).mouseenter(function( event ) {

                if ( ! _.isUndefined( tdcSidebar._$currentElement ) ) {
                    tdcMaskUI.setCurrentElement( tdcSidebar._$currentElement );
                    tdcMaskUI.$wrapper.hide();
                }

                if ( ! _.isUndefined( tdcSidebar._$currentRow ) ) {
                    tdcMaskUI.setCurrentContainer( tdcSidebar._$currentRow );
                }

            }).mouseleave(function( event ) {
                tdcMaskUI.hide();
            });


            tdcSidebar.$editColumn.click(function() {

                tdcSidebar.setSettings({
                    '$currentRow': tdcSidebar.getCurrentRow(),
                    '$currentColumn': tdcSidebar.getCurrentColumn()
                });

            }).mouseenter(function( event ) {

                if ( ! _.isUndefined( tdcSidebar._$currentElement ) ) {
                    tdcMaskUI.setCurrentElement( tdcSidebar._$currentElement );
                    tdcMaskUI.$wrapper.hide();
                }

                if ( ! _.isUndefined( tdcSidebar._$currentColumn ) ) {
                    tdcMaskUI.setCurrentContainer( tdcSidebar._$currentColumn );
                }

            }).mouseleave(function( event ) {
                tdcMaskUI.hide();
            });


            tdcSidebar.$editInnerRow.click(function() {

                tdcSidebar.setSettings({
                    '$currentRow': tdcSidebar.getCurrentRow(),
                    '$currentColumn': tdcSidebar.getCurrentColumn(),
                    '$currentInnerRow': tdcSidebar.getCurrentInnerRow()
                });

            }).mouseenter(function( event ) {

                if ( ! _.isUndefined( tdcSidebar._$currentElement ) ) {
                    tdcMaskUI.setCurrentElement( tdcSidebar._$currentElement );
                    tdcMaskUI.$wrapper.hide();
                }

                if ( ! _.isUndefined( tdcSidebar._$currentInnerRow ) ) {
                    tdcMaskUI.setCurrentContainer( tdcSidebar._$currentInnerRow );
                }

            }).mouseleave(function( event ) {
                tdcMaskUI.hide();
            });


            tdcSidebar.$editInnerColumn.click(function() {

                tdcSidebar.setSettings({
                    '$currentRow': tdcSidebar.getCurrentRow(),
                    '$currentColumn': tdcSidebar.getCurrentColumn(),
                    '$currentInnerRow': tdcSidebar.getCurrentInnerRow(),
                    '$currentInnerColumn': tdcSidebar.getCurrentInnerColumn()
                });

            }).mouseenter(function( event ) {

                if ( ! _.isUndefined( tdcSidebar._$currentElement ) ) {
                    tdcMaskUI.setCurrentElement( tdcSidebar._$currentElement );
                    tdcMaskUI.$wrapper.hide();
                }

                if ( ! _.isUndefined( tdcSidebar._$currentInnerColumn ) ) {
                    tdcMaskUI.setCurrentContainer( tdcSidebar._$currentInnerColumn );
                }

            }).mouseleave(function( event ) {
                tdcMaskUI.hide();
            });


            jQuery( '.tdc-sidebar-element').each(function( index, element ) {
                tdcSidebar._bindElement( jQuery( element ) );
            });


            tdcSidebar._sidebarModal();
            tdcSidebar._liveInspectorTabs();
        },


        /**
         * Activate/deactivate the breadcrumb items and set the sidebar current element info
         *
         * @private
         */
        _activeBreadcrumbItem: function() {

            var currentModel = tdcSidebar.getCurrentModel(),
                currentModelTag = currentModel.get( 'tag' ),

            // The html content of the $currentElementHead element
                currentElementHeadContent = '',

            // The breadcrumb item (tdcSidebar.$editRow, tdcSidebar.$editColumn, .. ) where the mouse events will be passed
                $currentElementHeadRef;

            switch ( currentModelTag ) {

                case 'vc_row':
                    tdcSidebar.$editRow.hide();
                    tdcSidebar.$editColumn.hide();
                    tdcSidebar.$editInnerRow.hide();
                    tdcSidebar.$editInnerColumn.hide();

                    currentElementHeadContent = tdcSidebar.$editRow.data( 'name' );
                    $currentElementHeadRef = tdcSidebar.$editRow;

                    break;

                case 'vc_column':
                    tdcSidebar.$editRow.show();
                    tdcSidebar.$editColumn.hide();
                    tdcSidebar.$editInnerRow.hide();
                    tdcSidebar.$editInnerColumn.hide();

                    currentElementHeadContent = tdcSidebar.$editColumn.data( 'name' );
                    $currentElementHeadRef = tdcSidebar.$editColumn;

                    break;

                case 'vc_row_inner':
                    tdcSidebar.$editRow.show();
                    tdcSidebar.$editColumn.show();
                    tdcSidebar.$editInnerRow.hide();
                    tdcSidebar.$editInnerColumn.hide();

                    currentElementHeadContent = tdcSidebar.$editInnerRow.data( 'name' );
                    $currentElementHeadRef = tdcSidebar.$editInnerRow;

                    break;

                case 'vc_column_inner':
                    tdcSidebar.$editRow.show();
                    tdcSidebar.$editColumn.show();
                    tdcSidebar.$editInnerRow.show();
                    tdcSidebar.$editInnerColumn.hide();

                    currentElementHeadContent = tdcSidebar.$editInnerColumn.data( 'name' );
                    $currentElementHeadRef = tdcSidebar.$editInnerColumn;

                    break;

                default:
                    tdcSidebar.$editRow.show();
                    tdcSidebar.$editColumn.show();

                    currentElementHeadContent = currentModel.get( 'tag' );
                    $currentElementHeadRef = tdcSidebar.getCurrentElement();

                    var parentModel = currentModel.get( 'parentModel' ),
                        parentModelTag = parentModel.get( 'tag' );

                    if ( 'vc_column_inner' === parentModelTag ) {
                        tdcSidebar.$editInnerRow.show();
                        tdcSidebar.$editInnerColumn.show();
                    } else {
                        tdcSidebar.$editInnerRow.hide();
                        tdcSidebar.$editInnerColumn.hide();
                    }
            }

            // Set the content and reattach the events ('mouseenter' and 'mouseleave') to the tdcSidebar.$currentElementHead
            tdcSidebar.$currentElementHead.html( currentElementHeadContent );

            tdcSidebar.$currentElementHead.off().mouseenter(function( event ) {
                event.preventDefault();
                $currentElementHeadRef.trigger( event );

            }).mouseleave(function( event ) {
                event.preventDefault();
                $currentElementHeadRef.trigger( event );
            });

            tdcSidebar.$inspector.show();
        },


        /**
         * Close the modal sidebar container.
         *
         * @private
         */
        _closeModal: function() {
            jQuery( '.tdc-sidebar-modal-elements' ).removeClass( 'tdc-modal-open' );
        },


        /**
         * Add events to '.tdc-add-element' and '.tdc-modal-close' elements.
         * @todo Being private and used only by tdcSidebar.init, it can be moved there.
         *
         * @private
         */
        _sidebarModal: function () {
            // Sidebar elements modal window - open
            jQuery( '.tdc-add-element' ).click( function(){
                jQuery( '.tdc-sidebar-modal-elements' ).addClass( 'tdc-modal-open' );
            });

            // Sidebar elements modal window - close
            jQuery( '.tdc-modal-close' ).click( function(){
                jQuery( '.tdc-sidebar-modal-elements' ).removeClass( 'tdc-modal-open' );
            });

        },


        /**
         * Bind every '.tdc-sidebar-element' element of the sidebar.
         * @todo Being private and used only by tdcSidebar.init, it can be moved there.
         *
         * @param $element
         * @private
         */
        _bindElement: function( $element ) {

            $element.click(function( event ) {
                //tdcDebug.log( 'click sidebar element' );

                event.preventDefault();

            }).mousedown(function( event ) {
                //tdcDebug.log( 'sidebar element mouse down' );

                // Consider only the left button
                if ( 1 !== event.which ) {
                    return;
                }

                if ( 'td_block_homepage_full_1' === $element.data( 'shortcode-name' ) ) {
                    var model = tdcIFrameData.getFirstModelByTag( 'td_block_homepage_full_1' );

                    if ( ! _.isUndefined( model ) ) {

                        // @todo The message should be moved to the tdc message system
                        alert( 'td_block_homepage_full_1 este deja in pagina' );
                        return;
                    }
                }

                event.preventDefault();

                tdcOperationUI.activeDraggedElement( $element );
                tdcOperationUI.showHelper( event );

            }).mouseup(function( event ) {

                // Respond only if dragged element is 'tdc-sidebar-element'
                if ( tdcOperationUI.isSidebarElementDragged() ) {

                    //tdcDebug.log( 'sidebar element mouse up' );
                    event.preventDefault();

                    tdcOperationUI.deactiveDraggedElement();
                    tdcOperationUI.hideHelper();
                }
            });
        },


        /**
         *
         * @private
         */
        _liveInspectorTabs: function () {

            jQuery( 'body' ).on( 'click', '.tdc-tabs a', function() {

                if (jQuery(this).hasClass('tdc-tab-active') === true) {
                    return;
                }


                // the tab
                jQuery('.tdc-tabs a').removeClass('tdc-tab-active');
                jQuery(this).addClass('tdc-tab-active');


                // content - remove all visible classes
                jQuery('.tdc-tab-content-wrap .tdc-tab-content').removeClass( 'tdc-tab-content-visible' );

                // add the class to the good content
                var tabContentId = jQuery(this).data('tab-id');
                jQuery('#' + tabContentId).addClass('tdc-tab-content-visible');
            });
        },



        _setCurrentElement: function( $currentElement ) {
            tdcSidebar._$currentElement = $currentElement;
        },
        getCurrentElement: function() {
            return tdcSidebar._$currentElement;
        },


        _setCurrentRow: function( $currentRow ) {
            tdcSidebar._$currentRow = $currentRow;
        },
        getCurrentRow: function() {
            return tdcSidebar._$currentRow;
        },


        _setCurrentColumn: function( $currentColumn ) {
            tdcSidebar._$currentColumn = $currentColumn;
        },
        getCurrentColumn: function() {
            return tdcSidebar._$currentColumn;
        },


        _setCurrentInnerRow: function( $currentInnerRow ) {
            tdcSidebar._$currentInnerRow = $currentInnerRow;
        },
        getCurrentInnerRow: function() {
            return tdcSidebar._$currentInnerRow;
        },


        _setCurrentInnerColumn: function( $currentInnerColumn ) {
            tdcSidebar._$currentInnerColumn = $currentInnerColumn;
        },
        getCurrentInnerColumn: function() {
            return tdcSidebar._$currentInnerColumn;
        },


        /**
         * Get the current model.
         * Important! There's no setCurrentModel function. The current model is set only by the setSettings()
         *
         * @returns {*}
         */
        getCurrentModel: function() {
            return tdcSidebar._currentModel;
        },



        /**
         * The entry point.
         * From now, all sidebar necessary elements (current row, current column, etc) are ready.
         *
         * @param settings - plain object
         */
        setSettings: function( settings ) {

            if ( ! _.isUndefined( settings ) ) {

                if ( _.has( settings, '$currentRow' ) && ! _.isUndefined( settings.$currentRow ) ) {

                    tdcSidebar._setCurrentRow( settings.$currentRow );

                    if ( _.has( settings, '$currentColumn' ) && ! _.isUndefined( settings.$currentColumn ) ) {
                        tdcSidebar._setCurrentColumn( settings.$currentColumn );

                        if ( _.has( settings, '$currentInnerRow' ) && ! _.isUndefined( settings.$currentInnerRow ) ) {
                            tdcSidebar._setCurrentInnerRow( settings.$currentInnerRow );

                            if ( _.has( settings, '$currentInnerColumn' ) && ! _.isUndefined( settings.$currentInnerColumn ) ) {
                                tdcSidebar._setCurrentInnerColumn( settings.$currentInnerColumn );

                                if ( _.has( settings, '$currentElement' ) && ! _.isUndefined( settings.$currentElement ) ) {
                                    tdcSidebar._setCurrentElement( settings.$currentElement );

                                    // Get the model of the element
                                    tdcSidebar._currentModel = tdcIFrameData.getModel( settings.$currentElement.data( 'model_id' ) );

                                } else {
                                    tdcSidebar._setCurrentElement( undefined );

                                    // Get the model of the inner column
                                    tdcSidebar._currentModel = tdcIFrameData.getModel( settings.$currentInnerColumn.data( 'model_id' ) );
                                }
                            } else {
                                tdcSidebar._setCurrentInnerColumn( undefined );
                                tdcSidebar._setCurrentElement( undefined );

                                // Get the model of the inner row
                                tdcSidebar._currentModel = tdcIFrameData.getModel( settings.$currentInnerRow.data( 'model_id' ) );
                            }
                        } else {
                            tdcSidebar._setCurrentInnerRow( undefined );
                            tdcSidebar._setCurrentInnerColumn( undefined );

                            if ( _.has( settings, '$currentElement' ) && ! _.isUndefined( settings.$currentElement ) ) {
                                tdcSidebar._setCurrentElement( settings.$currentElement );

                                // Get the model of the element
                                tdcSidebar._currentModel = tdcIFrameData.getModel( settings.$currentElement.data( 'model_id' ) );

                            } else {
                                tdcSidebar._setCurrentElement( undefined );

                                // Get the model of the column
                                tdcSidebar._currentModel = tdcIFrameData.getModel( settings.$currentColumn.data( 'model_id' ) );
                            }
                        }
                    } else {
                        tdcSidebar._setCurrentColumn( undefined );
                        tdcSidebar._setCurrentInnerRow( undefined );
                        tdcSidebar._setCurrentInnerColumn( undefined );
                        tdcSidebar._setCurrentElement( undefined );

                        // Get the model of the row
                        tdcSidebar._currentModel = tdcIFrameData.getModel( settings.$currentRow.data( 'model_id' ) );
                    }
                }

            } else {
                tdcSidebar._setCurrentRow( undefined );
                tdcSidebar._setCurrentColumn( undefined );
                tdcSidebar._setCurrentInnerRow( undefined );
                tdcSidebar._setCurrentInnerColumn( undefined );
                tdcSidebar._setCurrentElement( undefined );

                // Undefined current model
                tdcSidebar._currentModel = undefined;
            }


            // Add custom code here!

            if ( !_.isUndefined( tdcSidebar._currentModel ) ) {
                tdcSidebarPanel.bindPanelToModel( tdcSidebar._currentModel );

                tdcSidebar._activeBreadcrumbItem();

                // Close the sidebar modal 'Add Elements'
                tdcSidebar._closeModal();
            }
        }

    };

    tdcSidebar.init();

})( jQuery, _ );