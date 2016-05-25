/**
 * Created by ra on 5/13/2016.
 */


/* global jQuery:false */

/* global _:false */


var tdcSidebarController = {};








(function() {
    'use strict';

    tdcSidebarController = {






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

            throw 'Map value not found for ' + tag + ' ' + paramName;
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


            /**
             * the json map of one parameter
             */
            var paramMap = tdcSidebarController._getParamMap(model.attributes.tag, paramName);




            // STEP 0: Update the model test
            if (paramMap.value === value) {
                // default value is selected, we remove it from the model
                delete model.attributes.attrs[paramMap.param_name];
            } else {
                model.attributes.attrs[paramMap.param_name] = value;
            }


            console.log(paramName + ' old: ' + oldValue + ' - new: ' + value);



            var data = {
                error: undefined,
                getShortcode: ''
            };

            // Get the shortcode using the _checkModelData builder function
            tdcIFrameData._checkModelData( model, data );

            if ( ! _.isUndefined( data.getShortcode ) ) {



                var oldBlockUid = model.get('blockUid');


                // Define new empty job
                var newJob = new tdcJobManager.job();


                newJob.shortcode = data.getShortcode;
                newJob.columns = 1; //@todo shit nu avem coloanele

                newJob.liveViewId = oldBlockUid; //@todo

                newJob.success_callback = function( data ) {


                    var iFrameWindowObj = tdcAdminIFrameUI.getIframeWindow();

                    // !!! This also fires the deleteCallback for draggedBlockUid
                    iFrameWindowObj.tdcComposerBlocksApi.deleteItem(model.get('blockUid'));


                    // set the new blockUid
                    model.set('blockUid', data.blockUid);


                    // Important! It should have this property
                    if ( _.has( data, 'replyHtml' ) ) {
                        model.set( 'bindNewContent', true ); //@todo, always bind new content? nu stiu ... cum sa facem aici
                        model.set( 'shortcode', newJob.shortcode );
                        model.set( 'html', data.replyHtml );
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

                tdcJobManager.addJob( newJob );
            } {
                //tdcDebug.log( model );
                //throw "No shortcode for this model!";
            }




        }



    };
})();