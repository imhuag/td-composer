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




        _isInitialized: false,



        init: function( iframeContents ) {

            if ( tdcIFrameData._isInitialized ) {
                return;
            }

            tdcIFrameData.iframeContents = iframeContents;

            tdcIFrameData._defineStructuredData();

            if ( true === tdcIFrameData._initStructuredData() ) {

                var errors = {};

                tdcIFrameData.bindViewsModelsWrappers( errors );

                if ( ! _.isEmpty( errors ) ) {
                    for ( var prop in errors ) {
                        tdcDebug.log( errors[ prop ] );
                    }

                    alert('Errors happened during tdcIframeData.init() -> bindViewsModelsWrappers()! Errors in console ...');
                    return;
                }

                tdcDebug.log( tdcIFrameData.tdcRows.models );

                tdcIFrameData._isInitialized = true;
            }
        },




        _defineStructuredData: function() {

            if ( tdcIFrameData._isInitialized ) {
                return;
            }

            tdcIFrameData.TdcModel = Backbone.Model.extend({

                // Get the shortcode rendered
                //@todo cleanup liveViewId a devenit draggedBlockUid. liveViewId nu mai e folosit.
                getShortcodeRender: function( columns, draggedBlockUid, bindNewContent, liveViewId ) {

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

                        newJob.liveViewId = draggedBlockUid;

                        newJob.success_callback = function( data ) {

                            tdcDebug.log( data );

                            // Important! It should have this property
                            if ( _.has( data, 'replyHtml' ) ) {

                                //var $dataReplyHtml = jQuery( data.replyHtml );

                                model.set( 'bindNewContent', bindNewContent );
                                model.set( 'shortcode', newJob.shortcode );
                                model.set( 'html', data.replyHtml );
                            }


                            var iFrameWindowObj = tdcAdminIFrameUI.getIframeWindow();

                            // !!! This also fires the deleteCallback for draggedBlockUid
                            iFrameWindowObj.tdcComposerBlocksApi.deleteItem(draggedBlockUid);


                            if ( _.has( data, 'replyJsForEval' ) ) {

                                //var tdcEvalGlobal = {
                                //    //iFrameWindowObj: iFrameWindowObj,
                                //    oldBlockUid: draggedBlockUid
                                //};

                                iFrameWindowObj.tdcEvalGlobal = {
                                    //iFrameWindowObj: iFrameWindowObj,
                                    oldBlockUid: draggedBlockUid
                                };

                                tdcAdminIFrameUI.evalInIframe(data.replyJsForEval);

                                //eval(data.replyJsForEval);

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

                                //alert( 'class tdc-element-inner-row' );

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

                                var $tdcRow = this.$el.find( '.tdc-row' ),
                                    modelId = this.$el.data( 'model_id' ),
                                    model = tdcIFrameData.getModel( modelId ),
                                    childCollection = model.get( 'childCollection' );

                                // Set the row data 'model_id'
                                $tdcRow.data( 'model_id', modelId );

                                // Add wrappers to the existing 'tdc-column' element
                                window.addWrappers( this.$el );

                                var shortcode = model.get( 'shortcode' ),
                                    parentModel = model.get( 'parentModel' );

                                if ( true === tdcIFrameData._initNewContentStructureData( 0, shortcode, parentModel ) ) {

                                    //tdcDebug.log( tdcIFrameData.tdcRows );

                                    // The childCollection of the model object has been modified
                                    // Do nothing if it is undefined, otherwise continue and bind views to models
                                    if ( ! _.isUndefined( childCollection ) ) {

                                        var errors = {};

                                        tdcIFrameData.bindViewsModelsWrappers( errors, childCollection , $tdcRow, 1 );

                                        if ( !_.isEmpty( errors ) ) {
                                            for ( var prop in errors ) {
                                                tdcDebug.log( errors[ prop ] );
                                            }

                                            alert( 'Errors happened during tdcIFrameData.TdcLiveView -> customRender! Errors in console ...' );
                                            return;
                                        }
                                    }
                                }

                                tdcRowUI.init( this.$el );
                                tdcColumnUI.init( this.$el );
                                tdcInnerRowUI.init( this.$el );
                                tdcInnerColumnUI.init( this.$el );
                                tdcElementUI.init( this.$el );

                                // Remove the old 'tdc-row'
                                // Important! The operation must be the last one, because till now its usage is as a content
                                this.$el.parent().append( $tdcRow );
                                this.$el.remove();
                                this.$el = $tdcRow;

                                tdcSidebar.setCurrentRow( $tdcRow );

                            } else if ( 'tdc-rows' === this.$el.attr( 'id' ) ) {

                                //alert( 'id tdc-rows' );

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



                            //// A new 'tdc-column' has been added inside of the 'tdc-column-temp' temporary element
                            //} else if ( this.$el.hasClass( 'tdc-column-temp' ) ) {
                            //
                            //    //alert( 'class tdc-column-temp' );
                            //
                            //    var $tdcColumn = this.$el.find( '.tdc-column' );
                            //
                            //    // Set the column data 'model_id' with the data 'model_id' of the temp column
                            //    $tdcColumn.data( 'model_id', this.$el.data( 'model_id' ) );
                            //
                            //    // Remove the temp column
                            //    $tdcColumn.unwrap();
                            //
                            //    // Bind the events for the new column
                            //    tdcColumnUI.bindColumn( $tdcColumn );
                            //
                            //    // Add the empty element
                            //    var $tdcColumnWpbWrapper = $tdcColumn.find( '.wpb_wrapper' );
                            //
                            //    if ( $tdcColumnWpbWrapper.length ) {
                            //        var $tdcElementsColumn = jQuery( '<div class="tdc-elements"></div>' );
                            //        tdcElementsUI.bindElementList( $tdcElementsColumn );
                            //
                            //        var $emptyElementColumn = jQuery( '<div class="' + tdcOperationUI._emptyElementClass + ' tdc-element-column"></div>' );
                            //        $tdcElementsColumn.append( $emptyElementColumn );
                            //
                            //        $tdcColumnWpbWrapper.append( $tdcElementsColumn );
                            //
                            //        tdcElementUI.bindEmptyElement( $emptyElementColumn );
                            //    }
                            //
                            //
                            //
                            //// A new content has been added to an existing 'tdc-column' referenced by the $el of the view
                            //} else if ( this.$el.hasClass( 'tdc-column' ) ) {
                            //
                            //    //alert( 'class tdc-column' );
                            //
                            //    // We have the new 'tdc-column' inside of the old 'tdc-column'
                            //    // The old 'tdc-column' will be removed
                            //
                            //    var $tdcColumn = this.$el.find( '.tdc-column' ),
                            //        modelId = this.$el.data( 'model_id' ),
                            //        model = tdcIFrameData.getModel( modelId ),
                            //        childCollection = model.get( 'childCollection' );
                            //
                            //    // Set the column data 'model_id' with the data 'model_id' of the temp column
                            //    $tdcColumn.data( 'model_id', modelId );
                            //
                            //    // Add wrappers to the existing 'tdc-column' element
                            //    window.addWrappers( this.$el );
                            //
                            //    var shortcode = model.get( 'shortcode' ),
                            //        parentModel = model.get( 'parentModel' );
                            //
                            //    if ( true === tdcIFrameData._initNewContentStructureData( 1, shortcode, parentModel ) ) {
                            //
                            //        //tdcDebug.log( tdcIFrameData.tdcRows );
                            //
                            //        // The childCollection of the model object has been modified
                            //        // Do not continue if it is undefined, otherwise continue and bind views to models
                            //        if ( _.isUndefined( childCollection ) ) {
                            //            return;
                            //        }
                            //
                            //        var errors = {};
                            //
                            //        tdcIFrameData.bindViewsModelsWrappers( errors, childCollection , $tdcColumn, 2 );
                            //
                            //        if ( !_.isEmpty( errors ) ) {
                            //            for ( var prop in errors ) {
                            //                tdcDebug.log( errors[ prop ] );
                            //            }
                            //
                            //            alert( 'Errors happened during tdcIFrameData.TdcLiveView -> customRender! Errors in console ...' );
                            //            return;
                            //        }
                            //    }
                            //
                            //    tdcColumnUI.init( this.$el );
                            //    tdcInnerRowUI.init( this.$el );
                            //    tdcInnerColumnUI.init( this.$el );
                            //    tdcElementUI.init( this.$el );
                            //
                            //    // Remove the old 'tdc-column'
                            //    // Important! The operation must be the last one, because till now its usage is as a content
                            //    $tdcColumn.unwrap();
                            }
                        }
                    }
                }
            });
        },







        _getPostOriginalContentJSON: function() {

            if ( _.isUndefined( tdcIFrameData._postOriginalContentJSON ) && ! _.isUndefined( window.tdcPostSettings ) ) {


                // get the mapped shortcodes as an array and remove the vc_row, vc_column etc from them
                var level4_Shortcodes = Object.keys(window.tdcAdminSettings.mappedShortcodes);
                level4_Shortcodes = level4_Shortcodes.filter( function( el ) { // remove the vc_row, vc_column and other shortcodes from level 4
                    return ['vc_row', 'vc_column', 'vc_row_inner', 'vc_column_inner'].indexOf( el ) < 0;
                } );


                // build the levels WARNING!!!! tdcShortcodeParser modifies this structure it marges 2+4
                var shortcodeParserLevels = {
                    0: ['vc_row'],
                    1: ['vc_column'],
                    2: ['vc_row_inner'],
                    3: ['vc_column_inner'],
                    4: level4_Shortcodes
                };


                // We need to clone it (it's used later) because it will be changed during the tdcShortcodeParser.init call
                tdcIFrameData._shortcodeParserSettingsClone = shortcodeParserLevels;


                // tdcShortcodeParser no longer modifies the LEVELs
                tdcShortcodeParser.init( shortcodeParserLevels );

                tdcIFrameData._postOriginalContentJSON = tdcShortcodeParser.parse( 0, window.tdcPostSettings.postContent );
            }

            return tdcIFrameData._postOriginalContentJSON;
        },









        _getContentJSON: function( level, shortcode ) {

            var contentJSON;

            if ( ! _.isUndefined( window.tdcPostSettings ) ) {
                contentJSON = tdcShortcodeParser.parse( level, shortcode );
            }

            return contentJSON;
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
                    tdcIFrameData._getData( tdcIFrameData.tdcRows, undefined, element, errors );
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







        _initNewContentStructureData: function( startLevel, shortcode, model ) {

            var content = tdcIFrameData._getContentJSON( startLevel, shortcode );

            //tdcDebug.log( content );

            if ( content.length ) {

                var errors = {};

                _.each( content, function( element, index, list ) {
                    tdcIFrameData._getData( undefined, model , element, errors, startLevel );
                });

                if ( !_.isEmpty( errors ) ) {
                    tdcDebug.log( errors );

                    alert( 'Errors happened during _initNewContentStructureData() -> _getData()! Errors in console ...' );
                    return false;
                }


                var data = {
                    error: undefined,
                    shortcode: undefined
                };

                tdcIFrameData.checkCurrentData( data );

                if ( !_.isUndefined( data.error ) ) {
                    tdcDebug.log( data.error );

                    alert( 'Errors happened during _initNewContentStructureData() -> checkCurrentData()! Errors in console ...' );
                    return false;
                }
            }
            return true;
        },






        /**
         * Initialize the backbone tdcRows collection.
         * Collects all errors happened during the initialization process.
         *
         * @param collection - can be undefined. At every step, for not undefined collection, created models are added to this parameter collection
         * @param parentModel
         * @param element
         * @param errors
         * @param startLevel
         * @private
         */
        _getData: function( collection, parentModel, element, errors, startLevel ) {

            var model,
                errorInfo;


            for ( var level in tdcIFrameData._shortcodeParserSettingsClone ) {

                // Do nothing for 'level' below the 'startLevel'
                // This helps us to step over some _shortcodeParserSettingsClone[ level ], usually for getting data from the new added content
                if ( ! _.isUndefined( startLevel ) && ( parseInt( startLevel, 10 ) > level ) ) {
                    continue;
                }

                if ( ! _.isUndefined( element.shortcode) &&
                    _.isObject( element.shortcode ) &&
                    _.has( element.shortcode, 'tag' ) &&
                    _.indexOf( tdcIFrameData._shortcodeParserSettingsClone[ level ], element.shortcode.tag ) !== -1 ) {


                    //
                    // Check sections
                    //
                    // The next checks were added as a supplementary check level over the JSON data builder,
                    // to be sure that the backbone structured data respects the shortcode levels


                    // not rows as the first elements
                    if ( parseInt( level, 10 )  > 0  && _.isUndefined( parentModel ) ) {

                        errorInfo = 'Not rows as the first elements!';
                    }

                    // elements do not respect the shortcode levels: 0 -> 1 -> 2 ...
                    if ( !_.isUndefined( parentModel ) &&
                        parseInt( parentModel.get( 'level' ), 10 ) >= parseInt( level, 10 ) ) {

                        errorInfo = 'Elements does not respect the shortcode levels!';
                    }

                    // elements respect the shortcode levels: the difference to just 1, and higher than 1 when parentModel is column (level 2) and element is block (level 4)
                    if ( !_.isUndefined( parentModel ) &&
                        parseInt( level, 10 ) - parseInt( parentModel.get( 'level'), 10 ) > 1 &&
                        2 !== parseInt( parentModel.get( 'level' ), 10) &&
                        4 !== parseInt( level, 10 ) ) {

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
                        'level' : parseInt( level, 10 ),
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
                if ( ! _.isUndefined( collection ) ) {
                    collection.add(model);
                }
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
                    elementModel.getShortcodeRender( destinationColParam, whatWasDragged.draggedBlockUid, false );


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
                    innerRowModel.getShortcodeRender( destinationColParam, whatWasDragged.draggedBlockUid, true );


                } else if ( whatWasDragged.wasRowDragged ) {

                    // Case A.3

                    // Dragging a new row, a new destination model is created and added into the tdcIFrameData.tdcRows

                    // Define the row model
                    var rowModel = new tdcIFrameData.TdcModel({
                            'content': '',
                            'attrs': {},
                            'tag': 'vc_row',
                            'type': 'closed',
                            'level': 0,
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
                            'level': 1,
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
                    rowModel.getShortcodeRender( 1, whatWasDragged.draggedBlockUid, true );


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

                        // !!! This also fires the deleteCallback for whatWasDragged.draggedBlockUid
                        tdcAdminIFrameUI.getIframeWindow().tdcComposerBlocksApi.deleteItem(whatWasDragged.draggedBlockUid);
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
                        elementModel.getShortcodeRender( destinationColParam, whatWasDragged.draggedBlockUid, false );
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
                                'level': 0,
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
                                'level': 1,
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
                            rowModel.getShortcodeRender( 1, whatWasDragged.draggedBlockUid, true );
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
         * The models are added to the collection param, if the collection param is specified and not undefined. Otherwise the collection is initialized with the tdcIFrameData.tdcRows
         * The computing starts from the level param, if this param is specified and not undefined. Otherwise from level initialized with the top most level - 0.
         * @param error
         */
        bindViewsModelsWrappers: function( errors, collection, jqDOMElement, level ) {

            //tdcDebug.log( jqDOMElement );

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
                        alert( collection.models.length + ' : ' + jqDOMElements.length );

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
                            alert ( collection.models.length + ' : ' + jqDOMElements.length );
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

                    // Set the html attribute for the model (its changes are captured by view)
                    model.set( 'html', element.innerHTML );

                    // Create the view
                    new tdcIFrameData.TdcLiveView({
                        model: model,
                        el: element
                    });

                    // Go deeper to the children, if the jq dom element is not tdc-element and the model has collection
                    if ( ! $element.hasClass( 'tdc-element' ) && model.has( 'childCollection' ) ) {

                        tdcIFrameData.bindViewsModelsWrappers( errors, model.get( 'childCollection' ), $element, level );
                    }
                });

                // Decrement the level, for the next bindViewsModelsWrappers call
                level--;
            }
        },






        changeColumnModel: function( columnModel, oldWidthColumn, newWidthColumn ) {

            if ( _.isUndefined( columnModel ) || _.isUndefined( oldWidthColumn ) || _.isUndefined( newWidthColumn ) ) {
                return;
            }

            var childCollectionColumn = columnModel.get( 'childCollection' );

            // Do nothing for empty columns
            if ( _.isUndefined( childCollectionColumn ) || ! childCollectionColumn.length ) {
                return;
            }

            var widthColumn,
                attrsColumn = columnModel.get( 'attrs' );

            if ( ! _.isUndefined( attrsColumn ) && _.has( attrsColumn, 'width' ) ) {
                widthColumn = attrsColumn.width;
            }

            _.each( childCollectionColumn.models, function( elementChildColumn, indexChildColumn, listChildColumn ) {

                var elementChildColumnTag = elementChildColumn.get( 'tag' );

                // Do nothing if the child model is not of an inner row
                if ( 'vc_row_inner' !== elementChildColumnTag ) {
                    return;
                }

                var childCollectionInnerRow = elementChildColumn.get( 'childCollection' );

                // Do nothing for empty inner rows
                if ( _.isUndefined( childCollectionInnerRow ) || ! childCollectionInnerRow.length ) {
                    return;
                }


                // Flag indicates what inner columns widths were previously set
                // It can have the fallowing values: '', '12_12', '23_13', '13_23' or '13_13_13'
                var innerRowSettings = '',

                    // Flag used to check the inner column settings
                    validInnerRowSettings = true;


                _.each( childCollectionInnerRow.models, function( elementInnerColumn, indexInnerColumn, listInnerColumn ) {

                    // Do nothing if the inner row settings is not valid
                    if ( ! validInnerRowSettings ) {
                        innerRowSettings = '';
                        return;
                    }

                    var attrsElementInnerColumn = elementInnerColumn.get( 'attrs' );

                    if ( !_.isUndefined( attrsElementInnerColumn ) && _.isObject( attrsElementInnerColumn ) ) {

                        var oldInnerColumnWidth = '';

                        if ( _.has( attrsElementInnerColumn, 'width' ) ) {
                            if ( indexInnerColumn === listInnerColumn.length - 1 ) {
                                innerRowSettings += attrsElementInnerColumn.width;
                            } else {
                                innerRowSettings += attrsElementInnerColumn.width + '_';
                            }
                        }
                    }
                });

                innerRowSettings = innerRowSettings.replace( /\//g, '' );

                // If the innerRowSettings flag is not set to one of the following values, it is reset to empty string (one column - full width)
                if ( '12_12' !== innerRowSettings && '23_13' !== innerRowSettings && '13_23' !== innerRowSettings && '13_13_13' !== innerRowSettings ) {
                    innerRowSettings = '';
                }










                //
                //
                //
                //
                //_.each( childCollectionInnerRow.models, function( elementInnerColumn, indexInnerColumn, listInnerColumn ) {
                //
                //    var attrsElementInnerColumn = elementInnerColumn.get( 'attrs' );
                //
                //    if ( ! _.isUndefined( attrsElementInnerColumn ) && _.isObject( attrsElementInnerColumn ) ) {
                //
                //        var oldInnerColumnWidth = '';
                //
                //        if ( _.has( attrsElementInnerColumn, 'width' ) ) {
                //            oldInnerColumnWidth = attrsElementInnerColumn.width;
                //        }
                //
                //
                //    }
                //});









                if ( '11' === oldWidthColumn ) {


                    // OLD COMMENTS!!
                    // The column (11) changes its inner rows children to adapt them.
                    // The algorithm for inner columns is here:
                    //  - '' : remains unchanged
                    //  - 13_23 :
                    //      - 13 becomes 12
                    //      - 23 becomes 12
                    //  - 23_13 :
                    //      - 23 becomes 12
                    //      - 13 becomes 12
                    //  - 13_13_13 :
                    //      - 13 becomes 12
                    //      - 13 becomes 12
                    //      - 13 is removed and its children are added to the last 12 inner column
                    //
                    // Obs. The second column (13) is already empty, being added previously by the caller of the 'changeModels(..)'

                    if ( '23' === newWidthColumn ) {

                        // Here the 'innerRowSettings' flag must be '', '23_13', '13_23' or '13_13_13'. Any other value is not valid

                        if ( '23_13' === innerRowSettings ) {

                            var firstInnerColumnModel = childCollectionInnerRow.at( 0 ),
                                secondInnerColumnModel = childCollectionInnerRow.at( 1 ),

                                attrsFirstInnerColumnModel = firstInnerColumnModel.get( 'attrs' ),
                                attrsSecondInnerColumnModel = secondInnerColumnModel.get( 'attrs' ),

                                cloneAttrsFirstInnerColumnModel = _.clone( attrsFirstInnerColumnModel ),
                                cloneAttrsSecondInnerColumnModel = _.clone( attrsSecondInnerColumnModel );

                            cloneAttrsFirstInnerColumnModel.width = '1/2';
                            cloneAttrsSecondInnerColumnModel.width = '1/2';

                            firstInnerColumnModel.set( 'attrs', cloneAttrsFirstInnerColumnModel );
                            secondInnerColumnModel.set( 'attrs', cloneAttrsSecondInnerColumnModel );

                        } else if ( '13_23' === innerRowSettings ) {

                            var firstInnerColumnModel = childCollectionInnerRow.at( 0 ),
                                secondInnerColumnModel = childCollectionInnerRow.at( 1 ),

                                attrsFirstInnerColumnModel = firstInnerColumnModel.get( 'attrs' ),
                                attrsSecondInnerColumnModel = secondInnerColumnModel.get( 'attrs' ),

                                cloneAttrsFirstInnerColumnModel = _.clone( attrsFirstInnerColumnModel ),
                                cloneAttrsSecondInnerColumnModel = _.clone( attrsSecondInnerColumnModel );

                            cloneAttrsFirstInnerColumnModel.width = '1/2';
                            cloneAttrsSecondInnerColumnModel.width = '1/2';

                            firstInnerColumnModel.set( 'attrs', cloneAttrsFirstInnerColumnModel );
                            secondInnerColumnModel.set( 'attrs', cloneAttrsSecondInnerColumnModel );

                        } else if ( '13_13_13' === innerRowSettings ) {

                            var firstInnerColumnModel = childCollectionInnerRow.at( 0 ),
                                secondInnerColumnModel = childCollectionInnerRow.at( 1 ),
                                thirdInnerColumnModel = childCollectionInnerRow.at( 2 ),

                                attrsFirstInnerColumnModel = firstInnerColumnModel.get( 'attrs' ),
                                attrsSecondInnerColumnModel = secondInnerColumnModel.get( 'attrs' ),
                                attrsThirdInnerColumnModel = thirdInnerColumnModel.get( 'attrs' ),

                                cloneAttrsFirstInnerColumnModel = _.clone( attrsFirstInnerColumnModel ),
                                cloneAttrsSecondInnerColumnModel = _.clone( attrsSecondInnerColumnModel ),
                                cloneAttrsThirdInnerColumnModel = _.clone( attrsThirdInnerColumnModel );

                            cloneAttrsFirstInnerColumnModel.width = '1/2';
                            cloneAttrsSecondInnerColumnModel.width = '1/2';

                            firstInnerColumnModel.set( 'attrs', cloneAttrsFirstInnerColumnModel );
                            secondInnerColumnModel.set( 'attrs', cloneAttrsSecondInnerColumnModel );

                            // Move the elements of the extra inner columns, and finally remove the inner column model

                            var childCollectionThirdInnerColumn = thirdInnerColumnModel.get( 'childCollection' );

                            if ( _.isUndefined( childCollectionThirdInnerColumn ) || ! childCollectionThirdInnerColumn.length ) {
                                childCollectionInnerRow.remove( thirdInnerColumnModel );
                                return;
                            }

                            var childCollectionSecondInnerColumn = secondInnerColumnModel.get( 'childCollection' );

                            // Initialize the inner column childCollection property to a new tdcIFrameData.TdcCollection() Backbone collection
                            if ( _.isUndefined( childCollectionSecondInnerColumn ) ) {
                                childCollectionSecondInnerColumn = new tdcIFrameData.TdcCollection();
                                secondInnerColumnModel.set( 'childCollection', childCollectionSecondInnerColumn );
                            }

                            _.each( childCollectionThirdInnerColumn.models, function( elementChildInnerColumn, indexInnerColumn, listInnerColumn ) {
                                childCollectionSecondInnerColumn.add( elementChildInnerColumn );
                                elementChildInnerColumn.set( 'parentModel', secondInnerColumnModel );
                            });

                            childCollectionInnerRow.remove( thirdInnerColumnModel );

                        } else {

                            // Merge the inner columns to the first inner column

                            if ( childCollectionInnerRow.models.length ) {
                                var firstInnerColumnModel = childCollectionInnerRow.at( 0 ),
                                    attrsFirstInnerColumnModel = firstInnerColumnModel.get( 'attrs' ),
                                    cloneAttrsFirstInnerColumnModel = _.clone( attrsFirstInnerColumnModel ),
                                    childCollectionFirstInnerColumnModel = firstInnerColumnModel.get( 'childCollection' );

                                delete cloneAttrsFirstInnerColumnModel.width;
                                firstInnerColumnModel.set( 'attrs', cloneAttrsFirstInnerColumnModel );

                                // Initialize the inner column childCollection property to a new tdcIFrameData.TdcCollection() Backbone collection
                                if ( _.isUndefined( childCollectionFirstInnerColumnModel ) ) {
                                    childCollectionFirstInnerColumnModel = new tdcIFrameData.TdcCollection();
                                    firstInnerColumnModel.set( 'childCollection', childCollectionFirstInnerColumnModel );
                                }

                                _.each( childCollectionInnerRow.models, function( elementInnerColumn, indexInnerColumn, listInnerColumn ) {

                                    // Skip the first inner column model
                                    if ( 0 === indexInnerColumn ) {
                                        return;
                                    }

                                    var childCollectionElementInnerColumnModel = elementInnerColumn.get( 'childCollection' );

                                    if ( ! _.isUndefined( childCollectionElementInnerColumnModel ) ) {
                                        _.each( childCollectionElementInnerColumnModel.models, function( elementChildInnerColumn, indexChildInnerColumn, listChildInnerColumn ) {

                                            elementChildInnerColumn.set( 'parentModel', firstInnerColumnModel );
                                            childCollectionFirstInnerColumnModel.add( elementChildInnerColumn );
                                        });
                                    }

                                    childCollectionInnerRow.remove( elementInnerColumn );
                                });
                            }
                        }

                    } else if ( '13' === newWidthColumn ) {

                        // Here it doesn't matter what value has the 'innerRowSettings' flag. All inner columns are merged
                        // Merge the inner columns to the first inner column

                        if ( childCollectionInnerRow.models.length ) {
                            var firstInnerColumnModel = childCollectionInnerRow.at( 0 ),
                                attrsFirstInnerColumnModel = firstInnerColumnModel.get( 'attrs' ),
                                cloneAttrsFirstInnerColumnModel = _.clone( attrsFirstInnerColumnModel ),
                                childCollectionFirstInnerColumnModel = firstInnerColumnModel.get( 'childCollection' );

                            delete cloneAttrsFirstInnerColumnModel.width;
                            firstInnerColumnModel.set( 'attrs', cloneAttrsFirstInnerColumnModel );

                            // Initialize the inner column childCollection property to a new tdcIFrameData.TdcCollection() Backbone collection
                            if ( _.isUndefined( childCollectionFirstInnerColumnModel ) ) {
                                childCollectionFirstInnerColumnModel = new tdcIFrameData.TdcCollection();
                                firstInnerColumnModel.set( 'childCollection', childCollectionFirstInnerColumnModel );
                            }

                            var lastIndexInnerColumn = 0;

                            _.each( childCollectionInnerRow.models, function( elementInnerColumn, indexInnerColumn, listInnerColumn ) {

                                // Skip the first inner column model
                                if ( 0 === indexInnerColumn ) {
                                    return;
                                }

                                lastIndexInnerColumn = indexInnerColumn;

                                var childCollectionElementInnerColumnModel = elementInnerColumn.get( 'childCollection' );

                                if ( ! _.isUndefined( childCollectionElementInnerColumnModel ) ) {
                                    _.each( childCollectionElementInnerColumnModel.models, function( elementChildInnerColumn, indexChildInnerColumn, listChildInnerColumn ) {

                                        elementChildInnerColumn.set( 'parentModel', firstInnerColumnModel );
                                        childCollectionFirstInnerColumnModel.add( elementChildInnerColumn );
                                    });
                                }
                            });

                            // We can't remove elements inside of the collection iteration.
                            // That's why we need to do it after the iteration has finished.
                            while ( lastIndexInnerColumn > 0 ) {
                                childCollectionInnerRow.remove( childCollectionInnerRow.at( lastIndexInnerColumn ) );
                                lastIndexInnerColumn--;
                            }
                        }
                    }

                } else if ( '23' === oldWidthColumn ) {

                    if ( '11' === newWidthColumn ) {

                        //OLD COMMENTS!!
                        //The second column (13) moves all its children to the first column (23).
                        //The first column (23) changes all its inner rows children (those existing and already added inner rows).
                        //Obs. We should have only 11 or 12_12 for inner columns. All other cases are converted to 11.
                        //The algorithm for inner columns is here:
                        //  - 11 or '' : remains unchanged
                        //  - 12_12 :
                        //      - 12 becomes 13
                        //      - 12 becomes 13
                        //      - a new 13 inner column is added for maintaining the existing layout. We have discussed this case!
                        //  - 23_13 : (WE SHOULD NOT HAVE THIS CASE, BECAUSE OUR COLUMNS CHANGES FROM '23_13' TO '11'. HERE AND ONLY HERE, EVEN THOUGH WE HAVE THIS CASE, WE WILL KEEP IT)
                        //      - 23 remains 23
                        //      - 13 remains 13
                        //  - 13_13_13 : (WE SHOULD NOT HAVE THIS CASE, BECAUSE OUR COLUMNS CHANGES FROM '23_13' TO '11'. HERE AND ONLY HERE, EVEN THOUGH WE HAVE THIS CASE, WE WILL KEEP IT)
                        //      - 13 remains 13
                        //      - 13 remains 13
                        //      - 13 remains 13



                        // Here the 'innerRowSettings' flag must be '12_12' or ''. Any other value is not valid

                        if ( '12_12' === innerRowSettings ) {

                            var firstInnerColumnModel = childCollectionInnerRow.at( 0 ),
                                secondInnerColumnModel = childCollectionInnerRow.at( 1 ),

                                attrsFirstInnerColumnModel = firstInnerColumnModel.get( 'attrs' ),
                                attrsSecondInnerColumnModel = secondInnerColumnModel.get( 'attrs' ),

                                cloneAttrsFirstInnerColumnModel = _.clone( attrsFirstInnerColumnModel ),
                                cloneAttrsSecondInnerColumnModel = _.clone( attrsSecondInnerColumnModel );

                            cloneAttrsFirstInnerColumnModel.width = '1/3';
                            cloneAttrsSecondInnerColumnModel.width = '1/3';

                            firstInnerColumnModel.set( 'attrs', cloneAttrsFirstInnerColumnModel );
                            secondInnerColumnModel.set( 'attrs', cloneAttrsSecondInnerColumnModel );

                            var newInnerColumnModel = new tdcIFrameData.TdcModel({
                                'content': '',
                                'tag': 'vc_column_inner',
                                'attrs': {
                                    width: '1/3'
                                },
                                'type': 'closed',
                                'level': 3,
                                'parentModel': columnModel
                            });

                            childCollectionInnerRow.add( newInnerColumnModel );

                        } else {

                            // Merge all inner columns to the first inner columns (full width), and then remove them.

                            if ( childCollectionInnerRow.models.length ) {
                                var firstInnerColumnModel = childCollectionInnerRow.at( 0 ),
                                    attrsFirstInnerColumnModel = firstInnerColumnModel.get( 'attrs' ),
                                    cloneAttrsFirstInnerColumnModel = _.clone( attrsFirstInnerColumnModel ),
                                    childCollectionFirstInnerColumnModel = firstInnerColumnModel.get( 'childCollection' );

                                delete cloneAttrsFirstInnerColumnModel.width;
                                firstInnerColumnModel.set( 'attrs', cloneAttrsFirstInnerColumnModel );

                                // Initialize the inner column childCollection property to a new tdcIFrameData.TdcCollection() Backbone collection
                                if ( _.isUndefined( childCollectionFirstInnerColumnModel ) ) {
                                    childCollectionFirstInnerColumnModel = new tdcIFrameData.TdcCollection();
                                    firstInnerColumnModel.set( 'childCollection', childCollectionFirstInnerColumnModel );
                                }

                                _.each( childCollectionInnerRow.models, function( elementInnerColumn, indexInnerColumn, listInnerColumn ) {

                                    // Skip the first inner column model
                                    if ( 0 === indexInnerColumn ) {
                                        return;
                                    }

                                    var childCollectionElementInnerColumnModel = elementInnerColumn.get( 'childCollection' );

                                    if ( ! _.isUndefined( childCollectionElementInnerColumnModel ) ) {
                                        _.each( childCollectionElementInnerColumnModel.models, function( elementChildInnerColumn, indexChildInnerColumn, listChildInnerColumn ) {

                                            elementChildInnerColumn.set( 'parentModel', firstInnerColumnModel );
                                            childCollectionFirstInnerColumnModel.add( elementChildInnerColumn );
                                        });
                                    }

                                    childCollectionInnerRow.remove( elementInnerColumn );
                                });
                            }
                        }


                    } else if ( '13' === newWidthColumn ) {

                        // Merge all inner columns to the first inner columns (full width), and then remove them.

                        if ( childCollectionInnerRow.models.length ) {
                            var firstInnerColumnModel = childCollectionInnerRow.at( 0 ),
                                attrsFirstInnerColumnModel = firstInnerColumnModel.get( 'attrs' ),
                                cloneAttrsFirstInnerColumnModel = _.clone( attrsFirstInnerColumnModel ),
                                childCollectionFirstInnerColumnModel = firstInnerColumnModel.get( 'childCollection' );

                            delete cloneAttrsFirstInnerColumnModel.width;
                            firstInnerColumnModel.set( 'attrs', cloneAttrsFirstInnerColumnModel );

                            // Initialize the inner column childCollection property to a new tdcIFrameData.TdcCollection() Backbone collection
                            if ( _.isUndefined( childCollectionFirstInnerColumnModel ) ) {
                                childCollectionFirstInnerColumnModel = new tdcIFrameData.TdcCollection();
                                firstInnerColumnModel.set( 'childCollection', childCollectionFirstInnerColumnModel );
                            }

                            _.each( childCollectionInnerRow.models, function( elementInnerColumn, indexInnerColumn, listInnerColumn ) {

                                // Skip the first inner column model
                                if ( 0 === indexInnerColumn ) {
                                    return;
                                }

                                var childCollectionElementInnerColumnModel = elementInnerColumn.get( 'childCollection' );

                                if ( ! _.isUndefined( childCollectionElementInnerColumnModel ) ) {
                                    _.each( childCollectionElementInnerColumnModel.models, function( elementChildInnerColumn, indexChildInnerColumn, listChildInnerColumn ) {

                                        elementChildInnerColumn.set( 'parentModel', firstInnerColumnModel );
                                        childCollectionFirstInnerColumnModel.add( elementChildInnerColumn );
                                    });
                                }

                                childCollectionInnerRow.remove( elementInnerColumn );
                            });
                        }

                    }

                } else if ( '13' === oldWidthColumn ) {

                    if ( '11' === newWidthColumn ) {

                        // Normally, for this case we should do nothing. It's supposed that we have just one inner column (full width)
                        //
                        // Important! Anyway, we'll do a test to ensure that the innerRowSettings will be '', '23_13', '13_23' or '13_13_13'

                        if ( '' === innerRowSettings || ( '23_13' !== innerRowSettings && '13_23' !== innerRowSettings && '13_13_13' !== innerRowSettings ) ) {

                            if ( childCollectionInnerRow.models.length ) {
                                var firstInnerColumnModel = childCollectionInnerRow.at( 0 ),
                                    attrsFirstInnerColumnModel = firstInnerColumnModel.get( 'attrs' ),
                                    cloneAttrsFirstInnerColumnModel = _.clone( attrsFirstInnerColumnModel ),
                                    childCollectionFirstInnerColumnModel = firstInnerColumnModel.get( 'childCollection' );

                                delete cloneAttrsFirstInnerColumnModel.width;
                                firstInnerColumnModel.set( 'attrs', cloneAttrsFirstInnerColumnModel );

                                // Initialize the inner column childCollection property to a new tdcIFrameData.TdcCollection() Backbone collection
                                if ( _.isUndefined( childCollectionFirstInnerColumnModel ) ) {
                                    childCollectionFirstInnerColumnModel = new tdcIFrameData.TdcCollection();
                                    firstInnerColumnModel.set( 'childCollection', childCollectionFirstInnerColumnModel );
                                }

                                _.each( childCollectionInnerRow.models, function( elementInnerColumn, indexInnerColumn, listInnerColumn ) {

                                    // Skip the first inner column model
                                    if ( 0 === indexInnerColumn ) {
                                        return;
                                    }

                                    var childCollectionElementInnerColumnModel = elementInnerColumn.get( 'childCollection' );

                                    if ( ! _.isUndefined( childCollectionElementInnerColumnModel ) ) {
                                        _.each( childCollectionElementInnerColumnModel.models, function( elementChildInnerColumn, indexChildInnerColumn, listChildInnerColumn ) {

                                            elementChildInnerColumn.set( 'parentModel', firstInnerColumnModel );
                                            childCollectionFirstInnerColumnModel.add( elementChildInnerColumn );
                                        });
                                    }

                                    childCollectionInnerRow.remove( elementInnerColumn );
                                });
                            }
                        }

                    } else if ( '23' === newWidthColumn ) {

                        // Normally, for this case we should do nothing. It's supposed that we have just one inner column (full width)
                        //
                        // Important!
                        // We'll do a test to ensure that the innerRowSettings will be '' or '12_12'

                        if ( '' === innerRowSettings || '12_12' !== innerRowSettings ) {

                            if ( childCollectionInnerRow.models.length ) {
                                var firstInnerColumnModel = childCollectionInnerRow.at( 0 ),
                                    attrsFirstInnerColumnModel = firstInnerColumnModel.get( 'attrs' ),
                                    cloneAttrsFirstInnerColumnModel = _.clone( attrsFirstInnerColumnModel ),
                                    childCollectionFirstInnerColumnModel = firstInnerColumnModel.get( 'childCollection' );

                                delete cloneAttrsFirstInnerColumnModel.width;
                                firstInnerColumnModel.set( 'attrs', cloneAttrsFirstInnerColumnModel );

                                // Initialize the inner column childCollection property to a new tdcIFrameData.TdcCollection() Backbone collection
                                if ( _.isUndefined( childCollectionFirstInnerColumnModel ) ) {
                                    childCollectionFirstInnerColumnModel = new tdcIFrameData.TdcCollection();
                                    firstInnerColumnModel.set( 'childCollection', childCollectionFirstInnerColumnModel );
                                }

                                _.each( childCollectionInnerRow.models, function( elementInnerColumn, indexInnerColumn, listInnerColumn ) {

                                    // Skip the first inner column model
                                    if ( 0 === indexInnerColumn ) {
                                        return;
                                    }

                                    var childCollectionElementInnerColumnModel = elementInnerColumn.get( 'childCollection' );

                                    if ( ! _.isUndefined( childCollectionElementInnerColumnModel ) ) {
                                        _.each( childCollectionElementInnerColumnModel.models, function( elementChildInnerColumn, indexChildInnerColumn, listChildInnerColumn ) {

                                            elementChildInnerColumn.set( 'parentModel', firstInnerColumnModel );
                                            childCollectionFirstInnerColumnModel.add( elementChildInnerColumn );
                                        });
                                    }

                                    childCollectionInnerRow.remove( elementInnerColumn );
                                });
                            }
                        }
                    }
                }


            });
        },





        changeRowModel: function( rowModel, oldWidth, newWidth ) {

            if ( _.isUndefined( rowModel ) || _.isUndefined( oldWidth ) || _.isUndefined( newWidth ) ) {
                return;
            }

            var childCollectionRow = rowModel.get( 'childCollection' );

            _.each( childCollectionRow.models, function( elementColumn, indexColumn, listColumn ) {

                var childCollectionElementColumn = elementColumn.get( 'childCollection' );

                // Do nothing for empty columns
                //if ( _.isUndefined( childCollectionElementColumn ) || ! childCollectionElementColumn.length ) {
                //    return;
                //}

                // From 1 column to 2 columns (11 to 23_13 or 11 to 13_23) or 3 columns (11 to 13_13_13)
                if ( '11' === oldWidth ) {

                    var newColumnModel = new tdcIFrameData.TdcModel({
                        'content': '',
                        'tag': 'vc_column',
                        'type': 'closed',
                        'level': 1,
                        'parentModel': rowModel
                    });

                    if ( '23_13' === newWidth ) {

                        if ( 0 === indexColumn ) {

                            var attrsElementColumn = elementColumn.get( 'attrs' );

                            if ( _.isUndefined( attrsElementColumn ) ) {
                                attrsElementColumn = {
                                    width: '2/3'
                                };
                                elementColumn.set( 'attrs', attrsElementColumn );
                            } else {
                                var newAttrsElementColumn = _.clone( attrsElementColumn );
                                newAttrsElementColumn.width = '2/3';
                                elementColumn.set( 'attrs', newAttrsElementColumn );
                            }

                            newColumnModel.set( 'attrs', {
                                width: '1/3'
                            });
                            childCollectionRow.add( newColumnModel );

                            tdcIFrameData.changeColumnModel( elementColumn, '11', '23' );
                        }

                    } else if ( '13_23' === newWidth ) {

                        if ( 0 === indexColumn ) {

                            var attrsElementColumn = elementColumn.get( 'attrs' );

                            if ( _.isUndefined( attrsElementColumn ) ) {
                                attrsElementColumn = {
                                    width: '1/3'
                                };
                                elementColumn.set( 'attrs', attrsElementColumn );
                            } else {
                                var newAttrsElementColumn = _.clone( attrsElementColumn );
                                newAttrsElementColumn.width = '1/3';
                                elementColumn.set( 'attrs', newAttrsElementColumn );
                            }

                            newColumnModel.set( 'attrs', {
                                width: '2/3'
                            });
                            childCollectionRow.add( newColumnModel );

                            tdcIFrameData.changeColumnModel( elementColumn, '11', '13' );
                        }

                    } else if ( '13_13_13' === newWidth ) {

                        if ( 0 === indexColumn ) {

                            var attrsElementColumn = elementColumn.get( 'attrs' );

                            if ( _.isUndefined( attrsElementColumn ) ) {
                                attrsElementColumn = {
                                    width: '1/3'
                                };
                                elementColumn.set( 'attrs', attrsElementColumn );
                            } else {
                                var newAttrsElementColumn = _.clone( attrsElementColumn );
                                newAttrsElementColumn.width = '1/3';
                                elementColumn.set( 'attrs', newAttrsElementColumn );
                            }

                            newColumnModel.set( 'attrs', {
                                width: '1/3'
                            });

                            childCollectionRow.add( newColumnModel );

                            var thirdColumnModel = new tdcIFrameData.TdcModel({
                                'content': '',
                                'tag': 'vc_column',
                                'attrs': {
                                    width: '1/3'
                                },
                                'type': 'closed',
                                'level': 1,
                                'parentModel': rowModel
                            });
                            childCollectionRow.add( thirdColumnModel );

                            // We call changeColumnModel just for the first column, because it is the only column that has elements
                            tdcIFrameData.changeColumnModel( elementColumn, '11', '13' );
                        }
                    }

                    // From 2 columns to 1 column (23_13 to 11), 2 columns (23_13 to 13_23) or 3 columns (23_13 to 13_13_13)
                } else if ( '23_13' === oldWidth ) {

                    if ( '11' === newWidth ) {

                        // The second column (13) moves all its children to the first column (23), then it is removed.
                        if ( 0 === indexColumn ) {

                            attrsElementColumn = elementColumn.get( 'attrs' );

                            if ( ! _.isUndefined( attrsElementColumn ) ) {

                                var newAttrsElementColumn = _.clone( attrsElementColumn );
                                delete newAttrsElementColumn.width;

                                elementColumn.set( 'attrs', newAttrsElementColumn );
                            }

                        } else if ( 1 === indexColumn ) {

                            var firstColumnModel = childCollectionRow.at( 0 ),
                                childCollectionFirstColumnModel = firstColumnModel.get( 'childCollection' );

                            if ( _.isUndefined( childCollectionFirstColumnModel ) ) {
                                childCollectionFirstColumnModel = new tdcIFrameData.TdcCollection();
                                firstColumnModel.set( 'childCollection', childCollectionFirstColumnModel );
                            }

                            if ( ! _.isUndefined( childCollectionElementColumn ) ) {
                                _.each( childCollectionElementColumn.models, function( elementChildColumn, indexChildColumn, listChildColumn ) {
                                    elementChildColumn.set( 'parentModel', firstColumnModel );
                                    childCollectionFirstColumnModel.add( elementChildColumn );
                                });
                            }

                            childCollectionRow.remove( elementColumn );

                            tdcIFrameData.changeColumnModel( firstColumnModel, '23', '11' );
                        }

                    } else if ( '13_23' === newWidth ) {

                        // The 23 column changes its inner rows children to adapt them for 13 column
                        // The 13 column changes its inner rows children to adapt them for 23 column

                        if ( 0 === indexColumn ) {

                            var attrsElementColumn = elementColumn.get( 'attrs' );

                            if ( _.isUndefined( attrsElementColumn ) ) {
                                attrsElementColumn = {
                                    width: '1/3'
                                };
                                elementColumn.set( 'attrs', attrsElementColumn );
                            } else {
                                var newAttrsElementColumn = _.clone( attrsElementColumn );
                                newAttrsElementColumn.width = '1/3';
                                elementColumn.set( 'attrs', newAttrsElementColumn );
                            }

                            tdcIFrameData.changeColumnModel( elementColumn, '23', '13' );

                        } else if ( 1 === indexColumn ) {

                            var attrsElementColumn = elementColumn.get( 'attrs' );

                            if ( _.isUndefined( attrsElementColumn ) ) {
                                attrsElementColumn = {
                                    width: '2/3'
                                };
                                elementColumn.set( 'attrs', attrsElementColumn );
                            } else {
                                var newAttrsElementColumn = _.clone( attrsElementColumn );
                                newAttrsElementColumn.width = '2/3';
                                elementColumn.set( 'attrs', newAttrsElementColumn );
                            }

                            tdcIFrameData.changeColumnModel( elementColumn, '13', '23' );
                        }

                    } else if ( '13_13_13' === newWidth ) {

                        // The first 23 column changes its inner rows children to adapt them for a 13 column
                        // The second 13 column remains at it is
                        // The third 13 column is added

                        if ( 0 === indexColumn ) {

                            var attrsElementColumn = elementColumn.get('attrs');

                            if ( _.isUndefined( attrsElementColumn ) ) {
                                attrsElementColumn = {
                                    width: '1/3'
                                };
                                elementColumn.set( 'attrs', attrsElementColumn );
                            } else {
                                var newAttrsElementColumn = _.clone( attrsElementColumn );
                                newAttrsElementColumn.width = '1/3';
                                elementColumn.set( 'attrs', newAttrsElementColumn );
                            }

                            tdcIFrameData.changeColumnModel( elementColumn, '23', '13' );

                        } else if ( 1 === indexColumn ) {

                            var thirdColumnModel = new tdcIFrameData.TdcModel({
                                'content': '',
                                'tag': 'vc_column',
                                'attrs': {
                                    width: '1/3'
                                },
                                'type': 'closed',
                                'level': 1,
                                'parentModel': rowModel
                            });
                            childCollectionRow.add( thirdColumnModel );
                        }
                    }

                } else if ( '13_23' === oldWidth ) {

                    // The second column (23) moves all its children to the first column (13), then it is removed.
                    if ( '11' === newWidth ) {

                        if ( 0 === indexColumn ) {

                            var attrsElementColumn = elementColumn.get( 'attrs' );

                            if ( ! _.isUndefined( attrsElementColumn ) ) {

                                var newAttrsElementColumn = _.clone( attrsElementColumn );
                                delete newAttrsElementColumn.width;

                                elementColumn.set( 'attrs', newAttrsElementColumn );
                            }

                        } else if ( 1 === indexColumn ) {

                            var firstColumnModel = childCollectionRow.at( 0 ),
                                childCollectionFirstColumnModel = firstColumnModel.get( 'childCollection' );

                            if ( _.isUndefined( childCollectionFirstColumnModel ) ) {
                                childCollectionFirstColumnModel = new tdcIFrameData.TdcCollection();
                                firstColumnModel.set( 'childCollection', childCollectionFirstColumnModel );
                            }

                            if ( ! _.isUndefined( childCollectionElementColumn ) ) {
                                _.each(childCollectionElementColumn.models, function (elementChildColumn, indexChildColumn, listChildColumn) {
                                    elementChildColumn.set( 'parentModel', firstColumnModel );
                                    childCollectionFirstColumnModel.add(elementChildColumn);
                                });
                            }

                            childCollectionRow.remove( elementColumn );

                            tdcIFrameData.changeColumnModel( firstColumnModel, '13', '11' );
                        }


                    } else if ( '23_13' === newWidth ) {

                        // The first column (13) changes its inner rows children to adapt them for 23 column
                        // The second column (23) changes its inner rows children to adapt them for 13 column

                        if ( 0 === indexColumn ) {

                            var attrsElementColumn = elementColumn.get( 'attrs' );

                            if ( _.isUndefined( attrsElementColumn ) ) {
                                attrsElementColumn = {
                                    width: '2/3'
                                };
                                elementColumn.set( 'attrs', attrsElementColumn );
                            } else {
                                var newAttrsElementColumn = _.clone( attrsElementColumn );
                                newAttrsElementColumn.width = '2/3';
                                elementColumn.set( 'attrs', newAttrsElementColumn );
                            }

                            tdcIFrameData.changeColumnModel( elementColumn, '13', '23' );

                        } else if ( 1 === indexColumn ) {

                            var attrsElementColumn = elementColumn.get( 'attrs' );

                            if ( _.isUndefined( attrsElementColumn ) ) {
                                attrsElementColumn = {
                                    width: '1/3'
                                };
                                elementColumn.set( 'attrs', attrsElementColumn );
                            } else {
                                var newAttrsElementColumn = _.clone( attrsElementColumn );
                                newAttrsElementColumn.width = '1/3';
                                elementColumn.set( 'attrs', newAttrsElementColumn );
                            }

                            tdcIFrameData.changeColumnModel( elementColumn, '23', '13' );
                        }

                    } else if ( '13_13_13' === newWidth ) {

                        // The first 13 column remains as it is
                        // The second 23 column changes its inner rows children to adapt them for a 13 column
                        // The third 13 column is added

                        if ( 1 === indexColumn ) {

                            var attrsElementColumn = elementColumn.get('attrs');

                            if ( _.isUndefined( attrsElementColumn ) ) {
                                attrsElementColumn = {
                                    width: '1/3'
                                };
                            } else {
                                attrsElementColumn.width = '1/3';
                            }
                            elementColumn.set('attrs', attrsElementColumn);

                            var thirdColumnModel = new tdcIFrameData.TdcModel({
                                'content': '',
                                'tag': 'vc_column',
                                'attrs': {
                                    width: '1/3'
                                },
                                'type': 'closed',
                                'level': 1,
                                'parentModel': rowModel
                            });
                            childCollectionRow.add( thirdColumnModel );

                            tdcIFrameData.changeColumnModel( elementColumn, '23', '13' );
                        }
                    }

                } else if ( '13_13_13' === oldWidth ) {

                    // The first column (13) changes its inner rows children to adapt them for 11 column
                    // The second column (13) moves all its children to the first column (13), then it is removed.
                    // The third column (13) moves all its children to the first column (13), then it is removed.

                    if ( '11' === newWidth ) {

                        if ( 0 === indexColumn ) {

                            var attrsElementColumn = elementColumn.get( 'attrs' );

                            if ( ! _.isUndefined( attrsElementColumn ) ) {

                                var newAttrsElementColumn = _.clone( attrsElementColumn );
                                delete newAttrsElementColumn.width;

                                elementColumn.set( 'attrs', newAttrsElementColumn );
                            }

                        } else {

                            var firstColumnModel = childCollectionRow.at( 0 ),
                                childCollectionFirstColumnModel = firstColumnModel.get( 'childCollection' );

                            if ( _.isUndefined( childCollectionFirstColumnModel ) ) {
                                childCollectionFirstColumnModel = new tdcIFrameData.TdcCollection();
                                firstColumnModel.set( 'childCollection', childCollectionFirstColumnModel );
                            }

                            if ( ! _.isUndefined( childCollectionElementColumn ) ) {
                                _.each( childCollectionElementColumn.models, function (elementChildColumn, indexChildColumn, listChildColumn ) {
                                    elementChildColumn.set( 'parentModel', firstColumnModel );
                                    childCollectionFirstColumnModel.add( elementChildColumn );
                                });
                            }

                            if ( 2 === indexColumn ) {
                                var secondColumnModel = childCollectionRow.at( 1 ),
                                    thirdColumnModel = childCollectionRow.at( 2 );

                                childCollectionRow.remove( thirdColumnModel );
                                childCollectionRow.remove( secondColumnModel );
                            }

                            tdcIFrameData.changeColumnModel( firstColumnModel, '13', '11' );
                        }

                    } else if ('23_13' === newWidth) {

                        // The first column (13) changes its inner rows children to adapt them for 23 column
                        // The second column (13) remains at it is
                        // The third column (13) moves its children to the second column, and then it is removed

                        if ( 0 === indexColumn ) {

                            var attrsElementColumn = elementColumn.get( 'attrs' );

                            if ( _.isUndefined( attrsElementColumn ) ) {
                                attrsElementColumn = {
                                    width: '2/3'
                                };
                                elementColumn.set( 'attrs', attrsElementColumn );
                            } else {
                                var newAttrsElementColumn = _.clone( attrsElementColumn );
                                newAttrsElementColumn.width = '2/3';
                                elementColumn.set( 'attrs', newAttrsElementColumn );
                            }


                        } else if ( indexColumn === 2 ) {

                            var firstColumnModel = childCollectionRow.at( 0 ),
                                secondColumnModel = childCollectionRow.at( 1 ),
                                childCollectionSecondColumnModel = secondColumnModel.get( 'childCollection' );

                            if ( _.isUndefined( childCollectionSecondColumnModel ) ) {
                                childCollectionSecondColumnModel = new tdcIFrameData.TdcCollection();
                                secondColumnModel.set( 'childCollection', childCollectionSecondColumnModel );
                            }

                            if ( ! _.isUndefined( childCollectionElementColumn ) ) {
                                _.each(childCollectionElementColumn.models, function (elementChildColumn, indexChildColumn, listChildColumn) {
                                    elementChildColumn.set( 'parentModel', secondColumnModel );
                                    childCollectionSecondColumnModel.add( elementChildColumn );
                                });
                            }

                            childCollectionRow.remove( elementColumn );

                            tdcIFrameData.changeColumnModel( firstColumnModel, '13', '23' );
                        }

                    } else if ('13_23' === newWidth) {

                        // The first column (13) remains as it is
                        // The second column (13) changes its inner rows children to adapt them for 23 column
                        // The third column (13) moves its children to the second column, and then it is removed

                        if ( 1 === indexColumn ) {

                            var attrsElementColumn = elementColumn.get( 'attrs' );

                            if ( _.isUndefined( attrsElementColumn ) ) {
                                attrsElementColumn = {
                                    width: '2/3'
                                };
                                elementColumn.set( 'attrs', attrsElementColumn );
                            } else {
                                var newAttrsElementColumn = _.clone( attrsElementColumn );
                                newAttrsElementColumn.width = '2/3';
                                elementColumn.set( 'attrs', newAttrsElementColumn );
                            }


                        } else if ( indexColumn === 2 ) {

                            var secondColumnModel = childCollectionRow.at( 1 ),
                                childCollectionSecondColumnModel = secondColumnModel.get( 'childCollection' );

                            if ( _.isUndefined( childCollectionSecondColumnModel ) ) {
                                childCollectionSecondColumnModel = new tdcIFrameData.TdcCollection();
                                secondColumnModel.set( 'childCollection', childCollectionSecondColumnModel );
                            }

                            if ( ! _.isUndefined( childCollectionElementColumn ) ) {
                                _.each(childCollectionElementColumn.models, function (elementChildColumn, indexChildColumn, listChildColumn) {
                                    elementChildColumn.set( 'parentModel', secondColumnModel );
                                    childCollectionSecondColumnModel.add( elementChildColumn );
                                });
                            }

                            childCollectionRow.remove( elementColumn );

                            tdcIFrameData.changeColumnModel( secondColumnModel, '13', '23' );
                        }
                    }
                }
            });

            tdcDebug.log( tdcIFrameData.tdcRows.models );
        },





        changeInnerRowModel: function( innerRowModel, oldWidth, newWidth ) {

            if ( _.isUndefined( innerRowModel ) || _.isUndefined( oldWidth ) || _.isUndefined( newWidth ) ) {
                return;
            }

            var childCollectionInnerRow = innerRowModel.get( 'childCollection' );
        }

    };

})( jQuery, Backbone, _ );
