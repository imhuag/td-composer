/**
 * Created by ra on 4/25/2016.
 * This file is loaded in the iframe with the preview.
 *
 * Each block that wants to register a delete callback will have to add an item here. We need the delete callback to be
 * already made for all the blocks on the page because of the recycle operation. On delete we must have all the requiered
 * js already prepared to not wait for the server.
 *
 * The item with the callback usually comes from @see td_block::js_tdc_get_composer_block() and it's register on the first
 * load of the page AND on each ajax request.
 */


var tdcComposerBlocksApi = {};


(function () {
    "use strict";


    tdcComposerBlocksApi = {
        items: [],

        item: function () {
            this.blockUid = '';
            this.callbackDelete = function (blockUid) {
                // each block can register a callback for delete. This function will be called only when the block is deleted
            };
        },
        addItem: function (item) {
            tdcComposerBlocksApi.items.push(item);
        },


        //
        //updateBlockUid: function (oldBlockUid, newBlockUid) {
        //    for (var cnt = 0; cnt < tdcComposerBlocksApi.items.length; cnt++) {
        //        if (tdcComposerBlocksApi.items[cnt].blockUid === oldBlockUid) {
        //            tdcComposerBlocksApi.items[cnt].blockUid = newBlockUid;
        //
        //            // fire the callbackDelete
        //            tdcComposerBlocksApi.items[cnt].callbackDelete(oldBlockUid);
        //            return true;
        //        }
        //    }
        //
        //
        //
        //    return false;
        //},


        /**
         * Deletes an item AND it also runs it's callback!
         * @param oldBlockUid
         * @returns {boolean} true if the item is found
         */
        deleteItem: function (oldBlockUid) {

            for (var cnt = 0; cnt < tdcComposerBlocksApi.items.length; cnt++) {
                if (tdcComposerBlocksApi.items[cnt].blockUid === oldBlockUid) {
                    // fire the callbackDelete
                    tdcComposerBlocksApi.items[cnt].callbackDelete(oldBlockUid);
                    tdcComposerBlocksApi.items.splice(cnt, 1); // remove the item from the "array"
                    return true;
                }
            }

            return false;
        }




    };
})();

