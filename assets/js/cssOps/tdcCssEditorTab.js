/**
 * Created by ra on 6/10/2016.
 */


/* global TdcCssGenerator:{} */



/// @todo trebuie implementat
var tdcCssEditorTab = {};

(function(){
    'use strict';




    tdcCssEditorTab = {

        init: function () {
            var $body = jQuery('body');

            /***************************************************************************************************
             *  events for css box!
             */

                // all the inputs for margin, padding, border
            $body.on('keyup', 'input.tdc-css-box-input', function(event) {
                var model = tdcIFrameData.getModel( jQuery(this).data('model_id') );

                tdcSidebarController.onUpdate (
                    model,
                    jQuery(this).data('param_name'),    // the name of the parameter
                    '',                      // the old value
                    tdcSidebarPanel._generateCssAttValue()                 // the new value
                );
            });


            // bg color
            $body.on('change keyup', '.tdc-css-background-color', function(event) {
                var model = tdcIFrameData.getModel( jQuery(this).data('model_id') );
                tdcSidebarController.onUpdate (
                    model,
                    jQuery(this).data('param_name'),    // the name of the parameter
                    '',                      // the old value
                    tdcSidebarPanel._generateCssAttValue()                 // the new value
                );


            });

            // border color
            $body.on('change keyup', '.tdc-css-border-color', function(event) {
                var model = tdcIFrameData.getModel( jQuery(this).data('model_id') );
                tdcSidebarController.onUpdate (
                    model,
                    jQuery(this).data('param_name'),    // the name of the parameter
                    '',                      // the old value
                    tdcSidebarPanel._generateCssAttValue()                 // the new value
                );
            });


            // border style selector
            $body.on('change', '.tdc-css-border-style', function(event) {
                var model = tdcIFrameData.getModel( jQuery(this).data('model_id') );
                tdcSidebarController.onUpdate (
                    model,
                    jQuery(this).data('param_name'),    // the name of the parameter
                    '',                      // the old value
                    tdcSidebarPanel._generateCssAttValue()                 // the new value
                );
            });


            // border radius
            $body.on('keyup', 'input.tdc-css-border-radius', function(event) {
                var model = tdcIFrameData.getModel( jQuery(this).data('model_id') );

                tdcSidebarController.onUpdate (
                    model,
                    jQuery(this).data('param_name'),    // the name of the parameter
                    '',                      // the old value
                    tdcSidebarPanel._generateCssAttValue()                 // the new value
                );
            });


            // on image click
            $body.on( 'click', '.tdc-css-bg-image', function(event) {

                var $imgBackgroundImage = jQuery(this);
                window.original_send_to_editor = window.send_to_editor;
                wp.media.editor.open(jQuery(this));

                window.send_to_editor = function(html) {
                    var img_link = jQuery('img', html).attr('src');
                    if(typeof img_link === 'undefined') {
                        img_link = jQuery(html).attr('src');
                    }

                    jQuery('.tdc-css-bg-remove').removeClass('tdc-hidden-button');

                    $imgBackgroundImage.attr('src', img_link);
                    $imgBackgroundImage.removeClass('tdc-no-image-selected');

                    //reset the send_to_editor function to its original state
                    window.send_to_editor = window.original_send_to_editor;

                    //close the modal window
                    tb_remove();

                    // fire the bg change event
                    var model = tdcIFrameData.getModel( $imgBackgroundImage.data('model_id') );
                    tdcSidebarController.onUpdate (
                        model,
                        $imgBackgroundImage.data('param_name'),    // the name of the parameter
                        '',                      // the old value
                        tdcSidebarPanel._generateCssAttValue()                 // the new value
                    );
                };
                return false;

            });
            // on remove image button click
            $body.on( 'click', '.tdc-css-bg-remove', function(event) {
                var $imgBackgroundImage = jQuery('.tdc-css-bg-image');
                $imgBackgroundImage.addClass('tdc-no-image-selected');
                $imgBackgroundImage.attr('src', window.tdcAdminSettings.pluginUrl +  '/assets/images/sidebar/no_img_upload.png');

                // fire the bg change event
                var model = tdcIFrameData.getModel( $imgBackgroundImage.data('model_id') );
                tdcSidebarController.onUpdate (
                    model,
                    $imgBackgroundImage.data('param_name'),    // the name of the parameter
                    '',                      // the old value
                    tdcSidebarPanel._generateCssAttValue()                 // the new value
                );
            });


            // bg style change
            $body.on('change', '.tdc-css-bg-style', function(event) {
                var model = tdcIFrameData.getModel( jQuery(this).data('model_id') );
                tdcSidebarController.onUpdate (
                    model,
                    jQuery(this).data('param_name'),    // the name of the parameter
                    '',                      // the old value
                    tdcSidebarPanel._generateCssAttValue()                 // the new value
                );
            });



        },



        _useOnlyDesktop: false,
        _desktop: new TdcCssGenerator(),
        _tabletL: new TdcCssGenerator(),
        _tabletP: new TdcCssGenerator(),
        _mobile: new TdcCssGenerator(),



        bindToModel: function (model) {

        },


        _displayCssEditor: function (editorType) {

        }


    };



    tdcCssEditorTab.init();

})();