/**
 * Sidebar Panel Generator
 * Created by ra on 5/5/2016.
 */


/* global jQuery:{} */
/* global Backbone:{} */
/* global _:{} */

/* tdcAdminSettings */

var tdcSidebarPanel = {};


(function () {
    'use strict';


    tdcSidebarPanel = {

        _defaultGroupName: 'General', // where to put params that don't have a group


        _curBlockUid: '', // the Uid of the current selected block. This changes on each block render job!

        /**
         * we just hook the dom events here
         */
        init: function () {



            // dropdown hook
            jQuery('body').on('change', '.tdc-property-dropdown:not(.tdc-row-col-dropdown):not(.tdc-innerRow-col-dropdown) select', function() {
                console.log('on change: Select');
            });

            // textfield hook @todo throttling here
            jQuery('body').on('keyup', '.tdc-property-textfield input', function() {

                var model = tdcIFrameData.getModel( jQuery(this).data('model_id') );
                tdcSidebarController.onUpdate(model, jQuery(this).data('param_name'), jQuery(this).val(), tdcSidebarPanel._curBlockUid);




                //console.log('on change: textfield ' + jQuery(this).data('model_id') + ' ' + jQuery(this).data('param_name') + ' ' + jQuery(this).val());

            });


            // colorpicker (change for colropicker, keyup for clear)
            jQuery('body').on('change keyup', '.tdc-property-colorpicker input', function() {
                console.log('on change: colorpicker');
            });






            // hook the custom row dropdown
            jQuery('body').on('change', '.tdc-row-col-dropdown select', function() {
                console.log('on change: row dropdown');
            });

            // hook the custom row dropdown
            jQuery('body').on('change', '.tdc-innerRow-col-dropdown select', function() {
                console.log('on change: innerRow dropdown');
            });



        },


        /**
         *
         * @param $curDomBit - may be a row or column or element DOM etc...
         */
        bindPanelToDomElement: function ($curDomBit) {
            return;


            var modelId = $curDomBit.data( 'model_id' );
            var model = tdcIFrameData.getModel( modelId );


            // Get the dragged element id
            var draggedBlockUid = '',
                $tdBlockInner = $curDomBit.find( '.td_block_inner');

            if ( $tdBlockInner.length ) {
                tdcSidebarPanel._curBlockUid = $tdBlockInner.attr( 'id' );
            }

            // model.attributes.attrs
            //var mappedShortCode = window.tdcAdminSettings.mappedShortcodes[model.attributes.attrs];


            // get the mapped shortcode for this model
            var mappedShortCode = window.tdcAdminSettings.mappedShortcodes[model.attributes.tag];



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


            var buffy = '';









            // tabs - top
            buffy += '<div class="tdc-tabs">';
                for (cnt = 0; cnt < allGroupNames.length; cnt++) {
                    if (cnt === 0) {
                        buffy += '<a href="#" data-tab-id="td-tab-' + tdcUtil.makeSafeForCSS(allGroupNames[cnt]) + '" class="tdc-tab-active">' + allGroupNames[cnt] + '</a>';
                    } else {
                        buffy += '<a href="#" data-tab-id="td-tab-' + tdcUtil.makeSafeForCSS(allGroupNames[cnt]) + '">' + allGroupNames[cnt] + '</a>';
                    }

                }
            buffy += '</div>';


            // tabs - content
            buffy += '<div class="tdc-tab-content-wrap">';
                for (cnt = 0; cnt < allGroupNames.length; cnt++) {
                    if (cnt === 0) {
                        buffy += '<div class="tdc-tab-content tdc-tab-content-visible" id="td-tab-' + tdcUtil.makeSafeForCSS(allGroupNames[cnt]) + '">';
                    } else {
                        buffy += '<div class="tdc-tab-content" id="td-tab-' + tdcUtil.makeSafeForCSS(allGroupNames[cnt]) + '">';
                    }

                        // tab content
                        buffy += tdcSidebarPanel._bindGroupAndGetHtml(allGroupNames[cnt], mappedShortCode, model);


                    buffy += '</div>'; // close tab content wrap
                }
            buffy += '</div>';

            jQuery('.tdc-inspector .tdc-tabs-wrapper').html(buffy);



            // step 2 - distribute content to the tabs







            //console.log(buffy);

            //console.log(mappedShortCode);
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
            return;
            console.log('clear  _deletePanel ');
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
            if (_.isEmpty(model.attributes.attrs[mappedParameter.param_name])) {
                return mappedParameter.value; // return the 'default' value
            }

            return model.attributes.attrs[mappedParameter.param_name];
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
                    buffy += '<input id="' + colorPickerId + '" name="' + tdcSidebarPanel._getParameterDomName(mappedParameter) + '" type="text" value="' + tdcSidebarPanel._getParameterCurrentValue(mappedParameter, model) + '"/>';
                buffy += '</div>';
            buffy += '</div>';


            setTimeout(function() {
                jQuery("#" + colorPickerId).cs_wpColorPicker();
            }, 1000);



            return buffy;


        },


        addDropDown: function (mappedParameter, model) {
            var buffy = '';

            // make the selectOptions
            var selectOptions = '';
            var keys = Object.keys(mappedParameter.value);
            for (var i = 0; i < keys.length; i++) {
                var value = mappedParameter.value[keys[i]];
                selectOptions += '<option value="' + value + '">' + keys[i] + '</option>';
            }




            buffy += '<div class="' + tdcSidebarPanel._getParameterClasses(mappedParameter) + '">';
                buffy += '<div class="tdc-property-title">' + mappedParameter.heading + ':</div>';
                buffy += '<div class="tdc-property">';
                    buffy += '<select>';
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
        addDropdown: function () {

        },

        addTextAreaHtml: function () {

        },

        addCssEditor: function () {

        }


    };


    tdcSidebarPanel.init();
})();