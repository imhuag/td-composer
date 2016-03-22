/**
 * Created by tagdiv on 18.02.2016.
 */

/* global jQuery:{} */
/* global Backbone:{} */
/* global _:{} */

/* global tdcJobManager:{} */
/* global tdcShortcodeParser:{} */
/* global tdcAdminWrapperUI:{} */


/* global tdcAdminIFrameUI */

var tdcMain,
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
            if ( _.isUndefined( tdcMain._postOriginalContentJSON ) && ! _.isUndefined( window.tdcPostSettings ) ) {

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
            var containerDestinationParent = jqSortableList.closest( '.tdc-inner-column' );

            // Get the closest column, if the sortable list is not inside of an inner row
            if ( ! containerDestinationParent.length ) {
                containerDestinationParent = jqSortableList.closest( '.tdc-column' );
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





    tdcMain.init();




})(jQuery, Backbone, _);
