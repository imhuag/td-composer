/**
 * Created by tagdiv on 18.02.2016.
 * This is the main file, it is loaded in the wrapper document. It is not loaded in the iFrame!
 * It will initialize the iFrame and after that the whole editor starts
 */

/* global tdcOperationUI:{} */

/* global jQuery:{} */


/* global tdcAdminIFrameUI */

var tdcMain = {};

(function() {

    'use strict';

    tdcMain = {

        // Set to true when the TagDiv Composer has changed the content
        _contentModified: false,

        // Set to true when the sidebar and the content are inline
        // Used because otherwise the sidebar must be checked
        _sidebarInline: false,

        // Set to true when the sidebar is hidden
        // Used because otherwise the sidebar must be checked
        _sidebarHidden: false,

        // Set to false when the sidebar is hidden
        // Used because otherwise the recycle must be checked
        _recycleShown: false,



        init: function() {

            // init the iframe, from there on we start
            tdcAdminIFrameUI.init();

        },


        /**
         * True if the TagDiv composer data structured has changed
         *
         * @returns {boolean|*}
         */
        getContentModified: function() {
            return tdcMain._contentModified;
        },

        /**
         * Called when the TagDiv composer data structured has changed
         */
        setContentModified: function() {
            tdcMain._contentModified = true;
        },

        /**
         * Reset the '_contentModified' flag.
         * Usually it's done after saving, when the post content and the TagDiv composer are synchronized
         */
        resetContentModified: function() {
            tdcMain._contentModified = false;
        },


        setSidebarInline: function() {
            tdcMain._sidebarInline = true;
        },
        getSidebarInline: function() {
            return tdcMain._sidebarInline;
        },
        resetSidebarInline: function() {
            tdcMain._sidebarInline = false;
        },


        setSidebarHidden: function() {
            tdcMain._sidebarHidden = true;
        },
        getSidebarHidden: function() {
            return tdcMain._sidebarHidden;
        },
        resetSidebarHidden: function() {
            tdcMain._sidebarHidden = false;
        },


        setRecycleShown: function() {
            tdcMain._recycleShown = ( tdcOperationUI.isRowDragged() || tdcOperationUI.isInnerRowDragged() || tdcOperationUI.isElementDragged() ) && ! tdcOperationUI.isSidebarElementDragged();
        },
        getRecycleShown: function() {
            return tdcMain._recycleShown;
        },
        resetRecycleShown: function() {
            tdcMain._recycleShown = false;
        }
    };

    tdcMain.init();
})();
