/**
 * Created by ra on 5/3/2016.
 */


var tdcUtil = {};


(function () {
    'use strict';

    tdcUtil = {


        /**
         * returns a full rest endpoint URL. The queryString is attached to that url. The url changes if permalinks are enabled
         * Samples:
         *    Without permalinks: ?rest_route=/td-composer/save_post&uuid=5b926a98-837c-88bc-f2d8-b6944cf1ef06
         *       With permalinks: wp-json/td-composer/save_post?uuid=a293d49d-133f-8a6a-f1a9-740578b6e2bc
         * @param restEndPoint
         * @param queryString
         * @returns {string}
         */
        getRestEndPoint: function (restEndPoint, queryString) {
            if ( _.isEmpty(window.tdcAdminSettings.permalinkStructure) ) {
                // no permalinks
                return window.tdcAdminSettings.wpRestUrl + restEndPoint + '&' + queryString;
            } else {
                // we have permalinks enabled
                return window.tdcAdminSettings.wpRestUrl + restEndPoint + '?' + queryString;
            }
        }
    }


})();