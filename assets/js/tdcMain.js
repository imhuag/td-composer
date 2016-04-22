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

        init: function() {
            // init the iframe, from there on we start
            tdcAdminIFrameUI.init();
        }

    };
    tdcMain.init();
})();
