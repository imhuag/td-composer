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

            //tdcAdminWrapperUI._tdcJqObjSettings = jQuery('<div id="tdc-settings"></div>');
            //
            //tdcAdminWrapperUI._tdcJqObjAdd = jQuery( '<div id="tdc-add">Add</div>' );
            //tdcAdminWrapperUI._tdcJqObjSave = jQuery( '<div id="tdc-save">Save</div>' );

            //tdcAdminWrapperUI._tdcJqObjSettings.append( tdcAdminWrapperUI._tdcJqObjAdd );
            //tdcAdminWrapperUI._tdcJqObjSettings.append( tdcAdminWrapperUI._tdcJqObjSave );

            //tdcAdminWrapperUI._tdcJqObjInspector = jQuery('<div id="tdc-inspector"></div>');

            //tdcAdminWrapperUI._tdcJqObjInspector.append( '<div class="tdc-title">Inspector</div><div class="tdc-wrapper"></div>' );

            tdcAdminWrapperUI._tdcJqObjElements = jQuery( '.tdc-sidebar-elements' );
            //tdcAdminWrapperUI._tdcJqObjElements.append( '<div class="tdc-element">Block 1</div>' +
            //'<div class="tdc-element">Block 2</div>' );


            tdcAdminWrapperUI.helperId = 'tdc-dragged-helper';
            tdcAdminWrapperUI.placeholderId = 'tdc-placeholder';

            tdcAdminWrapperUI.maskId = 'tdc-mask';

            tdcAdminWrapperUI.$helper = jQuery('<div id="' + tdcAdminWrapperUI.helperId + '"></div>');
            tdcAdminWrapperUI.$placeholder = jQuery('<div id="' + tdcAdminWrapperUI.placeholderId + '"></div>');




            //jQuery('body').append( tdcAdminWrapperUI._tdcJqObjSettings );
            //jQuery('body').append( tdcAdminWrapperUI._tdcJqObjInspector );
            //jQuery('body').append( tdcAdminWrapperUI._tdcJqObjElements );

            jQuery('body').append( tdcAdminWrapperUI.$helper );
            jQuery('body').append( tdcAdminWrapperUI.$placeholder );


            //tdcAdminWrapperUI._tdcJqObjSettings.css({
            //    height: jQuery(window).innerHeight()
            //});
            //
            //
            //tdcAdminWrapperUI._tdcJqObjInspector.css({
            //    height: jQuery(window).innerHeight() - 75
            //});

            //tdcAdminWrapperUI._tdcJqObjAdd.click(function(event) {
            //    tdcAdminWrapperUI._tdcJqObjElements.css({
            //        left: 0
            //    });
            //});

            //tdcAdminWrapperUI._tdcJqObjSave.click(function(event) {
            //
            //    //var data = {
            //    //    error: undefined,
            //    //    getShortcode: ''
            //    //};
            //    //
            //    //tdcMain.getShortcodeFromData( data );
            //    //
            //    //if ( !_.isUndefined( data.error ) ) {
            //    //    tdcDebug.log( data.error );
            //    //} else {
            //    //    tdcDebug.log( data.getShortcode );
            //    //}
            //    //
            //    alert( 'Save the content. Look to the console for the post content' );
            //});
        }
    };



    tdcAdminWrapperUI.init();

})( jQuery );
