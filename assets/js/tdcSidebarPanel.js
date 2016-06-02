/**
 * Sidebar Panel Generator
 * Created by ra on 5/5/2016.
 */


/* global jQuery:{} */
/* global Backbone:{} */
/* global _:{} */

/* tdcAdminSettings */

var tdcSidebarPanel = {};


(function ( undefined ) {
    'use strict';


    tdcSidebarPanel = {

        _defaultGroupName: 'General', // where to put params that don't have a group


        /**
         * Small hook system for Sidebar Panel events
         * @private
         */
        _hook: {
            _hooks: [],
            addAction: function ( name, callback ) {
                if (_.isUndefined(tdcSidebarPanel._hook._hooks[name]) ) {
                    tdcSidebarPanel._hook._hooks[name] = [];
                }
                tdcSidebarPanel._hook._hooks[name].push( callback );
            },

            doAction: function ( name, callArguments ) {
                if (!_.isUndefined(tdcSidebarPanel._hook._hooks[name])) {
                    for(var i = 0; i < tdcSidebarPanel._hook._hooks[name].length; i++ ) {
                        tdcSidebarPanel._hook._hooks[name][i]( callArguments );
                    }
                }
            }
        },




        /**
         * we just hook the dom events here
         */
        init: function () {


            // dropdown hook
            jQuery('body').on('change focus', '.tdc-property-dropdown:not(.tdc-row-col-dropdown):not(.tdc-innerRow-col-dropdown) select', function() {
                // save the oldValue on focus in
                if (event.type === 'focusin' || event.type === 'focus') { // the select raises a focus event instead of focusin
                    this.oldValue = this.value;
                    return;
                }

                console.log('on change: Select');
                var curValue = jQuery(this).val();
                var model = tdcIFrameData.getModel( jQuery(this).data('model_id') );

                tdcSidebarController.onUpdate (
                    model,
                    jQuery(this).data('param_name'),    // the name of the parameter
                    this.oldValue,                      // the old value
                    curValue                 // the new value
                );
                this.oldValue = curValue;
            });






            // textfield hook
            jQuery('body').on('keyup focus', '.tdc-property-textfield input', function(event) {

                // save the oldValue on focus in
                if (event.type === 'focusin') {
                    this.oldValue = this.value;
                    return;
                }


                var curValue = jQuery(this).val();
                var model = tdcIFrameData.getModel( jQuery(this).data('model_id') );

                tdcSidebarController.onUpdate (
                    model,
                    jQuery(this).data('param_name'),    // the name of the parameter
                    this.oldValue,                      // the old value
                    curValue                 // the new value
                );
                this.oldValue = curValue;
            });





            // colorpicker (change for colropicker, keyup for clear)
            jQuery('body').on('change keyup focus', '.tdc-property-colorpicker input', function(event) {
                // save the oldValue on focus in
                if (event.type === 'focusin') {
                    this.oldValue = this.value;
                    return;
                }

                var curValue = jQuery(this).val();
                var model = tdcIFrameData.getModel( jQuery(this).data('model_id') );

                tdcSidebarController.onUpdate (
                    model,
                    jQuery(this).data('param_name'),    // the name of the parameter
                    this.oldValue,                      // the old value
                    curValue                 // the new value
                );
                this.oldValue = curValue;



            });






            // hook the custom row dropdown
            jQuery('body').on( 'change focus', '.tdc-row-col-dropdown select', function () {

                // save the oldValue on focus in
                if ( event.type === 'focusin' || event.type === 'focus' ) { // the select raises a focus event instead of focusin
                    this.oldValue = this.value;
                    return;
                }

                var curValue = jQuery(this).val(),
                    rowModelId = tdcSidebar.getCurrentRow().data( 'model_id' ),
                    rowModel = tdcIFrameData.getModel( rowModelId );


                // check if the change is correct
                // 1 column -> 2 columns
                // 1 column -> 2 columns
                // 1 column -> 3 columns
                if ( ( ( '11' === this.oldValue ) && ( '23_13' === curValue || '13_23' === curValue || '13_13_13' === curValue ) )  ||

                        // 2 columns -> 1 column
                        // 2 columns -> 2 columns
                        // 2 columns -> 3 columns
                    ( ( '23_13' === this.oldValue ) && ( '11' === curValue || '13_23' === curValue || '13_13_13' === curValue ) ) ||

                        // 2 column -> 1 column
                        // 2 column -> 2 columns
                        // 2 column -> 3 columns
                    ( ( '13_23' === this.oldValue ) && ( '11' === curValue || '23_13' === curValue || '13_13_13' === curValue ) ) ||

                        // 3 column -> 1 column
                        // 3 column -> 2 columns
                        // 3 column -> 2 columns
                    ( ( '13_13_13' === this.oldValue ) && ( '11' === curValue || '23_13' === curValue || '13_23' === curValue ) ) ) {

                    tdcIFrameData.changeRowModel( rowModel, this.oldValue, curValue );
                    rowModel.getShortcodeRender( 1, null, true, Math.random() + Math.random() + Math.random());

                } else {
                    throw 'Invalid row change detected: this.oldValue:' + this.oldValue + ' and curValue: ' + curValue;
                }

                this.oldValue = curValue;

            });




            // hook the custom innerRow dropdown
            jQuery('body').on('change focus', '.tdc-innerRow-col-dropdown select', function() {

                // save the oldValue on focus in
                if (event.type === 'focusin' || event.type === 'focus') { // the select raises a focus event instead of focusin
                    this.oldValue = this.value;
                    return;
                }

                var curValue = jQuery(this).val(),
                    innerRowModelId = tdcSidebar._$currentInnerRow.data( 'model_id' ),
                    innerRowModel = tdcIFrameData.getModel( innerRowModelId );

                tdcIFrameData.changeInnerRowModel( innerRowModel, this.oldValue, curValue);

                innerRowModel.getShortcodeRender( 1, null, true, Math.random() + Math.random() + Math.random());  // clean up the rendom things

                this.oldValue = curValue;
            });





            //hook for css box!
            // textfield hook
            jQuery('body').on('keyup', 'input.tdc-css-box-input', function(event) {
                var model = tdcIFrameData.getModel( jQuery(this).data('model_id') );

                tdcSidebarController.onUpdate (
                    model,
                    jQuery(this).data('param_name'),    // the name of the parameter
                    '',                      // the old value
                    tdcSidebarPanel.getCssEditorCss()                 // the new value
                );
            });



            // colorpicker (change for colropicker, keyup for clear)
            jQuery('body').on('change keyup', '.tdc-css-background-color', function(event) {
                var model = tdcIFrameData.getModel( jQuery(this).data('model_id') );
                tdcSidebarController.onUpdate (
                    model,
                    jQuery(this).data('param_name'),    // the name of the parameter
                    '',                      // the old value
                    tdcSidebarPanel.getCssEditorCss()                 // the new value
                );


            });


            // colorpicker (change for colropicker, keyup for clear)
            jQuery('body').on('change keyup', '.tdc-css-border-color', function(event) {
                var model = tdcIFrameData.getModel( jQuery(this).data('model_id') );
                tdcSidebarController.onUpdate (
                    model,
                    jQuery(this).data('param_name'),    // the name of the parameter
                    '',                      // the old value
                    tdcSidebarPanel.getCssEditorCss()                 // the new value
                );


            });



        },


        /**
         *
         * @param $curDomBit - may be a row or column or element DOM etc...
         */
        bindPanelToModel: function (model) {

            // get the mapped shortcode for this model
            var mappedShortCode = window.tdcAdminSettings.mappedShortcodes[model.attributes.tag];
            //tdcDebug.log( mappedShortCode );


            // step 0 - delete the old panel. HTML + items
            tdcSidebarPanel._deletePanel();


            // step 1 - make the tabs
            var allGroupNames = [];
            for (var cnt = 0; cnt < mappedShortCode.params.length; cnt++) {
                var currentTabName = tdcSidebarPanel._defaultGroupName;
                if (!_.isEmpty(mappedShortCode.params[cnt].group)) {
                    currentTabName = mappedShortCode.params[cnt].group;
                }
                allGroupNames.push(currentTabName);
            }
            allGroupNames = _.uniq(allGroupNames); // make the tabs unique. First occurrence remains in the array.



            // step 3 - make the tabs and all the HTML
            var panelHtml = '';




            // tabs - top
            panelHtml += '<div class="tdc-tabs">';
                for (cnt = 0; cnt < allGroupNames.length; cnt++) {
                    if (cnt === 0) {
                        panelHtml += '<a href="#" data-tab-id="td-tab-' + tdcUtil.makeSafeForCSS(allGroupNames[cnt]) + '" class="tdc-tab-active">' + allGroupNames[cnt] + '</a>';
                    } else {
                        panelHtml += '<a href="#" data-tab-id="td-tab-' + tdcUtil.makeSafeForCSS(allGroupNames[cnt]) + '">' + allGroupNames[cnt] + '</a>';
                    }

                }
            panelHtml += '</div>';


            // tabs - content
            panelHtml += '<div class="tdc-tab-content-wrap">';
                for (cnt = 0; cnt < allGroupNames.length; cnt++) {
                    if (cnt === 0) {
                        panelHtml += '<div class="tdc-tab-content tdc-tab-content-visible" id="td-tab-' + tdcUtil.makeSafeForCSS(allGroupNames[cnt]) + '">';
                    } else {
                        panelHtml += '<div class="tdc-tab-content" id="td-tab-' + tdcUtil.makeSafeForCSS(allGroupNames[cnt]) + '">';
                    }

                        // tab content
                        panelHtml += tdcSidebarPanel._bindGroupAndGetHtml(allGroupNames[cnt], mappedShortCode, model);


                    panelHtml += '</div>'; // close tab content wrap
                }
            panelHtml += '</div>';



            jQuery('.tdc-inspector .tdc-tabs-wrapper').html(panelHtml);



            // step 4 - hook up all the events and update the newly generate panel ui








            jQuery('.tdc-breadcrumbs').show();


            // on this hook, the color picker attaches. Because we render in a buffer, all the panel controls that have to run code have to use this hook to run
            // the code after the panel is rendered in the page.
            tdcSidebarPanel._hook.doAction( 'panel_rendered' );






            // @todo Its content should be moved

            /**
             * update the row layout dropdown to represent the reality
             */
            (function () {
                var modelTag = model.get( 'tag' );
                if ( 'vc_row' === modelTag ) {

                    var $tdcRowColumnsModifier = jQuery('body .tdc-row-col-dropdown select' );


                    var childCollection = model.get( 'childCollection' );
                    if ( ! _.isUndefined( childCollection ) ) {
                        //tdcDebug.log( childCollection );

                        var width = tdcIFrameData.getChildCollectionWidths( childCollection );

                        if ( _.isUndefined( width ) ) {
                            // Default value
                            width = '11';
                        }
                        $tdcRowColumnsModifier.val( width );
                    }
                }

            })();


            /**
             * update the inner_row layout dropdown to represent the reality
             */
            (function () {
                var modelTag = model.get( 'tag' );

                if ( 'vc_row_inner' === modelTag ) {


                    var $tdcInnerRowColumnsModifier = jQuery('body .tdc-innerRow-col-dropdown select' ) ;



                    var childCollection = model.get( 'childCollection' );

                    if ( ! _.isUndefined( childCollection ) ) {

                        //tdcDebug.log( childCollection );

                        var width = tdcIFrameData.getChildCollectionWidths( childCollection );

                        //tdcDebug.log( width );

                        if ( _.isUndefined( width ) ) {
                            // Default value
                            width = '11';
                        }
                        $tdcInnerRowColumnsModifier.val( width );

                        var columnModel = model.get( 'parentModel' ),
                            attrsColumnModel = columnModel.get( 'attrs' ),
                            columnWidth = '';

                        if ( _.has( attrsColumnModel, 'width' ) ) {
                            columnWidth = attrsColumnModel.width.replace( '/', '' );
                        }

                        switch ( columnWidth ) {
                            case '' :
                                $tdcInnerRowColumnsModifier.find('option[value=12_12]').hide();
                                $tdcInnerRowColumnsModifier.find('option[value=23_13]').show();
                                $tdcInnerRowColumnsModifier.find('option[value=13_23]').show();
                                $tdcInnerRowColumnsModifier.find('option[value=13_13_13]').show();
                                break;

                            case '13' :
                                $tdcInnerRowColumnsModifier.find('option[value=12_12]').hide();
                                $tdcInnerRowColumnsModifier.find('option[value=23_13]').hide();
                                $tdcInnerRowColumnsModifier.find('option[value=13_23]').hide();
                                $tdcInnerRowColumnsModifier.find('option[value=13_13_13]').hide();
                                break;

                            case '23' :
                                $tdcInnerRowColumnsModifier.find('option[value=12_12]').show();
                                $tdcInnerRowColumnsModifier.find('option[value=23_13]').hide();
                                $tdcInnerRowColumnsModifier.find('option[value=13_23]').hide();
                                $tdcInnerRowColumnsModifier.find('option[value=13_13_13]').hide();
                                break;
                        }


                    }

                }

            })();




        },



        /**
         * Renders a whole group ( one tab )
         * @param groupName - the name of the group that you want to render
         * @param mappedShortCode - the full shortcode map
         * @param model - the full model for this element/shortcode
         * @returns {string} HTML with the tab
         * @private
         */
        _bindGroupAndGetHtml: function (groupName, mappedShortCode,  model) {
            var buffy = '';

            for (var cnt = 0; cnt < mappedShortCode.params.length; cnt++) {

                if (groupName === tdcSidebarPanel._defaultGroupName) { // default group, check for empty
                    if (_.isEmpty(mappedShortCode.params[cnt].group)) {
                        buffy += tdcSidebarPanel._bindParamAndGetHtml(mappedShortCode.params[cnt], model);
                    }
                } else { // all other groups, check by name
                    if (mappedShortCode.params[cnt].group === groupName) {
                        buffy += tdcSidebarPanel._bindParamAndGetHtml(mappedShortCode.params[cnt], model);
                    }
                }
            }
            return buffy;
        },


        _bindParamAndGetHtml: function (mappedParameter, model) {
            //console.log(model.attributes.attrs);


            switch(mappedParameter.type) {
                case 'colorpicker':
                    return tdcSidebarPanel.addColorpicker(mappedParameter, model);

                case 'dropdown':
                    return tdcSidebarPanel.addDropDown(mappedParameter, model);

                case 'textfield':
                    return tdcSidebarPanel.addTextField(mappedParameter, model);

                case 'css_editor':
                    return tdcSidebarPanel.addCssEditor(mappedParameter, model);

                default:
                    return mappedParameter.param_name + ' - ' + mappedParameter.type + '<br>';
            }


            //console .log(mappedParameter);
        },


        /**
         * Delete the old panel.
         * @private
         */
        _deletePanel: function () {
            //return;
            console.log('clear  _deletePanel ');

            jQuery('.tdc-breadcrumbs').hide();
            jQuery('.tdc-inspector .tdc-current-element-head').empty();
            jQuery('.tdc-inspector .tdc-tabs-wrapper').empty();
        },




        /**
         * Adds classes the the wrap of a property in a panel
         * @param mappedParameter
         * @returns {string}
         * @private
         */
        _getParameterClasses: function (mappedParameter) {
           var mappedClasses = 'tdc-property-wrap';

            // add the autogenerated tdc-property-PROPERTY_TYPE
            mappedClasses += ' tdc-property-' + mappedParameter.type;

            // add the mapped 'class'
            if (!_.isUndefined(mappedParameter.class)) {
                mappedClasses +=  ' ' + mappedParameter.class;
            }

            return mappedClasses;
        },


        /**
         * returns the current value of a parameter. If it's not set by the user in the shortcode's atts, we will return the
         * default mapped value
         * @param mappedParameter
         * @param model
         * @returns {*}
         * @private
         */
        _getParameterCurrentValue: function (mappedParameter, model) {
            if (_.isEmpty(model.get('attrs')[mappedParameter.param_name])) {

                // for dropdowns the default value is always an empty string. Note that this is different from the vc implementation
                if (mappedParameter.type === 'dropdown') {
                    return '';
                }
                return mappedParameter.value; // return the 'default' value
            }

            return model.get('attrs')[mappedParameter.param_name];
        },


        /**
         * get the HTML dom name of the att
         * @param mappedParameter
         * @returns {string}
         * @private
         */
        _getParameterDomName: function (mappedParameter) {
            return 'tdc-param-' + mappedParameter.param_name;
        },


        /**
         *
         * @param mappedParameter
         * @param model
         * @returns {string}
         * @private
         */
        _getParamterDataAtts: function (mappedParameter, model) {
            return 'data-model_id="' + model.cid +  '" data-param_name="' + mappedParameter.param_name + '"';
        },


        addColorpicker: function (mappedParameter, model) {

            var buffy = '';
            var colorPickerId = _.uniqueId();
            buffy += '<div class="' + tdcSidebarPanel._getParameterClasses(mappedParameter) + '">';
                buffy += '<div class="tdc-property-title">' + mappedParameter.heading + ':</div>';
                buffy += '<div class="tdc-property">';
                    buffy += '<input ' + tdcSidebarPanel._getParamterDataAtts(mappedParameter, model) + ' id="' + colorPickerId + '" name="' + tdcSidebarPanel._getParameterDomName(mappedParameter) + '" type="text" value="' + tdcSidebarPanel._getParameterCurrentValue(mappedParameter, model) + '"/>';
                buffy += '</div>';
            buffy += '</div>';



            tdcSidebarPanel._hook.addAction( 'panel_rendered', function () {
                jQuery("#" + colorPickerId).cs_wpColorPicker();
            });


            return buffy;


        },


        addDropDown: function (mappedParameter, model) {
            var buffy = '';

            // make the selectOptions
            var selectOptions = '';
            var keys = Object.keys(mappedParameter.value);
            //console.log('------------ -------------- ------------');
            for (var i = 0; i < keys.length; i++) {
                var value = mappedParameter.value[keys[i]];
                var currentSelectedValue = tdcSidebarPanel._getParameterCurrentValue(mappedParameter, model);
                var selected = '';

                if (String(currentSelectedValue) === String(value)) {
                    //console.log('selected');
                    selected = ' selected="selected" ';
                }

                //console.log(currentSelectedValue + ' - ' + value);
                selectOptions += '<option ' + selected + ' value="' + value + '">' + keys[i] + '</option>';
            }




            buffy += '<div class="' + tdcSidebarPanel._getParameterClasses(mappedParameter) + '">';
                buffy += '<div class="tdc-property-title">' + mappedParameter.heading + ':</div>';
                buffy += '<div class="tdc-property">';
                    buffy += '<select ' + tdcSidebarPanel._getParamterDataAtts(mappedParameter, model) + ' name="' + tdcSidebarPanel._getParameterDomName(mappedParameter) + '">';
                        buffy += selectOptions;
                    buffy += '</select>';
                buffy += '</div>';
            buffy += '</div>';



            return buffy;
        },



        addTextArea: function () {

        },

        addTextField: function (mappedParameter, model) {


            //console.log(mappedParameter);
            var buffy = '';
            buffy += '<div class="' + tdcSidebarPanel._getParameterClasses(mappedParameter) + '">';
                buffy += '<div class="tdc-property-title">' + mappedParameter.heading + ':</div>';
                buffy += '<div class="tdc-property">';
                    buffy += '<input ' + tdcSidebarPanel._getParamterDataAtts(mappedParameter, model) + ' name="' + tdcSidebarPanel._getParameterDomName(mappedParameter) + '" type="text" value="' + tdcSidebarPanel._getParameterCurrentValue(mappedParameter, model) + '"/>';
                buffy += '</div>';
            buffy += '</div>';


            return buffy;
        },


        addTextAreaHtml: function () {

        },



        getCssEditorCss: function () {
            var cssGenerator = new TdcCssGenerator();




            jQuery( ".tdc-css-box-input" ).each(function( index ) {
                cssGenerator[jQuery(this).data('tdc-for')] = jQuery(this).val();
            });


            cssGenerator.backgroundColor = jQuery('.tdc-css-background-color').val();
            cssGenerator.borderColor = jQuery('.tdc-css-border-color').val();
            return cssGenerator.generateCss();
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
            buffy += '<div class="' + tdcSidebarPanel._getParameterClasses(mappedParameter) + '">';


                buffy += '<div class="tdc-property-title">Margin:</div>';
                buffy += '<div class="tdc-box-margin">';
                    buffy += '<input data-tdc-for="marginTop" class="tdc-css-box-input tdc-css-box-input-top" name="" type="text" value="' + tdcCssParser.getPropertyValueClean('margin-top') + '" placeholder="-" ' + tdcSidebarPanel._getParamterDataAtts(mappedParameter, model) + '/>';
                    buffy += '<input data-tdc-for="marginRight" class="tdc-css-box-input tdc-css-box-input-right" name="" type="text" value="' + tdcCssParser.getPropertyValueClean('margin-right') + '" placeholder="-" ' + tdcSidebarPanel._getParamterDataAtts(mappedParameter, model) + '/>';
                    buffy += '<input data-tdc-for="marginBottom"class="tdc-css-box-input tdc-css-box-input-bottom" name="" type="text" value="' + tdcCssParser.getPropertyValueClean('margin-bottom') + '" placeholder="-" ' + tdcSidebarPanel._getParamterDataAtts(mappedParameter, model) + '/>';
                    buffy += '<input data-tdc-for="marginLeft"class="tdc-css-box-input tdc-css-box-input-left" name="" type="text" value="' + tdcCssParser.getPropertyValueClean('margin-left') + '" placeholder="-" ' + tdcSidebarPanel._getParamterDataAtts(mappedParameter, model) + '/>';

                    buffy += '<div class="tdc-box-border">';
                        buffy += '<input data-tdc-for="borderWidthTop" class="tdc-css-box-input tdc-css-box-input-top" name="" type="text" value="' + tdcCssParser.getPropertyValueClean('border-width-top') + '" placeholder="-" ' + tdcSidebarPanel._getParamterDataAtts(mappedParameter, model) + '/>';
                        buffy += '<input data-tdc-for="borderWidthRight" class="tdc-css-box-input tdc-css-box-input-right" name="" type="text" value="' + tdcCssParser.getPropertyValueClean('border-width-right') + '" placeholder="-" ' + tdcSidebarPanel._getParamterDataAtts(mappedParameter, model) + '/>';
                        buffy += '<input data-tdc-for="borderWidthBottom" class="tdc-css-box-input tdc-css-box-input-bottom" name="" type="text" value="' + tdcCssParser.getPropertyValueClean('border-width-bottom') + '" placeholder="-" ' + tdcSidebarPanel._getParamterDataAtts(mappedParameter, model) + '/>';
                        buffy += '<input data-tdc-for="borderWidthLeft" class="tdc-css-box-input tdc-css-box-input-left" name="" type="text" value="' + tdcCssParser.getPropertyValueClean('border-width-left') + '" placeholder="-" ' + tdcSidebarPanel._getParamterDataAtts(mappedParameter, model) + '/>';

                        buffy += '<div class="tdc-box-padding">';
                            buffy += '<input data-tdc-for="paddingTop" class="tdc-css-box-input tdc-css-box-input-top" name="" type="text" value="' + tdcCssParser.getPropertyValueClean('padding-top') + '" placeholder="-" ' + tdcSidebarPanel._getParamterDataAtts(mappedParameter, model) + '/>';
                            buffy += '<input data-tdc-for="paddingRight" class="tdc-css-box-input tdc-css-box-input-right" name="" type="text" value="' + tdcCssParser.getPropertyValueClean('padding-right') + '" placeholder="-" ' + tdcSidebarPanel._getParamterDataAtts(mappedParameter, model) + '/>';
                            buffy += '<input data-tdc-for="paddingBottom" class="tdc-css-box-input tdc-css-box-input-bottom" name="" type="text" value="' + tdcCssParser.getPropertyValueClean('padding-bottom') + '" placeholder="-" ' + tdcSidebarPanel._getParamterDataAtts(mappedParameter, model) + '/>';
                            buffy += '<input data-tdc-for="paddingLeft" class="tdc-css-box-input tdc-css-box-input-left" name="" type="text" value="' + tdcCssParser.getPropertyValueClean('padding-left') + '" placeholder="-" ' + tdcSidebarPanel._getParamterDataAtts(mappedParameter, model) + '/>';
                        buffy += '</div>';

                    buffy += '</div>';

                buffy += '</div>';



            buffy += '</div>';




            // border color
            var borderColorPickerId = _.uniqueId();
            buffy += '<div class="tdc-property-wrap">';
            buffy += '<div class="tdc-property-title">Border color:</div>';
            buffy += '<div class="tdc-property">';
            buffy += '<input class="tdc-css-border-color" ' + tdcSidebarPanel._getParamterDataAtts(mappedParameter, model) + ' id="' + borderColorPickerId + '" name="" type="text" value="' + tdcCssParser.getPropertyValueClean('border-color') + '"/>';
            buffy += '</div>';
            buffy += '</div>';
            tdcSidebarPanel._hook.addAction( 'panel_rendered', function () {
                jQuery("#" + borderColorPickerId).cs_wpColorPicker();
            });

            // bg color
            var bgColorPickerId = _.uniqueId();
            buffy += '<div class="tdc-property-wrap">';
            buffy += '<div class="tdc-property-title">Background color:</div>';
            buffy += '<div class="tdc-property">';
            buffy += '<input class="tdc-css-background-color" ' + tdcSidebarPanel._getParamterDataAtts(mappedParameter, model) + ' id="' + bgColorPickerId + '" name="" type="text" value="' + tdcCssParser.getPropertyValueClean('background-color') + '"/>';
            buffy += '</div>';
            buffy += '</div>';
            tdcSidebarPanel._hook.addAction( 'panel_rendered', function () {
                jQuery("#" + bgColorPickerId).cs_wpColorPicker();
            });



            // border style
            buffy += '<div class="tdc-property-wrap">';
                buffy += '<div class="tdc-property-title">Border style:</div>';
                buffy += '<div class="tdc-property">';
                    buffy += '<select class="tdc-css-border-style" ' + tdcSidebarPanel._getParamterDataAtts(mappedParameter, model) + ' name="">';
                        buffy += '<option value="">Theme defaults</option>';
                        buffy += '<option value="dotted">Dotted</option>';
                        buffy += '<option value="none">None</option>';
                        buffy += '<option value="double">Double</option>';
                        buffy += '<option value="ridge">Ridge</option>';
                        buffy += '<option value="outset">Outset</option>';
                        buffy += '<option value="inherit">Inherit</option>';
                    buffy += '</select>';
                buffy += '</div>';
            buffy += '</div>';


            // border radius
            buffy += '<div class="tdc-property-wrap">';
                buffy += '<div class="tdc-property-title">Border radius:</div>';
                buffy += '<div class="tdc-property">';
                    buffy += '<input class="tdc-css-border-radius" ' + tdcSidebarPanel._getParamterDataAtts(mappedParameter, model) + ' name="" type="text" value=""/>';
                buffy += '</div>';
            buffy += '</div>';


            // bg upload
            buffy += '<div class="tdc-property-wrap">';
                buffy += '<div class="tdc-property-title">Background upload:</div>';
                buffy += '<div class="tdc-property">';
                    buffy += '<div class="tdc-css-bg-imgage"></div>';
                    buffy += '<input class="tdc-css-bg-url" ' + tdcSidebarPanel._getParamterDataAtts(mappedParameter, model) + ' name="" type="text" value=""/>';
                    buffy += '<div>';
                        buffy += '<a href="#" >Upload</a>';
                        buffy += '<a href="#" >Remove</a>';
                    buffy += '</div>';
                buffy += '</div>';
            buffy += '</div>';
            tdcSidebarPanel._hook.addAction( 'panel_rendered', function () {
                jQuery("#" + bgColorPickerId).cs_wpColorPicker();
            });



            // bg style
            buffy += '<div class="tdc-property-wrap">';
            buffy += '<div class="tdc-property-title">Background style:</div>';
                buffy += '<div class="tdc-property">';
                    buffy += '<select class="tdc-css-border-style" ' + tdcSidebarPanel._getParamterDataAtts(mappedParameter, model) + ' name="">';
                        buffy += '<option value="">Theme defaults</option>';
                        buffy += '<option value="cover">Cover</option>';
                        buffy += '<option value="contain">Contain</option>';
                        buffy += '<option value="no-repeat">No Repeat</option>';
                        buffy += '<option value="repeat">Repeat</option>';
                    buffy += '</select>';
                buffy += '</div>';
            buffy += '</div>';





            return buffy;
        }





    };


    tdcSidebarPanel.init();
})();




function TdcCssGenerator () {
    'use strict';

    this.possitions = ['top', 'right', 'bottom', 'left'];

    // padding
    this.paddingTop = '';
    this.paddingRight = '';
    this.paddingBottom = '';
    this.paddingLeft = '';
    this.setPadding = function (newValue) {
        this.paddingTop = newValue;
        this.paddingRight = newValue;
        this.paddingBottom = newValue;
        this.paddingLeft = newValue;
    };


    // margins
    this.marginTop = '';
    this.marginRight = '';
    this.marginBottom = '';
    this.marginLeft = '';
    this.setMargin = function (newValue) {
        this.marginTop = newValue;
        this.marginRight = newValue;
        this.marginBottom = newValue;
        this.marginLeft = newValue;
    };

    // borders
    this.borderRadius = '';

    this.borderWidthTop = '';
    this.borderWidthRight = '';
    this.borderWidthBottom = '';
    this.borderWidthLeft = '';
    this.setBorderWidth = function (newValue) {
        this.borderWidthTop = newValue;
        this.borderWidthRight = newValue;
        this.borderWidthBottom = newValue;
        this.borderWidthLeft = newValue;
    };

    this.borderStyle = '';

    this.borderColor = '';


    this.backgroundPosition = '';
    this.backgroundRepeat = '';
    this.backgroundSize = '';
    this.backgroundColor = '';
    this.backgroundUrl = '';


    /**
     * capitalize the first letter
     * @param string
     * @returns {string}
     * @private
     */
    this._cap = function (string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    };



    this._generateBorder = function () {



        if (
            this.borderWidthTop === '' &&
            this.borderWidthRight ===  '' &&
            this.borderWidthBottom ===  '' &&
            this.borderWidthLeft ===  ''
        ) {
            // if we don't have a border width, do not output anything
            return '';
        }


        // border width + style + color
        if (
            this.borderWidthTop === this.borderWidthRight &&
            this.borderWidthTop === this.borderWidthBottom &&
            this.borderWidthTop === this.borderWidthLeft &&
            this.borderStyle !== '' &&
            this.borderColor !== ''
        ) {
            // compress all in one statement
            return 'border: ' + this.borderWidthTop + 'px ' +  this.borderStyle + ' ' +  this.borderColor + ' !important;';
        }


        var buffy = '';




        for (var i=0; i<this.possitions.length; i++) {
            // border width
            if (this['borderWidth' + this._cap(this.possitions[i])] !== '') {
                buffy += 'border-' + this.possitions[i] + '-width: ' + this['borderWidth' + this._cap(this.possitions[i])] + 'px !important;';




                // border style
                if (this.borderStyle !== '') {
                    buffy += 'border-' + this.possitions[i] + '-style: ' + this.borderStyle + ' !important;';
                }


                // border color
                if (this.borderColor !== '') {
                    buffy += 'border-' + this.possitions[i] + '-color: ' + this.borderColor + ' !important;';
                }


            }



        }



        return buffy;

    };



    this.setBackgroundStyle = function (newStyle) {
        switch (newStyle) {
            case 'cover':
                this.backgroundPosition = 'center';
                this.backgroundRepeat = 'no-repeat';
                this.backgroundSize = 'cover';
                break;
            case 'contain':
                this.backgroundPosition = 'center';
                this.backgroundRepeat = 'no-repeat';
                this.backgroundSize = 'contain';
                break;
            case 'no-repeat':
                this.backgroundPosition = '0 0';
                this.backgroundRepeat = 'no-repeat';
                break;
            case 'repeat':
                this.backgroundPosition = '0 0';
                this.backgroundRepeat = 'repeat';
                break;

        }
    };

    /**
     * bg color + bg image
     * @returns {*}
     * @private
     */
    this._generateBackground = function () {
        if (this.backgroundColor !== '' && this.backgroundUrl !== '') {
            return 'background: ' + this.backgroundColor + ' url(' + this.backgroundUrl + ') !important;';
        }

        else if (this.backgroundColor !== '') {
            return 'background-color: ' + this.backgroundColor + ' !important;';
        }

        else if (this.backgroundUrl !== '') {
            return 'background-image: url(' + this.backgroundUrl + ') !important;';
        }

        return '';
    };


    this.generateCss = function () {
        var buffy = '';


        for (var i=0; i<this.possitions.length; i++) {
            // padding
            if (this['padding' + this._cap(this.possitions[i])] !== '') {
                buffy += 'padding-' + this.possitions[i] + ': ' + this['padding' + this._cap(this.possitions[i])] + 'px !important;';
            }

            // margin
            if (this['margin' + this._cap(this.possitions[i])] !== '') {
                buffy += 'margin-' + this.possitions[i] + ': ' + this['margin' + this._cap(this.possitions[i])] + 'px !important;';
            }

        }



        buffy += this._generateBackground(); // color + image

        buffy += this._generateBorder();

        if (this.borderRadius !== '') {
            buffy += 'border-radius: ' + this.borderRadius + 'px !important;';
        }


        // bg
        if (this.backgroundPosition !== '') {
            buffy += 'background-position: ' + this.backgroundPosition + ' !important;';
        }
        if (this.backgroundRepeat !== '') {
            buffy += 'background-repeat: ' + this.backgroundRepeat + ' !important;';
        }
        if (this.backgroundSize !== '') {
            buffy += 'background-size: ' + this.backgroundSize + ' !important;';
        }






        return '.vc_custom_' + Date.now() + ' {' +  buffy + '}';
    };
}









var tdcCssParser = {};


(function() {
    'use strict';

    tdcCssParser = {
        _parsedCssRaw: {}, // the css returned from parseCSS
        _cssPropertyValues: {},

        parse: function (css) {
            //parse css string
            var parser = new cssjs();
            tdcCssParser._parsedCssRaw = parser.parseCSS(css);

            // no valid css found
            if (_.isEmpty(tdcCssParser._parsedCssRaw[0])) {
                return false;
            }



            // rename the css properties for easier lookup     border-top-width  ->   border-width-top
            for (var i = 0; i < tdcCssParser._parsedCssRaw[0].rules.length; i++) {
                var currentProperty = tdcCssParser._parsedCssRaw[0].rules[i].directive;
                if (currentProperty === 'border-top-width') {
                    tdcCssParser._parsedCssRaw[0].rules[i].directive = 'border-width-top';
                }
                if (currentProperty === 'border-right-width') {
                    tdcCssParser._parsedCssRaw[0].rules[i].directive = 'border-width-right';
                }
                if (currentProperty === 'border-bottom-width') {
                    tdcCssParser._parsedCssRaw[0].rules[i].directive = 'border-width-bottom';
                }
                if (currentProperty === 'border-left-width') {
                    tdcCssParser._parsedCssRaw[0].rules[i].directive = 'border-width-left';
                }


                if (currentProperty === 'border-top-color') {
                    tdcCssParser._parsedCssRaw[0].rules[i].directive = 'border-color-top';
                }
                if (currentProperty === 'border-right-color') {
                    tdcCssParser._parsedCssRaw[0].rules[i].directive = 'border-color-right';
                }
                if (currentProperty === 'border-bottom-color') {
                    tdcCssParser._parsedCssRaw[0].rules[i].directive = 'border-color-bottom';
                }
                if (currentProperty === 'border-left-color') {
                    tdcCssParser._parsedCssRaw[0].rules[i].directive = 'border-color-left';
                }


                if (currentProperty === 'border-top-style') {
                    tdcCssParser._parsedCssRaw[0].rules[i].directive = 'border-style-top';
                }
                if (currentProperty === 'border-right-style') {
                    tdcCssParser._parsedCssRaw[0].rules[i].directive = 'border-style-right';
                }
                if (currentProperty === 'border-bottom-style') {
                    tdcCssParser._parsedCssRaw[0].rules[i].directive = 'border-style-bottom';
                }
                if (currentProperty === 'border-left-style') {
                    tdcCssParser._parsedCssRaw[0].rules[i].directive = 'border-style-left';
                }
            }
            console.log(tdcCssParser._parsedCssRaw);

        },


        _nthWord: function(str, n) {

            var words = str.split(/\s+/);

            return words[n];

        },


        /**
         * remove px, important and extracts the bg url
         * @param cssDirectiveName
         * @param str
         * @returns {*}
         * @private
         */
        _cleanCss: function (cssDirectiveName, str) {
            if (cssDirectiveName === 'background-url') {
                var urlRegex = /(url\s*\(\s*['"]?)(.*?)\s*(['"]?\s*\))/ig;
                var found = urlRegex.exec(str);
                //console.log(found);
                return found[2];
            }

            str = str.toLowerCase();
            str = str.replace(/!important|px/g, '');
            return str.trim();
        },




        getPropertyValueClean:function (cssDirectiveName) {


            // if we request the border-color, we need to start looking for the first border color
            // we don't have support for border-color this way! _getPropertyValue has support for that if we want to implement it in the future
            if (cssDirectiveName === 'border-color') {
                var borderColorTop = tdcCssParser.getPropertyValueClean('border-color-top');
                var borderColorRight = tdcCssParser.getPropertyValueClean('border-color-right');
                var borderColorBottom = tdcCssParser.getPropertyValueClean('border-color-bottom');
                var borderColorLeft = tdcCssParser.getPropertyValueClean('border-color-left');

                if (borderColorTop !== '') {
                    return borderColorTop;
                }

                else if (borderColorRight !== '') {
                    return borderColorRight;
                }

                else if (borderColorBottom !== '') {
                    return borderColorBottom;
                }

                else if (borderColorLeft !== '') {
                    return borderColorLeft;
                }
            }
            
            
            return tdcCssParser._cleanCss(cssDirectiveName, tdcCssParser._getPropertyValue(cssDirectiveName));
        },

        /**
         * For compatibility:
         * - only parses the first selector
         * - the last occurrence is returned
         * @param cssDirectiveName
         */
        _getPropertyValue: function (cssDirectiveName) {
            if (_.isUndefined(tdcCssParser._parsedCssRaw[0])) {
                return '';
            }



            // parse the rules in inverse order from last to first, the first rule we find is ok
            for (var i = tdcCssParser._parsedCssRaw[0].rules.length - 1; i >= 0; i--) {
                var currentRule = tdcCssParser._parsedCssRaw[0].rules[i];
                currentRule.directive = currentRule.directive.toLowerCase();


                // exception for margin
                if (cssDirectiveName.indexOf('margin') !== -1) {
                    if (currentRule.directive === cssDirectiveName || currentRule.directive === 'margin') {
                        return currentRule.value;
                    }
                }


                // exception for padding
                else if (cssDirectiveName.indexOf('padding') !== -1) {
                    if (currentRule.directive === cssDirectiveName || currentRule.directive === 'padding') {
                        return currentRule.value;
                    }
                }

                // exception for border-width
                else if (cssDirectiveName.indexOf('border-width') !== -1) {
                    // border: 3px solid red - get the 3px from there
                    if (currentRule.directive === 'border') {
                        return tdcCssParser._nthWord(currentRule.value, 0); // return the first word from the border
                    }

                    if (currentRule.directive === cssDirectiveName || currentRule.directive === 'border-width') {
                        return currentRule.value;
                    }
                }



                /**
                 * exception for border-color
                 * NOTE: VC does not use border-color, just the border: 3px solid red syntax
                 * http://www.w3schools.com/cssref/pr_border-left_color.asp
                 *
                 */
                // exception for border-width
                else if (cssDirectiveName.indexOf('border-color') !== -1) {
                    // border: 3px solid red - get the 3px from there
                    if (currentRule.directive === 'border') {
                        return tdcCssParser._nthWord(currentRule.value, 2); // return the first 3rd from the border
                    }

                    if (currentRule.directive === cssDirectiveName || currentRule.directive === 'border-color') {
                        return currentRule.value;
                    }
                }


                // exception for border-style
                else if (cssDirectiveName.indexOf('border-style') !== -1) {
                    // border: 3px solid red - get the 3px from there
                    if (currentRule.directive === 'border') {
                        return tdcCssParser._nthWord(currentRule.value, 1); // return the first word from the border
                    }

                    if (currentRule.directive === cssDirectiveName || currentRule.directive === 'border-style') {
                        return currentRule.value;
                    }
                }



                // exception for background color
                else if (cssDirectiveName === 'background-color') {
                    // border: 3px solid red - get the 3px from there
                    if (currentRule.directive === 'background') {
                        return tdcCssParser._nthWord(currentRule.value, 0); // return the first word from the border
                    }

                    else if (currentRule.directive === 'background-color') {
                        return currentRule.value;
                    }
                }


                // exception for background url
                else if (cssDirectiveName === 'background-url') {
                    // border: 3px solid red - get the 3px from there
                    if (currentRule.directive === 'background') {
                        return tdcCssParser._nthWord(currentRule.value, 1); // return the first word from the border
                    }

                    else if (currentRule.directive === 'background-image') {
                        return currentRule.value;
                    }
                }


                    // all others
                else if (currentRule.directive === cssDirectiveName) {
                    return currentRule.value;
                }
            }

            return '';

        }



    };

})();














var tdcMiniTest = {};


(function () {
    'use strict';
    tdcMiniTest = {

        showHeader: function (testName) {
            console.log('------------------------------------------------');
            console.log(testName + ' - Running tests..');
            console.log('-----');
        },



        assertCssProperty: function (cssProperty, expected) {
            var propertyValue = tdcCssParser.getPropertyValueClean(cssProperty);
            if (propertyValue === expected) {
                console.log(cssProperty + ': Passed');
                //console.log(cssProperty + ': Passed  (expected: |' + expected + '| got: |' + propertyValue + '|)');
            } else {
                console.log('%c' + cssProperty + ': FAILED (expected: |' + expected + '| got: |' + propertyValue + '|)', 'background: #222; color: #bada55');
            }
        }





    };
})();


//console.log(tdcCssParser._nthWord('background: #81d742 url(http://192.168.0.20/wp_011/wp-content/uploads/2016/05/4-3.jpg?id=24) !important', 2));





function racssgentest() {
    var t1 = new TdcCssGenerator();
    //t1.borderWidthTop = 5;
    t1.setBorderWidth(5);
    //t1.borderStyle = 'solid';
    t1.borderWidthTop = 1;
    t1.borderColor = '#ff11ff';
    t1.borderStyle = 'solid';

    //t1.backgroundUrl = 'http://reddit.com';
    //t1.backgroundColor = '#ffffff';

    //t1.setBackgroundStyle('contain');

    //t1.setMargin(5);

    //t1.borderRadius = '5';


    console.log(t1.generateCss());
}





function racsstest() {



    tdcMiniTest.showHeader("test1");
    // all options active
    var test1 = ".vc_custom_1464612013180{Margin-top: 1px !important;margin-right: 2px !important;margin-bottom: 3px !important;margin-left: 4px !important;border-top-width: 5px !important;border-right-width: 6px !important;border-bottom-width: 7px !important;border-left-width: 8px !important;padding-top: 9px !important;padding-right: 10px !important;padding-bottom: 11px !important;padding-left: 12px !important;background: #81d742 url(http://192.168.0.20/wp_011/wp-content/uploads/2016/05/4-3.jpg?id=24) !important;background-position: center !important;background-repeat: no-repeat !important;background-size: contain !important;border-left-color: #dd3333 !important;border-left-style: solid !important;border-right-color: #dd3333 !important;border-right-style: solid !important;border-top-color: #dd3333 !important;border-top-style: solid !important;border-bottom-color: #dd3333 !important;border-bottom-style: solid !important;border-radius: 3px !important;}";
    tdcCssParser.parse(test1);
    tdcMiniTest.assertCssProperty('margin-top',     '1');
    tdcMiniTest.assertCssProperty('margin-right',   '2');
    tdcMiniTest.assertCssProperty('margin-bottom',  '3');
    tdcMiniTest.assertCssProperty('margin-left',    '4');

    tdcMiniTest.assertCssProperty('border-radius',      '3');

    tdcMiniTest.assertCssProperty('border-width-top',   '5');
    tdcMiniTest.assertCssProperty('border-width-right', '6');
    tdcMiniTest.assertCssProperty('border-width-bottom','7');
    tdcMiniTest.assertCssProperty('border-width-left',  '8');

    tdcMiniTest.assertCssProperty('border-style-top',   'solid');
    tdcMiniTest.assertCssProperty('border-style-right', 'solid');
    tdcMiniTest.assertCssProperty('border-style-bottom','solid');
    tdcMiniTest.assertCssProperty('border-style-left',  'solid');

    tdcMiniTest.assertCssProperty('border-color-top',   '#dd3333');
    tdcMiniTest.assertCssProperty('border-color-right', '#dd3333');
    tdcMiniTest.assertCssProperty('border-color-bottom','#dd3333');
    tdcMiniTest.assertCssProperty('border-color-left',  '#dd3333');

    tdcMiniTest.assertCssProperty('padding-top',    '9');
    tdcMiniTest.assertCssProperty('padding-right',  '10');
    tdcMiniTest.assertCssProperty('padding-bottom', '11');
    tdcMiniTest.assertCssProperty('padding-left',   '12');

    tdcMiniTest.assertCssProperty('background-position', 'center');
    tdcMiniTest.assertCssProperty('background-repeat',   'no-repeat');
    tdcMiniTest.assertCssProperty('background-size',     'contain');

    tdcMiniTest.assertCssProperty('background-color', '#81d742');
    tdcMiniTest.assertCssProperty('background-url', 'http://192.168.0.20/wp_011/wp-content/uploads/2016/05/4-3.jpg?id=24');




    // bg color
    tdcMiniTest.showHeader("test_bg");
    var test_bg = ".vc_custom_1464616587407{background-color: #939393 !important;}";
    tdcCssParser.parse(test_bg);
    tdcMiniTest.assertCssProperty('background-color', '#939393');




    // bg image
    tdcMiniTest.showHeader("test_bg_img");
    var test_bg_img = ".vc_custom_1464616725143{background-image: url(http://192.168.0.20/wp_011/wp-content/uploads/2016/05/DeskWalls-26.jpg?id=7) !important;}";
    tdcCssParser.parse(test_bg_img);
    tdcMiniTest.assertCssProperty('background-url', 'http://192.168.0.20/wp_011/wp-content/uploads/2016/05/DeskWalls-26.jpg?id=7');



    // compact margins and paddings
    tdcMiniTest.showHeader("test_compact");
    var test_compact = "vc_custom_1464617086062{margin: 1px !important;border-width: 2px !important;padding: 3px !important;}";
    tdcCssParser.parse(test_compact);

    tdcMiniTest.assertCssProperty('margin-top',     '1');
    tdcMiniTest.assertCssProperty('margin-right',   '1');
    tdcMiniTest.assertCssProperty('margin-bottom',  '1');
    tdcMiniTest.assertCssProperty('margin-left',    '1');

    tdcMiniTest.assertCssProperty('border-width-top',    '2');
    tdcMiniTest.assertCssProperty('border-width-right',  '2');
    tdcMiniTest.assertCssProperty('border-width-bottom', '2');
    tdcMiniTest.assertCssProperty('border-width-left',   '2');

    tdcMiniTest.assertCssProperty('padding-top',    '3');
    tdcMiniTest.assertCssProperty('padding-right',  '3');
    tdcMiniTest.assertCssProperty('padding-bottom', '3');
    tdcMiniTest.assertCssProperty('padding-left',   '3');




    // border short
    tdcMiniTest.showHeader("border_short");
    var border_short = ".vc_custom_1464618199945{border: 1px solid #dd3333 !important;}";
    tdcCssParser.parse(border_short);

    tdcMiniTest.assertCssProperty('border-width-top',   '1');
    tdcMiniTest.assertCssProperty('border-width-right', '1');
    tdcMiniTest.assertCssProperty('border-width-bottom','1');
    tdcMiniTest.assertCssProperty('border-width-left',  '1');

    tdcMiniTest.assertCssProperty('border-style-top',   'solid');
    tdcMiniTest.assertCssProperty('border-style-right', 'solid');
    tdcMiniTest.assertCssProperty('border-style-bottom','solid');
    tdcMiniTest.assertCssProperty('border-style-left',  'solid');


    tdcMiniTest.assertCssProperty('border-color-top',   '#dd3333');
    tdcMiniTest.assertCssProperty('border-color-right', '#dd3333');
    tdcMiniTest.assertCssProperty('border-color-bottom','#dd3333');
    tdcMiniTest.assertCssProperty('border-color-left',  '#dd3333');


    /**

     * border-radius
     * border-width-top | right | bottom | left   [intarnally we use non standard naming, it should have been border-top-width ]
     * border-color-top | right | bottom | left
     * border-style-top | right | bottom | left
     * padding-top | right | bottom | left
     * margin-top | right | bottom | left
     *
     * background-position
     * background-repeat
     * background-size
     * background-color - removed when background:
     * background: color, url
     */


    //console.log(tdcCssParser.getPropertyValue('border-radius'));
    //console.log(tdcCssParser.getPropertyValue('background'));




}






















