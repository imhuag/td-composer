/**
 * Created by ra on 3/23/2016.
 */

/* global tdcIFrameData:{} */
/* global tdcOperationUI:{} */
/* global tdcSidebarPanel:{} */
/* global tdcMaskUI:{} */
/* global tdcMain:{} */
/* global tdcNotice:{} */

/* global jQuery:{} */
/* global Backbone:{} */
/* global _:{} */

/* jshint -W004 */ // duplicate declarations
/* jshint -W031 */ // the 'new' side effect


var tdcSidebar;

(function( jQuery, _, undefined ) {

    'use strict';

    tdcSidebar = {

        $_sidebar: undefined,

        $_editRow: undefined,
        $_editColumn: undefined,
        $_editInnerRow: undefined,
        $_editInnerColumn: undefined,

        _currentTabId: undefined,

        // Current model of the CLICKED element (_$currentElement, _$currentRow, _$currentColumn, _$currentInnerRow OR _$currentInnerColumn)
        _currentModel: undefined,

        _$currentElement: undefined,

        _$currentRow: undefined,
        _$currentColumn: undefined,
        _$currentInnerRow: undefined,
        _$currentInnerColumn: undefined,

        $_currentElementHead: undefined,
        $_inspector: undefined,

        $_sidebarInfo: undefined,
        $_sidebarClosePage: undefined,
        $_sidebarBullet: undefined,
        $_sidebarClose: undefined,
        $_sidebarOpen: undefined,
        $_sidebarSearch: undefined,

        $_liveIframeWrapper: undefined,


        init: function() {

            tdcSidebar.$_sidebar = jQuery( '#tdc-sidebar' );
            tdcSidebar.$_liveIframeWrapper = jQuery( '#tdc-live-iframe-wrapper' );

            tdcSidebar.$_editRow = tdcSidebar.$_sidebar.find( '#tdc-breadcrumb-row' );
            tdcSidebar.$_editRow.data( 'name', 'Row' );

            tdcSidebar.$_editColumn = tdcSidebar.$_sidebar.find( '#tdc-breadcrumb-column' );
            tdcSidebar.$_editColumn.data( 'name', 'Column' );

            tdcSidebar.$_editInnerRow = tdcSidebar.$_sidebar.find( '#tdc-breadcrumb-inner-row' );
            tdcSidebar.$_editInnerRow.data( 'name', 'Inner Row' );

            tdcSidebar.$_editInnerColumn = tdcSidebar.$_sidebar.find( '#tdc-breadcrumb-inner-column' );
            tdcSidebar.$_editInnerColumn.data( 'name', 'Inner Column' );

            tdcSidebar.$_currentElementHead = tdcSidebar.$_sidebar.find( '.tdc-current-element-head:first' );
            tdcSidebar.$_inspector = tdcSidebar.$_sidebar.find( '.tdc-inspector:first' );

            tdcSidebar.$_sidebarInfo = tdcSidebar.$_sidebar.find( '.tdc-sidebar-info:first' );
            tdcSidebar.$_sidebarClosePage = tdcSidebar.$_sidebar.find( '.tdc-close-page:first' );
            tdcSidebar.$_sidebarBullet = tdcSidebar.$_sidebar.find( '.tdc-bullet:first' );
            tdcSidebar.$_sidebarClose = tdcSidebar.$_sidebar.find( '.tdc-sidebar-close:first' );
            tdcSidebar.$_sidebarOpen = tdcSidebar.$_sidebar.find( '.tdc-sidebar-open:first' );
            tdcSidebar.$_sidebarSearch = tdcSidebar.$_sidebar.find( '.tdc-sidebar-modal-search:first > input' );


            tdcSidebar.$_editRow.click(function() {

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


            tdcSidebar.$_editColumn.click(function() {

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


            tdcSidebar.$_editInnerRow.click(function() {

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


            tdcSidebar.$_editInnerColumn.click(function() {

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

            tdcSidebar.$_sidebarClosePage.click( function( event ) {
                if ( tdcMain.getContentModified() ) {
                    if ( true === window.confirm( 'The content is unsaved! Are you sure you want to close?' ) ) {
                        window.location = window.tdcAdminSettings.editPostUrl;
                    } else {
                       return;
                    }
                }

                if ( true === window.confirm( 'Are you sure you want to close?' ) ) {
                    window.location = window.tdcAdminSettings.editPostUrl;
                }
            });


            var localStorageSidebarHidden = window.localStorage.getItem( 'tdc_sidebar_hidden' );
            var localStorageLiveIframeWrapperInline = window.localStorage.getItem( 'tdc_live_iframe_wrapper_inline' );

            if ( '1' === localStorageSidebarHidden ) {

                tdcMain.setSidebarHidden();

                tdcSidebar.$_sidebar.addClass( 'tdc-sidebar-hidden' );
                tdcSidebar.$_sidebarOpen.addClass( 'tdc-sidebar-reopen' );
            }

            if ( '1' === localStorageLiveIframeWrapperInline ) {

                tdcMain.setSidebarInline();

                tdcSidebar.$_sidebar.addClass( 'tdc-sidebar-inline' );
                tdcSidebar.$_liveIframeWrapper
                    .addClass( 'tdc-live-iframe-wrapper-inline' )
                    .removeClass( 'tdc-live-iframe-wrapper-full' );

                if ( '1' === localStorageSidebarHidden ) {
                    tdcSidebar.$_liveIframeWrapper.removeClass( 'tdc-live-iframe-wrapper-inline' );
                }
            }


            tdcSidebar.$_sidebarBullet.click( function( event ) {
                tdcSidebar.$_sidebar.toggleClass( 'tdc-sidebar-inline' );
                tdcSidebar.$_liveIframeWrapper.toggleClass( 'tdc-live-iframe-wrapper-inline' );

                if ( tdcSidebar.$_liveIframeWrapper.hasClass( 'tdc-live-iframe-wrapper-inline' ) ) {
                    tdcSidebar.$_liveIframeWrapper.removeClass( 'tdc-live-iframe-wrapper-full' );

                    tdcMain.setSidebarInline();
                    window.localStorage.setItem( 'tdc_live_iframe_wrapper_inline', 1 );

                } else {
                    tdcSidebar.$_liveIframeWrapper.addClass( 'tdc-live-iframe-wrapper-full' );

                    tdcMain.resetSidebarInline();
                    window.localStorage.setItem( 'tdc_live_iframe_wrapper_inline', 0 );
                }
            });


            tdcSidebar.$_sidebarClose.click( function( event) {

                tdcSidebar.$_sidebar.addClass( 'tdc-sidebar-hidden' );
                tdcSidebar.$_sidebarOpen.addClass( 'tdc-sidebar-reopen' );

                if ( tdcSidebar.$_sidebar.hasClass( 'tdc-sidebar-inline' ) ) {
                    tdcSidebar.$_liveIframeWrapper.toggleClass( 'tdc-live-iframe-wrapper-inline' );
                }

                if ( tdcSidebar.$_sidebar.hasClass( 'tdc-sidebar-hidden' ) ) {

                    tdcSidebar.$_liveIframeWrapper.removeClass( 'tdc-live-iframe-wrapper-full' );

                } else if ( ! tdcSidebar.$_liveIframeWrapper.hasClass( 'tdc-live-iframe-wrapper-inline' ) ) {

                    tdcSidebar.$_liveIframeWrapper.addClass( 'tdc-live-iframe-wrapper-full' );
                }

                tdcMain.setSidebarHidden();
                window.localStorage.setItem( 'tdc_sidebar_hidden', 1 );
            });


            tdcSidebar.$_sidebarOpen.click( function( event) {

                tdcSidebar.$_sidebar.removeClass( 'tdc-sidebar-hidden' );
                tdcSidebar.$_sidebarOpen.removeClass( 'tdc-sidebar-reopen' );


                if ( tdcSidebar.$_sidebar.hasClass( 'tdc-sidebar-inline' ) ) {
                    tdcSidebar.$_liveIframeWrapper.toggleClass( 'tdc-live-iframe-wrapper-inline' );
                }

                if ( tdcSidebar.$_sidebar.hasClass( 'tdc-sidebar-hidden' ) ) {

                    tdcSidebar.$_liveIframeWrapper.removeClass( 'tdc-live-iframe-wrapper-full' );

                } else if ( ! tdcSidebar.$_liveIframeWrapper.hasClass( 'tdc-live-iframe-wrapper-inline' ) ) {

                    tdcSidebar.$_liveIframeWrapper.addClass( 'tdc-live-iframe-wrapper-full' );
                }

                tdcMain.resetSidebarHidden();
                window.localStorage.setItem( 'tdc_sidebar_hidden', 0 );
            });


            tdcSidebar.$_sidebarSearch.keyup( function( event ) {
                var $this = jQuery( this );

                jQuery( '.tdc-sidebar-element' ).each( function( index, element) {
                    var $element = jQuery( element );
                    if ( -1 === $element.find( '.tdc-element-id').html().toLowerCase().indexOf( $this.val().trim().toLowerCase() ) ) {
                        $element.hide();
                    } else {
                        $element.show();
                    }
                });
            });


            //tdcSidebar.$_inspector.on( 'click', '.tdc-responsive-desktop', function() {
            //    tdcSidebar.$_liveIframeWrapper
            //        .removeClass( 'tdc-responsive-tablet-landscape' )
            //        .removeClass( 'tdc-responsive-tablet-portrait' )
            //        .removeClass( 'tdc-responsive-phone' );
            //});
            //
            //tdcSidebar.$_inspector.on( 'click', '.tdc-responsive-tablet-landscape', function() {
            //    tdcSidebar.$_liveIframeWrapper
            //        .toggleClass( 'tdc-responsive-tablet-landscape' )
            //        .removeClass( 'tdc-responsive-phone' )
            //        .removeClass( 'tdc-responsive-tablet-portrait' );
            //});
            //
            //tdcSidebar.$_inspector.on( 'click', '.tdc-responsive-tablet-portrait', function() {
            //    tdcSidebar.$_liveIframeWrapper
            //        .toggleClass( 'tdc-responsive-tablet-portrait' )
            //        .removeClass( 'tdc-responsive-phone' )
            //        .removeClass( 'tdc-responsive-tablet-landscape' );
            //});
            //
            //tdcSidebar.$_inspector.on( 'click', '.tdc-responsive-phone', function() {
            //    tdcSidebar.$_liveIframeWrapper.
            //        toggleClass( 'tdc-responsive-phone' )
            //        .removeClass( 'tdc-responsive-tablet-landscape' )
            //        .removeClass( 'tdc-responsive-tablet-portrait' );
            //});


            // @todo This must be tested! Other solution must be found!
            jQuery( 'body').css( 'overflow', 'hidden');



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

            // The html content of the $_currentElementHead element
                currentElementHeadContent = '',

            // The breadcrumb item (tdcSidebar.$_editRow, tdcSidebar.$_editColumn, .. ) where the mouse events will be passed
                $currentElementHeadRef;

            switch ( currentModelTag ) {

                case 'vc_row':
                    tdcSidebar.$_editRow.hide();
                    tdcSidebar.$_editColumn.hide();
                    tdcSidebar.$_editInnerRow.hide();
                    tdcSidebar.$_editInnerColumn.hide();

                    currentElementHeadContent = tdcSidebar.$_editRow.data( 'name' );
                    $currentElementHeadRef = tdcSidebar.$_editRow;

                    break;

                case 'vc_column':
                    tdcSidebar.$_editRow.show();
                    tdcSidebar.$_editColumn.hide();
                    tdcSidebar.$_editInnerRow.hide();
                    tdcSidebar.$_editInnerColumn.hide();

                    currentElementHeadContent = tdcSidebar.$_editColumn.data( 'name' );
                    $currentElementHeadRef = tdcSidebar.$_editColumn;

                    break;

                case 'vc_row_inner':
                    tdcSidebar.$_editRow.show();
                    tdcSidebar.$_editColumn.show();
                    tdcSidebar.$_editInnerRow.hide();
                    tdcSidebar.$_editInnerColumn.hide();

                    currentElementHeadContent = tdcSidebar.$_editInnerRow.data( 'name' );
                    $currentElementHeadRef = tdcSidebar.$_editInnerRow;

                    break;

                case 'vc_column_inner':
                    tdcSidebar.$_editRow.show();
                    tdcSidebar.$_editColumn.show();
                    tdcSidebar.$_editInnerRow.show();
                    tdcSidebar.$_editInnerColumn.hide();

                    currentElementHeadContent = tdcSidebar.$_editInnerColumn.data( 'name' );
                    $currentElementHeadRef = tdcSidebar.$_editInnerColumn;

                    break;

                default:
                    tdcSidebar.$_editRow.show();
                    tdcSidebar.$_editColumn.show();

                    currentElementHeadContent = currentModel.get( 'tag' );
                    $currentElementHeadRef = tdcSidebar.getCurrentElement();

                    var parentModel = currentModel.get( 'parentModel' ),
                        parentModelTag = parentModel.get( 'tag' );

                    if ( 'vc_column_inner' === parentModelTag ) {
                        tdcSidebar.$_editInnerRow.show();
                        tdcSidebar.$_editInnerColumn.show();
                    } else {
                        tdcSidebar.$_editInnerRow.hide();
                        tdcSidebar.$_editInnerColumn.hide();
                    }
            }

            // Set the content and reattach the events ('mouseenter' and 'mouseleave') to the tdcSidebar.$_currentElementHead
            tdcSidebar.$_currentElementHead.html( currentElementHeadContent );

            tdcSidebar.$_currentElementHead.off().mouseenter(function( event ) {
                event.preventDefault();
                $currentElementHeadRef.trigger( event );

            }).mouseleave(function( event ) {
                event.preventDefault();
                $currentElementHeadRef.trigger( event );
            });

            tdcSidebar.$_inspector.show();
        },


        /**
         * Close the modal sidebar container.
         *
         * @private
         */
        _closeModal: function() {
            jQuery( '.tdc-sidebar-modal-elements' ).removeClass( 'tdc-modal-open' );
            jQuery( '.tdc-add-element' ).removeClass( 'tdc-active-element' );
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
                var $this = jQuery( this );
                $this.toggleClass( 'tdc-active-element' );
                jQuery( '.tdc-sidebar-modal-elements' ).toggleClass( 'tdc-modal-open' );
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

                // 'td_block_homepage_full_1' is allowed only once on page
                if ( 'td_block_homepage_full_1' === $element.data( 'shortcode-name' ) ) {
                    var model = tdcIFrameData.getFirstModelByTag( 'td_block_homepage_full_1' );

                    if ( ! _.isUndefined( model ) ) {

                        new tdcNotice.notice( 'td_block_homepage_full_1 este deja in pagina', false, true );
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

                var $this = jQuery( this );

                tdcSidebar._setCurrentTabId( $this.data( 'tab-id' ) );

                if ( $this.hasClass( 'tdc-tab-active' ) ) {
                    return;
                }


                // the tab
                jQuery( '.tdc-tabs a' ).removeClass( 'tdc-tab-active' );
                $this.addClass('tdc-tab-active');


                // content - remove all visible classes
                jQuery('.tdc-tab-content-wrap .tdc-tab-content').removeClass( 'tdc-tab-content-visible' );

                // add the class to the good content
                var tabContentId = $this.data('tab-id');
                jQuery('#' + tabContentId).addClass('tdc-tab-content-visible');
            });
        },


        _setCurrentTabId: function( currentTabId ) {
            tdcSidebar._currentTabId = currentTabId;
        },
        getCurrentTabId: function() {
            return tdcSidebar._currentTabId;
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
         * Set the content of the '.tdc-sidebar-info' element
         * Usually the mask should do that.
         *
         * @param content
         */
        setSidebarInfo: function( content ) {
            tdcSidebar.$_sidebarInfo.html( content );
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
         * @param forceBindModelToPanel - optional - boolean - it's sent to the bindPanelToModel.
         * It allows us to rebind a model to the sidebar panel. The tdcSidebarPanel._currentBoundModel is the current model bound to the sidebar panel.
         *
         * Ex. One case when it is necessary to be sent (true), is at moving inner-rows. There, the it's better to force a rebind, to update the inner-row columns settings.
         */
        setSettings: function( settings, forceBindModelToPanel ) {

            // If we have a previous current model, reset its 'current' attribute for removing the 'tdc-element-selected' class from the
            // $el of its backbone view
            if ( ! _.isUndefined( tdcSidebar._currentModel ) ) {
                tdcSidebar._currentModel.set( 'current', false );
            }

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
                } else {
                    tdcSidebar._setCurrentRow( undefined );
                    tdcSidebar._setCurrentColumn( undefined );
                    tdcSidebar._setCurrentInnerRow( undefined );
                    tdcSidebar._setCurrentInnerColumn( undefined );
                    tdcSidebar._setCurrentElement( undefined );

                    // Undefined current model
                    tdcSidebar._currentModel = undefined;
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

                // Add the 'tdc-element-selected' class to the $el of the backbone view
                tdcSidebar._currentModel.set( 'current', true );

                tdcSidebarPanel.bindPanelToModel( tdcSidebar._currentModel, forceBindModelToPanel );

                tdcSidebar._activeBreadcrumbItem();

                // Close the sidebar modal 'Add Elements'
                tdcSidebar._closeModal();
            }
        }

    };

    tdcSidebar.init();

})( jQuery, _ );