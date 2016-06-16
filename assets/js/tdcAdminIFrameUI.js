/**
 * Created by ra on 3/22/2016.
 * This is the
 */

/* global jQuery:{} */
/* global Backbone:{} */
/* global _:{} */

/* global tdcDebug:{} */
/* global tdcAdminWrapperUI:{} */
/* global tdcOperationUI:{} */
/* global tdcIFrameData:{} */

var tdcAdminIFrameUI;

(function(jQuery, backbone, _, undefined) {

    'use strict';

    tdcAdminIFrameUI = {

        // the iFrame window object (AKA iframe global scope)
        _liveIframeWindowObject: undefined,

        // jQuery iFrame object
        _$liveIframe: undefined,





        /**
         * Get the iFrame window object if available. If the iframe was not loaded, this should stop execution with a fatal error
         * @returns {window} object
         */
        getIframeWindow: function() {
            if (_.isUndefined(tdcAdminIFrameUI._liveIframeWindowObject)) {
                throw "tdcAdminIFrameUI._liveIframeWindowObject is undefined. AKA: The iFrame window object is undefined. The iFrame was probably not added to the page!"
            }
            return tdcAdminIFrameUI._liveIframeWindowObject;
        },


        /**
         * Injects and runs JS code in the iframe via EVAL()
         * @param jsCode string JavaScript code
         */
        evalInIframe: function (jsCode) {
            tdcAdminIFrameUI.getIframeWindow().eval(jsCode);
        },


        /**
         * Init the content with an empty row and an empty column, if it doesn't have a '.tdc-row' element inside
         *
         * @param $iframeContents
         */
        initContent: function( $iframeContents ) {
            if ( ! $iframeContents.find( '.tdc-row' ).length ) {
                $iframeContents.find( '.td-main-content-wrap .td-container' ).prepend( '<div class="tdc-row"><div class="vc_row wpb_row td-pb-row"><div class="tdc-column"><div class="td-pb-span12 wpb_column vc_column_container"><div class="wpb_wrapper"></div></div></div></div></div>' );

                window.tdcPostSettings.postContent += '[vc_row][vc_column][/vc_column][/vc_row]';
            }
        },


        init: function() {

            var url = window.tdcPostSettings.postUrl;

            if ( url.indexOf( '?' ) < 0 ) {
                url += '?td_action=tdc_edit&post_id=' + window.tdcPostSettings.postId;
            } else {
                url += '&td_action=tdc_edit&post_id=' + window.tdcPostSettings.postId;
            }




            tdcAdminIFrameUI._$liveIframe = jQuery( '<iframe id="tdc-live-iframe" src="' + url + '" scrolling="auto" style="width: 100%; height: 100%"></iframe>' )
                .css({
                    height: jQuery(window).innerHeight()
                })
                .load(function(){

                    var $this = jQuery(this);

                    var iframeContents = $this.contents();

                    tdcAdminIFrameUI.initContent( iframeContents );


                    tdcAdminIFrameUI._liveIframeWindowObject = jQuery(this).get(0).contentWindow;

                    //jQuery(this)[0].contentWindow.gggg();

                    ///**
                    // * Add wrappers around all shortcode dom elements
                    // */
                    //window.addWrappers = function( iframeContents ) {
                    //    iframeContents.find( '.tdc-row' )
                    //        .wrapAll( '<div id="tdc-rows"></div>' )
                    //        .each(function( index, el ) {
                    //            jQuery( el ).find( '.tdc-column' ).wrapAll( '<div class="tdc-columns"></div>' );
                    //        });
                    //
                    //
                    //
                    //    // all tdc-inner-rows
                    //    // all tdc-elements
                    //    iframeContents.find( '.tdc-column' ).each(function( index, el ) {
                    //        //jQuery( el ).find( '.tdc-inner-row').wrapAll( '<div class="tdc-inner-rows"></div>');
                    //        //jQuery( el ).find( '.tdc-inner-rows').wrapAll( '<div class="tdc-element-inner-row"></div>');
                    //
                    //        jQuery( el ).find( '.tdc-inner-row').wrap( '<div class="tdc-element-inner-row"></div>');
                    //
                    //        jQuery( el ).find( '.td_block_wrap').wrap( '<div class="tdc-element"></div>' );
                    //
                    //        // wrap the reclama / a-d-s
                    //        //jQuery( el ).find( '.td-a-rec').wrap( '<div class="tdc-element"></div>' );
                    //
                    //    });
                    //
                    //
                    //
                    //    // all tdc-inner-columns
                    //    iframeContents.find( '.tdc-inner-row' ).each(function( index, el ) {
                    //        jQuery( el).find( '.tdc-inner-column').wrapAll( '<div class="tdc-inner-columns"></div>' );
                    //    });
                    //
                    //
                    //
                    //    // all tdc-element of the tdc-inner-column, moved to the tdc-elements
                    //    iframeContents.find( '.tdc-inner-column').each(function( index, el ) {
                    //        var tdcElement = jQuery( el ).find( '.tdc-element');
                    //
                    //        if ( tdcElement.length ) {
                    //            tdcElement.addClass( 'tdc-element-inner-column' ).wrapAll( '<div class="tdc-elements"></div>' );
                    //        } else {
                    //
                    //            // add sortable area if empty inner column
                    //            var innerMostElement = jQuery( el).find( '.wpb_wrapper' );
                    //
                    //            if ( innerMostElement.length ) {
                    //                innerMostElement.append( '<div class="tdc-elements"></div>' );
                    //            }
                    //        }
                    //    });
                    //
                    //
                    //
                    //    // all tdc-element not already moved to tdc-elements, moved to their new tdc-elements (columns can have their elements, which are not inside of an inner row > inner column)
                    //    iframeContents.find( '.tdc-column' ).each(function( index, el ) {
                    //
                    //        var tdcElement = jQuery( el).find( '.tdc-element, .tdc-element-inner-row' );
                    //
                    //        if ( tdcElement.length ) {
                    //            tdcElement
                    //                .not( '.tdc-element-inner-column' )
                    //                .addClass( 'tdc-element-column' )
                    //                .wrapAll( '<div class="tdc-elements"></div>' );
                    //
                    //            //tdcElement.attr( 'data-td_shorcode', 11);
                    //
                    //            var td_block_wrap = tdcElement.find( '.td_block_wrap' );
                    //            if ( td_block_wrap.length ) {
                    //
                    //            }
                    //
                    //        } else {
                    //
                    //            // add sortable area if empty columns
                    //            var innerMostElement = jQuery( el ).find( '.wpb_wrapper' );
                    //
                    //            if ( innerMostElement.length ) {
                    //                innerMostElement.append( '<div class="tdc-elements"></div>' );
                    //            }
                    //        }
                    //    });
                    //
                    //
                    //    // all empty tdc-elements will have an empty element
                    //    iframeContents.find( '.tdc-elements:empty' ).each(function( index, element ) {
                    //
                    //        // Add the 'tdc-element-column' or the 'tdc-element-inner-column' class to the empty element
                    //        var structureClass = '',
                    //            $element = jQuery( element );
                    //
                    //        var $tdcInnerColumnParentOfDraggedElement = $element.closest( '.tdc-inner-column' );
                    //        if ( $tdcInnerColumnParentOfDraggedElement.length ) {
                    //            structureClass = ' tdc-element-inner-column';
                    //        } else {
                    //            var $tdcColumnParentOfDraggedElement = $element.closest( '.tdc-column' );
                    //            if ( $tdcColumnParentOfDraggedElement.length ) {
                    //                structureClass = ' tdc-element-column';
                    //            }
                    //        }
                    //        var $emptyElement = jQuery( '<div class="' + tdcOperationUI._emptyElementClass + structureClass + '"></div>' );
                    //
                    //        tdcElementUI.bindEmptyElement( $emptyElement );
                    //
                    //        $element.append( $emptyElement );
                    //    });
                    //};


                    /**
                     * Add wrappers around all shortcode dom elements
                     */
                    window.addWrappers = function( $iframeContents ) {
                        $iframeContents.find( '.tdc-row' )
                            .wrapAll( '<div id="tdc-rows"></div>' )
                            .each(function( index, el ) {
                                jQuery( el ).find( '.tdc-column' ).wrapAll( '<div class="tdc-columns"></div>' );
                            });


                        // all tdc-inner-rows
                        // all tdc-elements
                        $iframeContents.find( '.tdc-column' ).each(function( index, el ) {
                            var $el = jQuery( el );

                            $el.find( '.tdc-inner-row').wrap( '<div class="tdc-element-inner-row"></div>');
                            $el.find( '.td_block_wrap').wrap( '<div class="tdc-element"></div>');

                            // Add the '.clearfix' element inside of the '.td_block_wrap'
                            var $tdcElement = $el.find( '.tdc-element' );

                            if ( $tdcElement.next().hasClass( 'clearfix' ) ) {
                                $tdcElement.append( $tdcElement.next() );
                            }

                        });


                        // all tdc-inner-columns
                        // all tdc-element of the tdc-inner-column, moved to the tdc-elements
                        $iframeContents.find( '.tdc-inner-row' ).each(function( index, el ) {
                            var $el = jQuery( el );

                            $el.find( '.tdc-inner-column')
                                .wrapAll( '<div class="tdc-inner-columns"></div>')
                                .each(function( index, el ) {
                                    var tdcElement = jQuery( el ).find( '.tdc-element');

                                    if ( tdcElement.length ) {
                                        tdcElement.addClass( 'tdc-element-inner-column' ).wrapAll( '<div class="tdc-elements"></div>' );
                                    } else {

                                        // add sortable area if empty inner column
                                        var innerMostElement = jQuery( el).find( '.wpb_wrapper' );

                                        if ( innerMostElement.length ) {
                                            innerMostElement.append( '<div class="tdc-elements"></div>' );
                                        }
                                    }
                                });
                        });


                        $iframeContents.find( '.tdc-element, .tdc-element-inner-row').each(function( index, el) {
                            var tdcElement = jQuery( el );

                            if ( tdcElement.length ) {
                                tdcElement
                                    .not( '.tdc-element-inner-column' )
                                    .addClass( 'tdc-element-column' );
                            }
                        });


                        // all tdc-element not already moved to tdc-elements, moved to their new tdc-elements (columns can have their elements, which are not inside of an inner row > inner column)
                        $iframeContents.find( '.tdc-column' ).each(function( index, el ) {

                            var tdcElement = jQuery( el).find( '.tdc-element, .tdc-element-inner-row' );

                            if ( tdcElement.length ) {

                                tdcElement
                                    .not( '.tdc-element-inner-column' )
                                    .wrapAll( '<div class="tdc-elements"></div>' );

                            } else {
                                // add empty '.tdc-elements' if empty columns
                                var innerMostElement = jQuery( el ).find( '.wpb_wrapper' );

                                if ( innerMostElement.length ) {
                                    innerMostElement.append( '<div class="tdc-elements"></div>' );
                                }
                            }
                        });


                        // all empty '.tdc-elements' will have an empty element
                        $iframeContents.find( '.tdc-elements:empty' ).each(function( index, element ) {

                            // Add the 'tdc-element-column' or the 'tdc-element-inner-column' class to the empty element
                            var structureClass = '',
                                $element = jQuery( element );

                            var $tdcInnerColumnParentOfDraggedElement = $element.closest( '.tdc-inner-column' );
                            if ( $tdcInnerColumnParentOfDraggedElement.length ) {
                                structureClass = ' tdc-element-inner-column';
                            } else {
                                var $tdcColumnParentOfDraggedElement = $element.closest( '.tdc-column' );
                                if ( $tdcColumnParentOfDraggedElement.length ) {
                                    structureClass = ' tdc-element-column';
                                }
                            }
                            var $emptyElement = jQuery( '<div class="' + tdcOperationUI._emptyElementClass + structureClass + '"></div>' );

                            tdcElementUI.bindEmptyElement( $emptyElement );

                            $element.append( $emptyElement );
                        });
                    };



                    /**
                     * Add wrappers to the shortcodes
                     *
                     * @param $content - row content
                     */
                    window.addRowWrappers = function( $content ) {

                        // Wrap all '.tdc-column' into '.tdc-columns'
                        $content.find( '.tdc-column' ).wrapAll( '<div class="tdc-columns"></div>' );

                        // all tdc-inner-rows
                        // all tdc-elements
                        $content.find( '.tdc-column' ).each(function( index, el ) {
                            var $el = jQuery( el );

                            $el.find( '.tdc-inner-row').wrap( '<div class="tdc-element-inner-row"></div>');
                            $el.find( '.td_block_wrap' ).wrap( '<div class="tdc-element"></div>' );

                            // Add the '.clearfix' element inside of the '.td_block_wrap'
                            var $tdcElement = $el.find( '.tdc-element' );

                            if ( $tdcElement.next().hasClass( 'clearfix' ) ) {
                                $tdcElement.append( $tdcElement.next() );
                            }
                        });


                        // all tdc-inner-columns
                        // all tdc-element of the tdc-inner-column, moved to the tdc-elements
                        $content.find( '.tdc-inner-row' ).each(function( index, el ) {
                            var $el = jQuery( el );

                            $el.find( '.tdc-inner-column')
                                .wrapAll( '<div class="tdc-inner-columns"></div>' )
                                .each(function( index, el ) {
                                    var tdcElement = jQuery( el ).find( '.tdc-element');

                                    if ( tdcElement.length ) {
                                        tdcElement.addClass( 'tdc-element-inner-column' ).wrapAll( '<div class="tdc-elements"></div>' );
                                    } else {

                                        // add sortable area if empty inner column
                                        var innerMostElement = jQuery( el).find( '.wpb_wrapper' );

                                        if ( innerMostElement.length ) {
                                            innerMostElement.append( '<div class="tdc-elements"></div>' );
                                        }
                                    }
                                });
                        });


                        $content.find( '.tdc-element, .tdc-element-inner-row').each(function( index, el) {
                            var tdcElement = jQuery( el );

                            if ( tdcElement.length ) {
                                tdcElement
                                    .not( '.tdc-element-inner-column' )
                                    .addClass( 'tdc-element-column' );
                            }
                        });


                        // all tdc-element not already moved to tdc-elements, moved to their new tdc-elements (columns can have their elements, which are not inside of an inner row > inner column)
                        $content.find( '.tdc-column' ).each(function( index, el ) {

                            var tdcElement = jQuery( el).find( '.tdc-element, .tdc-element-inner-row' );

                            if ( tdcElement.length ) {

                                tdcElement
                                    .not( '.tdc-element-inner-column' )
                                    .wrapAll( '<div class="tdc-elements"></div>' );

                            } else {
                                // add sortable area if empty columns
                                var innerMostElement = jQuery( el ).find( '.wpb_wrapper' );

                                if ( innerMostElement.length ) {
                                    innerMostElement.append( '<div class="tdc-elements"></div>' );
                                }
                            }
                        });


                        // all empty tdc-elements will have an empty element
                        $content.find( '.tdc-elements:empty' ).each(function( index, element ) {

                            // Add the 'tdc-element-column' or the 'tdc-element-inner-column' class to the empty element
                            var structureClass = '',
                                $element = jQuery( element );

                            var $tdcInnerColumnParentOfDraggedElement = $element.closest( '.tdc-inner-column' );
                            if ( $tdcInnerColumnParentOfDraggedElement.length ) {
                                structureClass = ' tdc-element-inner-column';
                            } else {
                                var $tdcColumnParentOfDraggedElement = $element.closest( '.tdc-column' );
                                if ( $tdcColumnParentOfDraggedElement.length ) {
                                    structureClass = ' tdc-element-column';
                                }
                            }
                            var $emptyElement = jQuery( '<div class="' + tdcOperationUI._emptyElementClass + structureClass + '"></div>' );

                            tdcElementUI.bindEmptyElement( $emptyElement );

                            $element.append( $emptyElement );
                        });
                    };




                    /**
                     * Add wrappers to the shortcodes
                     *
                     * @param $content - column content
                     */
                    window.addColumnWrappers = function( $content ) {

                        // all tdc-inner-rows
                        // all tdc-elements
                        $content.find( '.tdc-inner-row').wrap( '<div class="tdc-element-inner-row"></div>');
                        $content.find( '.td_block_wrap' ).wrap( '<div class="tdc-element"></div>' );

                        // Add the '.clearfix' element inside of the '.td_block_wrap'
                        var $tdcElement = $content.find( '.tdc-element' );

                        if ( $tdcElement.next().hasClass( 'clearfix' ) ) {
                            $tdcElement.append( $tdcElement.next() );
                        }



                        // all tdc-inner-columns
                        // all tdc-element of the tdc-inner-column, moved to the tdc-elements
                        $content.find( '.tdc-inner-row' ).each(function( index, el ) {
                            var $el = jQuery( el );

                            $el.find( '.tdc-inner-column')
                                .wrapAll( '<div class="tdc-inner-columns"></div>' )
                                .each(function( index, el ) {
                                    var tdcElement = jQuery( el ).find( '.tdc-element');

                                    if ( tdcElement.length ) {
                                        tdcElement.addClass( 'tdc-element-inner-column' ).wrapAll( '<div class="tdc-elements"></div>' );
                                    } else {

                                        // add sortable area if empty inner column
                                        var innerMostElement = jQuery( el).find( '.wpb_wrapper' );

                                        if ( innerMostElement.length ) {
                                            innerMostElement.append( '<div class="tdc-elements"></div>' );
                                        }
                                    }
                                });
                        });


                        $content.find( '.tdc-element, .tdc-element-inner-row').each(function( index, el) {
                            var tdcElement = jQuery( el );

                            if ( tdcElement.length ) {
                                tdcElement
                                    .not( '.tdc-element-inner-column' )
                                    .addClass( 'tdc-element-column' );
                            }
                        });


                        // all tdc-element not already moved to tdc-elements, moved to their new tdc-elements (columns can have their elements, which are not inside of an inner row > inner column)
                        var tdcElement = $content.find( '.tdc-element, .tdc-element-inner-row' );

                        if ( tdcElement.length ) {

                            tdcElement
                                .not( '.tdc-element-inner-column' )
                                .wrapAll( '<div class="tdc-elements"></div>' );

                        } else {
                            // add sortable area if empty columns
                            var innerMostElement = $content.find( '.wpb_wrapper' );

                            if ( innerMostElement.length ) {
                                innerMostElement.append( '<div class="tdc-elements"></div>' );
                            }
                        }


                        // all empty tdc-elements will have an empty element
                        $content.find( '.tdc-elements:empty' ).each(function( index, element ) {

                            // Add the 'tdc-element-column' or the 'tdc-element-inner-column' class to the empty element
                            var structureClass = '',
                                $element = jQuery( element );

                            var $tdcInnerColumnParentOfDraggedElement = $element.closest( '.tdc-inner-column' );
                            if ( $tdcInnerColumnParentOfDraggedElement.length ) {
                                structureClass = ' tdc-element-inner-column';
                            } else {
                                var $tdcColumnParentOfDraggedElement = $element.closest( '.tdc-column' );
                                if ( $tdcColumnParentOfDraggedElement.length ) {
                                    structureClass = ' tdc-element-column';
                                }
                            }
                            var $emptyElement = jQuery( '<div class="' + tdcOperationUI._emptyElementClass + structureClass + '"></div>' );

                            tdcElementUI.bindEmptyElement( $emptyElement );

                            $element.append( $emptyElement );
                        });
                    };




                    window.addInnerRowWrappers = function( $content ) {

                        $content.find( '.td_block_wrap' ).wrap( '<div class="tdc-element"></div>' );

                        // Add the '.clearfix' element inside of the '.td_block_wrap'
                        var $tdcElement = $content.find( '.tdc-element' );

                        if ( $tdcElement.next().hasClass( 'clearfix' ) ) {
                            $tdcElement.append( $tdcElement.next() );
                        }


                        // all tdc-inner-columns
                        // all tdc-element of the tdc-inner-column, moved to the tdc-elements
                        $content.find( '.tdc-inner-row' ).each(function( index, el ) {
                            var $el = jQuery( el );

                            $el.find( '.tdc-inner-column')
                                .wrapAll( '<div class="tdc-inner-columns"></div>' )
                                .each(function( index, el ) {
                                    var tdcElement = jQuery( el ).find( '.tdc-element');

                                    if ( tdcElement.length ) {
                                        tdcElement.addClass( 'tdc-element-inner-column' ).wrapAll( '<div class="tdc-elements"></div>' );
                                    } else {

                                        // add sortable area if empty inner column
                                        var innerMostElement = jQuery( el).find( '.wpb_wrapper' );

                                        if ( innerMostElement.length ) {
                                            innerMostElement.append( '<div class="tdc-elements"></div>' );
                                        }
                                    }
                                });
                        });


                        // all empty tdc-elements will have an empty element
                        $content.find( '.tdc-elements:empty' ).each(function( index, element ) {

                            // Add the 'tdc-element-column' or the 'tdc-element-inner-column' class to the empty element
                            var structureClass = '',
                                $element = jQuery( element );

                            var $tdcInnerColumnParentOfDraggedElement = $element.closest( '.tdc-inner-column' );
                            if ( $tdcInnerColumnParentOfDraggedElement.length ) {
                                structureClass = ' tdc-element-inner-column';
                            } else {
                                var $tdcColumnParentOfDraggedElement = $element.closest( '.tdc-column' );
                                if ( $tdcColumnParentOfDraggedElement.length ) {
                                    structureClass = ' tdc-element-column';
                                }
                            }
                            var $emptyElement = jQuery( '<div class="' + tdcOperationUI._emptyElementClass + structureClass + '"></div>' );

                            tdcElementUI.bindEmptyElement( $emptyElement );

                            $element.append( $emptyElement );
                        });
                    };




                    window.addInnerColumnWrappers = function( $content ) {

                        $content.find( '.td_block_wrap' ).wrap( '<div class="tdc-element"></div>' );

                        // Add the '.clearfix' element inside of the '.td_block_wrap'
                        var $tdcElement = $content.find( '.tdc-element' );

                        if ( $tdcElement.next().hasClass( 'clearfix' ) ) {
                            $tdcElement.append( $tdcElement.next() );
                        }



                        // all tdc-inner-columns
                        // all tdc-element of the tdc-inner-column, moved to the tdc-elements
                        var tdcElement = $content.find( '.tdc-element');

                        if ( tdcElement.length ) {
                            tdcElement.addClass( 'tdc-element-inner-column' ).wrapAll( '<div class="tdc-elements"></div>' );
                        } else {

                            // add sortable area if empty inner column
                            var innerMostElement = $content.find( '.wpb_wrapper' );

                            if ( innerMostElement.length ) {
                                innerMostElement.append( '<div class="tdc-elements"></div>' );
                            }
                        }



                        // all empty tdc-elements will have an empty element
                        $content.find( '.tdc-elements:empty' ).each(function( index, element ) {

                            // Add the 'tdc-element-column' or the 'tdc-element-inner-column' class to the empty element
                            var structureClass = '',
                                $element = jQuery( element );

                            var $tdcInnerColumnParentOfDraggedElement = $element.closest( '.tdc-inner-column' );
                            if ( $tdcInnerColumnParentOfDraggedElement.length ) {
                                structureClass = ' tdc-element-inner-column';
                            } else {
                                var $tdcColumnParentOfDraggedElement = $element.closest( '.tdc-column' );
                                if ( $tdcColumnParentOfDraggedElement.length ) {
                                    structureClass = ' tdc-element-column';
                                }
                            }
                            var $emptyElement = jQuery( '<div class="' + tdcOperationUI._emptyElementClass + structureClass + '"></div>' );

                            tdcElementUI.bindEmptyElement( $emptyElement );

                            $element.append( $emptyElement );
                        });
                    };




                    window.addWrappers( iframeContents );

                    tdcIFrameData.init( iframeContents );
                    tdcOperationUI.init( iframeContents );
                });





            // append the iFrame!
            var tdcJqObjWrapper = jQuery( '#tdc-live-iframe-wrapper');
            if (tdcJqObjWrapper.length === 0) {
                // die
                throw "#tdc-live-iframe-wrapper not found in document! We need that to add the iframe with append";
            }
            tdcJqObjWrapper.append( tdcAdminIFrameUI._$liveIframe );


        }

    };

})(jQuery, Backbone, _);
