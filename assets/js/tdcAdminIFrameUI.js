/**
 * Created by ra on 3/22/2016.
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

        // Flag used by any function other than 'init'
        _initialized: false,

        init: function() {

            // Do nothing if it's already initialized
            if ( tdcAdminIFrameUI._initialized ) {
                return;
            }

            tdcAdminIFrameUI._tdcPostSettings = window.tdcPostSettings;


            if ( undefined === tdcAdminIFrameUI._tdcPostSettings || ! tdcAdminWrapperUI._tdcJqObjWrapper.length ) {

                // Here there will be a debug console window call
                alert('something wrong');

                return;
            }

            var tdcLiveIframe = jQuery( '<iframe id="tdc-live-iframe" src="' + tdcAdminIFrameUI._tdcPostSettings.postUrl + '?td_action=tdc_edit&post_id=' + tdcAdminIFrameUI._tdcPostSettings.postId + '" ' +
                'scrolling="auto" style="width: 100%; height: 100%"></iframe>' )
                .css({
                    height: jQuery(window).innerHeight()
                })
                .load(function(){

                    var $this = jQuery(this);

                    var iframeContents = jQuery(this).contents();


                    /**
                     * Add wrappers around all shortcode dom elements
                     */
                    var addWrappers = function() {
                        iframeContents.find( '.tdc-row' )
                            .wrapAll( '<div id="tdc-rows"></div>' )
                            .each(function( index, el ) {
                                jQuery( el ).find( '.tdc-column' ).wrapAll( '<div class="tdc-columns"></div>' );
                            });



                        // all tdc-inner-rows
                        // all tdc-elements
                        iframeContents.find( '.tdc-column' ).each(function( index, el ) {
                            //jQuery( el ).find( '.tdc-inner-row').wrapAll( '<div class="tdc-inner-rows"></div>');
                            //jQuery( el ).find( '.tdc-inner-rows').wrapAll( '<div class="tdc-element-inner-row"></div>');

                            jQuery( el ).find( '.tdc-inner-row').wrap( '<div class="tdc-element-inner-row"></div>');

                            jQuery( el ).find( '.td_block_wrap').wrap( '<div class="tdc-element"></div>' );
                        });



                        // all tdc-inner-columns
                        iframeContents.find( '.tdc-inner-row' ).each(function( index, el ) {
                            jQuery( el).find( '.tdc-inner-column').wrapAll( '<div class="tdc-inner-columns"></div>' );
                        });



                        // all tdc-element of the tdc-inner-column, moved to the tdc-elements
                        iframeContents.find( '.tdc-inner-column').each(function( index, el ) {
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



                        // all tdc-element not already moved to tdc-elements, moved to their new tdc-elements (columns can have their elements, which are not inside of an inner row > inner column)
                        iframeContents.find( '.tdc-column' ).each(function( index, el ) {

                            var tdcElement = jQuery( el).find( '.tdc-element, .tdc-element-inner-row');

                            if ( tdcElement.length ) {
                                tdcElement
                                    .not( '.tdc-element-inner-column' )
                                    .addClass( 'tdc-element-column' )
                                    .wrapAll( '<div class="tdc-elements"></div>' );

                                //tdcElement.attr( 'data-td_shorcode', 11);

                                var td_block_wrap = tdcElement.find( '.td_block_wrap' );
                                if ( td_block_wrap.length ) {

                                }

                            } else {

                                // add sortable area if empty columns
                                var innerMostElement = jQuery( el ).find( '.wpb_wrapper' );

                                if ( innerMostElement.length ) {
                                    innerMostElement.append( '<div class="tdc-elements"></div>' );
                                }
                            }
                        });


                        // all empty tdc-elements will have an empty element
                        iframeContents.find( '.tdc-elements:empty' ).each(function( index, element ) {

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

                            tdcElementUI.defineOperationsForEmptyElement( $emptyElement );

                            $element.append( $emptyElement );
                        });
                    };

                    addWrappers();



                    tdcIFrameData.init( iframeContents );

                    tdcOperationUI.init( iframeContents );
                });

            tdcAdminWrapperUI._tdcJqObjWrapper.append( tdcLiveIframe );

            // This should be marked as false if something wrong
            tdcAdminIFrameUI._initialized = true;
        }

    };

})(jQuery, Backbone, _);
