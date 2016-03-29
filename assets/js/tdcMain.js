/**
 * Created by tagdiv on 18.02.2016.
 */

/* global jQuery:{} */
/* global Backbone:{} */
/* global _:{} */

/* global tdcJobManager:{} */
/* global tdcShortcodeParser:{} */
/* global tdcAdminWrapperUI:{} */


/* global tdcAdminIFrameUI */

var tdcMain,
    tdcAdminStructure,
    tdcDebug;

(function(jQuery, backbone, _, undefined) {

    'use strict';


    //var TdcRow,
    //    TdcColumn,
    //    TdcInnerRow,
    //    TdcInnerColumn,
    //
    //    TdcRows,
    //    TdcColumns,
    //    TdcInnerColumns,

    var TdcModel,
        TdcCollection,
        TdcLiveView,

    // The general rows backbone collection
        tdcRows;


    tdcMain = {

        init: function() {
            tdcAdminIFrameUI.init();

            //tdcMain._defineStructuredData();
            //tdcMain._initStructuredData();
            //
            ////console.log( JSON.stringify( tdc_rows ) );
            //tdcDebug.log( tdcRows.models );
        },





























    };





    tdcMain.init();




})(jQuery, Backbone, _);
