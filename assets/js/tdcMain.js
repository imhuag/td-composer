/**
 * Created by tagdiv on 18.02.2016.
 */

/* global jQuery:{} */
/* global Backbone:{} */
/* global _:{} */

/* global tdcShortcodeParser:{} */


var tdcMain,
    tdcAdminUI,
    tdcAdminStructure,
    tdcDebug;

(function(jQuery, backbone, _, undefined){

    'use strict';


    //var TdcRow,
    //    TdcColumn,
    //    TdcInnerRow,
    //    TdcInnerColumn,
    //
    //    TdcRows,
    //    TdcColumns,
    //    TdcInnerColumns,

    var TdcModel,
        TdcCollection,
        TdcLiveView,

        // The general rows backbone collection
        tdcRows;


    tdcMain = {

        // The backbone data
        _postOriginalContentJSON: undefined,

        _shortcodeParserSettingsClone: undefined,

        _shortcodeParserSettings: {
            0: ['vc_row'],
            1: ['vc_column'],
            2: ['vc_row_inner'],     // 2+4
            3: ['vc_column_inner'],
            4: ['td_block_1', 'td_block_2', 'td_block_3', 'td_block_4', 'td_block_6', 'td_block_weather', 'vc_column_text']
        },


        init: function() {
            tdcAdminUI.init();

            tdcMain._defineStructuredData();
            tdcMain._initStructuredData();

            //console.log( JSON.stringify( tdc_rows ) );
            tdcDebug.log( tdcRows.models );


        },




        _getPostOriginalContentJSON: function() {
            if (_.isUndefined( tdcMain._postOriginalContentJSON ) && ! _.isUndefined( window.tdcPostSettings )) {

                //[vc_row][vc_column width="2/3"][td_block_1 custom_title="block1 top left" ajax_pagination="next_prev"][vc_row_inner][vc_column_inner width="1/2"][td_block_3 custom_title="block 3 top left" limit="2"][/vc_column_inner][vc_column_inner width="1/2"][td_block_2 custom_title="block2 top left" limit="2" ajax_pagination="next_prev"][/vc_column_inner][/vc_row_inner][td_block_4 custom_title="block4 top left" limit="8"][vc_row_inner][vc_column_inner width="2/3"][td_block_6 custom_title="block6 inner left"][/vc_column_inner][vc_column_inner width="1/3"][td_block_6 custom_title="Block6 inner right"][/vc_column_inner][/vc_row_inner][/vc_column][vc_column width="1/3"][td_block_2 custom_title="block2 top right" limit="2" ajax_pagination="next_prev"][vc_row_inner][vc_column_inner][td_block_3 custom_title="block3 top right" limit="2" ajax_pagination="next_prev"][td_block_weather w_location="Timisoara, ro"][/vc_column_inner][/vc_row_inner][/vc_column][/vc_row][vc_row][vc_column width="1/3"][td_block_1 custom_title="block1left" ajax_pagination="next_prev"][td_block_2 custom_title="block2left" limit="2" ajax_pagination="next_prev"][/vc_column][vc_column width="2/3"][td_block_1 custom_title="block1right" ajax_pagination="next_prev"][td_block_2 custom_title="block2right" limit="2" ajax_pagination="next_prev"][/vc_column][/vc_row]

                // We need to clone it (it's used later) because it will be changed during the init call
                tdcMain._shortcodeParserSettingsClone = _.clone( tdcMain._shortcodeParserSettings );

                tdcShortcodeParser.init( tdcMain._shortcodeParserSettings );

                tdcMain._postOriginalContentJSON = tdcShortcodeParser.parse(0, window.tdcPostSettings.postContent );
            }
            return tdcMain._postOriginalContentJSON;
        },




        _defineStructuredData: function() {

            TdcModel = Backbone.Model.extend({

                requestShortcode: function( columns ) {

                    var model = this,

                        // A builder shortcode function must be used instead
                        shortcode = model.get( 'content'),

                        newJob = new tdcJobManager.job();

                    newJob.shortcode = shortcode;
                    newJob.columns = columns;

                    newJob.liveViewId = 'test';

                    newJob.success = function( data ) {

                        tdcDebug.log( data );

                        // Important! It should have this property
                        if ( _.has( data, 'replyHtml' ) ) {
                            model.set( 'html', data.replyHtml );
                        }
                    };

                    newJob.error = function( job, errorMsg ) {
                        tdcDebug.log(errorMsg);
                        tdcDebug.log(job);
                    };

                    tdcJobManager.addJob( newJob );

                }
            });
            TdcCollection = Backbone.Collection.extend({
                model: TdcModel
            });


            TdcLiveView = Backbone.View.extend({

                initialize: function() {
                    this.listenTo( this.model, 'change', this.render );
                },

                render: function() {
                    console.log( 'render' );
                    if ( this.model.has( 'html' ) && !_.isUndefined( this.model.get( 'html' ) ) ) {
                        this.el.innerHTML = this.model.get( 'html' );
                    }
                }
            });
        },




        _initStructuredData: function() {
            var content = tdcMain._getPostOriginalContentJSON();

            tdcDebug.log( content );

            if ( content.length ) {

                tdcRows = new TdcCollection();


                var errors = {};

                _.each( content, function(element, index, list) {
                    tdcMain._getData( tdcRows, undefined, element, errors);
                });

                if ( !_.isEmpty( errors ) ) {
                    tdcDebug.log( errors );
                }


                var error;

                tdcMain.checkCurrentData( error );

                if ( !_.isUndefined( error ) ) {
                    tdcDebug.log( error );
                }
            }
        },



        /**
         * Get the model by id.
         * It looks for the model into the entire collection recursively.
         * If no collection is specified, the entire backbone structure data is used.
         *
         * @param modelId
         * @param collection
         * @returns {*}
         */
        getModel: function( modelId, collection ) {

            var model;

            if (_.isUndefined( collection ) ) {
                collection = tdcRows;
            }

            _.each( collection.models, function( element, index, list) {
                if ( !_.isUndefined( model ) ) {
                    return;
                }

                if ( element.cid === modelId ) {
                    model = element;
                    return;
                }

                //console.log( element );

                if ( element.has( 'tdc_collection') ) {
                    var tdc_collection = element.get( 'tdc_collection' );

                    model = tdcMain.getModel( modelId, tdc_collection );
                }
            });

            if ( !_.isUndefined( model ) ) {
                return model;
            }
        },


        /**
         * Initialize the backbone tdcRows collection.
         * Collects all errors happened during the initialization process.
         *
         * @param collection
         * @param parentModel
         * @param element
         * @param errors
         * @private
         */
        _getData: function( collection, parentModel, element, errors ) {

            var model,
                errorInfo;


            for ( var prop in tdcMain._shortcodeParserSettingsClone ) {

                if ( ! _.isUndefined( element.shortcode) &&
                    _.isObject( element.shortcode ) &&
                    _.has( element.shortcode, 'tag' ) &&
                    _.indexOf( tdcMain._shortcodeParserSettingsClone[ prop ], element.shortcode.tag ) !== -1 ) {


                    //
                    // Check sections
                    //
                    // The next checks were added as a supplementary check level over the JSON data builder,
                    // to be sure that the backbone structured data respects the shortcode levels


                    // not rows as the first elements
                    if ( parseInt( prop, 10 )  > 0  && _.isUndefined( parentModel ) ) {

                        errorInfo = 'Not rows as the first elements!';
                    }

                    // elements do not respect the shortcode levels: 0 -> 1 -> 2 ...
                    if ( !_.isUndefined( parentModel ) &&
                            parseInt( parentModel.get( 'level' ), 10 ) >= parseInt( prop, 10 ) ) {

                        errorInfo = 'Elements does not respect the shortcode levels!';
                    }

                    // elements respect the shortcode levels: the difference to just 1, and higher than 1 when parentModel is column (level 2) and element is block (level 4)
                    if ( !_.isUndefined( parentModel ) &&
                            parseInt( prop, 10 ) - parseInt( parentModel.get( 'level'), 10 ) > 1 &&
                            2 !== parseInt( parentModel.get( 'level' ), 10) &&
                            4 !== parseInt( prop, 10 ) ) {

                        errorInfo = 'Elements respect the shortcode levels, but the difference higher than 1 is not allowed here!';
                    }

                    if ( !_.isUndefined( errorInfo ) ) {

                        errors[ _.keys(errors).length ] = {
                            element: element,
                            info: errorInfo,
                            parentModel: parentModel
                        };
                    }


                    model = new TdcModel({
                        'content' : element.content,
                        'attrs' : element.shortcode.attrs.named,
                        'tag' : element.shortcode.tag,
                        'type' : element.shortcode.type,
                        'level' : parseInt( prop, 10 ),
                        'parentModel': parentModel
                    });

                    if ( _.has(element, 'child') && element.child.length > 0 ) {

                        model.set( 'tdc_collection', new TdcCollection() );

                        _.each( element.child, function(element, index, list) {

                            tdcMain._getData( model.get( 'tdc_collection' ), model, element, errors );
                        });

                        //for ( var i = 0; i < element.child.length; i++ ) {
                        //    console.log( errors );
                        //    tdc._getData( model.get( 'tdc_collection' ), model, element.child[i], i, element.child, errors );
                        //}
                    }
                    break;
                }
            }


            // At each step a model must be set.
            // If the model is not set, it means we have in the JSON data an element which hasn't a type present in the schortcode parser setting
            //
            // Important! We should not have the case when the model is not set, because the JSON data is obtained using shortcode parser setting
            // The previous checks were added as a supplementary check level over the JSON data builder.
            if ( ! _.isUndefined( model ) ) {
                collection.add(model);
                return;
            }

            // Important! We should not get to this step, because we parse a JSON data obtained using the same shortcode parser setting
            errors[ _.keys(errors).length ] = {
                element: element,
                info: 'Element not found!',
                parentModel: parentModel
            };
        },


        /**
         * Helper function used to check if a model of the current structure data, respects the shortcode levels
         * @param model - backbone model - The current model
         * @param error - string - The first error caught
         * @private
         */
        _checkModelData: function( model, error ) {

            var errorInfo;

            // not rows as the first elements
            if ( 0 === model.level && !_.isUndefined( model.parentModel ) ) {

                error = 'Not rows as the first elements!';
                return;
            }

            // elements do not respect the shortcode levels: 0 -> 1 -> 2 ...
            if ( !_.isUndefined( model.parentModel ) &&
                parseInt( model.parentModel.get( 'level' ), 10 ) >= parseInt( model.level, 10 ) ) {

                error = 'Elements does not respect the shortcode levels!';
                return;
            }

            // elements respect the shortcode levels: the difference to just 1, and higher than 1 when parentModel is column (level 2) and element is block (level 4)
            if ( !_.isUndefined( model.parentModel ) &&
                parseInt( model.level, 10 ) - parseInt( model.parentModel.get( 'level'), 10 ) > 1 &&
                2 !== parseInt( model.parentModel.get( 'level' ), 10) &&
                4 !== parseInt( model.level, 10 ) ) {

                error = 'Elements respect the shortcode levels, but the difference higher than 1 is not allowed here!';
                return;
            }

            if ( model.has( 'tdc_collection' ) ) {

                var tdcCollection = model.get( 'tdc_collection' );

                _.each( tdcCollection.models, function(element, index, list) {
                    tdcMain._checkModelData( tdcCollection.get( element.cid ), error );
                });
            }
        },


        /**
         * Check the current data structure to see if it respects the shortcode levels
         * @param error - string - The first error caught
         */
        checkCurrentData: function( error ) {

            _.each( tdcRows.models, function(element, index, list) {
                tdcMain._checkModelData( tdcRows.get( element.cid ), error );
            });
        },


        _getStructuredData: function() {

        }
    };









    tdcAdminUI = {

        _tdcPostSettings: undefined,
        _tdcJqObjWrapper: undefined,
        _tdcJqObjSettings: undefined,
        _tdcJqObjElements: undefined,
        _tdcJqObjInspector: undefined,
        _tdcJqObjAdd: undefined,
        _tdcJqObjSave: undefined,

        _initialized: false,


        init: function() {

            tdcAdminUI._initUI();

            // This should be marked as false if something wrong
            tdcAdminUI._initialized = true;
        },

        _initUI: function() {


            tdcAdminUI._tdcPostSettings = window.tdcPostSettings;
            tdcAdminUI._tdcJqObjWrapper = jQuery( '#tdc_wrapper');

            if ( undefined === tdcAdminUI._tdcPostSettings ||
                !tdcAdminUI._tdcJqObjWrapper.length ) {

                // Here there will be a debug console window call
                alert('something wrong');

                return;
            }



            var tdc = jQuery( '<iframe id="tdc" src="' + tdcAdminUI._tdcPostSettings.postUrl + '?td_action=tdc_edit&post_id=' + tdcAdminUI._tdcPostSettings.postId + '" ' +
            'scrolling="auto" style="width: 100%; height: 100%"></iframe>' )
                .css({
                    height: jQuery(window).innerHeight()
                })
                .load(function(){


                    var contents = jQuery(this).contents();


                    var setUI = function() {
                        tdcAdminUI._tdcJqObjSettings = jQuery('<div id="tdc_settings"></div>');

                        tdcAdminUI._tdcJqObjAdd = jQuery( '<div id="tdc_add">Add</div>' );
                        tdcAdminUI._tdcJqObjSave = jQuery( '<div id="tdc_save">Save</div>' );

                        tdcAdminUI._tdcJqObjSettings.append( tdcAdminUI._tdcJqObjAdd );
                        tdcAdminUI._tdcJqObjSettings.append( tdcAdminUI._tdcJqObjSave );

                        tdcAdminUI._tdcJqObjInspector = jQuery('<div id="tdc_inspector"></div>');

                        tdcAdminUI._tdcJqObjInspector.append( '<div class="tdc_title">Inspector</div><div class="tdc_wrapper"></div>' );

                        tdcAdminUI._tdcJqObjElements = jQuery('<div id="tdc_elements" class="test"></div>');
                        tdcAdminUI._tdcJqObjElements.append( '<div class="tdc_element">Block 1</div>' +
                        '<div class="tdc_element">Block 2</div>' );


                        contents.find('body').append( tdcAdminUI._tdcJqObjSettings );
                        contents.find('body').append( tdcAdminUI._tdcJqObjInspector );
                        contents.find('body').append( tdcAdminUI._tdcJqObjElements );


                        tdcAdminUI._tdcJqObjSettings.css({
                            height: jQuery(window).innerHeight()
                        });


                        tdcAdminUI._tdcJqObjInspector.css({
                            height: jQuery(window).innerHeight() - 75
                        });

                        tdcAdminUI._tdcJqObjAdd.click(function(event) {
                            tdcAdminUI._tdcJqObjElements.css({
                                left: 0
                            });
                        });

                        tdcAdminUI._tdcJqObjSave.click(function(event) {
                            alert( 'save the content' );
                        });
                    };

                    setUI();









                    /**
                     * Add wrappers around all shortcode dom elements
                     */
                    var addWrappers = function() {
                        contents.find( '.tdc_row')
                            .wrapAll( '<div id="tdc_rows"></div>' )
                            .each(function(index, el ) {
                                jQuery( el ).find( '.tdc_column' ).wrapAll( '<div class="tdc_columns"></div>' );
                            });



                        // all tdc_inner_rows
                        // all tdc_elements
                        contents.find( '.tdc_column').each(function(index, el ) {
                            //jQuery( el ).find( '.tdc_inner_row').wrapAll( '<div class="tdc_inner_rows"></div>');
                            //jQuery( el ).find( '.tdc_inner_rows').wrapAll( '<div class="tdc_element_inner_row"></div>');

                            jQuery( el ).find( '.tdc_inner_row').wrap( '<div class="tdc_element_inner_row"></div>');

                            jQuery( el ).find( '.td_block_wrap').wrap( '<div class="tdc_element"></div>' );
                        });



                        // all tdc_inner_columns
                        contents.find( '.tdc_inner_row').each(function(index, el ) {
                            jQuery( el).find( '.tdc_inner_column').wrapAll( '<div class="tdc_inner_columns"></div>' );
                        });



                        // all tdc_element of the tdc_inner_column, moved to the tdc_elements
                        contents.find( '.tdc_inner_column').each(function(index, el) {
                            var tdc_element = jQuery( el).find( '.tdc_element');

                            if ( tdc_element.length ) {
                                tdc_element.addClass( 'tdc_element_inner_column' ).wrapAll( '<div class="tdc_elements"></div>' );
                            } else {

                                // add sortable area if empty inner column
                                var innerMostElement = jQuery( el).find( '.wpb_wrapper' );

                                if ( innerMostElement.length ) {
                                    innerMostElement.append( '<div class="tdc_elements"></div>' );
                                }
                            }
                        });



                        // all tdc_elements not already moved to tdc_elements, moved to their new tdc_elements (columns can have their elements, which are not inside of an inner row > inner column)
                        contents.find( '.tdc_column').each(function(index, el) {

                            var tdc_element = jQuery( el).find( '.tdc_element, .tdc_element_inner_row');

                            if ( tdc_element.length ) {
                                tdc_element
                                    .not('.tdc_element_inner_column')
                                    .addClass( 'tdc_element_column' )
                                    .wrapAll( '<div class="tdc_elements"></div>' );

                                //tdc_element.attr( 'data-td_shorcode', 11);

                                var td_block_wrap = tdc_element.find( '.td_block_wrap' );
                                if ( td_block_wrap.length ) {

                                }

                            } else {

                                // add sortable area if empty columns
                                var innerMostElement = jQuery( el).find( '.wpb_wrapper' );

                                if ( innerMostElement.length ) {
                                    innerMostElement.append( '<div class="tdc_elements"></div>' );
                                }
                            }
                        });
                    };

                    addWrappers();







                    /**
                     * Create views.
                     * Bind views to DOM elements.
                     * Bind models to views.
                     * @param error
                     */
                    var bindViewsModelsWrappers = function( errors, collection, jqDOMElement, level ) {

                        if ( ! _.isEmpty( errors ) ) {
                            return;
                        }

                        if ( _.isUndefined( level ) ) {
                            level = 0;
                        }

                        if ( _.isUndefined( collection ) ) {

                            collection = tdcRows;

                            // Bind rows
                            var tdc_row = contents.find( '.tdc_row' );


                            // Stop if models number doesn't match the DOM elements number
                            if ( collection.models.length !== tdc_row.length ) {

                                errors[ _.keys(errors).length ] = {
                                    collection: collection,
                                    jqDOMElements: tdc_row,
                                    info: 'Error at rows'
                                };
                                return;
                            }


                            // Increment the level, for the next bindViewsModelsWrappers call
                            level++;

                            _.each( tdc_row, function( element, index, list ) {

                                // Get the model
                                var model = collection.models[ index ],
                                    $element = jQuery( element );

                                // Attach data 'model_id' to the DOM element
                                $element.data( 'model_id' , model.cid );

                                // Set the html attribute for the model (its changed is captured by view)
                                model.set( 'html', element.innerHTML );

                                // Create the view
                                new TdcLiveView({
                                    model: model,
                                    el: element
                                });

                                // Go deeper to the children
                                if ( model.has( 'tdc_collection' ) ) {

                                    bindViewsModelsWrappers( errors, model.get( 'tdc_collection'), $element, level );
                                }
                            });

                            level--;

                        } else {

                            var jqDOMElements;

                            switch ( level ) {

                                case 1:

                                    jqDOMElements = jqDOMElement.find( '.tdc_columns:first' ).children( '.tdc_column' );

                                    // Stop if models number doesn't match the DOM elements number
                                    if ( collection.models.length !== jqDOMElements.length ) {

                                        errors[ _.keys(errors).length ] = {
                                            collection: collection,
                                            jqDOMElements: jqDOMElements,
                                            info: 'Errors at columns',
                                            level: level
                                        };
                                        return;
                                    }

                                    break;

                                case 2:

                                    jqDOMElements = jqDOMElement.find( '.tdc_elements:first' ).children( '.tdc_element, .tdc_element_inner_row' );

                                    // Stop if models number doesn't match the DOM elements number
                                    if ( collection.models.length !== jqDOMElements.length ) {

                                        errors[ _.keys(errors).length ] = {
                                            collection: collection,
                                            jqDOMElements: jqDOMElements,
                                            info: 'Errors at columns elements',
                                            level: level
                                        };
                                        return;
                                    }

                                    break;

                                case 3:

                                    jqDOMElements = jqDOMElement.find( '.tdc_inner_columns:first' ).children( '.tdc_inner_column' );

                                    // Stop if models number doesn't match the DOM elements number
                                    if ( collection.models.length !== jqDOMElements.length ) {

                                        errors[ _.keys(errors).length ] = {
                                            collection: collection,
                                            jqDOMElements: jqDOMElements,
                                            info: 'Errors at inner columns',
                                            level: level
                                        };
                                        return;
                                    }

                                    break;

                                case 4:

                                    jqDOMElements = jqDOMElement.find( '.tdc_elements:first' ).children( '.tdc_element' );

                                    // Stop if models number doesn't match the DOM elements number
                                    if ( collection.models.length !== jqDOMElements.length ) {

                                        errors[ _.keys(errors).length ] = {
                                            collection: collection,
                                            jqDOMElements: jqDOMElements,
                                            info: 'Errors at elements',
                                            level: level
                                        };
                                        return;
                                    }

                                    break;
                            }



                            // Increment the level, for the next bindViewsModelsWrappers call
                            level++;

                            _.each( jqDOMElements, function( element, index, list ) {

                                // Get the model
                                var model = collection.models[ index ],
                                    $element = jQuery( element );

                                // Attach data 'model_id' to the DOM element
                                $element.data( 'model_id' , model.cid );

                                // Set the html attribute for the model (its changed is captured by view)
                                model.set( 'html', element.innerHTML );

                                // Create the view
                                new TdcLiveView({
                                    model: model,
                                    el: element
                                });

                                // Go deeper to the children, if the jq dom element is not tdc_element and the model has collection
                                if ( ! $element.hasClass( 'tdc_element') && model.has( 'tdc_collection' ) ) {

                                    bindViewsModelsWrappers( errors, model.get( 'tdc_collection'), $element, level );
                                }
                            });

                            // Decrement the level, for the next bindViewsModelsWrappers call
                            level--;
                        }

                    };

                    var errors = {};

                    bindViewsModelsWrappers( errors );

                    if ( ! _.isEmpty( errors ) ) {
                        for ( var prop in errors ) {
                            tdcDebug.log( errors[ prop ] );
                        }
                    }



                    tdcDebug.log( tdcRows.models );












                    var setOperationUI = function() {

                        var contentElSortSettings = {

                            items: '> .tdc_element, > .tdc_element_inner_row',

                            //helper: 'clone',

                            //helper: function() {
                            //    var bodyEl = contents.find('body');
                            //
                            //    if ( bodyEl.length ) {
                            //
                            //        var helper = bodyEl.find( '#tdc_element_sortx' );
                            //
                            //        if ( !helper.length ) {
                            //            bodyEl.append( '<div id="tdc_element_sortx" class="tdc_element_sort"></div>' );
                            //            helper = jQuery( '#tdc_element_sortx');
                            //        }
                            //        return helper;
                            //    }
                            //},

                            helper: function() {
                                return '<div id="tdc_element_sort" class="tdc_element_sort"></div>';
                            },


                            //opacity: 0.2,
                            placeholder: 'tdc-sortable-placeholder',
                            //forcePlaceholderSize: true,

                            tolerance: 'pointer',

                            cursorAt: {
                                left: 30,
                                top: 30
                            },

                            zIndex: 10000,

                            revert: 200,

                            cursor: 'move',

                            connectWith: '.tdc_elements',

                            //appendTo: document.body,
                            appendTo: contents.find('body').get(0),

                            start: function(event, ui) {

                                // Still show the selected element
                                ui.item.addClass( 'tdc_element_moving' );

                                // Important! This operation is necessary because the placeholder needs to position correctly
                                // in the container of the current item (it doesn't snap between the available items)
                                // Without it, for a correct position there's necessary to make 'over'
                                tdc_elements.sortable( 'refreshPositions' );

                                // Set position for the placeholder
                                positionPlaceholder( ui, '.tdc_elements' );

                                if ( ui.item.hasClass( 'tdc_element_inner_row' ) ) {
                                    ui.helper.addClass( 'tdc_element_sort_inner_row' );
                                }


                                //tdcDebug.log( ui.item.hasClass( 'tdc_element_inner_row' ) );
                            },

                            stop: function(event, ui) {
                                //tdcDebug.log( 'stop content' );

                                // Remove style changes of the current item
                                ui.item.removeClass( 'tdc_element_moving' );

                                //tdc_elements.removeClass( 'tdc_elements_hover' );

                                //tdcDebug.log( ui.item.data( 'test' ));

                                if ( undefined === dropEvent || ui.placeholder.hasClass( 'invalid_placeholder' ) ) {

                                    //var sortRef = jQuery(this).sortable( 'option', 'sortRef' );
                                    //sortRef.sortable( 'cancel' );

                                    jQuery(this).sortable( 'cancel' );
                                    tdcAdminUI._tdcJqObjElements.sortable( 'cancel' );

                                } else {
                                    dropEvent = undefined;


                                    // Trigger - change model

                                    var modelId = ui.item.data( 'model_id' );

                                    if (_.isUndefined( modelId ) ) {
                                        alert( 'Error: Draggable without model!' );
                                    } else {

                                        var model = tdcMain.getModel( modelId );
                                        //model.requestShortcode( '2' );

                                    }

                                }
                                tdc_elements.sortable( 'refreshPositions' );
                            },

                            over: function(event, ui) {
                                //tdcDebug.log( 'over content' );

                                event.stopPropagation();

                                //tdcDebug.log( ui.item.hasClass( 'tdc_element_inner_row' ) + ' : ' + jQuery(this).parents( '.tdc_elements').length );

                                //if ( ui.item.hasClass( 'tdc_element_inner_row' ) && jQuery(this).parents( '.tdc_elements').length ) {
                                //    ui.placeholder.hide();
                                //    return;
                                //}

                                // Position placeholder - it even shows it
                                positionPlaceholder( ui, '.tdc_elements' );

                                // Show the placeholder
                                //ui.placeholder.show();

                                // Active hover list
                                //setHoverList( ui, tdc_elements, '.tdc_elements', 'tdc_elements_hover' );
                            },

                            out: function(event, ui) {
                                //tdcDebug.log( 'out content' );

                                ui.placeholder.hide();
                                //tdc_elements.removeClass( 'tdc_elements_hover' );
                            },

                            change: function(event, ui) {
                                //tdcDebug.log( 'change content' );

                                //if ( ui.item.hasClass( 'tdc_element_inner_row' ) && ( jQuery(this).parents( '.tdc_elements').length || ui.placeholder.parents( '.tdc_elements').length > 1 ) ) {
                                //if ( ui.item.hasClass( 'tdc_element_inner_row' ) && jQuery(this).parents( '.tdc_elements').length ) {
                                //    ui.placeholder.hide();
                                //    return;
                                //}

                                // Active hover list
                                //setHoverList( ui, tdc_elements, '.tdc_elements', 'tdc_elements_hover' );

                                // Set position for the placeholder
                                positionPlaceholder( ui, '.tdc_elements' );
                            }
                        };


                        // Merge defaults and options, without modifying defaults
                        var definedElSortSettings = jQuery.extend( {}, contentElSortSettings, {

                            revert: false,

                            over: function(event, ui) {

                                // Hide the placeholder
                                ui.placeholder.hide();

                                // Still show the selected element
                                ui.item.addClass( 'tdc_element_moving' );

                                //tdcDebug.log( 'over defined' );
                            },

                            start: function(event, ui) {
                                ui.item.td_shortcode = ui.item.get(0).innerText;
                            },

                            stop: function(event, ui) {

                                if ( undefined !== dropEvent ) {
                                    dropEvent = undefined;
                                }

                                tdcAdminUI._tdcJqObjElements.sortable( 'cancel' );

                                // Remove style changes of the current item
                                ui.item.removeClass( 'tdc_element_moving' );

                                //tdcDebug.log( 'stop defined' );
                            }
                        });






                        var timeoutPositionPlaceholder;

                        /**
                         * - Position the placeholder at the top or at the bottom of the screen, when it's outside of the viewport
                         * - A timer is used because before any placeholder movement, it must be set to a default position, and that position
                         * is then checked if it's or not, outside of the viewport.
                         * @param ui
                         */
                        var positionPlaceholder = function(ui, jqSelector ) {

                            ui.placeholder.show();

                            if ( undefined !== timeoutPositionPlaceholder ) {
                                clearTimeout( timeoutPositionPlaceholder );

                                ui.placeholder.show();
                                ui.placeholder.css({
                                    'position': '',
                                    'top': '',
                                    'left' : '',
                                    'width': '',
                                    'visibility': 'hidden'
                                });
                            }

                            timeoutPositionPlaceholder = setTimeout(function() {

                                if ( ui.item.hasClass( 'tdc_element_inner_row' ) && ui.placeholder.parents( jqSelector).length > 1 ) {

                                    if ( ui.placeholder.closest( '.tdc_elements' ).hasClass( 'tdc_elements_hover' ) ) {
                                        ui.placeholder.show();
                                    } else {


                                        // Insert placeholder into the top most list content, according with the mouse position and the existing placeholder

                                        var currentEl = ui.placeholder.closest( '.tdc_element_inner_row' );

                                        if ( undefined !== ui.placeholder.offset() ) {
                                            if ( ui.helper.position().top + ui.helper.outerHeight( true ) / 2 > ui.placeholder.offset().top ) {

                                                ui.placeholder.insertBefore( currentEl );

                                            } else if ( ui.helper.position().top + ui.helper.outerHeight( true ) / 2 < ui.placeholder.offset().top ) {

                                                ui.placeholder.insertAfter( currentEl );

                                            }
                                        } else {

                                            ui.placeholder.insertBefore( currentEl );

                                        }

                                        ui.placeholder.parents( '.tdc_elements').last().addClass( 'tdc_elements_hover' );
                                    }
                                }


                                var tdcElementsParent = ui.placeholder.closest( jqSelector ),
                                    cssWidthValue = tdcElementsParent.outerWidth(true),
                                    cssLeftValue = cssWidthValue / 2;

                                if ( undefined !== tdcElementsParent.offset() ) {
                                    cssLeftValue += tdcElementsParent.offset().left;
                                }


                                if ( ( ui.placeholder.offset().top + parseInt( ui.placeholder.outerHeight( true ) ) ) > (contents.scrollTop() + window.innerHeight) ) {
                                    ui.placeholder.css({
                                        'position': 'fixed',
                                        'top' : window.innerHeight - 50,
                                        'left' : cssLeftValue,
                                        'width': cssWidthValue
                                    });
                                } else if ( ui.placeholder.offset().top < contents.scrollTop() ) {
                                    ui.placeholder.css({
                                        'position': 'fixed',
                                        'top' : 0,
                                        'left' : cssLeftValue,
                                        'width' : cssWidthValue
                                    });
                                } else {
                                    ui.placeholder.css({
                                        'position': '',
                                        'top': '',
                                        'left' : '',
                                        'width': ''
                                    });
                                }

                                ui.placeholder.css( 'visibility', 'visible');

                            }, 100);
                        };




                        /**
                         * Remove the hover property from any already set list and add it to the closest list
                         * @param ui
                         * @param jqLists
                         * @param jqSelectorList
                         * @param jqSelectorHoverClass
                         */
                        var setHoverList = function(ui, jqLists, jqSelectorList, jqSelectorHoverClass ) {

                            return;

                            jqLists.removeClass( jqSelectorHoverClass );

                            ui.placeholder.parents( jqSelectorList ).removeClass( jqSelectorHoverClass );

                            // The current sortable list is marked as active
                            ui.placeholder.closest( jqSelectorList ).addClass( jqSelectorHoverClass );
                        };





                        var tdc_elements = contents.find('.tdc_elements');

                        tdc_elements.each(function(index, el) {
                            var settings = jQuery.extend({}, contentElSortSettings, {
                                sortRef: jQuery(el)
                            });
                            jQuery(el).sortable( settings ).disableSelection();
                        });





                        var dropEvent;

                        var inner_tdc_element = tdc_elements.filter(function() {

                            return ( jQuery(this).parents( '.tdc_elements').length > 0 );

                        }).droppable({

                            accept: '.tdc_element',

                            greedy: true,

                            drop: function (event, ui) {
                                //tdcDebug.log( 'drop tdc_element on inner list' );

                                //tdcDebug.log( ui.draggable);

                                if ( ui.draggable.hasClass( 'tdc_element_inner_row' ) ) {
                                    dropEvent = undefined;
                                } else {
                                    dropEvent = event;
                                }
                            },
                            //
                            over: function(event, ui) {
                                //tdcDebug.log( 'over inside list' );
                            },
                            //
                            out: function(event, ui) {
                                //tdcDebug.log( 'out inside list' );
                            },

                            //activate: function( event, ui) {
                            //    jQuery(this).addClass( 'tdc_elements_active' );
                            //    tdcDebug.log( ui.draggable);
                            //},
                            //
                            //deactivate: function( event, ui) {
                            //    jQuery(this).removeClass( 'tdc_elements_active' );
                            //}

                            activeClass: 'tdc_elements_active',
                            hoverClass: 'tdc_elements_hover'
                        });






                        var outer_tdc_elements = tdc_elements.filter(function() {

                            return ( 0 === jQuery(this).parents( '.tdc_elements').length );

                        }).droppable({

                            accept: '.tdc_element, .tdc_element_inner_row',

                            greedy: true,

                            drop: function (event, ui) {
                                //tdcDebug.log( 'drop tdc_element or tdc_element_inner_row on outer list' );

                                //tdcDebug.log( ui.draggable);

                                //tdcDebug.log( event.target);
                                //tdcDebug.log( event.currentTarget);

                                dropEvent = event;

                                //tdcDebug.log( '2Request for ' + ui.draggable.td_shortcode );
                            },
                            //
                            over: function(event, ui) {
                                //tdcDebug.log( 'over outside list' );
                            },
                            //
                            out: function(event, ui) {
                                //tdcDebug.log( 'out outside list' );
                            },

                            //activate: function( event, ui) {
                            //    jQuery(this).addClass( 'tdc_elements_active' );
                            //},
                            //
                            //deactivate: function( event, ui) {
                            //    jQuery(this).removeClass( 'tdc_elements_active' );
                            //}

                            activeClass: 'tdc_elements_active',
                            hoverClass: 'tdc_elements_hover'
                        });


                        tdcAdminUI._tdcJqObjElements.sortable( definedElSortSettings ).disableSelection();

















                        var makeRowsSortable = function() {

                            var tdc_rows = contents.find( '#tdc_rows' );

                            tdc_rows.sortable({
                                items: '> .tdc_row',

                                helper: function() {
                                    return '<div id="tdc_row_sort" class="tdc_row_sort"></div>';
                                },

                                tolerance: 'pointer',

                                cursorAt: {
                                    left: 100,
                                    top: 30
                                },

                                zIndex: 10000,

                                revert: 200,

                                cursor: 'move',

                                placeholder: 'tdc-sortable-placeholder',

                                //appendTo: document.body,
                                appendTo: contents.find('body').get(0),

                                start: function(event, ui) {

                                    // Still show the selected element
                                    ui.item.addClass( 'tdc_row_moving' );


                                    // Important! This operation is necessary because the placeholder needs to position correctly
                                    // in the container of the current item (it doesn't snap between the available items)
                                    // Without it, for a correct position there's necessary to make 'over'
                                    tdc_rows.sortable( 'refreshPositions' );

                                    positionPlaceholder(ui, '#tdc_rows' );
                                },

                                stop: function(event, ui) {
                                    //tdcDebug.log( 'stop sortable row' );

                                    // Remove style changes of the current item
                                    ui.item.removeClass( 'tdc_row_moving' );

                                    //tdc_rows.removeClass( 'tdc_rows_hover' );

                                    //tdcDebug.log( ui.item.data( 'test' ));

                                    if ( undefined === dropEvent ) {

                                        jQuery(this).sortable( 'cancel' );
                                        tdcAdminUI._tdcJqObjElements.sortable( 'cancel' );

                                    } else {
                                        dropEvent = undefined;
                                    }
                                    tdc_rows.sortable( 'refreshPositions' );
                                },

                                over: function(event, ui) {
                                    //tdcDebug.log( 'over sortable row' );

                                    positionPlaceholder(ui, '#tdc_rows' );

                                    // Show the placeholder
                                    ui.placeholder.show();

                                },

                                out: function(event, ui) {
                                    //tdcDebug.log( 'out sortable row' );

                                    ui.placeholder.hide();
                                },

                                change: function(event, ui) {
                                    //tdcDebug.log( 'change sortable row' );

                                    // Set position for the placeholder
                                    positionPlaceholder(ui, '#tdc_rows' );
                                }

                            }).disableSelection();


                            tdc_rows.droppable({

                                accept: '.tdc_row',

                                drop: function (event, ui) {
                                    //tdcDebug.log( 'drop droppable row' );

                                    dropEvent = event;
                                },
                                //
                                over: function(event, ui) {
                                    //tdcDebug.log( 'over droppable row' );
                                },
                                //
                                out: function(event, ui) {
                                    //tdcDebug.log( 'out droppable row' );
                                },

                                activeClass: 'tdc_elements_active',
                                hoverClass: 'tdc_elements_hover'


                                // Important! We can't use hoverClass because the dragged item is not displayed 'none'
                                // and because of this, the position is miscalculated
                                //hoverClass: 'tdc_elements_hover'
                            });
                        };

                        makeRowsSortable();

                    };

                    setOperationUI();





                });

            tdcAdminUI._tdcJqObjWrapper.append( tdc );

        }
    };



    tdcMain.init();




})(jQuery, Backbone, _);
