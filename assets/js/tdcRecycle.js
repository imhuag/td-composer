/**
 * Created by tagdiv on 13.06.2016.
 */

/* global jQuery:{} */

var tdcRecycle;

( function( jQuery, _, undefined ) {

    'use strict';

    tdcRecycle = {

        _maxItems: 100,

        _items: [],

        $_restoreItem: undefined,
        $_restoreContent: undefined,

        item: function( timestamp, description, shortcode ) {
            this.timestamp = timestamp;
            this.description = description;
            this.shortcode = shortcode;
        },

        init: function( ) {
            tdcRecycle.$_restoreItem = jQuery( '#tdc-restore' );
            tdcRecycle.$_restoreContent = jQuery( '#tdc-restore-content' );

            tdcRecycle.$_restoreItem.on( 'click' , function(event) {
                tdcRecycle.$_restoreContent.toggle();
            });

            tdcRecycle.$_restoreContent.on( 'click', '.tdc-snapshot' , function(event) {
                var newJob = new tdcJobManager.job();

                var shortcode = jQuery(this).find( '.tdc-snapshot-shortcode' ).html();

                newJob.shortcode = shortcode;
                newJob.columns = 3;
                //newJob.blockUid = draggedBlockUid;

                newJob.success_callback = function( data ) {

                    //tdcDebug.log( data );

                    var $iframeContents = jQuery( tdcAdminIFrameUI._$liveIframe).contents();

                    var $tdcRows = $iframeContents.find( '#tdc-rows');
                    if ( _.has( data, 'replyHtml' ) ) {
                        $tdcRows.replaceWith( data.replyHtml );
                    }

                    window.addWrappers( $iframeContents );

                    tdcIFrameData._isInitialized = false;
                    tdcIFrameData._postOriginalContentJSON = undefined;
                    window.tdcPostSettings.postContent = shortcode;
                    tdcIFrameData.init( $iframeContents );

                    tdcOperationUI.init( $iframeContents );

                    //tdcRecycle.$_restoreContent.hide();


                    //
                    //// some request may not send js
                    //if ( _.has( data, 'replyJsForEval' ) ) {
                    //    // add the tdcEvalGlobal GLOBAL to the iFrame and do an eval in that iframe for any js code sent
                    //    // by the ajax request
                    //    iFrameWindowObj.tdcEvalGlobal = {
                    //        oldBlockUid: draggedBlockUid
                    //    };
                    //    tdcAdminIFrameUI.evalInIframe(data.replyJsForEval);
                    //
                    //
                    //}
                };

                newJob.error_callback = function( job, errorMsg ) {
                    tdcDebug.log( errorMsg );
                    tdcDebug.log( job );
                };

                tdcJobManager.addJob( newJob );
            });
        },


        takeSnapshot: function( id ) {
            var data = {
                error: undefined,
                getShortcode: ''
            };

            tdcIFrameData.getShortcodeFromData( data );

            if ( !_.isUndefined( data.error ) ) {
                tdcDebug.log( data.error );
            }

            if ( !_.isUndefined( data.getShortcode ) ) {

                var currentDate = new Date();

                var item = new tdcRecycle.item(
                    currentDate.getTime(),
                    id,
                    data.getShortcode
                );

                if ( tdcRecycle._maxItems === tdcRecycle._items.length ) {
                    tdcRecycle._items.splice( 0, 1 );

                    tdcRecycle.$_restoreContent.find( '.tdc-snapshot:first' ).remove();
                }

                tdcRecycle._items.push( item );

                tdcRecycle.$_restoreContent.prepend( '<div class="tdc-snapshot">' +
                    '<div style="width: 150px; float: left">' + currentDate.toLocaleDateString() + ' ' + currentDate.toLocaleTimeString() + '</div>' +
                    '<div style="width: 350px; float: left">Before ' + item.description + '</div>' +
                    '<div class="tdc-snapshot-shortcode" style="display: none">' + item.shortcode + '</div>' +
                '</div>' );
            }
        }
    };

    tdcRecycle.init();

})( jQuery, _ );