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



/* global tdcSidebar:{} */

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


        /**
         * The main entry point.
         *
         * @param iframeContents
         */
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

                    throw 'Errors happened during tdcIframeData.init() -> bindViewsModelsWrappers()! Errors in console ...';
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




                        // Define new empty job
                        var newJob = new tdcJobManager.job();

                        newJob.shortcode = data.getShortcode;
                        newJob.columns = columns;
                        newJob.blockUid = draggedBlockUid;

                        newJob.success_callback = function( data ) {

                            tdcDebug.log( data );

                            var iFrameWindowObj = tdcAdminIFrameUI.getIframeWindow();
                            /**
                             * !!! This also fires the deleteCallback for draggedBlockUid
                             * We basically run the delete callback for the removed item
                             */
                            //iFrameWindowObj.tdcComposerBlocksApi.deleteItem(model.get('blockUid')); //@todo To be removed!

                            // Here the tdcIFrameData.deleteCallback is called because the model is not removed
                            tdcIFrameData.deleteCallback( model );

                            // set the new blockUid
                            if ( false === bindNewContent ) {
                                model.set( 'blockUid', data.blockUid );
                            } else {
                                model.set( 'blockUid', undefined );
                            }

                            // Important! It should have this property
                            if ( _.has( data, 'replyHtml' ) ) {
                                model.set( 'bindNewContent', bindNewContent );
                                model.set( 'shortcode', newJob.shortcode );
                                model.set( 'html', data.replyHtml );
                            }




                            // some request may not send js
                            if ( _.has( data, 'replyJsForEval' ) ) {
                                // add the tdcEvalGlobal GLOBAL to the iFrame and do an eval in that iframe for any js code sent
                                // by the ajax request
                                iFrameWindowObj.tdcEvalGlobal = {
                                    oldBlockUid: draggedBlockUid
                                };
                                tdcAdminIFrameUI.evalInIframe(data.replyJsForEval);


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
                    this.listenTo( this.model, 'change:current', this.changeCurrent );
                    this.listenTo( this.model, 'change:html', this.customRender );
                    this.listenTo( this.model, 'remove', this.customRemove );
                },

                /**
                 * Add/remove the 'tdc-element-selected' class to the $el element of the backbone view.
                 * This class is added always to the current model.
                 *
                 * @param model
                 * @param value
                 * @param options
                 */
                changeCurrent: function( model, value, options ) {

                    var cssClass = 'tdc-element-selected';

                    if ( this.model.has( 'current' ) && !_.isUndefined( this.model.get( 'current' ) ) && true === this.model.get( 'current' ) ) {

                        this.$el.addClass( cssClass );

                    } else {
                        this.$el.removeClass( cssClass );
                    }
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

                    tdcDebug.log( 'customRender - Rendering our model' );

                    if ( this.model.has( 'html' ) && !_.isUndefined( this.model.get( 'html' ) ) ) {

                        this.$el.html( this.model.get( 'html' ) );



                        // Bind the new content of the added inner row or row elements

                        if ( this.model.has( 'bindNewContent' ) && true === this.model.get( 'bindNewContent' ) ) {

                            // Reset the flag
                            this.model.set( 'bindNewContent', false, { silent: true} );





                            // Do the job for 'tdc-element-inner-row-temp' (inner row template from the sidebar)
                            if ( this.$el.hasClass( 'tdc-element-inner-row-temp' ) ) {

                                this.$el.removeClass( 'tdc-element-inner-row-temp' ).addClass( 'tdc-element-inner-row' );

                                // Add wrappers to the existing 'tdc-column' element
                                window.addWrappers( this.$el );

                                var childCollection = model.get( 'childCollection' );

                                // The childCollection of the model object has been modified
                                // Do nothing if it is undefined, otherwise continue and bind views to models
                                if ( ! _.isUndefined( childCollection ) ) {

                                    var errors = {};

                                    tdcIFrameData.bindViewsModelsWrappers( errors, childCollection, this.$el, 3 );

                                    if ( !_.isEmpty( errors ) ) {
                                        for ( var prop in errors ) {
                                            tdcDebug.log( errors[ prop ] );
                                        }

                                        alert( 'Errors happened during tdcIFrameData.TdcLiveView -> customRender! Errors in console ...' );
                                        return;
                                    }
                                }

                                tdcInnerRowUI.init( this.$el.parent() );
                                tdcInnerColumnUI.init( this.$el );
                                tdcElementUI.init( this.$el );

                                tdcSidebar.setSettings({
                                    '$currentRow': tdcOperationUI.inRow( this.$el ),
                                    '$currentColumn': tdcOperationUI.inColumn( this.$el ),
                                    '$currentInnerRow': tdcOperationUI.inInnerRow( this.$el )
                                });




                            // Do the job for an existing '.tdc-element-inner-row' element
                            } else if ( this.$el.hasClass( 'tdc-element-inner-row' ) ) {

                                var childCollection = this.model.get('childCollection');

                                // Reset the existing collection because it will be entirely removed
                                // Important! Reset does not trigger 'remove' event for every component. Instead, it triggers only one 'reset' event for the entire collection
                                if (!_.isUndefined(childCollection)) {
                                    childCollection.reset();
                                }

                                // Add wrappers
                                window.addInnerRowWrappers(this.$el);

                                var shortcode = this.model.get('shortcode');

                                if (true === tdcIFrameData._initNewContentStructureData(3, shortcode, model)) {

                                    //tdcDebug.log( tdcIFrameData.tdcRows );

                                    var childCollection = this.model.get('childCollection');

                                    // The childCollection of the model object has been modified
                                    // Do nothing if it is undefined, otherwise continue and bind views to models
                                    if (!_.isUndefined(childCollection)) {

                                        var errors = {};

                                        tdcIFrameData.bindViewsModelsWrappers(errors, childCollection, this.$el, 3);

                                        if (!_.isEmpty(errors)) {
                                            for (var prop in errors) {
                                                tdcDebug.log(errors[prop]);
                                            }

                                            alert('Errors happened during tdcIFrameData.TdcLiveView -> customRender! Errors in console ...');
                                            return;
                                        }
                                    }
                                }

                                tdcInnerRowUI.init( this.$el );
                                tdcInnerColumnUI.init( this.$el );
                                tdcElementUI.init( this.$el );

                                tdcSidebar.setSettings({
                                    '$currentRow': tdcOperationUI.inRow( this.$el ),
                                    '$currentColumn': tdcOperationUI.inColumn( this.$el ),
                                    '$currentInnerRow': tdcOperationUI.inInnerRow( this.$el )
                                });




                                // Do the job for 'tdc-row-temp' (row template from the sidebar)
                            } else if ( this.$el.hasClass( 'tdc-row-temp' ) ) {

                                var modelId = this.$el.data( 'model_id' ),
                                    model = tdcIFrameData.getModel( modelId ),
                                    childCollection = model.get( 'childCollection' );

                                this.$el.removeClass( 'tdc-row-temp' ).addClass( 'tdc-row' );
                                this.$el.html( this.$el.find( '.tdc-row').html() );

                                // Add wrappers to the existing 'tdc-column' element
                                window.addRowWrappers( this.$el );

                                if ( ! _.isUndefined( childCollection ) ) {

                                    var errors = {};

                                    tdcIFrameData.bindViewsModelsWrappers( errors, childCollection, this.$el, 1 );

                                    if ( !_.isEmpty( errors ) ) {
                                        for ( var prop in errors ) {
                                            tdcDebug.log( errors[ prop ] );
                                        }

                                        alert( 'Errors happened during tdcIFrameData.TdcLiveView -> customRender! Errors in console ...' );
                                        return;
                                    }
                                }

                                tdcRowUI.init( this.$el.parent() );
                                tdcColumnUI.init( this.$el );
                                tdcElementUI.init( this.$el );

                                tdcSidebar.setSettings({
                                    '$currentRow': this.$el
                                });




                            // Do the job for an existing '.tdc-row' element
                            } else if ( this.$el.hasClass( 'tdc-row' ) ) {

                                // Important! We'll get a new '.tdc-row' inside of the existing '.tdc-row', and, because of this, the content of the new row will be the content of the existing row

                                var $tdcRow = this.$el.find( '.tdc-row' ),
                                    childCollection = this.model.get( 'childCollection' );

                                // Reset the existing collection because it will be entirely removed
                                // Important! Reset does not trigger 'remove' event for every component. Instead, it triggers only one 'reset' event for the entire collection
                                if ( ! _.isUndefined( childCollection ) ) {
                                    childCollection.reset();
                                }

                                // The content of the new row will be the content of the existing row
                                this.$el.html( $tdcRow.html() );

                                // Add wrappers to the new content of the existing row
                                window.addRowWrappers( this.$el );

                                var shortcode = this.model.get( 'shortcode' );

                                //alert( 'parentModel ' + parentModel.cid );

                                if ( true === tdcIFrameData._initNewContentStructureData( 1, shortcode, this.model ) ) {

                                    //tdcDebug.log( tdcIFrameData.tdcRows );

                                    // The childCollection of the model object has been modified
                                    // Do nothing if it is undefined, otherwise continue and bind views to models
                                    if ( ! _.isUndefined( childCollection ) ) {

                                        var errors = {};

                                        tdcIFrameData.bindViewsModelsWrappers( errors, childCollection , this.$el, 1 );

                                        if ( !_.isEmpty( errors ) ) {
                                            for ( var prop in errors ) {
                                                tdcDebug.log( errors[ prop ] );
                                            }

                                            alert( 'Errors happened during tdcIFrameData.TdcLiveView -> customRender! Errors in console ...' );
                                            return;
                                        }
                                    }
                                }

                                tdcColumnUI.init( this.$el );
                                tdcInnerRowUI.init( this.$el );
                                tdcInnerColumnUI.init( this.$el );
                                tdcElementUI.init( this.$el );

                                tdcSidebar.setSettings({
                                    '$currentRow': this.$el
                                });



                            // Do the job for an existing '.tdc-column' element
                            } else if ( this.$el.hasClass( 'tdc-column' ) ) {

                                // Important! We'll get a new '.tdc-column' inside of the existing '.tdc-column', and, because of this, the content of the new column will be the content of the existing column

                                var $tdcColumn = this.$el.find( '.tdc-column' ),
                                    childCollection = this.model.get( 'childCollection' );

                                // Reset the existing collection because it will be entirely removed
                                // Important! Reset does not trigger 'remove' event for every component. Instead, it triggers only one 'reset' event for the entire collection
                                if ( ! _.isUndefined( childCollection ) ) {
                                    childCollection.reset();
                                }

                                // The content of the new column will be the content of the existing column
                                this.$el.html( $tdcColumn.html() );

                                // Add wrappers to the new content of the existing row
                                window.addColumnWrappers( this.$el );

                                var shortcode = this.model.get( 'shortcode' );

                                //alert( 'parentModel ' + parentModel.cid );

                                if ( true === tdcIFrameData._initNewContentStructureData( 2, shortcode, this.model ) ) {

                                    //tdcDebug.log( tdcIFrameData.tdcRows );

                                    // The childCollection of the model object has been modified
                                    // Do nothing if it is undefined, otherwise continue and bind views to models
                                    if ( ! _.isUndefined( childCollection ) ) {

                                        var errors = {};

                                        tdcIFrameData.bindViewsModelsWrappers( errors, childCollection , this.$el, 2 );

                                        if ( !_.isEmpty( errors ) ) {
                                            for ( var prop in errors ) {
                                                tdcDebug.log( errors[ prop ] );
                                            }

                                            alert( 'Errors happened during tdcIFrameData.TdcLiveView -> customRender! Errors in console ...' );
                                            return;
                                        }
                                    }
                                }

                                tdcInnerRowUI.init( this.$el );
                                tdcInnerColumnUI.init( this.$el );
                                tdcElementUI.init( this.$el );

                                tdcSidebar.setSettings({
                                    '$currentRow': tdcOperationUI.inRow( this.$el ),
                                    '$currentColumn': this.$el
                                });



                            // Do the job for an existing '.tdc-inner-row' element
                            } else if ( this.$el.hasClass( 'tdc-inner-row' ) ) {

                                // Important! We'll get a new '.tdc-inner-row' inside of the existing '.tdc-inner-row', and, because of this, the content of the new inner-row will be the content of the existing inner-row

                                var $tdcInnerRow = this.$el.find( '.tdc-inner-row' ),
                                    childCollection = this.model.get( 'childCollection' );

                                // Reset the existing collection because it will be entirely removed
                                // Important! Reset does not trigger 'remove' event for every component. Instead, it triggers only one 'reset' event for the entire collection
                                if ( ! _.isUndefined( childCollection ) ) {
                                    childCollection.reset();
                                }

                                // The content of the new column will be the content of the existing column
                                this.$el.html( $tdcInnerRow.html() );

                                // Add wrappers to the new content of the existing row
                                window.addInnerRowWrappers( this.$el );

                                var shortcode = this.model.get( 'shortcode' );

                                //alert( 'parentModel ' + parentModel.cid );

                                if ( true === tdcIFrameData._initNewContentStructureData( 3, shortcode, this.model ) ) {

                                    //tdcDebug.log( tdcIFrameData.tdcRows );

                                    // The childCollection of the model object has been modified
                                    // Do nothing if it is undefined, otherwise continue and bind views to models
                                    if ( ! _.isUndefined( childCollection ) ) {

                                        var errors = {};

                                        tdcIFrameData.bindViewsModelsWrappers( errors, childCollection , this.$el, 3 );

                                        if ( !_.isEmpty( errors ) ) {
                                            for ( var prop in errors ) {
                                                tdcDebug.log( errors[ prop ] );
                                            }

                                            alert( 'Errors happened during tdcIFrameData.TdcLiveView -> customRender! Errors in console ...' );
                                            return;
                                        }
                                    }
                                }

                                tdcInnerColumnUI.init( this.$el );
                                tdcElementUI.init( this.$el );

                                tdcSidebar.setSettings({
                                    '$currentRow': tdcOperationUI.inRow( this.$el ),
                                    '$currentColumn': tdcOperationUI.inColumn( this.$el ),
                                    '$currentInnerRow': this.$el
                                });


                            // Do the job for an existing '.tdc-inner-column' element
                            } else if ( this.$el.hasClass( 'tdc-inner-column' ) ) {

                                // Important! We'll get a new '.tdc-inner-column' inside of the existing '.tdc-inner-column', and, because of this, the content of the new inner-column will be the content of the existing inner-column

                                var $tdcInnerColumn = this.$el.find( '.tdc-inner-column' ),
                                    childCollection = this.model.get( 'childCollection' );

                                // Reset the existing collection because it will be entirely removed
                                // Important! Reset does not trigger 'remove' event for every component. Instead, it triggers only one 'reset' event for the entire collection
                                if ( ! _.isUndefined( childCollection ) ) {
                                    childCollection.reset();
                                }

                                // The content of the new column will be the content of the existing column
                                this.$el.html( $tdcInnerColumn.html() );

                                // Add wrappers to the new content of the existing row
                                window.addInnerColumnWrappers( this.$el );

                                var shortcode = this.model.get( 'shortcode' );

                                //alert( 'parentModel ' + parentModel.cid );

                                if ( true === tdcIFrameData._initNewContentStructureData( 4, shortcode, this.model ) ) {

                                    //tdcDebug.log( tdcIFrameData.tdcRows );

                                    // The childCollection of the model object has been modified
                                    // Do nothing if it is undefined, otherwise continue and bind views to models
                                    if ( ! _.isUndefined( childCollection ) ) {

                                        var errors = {};

                                        tdcIFrameData.bindViewsModelsWrappers( errors, childCollection , this.$el, 4 );

                                        if ( !_.isEmpty( errors ) ) {
                                            for ( var prop in errors ) {
                                                tdcDebug.log( errors[ prop ] );
                                            }

                                            alert( 'Errors happened during tdcIFrameData.TdcLiveView -> customRender! Errors in console ...' );
                                            return;
                                        }
                                    }
                                }

                                tdcElementUI.init( this.$el );

                                tdcSidebar.setSettings({
                                    '$currentRow': tdcOperationUI.inRow( this.$el ),
                                    '$currentColumn': tdcOperationUI.inColumn( this.$el ),
                                    '$currentInnerRow': tdcOperationUI.inInnerRow( this.$el ),
                                    '$currentInnerColumn': this.$el
                                });



                                // The callback that will execute when a new empty row is added to the '#tdc-rows' empty element
                            } else if ( 'tdc-rows' === this.$el.attr( 'id' ) ) {

                                // The $el view property is set temporary to the new '#tdc-rows'
                                // Important! The last step will set the $el to the new empty row

                                var $tdcRow = this.$el.find( '.tdc-row' ),
                                    modelId = this.model.cid,
                                    model = tdcIFrameData.getModel( modelId ),
                                    childCollection = model.get( 'childCollection' );

                                // Set the data 'model_id' to the new added '.tdc-row'
                                $tdcRow.data( 'model_id', modelId );

                                // Add wrappers
                                window.addRowWrappers( this.$el );

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

                                tdcRowUI.init( this.$el );
                                tdcColumnUI.init( this.$el );
                                tdcInnerRowUI.init( this.$el );
                                tdcInnerColumnUI.init( this.$el );
                                tdcElementUI.init( this.$el );

                                // Remove the old '.tdc-row'
                                // Important! The operation must be the last one, because till now its usage is as a content

                                tdcSidebar.setSettings({
                                    '$currentRow': $tdcRow
                                });

                                // The $el view property is set to the new '.tdc-row'
                                this.$el = $tdcRow;
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
                    tdcIFrameData._getData( undefined, element, errors );
                });

                if ( !_.isEmpty( errors ) ) {
                    tdcDebug.log( errors );

                    throw 'Errors happened during _initStructureData() -> _getData()! Errors in console ...';
                }


                var data = {
                    error: undefined,
                    shortcode: undefined
                };

                tdcIFrameData.checkCurrentData( data );

                if ( !_.isUndefined( data.error ) ) {
                    tdcDebug.log( data.error );

                    throw 'Errors happened during _initStructureData() -> checkCurrentData()! Errors in console ...';
                }
            }
            return true;
        },







        _initNewContentStructureData: function( startLevel, shortcode, parentModel ) {

            var content = tdcIFrameData._getContentJSON( startLevel, shortcode );

            //tdcDebug.log( content );

            if ( content.length ) {

                var errors = {};

                _.each( content, function( element, index, list ) {
                    tdcIFrameData._getData( parentModel , element, errors, startLevel );
                });

                if ( !_.isEmpty( errors ) ) {
                    tdcDebug.log( errors );

                    throw 'Errors happened during _initNewContentStructureData() -> _getData()! Errors in console ...';
                }


                var data = {
                    error: undefined,
                    shortcode: undefined
                };

                tdcIFrameData.checkCurrentData( data );

                if ( !_.isUndefined( data.error ) ) {
                    tdcDebug.log( data.error );

                    throw 'Errors happened during _initNewContentStructureData() -> checkCurrentData()! Errors in console ...';
                }
            }
            return true;
        },






        /**
         * Initialize the 'childCollection' collection of the 'parentModel' param.
         * If the 'parentModel' param is not specified, the backbone tdcRows collection is initialized.
         * At the same time, it collects all errors happened during the initialization process.
         *
         * @param parentModel
         * @param element
         * @param errors
         * @param startLevel
         * @private
         */
        _getData: function( parentModel, element, errors, startLevel ) {

            var model,
                errorInfo,
                collection;

            if ( _.isUndefined( parentModel ) ) {
                collection = tdcIFrameData.tdcRows;
            } else {
                collection = parentModel.get( 'childCollection' );
            }


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


                    // Exception for the elements on the level 4 which are 'closed' type
                    // Add the 'content' property to the attrs, because it needs to be treated as the other elements of attrs
                    if ( 4 === parseInt( level, 10 ) && ! _.isUndefined( element.shortcode.content ) ) {
                        element.shortcode.attrs.named.content = element.shortcode.content;
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

                            tdcIFrameData._getData( model, element, errors, undefined );
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
            // Important! We should not have the situation when the model is not set, because the JSON data is obtained using shortcode parser setting
            // The previous checks were added as a supplementary check level over the JSON data builder.
            if ( ! _.isUndefined( model ) ) {
                if ( ! _.isUndefined( collection ) ) {
                    collection.add( model );
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
         * Get the first model by tag.
         * It looks for the model into the entire collection recursively.
         * If no collection is specified, the entire backbone structure data is used.
         *
         * @param tag
         * @param collection
         * @returns {*}
         */
        getFirstModelByTag: function( tag, collection ) {

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

                if ( element.attributes.tag === tag ) {
                    model = element;
                    return;
                }

                //console.log( element );

                if ( element.has( 'childCollection') ) {
                    var childCollection = element.get( 'childCollection' );

                    model = tdcIFrameData.getFirstModelByTag( tag, childCollection );
                }
            });

            if ( !_.isUndefined( model ) ) {
                return model;
            }
        },





        ///**
        // * Remove the model by id.
        // * It looks for the model into the entire collection recursively.
        // * If no collection is specified, the entire backbone structure data is used.
        // *
        // * @param modelId
        // * @param collection
        // * @returns {*}
        // */
        //removeModelById: function( modelId, collection ) {
        //
        //    var model = tdcIFrameData.getModel( modelId, collection );
        //
        //    if ( _.isUndefined( model ) ) {
        //        return false;
        //    }
        //
        //    var parentModel = model.get( 'parentModel' );
        //
        //    if ( _.isUndefined( parentModel ) ) {
        //        tdcIFrameData.tdcRows.remove( model );
        //    } else {
        //        parentModel.get( 'childCollection' ).remove( model );
        //    }
        //},





        /**
         * Remove the model.
         *
         * @param model
         * @param options - Backbone remove options @see backbone docs
         * @returns {*}
         */
        removeModel: function( model, options ) {

            var parentModel = model.get( 'parentModel' );

            if ( _.isUndefined( options ) ) {
                options = {};
            }

            if ( _.isUndefined( parentModel ) ) {
                tdcIFrameData.tdcRows.remove( model, options );
            } else {
                parentModel.get( 'childCollection' ).remove( model, options );
            }

            tdcIFrameData.deleteCallback( model );
        },


        /**
         * It calls tdcComposerBlocksApi.deleteItem for the given model and for all its children
         * It's enough to remove a model, being called by tdcIFrameData.removeModel
         *
         * @param model
         */
        deleteCallback: function( model ) {

            var blockUid = model.get( 'blockUid' ),
                childCollection = model.get( 'childCollection' );

            tdcAdminIFrameUI.getIframeWindow().tdcComposerBlocksApi.deleteItem( blockUid );

            if ( ! _.isUndefined( childCollection ) && childCollection.length ) {
                _.each( childCollection.models, function( elementChild, indexChildColumn, listChildColumn ) {
                    tdcIFrameData.deleteCallback( elementChild );
                });
            }
        },






        /**
         * Helper function used to check if a model of the current structure data, respects the shortcode levels.
         * It stops if an error occurred.
         * The error is saved into the data.error input param.
         * If no error occurred and if the data.getShortcode input param is specified, it will return the shortcode for the given model.
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



                // 'td_block_text_with_title' Exception
                // It is level 4 element and a closed modelType. It's 'content' attribute is inside and not as attribute.

                if ( 'td_block_text_with_title' === modelTag ) {

                    _.map( modelAttrs, function( val, key ) {
                        if ( 'content' === key ) {
                            return;
                        }
                        localShortcode += ' ' + key + '="' + val + '"';
                    });

                    if ( _.has( modelAttrs, 'content' ) ) {

                        // When it has 'content' attribute, it is formated as CLOSED shortcode
                        localShortcode = '[' + modelTag + localShortcode + ']' + modelAttrs.content + '[/' + modelTag + ']';

                    } else {

                        // When it hasn't 'content' attribute, it is formated as SINGLE shortcode
                        localShortcode = '[' + modelTag + localShortcode + ']';
                    }

                } else {

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
         *      Case A.2. Inner row dragged ( a temp inner row)
         *      Case A.3. Row dragged (a temp row)
         *
         *      Obs. It was necessary to differentiate an existing row (inner row) from a temp row (inner row), because we have different situations.
         *      The temp rows (inner rows) always need a server request, and for the existing rows (inner rows), this is not necessary all the time.
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

                    if ( _.isUndefined( destinationModel ) ) {
                        throw 'changeData Error: Destination model not in structure data!';
                    }

                    destinationColParam = tdcIFrameData._getDestinationCol();

                    // Change the model structure
                    // The 'childCollection' attribute of the destination model does not exist for the inner-columns or columns that contain only the empty element
                    // In this case, we initialize it at an empty collection
                    if ( ! destinationModel.has( 'childCollection' ) ) {
                        destinationModel.set( 'childCollection', new tdcIFrameData.TdcCollection() );
                    }

                    destinationChildCollection = destinationModel.get( 'childCollection' );

                    var shortcodeName = $draggedElement.data( 'shortcodeName' ),
                        shortcodeTitle = $draggedElement.html(),

                    // Define the model
                        elementModel = new tdcIFrameData.TdcModel({
                            'content': '',
                            'attrs': {
                                'ajax_pagination': 'next_prev',
                                'custom_title': shortcodeTitle,
                                'post_id': window.tdcPostSettings.postId
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

                    tdcRecycle.takeSnapshot( elementModel.get( 'tag' ) + ' : sidebar element added' );

                    // Set the data model id to the liveView jquery element
                    $draggedElement.data( 'model_id', elementModel.cid );

                    destinationChildCollection.add( elementModel, { at: newPosition } );

                    elementModel.set( 'parentModel', destinationModel );

                    // Get the shortcode rendered
                    elementModel.getShortcodeRender( destinationColParam, whatWasDragged.draggedBlockUid, false );


                } else if ( whatWasDragged.wasTempInnerRowDragged ) {

                    // Case A.2

                    tdcRecycle.takeSnapshot( 'Sidebar inner-row added' );

                    destinationModel = tdcIFrameData._getDestinationModel(['.tdc-column']);

                    if ( _.isUndefined( destinationModel ) ) {
                        throw 'changeData Error: Destination model not in structure data!';
                    }

                    destinationColParam = tdcIFrameData._getDestinationCol();

                    // Change the model structure
                    // The 'childCollection' attribute of the destination model does not exist for the inner-columns or columns that contain only the empty element
                    // In this case, we initialize it at an empty collection
                    if ( ! destinationModel.has( 'childCollection' ) ) {
                        destinationModel.set( 'childCollection', new tdcIFrameData.TdcCollection() );
                    }
                    destinationChildCollection = destinationModel.get( 'childCollection' );

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
                    });

                    // Set the data model id to the liveView jquery element
                    $draggedElement.data( 'model_id', innerRowModel.cid );

                    destinationChildCollection.add( innerRowModel, {at: newPosition } );

                    var childCollectionInnerRow = new tdcIFrameData.TdcCollection();
                    childCollectionInnerRow.add( innerColumnModel );
                    innerRowModel.set( 'childCollection', childCollectionInnerRow );

                    var childCollectionInnerColumn = new tdcIFrameData.TdcCollection();
                    innerColumnModel.set( 'childCollection', childCollectionInnerColumn );


                    // Get the shortcode rendered
                    innerRowModel.getShortcodeRender( destinationColParam, whatWasDragged.draggedBlockUid, true );


                } else if ( whatWasDragged.wasTempRowDragged ) {

                    // Case A.3

                    tdcRecycle.takeSnapshot( 'Sidebar row added' );

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

                    tdcIFrameData.tdcRows.add( rowModel, { at: newPosition } );

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
                        //tdcAdminIFrameUI.getIframeWindow().tdcComposerBlocksApi.deleteItem(whatWasDragged.draggedBlockUid); //@todo To be removed!

                        tdcDebug.log('element recycled');

                        tdcRecycle.takeSnapshot( elementModel.get( 'tag' ) + ' : element recycled' );

                        tdcIFrameData.removeModel( elementModel );
                        //tdcDebug.log( tdcIFrameData.tdcRows );
                        return;
                    }



                    tdcRecycle.takeSnapshot( elementModel.get( 'tag' ) + ' : element moved' );

                    sourceModel = elementModel.get( 'parentModel' );
                    destinationModel = tdcIFrameData._getDestinationModel( ['.tdc-inner-column', '.tdc-column'] );

                    if ( _.isUndefined( destinationModel ) ) {
                        throw 'changeData Error: Destination model not in structure data!';
                    }

                    if ( sourceModel.cid === destinationModel.cid ) {

                        sourceChildCollection = sourceModel.get( 'childCollection' );
                        sourceChildCollection.remove( elementModel, { silent: true } );
                        // Here it seems the tdcIFrameData.removeModel is not necessary, because the request to the server is not necessary
                        //tdcIFrameData.removeModel( elementModel, { silent: true } );
                        sourceChildCollection.add( elementModel, { at: newPosition } );

                    } else {

                        // The column param filter
                        destinationColParam = tdcIFrameData._getDestinationCol();

                        // Change the model structure
                        // The 'childCollection' attribute of the destination model does not exist for the inner-columns or columns that contain only the empty element
                        // In this case, we initialize it at an empty collection
                        if ( ! destinationModel.has( 'childCollection' ) ) {
                            destinationModel.set( 'childCollection', new tdcIFrameData.TdcCollection() );
                        }

                        destinationChildCollection = destinationModel.get( 'childCollection' );

                        //sourceChildCollection = sourceModel.get( 'childCollection' );

                        //sourceChildCollection.remove( elementModel, { silent: true } );
                        tdcIFrameData.removeModel( elementModel, { silent: true } );
                        destinationChildCollection.add( elementModel, { at: newPosition } );

                        elementModel.set( 'parentModel', destinationModel );

                        // Get the shortcode rendered
                        elementModel.getShortcodeRender( destinationColParam, whatWasDragged.draggedBlockUid, false );
                    }

                } else if ( whatWasDragged.wasInnerRowDragged ) {

                    tdcDebug.log('case 2');


                    // If the element is recycled, just remove the model from data structure
                    if ( tdcOperationUI.getCurrentElementOver() === tdcAdminWrapperUI.$recycle ) {
                        tdcDebug.log('inner row recycled');

                        tdcRecycle.takeSnapshot( 'Inner row recycled' );

                        tdcIFrameData.removeModel( elementModel );
                        //tdcDebug.log( tdcIFrameData.tdcRows );
                        return;
                    }


                    tdcRecycle.takeSnapshot( 'Inner row moved' );

                    sourceModel = elementModel.get( 'parentModel' );
                    destinationModel = tdcIFrameData._getDestinationModel( ['.tdc-column'] );

                    if ( _.isUndefined( destinationModel ) ) {
                        throw 'changeData Error: Destination model not in structure data!';
                    }

                    if ( sourceModel.cid === destinationModel.cid ) {

                        sourceChildCollection = sourceModel.get( 'childCollection' );
                        sourceChildCollection.remove( elementModel, { silent: true } );
                        //tdcIFrameData.removeModel( elementModel, { silent: true } );
                        sourceChildCollection.add( elementModel, { at: newPosition } );

                    } else {

                        // Change the model structure
                        // The 'childCollection' attribute of the destination model does not exist for the inner-columns or columns that contain only the empty element
                        // In this case, we initialize it at an empty collection
                        if ( ! destinationModel.has( 'childCollection' ) ) {
                            destinationModel.set( 'childCollection', new tdcIFrameData.TdcCollection() );
                        }

                        destinationChildCollection = destinationModel.get( 'childCollection' );


                        // Move the model inside of the structure data
                        //sourceChildCollection = sourceModel.get( 'childCollection' );
                        //sourceChildCollection.remove( elementModel, { silent: true } );
                        tdcIFrameData.removeModel( elementModel, { silent: true } );
                        destinationChildCollection.add( elementModel, { at: newPosition } );
                        elementModel.set( 'parentModel', destinationModel );


                        // Change the model structure
                        var attrsSourceModel = sourceModel.get( 'attrs' ),
                            attrsDestionationModel = destinationModel.get( 'attrs' ),
                            widthSource,
                            widthDestination;

                        if ( _.has( attrsSourceModel, 'width' ) ) {
                            switch ( attrsSourceModel.width ) {
                                case '1/3': widthSource = '13'; break;
                                case '2/3': widthSource = '23'; break;
                            }
                        }

                        if ( _.has( attrsDestionationModel, 'width' ) ) {
                            switch ( attrsDestionationModel.width ) {
                                case '1/3': widthDestination = '13'; break;
                                case '2/3': widthDestination = '23'; break;
                            }
                        }

                        if ( _.isUndefined( widthSource ) ) {
                            widthSource = '11';
                        }

                        if ( _.isUndefined( widthDestination ) ) {
                            widthDestination = '11';
                        }

                        if ( widthSource !== widthDestination ) {

                            var childCollection = elementModel.get( 'childCollection' );

                            if ( ! _.isUndefined( childCollection ) ) {

                                // The existing collection width
                                var widthCollection = tdcIFrameData.getChildCollectionWidths( childCollection );

                                if ( _.isUndefined( widthCollection ) ) {
                                    widthCollection = '11';
                                }

                                // The new width of the collection (default '11')
                                var newWidthCollection = '11';

                                // Number of columns to get the shortcode rendered (getShortcodeRender)
                                var columns = 1;

                                switch ( widthDestination ) {
                                    case '11':
                                        switch ( widthCollection ) {
                                            case '11':
                                                // Keep the collection width
                                                newWidthCollection = '11';
                                                break;

                                            case '23_13':
                                                // Keep the collection width
                                                newWidthCollection = '23_13';
                                                break;

                                            case '13_23':
                                                // Do nothing
                                                newWidthCollection = '13_23';
                                                break;

                                            case '12_12':
                                                // Change from '12_12' to '13_13_13'
                                                newWidthCollection = '13_13_13';
                                                break;

                                            case '13_13_13':
                                                // Keep the collection width
                                                newWidthCollection = '13_13_13';
                                                break;
                                        }

                                        // Change the number of columns to 3, because 'widthDestination' is '11'
                                        columns = 3;

                                        break;

                                    case '13':
                                        switch ( widthCollection ) {
                                            case '11':
                                                // Keep the collection width
                                                newWidthCollection = '11';
                                                break;

                                            case '23_13':
                                                // Change from '23_13' to '11'
                                                newWidthCollection = '11';
                                                break;

                                            case '13_23':
                                                // Change from '13_23' to '11'
                                                newWidthCollection = '11';
                                                break;

                                            case '12_12':
                                                // Change from '12_12' to '11'
                                                newWidthCollection = '11';
                                                break;

                                            case '13_13_13':
                                                // Change from '13_13_13' to '11'
                                                newWidthCollection = '11';
                                                break;
                                        }
                                        // Keep the number of columns to 1, because 'widthDestination' is '13'
                                        break;

                                    case '23':
                                        switch ( widthCollection ) {
                                            case '11':
                                                // Keep the collection width
                                                newWidthCollection = '11';
                                                break;

                                            case '23_13':
                                                // Change from '23_13' to '12_12'
                                                newWidthCollection = '12_12';
                                                break;

                                            case '13_23':
                                                // Change from '13_23' to '12_12'
                                                newWidthCollection = '12_12';
                                                break;

                                            case '12_12':
                                                // Keep the collection '12_12'
                                                newWidthCollection = '12_12';
                                                break;

                                            case '13_13_13':
                                                // Change from '13_13_13' to '12_12'
                                                newWidthCollection = '12_12';
                                                break;
                                        }

                                        // Change the number of columns to 2, because 'widthDestination' is '23'
                                        columns = 2;
                                        break;
                                }

                                if ( widthCollection !== newWidthCollection ) {
                                    tdcIFrameData.changeInnerRowModel( elementModel, widthCollection, newWidthCollection );
                                    elementModel.getShortcodeRender( columns, null, true, Math.random() + Math.random() + Math.random() );
                                }
                            }
                        }

                        var $currentRow = tdcOperationUI.inRow( $draggedElement ),
                            $currentColumn = tdcOperationUI.inColumn( $draggedElement ),
                            $currentInnerRow = tdcOperationUI.inInnerRow( $draggedElement );

                        if ( ! _.isUndefined( $currentRow ) && ! _.isUndefined( $currentColumn ) && ! _.isUndefined( $currentInnerRow ) ) {

                            tdcSidebar.setSettings({
                                '$currentRow': $currentRow,
                                '$currentColumn': $currentColumn,
                                '$currentInnerRow': $currentInnerRow
                            });
                        }
                    }

                } else if ( whatWasDragged.wasInnerColumnDragged || whatWasDragged.wasColumnDragged ) {

                    tdcDebug.log( 'case 3' );

                    if ( whatWasDragged.wasColumnDragged ) {
                        tdcRecycle.takeSnapshot( 'Column moved' );
                    } else if ( whatWasDragged.wasInnerColumnDragged ) {
                        tdcRecycle.takeSnapshot( 'Inner-column moved' );
                    }


                    sourceModel = elementModel.get( 'parentModel' );
                    sourceChildCollection = sourceModel.get( 'childCollection' );
                    sourceChildCollection.remove( elementModel, {silent: true} );
                    //tdcIFrameData.removeModel( elementModel, { silent: true } );
                    sourceChildCollection.add( elementModel, { at: newPosition } );


                    // Here the changes over the column or over the inner columns must be reflected by the sidebar columns or inner columns settings

                    if ( whatWasDragged.wasColumnDragged ) {

                        var $currentRow = tdcOperationUI.inRow( $draggedElement );

                        if ( ! _.isUndefined( $currentRow ) ) {

                            tdcSidebar.setSettings({
                                '$currentRow': $currentRow
                            });
                        }

                    } else if ( whatWasDragged.wasInnerColumnDragged ) {

                        var $currentRow = tdcOperationUI.inRow( $draggedElement ),
                            $currentColumn = tdcOperationUI.inColumn( $draggedElement ),
                            $currentInnerRow = tdcOperationUI.inInnerRow( $draggedElement );

                        if ( ! _.isUndefined( $currentRow ) && ! _.isUndefined( $currentColumn ) && ! _.isUndefined( $currentInnerRow ) ) {

                            tdcSidebar.setSettings({
                                '$currentRow': $currentRow,
                                '$currentColumn': $currentColumn,
                                '$currentInnerRow': $currentInnerRow
                            });
                        }
                    }

                } else if ( whatWasDragged.wasRowDragged ) {

                    tdcDebug.log( 'case 4' );

                    // If the element is recycled, just remove the model from data structure
                    if ( tdcOperationUI.getCurrentElementOver() === tdcAdminWrapperUI.$recycle ) {

                        tdcDebug.log('row recycled');

                        tdcRecycle.takeSnapshot( 'Row recycled' );

                        //tdcIFrameData.tdcRows.remove( elementModel );
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
                            // Usually the $el view parameter should reference a '.tdc-row' element, but because we don't have any row it will reference the '#tdc-rows', until the server response (the getShortcodeRender(..) is called)
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

                    tdcRecycle.takeSnapshot( 'Row moved' );

                    tdcIFrameData.tdcRows.remove( elementModel, {silent: true} );
                    //tdcIFrameData.removeModel( elementModel, { silent: true } );
                    tdcIFrameData.tdcRows.add( elementModel, {at: newPosition } );

                    tdcDebug.log( 'newPosition: ' + newPosition );
                    tdcDebug.log( $draggedElement );
                }
            }

            tdcDebug.log( tdcIFrameData.tdcRows );
        },


        /**
         * Get the column number for the model, from its 'width' attribute
         *
         * @param model
         * @returns {number}
         * @private
         */
        _parseModelWidthAttrs: function( model ) {
            var modelAttrs = model.get( 'attrs' ),
                columns = 3;

            if ( _.has( modelAttrs, 'width' ) ) {

                var width = modelAttrs.width;

                // The source column param filter
                switch ( width ) {
                    case '1/3' : columns = 1; break;
                    case '2/3' : columns = 2; break;
                    case '1/2' : columns = 1; break;
                }
            }
            return columns;
        },


        /**
         * Get the column number for the model, looking to its parents
         *
         * @param model
         * @returns {number}
         */
        getColumnNumber: function( model ) {

            var columns = 3,
                modelLevel = parseInt( model.get( 'level' ), 10),
                parentModel = model.get( 'parentModel' );

            // Do nothing if the parentModel is undefined
            // It means we have a row model, and this works with 3 columns by default
            if ( ! _.isUndefined( parentModel ) ) {

                // If the model is of an element, get the columns from its structure parent elements
                if ( 4 === modelLevel ) {

                    var parentModelColumns = tdcIFrameData._parseModelWidthAttrs( parentModel );

                    if ( '3' === parentModelColumns ) {
                        columns = tdcIFrameData.getColumnNumber( parentModel );
                    } else {
                        columns = parentModelColumns;
                    }

                // If the model is of a structure element (tdc-column, tdc-inner-row, tdc-inner-column), take the columns from the model
                } else {

                    var modelColumns = tdcIFrameData._parseModelWidthAttrs( model );

                    if ( '3' === modelColumns ) {
                        columns = tdcIFrameData.getColumnNumber( parentModel );
                    } else {
                        columns = modelColumns;
                    }
                }
            }

            return columns;
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

            if ( ! $destination.length ) {
                throw '_getDestinationModel Error: Container destination not available!';
            }

            // The model id (where the item model must be inserted)
            var destinationModelId = $destination.data( 'model_id' );

            if ( _.isUndefined( destinationModelId ) ) {
                throw '_getDestinationModel Error: Model id of the container destination not in data!';
            }

            // The model (where the item model must be inserted)
            var destinationModel = tdcIFrameData.getModel( destinationModelId );

            if ( _.isUndefined( destinationModel ) ) {
                throw '_getDestinationModel Error: Model not in structure data!';
            }

            //tdcDebug.log( destinationModel );

            return destinationModel;
        },





        /**
         * Get the destination model, looking up into DOM and getting the 'model_id', and then searching into the structure data
         *
         * @private
         */
        _getDestinationCol: function() {

            var $draggedElement = tdcOperationUI.getDraggedElement();

            // The returned destination columns' number
            var destinationCol;

            // Get the closest available container
            var $destinationColumn,
                $destinationInnerColumn;

            $destinationColumn = $draggedElement.closest( '.tdc-column' );
            $destinationInnerColumn = $draggedElement.closest( '.tdc-inner-column' );

            if ( $destinationInnerColumn.length ) {

                // The inner column model id (where the item model must be inserted)
                var destinationInnerColumnModelId = $destinationInnerColumn.data( 'model_id' );

                if ( _.isUndefined( destinationInnerColumnModelId ) ) {
                    throw '_getDestinationCol Error: The inner column model id not in data!';
                }

                // The inner column model (where the item model must be inserted)
                var destinationInnerColumnModel = tdcIFrameData.getModel( destinationInnerColumnModelId );

                if ( _.isUndefined( destinationInnerColumnModel ) ) {
                    throw '_getDestinationCol Error: The inner column model not in structure data!';
                }

                // Get the inner columns' number
                destinationCol = tdcIFrameData._parseModelWidthAttrs( destinationInnerColumnModel );

                // Do not continue if the inner column destination has not the maximum number of columns (3), otherwise go further and check the column
                if ( 3 !== destinationCol ) {
                    return destinationCol;
                }
            }

            // We get here if there's an inner column destination, but it has the maximum number of columns (3), OR if there's no inner column destination
            if ( $destinationColumn.length ) {

                // The column model id
                var destinationColumnModelId = $destinationColumn.data( 'model_id' );

                if ( _.isUndefined( destinationColumnModelId ) ) {
                    throw '_getDestinationCol Error: The column model id not in data!';
                }

                // The column model (where the item model must be inserted)
                var destinationColumnModel = tdcIFrameData.getModel( destinationColumnModelId );

                if ( _.isUndefined( destinationColumnModelId ) ) {
                    throw '_getDestinationCol Error: Tne column model not in structure data!';
                }

                // Get the columns' number
                destinationCol = tdcIFrameData._parseModelWidthAttrs( destinationColumnModel );

                // Return the columns' number
                return destinationCol;

            } else {

                // The destination column must be present all the time.
                throw '_getDestinationCol Error: The destination container is not inside of .tdc-column !';
            }
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
         * The computing starts from the level param, if this param is specified and not undefined. Otherwise from level initialized with the top most level 0.
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


                    // Set the block id
                    // @todo Here the blockUid will be the block uid for the row. Till then the blockUid is undefined
                    model.set( 'blockUid', undefined );


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
                            //alert( collection.models.length + ' : ' + jqDOMElements.length );
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
                            //alert( collection.models.length + ' : ' + jqDOMElements.length );
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
                            //alert ( collection.models.length + ' : ' + jqDOMElements.length );
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
                            //alert( collection.models.length + ' : ' + jqDOMElements.length );
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
                    model.set( 'html', element.innerHTML, { silent: true } );

                    // Set the block id
                    // @todo Here the blockUid will be undefined for columns, inner rows and inner columns
                    var blockUId;

                    if ( 4 === model.get( 'level') ) {
                        var $tdBlockInner = $element.find( '.td_block_inner');

                        if ( $tdBlockInner.length ) {
                            blockUId = $tdBlockInner.attr( 'id' );
                        }
                    }

                    model.set( 'blockUid', blockUId );

                    // Create the view
                    var liveView = new tdcIFrameData.TdcLiveView({
                        model: model,
                        el: element
                    });

                    // Go deeper to the children, if the jq dom element is not tdc-element and the model has collection
                    if ( ! $element.hasClass( 'tdc-element' ) && model.has( 'childCollection' ) && _.size( model.get( 'childCollection' ) ) > 0 ) {

                        tdcIFrameData.bindViewsModelsWrappers( errors, model.get( 'childCollection' ), $element, level );
                    }
                });

                // Decrement the level, for the next bindViewsModelsWrappers call
                level--;
            }
            //tdcDebug.log( tdcIFrameData.tdcRows.models );
        },






        //changeRowModel: function( rowModel, oldWidth, newWidth ) {
        //
        //    //if ( _.isUndefined( rowModel ) || _.isUndefined( oldWidth ) || _.isUndefined( newWidth ) ) {
        //    //    return;
        //    //}
        //
        //    var childCollectionRow = rowModel.get( 'childCollection' );
        //
        //    _.each( childCollectionRow.models, function( elementColumn, indexColumn, listColumn ) {
        //
        //        var childCollectionElementColumn = elementColumn.get( 'childCollection' );
        //
        //        // From 1 column to 2 columns (11 to 23_13 or 11 to 13_23) or 3 columns (11 to 13_13_13)
        //        if ( '11' === oldWidth ) {
        //
        //            var newColumnModel = new tdcIFrameData.TdcModel({
        //                'content': '',
        //                'tag': 'vc_column',
        //                'type': 'closed',
        //                'level': 1,
        //                'parentModel': rowModel
        //            });
        //
        //            if ( '23_13' === newWidth ) {
        //
        //                if ( 0 === indexColumn ) {
        //
        //                    var attrsElementColumn = elementColumn.get( 'attrs' );
        //
        //                    if ( _.isUndefined( attrsElementColumn ) ) {
        //                        attrsElementColumn = {
        //                            width: '2/3'
        //                        };
        //                        elementColumn.set( 'attrs', attrsElementColumn );
        //                    } else {
        //                        var newAttrsElementColumn = _.clone( attrsElementColumn );
        //                        newAttrsElementColumn.width = '2/3';
        //                        elementColumn.set( 'attrs', newAttrsElementColumn );
        //                    }
        //
        //                    newColumnModel.set( 'attrs', {
        //                        width: '1/3'
        //                    });
        //                    childCollectionRow.add( newColumnModel );
        //
        //                    tdcIFrameData.changeColumnModel( elementColumn, '11', '23' );
        //                }
        //
        //            } else if ( '13_23' === newWidth ) {
        //
        //                if ( 0 === indexColumn ) {
        //
        //                    var attrsElementColumn = elementColumn.get( 'attrs' );
        //
        //                    if ( _.isUndefined( attrsElementColumn ) ) {
        //                        attrsElementColumn = {
        //                            width: '1/3'
        //                        };
        //                        elementColumn.set( 'attrs', attrsElementColumn );
        //                    } else {
        //                        var newAttrsElementColumn = _.clone( attrsElementColumn );
        //                        newAttrsElementColumn.width = '1/3';
        //                        elementColumn.set( 'attrs', newAttrsElementColumn );
        //                    }
        //
        //                    newColumnModel.set( 'attrs', {
        //                        width: '2/3'
        //                    });
        //                    childCollectionRow.add( newColumnModel );
        //
        //                    tdcIFrameData.changeColumnModel( elementColumn, '11', '13' );
        //                }
        //
        //            } else if ( '13_13_13' === newWidth ) {
        //
        //                if ( 0 === indexColumn ) {
        //
        //                    var attrsElementColumn = elementColumn.get( 'attrs' );
        //
        //                    if ( _.isUndefined( attrsElementColumn ) ) {
        //                        attrsElementColumn = {
        //                            width: '1/3'
        //                        };
        //                        elementColumn.set( 'attrs', attrsElementColumn );
        //                    } else {
        //                        var newAttrsElementColumn = _.clone( attrsElementColumn );
        //                        newAttrsElementColumn.width = '1/3';
        //                        elementColumn.set( 'attrs', newAttrsElementColumn );
        //                    }
        //
        //                    newColumnModel.set( 'attrs', {
        //                        width: '1/3'
        //                    });
        //
        //                    childCollectionRow.add( newColumnModel );
        //
        //                    var thirdColumnModel = new tdcIFrameData.TdcModel({
        //                        'content': '',
        //                        'tag': 'vc_column',
        //                        'attrs': {
        //                            width: '1/3'
        //                        },
        //                        'type': 'closed',
        //                        'level': 1,
        //                        'parentModel': rowModel
        //                    });
        //                    childCollectionRow.add( thirdColumnModel );
        //
        //                    // We call changeColumnModel just for the first column, because it is the only column that has elements
        //                    tdcIFrameData.changeColumnModel( elementColumn, '11', '13' );
        //                }
        //            }
        //
        //            // From 2 columns to 1 column (23_13 to 11), 2 columns (23_13 to 13_23) or 3 columns (23_13 to 13_13_13)
        //        } else if ( '23_13' === oldWidth ) {
        //
        //            if ( '11' === newWidth ) {
        //
        //                // The second column (13) moves all its children to the first column (23), then it is removed.
        //                if ( 0 === indexColumn ) {
        //
        //                    attrsElementColumn = elementColumn.get( 'attrs' );
        //
        //                    if ( ! _.isUndefined( attrsElementColumn ) ) {
        //
        //                        var newAttrsElementColumn = _.clone( attrsElementColumn );
        //                        delete newAttrsElementColumn.width;
        //
        //                        elementColumn.set( 'attrs', newAttrsElementColumn );
        //                    }
        //
        //                } else if ( 1 === indexColumn ) {
        //
        //                    var firstColumnModel = childCollectionRow.at( 0 ),
        //                        childCollectionFirstColumnModel = firstColumnModel.get( 'childCollection' );
        //
        //                    if ( _.isUndefined( childCollectionFirstColumnModel ) ) {
        //                        childCollectionFirstColumnModel = new tdcIFrameData.TdcCollection();
        //                        firstColumnModel.set( 'childCollection', childCollectionFirstColumnModel );
        //                    }
        //
        //                    if ( ! _.isUndefined( childCollectionElementColumn ) ) {
        //                        _.each( childCollectionElementColumn.models, function( elementChildColumn, indexChildColumn, listChildColumn ) {
        //                            elementChildColumn.set( 'parentModel', firstColumnModel );
        //                            childCollectionFirstColumnModel.add( elementChildColumn );
        //                        });
        //                    }
        //
        //                    childCollectionRow.remove( elementColumn );
        //
        //                    tdcIFrameData.changeColumnModel( firstColumnModel, '23', '11' );
        //                }
        //
        //            } else if ( '13_23' === newWidth ) {
        //
        //                // The 23 column changes its inner rows children to adapt them for 13 column
        //                // The 13 column changes its inner rows children to adapt them for 23 column
        //
        //                if ( 0 === indexColumn ) {
        //
        //                    var attrsElementColumn = elementColumn.get( 'attrs' );
        //
        //                    if ( _.isUndefined( attrsElementColumn ) ) {
        //                        attrsElementColumn = {
        //                            width: '1/3'
        //                        };
        //                        elementColumn.set( 'attrs', attrsElementColumn );
        //                    } else {
        //                        var newAttrsElementColumn = _.clone( attrsElementColumn );
        //                        newAttrsElementColumn.width = '1/3';
        //                        elementColumn.set( 'attrs', newAttrsElementColumn );
        //                    }
        //
        //                    tdcIFrameData.changeColumnModel( elementColumn, '23', '13' );
        //
        //                } else if ( 1 === indexColumn ) {
        //
        //                    var attrsElementColumn = elementColumn.get( 'attrs' );
        //
        //                    if ( _.isUndefined( attrsElementColumn ) ) {
        //                        attrsElementColumn = {
        //                            width: '2/3'
        //                        };
        //                        elementColumn.set( 'attrs', attrsElementColumn );
        //                    } else {
        //                        var newAttrsElementColumn = _.clone( attrsElementColumn );
        //                        newAttrsElementColumn.width = '2/3';
        //                        elementColumn.set( 'attrs', newAttrsElementColumn );
        //                    }
        //
        //                    tdcIFrameData.changeColumnModel( elementColumn, '13', '23' );
        //                }
        //
        //            } else if ( '13_13_13' === newWidth ) {
        //
        //                // The first 23 column changes its inner rows children to adapt them for a 13 column
        //                // The second 13 column remains at it is
        //                // The third 13 column is added
        //
        //                if ( 0 === indexColumn ) {
        //
        //                    var attrsElementColumn = elementColumn.get( 'attrs' );
        //
        //                    if ( _.isUndefined( attrsElementColumn ) ) {
        //                        attrsElementColumn = {
        //                            width: '1/3'
        //                        };
        //                        elementColumn.set( 'attrs', attrsElementColumn );
        //                    } else {
        //                        var newAttrsElementColumn = _.clone( attrsElementColumn );
        //                        newAttrsElementColumn.width = '1/3';
        //                        elementColumn.set( 'attrs', newAttrsElementColumn );
        //                    }
        //
        //                    tdcIFrameData.changeColumnModel( elementColumn, '23', '13' );
        //
        //                } else if ( 1 === indexColumn ) {
        //
        //                    var thirdColumnModel = new tdcIFrameData.TdcModel({
        //                        'content': '',
        //                        'tag': 'vc_column',
        //                        'attrs': {
        //                            width: '1/3'
        //                        },
        //                        'type': 'closed',
        //                        'level': 1,
        //                        'parentModel': rowModel
        //                    });
        //                    childCollectionRow.add( thirdColumnModel );
        //                }
        //            }
        //
        //        } else if ( '13_23' === oldWidth ) {
        //
        //            // The second column (23) moves all its children to the first column (13), then it is removed.
        //            if ( '11' === newWidth ) {
        //
        //                if ( 0 === indexColumn ) {
        //
        //                    var attrsElementColumn = elementColumn.get( 'attrs' );
        //
        //                    if ( ! _.isUndefined( attrsElementColumn ) ) {
        //
        //                        var newAttrsElementColumn = _.clone( attrsElementColumn );
        //                        delete newAttrsElementColumn.width;
        //
        //                        elementColumn.set( 'attrs', newAttrsElementColumn );
        //                    }
        //
        //                } else if ( 1 === indexColumn ) {
        //
        //                    var firstColumnModel = childCollectionRow.at( 0 ),
        //                        childCollectionFirstColumnModel = firstColumnModel.get( 'childCollection' );
        //
        //                    if ( _.isUndefined( childCollectionFirstColumnModel ) ) {
        //                        childCollectionFirstColumnModel = new tdcIFrameData.TdcCollection();
        //                        firstColumnModel.set( 'childCollection', childCollectionFirstColumnModel );
        //                    }
        //
        //                    if ( ! _.isUndefined( childCollectionElementColumn ) ) {
        //                        _.each(childCollectionElementColumn.models, function( elementChildColumn, indexChildColumn, listChildColumn ) {
        //                            elementChildColumn.set( 'parentModel', firstColumnModel );
        //                            childCollectionFirstColumnModel.add(elementChildColumn);
        //                        });
        //                    }
        //
        //                    childCollectionRow.remove( elementColumn );
        //
        //                    tdcIFrameData.changeColumnModel( firstColumnModel, '13', '11' );
        //                }
        //
        //
        //            } else if ( '23_13' === newWidth ) {
        //
        //                // The first column (13) changes its inner rows children to adapt them for 23 column
        //                // The second column (23) changes its inner rows children to adapt them for 13 column
        //
        //                if ( 0 === indexColumn ) {
        //
        //                    var attrsElementColumn = elementColumn.get( 'attrs' );
        //
        //                    if ( _.isUndefined( attrsElementColumn ) ) {
        //                        attrsElementColumn = {
        //                            width: '2/3'
        //                        };
        //                        elementColumn.set( 'attrs', attrsElementColumn );
        //                    } else {
        //                        var newAttrsElementColumn = _.clone( attrsElementColumn );
        //                        newAttrsElementColumn.width = '2/3';
        //                        elementColumn.set( 'attrs', newAttrsElementColumn );
        //                    }
        //
        //                    tdcIFrameData.changeColumnModel( elementColumn, '13', '23' );
        //
        //                } else if ( 1 === indexColumn ) {
        //
        //                    var attrsElementColumn = elementColumn.get( 'attrs' );
        //
        //                    if ( _.isUndefined( attrsElementColumn ) ) {
        //                        attrsElementColumn = {
        //                            width: '1/3'
        //                        };
        //                        elementColumn.set( 'attrs', attrsElementColumn );
        //                    } else {
        //                        var newAttrsElementColumn = _.clone( attrsElementColumn );
        //                        newAttrsElementColumn.width = '1/3';
        //                        elementColumn.set( 'attrs', newAttrsElementColumn );
        //                    }
        //
        //                    tdcIFrameData.changeColumnModel( elementColumn, '23', '13' );
        //                }
        //
        //            } else if ( '13_13_13' === newWidth ) {
        //
        //                // The first 13 column remains as it is
        //                // The second 23 column changes its inner rows children to adapt them for a 13 column
        //                // The third 13 column is added
        //
        //                if ( 1 === indexColumn ) {
        //
        //                    var attrsElementColumn = elementColumn.get( 'attrs' );
        //
        //                    if ( _.isUndefined( attrsElementColumn ) ) {
        //                        attrsElementColumn = {
        //                            width: '1/3'
        //                        };
        //                        elementColumn.set( 'attrs', attrsElementColumn );
        //                    } else {
        //                        var newAttrsElementColumn = _.clone( attrsElementColumn );
        //                        newAttrsElementColumn.width = '1/3';
        //                        elementColumn.set( 'attrs', newAttrsElementColumn );
        //                    }
        //
        //                    var thirdColumnModel = new tdcIFrameData.TdcModel({
        //                        'content': '',
        //                        'tag': 'vc_column',
        //                        'attrs': {
        //                            width: '1/3'
        //                        },
        //                        'type': 'closed',
        //                        'level': 1,
        //                        'parentModel': rowModel
        //                    });
        //                    childCollectionRow.add( thirdColumnModel );
        //
        //                    tdcIFrameData.changeColumnModel( elementColumn, '23', '13' );
        //                }
        //            }
        //
        //        } else if ( '13_13_13' === oldWidth ) {
        //
        //            // The first column (13) changes its inner rows children to adapt them for 11 column
        //            // The second column (13) moves all its children to the first column (13), then it is removed.
        //            // The third column (13) moves all its children to the first column (13), then it is removed.
        //
        //            if ( '11' === newWidth ) {
        //
        //                if ( 0 === indexColumn ) {
        //
        //                    var attrsElementColumn = elementColumn.get( 'attrs' );
        //
        //                    if ( ! _.isUndefined( attrsElementColumn ) ) {
        //
        //                        var newAttrsElementColumn = _.clone( attrsElementColumn );
        //                        delete newAttrsElementColumn.width;
        //
        //                        elementColumn.set( 'attrs', newAttrsElementColumn );
        //                    }
        //
        //                } else {
        //
        //                    var firstColumnModel = childCollectionRow.at( 0 ),
        //                        childCollectionFirstColumnModel = firstColumnModel.get( 'childCollection' );
        //
        //                    if ( _.isUndefined( childCollectionFirstColumnModel ) ) {
        //                        childCollectionFirstColumnModel = new tdcIFrameData.TdcCollection();
        //                        firstColumnModel.set( 'childCollection', childCollectionFirstColumnModel );
        //                    }
        //
        //                    if ( ! _.isUndefined( childCollectionElementColumn ) ) {
        //                        _.each( childCollectionElementColumn.models, function( elementChildColumn, indexChildColumn, listChildColumn ) {
        //                            elementChildColumn.set( 'parentModel', firstColumnModel );
        //                            childCollectionFirstColumnModel.add( elementChildColumn );
        //                        });
        //                    }
        //
        //                    if ( 2 === indexColumn ) {
        //                        var secondColumnModel = childCollectionRow.at( 1 ),
        //                            thirdColumnModel = childCollectionRow.at( 2 );
        //
        //                        childCollectionRow.remove( thirdColumnModel );
        //                        childCollectionRow.remove( secondColumnModel );
        //                    }
        //
        //                    tdcIFrameData.changeColumnModel( firstColumnModel, '13', '11' );
        //                }
        //
        //            } else if ('23_13' === newWidth) {
        //
        //                // The first column (13) changes its inner rows children to adapt them for 23 column
        //                // The second column (13) remains at it is
        //                // The third column (13) moves its children to the second column, and then it is removed
        //
        //                if ( 0 === indexColumn ) {
        //
        //                    var attrsElementColumn = elementColumn.get( 'attrs' );
        //
        //                    if ( _.isUndefined( attrsElementColumn ) ) {
        //                        attrsElementColumn = {
        //                            width: '2/3'
        //                        };
        //                        elementColumn.set( 'attrs', attrsElementColumn );
        //                    } else {
        //                        var newAttrsElementColumn = _.clone( attrsElementColumn );
        //                        newAttrsElementColumn.width = '2/3';
        //                        elementColumn.set( 'attrs', newAttrsElementColumn );
        //                    }
        //
        //
        //                } else if ( indexColumn === 2 ) {
        //
        //                    var firstColumnModel = childCollectionRow.at( 0 ),
        //                        secondColumnModel = childCollectionRow.at( 1 ),
        //                        childCollectionSecondColumnModel = secondColumnModel.get( 'childCollection' );
        //
        //                    if ( _.isUndefined( childCollectionSecondColumnModel ) ) {
        //                        childCollectionSecondColumnModel = new tdcIFrameData.TdcCollection();
        //                        secondColumnModel.set( 'childCollection', childCollectionSecondColumnModel );
        //                    }
        //
        //                    if ( ! _.isUndefined( childCollectionElementColumn ) ) {
        //                        _.each(childCollectionElementColumn.models, function( elementChildColumn, indexChildColumn, listChildColumn ) {
        //                            elementChildColumn.set( 'parentModel', secondColumnModel );
        //                            childCollectionSecondColumnModel.add( elementChildColumn );
        //                        });
        //                    }
        //
        //                    childCollectionRow.remove( elementColumn );
        //
        //                    tdcIFrameData.changeColumnModel( firstColumnModel, '13', '23' );
        //                }
        //
        //            } else if ('13_23' === newWidth) {
        //
        //                // The first column (13) remains as it is
        //                // The second column (13) changes its inner rows children to adapt them for 23 column
        //                // The third column (13) moves its children to the second column, and then it is removed
        //
        //                if ( 1 === indexColumn ) {
        //
        //                    var attrsElementColumn = elementColumn.get( 'attrs' );
        //
        //                    if ( _.isUndefined( attrsElementColumn ) ) {
        //                        attrsElementColumn = {
        //                            width: '2/3'
        //                        };
        //                        elementColumn.set( 'attrs', attrsElementColumn );
        //                    } else {
        //                        var newAttrsElementColumn = _.clone( attrsElementColumn );
        //                        newAttrsElementColumn.width = '2/3';
        //                        elementColumn.set( 'attrs', newAttrsElementColumn );
        //                    }
        //
        //
        //                } else if ( indexColumn === 2 ) {
        //
        //                    var secondColumnModel = childCollectionRow.at( 1 ),
        //                        childCollectionSecondColumnModel = secondColumnModel.get( 'childCollection' );
        //
        //                    if ( _.isUndefined( childCollectionSecondColumnModel ) ) {
        //                        childCollectionSecondColumnModel = new tdcIFrameData.TdcCollection();
        //                        secondColumnModel.set( 'childCollection', childCollectionSecondColumnModel );
        //                    }
        //
        //                    if ( ! _.isUndefined( childCollectionElementColumn ) ) {
        //                        _.each(childCollectionElementColumn.models, function( elementChildColumn, indexChildColumn, listChildColumn ) {
        //                            elementChildColumn.set( 'parentModel', secondColumnModel );
        //                            childCollectionSecondColumnModel.add( elementChildColumn );
        //                        });
        //                    }
        //
        //                    childCollectionRow.remove( elementColumn );
        //
        //                    tdcIFrameData.changeColumnModel( secondColumnModel, '13', '23' );
        //                }
        //            }
        //        }
        //    });
        //
        //    tdcDebug.log( tdcIFrameData.tdcRows.models );
        //}


        /**
         * Change the child collection of the column model parameter.
         * Actually only the 'inner row' elements are changed, because they are the only elements which can have children (inner columns) with 'width'.
         *
         * @param rowModel
         * @param oldWidth - the existing row entire width: 11, 23_13, 13_23 or 13_13_13
         * @param newWidth - the new row entire width: 11, 23_13, 13_23 or 13_13_13
         */
        changeRowModel: function( rowModel, oldWidth, newWidth ) {

            //if ( _.isUndefined( rowModel ) || _.isUndefined( oldWidth ) || _.isUndefined( newWidth ) ) {
            //    return;
            //}

            var childCollectionRow = rowModel.get( 'childCollection' );

            // From 1 column to 2 or to 3 columns
            // 11 -> 23_13
            // 11 -> 13_23
            // 11 -> 13_13_13

            if ( '11' === oldWidth && ( '23_13' === newWidth || '13_23' === newWidth || '13_13_13' === newWidth ) ) {

                var arrNewWidth = newWidth.split( '_' ),

                    firstColumnModelWidth = arrNewWidth[0].charAt( 0 ) + '/' + arrNewWidth[0].charAt( 1 ),

                    firstColumnModel = childCollectionRow.at( 0 ),
                    attrsFirstColumnModel = firstColumnModel.get( 'attrs' );

                if ( _.isUndefined( attrsFirstColumnModel ) ) {
                    firstColumnModel.set( 'attrs', { width: firstColumnModelWidth } );
                } else {
                    var newAttrsFirstColumnModel = _.clone( attrsFirstColumnModel );
                    newAttrsFirstColumnModel.width = firstColumnModelWidth;
                    firstColumnModel.set( 'attrs', newAttrsFirstColumnModel );
                }

                childCollectionRow.add( new tdcIFrameData.TdcModel({
                        'content': '',
                        'tag': 'vc_column',
                        'attrs': {

                            // The width of the second column
                            width: arrNewWidth[1].charAt( 0 ) + '/' + arrNewWidth[1].charAt( 1 )
                        },
                        'type': 'closed',
                        'level': 1,
                        'parentModel': rowModel
                    })
                );

                // Add the third inner column model
                if ( 3 === arrNewWidth.length ) {

                    childCollectionRow.add(

                        new tdcIFrameData.TdcModel({
                            'content': '',
                            'tag': 'vc_column',
                            'attrs': {

                                // The width of the third column
                                width: arrNewWidth[2].charAt( 0 ) + '/' + arrNewWidth[2].charAt( 1 )
                            },
                            'type': 'closed',
                            'level': 1,
                            'parentModel': rowModel
                        })
                    );
                }

                // We call changeColumnModel just for the first column, because it is the only column that has elements
                tdcIFrameData.changeColumnModel( firstColumnModel, oldWidth, arrNewWidth[0] );


            // From 2 or 3 columns to 1 column
            // 23_13 -> 11
            // 13_23 -> 11
            // 13_13_13 -> 11

            } else if ( ( '23_13' === oldWidth || '13_23' === oldWidth || '13_13_13' === oldWidth ) && '11' === newWidth ) {

                // The second column moves all its children to the first column, then it is removed.
                // The third column moves all its children to the first column, then it is removed.

                var arrOldWidth = oldWidth.split( '_' ),

                    firstColumnModel = childCollectionRow.at( 0 ),
                    attrsFirstColumnModel = firstColumnModel.get( 'attrs' ),
                    childCollectionFirstColumnModel = firstColumnModel.get( 'childCollection' ),

                    secondColumnModel = childCollectionRow.at( 1 ),
                    childCollectionSecondColumnModel = secondColumnModel.get( 'childCollection' );

                // Change the first column model
                if ( ! _.isUndefined( attrsFirstColumnModel ) ) {

                    var newAttrsFirstColumnModel = _.clone( attrsFirstColumnModel );
                    delete newAttrsFirstColumnModel.width;

                    firstColumnModel.set( 'attrs', newAttrsFirstColumnModel );
                }

                if ( _.isUndefined( childCollectionFirstColumnModel ) ) {
                    childCollectionFirstColumnModel = new tdcIFrameData.TdcCollection();
                    firstColumnModel.set( 'childCollection', childCollectionFirstColumnModel );
                }

                // Change the second column model
                if ( ! _.isUndefined( childCollectionSecondColumnModel ) && childCollectionSecondColumnModel.length ) {
                    _.each( childCollectionSecondColumnModel.models, function( elementChildColumn, indexChildColumn, listChildColumn ) {
                        elementChildColumn.set( 'parentModel', firstColumnModel );
                        childCollectionFirstColumnModel.add( elementChildColumn );
                    });
                }

                // Change the third column model
                if ( 3 === arrOldWidth.length ) {

                    var thirdColumnModel = childCollectionRow.at( 2 ),
                        childCollectionThirdColumnModel = thirdColumnModel.get( 'childCollection' );

                    if ( ! _.isUndefined( childCollectionThirdColumnModel ) && childCollectionThirdColumnModel.length ) {
                        _.each( childCollectionThirdColumnModel.models, function( elementChildColumn, indexChildColumn, listChildColumn ) {
                            elementChildColumn.set( 'parentModel', firstColumnModel );
                            childCollectionFirstColumnModel.add( elementChildColumn );
                        });
                    }
                    // Remove the third column model
                    //childCollectionRow.remove( thirdColumnModel );
                    tdcIFrameData.removeModel( thirdColumnModel );
                }

                // Remove the second column model
                //childCollectionRow.remove( secondColumnModel );
                tdcIFrameData.removeModel( secondColumnModel );

                // We call changeColumnModel just for the first column, because it is the only column that has elements, now
                tdcIFrameData.changeColumnModel( firstColumnModel, arrOldWidth[0], newWidth );


            // From 2 or from 3 columns to 2 or to 3 columns
            // 23_13 -> 13_23
            // 23_13 -> 13_13_13
            //
            // 13_23 -> 23_13
            // 13_23 -> 13_13_13
            //
            // 13_13_13 -> 23_13
            // 13_13_13 -> 13_23

            } else if ( ( '23_13' === oldWidth || '13_23' === oldWidth || '13_13_13' === oldWidth ) && ( '23_13' === newWidth || '13_23' === newWidth || '13_13_13' === newWidth ) ) {

                // If the third column exists, it moves its inner rows children to the second column
                // Important! The third column must be processed first, because their children are added to the second column, and then the second column is processed.
                //
                // The first column changes its inner rows children to adapt them for the new width
                // The second column changes its inner rows children to adapt them for the new width

                var arrOldWidth = oldWidth.split( '_' ),
                    arrNewWidth = newWidth.split( '_' ),

                    firstColumnModelWidth = arrNewWidth[0].charAt( 0 ) + '/' + arrNewWidth[0].charAt( 1 ),
                    secondColumnModelWidth = arrNewWidth[1].charAt( 0 ) + '/' + arrNewWidth[1].charAt( 1 ),

                    firstColumnModel = childCollectionRow.at( 0 ),
                    attrsFirstColumnModel = firstColumnModel.get( 'attrs' ),

                    secondColumnModel = childCollectionRow.at( 1 ),
                    attrsSecondColumnModel = secondColumnModel.get( 'attrs' ),
                    childCollectionSecondColumnModel = secondColumnModel.get( 'childCollection' );


                // Add the new third column model OR remove the third (the already existing) column model
                if ( 3 === arrNewWidth.length ) {

                    childCollectionRow.add( new tdcIFrameData.TdcModel({
                            'content': '',
                            'tag': 'vc_column',
                            'attrs': {

                                // The width of the third column
                                width: arrNewWidth[2].charAt( 0 ) + '/' + arrNewWidth[2].charAt( 1 )
                            },
                            'type': 'closed',
                            'level': 1,
                            'parentModel': rowModel
                        })
                    );

                    // Remove the third column model
                } else if ( 3 === arrOldWidth.length ) {

                    var thirdColumnModel = childCollectionRow.at( 2 ),
                        childCollectionThirdColumnModel = thirdColumnModel.get( 'childCollection' );

                    if ( ! _.isUndefined( childCollectionThirdColumnModel ) && childCollectionThirdColumnModel.length ) {

                        // Be sure the child collection of the second model, is initialized
                        if ( _.isUndefined( childCollectionSecondColumnModel ) ) {
                            childCollectionSecondColumnModel = new tdcIFrameData.TdcCollection();
                            secondColumnModel.set( 'childCollection', childCollectionSecondColumnModel );
                        }

                        _.each( childCollectionThirdColumnModel.models, function( elementChildColumn, indexChildColumn, listChildColumn ) {
                            elementChildColumn.set( 'parentModel', secondColumnModel );
                            childCollectionSecondColumnModel.add( elementChildColumn );
                        });
                    }
                    // Remove the third column model
                    //childCollectionRow.remove( thirdColumnModel );
                    tdcIFrameData.removeModel( thirdColumnModel );
                }


                // Change the first column model
                var newAttrsFirstColumnModel = _.clone( attrsFirstColumnModel );

                newAttrsFirstColumnModel.width = firstColumnModelWidth;
                firstColumnModel.set( 'attrs', newAttrsFirstColumnModel );

                if ( arrOldWidth[ 0 ] !== arrNewWidth[ 0 ] ) {
                    tdcIFrameData.changeColumnModel( firstColumnModel, arrOldWidth[ 0 ], arrNewWidth[ 0 ] );
                }


                // Change the second column model
                var newAttrsSecondColumnModel = _.clone( attrsSecondColumnModel );

                newAttrsSecondColumnModel.width = secondColumnModelWidth;
                secondColumnModel.set( 'attrs', newAttrsSecondColumnModel );

                if ( arrOldWidth[ 1 ] !== arrNewWidth[ 1 ] ) {
                    tdcIFrameData.changeColumnModel( secondColumnModel, arrOldWidth[ 1 ], arrNewWidth[ 1 ] );
                }
            }

            tdcDebug.log( tdcIFrameData.tdcRows.models );
        },


        /**
         * Change the child collection of the column model parameter.
         * Actually only the 'inner row' elements are changed, because they are the only elements which can have children (inner columns) with 'width'.
         *
         * @param columnModel
         * @param oldWidthColumn - the existing column width: 11, 23, 13, etc.
         * @param newWidthColumn - the new column width: 11, 23, 13, etc.
         */
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


            // Parse the inner row children
            _.each( childCollectionColumn.models, function( elementChildColumn, indexChildColumn, listChildColumn ) {

                var elementChildColumnTag = elementChildColumn.get( 'tag' );

                // Do nothing if the child model is not an inner row
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






                if ( '11' === oldWidthColumn ) {

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
                                //childCollectionInnerRow.remove( thirdInnerColumnModel );
                                tdcIFrameData.removeModel( thirdInnerColumnModel );
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

                            //childCollectionInnerRow.remove( thirdInnerColumnModel );
                            tdcIFrameData.removeModel( thirdInnerColumnModel );

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
                                    //childCollectionInnerRow.remove( childCollectionInnerRow.at( lastIndexInnerColumn ) );
                                    tdcIFrameData.removeModel( childCollectionInnerRow.at( lastIndexInnerColumn ) );
                                    lastIndexInnerColumn--;
                                }
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
                                //childCollectionInnerRow.remove( childCollectionInnerRow.at( lastIndexInnerColumn ) );
                                tdcIFrameData.removeModel( childCollectionInnerRow.at( lastIndexInnerColumn ) );
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

                                var lastIndexInnerColumn = 0;

                                _.each( childCollectionInnerRow.models, function( elementInnerColumn, indexInnerColumn, listInnerColumn ) {

                                    // Skip the first inner column model
                                    if ( 0 === indexInnerColumn ) {
                                        return;
                                    }

                                    lastIndexInnerColumn = indexInnerColumn;

                                    var childCollectionElementInnerColumnModel = elementInnerColumn.get( 'childCollection' );

                                    if ( ! _.isUndefined( childCollectionElementInnerColumnModel ) ) {
                                        //_.each( childCollectionElementInnerColumnModel.models, function( elementChildInnerColumn, indexChildInnerColumn, listChildInnerColumn ) {
                                        _.each( childCollectionElementInnerColumnModel.models, function( elementChildInnerColumn ) {

                                            elementChildInnerColumn.set( 'parentModel', firstInnerColumnModel );
                                            childCollectionFirstInnerColumnModel.add( elementChildInnerColumn );
                                        });
                                    }
                                });

                                // We can't remove elements inside of the collection iteration.
                                // That's why we need to do it after the iteration has finished.
                                while ( lastIndexInnerColumn > 0 ) {
                                    //childCollectionInnerRow.remove( childCollectionInnerRow.at( lastIndexInnerColumn ) );
                                    tdcIFrameData.removeModel( childCollectionInnerRow.at( lastIndexInnerColumn ) );
                                    lastIndexInnerColumn--;
                                }
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
                                //childCollectionInnerRow.remove( childCollectionInnerRow.at( lastIndexInnerColumn ) );
                                tdcIFrameData.removeModel( childCollectionInnerRow.at( lastIndexInnerColumn ) );
                                lastIndexInnerColumn--;
                            }
                        }
                    }

                } else if ( '13' === oldWidthColumn ) {

                    if ( '11' === newWidthColumn ) {

                        // Normally, for this case we should do nothing. It's supposed that we have just one inner column (full width)
                        //
                        // Important! Anyway, we'll do a test to ensure that the innerRowSettings will be '', '23_13', '13_23' or '13_13_13'
                        // If the innerRowSettings is '12_12', it will become 13_13_13
                        //  - the first inner column (12) adapts itself to be a 13 inner column
                        //  - the second inner column (12) adapts itself to be a 13 inner column
                        //  - the third inner column (13) is new added

                        if ( '' === innerRowSettings || ( '12_12' !== innerRowSettings && '23_13' !== innerRowSettings && '13_23' !== innerRowSettings && '13_13_13' !== innerRowSettings ) ) {

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
                                    //childCollectionInnerRow.remove( childCollectionInnerRow.at( lastIndexInnerColumn ) );
                                    tdcIFrameData.removeModel( childCollectionInnerRow.at( lastIndexInnerColumn ) );
                                    lastIndexInnerColumn--;
                                }
                            }

                        } else if ( '12_12' === innerRowSettings ) {

                            // The innerRowSettings is '12_12', it will become 13_13_13
                            //  - the first inner column (12) adapts itself to be a 13 inner column
                            //  - the second inner column (12) adapts itself to be a 13 inner column
                            //  - the third inner column (13) is new added

                            if ( childCollectionInnerRow.models.length ) {
                                var firstInnerColumnModel = childCollectionInnerRow.at( 0 ),
                                    secondInnerColumnModel = childCollectionInnerRow.at( 1 ),

                                    attrsFirstInnerColumnModel = firstInnerColumnModel.get( 'attrs' ),
                                    attrsSecondInnerColumnModel = secondInnerColumnModel.get( 'attrs' );

                                attrsFirstInnerColumnModel.width = '1/3';
                                attrsSecondInnerColumnModel.width = '1/3';

                                firstInnerColumnModel.set( 'attrs', attrsFirstInnerColumnModel );
                                secondInnerColumnModel.set( 'attrs', attrsSecondInnerColumnModel );

                                childCollectionInnerRow.add(
                                    new tdcIFrameData.TdcModel({
                                        'content': '',
                                        'tag': 'vc_column_inner',
                                        'attrs': {
                                            width: '1/3'
                                        },
                                        'type': 'closed',
                                        'level': 1,
                                        'parentModel': columnModel
                                    })
                                );
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
                                    //childCollectionInnerRow.remove( childCollectionInnerRow.at( lastIndexInnerColumn ) );
                                    tdcIFrameData.removeModel( childCollectionInnerRow.at( lastIndexInnerColumn ) );
                                    lastIndexInnerColumn--;
                                }
                            }
                        }
                    }
                }
            });
        },


        /**
         * Change the child collection models of an inner row model
         *
         * @param innerRowModel
         * @param oldWidth
         * @param newWidth
         */
        changeInnerRowModel: function( innerRowModel, oldWidth, newWidth ) {

            if ( _.isUndefined( innerRowModel ) || _.isUndefined( oldWidth ) || _.isUndefined( newWidth ) ) {
                return;
            }

            var childCollectionInnerRow = innerRowModel.get( 'childCollection' );

            // From 1 inner column to 2 or to 3 inner columns
            // 11 -> 12_12
            // 11 -> 23_13
            // 11 -> 13_23
            // 11 -> 13_13_13

            if ( ( '11' === oldWidth ) && ( '12_12' === newWidth || '23_13' === newWidth || '13_23' === newWidth || '13_13_13' === newWidth ) ) {

                var secondInnerColumnModel = new tdcIFrameData.TdcModel({
                        'content': '',
                        'tag': 'vc_column_inner',
                        'type': 'closed',
                        'level': 3,
                        'parentModel': innerRowModel
                    }),

                    arrNewWidth = newWidth.split( '_' ),

                    firstInnerColumnModelWidth = arrNewWidth[0].charAt( 0 ) + '/' + arrNewWidth[0].charAt( 1 ),
                    secondInnerColumnModelWidth = arrNewWidth[1].charAt( 0 ) + '/' + arrNewWidth[1].charAt( 1 ),

                    firstInnerColumnModel = childCollectionInnerRow.at( 0 ),
                    attrsFirstInnerColumnModel = firstInnerColumnModel.get( 'attrs' );

                if ( _.isUndefined( attrsFirstInnerColumnModel ) ) {
                    firstInnerColumnModel.set( 'attrs', { width: firstInnerColumnModelWidth } );
                } else {
                    var newAttrsFirstInnerColumnModel = _.clone( attrsFirstInnerColumnModel );
                    newAttrsFirstInnerColumnModel.width = firstInnerColumnModelWidth;
                    firstInnerColumnModel.set( 'attrs', newAttrsFirstInnerColumnModel );
                }

                secondInnerColumnModel.set( 'attrs', { width: secondInnerColumnModelWidth } );
                childCollectionInnerRow.add( secondInnerColumnModel );

                if ( 3 === arrNewWidth.length ) {

                    // Add the third inner column model
                    childCollectionInnerRow.add(

                        new tdcIFrameData.TdcModel({
                            'content': '',
                            'tag': 'vc_column_inner',
                            'attrs': {

                                // The width of the third inner column
                                width: arrNewWidth[2].charAt( 0 ) + '/' + arrNewWidth[2].charAt( 1 )
                            },
                            'type': 'closed',
                            'level': 3,
                            'parentModel': innerRowModel
                        })
                    );
                }


            // From 2 inner columns to 1 inner column
            // 12_12 -> 11
            // 23_13 -> 11
            // 13_23 -> 11
            //
            // From 2 inner columns to 2 inner columns
            // 12_12 -> 23_13
            // 12_12 -> 13_23
            //
            // 23_13 -> 12_12
            // 23_13 -> 13_23
            //
            // 13_23 -> 12_12
            // 13_23 -> 23_13
            //
            // From 2 inner columns to 3 inner columns
            // 12_12 -> 13_13_13
            // 23_13 -> 13_13_13
            // 13_23 -> 13_13_13

            } else if ( '12_12' === oldWidth || '23_13' === oldWidth || '13_23' === oldWidth ) {

                if ( '11' === newWidth ) {

                    // The second inner column (12) moves all its children to the first inner column (12), then it is removed.

                    var firstInnerColumnModel = childCollectionInnerRow.at( 0 ),
                        attrsFirstInnerColumnModel = firstInnerColumnModel.get( 'attrs' ),
                        childCollectionFirstInnerColumnModel = firstInnerColumnModel.get( 'childCollection' ),

                        secondInnerColumnModel = childCollectionInnerRow.at( 1 ),
                        childCollectionSecondInnerColumnModel = secondInnerColumnModel.get( 'childCollection' );

                    if ( ! _.isUndefined( attrsFirstInnerColumnModel ) ) {

                        var newAttrsFirstInnerColumnModel = _.clone( attrsFirstInnerColumnModel );
                        delete newAttrsFirstInnerColumnModel.width;

                        firstInnerColumnModel.set( 'attrs', newAttrsFirstInnerColumnModel );
                    }

                    if ( _.isUndefined( childCollectionFirstInnerColumnModel ) ) {
                        childCollectionFirstInnerColumnModel = new tdcIFrameData.TdcCollection();
                        firstInnerColumnModel.set( 'childCollection', childCollectionFirstInnerColumnModel );
                    }

                    if ( ! _.isUndefined( childCollectionSecondInnerColumnModel ) && childCollectionSecondInnerColumnModel.length ) {
                        _.each( childCollectionSecondInnerColumnModel.models, function( elementChildColumn, indexChildColumn, listChildColumn ) {
                            elementChildColumn.set( 'parentModel', firstInnerColumnModel );
                            childCollectionFirstInnerColumnModel.add( elementChildColumn );
                        });
                    }

                    //childCollectionInnerRow.remove( secondInnerColumnModel );
                    tdcIFrameData.removeModel( secondInnerColumnModel );

                } else if ( '12_12' === newWidth || '23_13' === newWidth || '13_23' === newWidth || '13_13_13' === newWidth ) {

                    // We change the width of the first and the second inner column model.
                    // If the newWidth is for 3 inner columns (13_13_13), a new inner column model is added.

                    var arrNewWidth = newWidth.split( '_' ),

                        firstInnerColumnModelWidth = arrNewWidth[0].charAt( 0 ) + '/' + arrNewWidth[0].charAt( 1 ),
                        secondInnerColumnModelWidth = arrNewWidth[1].charAt( 0 ) + '/' + arrNewWidth[1].charAt( 1 ),

                        firstInnerColumnModel = childCollectionInnerRow.at( 0 ),
                        attrsFirstInnerColumnModel = firstInnerColumnModel.get( 'attrs' ),

                        secondInnerColumnModel = childCollectionInnerRow.at( 1 ),
                        attrsSecondInnerColumnModel = secondInnerColumnModel.get( 'attrs' );


                    var newAttrsFirstInnerColumnModel = _.clone( attrsFirstInnerColumnModel );
                    newAttrsFirstInnerColumnModel.width = firstInnerColumnModelWidth;
                    firstInnerColumnModel.set( 'attrs', newAttrsFirstInnerColumnModel );

                    var newAttrsSecondInnerColumnModel = _.clone( attrsSecondInnerColumnModel );
                    newAttrsSecondInnerColumnModel.width = secondInnerColumnModelWidth;
                    secondInnerColumnModel.set( 'attrs', newAttrsSecondInnerColumnModel );

                    if ( 3 === arrNewWidth.length ) {

                        // Add the third inner column model
                        childCollectionInnerRow.add(
                            new tdcIFrameData.TdcModel({
                                'content': '',
                                'tag': 'vc_column_inner',
                                'attrs': {

                                    // The width of the third inner column
                                    width: arrNewWidth[2].charAt( 0 ) + '/' + arrNewWidth[2].charAt( 1 )
                                },
                                'type': 'closed',
                                'level': 3,
                                'parentModel': innerRowModel
                            })
                        );
                    }
                }


            // From 3 inner columns to 1 inner column
            // 13_13_13 -> 11
            //
            // From 3 inner columns to 2 inner columns
            // 13_13_13 -> 12_12
            // 13_13_13 -> 23_13
            // 13_13_13 -> 13_23

            } else if ( '13_13_13' === oldWidth ) {

                if ( '11' === newWidth ) {

                    // The first inner column (13) adapts itself for a 11 inner column
                    // The second inner column (13) moves all its children to the first inner column (13), then it is removed.
                    // The third inner column (13) moves all its children to the first inner column (13), then it is removed.

                    var firstInnerColumnModel = childCollectionInnerRow.at( 0 ),
                        attrsFirstInnerColumnModel = firstInnerColumnModel.get( 'attrs' ),
                        childCollectionFirstInnerColumnModel = firstInnerColumnModel.get( 'childCollection' ),

                        secondInnerColumnModel = childCollectionInnerRow.at( 1 ),
                        childCollectionSecondInnerColumnModel = secondInnerColumnModel.get( 'childCollection' ),

                        thirdInnerColumnModel = childCollectionInnerRow.at( 2 ),
                        childCollectionThirdInnerColumnModel = thirdInnerColumnModel.get( 'childCollection' );

                    if ( ! _.isUndefined( attrsFirstInnerColumnModel ) ) {

                        var newAttrsFirstInnerColumnModel = _.clone( attrsFirstInnerColumnModel );
                        delete newAttrsFirstInnerColumnModel.width;

                        firstInnerColumnModel.set( 'attrs', newAttrsFirstInnerColumnModel );
                    }

                    if ( _.isUndefined( childCollectionFirstInnerColumnModel ) ) {
                        childCollectionFirstInnerColumnModel = new tdcIFrameData.TdcCollection();
                        firstInnerColumnModel.set( 'childCollection', childCollectionFirstInnerColumnModel );
                    }

                    if ( ! _.isUndefined( childCollectionSecondInnerColumnModel ) && childCollectionSecondInnerColumnModel.length ) {
                        _.each( childCollectionSecondInnerColumnModel.models, function( elementChildColumn, indexChildColumn, listChildColumn ) {
                            elementChildColumn.set( 'parentModel', firstInnerColumnModel );
                            childCollectionFirstInnerColumnModel.add( elementChildColumn );
                        });
                    }

                    if ( ! _.isUndefined( childCollectionThirdInnerColumnModel ) && childCollectionThirdInnerColumnModel.length ) {
                        _.each( childCollectionThirdInnerColumnModel.models, function( elementChildColumn, indexChildColumn, listChildColumn ) {
                            elementChildColumn.set( 'parentModel', firstInnerColumnModel );
                            childCollectionFirstInnerColumnModel.add( elementChildColumn );
                        });
                    }

                    //childCollectionInnerRow.remove( secondInnerColumnModel );
                    //childCollectionInnerRow.remove( thirdInnerColumnModel );
                    tdcIFrameData.removeModel( secondInnerColumnModel );
                    tdcIFrameData.removeModel( thirdInnerColumnModel );

                } else if ( '12_12' === newWidth || '23_13' === newWidth || '13_23' === newWidth ) {

                    // The first inner column (13) adapts itself for a 12, 23 or 13 inner column
                    // The second inner column (13) adapts itself for a 12, 23 or 13 inner column
                    // The third inner column (13) moves its children to the second inner column, and then it is removed

                    var arrNewWidth = newWidth.split( '_' ),

                        firstInnerColumnModelWidth = arrNewWidth[0].charAt( 0 ) + '/' + arrNewWidth[0].charAt( 1 ),
                        secondInnerColumnModelWidth = arrNewWidth[1].charAt( 0 ) + '/' + arrNewWidth[1].charAt( 1 ),

                        firstInnerColumnModel = childCollectionInnerRow.at( 0 ),
                        attrsFirstInnerColumnModel = firstInnerColumnModel.get( 'attrs' ),

                        secondInnerColumnModel = childCollectionInnerRow.at( 1 ),
                        attrsSecondInnerColumnModel = secondInnerColumnModel.get( 'attrs' ),
                        childCollectionSecondInnerColumnModel = secondInnerColumnModel.get( 'childCollection' ),

                        thirdInnerColumnModel = childCollectionInnerRow.at( 2 ),
                        childCollectionThirdInnerColumnModel = thirdInnerColumnModel.get( 'childCollection' );

                    var newAttrsFirstInnerColumnModel = _.clone( attrsFirstInnerColumnModel );
                    newAttrsFirstInnerColumnModel.width = firstInnerColumnModelWidth;
                    firstInnerColumnModel.set( 'attrs', newAttrsFirstInnerColumnModel );

                    var newAttrsSecondInnerColumnModel = _.clone( attrsSecondInnerColumnModel );
                    newAttrsSecondInnerColumnModel.width = secondInnerColumnModelWidth;
                    secondInnerColumnModel.set( 'attrs', newAttrsSecondInnerColumnModel );

                    if ( _.isUndefined( childCollectionSecondInnerColumnModel ) ) {
                        childCollectionSecondInnerColumnModel = new tdcIFrameData.TdcCollection();
                        secondInnerColumnModel.set( 'childCollection', childCollectionSecondInnerColumnModel );
                    }

                    if ( ! _.isUndefined( childCollectionThirdInnerColumnModel ) && childCollectionThirdInnerColumnModel.length ) {
                        _.each( childCollectionThirdInnerColumnModel.models, function( elementChildColumn, indexChildColumn, listChildColumn ) {
                            elementChildColumn.set( 'parentModel', secondInnerColumnModel );
                            childCollectionSecondInnerColumnModel.add( elementChildColumn );
                        });
                    }

                    //childCollectionInnerRow.remove( thirdInnerColumnModel );
                    tdcIFrameData.removeModel( thirdInnerColumnModel );
                }
            }
        },


        /**
         * Get the combined width for a collection
         * Ex. 23_13, 13_23, 13_13_13, etc
         *
         * @param childCollection
         * @returns {*}
         */
        getChildCollectionWidths: function( childCollection ) {

            if ( _.isUndefined( childCollection ) ) {
                return;
            }

            var width;

            _.map( childCollection.models, function( val, key ) {

                var attrs = val.get( 'attrs' );
                if ( _.has( attrs, 'width' ) ) {
                    if ( _.isUndefined( width ) ) {
                        width = attrs.width.replace( '/', '' );
                    } else {
                        width += '_' + attrs.width.replace( '/', '' );
                    }
                }
            });

            return width;
        }

    };

})( jQuery, Backbone, _ );
