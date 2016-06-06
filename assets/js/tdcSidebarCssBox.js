/**
 * Created by ra on 6/2/2016.
 */


function TdcCssGenerator () {
    'use strict';

    this.possitions = ['top', 'right', 'bottom', 'left'];

    // padding
    this.paddingTop = '';
    this.paddingRight = '';
    this.paddingBottom = '';
    this.paddingLeft = '';
    this.setPadding = function (newValue) {
        this.paddingTop = newValue;
        this.paddingRight = newValue;
        this.paddingBottom = newValue;
        this.paddingLeft = newValue;
    };


    // margins
    this.marginTop = '';
    this.marginRight = '';
    this.marginBottom = '';
    this.marginLeft = '';
    this.setMargin = function (newValue) {
        this.marginTop = newValue;
        this.marginRight = newValue;
        this.marginBottom = newValue;
        this.marginLeft = newValue;
    };

    // borders
    this.borderRadius = '';

    this.borderWidthTop = '';
    this.borderWidthRight = '';
    this.borderWidthBottom = '';
    this.borderWidthLeft = '';
    this.setBorderWidth = function (newValue) {
        this.borderWidthTop = newValue;
        this.borderWidthRight = newValue;
        this.borderWidthBottom = newValue;
        this.borderWidthLeft = newValue;
    };

    this.borderStyle = '';

    this.borderColor = '';


    this.backgroundPosition = '';
    this.backgroundRepeat = '';
    this.backgroundSize = '';
    this.backgroundColor = '';
    this.backgroundUrl = '';


    /**
     * capitalize the first letter
     * @param string
     * @returns {string}
     * @private
     */
    this._cap = function (string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    };



    this._generateBorder = function () {



        if (
            this.borderWidthTop === '' &&
            this.borderWidthRight ===  '' &&
            this.borderWidthBottom ===  '' &&
            this.borderWidthLeft ===  ''
        ) {
            // if we don't have a border width, do not output anything
            return '';
        }


        // border width + style + color
        if (
            this.borderWidthTop === this.borderWidthRight &&
            this.borderWidthTop === this.borderWidthBottom &&
            this.borderWidthTop === this.borderWidthLeft &&
            this.borderStyle !== '' &&
            this.borderColor !== ''
        ) {
            // compress all in one statement
            return 'border: ' + this.borderWidthTop + 'px ' +  this.borderStyle + ' ' +  this.borderColor + ' !important;';
        }


        var buffy = '';




        for (var i=0; i<this.possitions.length; i++) {
            // border width
            if (this['borderWidth' + this._cap(this.possitions[i])] !== '') {
                buffy += 'border-' + this.possitions[i] + '-width: ' + this['borderWidth' + this._cap(this.possitions[i])] + 'px !important;';




                // border style
                if (this.borderStyle !== '') {
                    buffy += 'border-' + this.possitions[i] + '-style: ' + this.borderStyle + ' !important;';
                }


                // border color
                if (this.borderColor !== '') {
                    buffy += 'border-' + this.possitions[i] + '-color: ' + this.borderColor + ' !important;';
                }


            }



        }



        return buffy;

    };



    this.setBackgroundStyle = function (newStyle) {
        switch (newStyle) {
            case 'cover':
                this.backgroundPosition = 'center';
                this.backgroundRepeat = 'no-repeat';
                this.backgroundSize = 'cover';
                break;
            case 'contain':
                this.backgroundPosition = 'center';
                this.backgroundRepeat = 'no-repeat';
                this.backgroundSize = 'contain';
                break;
            case 'no-repeat':
                this.backgroundPosition = '0 0';
                this.backgroundRepeat = 'no-repeat';
                break;
            case 'repeat':
                this.backgroundPosition = '0 0';
                this.backgroundRepeat = 'repeat';
                break;

        }
    };

    /**
     * bg color + bg image
     * @returns {*}
     * @private
     */
    this._generateBackground = function () {
        if (this.backgroundColor !== '' && this.backgroundUrl !== '') {
            return 'background: ' + this.backgroundColor + ' url(' + this.backgroundUrl + ') !important;';
        }

        else if (this.backgroundColor !== '') {
            return 'background-color: ' + this.backgroundColor + ' !important;';
        }

        else if (this.backgroundUrl !== '') {
            return 'background-image: url(' + this.backgroundUrl + ') !important;';
        }

        return '';
    };


    this.generateCss = function () {
        var buffy = '';


        for (var i=0; i<this.possitions.length; i++) {
            // padding
            if (this['padding' + this._cap(this.possitions[i])] !== '') {
                buffy += 'padding-' + this.possitions[i] + ': ' + this['padding' + this._cap(this.possitions[i])] + 'px !important;';
            }

            // margin
            if (this['margin' + this._cap(this.possitions[i])] !== '') {
                buffy += 'margin-' + this.possitions[i] + ': ' + this['margin' + this._cap(this.possitions[i])] + 'px !important;';
            }

        }



        buffy += this._generateBackground(); // color + image

        buffy += this._generateBorder();

        if (this.borderRadius !== '') {
            buffy += 'border-radius: ' + this.borderRadius + 'px !important;';
        }


        // bg
        if (this.backgroundPosition !== '') {
            buffy += 'background-position: ' + this.backgroundPosition + ' !important;';
        }
        if (this.backgroundRepeat !== '') {
            buffy += 'background-repeat: ' + this.backgroundRepeat + ' !important;';
        }
        if (this.backgroundSize !== '') {
            buffy += 'background-size: ' + this.backgroundSize + ' !important;';
        }






        return '.vc_custom_' + Date.now() + ' {' +  buffy + '}';
    };
}









var tdcCssParser = {};


(function() {
    'use strict';

    tdcCssParser = {
        _parsedCssRaw: {}, // the css returned from parseCSS
        _cssPropertyValues: {},

        _parseRunned: false,


        parse: function (css) {

            tdcCssParser._parseRunned = true;

            //parse css string
            var parser = new cssjs();
            tdcCssParser._parsedCssRaw = parser.parseCSS(css);

            // no valid css found
            if (_.isEmpty(tdcCssParser._parsedCssRaw[0])) {
                return false;
            }



            // rename the css properties for easier lookup     border-top-width  ->   border-width-top
            for (var i = 0; i < tdcCssParser._parsedCssRaw[0].rules.length; i++) {
                var currentProperty = tdcCssParser._parsedCssRaw[0].rules[i].directive;
                if (currentProperty === 'border-top-width') {
                    tdcCssParser._parsedCssRaw[0].rules[i].directive = 'border-width-top';
                }
                if (currentProperty === 'border-right-width') {
                    tdcCssParser._parsedCssRaw[0].rules[i].directive = 'border-width-right';
                }
                if (currentProperty === 'border-bottom-width') {
                    tdcCssParser._parsedCssRaw[0].rules[i].directive = 'border-width-bottom';
                }
                if (currentProperty === 'border-left-width') {
                    tdcCssParser._parsedCssRaw[0].rules[i].directive = 'border-width-left';
                }


                if (currentProperty === 'border-top-color') {
                    tdcCssParser._parsedCssRaw[0].rules[i].directive = 'border-color-top';
                }
                if (currentProperty === 'border-right-color') {
                    tdcCssParser._parsedCssRaw[0].rules[i].directive = 'border-color-right';
                }
                if (currentProperty === 'border-bottom-color') {
                    tdcCssParser._parsedCssRaw[0].rules[i].directive = 'border-color-bottom';
                }
                if (currentProperty === 'border-left-color') {
                    tdcCssParser._parsedCssRaw[0].rules[i].directive = 'border-color-left';
                }


                if (currentProperty === 'border-top-style') {
                    tdcCssParser._parsedCssRaw[0].rules[i].directive = 'border-style-top';
                }
                if (currentProperty === 'border-right-style') {
                    tdcCssParser._parsedCssRaw[0].rules[i].directive = 'border-style-right';
                }
                if (currentProperty === 'border-bottom-style') {
                    tdcCssParser._parsedCssRaw[0].rules[i].directive = 'border-style-bottom';
                }
                if (currentProperty === 'border-left-style') {
                    tdcCssParser._parsedCssRaw[0].rules[i].directive = 'border-style-left';
                }
            }
            console.log(tdcCssParser._parsedCssRaw);

        },


        _nthWord: function(str, n) {

            var words = str.split(/\s+/);

            return words[n];

        },


        /**
         * remove px, important and extracts the bg url
         * @param cssDirectiveName
         * @param str
         * @returns {*}
         * @private
         */
        _cleanCss: function (cssDirectiveName, str) {
            if (cssDirectiveName === 'background-url') {
                var urlRegex = /(url\s*\(\s*['"]?)(.*?)\s*(['"]?\s*\))/ig;
                var found = urlRegex.exec(str);
                if (!_.isEmpty(found)) {
                    return found[2];
                }

                return '';
            }

            str = str.toLowerCase();
            str = str.replace(/!important|px/g, '');
            return str.trim();
        },




        getPropertyValueClean:function (cssDirectiveName) {

            if ( tdcCssParser._parseRunned === false ) {
                throw "Parse did not run";
            }


            // if we request the border-color, we need to start looking for the first border color
            // we don't have support for border-color this way! _getPropertyValue has support for that if we want to implement it in the future
            if (cssDirectiveName === 'border-color') {
                var borderColorTop = tdcCssParser.getPropertyValueClean('border-color-top');
                var borderColorRight = tdcCssParser.getPropertyValueClean('border-color-right');
                var borderColorBottom = tdcCssParser.getPropertyValueClean('border-color-bottom');
                var borderColorLeft = tdcCssParser.getPropertyValueClean('border-color-left');

                if (borderColorTop !== '') {
                    return borderColorTop;
                }

                else if (borderColorRight !== '') {
                    return borderColorRight;
                }

                else if (borderColorBottom !== '') {
                    return borderColorBottom;
                }

                else if (borderColorLeft !== '') {
                    return borderColorLeft;
                }
            }



            if (cssDirectiveName === 'border-width') {
                var borderWidthTop =    tdcCssParser.getPropertyValueClean('border-width-top');
                var borderWidthRight =  tdcCssParser.getPropertyValueClean('border-width-right');
                var borderWidthBottom = tdcCssParser.getPropertyValueClean('border-width-bottom');
                var borderWidthLeft =   tdcCssParser.getPropertyValueClean('border-width-left');

                if (borderWidthTop !== '') {
                    return borderWidthTop;
                }

                else if (borderWidthRight !== '') {
                    return borderWidthRight;
                }

                else if (borderWidthBottom !== '') {
                    return borderWidthBottom;
                }

                else if (borderWidthLeft !== '') {
                    return borderWidthLeft;
                }
            }



            if (cssDirectiveName === 'border-style') {
                var borderStyleTop =    tdcCssParser.getPropertyValueClean('border-style-top');
                var borderStyleRight =  tdcCssParser.getPropertyValueClean('border-style-right');
                var borderStyleBottom = tdcCssParser.getPropertyValueClean('border-style-bottom');
                var borderStyleLeft =   tdcCssParser.getPropertyValueClean('border-style-left');

                if (borderStyleTop !== '') {
                    return borderStyleTop;
                }

                else if (borderStyleRight !== '') {
                    return borderStyleRight;
                }

                else if (borderStyleBottom !== '') {
                    return borderStyleBottom;
                }

                else if (borderStyleLeft !== '') {
                    return borderStyleLeft;
                }
            }


            return tdcCssParser._cleanCss(cssDirectiveName, tdcCssParser._getPropertyValue(cssDirectiveName));
        },

        /**
         * For compatibility:
         * - only parses the first selector
         * - the last occurrence is returned
         * @param cssDirectiveName
         */
        _getPropertyValue: function (cssDirectiveName) {
            if (_.isUndefined(tdcCssParser._parsedCssRaw[0])) {
                return '';
            }



            // parse the rules in inverse order from last to first, the first rule we find is ok
            for (var i = tdcCssParser._parsedCssRaw[0].rules.length - 1; i >= 0; i--) {
                var currentRule = tdcCssParser._parsedCssRaw[0].rules[i];
                currentRule.directive = currentRule.directive.toLowerCase();


                // exception for margin
                if (cssDirectiveName.indexOf('margin') !== -1) {
                    if (currentRule.directive === cssDirectiveName || currentRule.directive === 'margin') {
                        return currentRule.value;
                    }
                }


                // exception for padding
                else if (cssDirectiveName.indexOf('padding') !== -1) {
                    if (currentRule.directive === cssDirectiveName || currentRule.directive === 'padding') {
                        return currentRule.value;
                    }
                }

                // exception for border-width
                else if (cssDirectiveName.indexOf('border-width') !== -1) {
                    // border: 3px solid red - get the 3px from there
                    if (currentRule.directive === 'border') {
                        return tdcCssParser._nthWord(currentRule.value, 0); // return the first word from the border
                    }

                    if (currentRule.directive === cssDirectiveName || currentRule.directive === 'border-width') {
                        return currentRule.value;
                    }
                }



                /**
                 * exception for border-color
                 * NOTE: VC does not use border-color, just the border: 3px solid red syntax
                 * http://www.w3schools.com/cssref/pr_border-left_color.asp
                 *
                 */
                // exception for border-width
                else if (cssDirectiveName.indexOf('border-color') !== -1) {
                    // border: 3px solid red - get the 3px from there
                    if (currentRule.directive === 'border') {
                        return tdcCssParser._nthWord(currentRule.value, 2); // return the first 3rd from the border
                    }

                    if (currentRule.directive === cssDirectiveName || currentRule.directive === 'border-color') {
                        return currentRule.value;
                    }
                }


                // exception for border-style
                else if (cssDirectiveName.indexOf('border-style') !== -1) {
                    // border: 3px solid red - get the 3px from there
                    if (currentRule.directive === 'border') {
                        return tdcCssParser._nthWord(currentRule.value, 1); // return the first word from the border
                    }

                    if (currentRule.directive === cssDirectiveName || currentRule.directive === 'border-style') {
                        return currentRule.value;
                    }
                }



                // exception for background color
                else if (cssDirectiveName === 'background-color') {
                    // border: 3px solid red - get the 3px from there
                    if (currentRule.directive === 'background') {
                        return tdcCssParser._nthWord(currentRule.value, 0); // return the first word from the border
                    }

                    else if (currentRule.directive === 'background-color') {
                        return currentRule.value;
                    }
                }


                // exception for background url
                else if (cssDirectiveName === 'background-url') {
                    // border: 3px solid red - get the 3px from there
                    if (currentRule.directive === 'background') {
                        return tdcCssParser._nthWord(currentRule.value, 1); // return the first word from the border
                    }

                    else if (currentRule.directive === 'background-image') {
                        return currentRule.value;
                    }
                }


                // all others
                else if (currentRule.directive === cssDirectiveName) {
                    return currentRule.value;
                }
            }

            return '';

        }



    };

})();














var tdcMiniTest = {};


(function () {
    'use strict';
    tdcMiniTest = {

        showHeader: function (testName) {
            console.log('------------------------------------------------');
            console.log(testName + ' - Running tests..');
            console.log('-----');
        },



        assertCssProperty: function (cssProperty, expected) {
            var propertyValue = tdcCssParser.getPropertyValueClean(cssProperty);
            if (propertyValue === expected) {
                console.log(cssProperty + ': Passed');
                //console.log(cssProperty + ': Passed  (expected: |' + expected + '| got: |' + propertyValue + '|)');
            } else {
                console.log('%c' + cssProperty + ': FAILED (expected: |' + expected + '| got: |' + propertyValue + '|)', 'background: #222; color: #bada55');
            }
        }





    };
})();


//console.log(tdcCssParser._nthWord('background: #81d742 url(http://192.168.0.20/wp_011/wp-content/uploads/2016/05/4-3.jpg?id=24) !important', 2));





function racssgentest() {
    var t1 = new TdcCssGenerator();
    //t1.borderWidthTop = 5;
    t1.setBorderWidth(5);
    //t1.borderStyle = 'solid';
    t1.borderWidthTop = 1;
    t1.borderColor = '#ff11ff';
    t1.borderStyle = 'solid';

    //t1.backgroundUrl = 'http://reddit.com';
    //t1.backgroundColor = '#ffffff';

    //t1.setBackgroundStyle('contain');

    //t1.setMargin(5);

    //t1.borderRadius = '5';


    console.log(t1.generateCss());
}





function racsstest() {



    tdcMiniTest.showHeader("test1");
    // all options active
    var test1 = ".vc_custom_1464612013180{Margin-top: 1px !important;margin-right: 2px !important;margin-bottom: 3px !important;margin-left: 4px !important;border-top-width: 5px !important;border-right-width: 6px !important;border-bottom-width: 7px !important;border-left-width: 8px !important;padding-top: 9px !important;padding-right: 10px !important;padding-bottom: 11px !important;padding-left: 12px !important;background: #81d742 url(http://192.168.0.20/wp_011/wp-content/uploads/2016/05/4-3.jpg?id=24) !important;background-position: center !important;background-repeat: no-repeat !important;background-size: contain !important;border-left-color: #dd3333 !important;border-left-style: solid !important;border-right-color: #dd3333 !important;border-right-style: solid !important;border-top-color: #dd3333 !important;border-top-style: solid !important;border-bottom-color: #dd3333 !important;border-bottom-style: solid !important;border-radius: 3px !important;}";
    tdcCssParser.parse(test1);
    tdcMiniTest.assertCssProperty('margin-top',     '1');
    tdcMiniTest.assertCssProperty('margin-right',   '2');
    tdcMiniTest.assertCssProperty('margin-bottom',  '3');
    tdcMiniTest.assertCssProperty('margin-left',    '4');

    tdcMiniTest.assertCssProperty('border-radius',      '3');

    tdcMiniTest.assertCssProperty('border-width-top',   '5');
    tdcMiniTest.assertCssProperty('border-width-right', '6');
    tdcMiniTest.assertCssProperty('border-width-bottom','7');
    tdcMiniTest.assertCssProperty('border-width-left',  '8');

    tdcMiniTest.assertCssProperty('border-style-top',   'solid');
    tdcMiniTest.assertCssProperty('border-style-right', 'solid');
    tdcMiniTest.assertCssProperty('border-style-bottom','solid');
    tdcMiniTest.assertCssProperty('border-style-left',  'solid');

    tdcMiniTest.assertCssProperty('border-color-top',   '#dd3333');
    tdcMiniTest.assertCssProperty('border-color-right', '#dd3333');
    tdcMiniTest.assertCssProperty('border-color-bottom','#dd3333');
    tdcMiniTest.assertCssProperty('border-color-left',  '#dd3333');

    tdcMiniTest.assertCssProperty('padding-top',    '9');
    tdcMiniTest.assertCssProperty('padding-right',  '10');
    tdcMiniTest.assertCssProperty('padding-bottom', '11');
    tdcMiniTest.assertCssProperty('padding-left',   '12');

    tdcMiniTest.assertCssProperty('background-position', 'center');
    tdcMiniTest.assertCssProperty('background-repeat',   'no-repeat');
    tdcMiniTest.assertCssProperty('background-size',     'contain');

    tdcMiniTest.assertCssProperty('background-color', '#81d742');
    tdcMiniTest.assertCssProperty('background-url', 'http://192.168.0.20/wp_011/wp-content/uploads/2016/05/4-3.jpg?id=24');




    // bg color
    tdcMiniTest.showHeader("test_bg");
    var test_bg = ".vc_custom_1464616587407{background-color: #939393 !important;}";
    tdcCssParser.parse(test_bg);
    tdcMiniTest.assertCssProperty('background-color', '#939393');




    // bg image
    tdcMiniTest.showHeader("test_bg_img");
    var test_bg_img = ".vc_custom_1464616725143{background-image: url(http://192.168.0.20/wp_011/wp-content/uploads/2016/05/DeskWalls-26.jpg?id=7) !important;}";
    tdcCssParser.parse(test_bg_img);
    tdcMiniTest.assertCssProperty('background-url', 'http://192.168.0.20/wp_011/wp-content/uploads/2016/05/DeskWalls-26.jpg?id=7');



    // compact margins and paddings
    tdcMiniTest.showHeader("test_compact");
    var test_compact = "vc_custom_1464617086062{margin: 1px !important;border-width: 2px !important;padding: 3px !important;}";
    tdcCssParser.parse(test_compact);

    tdcMiniTest.assertCssProperty('margin-top',     '1');
    tdcMiniTest.assertCssProperty('margin-right',   '1');
    tdcMiniTest.assertCssProperty('margin-bottom',  '1');
    tdcMiniTest.assertCssProperty('margin-left',    '1');

    tdcMiniTest.assertCssProperty('border-width-top',    '2');
    tdcMiniTest.assertCssProperty('border-width-right',  '2');
    tdcMiniTest.assertCssProperty('border-width-bottom', '2');
    tdcMiniTest.assertCssProperty('border-width-left',   '2');

    tdcMiniTest.assertCssProperty('padding-top',    '3');
    tdcMiniTest.assertCssProperty('padding-right',  '3');
    tdcMiniTest.assertCssProperty('padding-bottom', '3');
    tdcMiniTest.assertCssProperty('padding-left',   '3');




    // border short
    tdcMiniTest.showHeader("border_short");
    var border_short = ".vc_custom_1464618199945{border: 1px solid #dd3333 !important;}";
    tdcCssParser.parse(border_short);

    tdcMiniTest.assertCssProperty('border-width-top',   '1');
    tdcMiniTest.assertCssProperty('border-width-right', '1');
    tdcMiniTest.assertCssProperty('border-width-bottom','1');
    tdcMiniTest.assertCssProperty('border-width-left',  '1');

    tdcMiniTest.assertCssProperty('border-style-top',   'solid');
    tdcMiniTest.assertCssProperty('border-style-right', 'solid');
    tdcMiniTest.assertCssProperty('border-style-bottom','solid');
    tdcMiniTest.assertCssProperty('border-style-left',  'solid');


    tdcMiniTest.assertCssProperty('border-color-top',   '#dd3333');
    tdcMiniTest.assertCssProperty('border-color-right', '#dd3333');
    tdcMiniTest.assertCssProperty('border-color-bottom','#dd3333');
    tdcMiniTest.assertCssProperty('border-color-left',  '#dd3333');


    /**

     * border-radius
     * border-width-top | right | bottom | left   [intarnally we use non standard naming, it should have been border-top-width ]
     * border-color-top | right | bottom | left
     * border-style-top | right | bottom | left
     * padding-top | right | bottom | left
     * margin-top | right | bottom | left
     *
     * background-position
     * background-repeat
     * background-size
     * background-color - removed when background:
     * background: color, url
     */


    //console.log(tdcCssParser.getPropertyValue('border-radius'));
    //console.log(tdcCssParser.getPropertyValue('background'));




}











