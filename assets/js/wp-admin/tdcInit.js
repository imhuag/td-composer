/**
 * Created by tagdiv on 11.02.2016.
 */

/* global jQuery:{} */
/* global _:{} */

/* global tdcShortcodeParser:{} */

var tdcInit = {};

(function( jQuery, _, undefined){

    'use strict';

    tdcInit = {

        $formPost: undefined,

        _title: 'TagDiv Composer Draft',

        _url: '',

        $title: undefined,
        $titlePromptText: undefined,
        $content: undefined,
        $contentTextareaClone: undefined,
        $originalPostStatus: undefined,

        $_wpnonce: undefined,
        $postType: undefined,
        $postId: undefined,
        $postAuthor: undefined,
        $excerpt: undefined,

        $catslist: undefined,
        catslistValue: '',


        init: function() {

            tdcInit.$formPost = jQuery( '#post' );
            if ( tdcInit.$formPost.length ) {

                tdcInit.$title = tdcInit.$formPost.find( '#title' );
                tdcInit.$titlePromptText = tdcInit.$formPost.find( '#title-prompt-text' );
                tdcInit.$content = tdcInit.$formPost.find( '#content' );
                tdcInit.$contentTextareaClone = tdcInit.$formPost.find( '#content-textarea-clone' );
                tdcInit.$originalPostStatus = tdcInit.$formPost.find( '#original_post_status' );

                tdcInit.$_wpnonce = tdcInit.$formPost.find( '#_wpnonce' );
                tdcInit.$postType = tdcInit.$formPost.find( '#post_type' );
                tdcInit.$postId = tdcInit.$formPost.find( '#post_ID' );
                tdcInit.$postAuthor = tdcInit.$formPost.find( '#post_author' );
                tdcInit.$excerpt = tdcInit.$formPost.find( '#excerpt' );
                tdcInit.$catslist = tdcInit.$formPost.find( 'input[type=checkbox][name^=post_category]' );

                _.each( tdcInit.$catslist, function( element, index, list ) {
                    var $element = jQuery( element );
                    if ( $element.is( ':checked' ) ) {
                        tdcInit.catslistValue += $element.val() + ',';
                    }
                });

                tdcInit._url = window.tdcAdminSettings.adminUrl + 'post.php?post_id=' + tdcInit.$postId.val() + '&td_action=tdc';

                if ( 'page' === tdcInit.$postType.val() ) {
                    jQuery( '<div class="tdc-panel-button"><div class="tdc-panel-icon"></div><div class="tdc-panel-link"><a onclick="return tdcInit.savePost( event )" href="' + tdcInit._url + '">TagDiv Composer</a></div></div>').insertAfter( 'div#titlediv' );
                }
            }
        },


        _checkPostContent: function() {

            if ( tdcInit.$title.length && tdcInit.$titlePromptText.length && tdcInit.$contentTextareaClone.length && 0 === tdcInit.$title.val().trim().length ) {
                tdcInit.$title.val(tdcInit._title);
                tdcInit.$titlePromptText.hide();
            }

            tdcShortcodeParser.init({
                0: ['vc_row'],
                1: ['vc_column'],
                2: ['vc_row_inner'],     // 2+4
                3: ['vc_column_inner'],
                4: []
            });

            var parsedContent = [],
                textToParse = '';


            if ( 'draft' === tdcInit.$originalPostStatus.val() ) {
                textToParse = tdcInit.$formPost.find( '.wp-editor-area' ).html();
            } else {
                textToParse = tdcInit.$contentTextareaClone.html();
            }

            parsedContent = tdcShortcodeParser.parse(0, textToParse );

            if ( ! parsedContent.length ) {
                var content = tdcInit.$contentTextareaClone.text().replace( /&nbsp;/g,'' ) + '[vc_row][vc_column][/vc_column][/vc_row]';
                tdcInit.$content.val( content );
                tdcInit.$contentTextareaClone.html( content );
            }
        },


        /**
         * Save the post as draft.
         *
         * @param event
         * @returns {boolean}
         */
        savePost: function( event ) {

            jQuery('.tdc-panel-button').addClass('tdc-open-editor-loader'); // this class is not removed ever because the browser should refresh

            tdcInit._checkPostContent();

            // Do the request and redirect at success
            jQuery.ajax({
                url: window.ajaxurl,
                type: 'POST',
                data: {
                    'data[wp_autosave][post_id]' : tdcInit.$postId.val(),
                    'data[wp_autosave][post_type]' : tdcInit.$postType.val(),
                    'data[wp_autosave][post_author]' : tdcInit.$postAuthor.val(),
                    'data[wp_autosave][post_title]' : tdcInit._title,
                    'data[wp_autosave][content]' : tdcInit.$content.val(),
                    'data[wp_autosave][excerpt]' : tdcInit.$excerpt.val(),
                    'data[wp_autosave][catslist]' : tdcInit.catslistValue,
                    'data[wp_autosave][auto_draft]': 1,
                    'data[wp_autosave][_wpnonce]' : tdcInit.$_wpnonce.val(),
                    'interval': 60,
                    '_nonce' : window.heartbeatSettings.nonce,
                    'action' : 'heartbeat',
                    'screen_id' : tdcInit.$postType.val(),
                    'has_focus': false
                }
            }).done(function( data, textStatus, jqXHR ){
                window.location = tdcInit._url;
            });

            return false;
        }
    };



    jQuery(window).ready(function(){

        tdcInit.init();

    });

})( jQuery, _ );