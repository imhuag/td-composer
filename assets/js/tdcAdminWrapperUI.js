/**
 * Created by tagdiv on 11.02.2016.
 */

/* global jQuery:{} */

var tdcAdminWrapperUI;

(function( jQuery, undefined ) {

    'use strict';

    tdcAdminWrapperUI = {

        _tdcJqObjWrapper: undefined,
        //_tdcJqObjSettings: undefined,
        //_tdcJqObjElements: undefined,  //@todo
        //_tdcJqObjInspector: undefined,
        //_tdcJqObjAdd: undefined,
        //_tdcJqObjSave: undefined,

        $placeholder: undefined,
        $helper: undefined,


        _initialized: false,


        init: function() {
            tdcAdminWrapperUI._tdcJqObjWrapper = jQuery( '#tdc-live-iframe-wrapper');

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
