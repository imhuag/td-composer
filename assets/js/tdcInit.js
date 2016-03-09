/**
 * Created by tagdiv on 11.02.2016.
 */

/* global jQuery:{} */

var tdcInit = {};

(function(undefined){

    'use strict';

    tdcInit = {

        init: function() {

            tdcInit._registerLink();
        },

        _registerLink: function() {
            var post_id = jQuery( '#post_ID' );

            if ( undefined !== post_id ) {
                //jQuery( '<a href="http://0div.com:100/wp_011/wp-admin/post.php?post_id=' + post_id.val() + '&td_action=tdc">TagDiv Composer</a>').insertAfter( 'div#titlediv' );
                jQuery( '<a href="' + window.tdcAdminSettings.admin_url + 'post.php?post_id=' + post_id.val() + '&td_action=tdc">TagDiv Composer</a>').insertAfter( 'div#titlediv' );
            }
        }
    };



    jQuery(window).ready(function(){

        tdcInit.init();

    });

})();