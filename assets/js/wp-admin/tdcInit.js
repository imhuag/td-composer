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

        _title: 'TagDiv Composer Draft',

        _url: '',

        $title: undefined,
        $titlePromptText: undefined,
        $content: undefined,
        $contentTextareaClone: undefined,

        $_wpnonce: undefined,
        $postType: undefined,
        $postId: undefined,
        $postAuthor: undefined,
        $excerpt: undefined,

        $catslist: undefined,
        catslistValue: '',



        init: function() {

            var $formPost = jQuery( '#post' );
            if ( $formPost.length ) {

                tdcInit.$formPost = $formPost;
                tdcInit.$title = $formPost.find( '#title' );
                tdcInit.$titlePromptText = $formPost.find( '#title-prompt-text' );
                tdcInit.$content = $formPost.find( '#content' );
                tdcInit.$contentTextareaClone = $formPost.find( '#content-textarea-clone' );

                tdcInit.$_wpnonce = $formPost.find( '#_wpnonce' );
                tdcInit.$postType = $formPost.find( '#post_type' );
                tdcInit.$postId = $formPost.find( '#post_ID' );
                tdcInit.$postAuthor = $formPost.find( '#post_author' );
                tdcInit.$excerpt = $formPost.find( '#excerpt' );
                tdcInit.$catslist = $formPost.find( 'input[type=checkbox][name^=post_category]' );

                _.each( tdcInit.$catslist, function( element, index, list ) {
                    var $element = jQuery( element );
                    if ( $element.is( ':checked' ) ) {
                        tdcInit.catslistValue += $element.val() + ',';
                    }
                });

                tdcInit._url = window.tdcAdminSettings.adminUrl + 'post.php?post_id=' + tdcInit.$postId.val() + '&td_action=tdc';

                jQuery( '<a onclick="return tdcInit.savePost( event )" href="' + tdcInit._url + '">TagDiv Composer</a>').insertAfter( 'div#titlediv' );


                var $publish = $formPost.find( '#publish' );

                $publish.click(function( event ) {

                    if ( 'page' === tdcInit.$postType.val() ) {

                        tdcInit._checkContent();
                    }
                });
            }
        },

        _checkContent: function() {

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

            var parsedContent = tdcShortcodeParser.parse(0, tdcInit.$contentTextareaClone.html() );

            if ( ! parsedContent.length ) {
                var content = tdcInit.$contentTextareaClone.text().replace( /&nbsp;/g,'' ) + '[vc_row][vc_column][/vc_column][/vc_row]';
                tdcInit.$content.val( content );
                tdcInit.$contentTextareaClone.html( content );

                // The editor must be set, because 'page' post type does not have wp_autosave as 'draft' (post status). The 'publish' post status is used instead
                // Important! This is not necessary for the 'post' post type, because there wp_autosave works.
                tinymce.activeEditor.setContent( content );
            }
        },

        /**
         * Save the post as draft.
         *
         * @param event
         * @returns {boolean}
         */
        savePost: function( event ) {

            tdcInit._checkContent();

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