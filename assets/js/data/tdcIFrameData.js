/**
 * Created by tagdiv on 29.03.2016.
 */

/* global jQuery:{} */
/* global Backbone:{} */
/* global _:{} */

/* global tdcJobManager:{} */
/* global tdcShortcodeParser:{} */

var tdcIFrameData,
    tdcDebug;

(function(jQuery, backbone, _, undefined) {

    'use strict';

    tdcIFrameData = {

        iframeContents: undefined,

        tdcRows: undefined,

        TdcModel: undefined,
        TdcCollection: undefined,
        TdcLiveView: undefined,

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

        _isInitialized: false,



        init: function( iframeContents ) {

            if ( tdcIFrameData._isInitialized ) {
                return;
            }

            tdcIFrameData.iframeContents = iframeContents;

            tdcIFrameData._defineStructuredData();
            tdcIFrameData._initStructuredData();






            var errors = {};

            tdcIFrameData.bindViewsModelsWrappers( errors );

            if ( ! _.isEmpty( errors ) ) {
                for ( var prop in errors ) {
                    tdcDebug.log( errors[ prop ] );
                }
            }

            tdcDebug.log( tdcIFrameData.tdcRows.models );
            tdcIFrameData._isInitialized = true;
        },




        _defineStructuredData: function() {

            tdcIFrameData.TdcModel = Backbone.Model.extend({

                getShortcodeRender: function( destinationModel, columns, newPosition ) {

                    var model = this,

                        parentModel = model.get( 'parentModel' ),
                        sourceChildCollection = parentModel.get( 'childCollection' );


                    // Get the shortcode rendered and change the structure

                    // A builder shortcode function must be used instead
                    var shortcode = model.get( 'content' ),

                    // Define new empty job
                    newJob = new tdcJobManager.job();

                    newJob.shortcode = shortcode;
                    newJob.columns = columns;

                    newJob.liveViewId = 'test';

                    newJob.success = function( data ) {

                        tdcDebug.log( data );

                        // Important! It should have this property
                        if ( _.has( data, 'replyHtml' ) ) {

                            // Change the model structure
                            var parentModel = model.get( 'parentModel' ),
                                destinationChildCollection = destinationModel.get( 'childCollection' );

                                // Update the 'html' attribute (This will trigger an event)
                                model.set( 'html', data.replyHtml );

                                sourceChildCollection.remove( model );
                                destinationChildCollection.add( model, { at: newPosition } );
                                model.set( 'parentModel', destinationModel );

                            //tdcDebug.log(destinationChildCollection);
                        }
                    };

                    newJob.error = function( job, errorMsg ) {
                        tdcDebug.log( errorMsg );
                        tdcDebug.log( job );
                    };

                    tdcJobManager.addJob( newJob );



                    // Get the shortcode of the moved model

                    var data = {
                        error: undefined,
                        getShortcode: ''
                    };

                    tdcIFrameData._checkModelData( model, data );

                    if ( !_.isUndefined( data.error ) ) {
                        tdcDebug.log( data.error );
                    }

                    if ( !_.isUndefined( data.getShortcode ) ) {
                        tdcDebug.log( data.getShortcode );
                    }



                    // Get the shortcode of the parentModel (of the moved model)

                    data = {
                        error: undefined,
                        getShortcode: ''
                    };

                    tdcIFrameData._checkModelData( model.get( 'parentModel' ), data );

                    if ( !_.isUndefined( data.error ) ) {
                        tdcDebug.log( data.error );
                    }

                    if ( !_.isUndefined( data.getShortcode ) ) {
                        tdcDebug.log( data.getShortcode );
                    }



                    tdcDebug.log( tdcIFrameData.tdcRows.models );
                }
            });

            tdcIFrameData.TdcCollection = Backbone.Collection.extend({
                model: tdcIFrameData.TdcModel
            });


            tdcIFrameData.TdcLiveView = Backbone.View.extend({

                initialize: function() {
                    this.listenTo( this.model, 'change:html', this.render );
                },

                render: function( model, value, options) {

                    tdcDebug.log( 'render' );

                    if ( this.model.has( 'html' ) && !_.isUndefined( this.model.get( 'html' ) ) ) {
                        this.el.innerHTML = this.model.get( 'html' );
                    }
                }
            });
        },







        _getPostOriginalContentJSON: function() {

            if ( _.isUndefined( tdcIFrameData._postOriginalContentJSON ) && ! _.isUndefined( window.tdcPostSettings ) ) {

                //[vc_row][vc_column width="2/3"][td_block_1 custom_title="block1 top left" ajax_pagination="next_prev"][vc_row_inner][vc_column_inner width="1/2"][td_block_3 custom_title="block 3 top left" limit="2"][/vc_column_inner][vc_column_inner width="1/2"][td_block_2 custom_title="block2 top left" limit="2" ajax_pagination="next_prev"][/vc_column_inner][/vc_row_inner][td_block_4 custom_title="block4 top left" limit="8"][vc_row_inner][vc_column_inner width="2/3"][td_block_6 custom_title="block6 inner left"][/vc_column_inner][vc_column_inner width="1/3"][td_block_6 custom_title="Block6 inner right"][/vc_column_inner][/vc_row_inner][/vc_column][vc_column width="1/3"][td_block_2 custom_title="block2 top right" limit="2" ajax_pagination="next_prev"][vc_row_inner][vc_column_inner][td_block_3 custom_title="block3 top right" limit="2" ajax_pagination="next_prev"][td_block_weather w_location="Timisoara, ro"][/vc_column_inner][/vc_row_inner][/vc_column][/vc_row][vc_row][vc_column width="1/3"][td_block_1 custom_title="block1left" ajax_pagination="next_prev"][td_block_2 custom_title="block2left" limit="2" ajax_pagination="next_prev"][/vc_column][vc_column width="2/3"][td_block_1 custom_title="block1right" ajax_pagination="next_prev"][td_block_2 custom_title="block2right" limit="2" ajax_pagination="next_prev"][/vc_column][/vc_row]

                // We need to clone it (it's used later) because it will be changed during the tdcShortcodeParser.init call
                tdcIFrameData._shortcodeParserSettingsClone = _.clone( tdcIFrameData._shortcodeParserSettings );

                tdcShortcodeParser.init( tdcIFrameData._shortcodeParserSettings );

                tdcIFrameData._postOriginalContentJSON = tdcShortcodeParser.parse( 0, window.tdcPostSettings.postContent );
            }

            return tdcIFrameData._postOriginalContentJSON;
        },









        _initStructuredData: function() {

            var content = tdcIFrameData._getPostOriginalContentJSON();

            tdcDebug.log( content );

            if ( content.length ) {

                tdcIFrameData.tdcRows = new tdcIFrameData.TdcCollection();


                var errors = {};

                _.each( content, function(element, index, list) {
                    tdcIFrameData._getData( tdcIFrameData.tdcRows, undefined, element, errors);
                });

                if ( !_.isEmpty( errors ) ) {
                    tdcDebug.log( errors );
                }


                var data = {
                    error: undefined,
                    shortcode: undefined
                };

                tdcIFrameData.checkCurrentData( data );

                if ( !_.isUndefined( data.error ) ) {
                    tdcDebug.log( data.error );
                }
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


            for ( var prop in tdcIFrameData._shortcodeParserSettingsClone ) {

                if ( ! _.isUndefined( element.shortcode) &&
                    _.isObject( element.shortcode ) &&
                    _.has( element.shortcode, 'tag' ) &&
                    _.indexOf( tdcIFrameData._shortcodeParserSettingsClone[ prop ], element.shortcode.tag ) !== -1 ) {


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


                    model = new tdcIFrameData.TdcModel({
                        'content' : element.content,
                        'attrs' : element.shortcode.attrs.named,
                        'tag' : element.shortcode.tag,
                        'type' : element.shortcode.type,
                        'level' : parseInt( prop, 10 ),
                        'parentModel': parentModel
                    });

                    if ( _.has(element, 'child') && element.child.length > 0 ) {

                        model.set( 'childCollection', new tdcIFrameData.TdcCollection() );

                        _.each( element.child, function(element, index, list) {

                            tdcIFrameData._getData( model.get( 'childCollection' ), model, element, errors );
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
                collection = tdcIFrameData.tdcRows;
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

                    model = tdcIFrameData.getModel( modelId, childCollection );
                }
            });

            if ( !_.isUndefined( model ) ) {
                return model;
            }
        },





        /**
         * Helper function used to check if a model of the current structure data, respects the shortcode levels
         *
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
                    tdcIFrameData._checkModelData( tdcCollection.get( element.cid ), data );
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
         *
         * @param data - object - Ref.object {error: the first error caught; getShortcode: param that collects the shortcode structure}
         */
        checkCurrentData: function( data ) {

            _.each( tdcIFrameData.tdcRows.models, function(element, index, list) {
                tdcIFrameData._checkModelData( tdcIFrameData.tdcRows.get( element.cid ), data );
            });
        },




        /**
         * Important! This function should be called only by 'stop' sortable handler
         * Steps:
         *  Step 1. Get the model of the draggable element
         *  Step 2. Get the model of the destination container (column or inner column) that contains the sortable list (the list where the element is dropped)
         *  Step 3. Request to the model of the element, to update its 'html property'
         *      3.1 Get the 'column' from the model of the container
         *      3.2 Make the request
         *      3.3 Wait for the response
         *  Step 4. If success, update the structure data
         *  Step 5. If error, ???
         *
         * @param whatWasDragged object
         */
        changeData: function( whatWasDragged ) {


            // Step 1 ----------

            var $draggedElement = tdcOperationUI.getDraggedElement();

            // The item model id
            var elementModelId = $draggedElement.data( 'model_id' );


            // @todo This check should be removed - the content should have consistency
            if ( _.isUndefined( elementModelId ) ) {
                alert( 'changeData - Error: Element model id is not in $draggedElement data!' );
                return;
            }


            // The item model
            var elementModel = tdcIFrameData.getModel( elementModelId );

            // @todo This check should be removed - the content should have consistency
            if ( _.isUndefined( elementModel ) ) {
                alert( 'changeData Error: Element model not in structure data!' );
                return;
            }



            // Step 2 ----------

            // The destination of the $draggedElement
            var sourceModel,

                destinationModel,
                destinationModelAttrs,

                colParam = 1,

                sourceChildCollection,
                destinationChildCollection,

                newPosition = $draggedElement.prev().length;

            if ( whatWasDragged.wasElementDragged ) {

                sourceModel = elementModel.get( 'parentModel' );
                destinationModel = tdcIFrameData._getDestinationModel( [ '.tdc-inner-column', '.tdc-column' ] );

                if ( _.isUndefined( destinationModel ) ) {
                    return;
                }

                if ( sourceModel.cid === destinationModel.cid ) {

                    sourceChildCollection = sourceModel.get( 'childCollection' );
                    sourceChildCollection.remove( elementModel );
                    sourceChildCollection.add( elementModel, { at: newPosition } );

                } else {

                    destinationModelAttrs = destinationModel.get( 'attrs' );

                    // @todo This check should be removed - the content should have consistency
                    //if ( ! _.has( destinationModelAttrs, 'width ' ) ) {
                    //    colParam = destinationModelAttrs.width;
                    //}

                    if ( _.has( destinationModelAttrs, 'width' ) ) {
                        colParam = destinationModelAttrs.width;
                    }

                    //tdcDebug.log( colParam );

                    // The column param filter
                    switch ( colParam ) {
                        case '1/3' : colParam = 1; break;
                        case '2/3' : colParam = 2; break;
                        case '3/3' : colParam = 3; break;
                    }

                    elementModel.getShortcodeRender( destinationModel, colParam, newPosition );
                }

            } else if ( whatWasDragged.wasInnerRowDragged ) {

                sourceModel = elementModel.get( 'parentModel' );
                destinationModel = tdcIFrameData._getDestinationModel( [ '.tdc-column' ] );

                if ( _.isUndefined( destinationModel ) ) {
                    return;
                }

                if ( sourceModel.cid === destinationModel.cid ) {

                    sourceChildCollection = sourceModel.get( 'childCollection' );
                    sourceChildCollection.remove( elementModel );
                    sourceChildCollection.add( elementModel, { at: newPosition } );

                } else {

                    destinationModelAttrs = destinationModel.get( 'attrs' );

                    // @todo This check should be removed - the content should have consistency
                    //if ( ! _.has( destinationModelAttrs, 'width ' ) ) {
                    //    colParam = destinationModelAttrs.width;
                    //}

                    if ( _.has( destinationModelAttrs, 'width' ) ) {
                        colParam = destinationModelAttrs.width;
                    }

                    //tdcDebug.log( colParam );

                    // The column param filter
                    switch ( colParam ) {
                        case '1/3' : colParam = 1; break;
                        case '2/3' : colParam = 2; break;
                        case '3/3' : colParam = 3; break;
                    }

                    // @todo Other case should be implemented here
                    //elementModel.getShortcodeRender( destinationModel, colParam, newPosition );
                }

            } else if ( whatWasDragged.wasInnerColumnDragged || whatWasDragged.wasColumnDragged ) {

                sourceModel = elementModel.get( 'parentModel' );
                sourceChildCollection = sourceModel.get( 'childCollection' );
                sourceChildCollection.remove( elementModel );
                sourceChildCollection.add( elementModel, { at: newPosition } );

            } else if ( whatWasDragged.wasRowDragged ) {

                tdcIFrameData.tdcRows.remove( elementModel );
                tdcIFrameData.tdcRows.add( elementModel, { at: newPosition } );
            }

            tdcDebug.log( tdcIFrameData.tdcRows );
        },


        /**
         * Get the destination model, looking into DOM and getting the 'model_id', and then searching into the structure data
         *
         * @param cssClasses array
         * @private
         */
        _getDestinationModel: function( cssClasses ) {

            var $draggedElement = tdcOperationUI.getDraggedElement();

            // Get the closest available container
            var $destination;

            for ( var i = 0; i < cssClasses.length; i++ ) {
                $destination = $draggedElement.closest( cssClasses[i] );

                if ( $destination.length ) {
                    break;
                }
            }


            // @todo This check should be removed - the content should have consistency
            if ( ! $destination.length ) {
                alert( 'changeData Error: Container destination not available!' );
                return;
            }

            // The model id (where the item model must be inserted)
            var destinationModelId = $destination.data( 'model_id');

            // @todo This check should be removed - the content should have consistency
            if ( _.isUndefined( destinationModelId ) ) {
                alert( 'changeData Error: Model id of the container destination not in data!' );
                return;
            }


            // The model (where the item model must be inserted)
            var destinationModel = tdcIFrameData.getModel( destinationModelId );

            // @todo This check should be removed - the content should have consistency
            if ( _.isUndefined( destinationModel ) ) {
                alert( 'changeData Error: Model not in structure data!' );
                return;
            }

            //tdcDebug.log( destinationModel );

            return destinationModel;
        },






        getShortcodeFromData: function( data ) {

            // We set the data.getShortcode to '', to be sure that '_checkModel' will get the shortcode, otherwise it will only check for error structures
            data.getShortcode = '';

            _.each( tdcIFrameData.tdcRows.models, function(element, index, list) {
                tdcIFrameData._checkModelData( tdcIFrameData.tdcRows.get( element.cid ), data );
            });
        },





        /**
         * Create views.
         * Bind views to DOM elements.
         * Bind models to views.
         * @param error
         */
        bindViewsModelsWrappers: function( errors, collection, jqDOMElement, level ) {

            if ( tdcIFrameData._isInitialized ) {
                return;
            }

            if ( ! _.isEmpty( errors ) ) {
                return;
            }

            if ( _.isUndefined( level ) ) {
                level = 0;
            }

            if ( _.isUndefined( collection ) ) {

                collection = tdcIFrameData.tdcRows;

                // Bind rows
                var tdc_row = tdcIFrameData.iframeContents.find( '.tdc-row' );


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

                    //tdcDebug.log( model.cid );

                    // Set the html attribute for the model (its changed is captured by view)
                    model.set( 'html', element.innerHTML );

                    // Create the view
                    new tdcIFrameData.TdcLiveView({
                        model: model,
                        el: element
                    });

                    // Go deeper to the children
                    if ( model.has( 'childCollection' ) ) {

                        tdcIFrameData.bindViewsModelsWrappers( errors, model.get( 'childCollection'), $element, level );
                    }
                });

                level--;

            } else {

                var jqDOMElements;

                switch ( level ) {

                    case 1:

                        jqDOMElements = jqDOMElement.find( '.tdc-columns:first' ).children( '.tdc-column' );

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

                        jqDOMElements = jqDOMElement.find( '.tdc-elements:first' ).children( '.tdc-element, .tdc-element-inner-row' );

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

                        jqDOMElements = jqDOMElement.find( '.tdc-inner-columns:first' ).children( '.tdc-inner-column' );

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

                        jqDOMElements = jqDOMElement.find( '.tdc-elements:first' ).children( '.tdc-element' );

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

                    //tdcDebug.log( model.cid );

                    // Set the html attribute for the model (its changed is captured by view)
                    model.set( 'html', element.innerHTML );

                    // Create the view
                    new tdcIFrameData.TdcLiveView({
                        model: model,
                        el: element
                    });

                    // Go deeper to the children, if the jq dom element is not tdc-element and the model has collection
                    if ( ! $element.hasClass( 'tdc-element') && model.has( 'childCollection' ) ) {

                        tdcIFrameData.bindViewsModelsWrappers( errors, model.get( 'childCollection'), $element, level );
                    }
                });

                // Decrement the level, for the next bindViewsModelsWrappers call
                level--;
            }
        }

    };

})( jQuery, Backbone, _ );
