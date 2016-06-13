/**
 * Created by ra on 6/10/2016.
 */


/* global TdcCssGenerator:{} */



/// @todo trebuie implementat
var tdcCssState = {};

(function(){
    'use strict';




    tdcCssState = {
        useOnlyDesktop: false,
        desktop: new TdcCssGenerator(),
        tabletL: new TdcCssGenerator(),
        tabletP: new TdcCssGenerator(),
        mobile: new TdcCssGenerator()
    };



})();