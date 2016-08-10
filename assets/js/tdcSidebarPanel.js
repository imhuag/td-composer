/**
 * Sidebar Panel Generator
 * Created by ra on 5/5/2016.
 */

/* global tdcNotice:{} */

/* global jQuery:{} */
/* global Backbone:{} */
/* global _:{} */

/* tdcAdminSettings */

var tdcSidebarPanel = {};


(function ( undefined ) {
    'use strict';


    tdcSidebarPanel = {

        _defaultGroupName: 'General', // where to put params that don't have a group


        // Current model bound to the panel @see tdcSidebarPanel.bindPanelToModel
        _currentBoundModel: undefined,


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
            var $body = jQuery('body');


            // dropdown hook
            $body.on('change focus', '.tdc-property-dropdown:not(.tdc-row-col-dropdown):not(.tdc-innerRow-col-dropdown) select', function() {
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
            $body.on('keyup focus', '.tdc-property-textfield input', function(event) {

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



            // checkbox hook
            $body.on('focus change', '.tdc-property-checkbox input', function(event) {

                // save the oldValue on focus in
                if (event.type === 'focusin') {
                    this.oldValue = this.value;
                    return;
                }

                var $this = jQuery( this );

                var curValue = $this.val();
                if ( !$this.is( ':checked' ) ) {
                    curValue = '';
                }

                var model = tdcIFrameData.getModel( $this.data('model_id') );

                tdcSidebarController.onUpdate (
                    model,
                    $this.data( 'param_name' ),    // the name of the parameter
                    this.oldValue,                      // the old value
                    curValue                 // the new value
                );
                this.oldValue = curValue;
            });



            // on image click
            $body.on( 'click', '.tdc-image-wrap', function(event) {

                var $this = jQuery(this);
                window.original_send_to_editor = window.send_to_editor;
                wp.media.editor.open( $this );

                window.send_to_editor = function(html) {
                    var img_link = jQuery('img', html).attr('src');
                    if(typeof img_link === 'undefined') {
                        img_link = jQuery(html).attr('src');
                    }

                    $this.closest( '.tdc-property' ).find('.tdc-image-remove').removeClass('tdc-hidden-button');

                    $this.attr( 'style', 'background-image: url( \'' + img_link + '\') ');
                    $this.data( 'image_link', img_link );
                    $this.removeClass('tdc-no-image-selected');

                    //reset the send_to_editor function to its original state
                    window.send_to_editor = window.original_send_to_editor;

                    //close the modal window
                    tb_remove();

                    var curValue = '';

                    if ( ! $this.hasClass( 'tdc-no-image-selected' ) ) {

                        if ( $this.parent().parent( '.tdc-bg-upload' ).length ) {
                            curValue = tdcCssEditorTab._generateCssAttValue();
                        } else {
                            curValue = img_link;
                        }
                    }

                    // fire the bg change event
                    var model = tdcIFrameData.getModel( $this.data('model_id') );
                    tdcSidebarController.onUpdate (
                        model,
                        $this.data('param_name'),    // the name of the parameter
                        '',                     // the old value
                        curValue                 // the new value
                    );
                };
                return false;

            });

            // on remove image button click
            $body.on( 'click', '.tdc-image-remove', function(event) {
                var $this = jQuery( this ),
                    $tdcImageWrap = $this.closest( '.tdc-property' ).find('.tdc-image-wrap');

                $this.addClass( 'tdc-hidden-button' );

                $tdcImageWrap.addClass('tdc-no-image-selected');
                jQuery.removeData( $tdcImageWrap, 'image_link' );
                $tdcImageWrap.attr('style', 'background-image: url( \'' + window.tdcAdminSettings.pluginUrl +  '/assets/images/sidebar/no_img.png\'' );

                // fire the bg change event
                var model = tdcIFrameData.getModel( $tdcImageWrap.data('model_id') );
                tdcSidebarController.onUpdate (
                    model,
                    $tdcImageWrap.data('param_name'),    // the name of the parameter
                    '',                      // the old value
                    ''                 // the new value
                );
            });





            // colorpicker (change for colrpicker, keyup for clear)
            $body.on('change keyup focus', '.tdc-property-colorpicker input', function(event) {
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
            $body.on( 'change focus', '.tdc-row-col-dropdown select', function () {

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
                    rowModel.getShortcodeRender( 1, null, true );

                } else {
                    //throw 'Invalid row change detected: this.oldValue:' + this.oldValue + ' and curValue: ' + curValue;
                    new tdcNotice.notice( 'Invalid row change detected: this.oldValue:' + this.oldValue + ' and curValue: ' + curValue, false, true );
                }

                this.oldValue = curValue;

            });




            // hook the custom innerRow dropdown
            $body.on('change focus', '.tdc-innerRow-col-dropdown select', function() {

                // save the oldValue on focus in
                if (event.type === 'focusin' || event.type === 'focus') { // the select raises a focus event instead of focusin
                    this.oldValue = this.value;
                    return;
                }

                var curValue = jQuery(this).val(),
                    innerRowModelId = tdcSidebar._$currentInnerRow.data( 'model_id' ),
                    innerRowModel = tdcIFrameData.getModel( innerRowModelId );

                tdcIFrameData.changeInnerRowModel( innerRowModel, this.oldValue, curValue);

                innerRowModel.getShortcodeRender( 1, null, true );

                this.oldValue = curValue;
            });


            // hook the custom innerRow dropdown
            $body.on('change focus', '.tdc-widget-sidebar-dropdown select', function() {

                // save the oldValue on focus in
                if (event.type === 'focusin' || event.type === 'focus') { // the select raises a focus event instead of focusin
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




        },


        /**
         * This binds the panel to the model settings. The tdcSidebarPanel._currentBoundModel keeps the already bound model, to avoid rebinding.
         * The rebinding can be allowed using the 'forceRebind' param.
         *
         * Important! The tdcSidebar.setSettings method set the sidebar panel
         * It's called once at mousedown to set the sidebar panel (at mousedown because we needed it before mousemove)
         * It's called later at mouseup to set the sidebar panel, actually to update the breadcrumbs of the sidebar panel
         * Being called twice, the bindPanelToModel method is called twice
         *
         * @param model - the sidebar panel is bound to this model
         * @param forceRebind - optional - boolean - if true it force a model to be rebind to the panel.
         */
        bindPanelToModel: function (model, forceRebind ) {

            // Do nothing if the model is already bound @todo See if we need to force a rebind for the same model
            if ( ! _.isUndefined( tdcSidebarPanel._currentBoundModel ) && tdcSidebarPanel._currentBoundModel.cid === model.cid && ( _.isUndefined( forceRebind ) || ( ! _.isUndefined( forceRebind ) && true !== forceRebind ) ) ) {
                return;
            }

            // get the mapped shortcode for this model
            var mappedShortCode = window.tdcAdminSettings.mappedShortcodes[model.attributes.tag];
            //tdcDebug.log( mappedShortCode );


            // step 0 - delete the old panel. HTML + items
            tdcSidebarPanel._deletePanel();

            jQuery('.tdc-empty-sidebar').hide();

            // Set the currentBoundModel
            tdcSidebarPanel._currentBoundModel = model;


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

            var currentGroup = '';

            var currentTabId = tdcSidebar.getCurrentTabId();

            // tabs - top
            panelHtml += '<div class="tdc-tabs">';

                var firstElementActive = '',
                    firstElementInactive = '',
                    panelHtmlBuffer = '';

                for (cnt = 0; cnt < allGroupNames.length; cnt++) {

                    currentGroup = tdcSidebarPanel._fixGroupName(allGroupNames[cnt]);

                    var tabId = tdcUtil.makeSafeForCSS(currentGroup);

                    //tdcDebug.log( tabId );

                    if ( 0 === cnt ) {
                        firstElementActive = '<a href="#" data-tab-id="td-tab-' + tabId + '" class="tdc-tab-active">' + currentGroup + '</a>';
                        firstElementInactive = '<a href="#" data-tab-id="td-tab-' + tabId + '">' + currentGroup + '</a>';

                    } else if ( ! _.isUndefined( currentTabId ) && currentTabId === 'td-tab-' + tabId ) {
                        firstElementActive = firstElementInactive;
                        panelHtmlBuffer += '<a href="#" data-tab-id="td-tab-' + tabId + '" class="tdc-tab-active">' + currentGroup + '</a>';
                    } else {
                        panelHtmlBuffer += '<a href="#" data-tab-id="td-tab-' + tabId + '">' + currentGroup + '</a>';
                    }
                }
                panelHtml += firstElementActive + panelHtmlBuffer;

            panelHtml += '</div>';


            // tabs - content
            panelHtml += '<div class="tdc-tab-content-wrap">';

                var firstElementActive = '',
                    firstElementInactive = '',
                    panelHtmlBuffer = '';

                for (cnt = 0; cnt < allGroupNames.length; cnt++) {
                    currentGroup = tdcSidebarPanel._fixGroupName(allGroupNames[cnt]);

                    var tabId = tdcUtil.makeSafeForCSS(currentGroup);

                    if ( 0 === cnt ) {
                        firstElementActive = '<div class="tdc-tab-content tdc-tab-content-visible" id="td-tab-' + tabId + '">';
                        firstElementInactive = '<div class="tdc-tab-content" id="td-tab-' + tabId + '">';

                    } else if ( ! _.isUndefined( currentTabId ) && currentTabId === 'td-tab-' + tabId ) {
                        firstElementActive = firstElementInactive;
                        panelHtmlBuffer += '<div class="tdc-tab-content tdc-tab-content-visible" id="td-tab-' + tabId + '">';
                    } else {
                        panelHtmlBuffer += '<div class="tdc-tab-content" id="td-tab-' + tabId + '">';
                    }

                    // tab content
                    panelHtmlBuffer += tdcSidebarPanel._bindGroupAndGetHtml(allGroupNames[cnt], mappedShortCode, model);

                    panelHtmlBuffer += '</div>'; // close tab content wrap
                }
                panelHtml += firstElementActive + panelHtmlBuffer;

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

                case 'checkbox':
                    return tdcSidebarPanel.addCheckBox( mappedParameter, model );

                case 'image':
                    return tdcSidebarPanel.addUploadImage( mappedParameter, model );

                case 'textfield':
                    return tdcSidebarPanel.addTextField(mappedParameter, model);

                case 'textarea_html':
                    return tdcSidebarPanel.addTextAreaHtml(mappedParameter, model);

                case 'textarea_raw_html':
                    return tdcSidebarPanel.addTextAreaRawHtml(mappedParameter, model);

                case 'css_editor':
                    return tdcCssEditorTab.addCssEditor(mappedParameter, model);

                case 'horizontal_separator':
                    return tdcSidebarPanel.addSeparatorHorizontal();

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

            // @todo The hook callback stack should be cleaned!
            tdcSidebarPanel._hook._hooks = [];

            // the current bound model is deleted
            tdcSidebarPanel._currentBoundModel = undefined;

            jQuery('.tdc-breadcrumbs').hide();
            jQuery('.tdc-inspector .tdc-current-element-head').empty();
            jQuery('.tdc-inspector .tdc-tabs-wrapper').empty();

            jQuery('.tdc-empty-sidebar').show();
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

            mappedClasses += ' tdc-property-' + mappedParameter.param_name;

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

                // if no default value in map, return an empty string just like vc
                if (_.isEmpty(mappedParameter.value)) {
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
         * adds model id and param_name @todo we may need to remove this, macar model id -ul s-ar putea tine in calasa ca sa nu-l mai luam din dom
         * @param mappedParameter
         * @param model
         * @returns {string}
         * @private
         */
        _getParamterDataAtts: function (mappedParameter, model) {
            return 'data-model_id="' + model.cid +  '" data-param_name="' + mappedParameter.param_name + '"';
        },


        _fixGroupName: function (oldGroupName) {

            switch (oldGroupName) {
                case 'Design options':
                    return 'Css';

                case 'Pagination':
                    return 'Extra';

                case 'Ajax filter':
                    return 'Ajax';

            }



            return oldGroupName;
        },


        /**
         * The public method that should ensure the sidebar panel is cleaned and ready to be repopulated with items.
         * Here we should include any other clean operations
         */
        clearPanel: function() {

            // @todo Maybe the sidebar panel should be cleaned! For the moment, only the deletePanel is called
            tdcSidebarPanel._deletePanel();
        },



        addColorpicker: function (mappedParameter, model) {

            var tooltip = '';
            if ( _.has( mappedParameter, 'description' ) && '' !== mappedParameter.description ) {
                tooltip = ' title="' + mappedParameter.description + '" ';
            }

            var buffy = '';
            var colorPickerId = _.uniqueId();
            buffy += '<div class="' + tdcSidebarPanel._getParameterClasses(mappedParameter) + '">';
                buffy += '<div class="tdc-property-title"><span' + tooltip + '>' + mappedParameter.heading + '</span></div>';
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



            var tooltip = '';

            if ( _.has( mappedParameter, 'description' ) && '' !== mappedParameter.description ) {
                tooltip = ' title="' + mappedParameter.description + '" ';
            }

            buffy += '<div class="' + tdcSidebarPanel._getParameterClasses(mappedParameter) + '">';
                buffy += '<div class="tdc-property-title"><span' + tooltip + '>' + mappedParameter.heading + '</span></div>';
                buffy += '<div class="tdc-property">';
                    buffy += '<select ' + tdcSidebarPanel._getParamterDataAtts(mappedParameter, model) + ' name="' + tdcSidebarPanel._getParameterDomName(mappedParameter) + '">';
                        buffy += selectOptions;
                    buffy += '</select>';
                buffy += '</div>';
            buffy += '</div>';



            return buffy;
        },



        addCheckBox: function( mappedParameter, model ) {
            var tooltip = '';
            if ( _.has( mappedParameter, 'description' ) && '' !== mappedParameter.description ) {
                tooltip = ' title="' + mappedParameter.description + '" ';
            }

            var checked = '';
            if ( '' !== tdcSidebarPanel._getParameterCurrentValue(mappedParameter, model) ) {
                checked = ' checked ';
            }

            var buffy = '';
            buffy += '<div class="' + tdcSidebarPanel._getParameterClasses(mappedParameter) + '">';
            buffy += '<div class="tdc-property-title"><span' + tooltip + '>' + mappedParameter.heading + '</span></div>';
            buffy += '<div class="tdc-property">';
            buffy += '<input ' + tdcSidebarPanel._getParamterDataAtts(mappedParameter, model) + ' name="' + tdcSidebarPanel._getParameterDomName(mappedParameter) + '" type="checkbox" value="yes" ' + checked + '/>';
            buffy += '</div>';
            buffy += '</div>';


            return buffy;
        },


        addUploadImage: function (mappedParameter, model) {

            var tooltip = '';
            if ( _.has( mappedParameter, 'description' ) && '' !== mappedParameter.description ) {
                tooltip = ' title="' + mappedParameter.description + '" ';
            }

            var buffy = '';

            // bg upload
            buffy += '<div class="' + tdcSidebarPanel._getParameterClasses(mappedParameter) + '">';
            buffy += '<div class="tdc-property-title"><span' + tooltip + '>' + mappedParameter.heading + '</span></div>';
            buffy += '<div class="tdc-property">';
            buffy += '<div class="tdc-image-wrap tdc-no-image-selected" ' + tdcSidebarPanel._getParamterDataAtts(mappedParameter, model) + ' style="background-image: url( \'' + window.tdcAdminSettings.pluginUrl + '/assets/images/sidebar/no_img.png\' )">';
            buffy += '</div>';
            buffy += '<a class="tdc-image-remove tdc-hidden-button" href="#" >Remove</a>';
            buffy += '</div>';
            buffy += '</div>';

            tdcSidebarPanel._hook.addAction( 'panel_rendered', function () {

                // read the value and show the image + remove button
                var currentImageUrl = tdcSidebarPanel._getParameterCurrentValue(mappedParameter, model),
                    currentBgUrl = tdcCssParser.getPropertyValueClean( 'background-url' );

                jQuery('.tdc-image-wrap').each( function( index, element ) {
                    var $element = jQuery( element );

                    //alert( mappedParameter.param_name );

                    if ( $element.parent().parent( '.tdc-bg-upload' ).length && '' !== currentBgUrl ) {

                        $element
                            .attr( 'style', 'background-image: url(\'' + currentBgUrl + '\'' )
                            .removeClass('tdc-no-image-selected');

                        $element.data( 'image_link', currentBgUrl );

                        $element.closest( '.tdc-property' ).find( '.tdc-image-remove' ).removeClass( 'tdc-hidden-button' );

                        return;
                    }

                    if ( mappedParameter.param_name === $element.data( 'param_name' ) ) {

                        if ( '' !== currentImageUrl ) {
                            $element
                                .attr( 'style', 'background-image: url(\'' + currentImageUrl + '\'' )
                                .removeClass('tdc-no-image-selected');

                            $element.data( 'image_link', currentImageUrl );

                            $element.closest( '.tdc-property' ).find( '.tdc-image-remove' ).removeClass( 'tdc-hidden-button' );
                        }

                        return;
                    }
                });
            });

            return buffy;
        },



        addTextArea: function () {

        },

        addTextField: function (mappedParameter, model) {

            var tooltip = '';
            if ( _.has( mappedParameter, 'description' ) && '' !== mappedParameter.description ) {
                tooltip = ' title="' + mappedParameter.description + '" ';
            }

            //console.log(mappedParameter);
            var buffy = '';
            buffy += '<div class="' + tdcSidebarPanel._getParameterClasses(mappedParameter) + '">';
                buffy += '<div class="tdc-property-title"><span' + tooltip + '>' + mappedParameter.heading + '</span></div>';
                buffy += '<div class="tdc-property">';
                    buffy += '<input ' + tdcSidebarPanel._getParamterDataAtts(mappedParameter, model) + ' name="' + tdcSidebarPanel._getParameterDomName(mappedParameter) + '" type="text" value="' + tdcSidebarPanel._getParameterCurrentValue(mappedParameter, model) + '"/>';
                buffy += '</div>';
            buffy += '</div>';


            return buffy;
        },


        addTextAreaHtml: function (mappedParameter, model) {

            var tooltip = '';
            if ( _.has( mappedParameter, 'description' ) && '' !== mappedParameter.description ) {
                tooltip = ' title="' + mappedParameter.description + '" ';
            }

            var tinymceId = _.uniqueId( 'tdc_tinymce_' );

            var buffy = '';
            buffy += '<div class="' + tdcSidebarPanel._getParameterClasses(mappedParameter) + '">';
            buffy += '<div class="tdc-property-title"><span' + tooltip + '>' + mappedParameter.heading + '</span></div>';
            buffy += '<div class="tdc-property">';
            buffy += '<div id="' + tinymceId + '" ' + tdcSidebarPanel._getParamterDataAtts(mappedParameter, model) + '>' + tdcSidebarPanel._getParameterCurrentValue(mappedParameter, model) + '</div>';
            buffy += '</div>';
            buffy += '</div>';


            /**
             * There were some attempts to reuse a tinymce instance once it has been created, but destroying the DOM elements that has been referenced by the editor,
             * there's no tinymce API support to rebind it (as I can see!). This means a new tinymce editor should be created!
             *
             * Important! Even though the existing tinymce editor (once previously created) is found and removed, the tinymce.EditorManager keep a reference to it (@todo Is it a bug or what?)
             */
            tdcSidebarPanel._hook.addAction( 'panel_rendered', function () {

                var existingEditor = tinymce.get( tinymceId );

                if ( ! _.isNull( existingEditor ) ) {
                    tinymce.remove( tinymceId );
                }

                var newEditor = tinymce.createEditor( tinymceId, {

                    // Disable menu bar
                    menubar: false,

                    setup: function( editor ) {

                        var $input = jQuery( '#' + tinymceId );

                        var model = tdcIFrameData.getModel( $input.data( 'model_id' ) );

                        editor.on( 'keyup change undo', function( event ) {

                            var currentValue = editor.getContent({format: 'html'}),

                            // @todo This should be the content before change
                                previousValue = currentValue;

                            tdcSidebarController.onUpdate (
                                model,
                                $input.data( 'param_name' ),    // the name of the parameter
                                previousValue,                  // the old value
                                currentValue                    // the new value
                            );
                        });
                    }
                });

                newEditor.render();
            });

            return buffy;
        },

        addTextAreaRawHtml: function (mappedParameter, model) {

            var textareaId = _.uniqueId( 'tdc_textarea_' );

            var tooltip = '';
            if ( _.has( mappedParameter, 'description' ) && '' !== mappedParameter.description ) {
                tooltip = ' title="' + mappedParameter.description + '" ';
            }

            var buffy = '';
            buffy += '<div class="' + tdcSidebarPanel._getParameterClasses(mappedParameter) + '">';
            buffy += '<div class="tdc-property-title"><span' + tooltip + '>' + mappedParameter.heading + '</span></div>';
            buffy += '<div class="tdc-property">';
            buffy += '<textarea id="' + textareaId + '" class="tdc-textarea" ' + tdcSidebarPanel._getParamterDataAtts(mappedParameter, model) + '>' + tdcSidebarPanel._getParameterCurrentValue(mappedParameter, model) + '</textarea>';
            buffy += '</div>';
            buffy += '</div>';

            jQuery.ajax({
                timeout: 10000,
                type: 'POST',

                // uuid is for browser cache busting
                url: tdcUtil.getRestEndPoint('td-composer/decode_html_content', 'uuid=' + tdcJobManager._getUniqueID()),


                // add the nonce used for cookie authentication
                beforeSend: function ( xhr ) {
                    xhr.setRequestHeader( 'X-WP-Nonce', window.tdcAdminSettings.wpRestNonce);
                },
                //url: ajaxurl,
                dataType: 'json',
                data: {
                    post_id: window.tdcPostSettings.postId,
                    action: 'tdc_ajax_decode_html_content',
                    content: tdcSidebarPanel._getParameterCurrentValue(mappedParameter, model)
                }
            }).done(function( data, textStatus, jqXHR ) {

                if ( 'success' === textStatus ) {
                    if ( _.isObject( data ) && _.has( data, 'errors' ) ) {
                        new tdcNotice.notice( data.errors, true, false );
                    } else {
                        jQuery( '#' + textareaId ).html( data.parsed_content ).show();
                    }
                }

            }).fail(function( jqXHR, textStatus, errorThrown ) {

            });

            var $body = jQuery('body');

            $body.on( 'keyup', '#' + textareaId, function(event) {

                var $input = jQuery( event.target ),
                    model = tdcIFrameData.getModel( $input.data( 'model_id' ) );

                var currentValue = window.btoa( $input.val() ),

                // @todo This should be the content before change
                    previousValue = currentValue;

                tdcSidebarController.onUpdate (
                    model,
                    $input.data( 'param_name' ),    // the name of the parameter
                    previousValue,                  // the old value
                    currentValue                    // the new value
                );
            });


            return buffy;
        },


        addSeparatorHorizontal: function() {
            var buffy = '';

            buffy += '<div class="tdc-sidebar-horizontal-separator">...............</div>';

            return buffy;
        }





    };


    tdcSidebarPanel.init();
})();













