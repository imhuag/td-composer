/**
 * Created by ra on 6/10/2016.
 */


/* global TdcCssGenerator:{} */
/* global jQuery:{} */
/* global Backbone:{} */
/* global _:{} */





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
                    tdcCssEditorTab._generateCssAttValue()                 // the new value
                );
            });


            // bg color
            $body.on('change keyup', '.tdc-css-background-color', function(event) {
                var model = tdcIFrameData.getModel( jQuery(this).data('model_id') );
                tdcSidebarController.onUpdate (
                    model,
                    jQuery(this).data('param_name'),    // the name of the parameter
                    '',                      // the old value
                    tdcCssEditorTab._generateCssAttValue()                 // the new value
                );


            });

            // border color
            $body.on('change keyup', '.tdc-css-border-color', function(event) {
                var model = tdcIFrameData.getModel( jQuery(this).data('model_id') );
                tdcSidebarController.onUpdate (
                    model,
                    jQuery(this).data('param_name'),    // the name of the parameter
                    '',                      // the old value
                    tdcCssEditorTab._generateCssAttValue()                 // the new value
                );
            });


            // border style selector
            $body.on('change', '.tdc-css-border-style', function(event) {
                var model = tdcIFrameData.getModel( jQuery(this).data('model_id') );
                tdcSidebarController.onUpdate (
                    model,
                    jQuery(this).data('param_name'),    // the name of the parameter
                    '',                      // the old value
                    tdcCssEditorTab._generateCssAttValue()                 // the new value
                );
            });


            // border radius
            $body.on('keyup', 'input.tdc-css-border-radius', function(event) {
                var model = tdcIFrameData.getModel( jQuery(this).data('model_id') );

                tdcSidebarController.onUpdate (
                    model,
                    jQuery(this).data('param_name'),    // the name of the parameter
                    '',                      // the old value
                    tdcCssEditorTab._generateCssAttValue()                 // the new value
                );
            });


            //// on image click
            //$body.on( 'click', '.tdc-bg-upload .tdc-image-wrap', function(event) {
            //
            //    var $imgBackgroundImage = jQuery(this);
            //    window.original_send_to_editor = window.send_to_editor;
            //    wp.media.editor.open(jQuery(this));
            //
            //    window.send_to_editor = function(html) {
            //        var img_link = jQuery('img', html).attr('src');
            //        if(typeof img_link === 'undefined') {
            //            img_link = jQuery(html).attr('src');
            //        }
            //
            //        jQuery('.tdc-css-bg-remove').removeClass('tdc-hidden-button');
            //
            //        $imgBackgroundImage.attr('src', img_link);
            //        $imgBackgroundImage.removeClass('tdc-no-image-selected');
            //
            //        //reset the send_to_editor function to its original state
            //        window.send_to_editor = window.original_send_to_editor;
            //
            //        //close the modal window
            //        tb_remove();
            //
            //        // fire the bg change event
            //        var model = tdcIFrameData.getModel( $imgBackgroundImage.data('model_id') );
            //        tdcSidebarController.onUpdate (
            //            model,
            //            $imgBackgroundImage.data('param_name'),    // the name of the parameter
            //            '',                      // the old value
            //            tdcCssEditorTab._generateCssAttValue()                 // the new value
            //        );
            //    };
            //    return false;
            //
            //});
            //// on remove image button click
            //$body.on( 'click', '.tdc-css-bg-remove', function(event) {
            //    var $imgBackgroundImage = jQuery('.tdc-css-bg-image');
            //    $imgBackgroundImage.addClass('tdc-no-image-selected');
            //    $imgBackgroundImage.attr('src', window.tdcAdminSettings.pluginUrl +  '/assets/images/sidebar/no_img.png');
            //
            //    // fire the bg change event
            //    var model = tdcIFrameData.getModel( $imgBackgroundImage.data('model_id') );
            //    tdcSidebarController.onUpdate (
            //        model,
            //        $imgBackgroundImage.data('param_name'),    // the name of the parameter
            //        '',                      // the old value
            //        tdcCssEditorTab._generateCssAttValue()                 // the new value
            //    );
            //});


            // bg style change
            $body.on('change', '.tdc-css-bg-style', function(event) {
                var model = tdcIFrameData.getModel( jQuery(this).data('model_id') );
                tdcSidebarController.onUpdate (
                    model,
                    jQuery(this).data('param_name'),    // the name of the parameter
                    '',                      // the old value
                    tdcCssEditorTab._generateCssAttValue()                 // the new value
                );
            });



        },


        _addCssEditorHtml: function () {

        },




        addCssEditor: function (mappedParameter, model) {


            //var cssAtt = tdcSidebarPanel._getParameterCurrentValue(mappedParameter, model);

            if (_.isEmpty(model.get('attrs').css)) {
                tdcCssParser.parse('');
            } else {
                tdcCssParser.parse(model.get('attrs').css);
            }

            //var propertyValue = tdcCssParser.getPropertyValueClean(cssProperty);


            //console.log(tdcCssParser.getPropertyValueClean('margin-top'));


            //console.log(model.get('attrs')['css']);

            var buffy = '';

            buffy += '<div class="tdc-responsive-buttons">';
                buffy += '<div class="tdc-responsive-desktop"><span class="tdc-desktop-icon"></span></div>';
                buffy += '<div class="tdc-responsive-tablet-landscape"><span class="tdc-tablet-landscape-icon"></span></div>';
                buffy += '<div class="tdc-responsive-tablet-portrait"><span class="tdc-tablet-portrait-icon"></span></div>';
                buffy += '<div class="tdc-responsive-phone"><span class="tdc-phone-icon"></span></div>';
            buffy += '</div>';

            buffy += '<div class="' + tdcSidebarPanel._getParameterClasses(mappedParameter) + '">';

            buffy += '<div class="tdc-box-margin">';
                buffy += '<div class="tdc-margin-label">Margin</div>';
                buffy += '<input data-tdc-for="marginTop" class="tdc-css-box-input tdc-css-box-input-top-margin" name="" type="text" value="' + tdcCssParser.getPropertyValueClean('margin-top') + '" placeholder="-" ' + tdcSidebarPanel._getParamterDataAtts(mappedParameter, model) + '/>';
                buffy += '<input data-tdc-for="marginRight" class="tdc-css-box-input tdc-css-box-input-right-margin" name="" type="text" value="' + tdcCssParser.getPropertyValueClean('margin-right') + '" placeholder="-" ' + tdcSidebarPanel._getParamterDataAtts(mappedParameter, model) + '/>';
                buffy += '<input data-tdc-for="marginBottom" class="tdc-css-box-input tdc-css-box-input-bottom-margin" name="" type="text" value="' + tdcCssParser.getPropertyValueClean('margin-bottom') + '" placeholder="-" ' + tdcSidebarPanel._getParamterDataAtts(mappedParameter, model) + '/>';
                buffy += '<input data-tdc-for="marginLeft" class="tdc-css-box-input tdc-css-box-input-left-margin" name="" type="text" value="' + tdcCssParser.getPropertyValueClean('margin-left') + '" placeholder="-" ' + tdcSidebarPanel._getParamterDataAtts(mappedParameter, model) + '/>';

                buffy += '<div class="tdc-box-border">';
                    buffy += '<div class="tdc-border-label">Border</div>';
                    buffy += '<input data-tdc-for="borderWidthTop" class="tdc-css-box-input tdc-css-box-input-top-border" name="" type="text" value="' + tdcCssParser.getPropertyValueClean('border-width-top') + '" placeholder="-" ' + tdcSidebarPanel._getParamterDataAtts(mappedParameter, model) + '/>';
                    buffy += '<input data-tdc-for="borderWidthRight" class="tdc-css-box-input tdc-css-box-input-right-border" name="" type="text" value="' + tdcCssParser.getPropertyValueClean('border-width-right') + '" placeholder="-" ' + tdcSidebarPanel._getParamterDataAtts(mappedParameter, model) + '/>';
                    buffy += '<input data-tdc-for="borderWidthBottom" class="tdc-css-box-input tdc-css-box-input-bottom-border" name="" type="text" value="' + tdcCssParser.getPropertyValueClean('border-width-bottom') + '" placeholder="-" ' + tdcSidebarPanel._getParamterDataAtts(mappedParameter, model) + '/>';
                    buffy += '<input data-tdc-for="borderWidthLeft" class="tdc-css-box-input tdc-css-box-input-left-border" name="" type="text" value="' + tdcCssParser.getPropertyValueClean('border-width-left') + '" placeholder="-" ' + tdcSidebarPanel._getParamterDataAtts(mappedParameter, model) + '/>';

                    buffy += '<div class="tdc-box-padding">';
                        buffy += '<div class="tdc-padding-label">Padding</div>';
                        buffy += '<input data-tdc-for="paddingTop" class="tdc-css-box-input tdc-css-box-input-top-padding" name="" type="text" value="' + tdcCssParser.getPropertyValueClean('padding-top') + '" placeholder="-" ' + tdcSidebarPanel._getParamterDataAtts(mappedParameter, model) + '/>';
                        buffy += '<input data-tdc-for="paddingRight" class="tdc-css-box-input tdc-css-box-input-right-padding" name="" type="text" value="' + tdcCssParser.getPropertyValueClean('padding-right') + '" placeholder="-" ' + tdcSidebarPanel._getParamterDataAtts(mappedParameter, model) + '/>';
                        buffy += '<input data-tdc-for="paddingBottom" class="tdc-css-box-input tdc-css-box-input-bottom-padding" name="" type="text" value="' + tdcCssParser.getPropertyValueClean('padding-bottom') + '" placeholder="-" ' + tdcSidebarPanel._getParamterDataAtts(mappedParameter, model) + '/>';
                        buffy += '<input data-tdc-for="paddingLeft" class="tdc-css-box-input tdc-css-box-input-left-padding" name="" type="text" value="' + tdcCssParser.getPropertyValueClean('padding-left') + '" placeholder="-" ' + tdcSidebarPanel._getParamterDataAtts(mappedParameter, model) + '/>';
                    buffy += '</div>';

                buffy += '</div>';

            buffy += '</div>';



            buffy += '</div>';


            // border style
            var currentBorderStyle = tdcCssParser.getPropertyValueClean('border-style');
            var borderStyles = [
                {value: '', display: 'Theme defaults'},
                {value: 'solid', display: 'Solid'},
                {value: 'dotted', display: 'Dotted'},
                {value: 'dashed', display: 'Dashed'},
                {value: 'none', display: 'None'},
                {value: 'hidden', display: 'Hidden'},
                {value: 'double', display: 'Double'},
                {value: 'groove', display: 'Groove'},
                {value: 'ridge', display: 'Ridge'},
                {value: 'inset', display: 'Inset'},
                {value: 'outset', display: 'Outset'},
                {value: 'initial', display: 'Initial'},
                {value: 'inherit', display: 'Inherit'}
            ];
            buffy += '<div class="tdc-property-wrap tdc-border-style tdc-dropdown-small">';
            buffy += '<div class="tdc-property-title">Border style:</div>';
            buffy += '<div class="tdc-property">';
            buffy += '<select class="tdc-css-border-style" ' + tdcSidebarPanel._getParamterDataAtts(mappedParameter, model) + ' name="">';
            buffy += tdcCssEditorTab._generateDropdownOptions(borderStyles, currentBorderStyle);
            buffy += '</select>';
            buffy += '</div>';
            buffy += '</div>';


            // border color
            var borderColorPickerId = _.uniqueId();
            buffy += '<div class="tdc-property-wrap tdc-property-colorpicker tdc-border-color">';
            buffy += '<div class="tdc-property-title">Border color:</div>';
            buffy += '<div class="tdc-property">';
            buffy += '<input class="tdc-css-border-color" ' + tdcSidebarPanel._getParamterDataAtts(mappedParameter, model) + ' id="' + borderColorPickerId + '" name="" type="text" value="' + tdcCssParser.getPropertyValueClean('border-color') + '"/>';
            buffy += '</div>';
            buffy += '</div>';
            tdcSidebarPanel._hook.addAction( 'panel_rendered', function () {
                jQuery("#" + borderColorPickerId).cs_wpColorPicker();
            });


            // border radius
            buffy += '<div class="tdc-property-wrap tdc-border-radius tdc-textfield-small">';
            buffy += '<div class="tdc-property-title">Border radius:</div>';
            buffy += '<div class="tdc-property">';
            buffy += '<input class="tdc-css-border-radius" ' + tdcSidebarPanel._getParamterDataAtts(mappedParameter, model) + ' name="" type="text" value="' + tdcCssParser.getPropertyValueClean('border-radius') + '"/>';
            buffy += '</div>';
            buffy += '</div>';


            // bg color
            var bgColorPickerId = _.uniqueId();
            buffy += '<div class="tdc-property-wrap tdc-property-colorpicker tdc-bg-color">';
            buffy += '<div class="tdc-property-title">Background color:</div>';
            buffy += '<div class="tdc-property">';
            buffy += '<input class="tdc-css-background-color" ' + tdcSidebarPanel._getParamterDataAtts(mappedParameter, model) + ' id="' + bgColorPickerId + '" name="" type="text" value="' + tdcCssParser.getPropertyValueClean('background-color') + '"/>';
            buffy += '</div>';
            buffy += '</div>';
            tdcSidebarPanel._hook.addAction( 'panel_rendered', function () {
                jQuery("#" + bgColorPickerId).cs_wpColorPicker();
            });


            // bg style
            var currentBgStyle = tdcCssParser.getPropertyValueClean('background-style'); // background-style is a custom directive that sets multiple css properties
            var bgStyles = [
                {value: '', display: 'Theme defaults'},
                {value: 'cover', display: 'Cover'},
                {value: 'contain', display: 'Contain'},
                {value: 'no-repeat', display: 'No repeat'},
                {value: 'repeat', display: 'Repeat'}
            ];
            buffy += '<div class="tdc-property-wrap tdc-bg-style tdc-dropdown-small">';
            buffy += '<div class="tdc-property-title">Background style:</div>';
            buffy += '<div class="tdc-property">';
            buffy += '<select class="tdc-css-bg-style" ' + tdcSidebarPanel._getParamterDataAtts(mappedParameter, model) + ' name="">';
            buffy += tdcCssEditorTab._generateDropdownOptions(bgStyles, currentBgStyle);
            buffy += '</select>';
            buffy += '</div>';
            buffy += '</div>';


            // bg upload
            buffy += '<div class="tdc-property-wrap tdc-bg-upload">';
            buffy += '<div class="tdc-property-title">Background upload:</div>';
            buffy += '<div class="tdc-property">';
            buffy += '<div class="tdc-image-wrap tdc-no-image-selected" ' + tdcSidebarPanel._getParamterDataAtts(mappedParameter, model) + ' style="background-image: url( \'' + window.tdcAdminSettings.pluginUrl + '/assets/images/sidebar/no_img.png\' )">';
            buffy += '</div>';
            buffy += '<a class="tdc-image-remove tdc-hidden-button" href="#" >Remove</a>';
            buffy += '</div>';
            buffy += '</div>';


            return buffy;
        },




        _generateDropdownOptions: function (dropDownOptions, currentValue) {
            var buffy = '';
            for ( var i = 0; i < dropDownOptions.length; i++ ) {
                buffy += '<option ' + (currentValue === dropDownOptions[i].value  ? ' selected="selected" ' : '') + ' value="' + dropDownOptions[i].value + '">' + dropDownOptions[i].display + '</option>';
            }
            return buffy;
        },


        /**
         * generates the CSS att value from the CssEditor values
         * @private
         */
        _generateCssAttValue: function () {

            var cssGenerator = new TdcCssGenerator(),

                // The css will be generated using only this element
                $target = jQuery( '#td-tab-css' );


            // css for padding, border margin (the square inputs)
            $target.find( ".tdc-css-box-input" ).each(function( index ) {
                cssGenerator[jQuery(this).data('tdc-for')] = jQuery(this).val();
            });


            cssGenerator.backgroundColor = $target.find('.tdc-css-background-color').val();
            cssGenerator.borderColor = $target.find('.tdc-css-border-color').val();
            cssGenerator.borderStyle = $target.find('.tdc-css-border-style').val();
            cssGenerator.borderRadius = $target.find('.tdc-css-border-radius').val();
            cssGenerator.setBackgroundStyle($target.find('.tdc-css-bg-style').val());  // custom directive that sets multiple css properties


            // bg image, only if we don't have .tdc-no-image-selected
            var $imgBackgroundImage = $target.find('.tdc-image-wrap');
            if ( !$imgBackgroundImage.hasClass('tdc-no-image-selected') ) {
                cssGenerator.backgroundUrl =   $imgBackgroundImage.data('image_link');
            }

            var generatedCss = cssGenerator.generateCss();

            //tdcDebug.log(generatedCss);
            return generatedCss;
        },












        _useOnlyDesktop: false,
        _desktop: new TdcCssGenerator(),
        _tabletL: new TdcCssGenerator(),
        _tabletP: new TdcCssGenerator(),
        _mobile: new TdcCssGenerator(),



        _displayCssEditor: function (editorType) {

        }


    };



    tdcCssEditorTab.init();

})();