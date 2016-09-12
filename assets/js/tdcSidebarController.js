/**
 * Created by ra on 5/13/2016.
 */

/* global tdcJobManager:{} */
/* global tdcAdminIFrameUI:{} */
/* global tdcIFrameData:{} */
/* global tdcSidebar:{} */
/* global tdcNotice:{} */
/* global tdcDebug:{} */

/* global jQuery:{} */
/* global _:{} */


var tdcSidebarController = {};




(function() {
    'use strict';

    tdcSidebarController = {

        updateJobBuffer: {},
        updateJobTimer: '',

        /**
         * @see tdcJobManager.addJob receives this job
         */
        _updateJob: function () {
            this.model = '';
            this.paramName = '';
            this.oldValue = '';
            this.value = '';
        },



        /**
         * search the map array for the map for one parameter
         * @param tag - the shortcode tag
         * @param paramName - the parameter name that we want
         * @returns {*} map array
         * @private
         */
        _getParamMap: function (tag, paramName) {
            var mappedShortCode = window.tdcAdminSettings.mappedShortcodes[tag];
            for (var cnt = 0; cnt < mappedShortCode.params.length; cnt++) {
                if (mappedShortCode.params[cnt].param_name === paramName) {
                    return mappedShortCode.params[cnt];
                }
            }
            //throw 'Map value not found for ' + tag + ' ' + paramName;
            tdcNotice.notice( 'Map value not found for ' + tag + ' ' + paramName, true, false );
        },




        /**
         * This 'event' happens when a control from the sidebar is updated by the user. In this function we decide if we call
         * the callback or make a new job depending on the MAP of the parameter
         * @param model - The model for the current element / shortcode
         * @param paramName - the parameter name that was updated
         * @param oldValue - the value before it was changed, this will be used when we enable live edit.
         * @param value - the new value that we got form the user
         */
        onUpdate: function (model, paramName, oldValue, value) {
            var updateJob = new tdcSidebarController._updateJob();
            updateJob.model = model;
            updateJob.paramName = paramName;
            updateJob.oldValue = oldValue;
            updateJob.value = value;

            tdcSidebarController._addToBuffer(updateJob);
        },


        /**
         *
         * @param updateJob tdcSidebarController._updateJob
         * @private
         */
        _addToBuffer: function (updateJob) {
            tdcSidebarController.updateJobBuffer[updateJob.model.get('blockUid')] = updateJob;

            if (tdcSidebarController.updateJobTimer !== '') {
                clearTimeout(tdcSidebarController.updateJobTimer);
            }


            tdcSidebarController.updateJobTimer = setTimeout(function(){



                // this is a tick
                if (tdcSidebarController.updateJobBuffer.length > 1) {
                    console.log('Multiple jobs detected - see below');
                    console.log(tdcSidebarController.updateJobBuffer);
                }

                for (var blockUid in tdcSidebarController.updateJobBuffer) {
                    tdcSidebarController._doUpdateJob(tdcSidebarController.updateJobBuffer[blockUid]);
                }


                tdcSidebarController.updateJobBuffer = {};
                tdcSidebarController.updateJobTimer = '';

            }, 500);
        },


        /**
         * sends an updateJob to the server
         * @param updateJob tdcSidebarController._updateJob
         * @private
         */
        _doUpdateJob: function (updateJob) {


            /**
             * the json map of one parameter
             */
            var paramMap = tdcSidebarController._getParamMap(updateJob.model.attributes.tag, updateJob.paramName);




            var attrs = updateJob.model.get( 'attrs' ),
                newAttrs = _.clone( attrs );

            if ( paramMap.value === updateJob.value ) {
                delete newAttrs[paramMap.param_name];
            } else {
                newAttrs[paramMap.param_name] = updateJob.value;
            }

            updateJob.model.set( 'attrs', newAttrs );



            var data = {
                error: undefined,
                getShortcode: ''
            };

            // Get the shortcode using the _checkModelData builder function
            tdcIFrameData._checkModelData( updateJob.model, data );

            if ( ! _.isUndefined( data.getShortcode ) ) {



                var oldBlockUid = updateJob.model.get('blockUid');


                // Define new empty job
                var newJob = new tdcJobManager.job();


                newJob.shortcode = data.getShortcode;
                //newJob.columns = 1; //@todo shit nu avem coloanele
                newJob.columns = tdcIFrameData.getColumnNumber( updateJob.model );

                newJob.blockUid = oldBlockUid; //@todo

                // An entire row/column/inner-row/inner-column is added, so the new content must be rebound
                var modelLevel = parseInt( updateJob.model.get( 'level' ), 10 );
                if ( modelLevel < 4 ) {
                    updateJob.model.set( 'bindNewContent', true );
                }

                newJob.success_callback = function( data ) {


                    var iFrameWindowObj = tdcAdminIFrameUI.getIframeWindow();

                    // Here the tdcIFrameData.deleteCallback is called because the model is not removed
                    tdcIFrameData.deleteCallback( updateJob.model );

                    // set the new blockUid
                    updateJob.model.set('blockUid', data.blockUid);


                    // Important! It should have this property
                    if ( _.has( data, 'replyHtml' ) ) {
                        updateJob.model.set( 'shortcode', newJob.shortcode );
                        updateJob.model.set( 'html', data.replyHtml );
                    }


                    if ( _.has( data, 'replyJsForEval' ) ) {
                        iFrameWindowObj.tdcEvalGlobal = {
                            oldBlockUid: oldBlockUid
                        };
                        tdcAdminIFrameUI.evalInIframe(data.replyJsForEval);
                    }
                };

                newJob.error_callback = function( job, errorMsg ) {
                    tdcDebug.log( errorMsg );
                    tdcDebug.log( job );
                };


                // Loader image is shown
                var $loaderImageToElement = tdcSidebar.getCurrentElement();
                if ( _.isUndefined( $loaderImageToElement ) ) {
                    $loaderImageToElement = tdcSidebar.getCurrentInnerColumn();
                    if ( _.isUndefined( $loaderImageToElement ) ) {
                        $loaderImageToElement = tdcSidebar.getCurrentInnerRow();
                        if ( _.isUndefined( $loaderImageToElement ) ) {
                            $loaderImageToElement = tdcSidebar.getCurrentColumn();
                            if ( _.isUndefined( $loaderImageToElement ) ) {
                                $loaderImageToElement = tdcSidebar.getCurrentRow();
                            }
                        }
                    }
                }

                if ( ! _.isUndefined( $loaderImageToElement ) ) {
                    $loaderImageToElement.addClass( 'tdc-changed' );
                }

                tdcJobManager.addJob( newJob );
            } {
                //throw "No shortcode for this model!";
            }


        }


    };
})();