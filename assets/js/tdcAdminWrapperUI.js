/**
 * Created by tagdiv on 11.02.2016.
 */

/* global jQuery:{} */

var tdcAdminWrapperUI;

(function( jQuery, undefined ) {

    'use strict';

    tdcAdminWrapperUI = {

        $placeholder: undefined,
        $helper: undefined,

        // The reference is initialized at tdcAdminIFrameUI.init(), the 'recycle' element being added to the iframe content
        // Important! This was necessary to solve a FF bug: mouse hover events don't trigger outside of the iframe, when the mouse comes from the iframe, having selected an element (the left button mouse pressed )
        $recycle: undefined,


        _initialized: false,


        init: function() {

            tdcAdminWrapperUI._tdcJqObjElements = jQuery( '.tdc-sidebar-elements' );

            tdcAdminWrapperUI.helperId = 'tdc-dragged-helper';
            tdcAdminWrapperUI.placeholderId = 'tdc-placeholder';

            tdcAdminWrapperUI.maskId = 'tdc-mask';

            tdcAdminWrapperUI.$helper = jQuery('<div id="' + tdcAdminWrapperUI.helperId + '"></div>');
            tdcAdminWrapperUI.$placeholder = jQuery('<div id="' + tdcAdminWrapperUI.placeholderId + '"></div>');


            jQuery('body').append( tdcAdminWrapperUI.$helper );
            jQuery('body').append( tdcAdminWrapperUI.$placeholder );


            jQuery( '.tdc-save-page').click( function( event ) {
                tdcSavePost.save();
            });
        }
    };



    tdcAdminWrapperUI.init();

})( jQuery );
