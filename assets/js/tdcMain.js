/**
 * Created by tagdiv on 18.02.2016.
 */

/* global jQuery:{} */
/* global Backbone:{} */
/* global _:{} */

/* global tdcShortcodeParser:{} */
/* global tdcAdminWrapperUI:{} */


var tdcMain,
    tdcAdminIFrameUI,
    tdcAdminStructure,
    tdcDebug;

(function(jQuery, backbone, _, undefined) {

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
            tdcAdminIFrameUI.init();

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

                getShortcodeRender: function( containerDestinationParentModel, columns, newPosition ) {

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

                            // Update the 'html' attribute (This will trigger an event)
                            model.set( 'html', data.replyHtml );

                            // Change the model structure
                            var parentModel = model.get( 'parentModel' ),
                                modelParentChildCollection = parentModel.get( 'childCollection' ),
                                containerDestinationParentModelChildCollection = containerDestinationParentModel.get( 'childCollection' );

                            modelParentChildCollection.remove( model );
                            containerDestinationParentModelChildCollection.add( model, { at: newPosition } );
                            model.set( 'parentModel', containerDestinationParentModel );

                            //tdcDebug.log(containerDestinationParentModelChildCollection);
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
                    this.listenTo( this.model, 'change:html', this.render );
                },

                render: function( model, value, options) {
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


                var data = {
                    error: undefined,
                    shortcode: undefined
                };

                tdcMain.checkCurrentData( data );

                if ( !_.isUndefined( data.error ) ) {
                    tdcDebug.log( data.error );
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

                if ( element.has( 'childCollection') ) {
                    var childCollection = element.get( 'childCollection' );

                    model = tdcMain.getModel( modelId, childCollection );
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

                        model.set( 'childCollection', new TdcCollection() );

                        _.each( element.child, function(element, index, list) {

                            tdcMain._getData( model.get( 'childCollection' ), model, element, errors );
                        });

                        //for ( var i = 0; i < element.child.length; i++ ) {
                        //    console.log( errors );
                        //    tdc._getData( model.get( 'childCollection' ), model, element.child[i], i, element.child, errors );
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
         * @param data - object - Ref.object {error: the first error caught; getShortcode: param that collects the shortcode structure}
         * @private
         */
        _checkModelData: function( model, data ) {

            // Do not continue anymore. This step is for '_each' calls
            if ( ! _.isUndefined( data.error ) ) {
                return;
            }


            // not rows as the first elements
            if ( 0 === model.level && !_.isUndefined( model.parentModel ) ) {

                data.error = 'Not rows as the first elements!';
                return;
            }

            // elements do not respect the shortcode levels: 0 -> 1 -> 2 ...
            if ( !_.isUndefined( model.parentModel ) &&
                parseInt( model.parentModel.get( 'level' ), 10 ) >= parseInt( model.level, 10 ) ) {

                data.error = 'Elements does not respect the shortcode levels!';
                return;
            }

            // elements respect the shortcode levels: the difference to just 1, and higher than 1 when parentModel is column (level 2) and element is block (level 4)
            if ( !_.isUndefined( model.parentModel ) &&
                parseInt( model.level, 10 ) - parseInt( model.parentModel.get( 'level'), 10 ) > 1 &&
                2 !== parseInt( model.parentModel.get( 'level' ), 10) &&
                4 !== parseInt( model.level, 10 ) ) {

                data.error = 'Elements respect the shortcode levels, but the difference higher than 1 is not allowed here!';
                return;
            }



            // - This is an step required for getting shortcodes
            // - For each level of the tree data structure, there is a temp property added to the 'data' param, each temp property being 'tempShortcodeDeepLevel' + level number
            // In this data['tempShortcodeDeepLevel' + level number] the already checked nodes from the same level are saved (actually their shortcodes)
            // - Obviously, these temp properties are initialized with empty string when a new level starts and are marked as undefined when a level stops
            //
            // (Important! Here the level means the deep of the tree data structure and not level of shortcode levels)

            if ( ! _.isUndefined( data.getShortcode ) && _.isUndefined( data.deepLevel ) ) {
                data.deepLevel = 0;
                data['tempShortcodeDeepLevel' + data.deepLevel ] = '';
            }



            // Go deeper
            if ( model.has( 'childCollection' ) ) {


                // If getting shortcodes, prepare data for the next iteration step
                if ( ! _.isUndefined( data.getShortcode ) ) {
                    data.deepLevel++;
                    data['tempShortcodeDeepLevel' + data.deepLevel ] = '';
                }



                var tdcCollection = model.get( 'childCollection' );

                _.each( tdcCollection.models, function(element, index, list) {
                    tdcMain._checkModelData( tdcCollection.get( element.cid ), data );
                });




                // If getting shortcodes, prepare data for the next iteration step
                if ( ! _.isUndefined( data.getShortcode ) ) {
                    data.deepLevel--;
                }
            }



            //Get the shortcode if the 'data.getShortcode' param is required (not undefined) and there's no error
            if ( ! _.isUndefined( data.getShortcode ) ) {

                var modelType = model.get( 'type' ),
                    modelTag = model.get( 'tag' ),
                    modelAttrs = model.get( 'attrs' ),

                    localShortcode = '';

                _.map( modelAttrs, function( val, key ) {
                    localShortcode += ' ' + key + '="' + val + '"';
                });


                switch ( modelType ) {

                    case 'single' :

                        localShortcode = '[' + modelTag + localShortcode + ']';

                        break;

                    case 'closed':

                        var childShortcode = '';

                        // It happens that a closed shortcode not having child shortcodes
                        if ( !_.isUndefined( data[ 'tempShortcodeDeepLevel' + ( parseInt( data.deepLevel )  + 1 ) ] ) ) {
                            childShortcode = data[ 'tempShortcodeDeepLevel' + ( parseInt( data.deepLevel ) + 1 ) ];
                            data[ 'tempShortcodeDeepLevel' + ( parseInt( data.deepLevel ) + 1 ) ] = undefined;
                        }
                        localShortcode = '[' + modelTag + localShortcode + ']' + childShortcode + '[/' + modelTag + ']';

                        break;
                }

                data['tempShortcodeDeepLevel' + data.deepLevel] += localShortcode;

                //tdcDebug.log( data['tempShortcodeDeepLevel' + data.deepLevel] );

                if ( 0 === data.deepLevel ) {
                    data.getShortcode += localShortcode;
                }
            }
        },




        /**
         * Check the current data structure to see if it respects the shortcode levels
         * @param data - object - Ref.object {error: the first error caught; getShortcode: param that collects the shortcode structure}
         */
        checkCurrentData: function( data ) {

            _.each( tdcRows.models, function(element, index, list) {
                tdcMain._checkModelData( tdcRows.get( element.cid ), data );
            });
        },


        _getStructuredData: function() {

        },


        /**
         * Important! This function should be called only by 'stop' sortable handler
         * Steps:
         * 1. Get the model of the draggable element
         * 2. Get the model of the destination container (column or inner column) that contains the sortable list (the list where the element is dropped)
         * 3. Request to the model of the element, to update its 'html property'
         *      3.1 Get the 'column' from the model of the container
         *      3.2 Make the request
         *      3.3 Wait for the response
         * 4. If success, update the structure data
         * 5. If error, ???
         *
         * @param jqSortableList
         * @param uiObject
         */
        changeData: function( jqSortableList, uiObject ) {


            // Step1 ----------

            // The item model id
            var elementModelId = uiObject.item.data( 'model_id' );

            // @todo This check should be removed - the content should have consistency
            if ( _.isUndefined( elementModelId ) ) {
                alert( 'Error: Element model id!' );
                return;
            }


            // The item model
            var elementModel = tdcMain.getModel( elementModelId );

            // @todo This check should be removed - the content should have consistency
            if ( _.isUndefined( elementModel ) ) {
                alert( 'Error: Element model!' );
                return;
            }



            // Step2 ----------

            // Get the closest inner column (maybe the sortable list is in an inner row)
            var containerDestinationParent = jqSortableList.closest( '.tdc_inner_column' );

            // Get the closest column, if the sortable list is not inside of an inner row
            if ( ! containerDestinationParent.length ) {
                containerDestinationParent = jqSortableList.closest( '.tdc_column' );
            }

            // @todo This check should be removed - the content should have consistency
            if ( ! containerDestinationParent.length || _.isUndefined( containerDestinationParent.data( 'model_id' ) ) ) {
                alert( 'Error: Container destination (column or inner column) not available!' );
                return;
            }


            // The model id (where the item model must be inserted)
            var containerDestinationParentModelId = containerDestinationParent.data( 'model_id');

            // @todo This check should be removed - the content should have consistency
            if ( _.isUndefined( containerDestinationParentModelId ) ) {
                alert( 'Error: Container model id!' );
                return;
            }

            // The model (where the item model must be inserted)
            var containerDestinationParentModel = tdcMain.getModel( containerDestinationParentModelId );

            // @todo This check should be removed - the content should have consistency
            if ( _.isUndefined( containerDestinationParentModel ) ) {
                alert( 'Error: Column parent model!' );
                return;
            }



            //tdcDebug.log( elementModelId );
            //tdcDebug.log( containerDestinationParentModelId );

            // Step3 ----------

            var containerParentModelAttrs = containerDestinationParentModel.get( 'attrs'),
                colParam = 1;

            // @todo This check should be removed - the content should have consistency
            if (! _.has( containerParentModelAttrs, 'width ') ) {
                colParam = containerParentModelAttrs.width;
            }


            // Filter of the column param
            switch ( colParam ) {
                case '1/3' : colParam = 1; break;
                case '2/3' : colParam = 2; break;
                case '3/3' : colParam = 3; break;
            }

            // The new position of the element model in the 'childCollection' property of the containerDestinationParentModel
            var newPosition = uiObject.item.index();

            elementModel.getShortcodeRender( containerDestinationParentModel, colParam, newPosition );
        },






        getShortcodeFromData: function( data ) {

            // We force initialize param shortcode to '', to be sure that '_checkModel' will get the shortcode, otherwise it will only check for error structures
            data.getShortcode = '';

            _.each( tdcRows.models, function(element, index, list) {
                tdcMain._checkModelData( tdcRows.get( element.cid ), data );
            });
        }








    };


    tdcAdminIFrameUI = _.extend( {}, tdcAdminWrapperUI );

    tdcAdminIFrameUI.init = function() {

        tdcAdminIFrameUI._initUI();

        // This should be marked as false if something wrong
        tdcAdminIFrameUI._initialized = true;
    };

    tdcAdminIFrameUI._initUI = function() {

        tdcAdminIFrameUI._tdcPostSettings = window.tdcPostSettings;





        if ( undefined === tdcAdminIFrameUI._tdcPostSettings ||
            !tdcAdminIFrameUI._tdcJqObjWrapper.length ) {

            // Here there will be a debug console window call
            alert('something wrong');

            return;
        }

        var tdc = jQuery( '<iframe id="tdc" src="' + tdcAdminIFrameUI._tdcPostSettings.postUrl + '?td_action=tdc_edit&post_id=' + tdcAdminIFrameUI._tdcPostSettings.postId + '" ' +
        'scrolling="auto" style="width: 100%; height: 100%"></iframe>' )
            .css({
                height: jQuery(window).innerHeight()
            })
            .load(function(){

                var $this = jQuery(this);

                var contents = jQuery(this).contents();


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
                            if ( model.has( 'childCollection' ) ) {

                                bindViewsModelsWrappers( errors, model.get( 'childCollection'), $element, level );
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
                            if ( ! $element.hasClass( 'tdc_element') && model.has( 'childCollection' ) ) {

                                bindViewsModelsWrappers( errors, model.get( 'childCollection'), $element, level );
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














                function setOperationUI() {

                    var

                    // The 'tdc_element' elements (tagdiv blocks)
                        tdc_element = contents.find( '.tdc_element'),

                    // The 'tdc_elements' elements
                        tdc_elements = contents.find( '.tdc_elements'),

                    // The 'tdc_row' elements
                        tdc_row = contents.find( '.tdc_row' ),

                    // The 'tdc_column' elements
                        tdc_column = contents.find( '.tdc_column' ),

                    // The 'tdc_element_inner_row' elements
                        tdc_element_inner_row = contents.find( '.tdc_element_inner_row' ),

                    // The 'tdc_inner_column' elements
                        tdc_inner_column = contents.find( '.tdc_inner_column' ),

                    // The 'tdc_element', 'tdc_inner_column', 'tdc_element_inner_row', 'tdc_column' or 'tdc_row'  being dragged
                        draggedElement,

                    // The 'tdc_element', 'tdc_inner_column', 'tdc_element_inner_row', 'tdc_column' or 'tdc_row' where the 'draggedElement' is over
                        current_element_over;


                    function activeDraggedElement( currentElement ) {
                        draggedElement = currentElement;
                        draggedElement.css({
                            opacity: 0.5
                        });
                        draggedElement.addClass( 'tdc_dragged' );
                        console.log( 'ACTIVATE' );
                        console.log( draggedElement );
                    }

                    function deactiveDraggedElement() {
                        if ( ! _.isUndefined( draggedElement ) ) {
                            draggedElement.css({
                                opacity: ''
                            });
                            draggedElement.removeClass( 'tdc_dragged' );

                            console.log( 'DEACTIVATE' );
                            console.log( draggedElement );

                            draggedElement = undefined;
                        } else {
                            console.log( 'dragged UNDEFINED' );
                        }
                    }

                    function showHelper( mouseEvent ) {
                        var $helper = tdcAdminIFrameUI._tdcJqObjHelper;
                        if ( ! _.isUndefined( draggedElement ) ) {
                            $helper.css({
                                left: mouseEvent.clientX - 50,
                                top: mouseEvent.clientY - 50
                            });
                            $helper.show();

                            if ( draggedElement.hasClass( 'tdc_row' ) ) {
                                $helper.html( 'ROW' );
                            } else if ( draggedElement.hasClass( 'tdc_column' ) ) {
                                $helper.html( 'COLUMN' );
                            } else if ( draggedElement.hasClass( 'tdc_element_inner_row' ) ) {
                                $helper.html( 'INNER ROW' );
                            } else if ( draggedElement.hasClass( 'tdc_inner_column' ) ) {
                                $helper.html( 'INNER COLUMN' );
                            } else if ( draggedElement.hasClass( 'tdc_element' ) ) {
                                $helper.html( 'ELEMENT' );
                            } else {
                                $helper.html( '' );
                            }
                        } else {
                            hideHelper();
                        }
                    }

                    function hideHelper() {
                        tdcAdminIFrameUI._tdcJqObjHelper.hide();
                    }





                    function isRowDragged() {
                        return !_.isUndefined( draggedElement ) && draggedElement.hasClass( 'tdc_row' );
                    }


                    /**
                     * Check the dragged element is a column.
                     * If the optional $siblingColumn parameter is used, it also checks to see if the sent column is sibling with the dragged element
                     *
                     * @param $siblingColumn - optional - jQuery column object under the mouse pointer
                     * @returns {boolean|*}
                     */
                    function isColumnDragged( $siblingColumn ) {

                        var result = !_.isUndefined( draggedElement ) && draggedElement.hasClass( 'tdc_column' );

                        if ( ! _.isUndefined( $siblingColumn ) ) {
                            result = result && ( $siblingColumn.closest( '.tdc_columns').find( '.tdc_column.tdc_dragged').length > 0 );
                        }
                        return result;
                    }


                    function isInnerRowDragged() {
                        return !_.isUndefined( draggedElement ) && draggedElement.hasClass( 'tdc_element_inner_row' );
                    }


                    function isInnerColumnDragged( $siblingInnerColumn ) {
                        var result = !_.isUndefined( draggedElement ) && draggedElement.hasClass( 'tdc_inner_column' );

                        if ( ! _.isUndefined( $siblingInnerColumn ) ) {
                            result = result && ( $siblingInnerColumn.closest( '.tdc_inner_columns').find( '.tdc_inner_column.tdc_dragged').length > 0 );
                        }
                        return result;
                    }


                    function isElementDragged() {
                        return !_.isUndefined( draggedElement ) && draggedElement.hasClass( 'tdc_element' );
                    }





                    function _setPlaceholder( classes, props ) {

                        var $placeholder = tdcAdminIFrameUI._tdcJqObjPlaceholder;

                        if ( _.isArray( classes ) ) {
                            _.each( classes, function( element, index, list) {
                                $placeholder.addClass( element );
                            });
                        } else if ( _.isString( classes ) ) {
                            $placeholder.addClass( classes );
                        } else {
                            $placeholder.attr( 'class', '' );
                        }

                        if ( _.isObject( props ) ) {
                            $placeholder.css( props );
                        }
                    }

                    function setHorizontalPlaceholder() {
                        _setPlaceholder( null, {
                            'top': '',
                            'left': '',
                            'bottom': '',
                            'margin-left': '',
                            'position': ''
                        });
                    }

                    function setVerticalPlaceholder( props ) {
                        _setPlaceholder( ['vertical'], props);
                    }




                    window.previousMouseClientX = 0;
                    window.previousMouseClientY = 0;




                    function positionElementPlaceholder( event ) {

                        //console.log( event );

                        var $placeholder = tdcAdminIFrameUI._tdcJqObjPlaceholder;

                        // Adapt the placeholder to look great when it's not on columns and inner-columns
                        setHorizontalPlaceholder();


                        // The mouse position.
                        // This is used as a mark value.
                        // When an element is in 'drag' operation, the 'scroll' of the contents does not fire 'hover' ('mouseenter' and 'mouseleave') event
                        // over the content, and, to solve this issue, a custom event ('fakemouseenterevent') with the mouse position, must be triggered to all 'tdc_element' elements,
                        // to see which has the mouse over
                        var mousePointerValue = {
                            X: 0,
                            Y: 0
                        };

                        // Check if we have 'mousemove' or 'fakemouseenterevent'
                        if ( 'mousemove' === event.type || 'fakemouseenterevent' === event.type ) {

                            mousePointerValue.X = event.pageX;
                            mousePointerValue.Y = event.pageY;

                            // These are saved here, and used at 'scroll', for computing the mouse position over a 'tdc_element' element
                            if ( !_.isUndefined( event.clientX ) && !_.isUndefined( event.clientY ) ) {
                                window.previousMouseClientX = event.clientX;
                                window.previousMouseClientY = event.clientY;
                            }

                        } else if ( 'scroll' === event.type ) {
                            //console.log( event.delegateTarget.scrollingElement.scrollTop + ' : ' + window.previousMouseClientY );

                            mousePointerValue.X = contents.scrollLeft() + window.previousMouseClientX;
                            mousePointerValue.Y = contents.scrollTop() + window.previousMouseClientY;

                            var eventProp = {
                                'pageX' : mousePointerValue.X,
                                'pageY' : mousePointerValue.Y
                            };

                            //console.log( eventProp );


                            // Try to find where the mouse is.
                            // Trigger a custom event for all 'tdc_element' elements, but stop if one is found

                            // Set the 'current_element_over' to undefined, to be find in the iteration
                            current_element_over = undefined;

                            // Trigger a 'fakemouseenterevent' event, for all 'tdc_element' elements, or until the variable 'current_element_over' is set to one of them
                            tdc_element.each(function( index, element ) {

                                if ( ! _.isUndefined( current_element_over ) ) {
                                    // If it's not undefined, ( marked by 'fakemouseenterevent' event of the 'tdc_element' ) DO NOTHING (DO NOT TRIGGER ANY MORE 'fakemouseenterevent' EVENT)
                                    return;
                                }
                                jQuery( element ).trigger( jQuery.Event( 'fakemouseenterevent', eventProp ) );
                            });

                            tdc_element_inner_row.each(function( index, element ) {

                                if ( ! _.isUndefined( current_element_over ) ) {
                                    // If it's not undefined, ( marked by 'fakemouseenterevent' event of the 'tdc_element_inner_row' ) DO NOTHING (DO NOT TRIGGER ANY MORE 'fakemouseenterevent' EVENT)
                                    return;
                                }
                                jQuery( element ).trigger( jQuery.Event( 'fakemouseenterevent', eventProp ) );
                            });
                            return;
                        }

                        // Hide the placeholder and stop
                        if ( _.isUndefined( draggedElement ) ||
                            _.isUndefined( current_element_over ) ) {

                            // Hide the placeholder when we are over the dragged element
                            //( ! _.isUndefined( current_element_over ) && current_element_over.hasClass( 'tdc_dragged' ) ) ) {

                            $placeholder.hide();
                            return;
                        }


                        // If a 'tdc_element' is dragged and the 'current_element_over' is not undefined, show and position the placeholder
                        $placeholder.show();


                        var elementOuterHeight = current_element_over.outerHeight( true );
                        var elementOuterWidth = current_element_over.innerWidth();
                        var elementOffset = current_element_over.offset();

                        console.log( mousePointerValue.Y + ' : ' +  ( elementOffset.top + ( elementOuterHeight / 2 ) ) );

                        if ( mousePointerValue.Y > elementOffset.top + ( elementOuterHeight / 2 ) ) {

                            current_element_over.after( $placeholder );

                            // Position the placeholder at the bottom of the screen
                            if (parseInt(elementOffset.top) + parseInt(elementOuterHeight) > parseInt(contents.scrollTop()) + parseInt(window.innerHeight)) {
                                $placeholder.css({
                                    'position': 'fixed',
                                    'top': '',
                                    'right': 'auto',
                                    'bottom': '0',
                                    'width': parseInt(elementOuterWidth / 2) + 'px'
                                });
                            } else {
                                // Reset
                                $placeholder.css({
                                    'position': 'absolute',
                                    'top': '',
                                    'right': '0',
                                    'bottom': '',
                                    'width': ''
                                });
                            }
                        } else {
                            current_element_over.before($placeholder);

                            // Position the placeholder at the top of the screen
                            if (parseInt(elementOffset.top) < parseInt(contents.scrollTop())) {
                                $placeholder.css({
                                    'position': 'fixed',
                                    'top': '0',
                                    'right': 'auto',
                                    'bottom': '',
                                    'width': parseInt(elementOuterWidth / 2) + 'px'
                                });
                            } else {
                                // Reset
                                $placeholder.css({
                                    'position': 'absolute',
                                    'top': '',
                                    'right': '0',
                                    'bottom': '',
                                    'width': ''
                                });
                            }
                        }

                        // Hide the placeholder if it's near the dragged element
                        //if ( $placeholder.next().length && $placeholder.next().hasClass( 'tdc_dragged' ) ||
                        //    $placeholder.prev().length && $placeholder.prev().hasClass( 'tdc_dragged' ) ) {
                        //    $placeholder.hide();
                        //}
                    }





                    function positionRowPlaceholder( event ) {
                        //console.log( event );

                        var $placeholder = tdcAdminIFrameUI._tdcJqObjPlaceholder;

                        // Adapt the placeholder to look great when it's not on columns and inner-columns
                        setHorizontalPlaceholder();

                        // The mouse position.
                        // This is used as a mark value.
                        // When an element is in 'drag' operation, the 'scroll' of the contents does not fire 'hover' ('mouseenter' and 'mouseleave') event
                        // over the content, and, to solve this issue, a custom event ('fakemouseenterevent') with the mouse position, must be triggered to all 'tdc_element' elements,
                        // to see which has the mouse over
                        var mousePointerValue = {
                            X: 0,
                            Y: 0
                        };

                        // Check if we have 'mousemove' or 'fakemouseenterevent'
                        if ( 'mousemove' === event.type || 'fakemouseenterevent' === event.type ) {

                            mousePointerValue.X = event.pageX;
                            mousePointerValue.Y = event.pageY;

                            // These are saved here, and used at 'scroll', for computing the mouse position over a 'tdc_element' element
                            if ( !_.isUndefined( event.clientX ) && !_.isUndefined( event.clientY ) ) {
                                window.previousMouseClientX = event.clientX;
                                window.previousMouseClientY = event.clientY;
                            }

                        } else if ( 'scroll' === event.type ) {
                            //console.log( event.delegateTarget.scrollingElement.scrollTop + ' : ' + window.previousMouseClientY );

                            mousePointerValue.X = contents.scrollLeft() + window.previousMouseClientX;
                            mousePointerValue.Y = contents.scrollTop() + window.previousMouseClientY;

                            var eventProp = {
                                'pageX' : mousePointerValue.X,
                                'pageY' : mousePointerValue.Y
                            };

                            //console.log( eventProp );


                            // Try to find where the mouse is.
                            // Trigger a custom event for all 'tdc_row' elements, but stop if one is found

                            // Set the 'current_element_over' to undefined, to be find in the iteration
                            current_element_over = undefined;

                            // Trigger an 'fakemouseenterevent' event, for all 'tdc_row' elements, or until the variable 'current_element_over' is set to one of them
                            tdc_row.each(function( index, element ) {

                                if ( ! _.isUndefined( current_element_over ) ) {
                                    // If it's not undefined, ( marked by 'fakemouseenterevent' event of the 'tdc_row' ) DO NOTHING (DO NOT TRIGGER ANY MORE 'fakemouseenterevent' EVENT)
                                    return;
                                }
                                jQuery( element ).trigger( jQuery.Event( 'fakemouseenterevent', eventProp ) );
                            });
                            return;
                        }



                        // Hide the placeholder and stop
                        if ( _.isUndefined( draggedElement ) ||
                            _.isUndefined( current_element_over ) ) {

                            // Hide the placeholder when we are over the dragged element
                            //( ! _.isUndefined( current_element_over ) && current_element_over.hasClass( 'tdc_dragged' ) ) ) {

                            $placeholder.hide();
                            return;
                        }


                        // If a 'tdc_row' is dragged and the 'current_element_over' is not undefined, show and position the placeholder
                        $placeholder.show();


                        var elementOuterHeight = current_element_over.outerHeight( true );
                        var elementOuterWidth = current_element_over.innerWidth();
                        var elementOffset = current_element_over.offset();

                        //console.log( mousePointerValue.Y + ' : ' +  ( elementOffset.top + ( elementOuterHeight / 2 ) ) );

                        if ( mousePointerValue.Y > elementOffset.top + ( elementOuterHeight / 2 ) ) {

                            current_element_over.after($placeholder);

                            // Position the placeholder at the bottom of the screen
                            if (parseInt(elementOffset.top) + parseInt(elementOuterHeight) > parseInt(contents.scrollTop()) + parseInt(window.innerHeight)) {
                                $placeholder.css({
                                    'position': 'fixed',
                                    'top': '',
                                    'right': 'auto',
                                    'bottom': '0',
                                    'width': parseInt(elementOuterWidth / 2) + 'px'
                                });
                            } else {
                                // Reset
                                $placeholder.css({
                                    'position': 'absolute',
                                    'top': '',
                                    'right': '0',
                                    'bottom': '',
                                    'width': ''
                                });
                            }
                        } else {
                            current_element_over.before($placeholder);

                            // Position the placeholder at the top of the screen
                            if (parseInt(elementOffset.top) < parseInt(contents.scrollTop())) {
                                $placeholder.css({
                                    'position': 'fixed',
                                    'top': '0',
                                    'right': 'auto',
                                    'bottom': '',
                                    'width': parseInt(elementOuterWidth / 2) + 'px'
                                });
                            } else {
                                // Reset
                                $placeholder.css({
                                    'position': 'absolute',
                                    'top': '',
                                    'right': '0',
                                    'bottom': '',
                                    'width': ''
                                });
                            }
                        }

                        // Hide the placeholder if it's near the dragged element
                        //if ( $placeholder.next().length && $placeholder.next().hasClass( 'tdc_dragged' ) ||
                        //    $placeholder.prev().length && $placeholder.prev().hasClass( 'tdc_dragged' ) ) {
                        //    $placeholder.hide();
                        //}
                    }






                    function positionColumnPlaceholder( event ) {
                        //console.log( event );

                        var $placeholder = tdcAdminIFrameUI._tdcJqObjPlaceholder;


                        // The mouse position.
                        // This is used as a mark value.
                        // When an element is in 'drag' operation, the 'scroll' of the contents does not fire 'hover' ('mouseenter' and 'mouseleave') event
                        // over the content, and, to solve this issue, a custom event ('fakemouseenterevent') with the mouse position, must be triggered to all 'tdc_element' elements,
                        // to see which has the mouse over
                        var mousePointerValue = {
                            X: 0,
                            Y: 0
                        };

                        // Check if we have 'mousemove' or 'fakemouseenterevent'
                        if ( 'mousemove' === event.type || 'fakemouseenterevent' === event.type ) {

                            mousePointerValue.X = event.pageX;
                            mousePointerValue.Y = event.pageY;

                            // These are saved here, and used at 'scroll', for computing the mouse position over a 'tdc_element' element
                            if ( !_.isUndefined( event.clientX ) && !_.isUndefined( event.clientY ) ) {
                                window.previousMouseClientX = event.clientX;
                                window.previousMouseClientY = event.clientY;
                            }

                        } else if ( 'scroll' === event.type ) {
                            //console.log( event.delegateTarget.scrollingElement.scrollTop + ' : ' + window.previousMouseClientY );

                            mousePointerValue.X = contents.scrollLeft() + window.previousMouseClientX;
                            mousePointerValue.Y = contents.scrollTop() + window.previousMouseClientY;

                            var eventProp = {
                                'pageX' : mousePointerValue.X,
                                'pageY' : mousePointerValue.Y
                            };

                            //console.log( eventProp );


                            // Try to find where the mouse is.
                            // Trigger a custom event for all 'tdc_column' elements, but stop if one is found

                            // Set the 'current_element_over' to undefined, to be find in the iteration
                            current_element_over = undefined;

                            // Trigger an 'fakemouseenterevent' event, for siblings 'tdc_column' elements, or until the variable 'current_element_over' is set to one of them
                            draggedElement.closest( '.tdc_columns').find( '.tdc_column' ).each(function( index, element ) {

                                if ( ! _.isUndefined( current_element_over ) ) {
                                    // If it's not undefined, ( marked by 'fakemouseenterevent' event of the 'tdc_column' ) DO NOTHING (DO NOT TRIGGER ANY MORE 'fakemouseenterevent' EVENT)
                                    return;
                                }
                                jQuery( element ).trigger( jQuery.Event( 'fakemouseenterevent', eventProp ) );
                            });
                            return;
                        }



                        // Hide the placeholder and stop
                        if ( _.isUndefined( draggedElement ) ||
                            _.isUndefined( current_element_over ) ) {

                            // Hide the placeholder when we are over the dragged element
                            //( ! _.isUndefined( current_element_over ) && current_element_over.hasClass( 'tdc_dragged' ) ) ) {

                            $placeholder.hide();
                            return;
                        }


                        // If a 'tdc_row' is dragged and the 'current_element_over' is not undefined, show and position the placeholder
                        $placeholder.show();


                        var elementOuterWidth = current_element_over.find( '.tdc_elements:first').outerWidth( true );
                        var elementOffset = current_element_over.offset();


                        // Being floated, all prev columns width must be considered when working with the offset().left
                        var extraLeft = 0;
                        var prevColumns = current_element_over.prevAll( '.tdc_column' );

                        if ( prevColumns.length ) {
                            prevColumns.each( function (index, element) {
                                extraLeft += parseInt( jQuery(element).find( '.tdc_elements:first').width() );
                            });
                        }

                        //console.log( mousePointerValue.X + ' : ' + extraLeft + ' : ' + elementOffset.left + ' : ' + elementOuterWidth );

                        var cssMarginLeftValue = 0;

                        if ( extraLeft !== 0 ) {
                            cssMarginLeftValue = 48;
                        }

                        extraLeft += elementOffset.left;


                        if ( mousePointerValue.X > (extraLeft + ( elementOuterWidth / 2 ) ) ) {

                            current_element_over.after( $placeholder );

                            //console.log( '>>>>>>>>>>>>>>>>>>>>>>>>>>' );

                            setVerticalPlaceholder({
                                left: parseInt( extraLeft + elementOuterWidth),
                                'margin-left': cssMarginLeftValue
                            });

                        } else {
                            current_element_over.before( $placeholder );

                            //console.log( '<<<<<<<<<<<<<<<<<<<<<<<<<<<<<' );

                            setVerticalPlaceholder({
                                left: parseInt( extraLeft ),
                                'margin-left': cssMarginLeftValue
                            });
                        }

                        // Hide the placeholder if it's near the dragged element
                        //if ( $placeholder.next().length && $placeholder.next().hasClass( 'tdc_dragged' ) ||
                        //    $placeholder.prev().length && $placeholder.prev().hasClass( 'tdc_dragged' ) ) {
                        //    $placeholder.hide();
                        //}
                    }






                    function positionInnerRowPlaceholder( event ) {
                        //console.log( event );

                        var $placeholder = tdcAdminIFrameUI._tdcJqObjPlaceholder;

                        // Adapt the placeholder to look great when it's not on columns and inner-columns
                        setHorizontalPlaceholder();


                        // The mouse position.
                        // This is used as a mark value.
                        // When an element is in 'drag' operation, the 'scroll' of the contents does not fire 'hover' ('mouseenter' and 'mouseleave') event
                        // over the content, and, to solve this issue, a custom event ('fakemouseenterevent') with the mouse position, must be triggered to all 'tdc_element' elements,
                        // to see which has the mouse over
                        var mousePointerValue = {
                            X: 0,
                            Y: 0
                        };

                        // Check if we have 'mousemove' or 'fakemouseenterevent'
                        if ( 'mousemove' === event.type || 'fakemouseenterevent' === event.type ) {

                            mousePointerValue.X = event.pageX;
                            mousePointerValue.Y = event.pageY;

                            // These are saved here, and used at 'scroll', for computing the mouse position over a 'tdc_element' element
                            if ( !_.isUndefined( event.clientX ) && !_.isUndefined( event.clientY ) ) {
                                window.previousMouseClientX = event.clientX;
                                window.previousMouseClientY = event.clientY;
                            }

                        } else if ( 'scroll' === event.type ) {
                            //console.log( event.delegateTarget.scrollingElement.scrollTop + ' : ' + window.previousMouseClientY );

                            mousePointerValue.X = contents.scrollLeft() + window.previousMouseClientX;
                            mousePointerValue.Y = contents.scrollTop() + window.previousMouseClientY;

                            var eventProp = {
                                'pageX' : mousePointerValue.X,
                                'pageY' : mousePointerValue.Y
                            };

                            //console.log( eventProp );


                            // Try to find where the mouse is.
                            // Trigger a custom event for all 'tdc_element' elements, but stop if one is found

                            // Set the 'current_element_over' to undefined, to be find in the iteration
                            current_element_over = undefined;

                            // Trigger an 'fakemouseenterevent' event, for all 'tdc_element' elements, or until the variable 'current_element_over' is set to one of them
                            tdc_element.each(function( index, element ) {

                                if ( ! _.isUndefined( current_element_over ) ) {
                                    // If it's not undefined, ( marked by 'fakemouseenterevent' event of the 'tdc_element' ) DO NOTHING (DO NOT TRIGGER ANY MORE 'fakemouseenterevent' EVENT)
                                    return;
                                }
                                jQuery( element ).trigger( jQuery.Event( 'fakemouseenterevent', eventProp ) );
                            });

                            tdc_element_inner_row.each(function( index, element ) {

                                if ( ! _.isUndefined( current_element_over ) ) {
                                    // If it's not undefined, ( marked by 'fakemouseenterevent' event of the 'tdc_element_inner_row' ) DO NOTHING (DO NOT TRIGGER ANY MORE 'fakemouseenterevent' EVENT)
                                    return;
                                }
                                jQuery( element ).trigger( jQuery.Event( 'fakemouseenterevent', eventProp ) );
                            });

                            return;
                        }



                        // Hide the placeholder and stop
                        if ( _.isUndefined( draggedElement ) ||
                            _.isUndefined( current_element_over ) ) {

                            // Hide the placeholder when we are over the dragged element
                            //( ! _.isUndefined( current_element_over ) && current_element_over.hasClass( 'tdc_dragged' ) ) ) {

                            $placeholder.hide();
                            return;
                        }


                        // If a 'tdc_row' is dragged and the 'current_element_over' is not undefined, show and position the placeholder
                        $placeholder.show();


                        var elementOuterHeight = current_element_over.outerHeight( true );
                        var elementOuterWidth = current_element_over.innerWidth();
                        var elementOffset = current_element_over.offset();

                        //console.log( mousePointerValue.Y + ' : ' +  ( elementOffset.top + ( elementOuterHeight / 2 ) ) );

                        if ( mousePointerValue.Y > elementOffset.top + ( elementOuterHeight / 2 ) ) {

                            current_element_over.after($placeholder);

                            // Position the placeholder at the bottom of the screen
                            if (parseInt(elementOffset.top) + parseInt(elementOuterHeight) > parseInt(contents.scrollTop()) + parseInt(window.innerHeight)) {
                                $placeholder.css({
                                    'position': 'fixed',
                                    'top': '',
                                    'right': 'auto',
                                    'bottom': '0',
                                    'width': parseInt(elementOuterWidth / 2) + 'px'
                                });
                            } else {
                                // Reset
                                $placeholder.css({
                                    'position': 'absolute',
                                    'top': '',
                                    'right': '0',
                                    'bottom': '',
                                    'width': ''
                                });
                            }
                        } else {
                            current_element_over.before($placeholder);

                            // Position the placeholder at the top of the screen
                            if (parseInt(elementOffset.top) < parseInt(contents.scrollTop())) {
                                $placeholder.css({
                                    'position': 'fixed',
                                    'top': '0',
                                    'right': 'auto',
                                    'bottom': '',
                                    'width': parseInt(elementOuterWidth / 2) + 'px'
                                });
                            } else {
                                // Reset
                                $placeholder.css({
                                    'position': 'absolute',
                                    'top': '',
                                    'right': '0',
                                    'bottom': '',
                                    'width': ''
                                });
                            }
                        }

                        // Hide the placeholder if it's near the dragged element
                        //if ( $placeholder.next().length && $placeholder.next().hasClass( 'tdc_dragged' ) ||
                        //    $placeholder.prev().length && $placeholder.prev().hasClass( 'tdc_dragged' ) ) {
                        //    $placeholder.hide();
                        //}
                    }





                    function positionInnerColumnPlaceholder( event ) {
                        //console.log( event );

                        var $placeholder = tdcAdminIFrameUI._tdcJqObjPlaceholder;


                        // The mouse position.
                        // This is used as a mark value.
                        // When an element is in 'drag' operation, the 'scroll' of the contents does not fire 'hover' ('mouseenter' and 'mouseleave') event
                        // over the content, and, to solve this issue, a custom event ('fakemouseenterevent') with the mouse position, must be triggered to all 'tdc_element' elements,
                        // to see which has the mouse over
                        var mousePointerValue = {
                            X: 0,
                            Y: 0
                        };

                        // Check if we have 'mousemove' or 'fakemouseenterevent'
                        if ( 'mousemove' === event.type || 'fakemouseenterevent' === event.type ) {

                            mousePointerValue.X = event.pageX;
                            mousePointerValue.Y = event.pageY;

                            // These are saved here, and used at 'scroll', for computing the mouse position over a 'tdc_element' element
                            if ( !_.isUndefined( event.clientX ) && !_.isUndefined( event.clientY ) ) {
                                window.previousMouseClientX = event.clientX;
                                window.previousMouseClientY = event.clientY;
                            }

                        } else if ( 'scroll' === event.type ) {
                            //console.log( event.delegateTarget.scrollingElement.scrollTop + ' : ' + window.previousMouseClientY );

                            mousePointerValue.X = contents.scrollLeft() + window.previousMouseClientX;
                            mousePointerValue.Y = contents.scrollTop() + window.previousMouseClientY;

                            var eventProp = {
                                'pageX' : mousePointerValue.X,
                                'pageY' : mousePointerValue.Y
                            };

                            //console.log( eventProp );


                            // Try to find where the mouse is.
                            // Trigger a custom event for all 'tdc_column' elements, but stop if one is found

                            // Set the 'current_element_over' to undefined, to be find in the iteration
                            current_element_over = undefined;

                            // Trigger an 'fakemouseenterevent' event, for siblings 'tdc_inner_column' elements, or until the variable 'current_element_over' is set to one of them
                            draggedElement.closest( '.tdc_inner_columns').find( '.tdc_inner_column' ).each(function( index, element ) {

                                if ( ! _.isUndefined( current_element_over ) ) {
                                    // If it's not undefined, ( marked by 'fakemouseenterevent' event of the 'tdc_column' ) DO NOTHING (DO NOT TRIGGER ANY MORE 'fakemouseenterevent' EVENT)
                                    return;
                                }
                                jQuery( element ).trigger( jQuery.Event( 'fakemouseenterevent', eventProp ) );
                            });
                            return;
                        }



                        // Hide the placeholder and stop
                        if ( _.isUndefined( draggedElement ) ||
                            _.isUndefined( current_element_over ) ) {

                            // Hide the placeholder when we are over the dragged element
                            //( ! _.isUndefined( current_element_over ) && current_element_over.hasClass( 'tdc_dragged' ) ) ) {

                            $placeholder.hide();
                            return;
                        }


                        // If a 'tdc_row' is dragged and the 'current_element_over' is not undefined, show and position the placeholder
                        $placeholder.show();


                        var elementOuterWidth = current_element_over.find( '.tdc_elements:first').outerWidth( true );
                        var elementOffset = current_element_over.offset();


                        // Being floated, all prev columns width must be considered when working with the offset().left
                        var extraLeft = 0;
                        var prevColumns = current_element_over.prevAll( '.tdc_inner_column' );

                        if ( prevColumns.length ) {
                            prevColumns.each( function (index, element) {
                                extraLeft += parseInt( jQuery(element).find( '.tdc_elements:first').width() );
                            });
                        }

                        console.log( mousePointerValue.X + ' : ' + extraLeft + ' : ' + elementOffset.left + ' : ' + elementOuterWidth );

                        var cssMarginLeftValue = 0;

                        if ( extraLeft !== 0 ) {
                            cssMarginLeftValue = 48;
                        }

                        console.log( mousePointerValue.X + ' : ' + (extraLeft + elementOffset.left + elementOuterWidth / 2 ) );


                        if ( mousePointerValue.X > (extraLeft + elementOffset.left + ( elementOuterWidth / 2 ) ) ) {

                            current_element_over.after( $placeholder );

                            //console.log( '>>>>>>>>>>>>>>>>>>>>>>>>>>' );

                            setVerticalPlaceholder({
                                left: parseInt( extraLeft + elementOuterWidth ),
                                'margin-left': cssMarginLeftValue
                            });

                        } else {
                            current_element_over.before( $placeholder );

                            //console.log( '<<<<<<<<<<<<<<<<<<<<<<<<<<<<<' );

                            setVerticalPlaceholder({
                                left: parseInt( extraLeft ),
                                'margin-left': cssMarginLeftValue
                            });
                        }

                        // Hide the placeholder if it's near the dragged element
                        //if ( $placeholder.next().length && $placeholder.next().hasClass( 'tdc_dragged' ) ||
                        //    $placeholder.prev().length && $placeholder.prev().hasClass( 'tdc_dragged' ) ) {
                        //    $placeholder.hide();
                        //}
                    }







                    tdc_element.each(function(index, element) {

                        var $element = jQuery( element );

                        $element.click(function(event) {
                            //console.log( 'click element' );

                            event.preventDefault();

                        }).mousedown(function(event) {
                            //console.log( 'element mouse down' );

                            event.preventDefault();
                            // Stop calling parents 'mousedown' (tdc_element_inner_column or tdc_column - each tdc_element must be in one of theme)
                            event.stopPropagation();

                            activeDraggedElement(jQuery(this));
                            showHelper(event);

                        }).mouseup(function(event) {

                            // Respond only if dragged element is 'tdc_element'
                            if ( isElementDragged() || ( isInnerRowDragged() && $element.hasClass( 'tdc_element_column' ) ) ) {
                                //console.log( 'element mouse up' );

                                event.preventDefault();

                                deactiveDraggedElement();
                                hideHelper();

                                current_element_over = undefined;
                                positionElementPlaceholder(event);
                            }

                        }).mousemove(function(event) {

                            // Respond only if dragged element is 'tdc_element'
                            if ( isElementDragged() || ( isInnerRowDragged() && $element.hasClass( 'tdc_element_column' ) ) ) {
                                //console.log( 'element mouse move' );

                                event.preventDefault();
                                event.stopPropagation();

                                showHelper( event );

                                current_element_over = $element;
                                positionElementPlaceholder( event );
                            }

                        }).mouseenter(function(event) {

                            // Respond only if dragged element is 'tdc_element'
                            if ( isElementDragged() || ( isInnerRowDragged() && $element.hasClass( 'tdc_element_column' ) ) ) {
                                //console.log( 'element mouse enter' );

                                event.preventDefault();

                                current_element_over = $element;
                                positionElementPlaceholder( event );
                            }

                        }).mouseleave(function(event) {

                            // Respond only if dragged element is 'tdc_element'
                            if ( isElementDragged() || ( isInnerRowDragged() && $element.hasClass( 'tdc_element_column' ) ) ) {
                                //console.log( 'element mouse leave' );

                                event.preventDefault();

                                current_element_over = undefined;
                                positionElementPlaceholder(event);
                            }

                        }).on( 'fakemouseenterevent', function(event) {

                            // Respond only if dragged element is 'tdc_element'
                            if ( isElementDragged() || ( isInnerRowDragged() && $element.hasClass( 'tdc_element_column' ) ) ) {
                                console.log( 'element FAKE MOUSE ENTER EVENT' );

                                event.preventDefault();
                                event.stopPropagation();

                                var outerHeight = $element.outerHeight(true);
                                var outerWidth = $element.outerWidth();

                                var offset = $element.offset();

                                //console.log( offset.left + ' : ' + event.pageX + ' : ' + (offset.left + outerWidth) );
                                //console.log( offset.top + ' : ' + event.pageY + ' : ' + (offset.top + outerHeight) );

                                if ( ( parseInt(offset.left) <= parseInt(event.pageX) ) && ( parseInt(event.pageX) <= parseInt(offset.left + outerWidth) ) &&
                                    ( parseInt(offset.top) <= parseInt(event.pageY) ) && ( parseInt(event.pageY) <= parseInt(offset.top + outerHeight) ) ) {

                                    //console.log( '***********************' );

                                    // Set the 'current_element_over' variable to the current element
                                    current_element_over = $element;

                                    // Position the placeholder
                                    positionElementPlaceholder(event);
                                }
                            }
                        });
                    });



                    tdc_elements.each(function(index, element) {

                        jQuery(element).hover(function(event) {
                            //console.log( 'tdc_elements mouse enter' );

                            event.preventDefault();
                        },
                        function(event) {
                            //console.log( 'tdc_elements mouse leave' );

                            event.preventDefault();
                        });
                    });





                    tdc_row.each(function(index, element) {

                        var $element = jQuery(element);

                        $element.click(function(event) {
                            //console.log( 'click row' );

                            event.preventDefault();

                        }).mousedown(function(event) {
                            //console.log( 'row mouse down' );

                            event.preventDefault();
                            event.stopPropagation();

                            activeDraggedElement( jQuery(this) );
                            showHelper( event );

                        }).mouseup(function(event) {

                            // Respond only if dragged element is 'tdc_row'
                            if ( isRowDragged() ) {
                                //console.log( 'row mouse up' );

                                event.preventDefault();

                                deactiveDraggedElement();
                                hideHelper();
                            }

                        }).mousemove(function(event) {

                            // Respond only if dragged element is 'tdc_row'
                            if ( isRowDragged() ) {
                                //console.log( 'row mouse move' );

                                event.preventDefault();
                                event.stopPropagation();

                                showHelper( event );

                                current_element_over = $element;
                                positionRowPlaceholder( event );
                            }

                        }).mouseenter(function(event) {

                            // Respond only if dragged element is 'tdc_row'
                            if ( isRowDragged() ) {
                                //console.log('row mouse enter');

                                event.preventDefault();

                                current_element_over = $element;
                                positionRowPlaceholder( event );
                            }

                        }).mouseleave(function(event) {

                            // Respond only if dragged element is 'tdc_row'
                            if ( isRowDragged() ) {
                                //console.log('row mouse leave');

                                event.preventDefault();

                                current_element_over = undefined;
                                positionRowPlaceholder( event );
                            }

                        }).on( 'fakemouseenterevent', function(event) {

                            // Respond only if dragged element is 'tdc_row'
                            if ( isRowDragged() ) {
                                console.log( 'tdc_row FAKE MOUSE ENTER EVENT' );

                                var outerHeight = $element.outerHeight(true);
                                var outerWidth = $element.outerWidth();

                                var offset = $element.offset();

                                //console.log( offset.left + ' : ' + event.pageX + ' : ' + (offset.left + outerWidth) );
                                //console.log( offset.top + ' : ' + event.pageY + ' : ' + (offset.top + outerHeight) );

                                if ( ( parseInt(offset.left) <= parseInt(event.pageX) ) && ( parseInt(event.pageX) <= parseInt(offset.left + outerWidth) ) &&
                                    ( parseInt(offset.top) <= parseInt(event.pageY) ) && ( parseInt(event.pageY) <= parseInt(offset.top + outerHeight) ) ) {

                                    //console.log( '***********************' );

                                    // Set the 'current_element_over' variable to the current element
                                    current_element_over = $element;

                                    // Position the placeholder
                                    positionRowPlaceholder( event );
                                }
                            }
                        });
                    });





                    tdc_column.each(function(index, element) {

                        var $element = jQuery(element);

                        $element.click(function(event) {
                            //console.log( 'click column' );

                            event.preventDefault();


                        }).mousedown(function(event) {
                            //console.log( 'column mouse down' );

                            event.preventDefault();
                            event.stopPropagation();

                            activeDraggedElement( jQuery(this) );
                            showHelper( event );

                        }).mouseup(function(event) {

                            // Respond only if dragged element is 'tdc_column'
                            if ( isColumnDragged( $element ) ) {
                                //console.log( 'column mouse up' );

                                event.preventDefault();

                                deactiveDraggedElement();
                                hideHelper();

                                current_element_over = undefined;
                                positionColumnPlaceholder( event );
                            }

                        }).mousemove(function(event) {

                            // Respond only if dragged element is 'tdc_column'
                            if ( isColumnDragged( $element ) ) {
                                //console.log( 'column mouse move' );

                                event.preventDefault();
                                event.stopPropagation();

                                showHelper(event);

                                current_element_over = $element;
                                positionColumnPlaceholder( event );
                            }

                        }).mouseenter(function(event) {

                            // Respond only if dragged element is 'tdc_column'
                            if ( isColumnDragged( $element ) ) {
                                //console.log( 'column mouse enter' );

                                event.preventDefault();

                                current_element_over = $element;
                                positionColumnPlaceholder( event );
                            }

                        }).mouseleave(function(event) {

                            // Respond only if dragged element is 'tdc_column'
                            if ( isColumnDragged( $element ) ) {
                                //console.log( 'column mouse leave' );

                                event.preventDefault();

                                current_element_over = undefined;
                                positionColumnPlaceholder( event );
                            }

                        }).on( 'fakemouseenterevent', function(event) {

                            // Respond only if dragged element is 'tdc_column'
                            if ( isColumnDragged( $element ) ) {
                                //console.log( 'tdc_column FAKE MOUSE ENTER EVENT' );

                                var list_tdc_elements = $element.find( '.tdc_elements:first' );

                                if ( ! list_tdc_elements.length ) {
                                    return;
                                }

                                var outerHeight = list_tdc_elements.outerHeight(true);
                                var outerWidth = list_tdc_elements.outerWidth();

                                var offset = $element.offset();

                                // Being floated, all prev columns width must be considered when working with the offset().left
                                var extraLeft = 0;
                                var prevColumns = $element.prevAll( '.tdc_column' );

                                if ( prevColumns.length ) {
                                    prevColumns.each( function (index, element) {
                                        extraLeft += parseInt( jQuery(element).find( '.tdc_elements:first').width() );
                                    });
                                }

                                extraLeft += offset.left;


                                //console.log( extraLeft + ' : ' + event.pageX + ' : ' + ( extraLeft + outerWidth ) );
                                //console.log( offset.top + ' : ' + event.pageY + ' : ' + ( offset.top + outerHeight ) );


                                if ( ( parseInt( extraLeft ) <= parseInt( event.pageX ) ) && ( parseInt( event.pageX ) <= parseInt( extraLeft + outerWidth ) ) &&
                                    ( parseInt( offset.top ) <= parseInt( event.pageY ) ) && ( parseInt( event.pageY ) <= parseInt( offset.top + outerHeight ) ) ) {

                                    //console.log( '***********************' );

                                    // Set the 'current_element_over' variable to the current element
                                    current_element_over = $element;

                                    // Position the placeholder
                                    positionColumnPlaceholder( event );
                                }
                            }
                        });
                    });








                    tdc_element_inner_row.each( function( index, element ) {

                        var $element = jQuery(element);

                        $element.click(function(event) {
                             //console.log( 'click inner row' );

                            event.preventDefault();


                        }).mousedown(function(event) {
                             //console.log( 'inner row mouse down' );

                            event.preventDefault();
                            event.stopPropagation();

                            activeDraggedElement( jQuery(this) );
                            showHelper( event );

                        }).mouseup(function(event) {
                             //console.log( 'inner row element mouse up' );

                            event.preventDefault();

                            deactiveDraggedElement();
                            hideHelper();

                        }).mousemove(function(event) {

                            // Respond only if dragged element is 'tdc_inner_row'
                            if ( isElementDragged() || isInnerRowDragged() ) {
                                //console.log( 'inner row element mouse move' );

                                event.preventDefault();
                                event.stopPropagation();

                                showHelper(event);

                                current_element_over = $element;
                                positionInnerRowPlaceholder( event );
                            }

                        }).mouseenter(function(event) {

                            // Respond only if dragged element is 'tdc_inner_row'
                            if ( isElementDragged() || isInnerRowDragged() ) {
                                //console.log('inner row mouse enter');

                                event.preventDefault();

                                current_element_over = $element;
                                positionInnerRowPlaceholder( event );
                            }

                        }).mouseleave(function(event) {

                            // Respond only if dragged element is 'tdc_inner_row'
                            if ( isElementDragged() || isInnerRowDragged() ) {
                                //console.log('inner row mouse leave');

                                event.preventDefault();

                                current_element_over = undefined;
                                positionInnerRowPlaceholder( event );
                            }

                        }).on( 'fakemouseenterevent', function(event) {

                            // Respond only if dragged element is 'tdc_inner_row'
                            if ( isElementDragged() || isInnerRowDragged() ) {
                                console.log( 'tdc_inner_row FAKE MOUSE ENTER EVENT' );

                                var outerHeight = $element.outerHeight(true);
                                var outerWidth = $element.outerWidth();

                                var offset = $element.offset();

                                //console.log( offset.left + ' : ' + event.pageX + ' : ' + (offset.left + outerWidth) );
                                //console.log( offset.top + ' : ' + event.pageY + ' : ' + (offset.top + outerHeight) );

                                if ( ( parseInt(offset.left) <= parseInt(event.pageX) ) && ( parseInt(event.pageX) <= parseInt(offset.left + outerWidth) ) &&
                                    ( parseInt(offset.top) <= parseInt(event.pageY) ) && ( parseInt(event.pageY) <= parseInt(offset.top + outerHeight) ) ) {

                                    //console.log( '***********************' );

                                    // Set the 'current_element_over' variable to the current element
                                    current_element_over = $element;

                                    // Position the placeholder
                                    positionInnerRowPlaceholder( event );
                                }
                            }
                        });
                    });



                    tdc_inner_column.each(function(index, element) {

                        var $element = jQuery(element);

                        $element.click(function(event) {
                            console.log( 'click inner column' );

                            event.preventDefault();

                        }).mousedown(function(event) {
                            console.log( 'inner column mouse down' );

                            event.preventDefault();
                            event.stopPropagation();

                            activeDraggedElement( jQuery(this) );
                            showHelper( event );

                        }).mouseup(function(event) {

                            // Respond only if dragged element is 'tdc_inner_column'
                            if ( isInnerColumnDragged( $element ) ) {
                                console.log( 'inner column mouse up' );

                                event.preventDefault();

                                deactiveDraggedElement();
                                hideHelper();

                                current_element_over = undefined;
                                positionInnerColumnPlaceholder( event );
                            }

                        }).mousemove(function(event) {

                            // Respond only if dragged element is 'tdc_inner_column'
                            if ( isInnerColumnDragged( $element ) ) {
                                console.log( 'inner column mouse move' );

                                event.preventDefault();
                                event.stopPropagation();

                                showHelper(event);

                                current_element_over = $element;
                                positionInnerColumnPlaceholder( event );
                            }

                        }).mouseenter(function(event) {

                            // Respond only if dragged element is 'tdc_inner_column'
                            if ( isInnerColumnDragged( $element ) ) {
                                console.log( 'inner column mouse enter' );

                                event.preventDefault();

                                current_element_over = $element;
                                positionInnerColumnPlaceholder( event );
                            }

                        }).mouseleave(function(event) {

                            // Respond only if dragged element is 'tdc_inner_column'
                            if ( isInnerColumnDragged( $element ) ) {
                                //console.log( 'column mouse leave' );

                                event.preventDefault();

                                current_element_over = undefined;
                                positionInnerColumnPlaceholder( event );
                            }

                        }).on( 'fakemouseenterevent', function(event) {

                            // Respond only if dragged element is 'tdc_inner_column'
                            if ( isInnerColumnDragged( $element ) ) {
                                console.log( 'tdc_inner_column FAKE MOUSE ENTER EVENT' );

                                var list_tdc_elements = $element.find( '.tdc_elements:first' );

                                if ( ! list_tdc_elements.length ) {
                                    return;
                                }

                                var outerHeight = list_tdc_elements.outerHeight(true);
                                var outerWidth = list_tdc_elements.outerWidth();

                                var offset = $element.offset();

                                // Being floated, all prev columns width must be considered when working with the offset().left
                                var extraLeft = 0;
                                var prevColumns = $element.prevAll( '.tdc_inner_column' );

                                if ( prevColumns.length ) {
                                    prevColumns.each( function (index, element) {
                                        extraLeft += parseInt( jQuery(element).find( '.tdc_elements:first').width() );
                                    });
                                }

                                extraLeft += offset.left;


                                console.log( extraLeft + ' : ' + event.pageX + ' : ' + ( extraLeft + outerWidth ) );
                                console.log( offset.top + ' : ' + event.pageY + ' : ' + ( offset.top + outerHeight ) );


                                if ( ( parseInt( extraLeft ) <= parseInt( event.pageX ) ) && ( parseInt( event.pageX ) <= parseInt( extraLeft + outerWidth ) ) &&
                                    ( parseInt( offset.top ) <= parseInt( event.pageY ) ) && ( parseInt( event.pageY ) <= parseInt( offset.top + outerHeight ) ) ) {

                                    console.log( '***********************' );

                                    // Set the 'current_element_over' variable to the current element
                                    current_element_over = $element;

                                    // Position the placeholder
                                    positionInnerColumnPlaceholder( event );
                                }
                            }
                        });
                    });











                    tdcAdminIFrameUI._tdcJqObjElements.find( '.tdc_element').each(function(index, element) {

                        jQuery(element).click(function(event) {
                            //console.log( 'element click' );

                            event.preventDefault();

                        }).mousedown(function(event) {
                            //console.log( 'element mouse down' );

                            event.preventDefault();

                            activeDraggedElement( jQuery(this) );
                            showHelper( event );

                        }).mouseup(function(event) {
                            //console.log( 'element mouse up' );

                            event.preventDefault();

                            deactiveDraggedElement();
                            hideHelper();
                        });
                    });



                    jQuery(window).mouseup(function(event) {
                        //console.log( 'window mouse up' );

                        deactiveDraggedElement();
                        hideHelper();

                    }).mousemove(function( event ) {
                        //console.log( 'window mouse move' );

                        showHelper( event );
                    });



                    contents.mousedown(function(event) {
                        //console.log( 'contents mouse down' );

                    }).mouseup(function(event) {
                        //console.log( 'contents mouse up' );

                        deactiveDraggedElement();
                        hideHelper();

                        current_element_over = undefined;
                        positionElementPlaceholder( event );

                    }).mousemove(function(event) {
                        //console.log( 'contents mouse move' );

                        showHelper( event );

                        window.previousMouseClientX = event.clientX;
                        window.previousMouseClientY = event.clientY;

                    }).scroll(function( event ) {
                        //console.log( '------------- content scroll -------------' );


                        if ( isElementDragged() ) {
                            positionElementPlaceholder( event );
                        } else if ( isInnerColumnDragged() ) {
                            positionInnerColumnPlaceholder( event );
                        } else if ( isInnerRowDragged() ) {
                            positionInnerRowPlaceholder( event );
                        } else if ( isColumnDragged() ) {
                            positionColumnPlaceholder( event );
                        } else if ( isRowDragged() ) {
                            positionRowPlaceholder( event);
                        }

                    });




                    tdcAdminIFrameUI._tdcJqObjHelper.mouseup(function( event ) {
                        console.log( 'helper mouse up' );

                        hideHelper();
                    });

                    window.test = function() {
                        console.log( 1 );
                    };
                }

                setOperationUI();







            });

        tdcAdminIFrameUI._tdcJqObjWrapper.append( tdc );
    };



    tdcMain.init();




})(jQuery, Backbone, _);
