/**
 * Created by ra on 3/23/2016.
 */


var tdcSidebar = {};



(function(){
    tdcSidebar = {



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

            // Sidebar row modal window - open
            jQuery('.tdc-edit-row').click(function(){
                jQuery('.tdc-sidebar-modal-row').addClass('tdc-modal-open');
            });

            // Sidebar column modal window - open
            jQuery('.tdc-edit-column').click(function(){
                jQuery('.tdc-sidebar-modal-column').addClass('tdc-modal-open');
            });

            // Sidebar inner row modal window - open
            jQuery('.tdc-edit-inner-row').click(function(){
                jQuery('.tdc-sidebar-modal-inner-row').addClass('tdc-modal-open');
            });

            // Sidebar inner column modal window - open
            jQuery('.tdc-edit-inner-column').click(function(){
                jQuery('.tdc-sidebar-modal-inner-column').addClass('tdc-modal-open');
            });

            jQuery( '.tdc-sidebar-element').each(function( index, element ) {

                tdcSidebar._defineOperations( jQuery( element ) );
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

    tdcSidebar.sidebarModal();
    tdcSidebar.liveInspectorTabs();
})();