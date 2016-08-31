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

                tdcLivePanel.$tdcAction.val( 'tdc_ajax_save_post' );
                tdcLivePanel.$tdcContent.val( tdcSavePost.content );

                tdcDebug.log( tdcSavePost.content );

                jQuery.ajax({
                    timeout: 10000,
                    type: 'POST',

                    // uuid is for browser cache busting
                    url: tdcUtil.getRestEndPoint('td-composer/save_post', 'uuid=' + tdcJobManager._getUniqueID()),


                    // add the nonce used for cookie authentication
                    beforeSend: function ( xhr ) {
                        xhr.setRequestHeader( 'X-WP-Nonce', window.tdcAdminSettings.wpRestNonce);

                        tdcLivePanel.saveMenuSettings();
                    },
                    data: tdcLivePanel.$panel.serialize()

                }).done(function( data, textStatus, jqXHR ) {

                    // This is necessary at iframe reloading
                    // @see _initStructuredData and _getPostOriginalContentJSON
                    window.tdcPostSettings.postContent = tdcSavePost.content;


                    jQuery( '.tdc-save-page').removeClass('tdc-saving-loader'); // remove the loading animation

                    if ( 'success' === textStatus ) {
                        if ( _.isObject( data ) && _.has( data, 'errors' ) ) {
                            new tdcNotice.notice( data.errors, true, false );
                        } else {
                            new tdcNotice.notice( textStatus, false, true );
                        }

                        // Reset the flag that inform the content has been modified
                        tdcMain.resetContentModified();
                    }

                }).fail(function( jqXHR, textStatus, errorThrown ) {

                });
            }
        }

    };

})(jQuery, Backbone, _);
