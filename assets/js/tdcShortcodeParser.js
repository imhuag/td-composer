/**
 * Created by ra on 3/3/2016.
 */



/* global wp:false - this parser requiers the wp.shortcode parser from wordpress core @see wp.shortcode */


/*

    parser for shortcodes.
    - You must call init first and pass the levels array to the object.
    - after that use the parse method with a starting level of 0. The parse method will parse recursively until level 4. Note that level 2 is level 2 + level 4

*/
var tdcShortcodeParser = {};


(function () {
    'use strict';

    tdcShortcodeParser = {

        /**
         sample levels:
         {
             0: ['vc_row'],
             1: ['vc_column'],
             2: ['vc_row_inner'],     // 2+4 - we allso add the td_block_2 and other shortcodes here
             3: ['vc_column_inner'],
             4: ['td_block_2', 'vc_column_text']
         }

         we use levels to set an order for the parsing. First we look for level 0 shortcodes, then in the content of level 0 shortcodes we look for level 1 etc...
         */
        levels: {},


        /**
         * init the object - see the levels object above
         */
        init: function (levels) {
            tdcShortcodeParser.levels = levels;

            // add 4 to 2 precendece
            tdcShortcodeParser.levels[2] = tdcShortcodeParser.levels[2].concat(tdcShortcodeParser.levels[4]);
        },


        /**
         * Find the next matching shortcode using the level provided. A lavel can have multiple shortcodes
         * Shortcodes are formatted as an object that contains the match `content`, the matching `index`, and the parsed `shortcode` object.
         * @see wp.shortcode in wp-includes/js/shortcode.js (WordPress core)
         * @param level - the level id from the tdcShortcodeParser.levels object
         * @param text - the text to parse
         * @returns {undefined|object}
         */
        multiNext: function (level, text) {
            var multiTags = tdcShortcodeParser.levels[level];

            var firstMatchFound;
            for (var cnt = 0; cnt < multiTags.length; cnt++) {
                var nextMatch = tdcShortcodeParser.generateTreeElement(wp.shortcode.next(multiTags[cnt], text));
                // if it's the first found tag OR it's before a previously founded tag
                //console.log(nextTag);

                if (typeof nextMatch !== 'undefined' && (typeof firstMatchFound === 'undefined' || firstMatchFound.index > nextMatch.index)) {
                    firstMatchFound = nextMatch;
                }
            }
            return firstMatchFound;
        },


        /**
         * Find the next matching shortcode using the level provided. A lavel can have multiple shortcodes
         * Shortcodes are formatted as an object that contains the match `content`, the matching `index`, and the parsed `shortcode` object.
         * @see wp.shortcode in wp-includes/js/shortcode.js (WordPress core)
         * @param level - the level id from the tdcShortcodeParser.levels object
         * @param text - the text to parse
         * @returns {Array}
         */
        parse: function (level, text) {


            var nextMatch = tdcShortcodeParser.multiNext(level, text); // read the first match for the current level
            var protectionCounter = 0;   // infinite loop protection on bug
            var returnBuffer = [];

            while (typeof nextMatch !== 'undefined' && protectionCounter < 5000) {
                // cut out the parsed shortcode
                text = text.substring(nextMatch.index + nextMatch.content.length);

                // go deeper if needed
                if (level < 4) {
                    nextMatch.child = tdcShortcodeParser.parse(level + 1, nextMatch.content);
                }

                returnBuffer.push(nextMatch);

                nextMatch = tdcShortcodeParser.multiNext(level, text);
                protectionCounter++;
            }


            return returnBuffer;
        },


        /**
         * translates a wpShortcode element to a tree element...
         * @see wp.shortcode
         * @param wpShortcode in wp-includes/js/shortcode.js (WordPress core)
         * @returns {*}
         */
        generateTreeElement: function (wpShortcode) {
            return wpShortcode;
        }

    };


})();

//jQuery().ready(function() {
//
//
//    tdcShortcodeParser.init({
//        0: ['vc_row'],
//        1: ['vc_column'],
//        2: ['vc_row_inner'],     // 2+4
//        3: ['vc_column_inner'],
//        4: ['td_block_2', 'vc_column_text']
//    });
//
//
//    console.log(tdcShortcodeParser.parse(0, 'lorem ipsum text [vc_row][/vc_row] after text'));
//    console.log(tdcShortcodeParser.parse(0, 'lorem ipsum text [vc_column][/vc_column] after text'));
//    console.log(tdcShortcodeParser.parse(0, 'lorem ipsum text [vc_row][vc_column][vc_column_text][/vc_column_text][/vc_column][/vc_row] after text'));
//    console.log(tdcShortcodeParser.parse(0, '[vc_row][vc_column width="2/3"][vc_column_text]I am text block. Click edit button to change this text. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut elit tellus, luctus nec ullamcorper mattis, pulvinar dapibus leo.[/vc_column_text][vc_row_inner][vc_column_inner width="1/2"][vc_column_text]I am text block. Click edit button to change this text. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut elit tellus, luctus nec ullamcorper mattis, pulvinar dapibus leo.[/vc_column_text][/vc_column_inner][vc_column_inner width="1/2"][/vc_column_inner][/vc_row_inner][/vc_column][vc_column width="1/3"][vc_column_text]I am text block. Click edit button to change this text. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut elit tellus, luctus nec ullamcorper mattis, pulvinar dapibus leo.[/vc_column_text][/vc_column][/vc_row][vc_row][vc_column width="2/3"][vc_column_text]I am text block. Click edit button to change this text. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut elit tellus, luctus nec ullamcorper mattis, pulvinar dapibus leo.[/vc_column_text][vc_row_inner][vc_column_inner width="1/2"][vc_column_text]I am text block. Click edit button to change this text. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut elit tellus, luctus nec ullamcorper mattis, pulvinar dapibus leo.[/vc_column_text][/vc_column_inner][vc_column_inner width="1/2"][/vc_column_inner][/vc_row_inner][/vc_column][vc_column width="1/3"][vc_column_text]I am text block. Click edit button to change this text. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut elit tellus, luctus nec ullamcorper mattis, pulvinar dapibus leo.[/vc_column_text][/vc_column][/vc_row]'));
//});