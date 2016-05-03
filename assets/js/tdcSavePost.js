/**
 * Created by tagdiv on 05.04.2016.
 */

/* global jQuery:{} */
/* global Backbone:{} */
/* global _:{} */

/* global tdcIFrameData:{} */
/* global tdcDebug:{} */


var tdcSavePost;

(function(jQuery, backbone, _, undefined) {

    'use strict';

    tdcSavePost = {

        content: undefined,

        save: function() {

            var data = {
                error: undefined,
                getShortcode: ''
            };

            tdcIFrameData.getShortcodeFromData( data );

            if ( !_.isUndefined( data.error ) ) {
                tdcDebug.log( data.error );
            }

            if ( !_.isUndefined( data.getShortcode ) && ! _.isUndefined( window.tdcPostSettings )) {
                tdcSavePost.content = data.getShortcode;

                tdcDebug.log( tdcSavePost.content );

                jQuery.ajax({
                    timeout: 10000,
                    type: 'POST',

                    // uuid is for browser cache busting
                    url: tdcUtil.getRestEndPoint('td-composer/save_post', 'uuid=' + tdcJobManager._getUniqueID()),


                    // add the nonce used for cookie authentication
                    beforeSend: function ( xhr ) {
                        xhr.setRequestHeader( 'X-WP-Nonce', window.tdcAdminSettings.wp_rest_nonce);
                    },
                    //url: ajaxurl,
                    dataType: 'json',
                    data: {
                        post_id: window.tdcPostSettings.postId,
                        action: 'tdc_ajax_save_post',
                        content: tdcSavePost.content
                    }
                }).done(function( data, textStatus, jqXHR ) {

                    if ( 'success' === textStatus ) {
                        if ( _.isObject( data ) && _.has( data, 'errors' ) ) {
                            alert( data.errors );
                        } else {
                            alert( textStatus );
                        }
                    }

                }).fail(function( jqXHR, textStatus, errorThrown ) {

                });
            }
        }

    };

})(jQuery, Backbone, _);
