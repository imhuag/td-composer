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

        $currentElement: undefined,
        $inspector: undefined,

        init: function() {

            tdcSidebar.$editRow = jQuery( '#tdc-breadcrumb-row' );
            tdcSidebar.$editColumn = jQuery( '#tdc-breadcrumb-column' );
            tdcSidebar.$editInnerRow = jQuery( '#tdc-breadcrumb-inner-row' );
            tdcSidebar.$editInnerColumn = jQuery( '#tdc-breadcrumb-inner-column' );

            tdcSidebar.$currentElement = jQuery( '.tdc-current-element' );
            tdcSidebar.$inspector = jQuery( '.tdc-inspector' );


            tdcSidebar.$editRow.click(function() {
                tdcSidebar.$currentElement.html( 'Row' );
                tdcSidebar.$editRow.nextAll().hide();
                tdcSidebar.$inspector.show();
            });

            tdcSidebar.$editColumn.click(function() {
                tdcSidebar.$currentElement.html( 'Column' );
                tdcSidebar.$editColumn.nextAll().hide();
                tdcSidebar.$inspector.show();
            });

            tdcSidebar.$editInnerRow.click(function() {
                tdcSidebar.$currentElement.html( 'Inner Row' );
                tdcSidebar.$editInnerRow.nextAll().hide();
                tdcSidebar.$inspector.show();
            });

            tdcSidebar.$editInnerColumn.click(function() {
                tdcSidebar.$currentElement.html( 'Inner Column' );
                tdcSidebar.$inspector.show();
            });


            jQuery( '.tdc-sidebar-element').each(function( index, element ) {
                tdcSidebar._defineOperations( jQuery( element ) );
            });

            tdcSidebar.sidebarModal();
            tdcSidebar.liveInspectorTabs();
        },



        sidebarModal: function () {
            // Sidebar elements modal window - open
            jQuery('.tdc-add-element').click(function(){
                jQuery('.tdc-sidebar-modal-elements').addClass('tdc-modal-open');
            });

            // Sidebar elements modal window - close
            jQuery('.tdc-modal-close').click(function(){
                jQuery('.tdc-sidebar-modal-elements').removeClass('tdc-modal-open');

                jQuery('.tdc-sidebar-modal-row').removeClass('tdc-modal-open');
                jQuery('.tdc-sidebar-modal-column').removeClass('tdc-modal-open');
                jQuery('.tdc-sidebar-modal-inner-row').removeClass('tdc-modal-open');
                jQuery('.tdc-sidebar-modal-inner-column').removeClass('tdc-modal-open');
            });

        },



        _defineOperations: function( $element ) {

            $element.click(function( event ) {
                //tdcDebug.log( 'click sidebar element' );

                event.preventDefault();

            }).mousedown(function( event ) {
                //tdcDebug.log( 'sidebar element mouse down' );

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




        liveInspectorTabs: function () {

            jQuery('.tdc-tabs a').on('click', function(){
                if (jQuery(this).hasClass('tdc-tab-active') === true) {
                    return;
                }


                // the tab
                jQuery('.tdc-tabs a').removeClass('tdc-tab-active');
                jQuery(this).addClass('tdc-tab-active');


                // content - remove all visible classes
                jQuery('.tdc-tab-content-wrap .tdc-tab-content').removeClass('tdc-tab-content-visible');

                // add the class to the good content
                var tabContentId = jQuery(this).data('tab-id');
                jQuery('#' + tabContentId).addClass('tdc-tab-content-visible');
            });
        }



    };

    tdcSidebar.init();

})( jQuery, _ );