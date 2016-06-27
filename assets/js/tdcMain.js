/**
 * Created by tagdiv on 18.02.2016.
 * This is the main file, it is loaded in the wrapper document. It is not loaded in the iFrame!
 * It will initialize the iFrame and after that the whole editor starts
 */

/* global jQuery:{} */


/* global tdcAdminIFrameUI */

var tdcMain = {};

(function() {

    'use strict';

    tdcMain = {

        // Set to true when the composer has done changes
        _contentModified: false,


        init: function() {
            // init the iframe, from there on we start
            tdcAdminIFrameUI.init();

        },

        /**
         *
         * @returns {boolean|*}
         */
        getContentModified: function() {
            return tdcMain._contentModified;
        },

        /**
         *
         */
        setContentModified: function() {
            tdcMain._contentModified = true;
        }

    };
    tdcMain.init();
})();
