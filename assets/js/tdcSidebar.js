/**
 * Created by ra on 3/23/2016.
 */


var tdcSidebar = {};



(function(){
    tdcSidebar = {
        init: function () {

            // Sidebar elements modal window - open
            jQuery('.tdc-add-element').click(function(){
                jQuery('.tdc-sidebar-modal-elements').addClass('tdc-modal-open');
            });

            // Sidebar elements modal window - close
            jQuery('.tdc-modal-close').click(function(){
                jQuery('.tdc-sidebar-modal-elements').removeClass('tdc-modal-open');
            });


        }
    };

    tdcSidebar.init();
})();