/**
 * Created by tagdiv on 29.03.2016.
 */

/* global jQuery:{} */
/* global Backbone:{} */
/* global _:{} */

/* global tdcJobManager:{} */
/* global tdcShortcodeParser:{} */
/* global tdcOperationUI:{} */
/* global tdcAdminWrapperUI:{} */
/* global tdcRowUI:{} */
/* global tdcColumnUI:{} */
/* global tdcInnerRowUI:{} */
/* global tdcInnerColumnUI:{} */
/* global tdcElementsUI:{} */
/* global tdcElementUI:{} */

// duplicate declarations
/* jshint -W004 */

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
            4: [] // @todo These will be completed by the mapped shortcodes
        },

        _isInitialized: false,



        init: function( iframeContents ) {

            if ( tdcIFrameData._isInitialized ) {
                return;
            }

            tdcIFrameData.iframeContents = iframeContents;

            tdcIFrameData._defineStructuredData();

            if ( true === tdcIFrameData._initStructuredData() ) {

                var errors = {};

                tdcIFrameData.bindViewsModelsWrappers(errors);

                if (!_.isEmpty(errors)) {
                    for (var prop in errors) {
                        tdcDebug.log(errors[prop]);
                    }

                    alert('Errors happened during tdcIframeData.init() -> bindViewsModelsWrappers()! Errors in console ...');
                    return;
                }

                tdcDebug.log(tdcIFrameData.tdcRows.models);

                tdcIFrameData._isInitialized = true;
            }
        },




        _defineStructuredData: function() {

            if ( tdcIFrameData._isInitialized ) {
                return;
            }

            tdcIFrameData.TdcModel = Backbone.Model.extend({

                // Get the shortcode rendered
                getShortcodeRender: function( columns, draggedElementId, bindNewContent ) {

                    var model = this;

                    var data = {
                        error: undefined,
                        getShortcode: ''
                    };

                    // Get the shortcode using the _checkModelData builder function
                    tdcIFrameData._checkModelData( model, data );

                    if ( ! _.isUndefined( data.getShortcode ) ) {

                        //tdcDebug.log( data.getShortcode );

                        // Define new empty job
                        var newJob = new tdcJobManager.job();

                        newJob.shortcode = data.getShortcode;
                        newJob.columns = columns;

                        newJob.liveViewId = 'test';

                        newJob.success_callback = function( data ) {

                            tdcDebug.log( data );

                            // Important! It should have this property
                            if ( _.has( data, 'replyHtml' ) ) {

                                //var $dataReplyHtml = jQuery( data.replyHtml );

                                model.set( 'bindNewContent', bindNewContent );
                                model.set( 'html', data.replyHtml );
                            }


                            if ( _.has( data, 'replyJsForEval' ) ) {
                                var tdOldBlockUid = draggedElementId;
                                eval(data.replyJsForEval);

                            }
                        };

                        newJob.error_callback = function( job, errorMsg ) {
                            tdcDebug.log( errorMsg );
                            tdcDebug.log( job );
                        };

                        tdcJobManager.addJob( newJob );
                    }



                    // Just some checks!

                    // Get the shortcode of the moved model

                    data = {
                        error: undefined,
                        getShortcode: ''
                    };

                    tdcIFrameData._checkModelData( model, data );

                    if ( !_.isUndefined( data.error ) ) {
                        tdcDebug.log( data.error );
                    }

                    //if ( !_.isUndefined( data.getShortcode ) ) {
                    //    tdcDebug.log( data.getShortcode );
                    //}



                    // Get the shortcode of the parentModel (of the moved model)

                    data = {
                        error: undefined,
                        getShortcode: ''
                    };

                    if ( !_.isUndefined( model.get( 'parentModel' ) ) ) {

                        tdcIFrameData._checkModelData( model.get( 'parentModel' ), data );

                        if ( !_.isUndefined( data.error ) ) {
                            tdcDebug.log( data.error );
                        }
                    }

                    //if ( !_.isUndefined( data.getShortcode ) ) {
                    //    tdcDebug.log( data.getShortcode );
                    //}

                }
            });

            tdcIFrameData.TdcCollection = Backbone.Collection.extend({
                model: tdcIFrameData.TdcModel
            });


            tdcIFrameData.TdcLiveView = Backbone.View.extend({

                initialize: function() {
                    this.listenTo( this.model, 'change:html', this.customRender );
                    this.listenTo( this.model, 'remove', this.customRemove );
                },

                customRemove: function( model, value, options ) {

                    // It does not allow removing the '#tdc-rows' element when it is the $el element
                    if ( this.$el.attr( 'id' ) === 'tdc-rows' ) {
                        this.$el.html( '' );
                        return;
                    }
                    this.remove();
                },

                customRender: function( model, value, options) {

                    tdcDebug.log( 'render' );

                    if ( this.model.has( 'html' ) && !_.isUndefined( this.model.get( 'html' ) ) ) {

                        this.$el.html( this.model.get( 'html' ) );



                        // Bind the new content of the added inner row or row elements

                        if ( this.model.has( 'bindNewContent' ) && true === this.model.get( 'bindNewContent' ) ) {

                            // Reset the flag
                            this.model.set( 'bindNewContent', false );

                            // Do the job for 'tdc-element-inner-row'
                            if ( this.$el.hasClass( 'tdc-element-inner-row' ) ) {

                                // Bind the events for the new inner row
                                tdcInnerRowUI.bindInnerRow( this.$el );

                                var $tdcInnerColumn = this.$el.find( '.tdc-inner-column');

                                if ( $tdcInnerColumn.length ) {

                                    // Set the data 'model_id' for the element of the 'liveView' backbone view
                                    $tdcInnerColumn.data( 'model_id', this.model.get( 'childCollection' ).at(0).cid );

                                    $tdcInnerColumn.wrapAll( '<div class="tdc-inner-columns"></div>' );

                                    // Bind the events for the new inner column
                                    tdcInnerColumnUI.bindInnerColumn( $tdcInnerColumn );

                                    var $tdcInnerColumnWpbWrapper = $tdcInnerColumn.find( '.wpb_wrapper' );

                                    if ( $tdcInnerColumnWpbWrapper.length ) {
                                        var $tdcElementsInnerColumn = jQuery('<div class="tdc-elements"></div>');
                                        tdcElementsUI.bindElementList( $tdcElementsInnerColumn );

                                        var $emptyElementInnerColumn = jQuery( '<div class="' + tdcOperationUI._emptyElementClass + ' tdc-element-inner-column"></div>' );
                                        $tdcElementsInnerColumn.append( $emptyElementInnerColumn );

                                        $tdcInnerColumnWpbWrapper.append( $tdcElementsInnerColumn );

                                        tdcElementUI.bindEmptyElement( $emptyElementInnerColumn );
                                    }
                                }

                            } else if ( this.$el.hasClass( 'tdc-row' ) ) {

                                // Bind the events for the new row
                                tdcRowUI.bindRow( this.$el );

                                var $tdcColumn = this.$el.find( '.tdc-column' );

                                if ( $tdcColumn.length ) {

                                    // Set the data 'model_id' for the element of the 'liveView' backbone view
                                    $tdcColumn.data( 'model_id', this.model.get( 'childCollection' ).at(0).cid );

                                    $tdcColumn.wrapAll( '<div class="tdc-columns"></div>' );

                                    // Bind the events for the new column
                                    tdcColumnUI.bindColumn( $tdcColumn );

                                    var $tdcColumnWpbWrapper = $tdcColumn.find( '.wpb_wrapper' );

                                    if ( $tdcColumnWpbWrapper.length ) {
                                        var $tdcElementsColumn = jQuery( '<div class="tdc-elements"></div>' );
                                        tdcElementsUI.bindElementList( $tdcElementsColumn );

                                        var $emptyElementColumn = jQuery( '<div class="' + tdcOperationUI._emptyElementClass + ' tdc-element-column"></div>' );
                                        $tdcElementsColumn.append( $emptyElementColumn );

                                        $tdcColumnWpbWrapper.append( $tdcElementsColumn );

                                        tdcElementUI.bindEmptyElement( $emptyElementColumn );
                                    }
                                }

                            } else if ( this.$el.attr( 'id', 'tdc-rows' ) ) {

                                // Bind the events for the new row

                                var $tdcRow = this.$el.find( '.tdc-row:first' );

                                // Set the data 'model_id' for the element of the 'liveView' backbone view
                                $tdcRow.data( 'model_id', this.model.cid );

                                tdcRowUI.bindRow( $tdcRow );

                                var $tdcColumn = $tdcRow.find( '.tdc-column' );

                                if ( $tdcColumn.length ) {

                                    // Set the data 'model_id' for the element of the 'liveView' backbone view
                                    $tdcColumn.data( 'model_id', this.model.get( 'childCollection' ).at(0).cid );

                                    $tdcColumn.wrapAll( '<div class="tdc-columns"></div>' );

                                    // Bind the events for the new column
                                    tdcColumnUI.bindColumn( $tdcColumn );

                                    var $tdcColumnWpbWrapper = $tdcColumn.find( '.wpb_wrapper' );

                                    if ( $tdcColumnWpbWrapper.length ) {
                                        var $tdcElementsColumn = jQuery( '<div class="tdc-elements"></div>' );
                                        tdcElementsUI.bindElementList( $tdcElementsColumn );

                                        var $emptyElementColumn = jQuery( '<div class="' + tdcOperationUI._emptyElementClass + ' tdc-element-column"></div>' );
                                        $tdcElementsColumn.append( $emptyElementColumn );

                                        $tdcColumnWpbWrapper.append( $tdcElementsColumn );

                                        tdcElementUI.bindEmptyElement( $emptyElementColumn );
                                    }
                                }
                            }
                        }
                    }
                }
            });
        },







        _getPostOriginalContentJSON: function() {

            if ( _.isUndefined( tdcIFrameData._postOriginalContentJSON ) && ! _.isUndefined( window.tdcPostSettings ) ) {

                tdcIFrameData._shortcodeParserSettings[4] = window.tdcPostSettings.mappedShortcodes;

                // We need to clone it (it's used later) because it will be changed during the tdcShortcodeParser.init call
                tdcIFrameData._shortcodeParserSettingsClone = _.clone( tdcIFrameData._shortcodeParserSettings );

                tdcDebug.log(tdcIFrameData._shortcodeParserSettings);

                tdcShortcodeParser.init( tdcIFrameData._shortcodeParserSettings );

                tdcIFrameData._postOriginalContentJSON = tdcShortcodeParser.parse( 0, window.tdcPostSettings.postContent );
            }

            return tdcIFrameData._postOriginalContentJSON;
        },









        _initStructuredData: function() {

            if ( tdcIFrameData._isInitialized ) {
                return;
            }

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

                    alert( 'Errors happened during _initStructureData() -> _getData()! Errors in console ...' );
                    return false;
                }


                var data = {
                    error: undefined,
                    shortcode: undefined
                };

                tdcIFrameData.checkCurrentData( data );

                if ( !_.isUndefined( data.error ) ) {
                    tdcDebug.log( data.error );

                    alert( 'Errors happened during _initStructureData() -> checkCurrentData()! Errors in console ...' );
                    return false;
                }
            }
            return true;
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
                        'parentModel': parentModel,

                        // Flag used by the liveViews to bind events for the new content (content from the server)
                        'bindNewContent': false
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

            if ( ! tdcIFrameData._isInitialized ) {
                return;
            }

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
         * Remove the model by id.
         * It looks for the model into the entire collection recursively.
         * If no collection is specified, the entire backbone structure data is used.
         *
         * @param modelId
         * @param collection
         * @returns {*}
         */
        removeModelById: function( modelId, collection ) {

            var model = tdcIFrameData.getModel( modelId, collection );

            if ( _.isUndefined( model ) ) {
                return false;
            }

            var parentModel = model.get( 'parentModel' );

            if ( _.isUndefined( parentModel ) ) {
                tdcIFrameData.tdcRows.remove( model );
            } else {
                parentModel.get( 'childCollection' ).remove( model );
            }
        },





        /**
         * Remove the model.
         *
         * @param model
         * @returns {*}
         */
        removeModel: function( model ) {

            var parentModel = model.get( 'parentModel' );

            if ( _.isUndefined( parentModel ) ) {
                tdcIFrameData.tdcRows.remove( model );
            } else {
                parentModel.get( 'childCollection' ).remove( model );
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

            var parentModel = model.get( 'parentModel' );

            // not rows as the first elements
            if ( 0 === model.level && !_.isUndefined( parentModel ) ) {

                data.error = 'Not rows as the first elements!';
                return;
            }

            // elements do not respect the shortcode levels: 0 -> 1 -> 2 ...
            if ( !_.isUndefined( parentModel ) &&
                parseInt( parentModel.get( 'level' ), 10 ) >= parseInt( model.level, 10 ) ) {

                data.error = 'Elements does not respect the shortcode levels!';
                return;
            }

            // elements respect the shortcode levels: the difference to just 1, and higher than 1 when parentModel is column (level 2) and element is block (level 4)
            if ( !_.isUndefined( parentModel ) &&
                parseInt( model.level, 10 ) - parseInt( parentModel.get( 'level'), 10 ) > 1 &&
                2 !== parseInt( parentModel.get( 'level' ), 10) &&
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

            if ( ! tdcIFrameData._isInitialized ) {
                return;
            }

            _.each( tdcIFrameData.tdcRows.models, function(element, index, list) {
                tdcIFrameData._checkModelData( tdcIFrameData.tdcRows.get( element.cid ), data );
            });
        },




        /**
         * Important! This function should be called only by 'stop' sortable handler
         * Case A (the sidebar element was dragged)
         *      Case A.1. Element dragged
         *      Case A.2. Inner row dragged
         *      Case A.3. Row dragged
         * Case B
         *      Steps:
         *          Step 1. Get the model of the draggable element
         *          Step 2. Get the model of the destination container (column or inner column) that contains the sortable list (the list where the element is dropped)
         *          Step 3. Request to the model of the element, to update its 'html property'
         *              3.1 Get the 'column' from the model of the container
         *              3.2 Make the request
         *              3.3 Wait for the response
         *          Step 4. If success, update the structure data
         *          Step 5. If error, ???
         *
         * @param whatWasDragged object
         */
        changeData: function( whatWasDragged ) {

            if ( ! tdcIFrameData._isInitialized ) {
                return;
            }

            var $draggedElement = tdcOperationUI.getDraggedElement(),
                newPosition = $draggedElement.prevAll().length,
                destinationModel,
                destinationChildCollection,
                destinationColParam;


            if ( whatWasDragged.wasSidebarElementDragged ) {

                // Case A

                if ( whatWasDragged.wasElementDragged ) {

                    // Case A.1

                    destinationModel = tdcIFrameData._getDestinationModel(['.tdc-inner-column', '.tdc-column']);

                    if (_.isUndefined(destinationModel)) {
                        alert('changeData Error: Destination model not in structure data!');
                        return;
                    }

                    destinationColParam = tdcIFrameData._getColParam(destinationModel);

                    // Change the model structure
                    // The 'childCollection' attribute of the destination model does not exist for the inner-columns or columns that contain only the empty element
                    // In this case, we initialize it at an empty collection
                    if (destinationModel.has( 'childCollection' ) ) {
                        destinationChildCollection = destinationModel.get( 'childCollection' );
                    } else {
                        destinationModel.set( 'childCollection', new tdcIFrameData.TdcCollection() );
                        destinationChildCollection = destinationModel.get( 'childCollection' );
                    }

                    var shortcodeName = $draggedElement.data( 'shortcodeName' ),
                        shortcodeTitle = $draggedElement.html(),

                    // Define the model
                        elementModel = new tdcIFrameData.TdcModel({
                            'content': '',
                            'attrs': {
                                'ajax_pagination': 'next_prev',
                                'custom_title': shortcodeTitle
                            },
                            'tag': shortcodeName,
                            'type': 'single',
                            'level': 4,
                            'parentModel': destinationModel
                        }),

                    // Devine the liveView
                        elementView = new tdcIFrameData.TdcLiveView({
                            model: elementModel,
                            el: $draggedElement[0]
                        });

                    tdcElementUI.bindElement( $draggedElement );

                    // Set the data model id to the liveView jquery element
                    $draggedElement.data('model_id', elementModel.cid);

                    destinationChildCollection.add(elementModel, {at: newPosition});

                    elementModel.set('parentModel', destinationModel);

                    // Get the shortcode rendered
                    elementModel.getShortcodeRender( destinationColParam, whatWasDragged.draggedElementId, false );


                } else if ( whatWasDragged.wasInnerRowDragged ) {

                    // Case A.2

                    destinationModel = tdcIFrameData._getDestinationModel(['.tdc-column']);

                    if (_.isUndefined(destinationModel)) {
                        alert('changeData Error: Destination model not in structure data!');
                        return;
                    }

                    destinationColParam = tdcIFrameData._getColParam(destinationModel);

                    // Change the model structure
                    // The 'childCollection' attribute of the destination model does not exist for the inner-columns or columns that contain only the empty element
                    // In this case, we initialize it at an empty collection
                    if (destinationModel.has( 'childCollection' ) ) {
                        destinationChildCollection = destinationModel.get( 'childCollection' );
                    } else {
                        destinationModel.set( 'childCollection', new tdcIFrameData.TdcCollection() );
                        destinationChildCollection = destinationModel.get( 'childCollection' );
                    }

                    // Define the inner row model
                    var innerRowModel = new tdcIFrameData.TdcModel({
                        'content': '',
                        'attrs': {},
                        'tag': 'vc_row_inner',
                        'type': 'closed',
                        'level': 2,
                        'parentModel': destinationModel
                    }),

                    // Define the inner row liveView
                    innerRowView = new tdcIFrameData.TdcLiveView({
                        model: innerRowModel,
                        el: $draggedElement[0]
                    }),

                    // Define the inner column model
                    innerColumnModel = new tdcIFrameData.TdcModel({
                        'content': '',
                        'attrs': {},
                        'tag': 'vc_column_inner',
                        'type': 'closed',
                        'level': 3,
                        'parentModel': innerRowModel
                    }),

                    // Define the inner column liveView
                    innerColumnView = new tdcIFrameData.TdcLiveView({
                        model: innerColumnModel,
                        el: $draggedElement[0]
                    });

                    // Set the data model id to the liveView jquery element
                    $draggedElement.data('model_id', innerRowModel.cid);

                    destinationChildCollection.add( innerRowModel, {at: newPosition});

                    var childCollectionInnerRow = new tdcIFrameData.TdcCollection();
                    childCollectionInnerRow.add( innerColumnModel );
                    innerRowModel.set( 'childCollection', childCollectionInnerRow );

                    var childCollectionInnerColumn = new tdcIFrameData.TdcCollection();
                    innerColumnModel.set( 'childCollection', childCollectionInnerColumn );


                    // Get the shortcode rendered
                    innerRowModel.getShortcodeRender( destinationColParam, whatWasDragged.draggedElementId, true );


                } else if ( whatWasDragged.wasRowDragged ) {

                    // Case A.3

                    // Dragging a new row, a new destination model is created and added into the tdcIFrameData.tdcRows

                    // Define the row model
                    var rowModel = new tdcIFrameData.TdcModel({
                            'content': '',
                            'attrs': {},
                            'tag': 'vc_row',
                            'type': 'closed',
                            'level': 1,
                            'parentModel': undefined
                        }),

                    // Define the row liveView
                        rowView = new tdcIFrameData.TdcLiveView({
                            model: rowModel,
                            el: $draggedElement[0]
                        }),

                    // Define the column model
                        columnModel = new tdcIFrameData.TdcModel({
                            'content': '',
                            'attrs': {},
                            'tag': 'vc_column',
                            'type': 'closed',
                            'level': 2,
                            'parentModel': rowModel
                    });

                    // Set the data model id to the liveView jquery element
                    $draggedElement.data( 'model_id', rowModel.cid );

                    tdcIFrameData.tdcRows.add( rowModel, {at: newPosition});

                    var childCollectionRow = new tdcIFrameData.TdcCollection();
                    childCollectionRow.add( columnModel );
                    rowModel.set( 'childCollection', childCollectionRow );

                    var childCollectionColumn = new tdcIFrameData.TdcCollection();
                    columnModel.set( 'childCollection', childCollectionColumn );


                    // Get the shortcode rendered
                    //rowModel.getShortcodeRender( destinationColParam, true );
                    rowModel.getShortcodeRender( 1, whatWasDragged.draggedElementId, true );


                }

            } else {




                // Case B

                // Step 1 ----------

                // The item model id
                var elementModelId = $draggedElement.data('model_id');


                // @todo This check should be removed - the content should have consistency
                if (_.isUndefined(elementModelId)) {
                    alert('changeData - Error: Element model id is not in $draggedElement data!');
                    return;
                }


                // The item model
                var elementModel = tdcIFrameData.getModel(elementModelId);

                // @todo This check should be removed - the content should have consistency
                if (_.isUndefined(elementModel)) {
                    alert('changeData Error: Element model not in structure data!');
                    return;
                }


                // Step 2 ----------

                // The destination of the $draggedElement
                var sourceModel,
                    sourceChildCollection;

                if ( whatWasDragged.wasElementDragged ) {

                    tdcDebug.log('case 1');



                    // If the element is recycled, just remove the model from data structure
                    if ( tdcOperationUI.getCurrentElementOver() === tdcAdminWrapperUI.$recycle ) {

                        tdcDebug.log('element recycled');

                        tdcIFrameData.removeModel( elementModel );
                        tdcDebug.log( tdcIFrameData.tdcRows );
                        return;
                    }




                    sourceModel = elementModel.get( 'parentModel' );
                    destinationModel = tdcIFrameData._getDestinationModel( ['.tdc-inner-column', '.tdc-column'] );

                    if ( _.isUndefined( destinationModel ) ) {
                        alert( 'changeData Error: Destination model not in structure data!' );
                        return;
                    }

                    if ( sourceModel.cid === destinationModel.cid ) {

                        sourceChildCollection = sourceModel.get( 'childCollection' );
                        sourceChildCollection.remove( elementModel, {silent: true} );
                        sourceChildCollection.add( elementModel, {at: newPosition} );

                    } else {

                        // The column param filter
                        destinationColParam = tdcIFrameData._getColParam( destinationModel );

                        // Change the model structure
                        // The 'childCollection' attribute of the destination model does not exist for the inner-columns or columns that contain only the empty element
                        // In this case, we initialize it at an empty collection
                        if ( destinationModel.has( 'childCollection' ) ) {
                            destinationChildCollection = destinationModel.get( 'childCollection' );
                        } else {
                            destinationModel.set( 'childCollection', new tdcIFrameData.TdcCollection() );
                            destinationChildCollection = destinationModel.get( 'childCollection' );
                        }

                        sourceChildCollection = sourceModel.get( 'childCollection' );

                        sourceChildCollection.remove( elementModel, {silent: true} );
                        destinationChildCollection.add( elementModel, {at: newPosition} );

                        elementModel.set( 'parentModel', destinationModel );

                        // Get the shortcode rendered
                        elementModel.getShortcodeRender( destinationColParam, whatWasDragged.draggedElementId, false );
                    }

                } else if ( whatWasDragged.wasInnerRowDragged ) {

                    tdcDebug.log('case 2');



                    // If the element is recycled, just remove the model from data structure
                    if ( tdcOperationUI.getCurrentElementOver() === tdcAdminWrapperUI.$recycle ) {
                        tdcDebug.log('inner row recycled');

                        tdcIFrameData.removeModel( elementModel );
                        tdcDebug.log( tdcIFrameData.tdcRows );
                        return;
                    }




                    sourceModel = elementModel.get( 'parentModel' );
                    destinationModel = tdcIFrameData._getDestinationModel( ['.tdc-column'] );

                    if ( _.isUndefined( destinationModel ) ) {
                        return;
                    }

                    if ( sourceModel.cid === destinationModel.cid ) {

                        sourceChildCollection = sourceModel.get( 'childCollection' );
                        sourceChildCollection.remove( elementModel, {silent: true} );
                        sourceChildCollection.add( elementModel, {at: newPosition} );

                    } else {

                        // Change the model structure
                        // The 'childCollection' attribute of the destination model does not exist for the inner-columns or columns that contain only the empty element
                        // In this case, we initialize it at an empty collection
                        if ( destinationModel.has( 'childCollection' ) ) {
                            destinationChildCollection = destinationModel.get( 'childCollection' );
                        } else {
                            destinationModel.set( 'childCollection', new tdcIFrameData.TdcCollection() );
                            destinationChildCollection = destinationModel.get( 'childCollection' );
                        }

                        // Move the entire structure
                        sourceChildCollection = sourceModel.get( 'childCollection' );
                        sourceChildCollection.remove( elementModel, {silent: true} );
                        destinationChildCollection.add( elementModel, {at: newPosition} );
                        elementModel.set( 'parentModel', destinationModel );
                    }

                } else if ( whatWasDragged.wasInnerColumnDragged || whatWasDragged.wasColumnDragged ) {

                    tdcDebug.log( 'case 3' );

                    sourceModel = elementModel.get( 'parentModel' );
                    sourceChildCollection = sourceModel.get( 'childCollection' );
                    sourceChildCollection.remove( elementModel, {silent: true} );
                    sourceChildCollection.add( elementModel, {at: newPosition} );

                } else if ( whatWasDragged.wasRowDragged ) {

                    tdcDebug.log( 'case 4' );

                    // If the element is recycled, just remove the model from data structure
                    if ( tdcOperationUI.getCurrentElementOver() === tdcAdminWrapperUI.$recycle ) {

                        tdcDebug.log('row recycled');

                        tdcIFrameData.removeModel( elementModel );
                        tdcDebug.log( tdcIFrameData.tdcRows );

                        // Add a new empty row if all rows have been deleted
                        if ( ! tdcIFrameData.tdcRows.length ) {

                            // Define the row model
                            var rowModel = new tdcIFrameData.TdcModel({
                                'content': '',
                                'attrs': {},
                                'tag': 'vc_row',
                                'type': 'closed',
                                'level': 1,
                                'parentModel': undefined
                            }),

                            // Define the row liveView
                            rowView = new tdcIFrameData.TdcLiveView({
                                model: rowModel,
                                el: tdcIFrameData.iframeContents.find( '#tdc-rows' )[0]
                            }),

                            // Define the column model
                            columnModel = new tdcIFrameData.TdcModel({
                                'content': '',
                                'attrs': {},
                                'tag': 'vc_column',
                                'type': 'closed',
                                'level': 2,
                                'parentModel': rowModel
                            });

                            tdcIFrameData.tdcRows.add( rowModel, {at: 0} );

                            var childCollectionRow = new tdcIFrameData.TdcCollection();
                            childCollectionRow.add( columnModel );
                            rowModel.set( 'childCollection', childCollectionRow );

                            var childCollectionColumn = new tdcIFrameData.TdcCollection();
                            columnModel.set( 'childCollection', childCollectionColumn );


                            // Get the shortcode rendered
                            //rowModel.getShortcodeRender( destinationColParam, true );
                            rowModel.getShortcodeRender( 1, whatWasDragged.draggedElementId, true );
                        }

                        return;
                    }

                    tdcIFrameData.tdcRows.remove( elementModel, {silent: true} );
                    tdcIFrameData.tdcRows.add( elementModel, {at: newPosition} );

                    tdcDebug.log( 'newPosition: ' + newPosition );
                    tdcDebug.log( $draggedElement );
                }
            }

            tdcDebug.log( tdcIFrameData.tdcRows );
        },





        _getColParam: function( model ) {
            var modelAttrs = model.get( 'attrs' ),
                colParam = 3;

            if ( _.has( modelAttrs, 'width' ) ) {
                colParam = modelAttrs.width;
            }

            // The source column param filter
            switch ( colParam ) {
                case '1/3' : colParam = 1; break;
                case '2/3' : colParam = 2; break;
                case '3/3' : colParam = 3; break;
                case '1/2' : colParam = 1; break;
            }

            return colParam;
        },




        //_changeInnerRowDOM: function( colParam ) {
        //
        //    if ( ! tdcOperationUI.isInnerRowDragged() ) {
        //        return;
        //    }
        //
        //    var $draggedElement = tdcOperationUI.getDraggedElement(),
        //        $innerColumnsElements = $draggedElement.find( '.tdc-inner-column' );
        //
        //    if ( $innerColumnsElements.length ) {
        //        var $lastInnerColumn = jQuery( $innerColumnsElements[ colParam - 1 ] );
        //
        //        if ( $lastInnerColumn.length ) {
        //
        //            var $lastInnerColumnTdcElements = $lastInnerColumn.find( '.tdc-elements' );
        //
        //            for ( var i = colParam; i < $innerColumnsElements.length; i++ ) {
        //                var $currentInnerColumn = jQuery( $innerColumnsElements[ i ] ),
        //                    $elements = $currentInnerColumn.find( '.tdc-element' );
        //
        //                if ( $elements.length ) {
        //                    tdcDebug.log( $elements.length );
        //
        //                    $elements.each( function( index, $element ) {
        //                        $lastInnerColumnTdcElements.append( $element );
        //                    });
        //                }
        //
        //                $currentInnerColumn.remove();
        //            }
        //        }
        //    }
        //},
        //
        //
        //
        //
        //
        //
        //_changeInnerRowData: function( elementModel, sourceModel, destinationModel, newPosition ) {
        //
        //    var sourceColParam = tdcIFrameData._getColParam( sourceModel ),
        //        destinationColParam = tdcIFrameData._getColParam( destinationModel ),
        //        elementChildCollection = elementModel.get( 'childCollection' ),
        //        sourceChildCollection = sourceModel.get( 'childCollection' ),
        //        destinationChildCollection = destinationModel.get( 'childCollection' );
        //
        //    //tdcDebug.log( 'sourceColParam : ' + sourceColParam );
        //    //tdcDebug.log( 'destinationColParam : ' + destinationColParam );
        //
        //
        //    // Move the entire structure
        //    sourceChildCollection = sourceModel.get( 'childCollection' );
        //    sourceChildCollection.remove( elementModel );
        //    destinationChildCollection.add( elementModel, { at: newPosition } );
        //    elementModel.set( 'parentModel', destinationModel );
        //
        //
        //    tdcDebug.log( sourceColParam + ' / ' + destinationColParam );
        //
        //    // Check the elements of the structure. Maybe they must be redistributed
        //    if ( sourceColParam !== destinationColParam ) {
        //
        //        if ( elementChildCollection.length > destinationColParam ) {
        //
        //            tdcDebug.log( elementChildCollection.length + ' : ' + destinationColParam );
        //
        //            var lastInnerColumnModel = elementChildCollection.at( destinationColParam - 1 ),
        //                lastInnerColumnChildCollection = lastInnerColumnModel.get( 'childCollection' );
        //
        //            for ( var i = destinationColParam; i < elementChildCollection.length; i++ ) {
        //                var currentInnerColumnModel = elementChildCollection.at( i ),
        //                    currentInnerColumnChildCollection = currentInnerColumnModel.get( 'childCollection' );
        //
        //                for ( var j = 0; j < currentInnerColumnChildCollection.length; j++ ) {
        //                    var elementModelOfInnerColumn = currentInnerColumnChildCollection.remove( currentInnerColumnChildCollection.at(0) );
        //                    lastInnerColumnChildCollection.add( elementModelOfInnerColumn );
        //                    elementModelOfInnerColumn.set( 'parentModel', lastInnerColumnModel );
        //
        //                    //var colParam = tdcIFrameData._getColParam( lastInnerColumnModel );
        //
        //                    //tdcDebug.log( colParam );
        //                    //tdcDebug.log( elementModelOfInnerColumn );
        //
        //                    //elementModelOfInnerColumn.getShortcodeRender( colParam );
        //                }
        //
        //                // Remove the inner column model
        //                elementChildCollection.remove( currentInnerColumnModel );
        //            }
        //
        //            tdcDebug.log( 'width: ' + lastInnerColumnModel.get( 'width' ) );
        //
        //            lastInnerColumnModel.set({ 'width': destinationColParam });
        //
        //            var data = {
        //                error: undefined,
        //                getShortcode: ''
        //            };
        //
        //            tdcIFrameData._checkModelData( lastInnerColumnModel.get( 'parentModel' ), data );
        //
        //            if ( !_.isUndefined( data.error ) ) {
        //                tdcDebug.log( data.error );
        //            }
        //
        //            if ( !_.isUndefined( data.getShortcode ) ) {
        //
        //                lastInnerColumnModel.get( 'parentModel' ).set( 'content', data.getShortcode );
        //                tdcDebug.log( data.getShortcode );
        //            }
        //
        //            //lastInnerColumnModel.get( 'parentModel' ).getShortcodeRender( destinationColParam );
        //
        //
        //            //tdcIFrameData._changeInnerRowDOM( destinationColParam );
        //
        //        } else if ( elementChildCollection.length < destinationColParam ) {
        //
        //            var diff = destinationColParam - elementChildCollection.length;
        //
        //            while ( diff > 0 ) {
        //                diff--;
        //            }
        //
        //        }
        //    }
        //},






        /**
         * Get the destination model, looking up into DOM and getting the 'model_id', and then searching into the structure data
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
                alert( '_getDestinationModel Error: Container destination not available!' );
                return;
            }

            // The model id (where the item model must be inserted)
            var destinationModelId = $destination.data( 'model_id');

            // @todo This check should be removed - the content should have consistency
            if ( _.isUndefined( destinationModelId ) ) {
                alert( '_getDestinationModel Error: Model id of the container destination not in data!' );
                return;
            }


            // The model (where the item model must be inserted)
            var destinationModel = tdcIFrameData.getModel( destinationModelId );

            // @todo This check should be removed - the content should have consistency
            if ( _.isUndefined( destinationModel ) ) {
                alert( '_getDestinationModel Error: Model not in structure data!' );
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
