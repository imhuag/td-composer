/**
 * Created by tagdiv on 20.07.2016.
 */

/* global tdcAdminIFrameUI:{} */
/* global tdcIFrameData:{} */
/* global tdcDebug:{} */

/* global jQuery:{} */
/* global _:{} */

var tdcLivePanel;

(function( _, undefined ) {

    'use strict';

    tdcLivePanel = {

        $tdcAction: undefined,
        $tdcContent: undefined,

        $tdcIframeCover: undefined,

        _iframeSrc: undefined,

        $panel: undefined,


        init: function() {

            tdcLivePanel.$panel = jQuery( '#tdc-live-panel' );
            tdcLivePanel.$tdcAction = tdcLivePanel.$panel.find( '#tdc_action' );
            tdcLivePanel.$tdcContent = tdcLivePanel.$panel.find( '#tdc_content' );
            tdcLivePanel.$tdcCustomized = tdcLivePanel.$panel.find( '#tdc_customized' );

            tdcLivePanel.$tdcIframeCover = jQuery( '#tdc-iframe-cover' );

            // Switch the old iframe content withe the new iframe content.
            tdcLivePanel.$panel.submit({
                //test: 'testare'
            }, function( eventData ) {
                //tdcDebug.log( eventData );

                var $newTdcLiveIframe = jQuery( '#tdc-live-iframe-temp' );

                $newTdcLiveIframe.load(function() {

                    var $this = jQuery( this );

                    // Just call 'tdcAdminIFrameUI.checkIframe', the load function has been called because of the 'reload frame' browse operation
                    if ( 'tdc-live-iframe-temp' !== $this.attr( 'id' ) ) {
                        tdcAdminIFrameUI.checkIframe( $this );
                        return;
                    }

                    var $iframeToRemove = jQuery( '#tdc-live-iframe' );

                    tdcLivePanel.$tdcIframeCover.removeClass( 'tdc-iframe-cover-show' );
                    $iframeToRemove.addClass( 'tdc-remove-iframe' );

                    setTimeout(function() {

                        tdcLivePanel.$tdcIframeCover.hide();
                        $iframeToRemove.remove();

                        $newTdcLiveIframe.attr( 'id', 'tdc-live-iframe' );

                        tdcAdminIFrameUI.checkIframe( $newTdcLiveIframe );

                        tdcLivePanel.$panel.attr( 'action', '' );

                    }, 400);
                });
            });


            tdcLivePanel.$panel.on( 'change', '#tdc_page_template', function(event) {

                event.preventDefault();

                // Update the hidden field
                var $this = jQuery( this ),
                    wrapper_id = $this.data('control-id');

                jQuery( '#hidden_' + wrapper_id ).val( $this.closest( '.td-box' ).attr( 'id' ) );

                // Submit the panel
                tdcLivePanel.submit();
            });



            tdcLivePanel.$panel.on( 'click', '.td-radio-control-option', function(event) {

                event.preventDefault();

                // Update the hidden field
                var $this = jQuery( this ),
                    wrapper_id = $this.data( 'control-id' );

                jQuery( '#hidden_' + wrapper_id ).val( $this.data( 'option-value' ) );

                // Submit the panel
                tdcLivePanel.submit();
            });




            tdcLivePanel.$panel.on( 'click', '.tdc-panel-menu', function(event) {
                event.preventDefault();

                var $this = jQuery( this ),
                    menuId = $this.data( 'menu_id'),

                    // Some css is applied because of the 'tdc-menu-settings' get param
                    url = window.tdcAdminSettings.adminUrl + '/nav-menus.php?action=edit&menu=' + menuId + '&tdc-menu-settings=1',
                    $tdcMenuSettings = jQuery( '#tdc-menu-settings' ),
                    $currentIframeMenuSettings = $tdcMenuSettings.find( '#tdc-iframe-settings-menu-' + menuId );

                if ( $currentIframeMenuSettings.length ) {
                    $currentIframeMenuSettings.show();
                } else {
                    $tdcMenuSettings.addClass( 'tdc-dropped' );
                    $currentIframeMenuSettings = jQuery( '<iframe id="tdc-iframe-settings-menu-' + menuId + '" src="' + url + '" data-menu_id="' + menuId + '" scrolling="auto" style="width: 100%; height: 100%"></iframe>')
                        .load(function() {

                            // This is the jquery iframe document
                            var $iframeMenuSettingsContents = $currentIframeMenuSettings.contents();

                            // This is the iframe window
                            var iframeWindow = $currentIframeMenuSettings[0].contentWindow || $currentIframeMenuSettings[0].contentDocument;

                            $iframeMenuSettingsContents.find( 'body' ).addClass( 'tdc-menu-settings' );

                            //$tdcMenuSettings.addClass( 'menu-settings-available' );
                            $tdcMenuSettings.removeClass( 'tdc-dropped' );

                            $iframeMenuSettingsContents.find( '#wpadminbar').hide();
                            $iframeMenuSettingsContents.find( '#adminmenumain').hide();

                            $iframeMenuSettingsContents.find( '.delete-action').hide();
                            //$iframeMenuSettingsContents.find( '.publishing-action').hide();

                            $iframeMenuSettingsContents.find( '#wpbody-content').children().each( function( index, element ) {
                                var $element = jQuery( element );
                                if ( $element.hasClass( 'wrap' ) ) {
                                    $element.find( 'h1,h2,.manage-menus').hide();
                                } else {
                                    $element.hide();
                                }
                            });

                            $iframeMenuSettingsContents.find( 'input[name=save_menu]').val( 'Preview Menu' );

                            var $saveMenuSettings = $iframeMenuSettingsContents.find( 'input[name=save_menu]');

                            $saveMenuSettings.click(function(event) {
                                event.preventDefault();

                                // Important! The wpNavMenu.eventOnClickMenuSave must be called
                                // The position for the new added elements is computed
                                iframeWindow.wpNavMenu.eventOnClickMenuSave();

                                var $updateNavMenuForm = $iframeMenuSettingsContents.find( '#update-nav-menu' ),
                                    navMenuData = $updateNavMenuForm.serializeArray();

                                window.tdcAdminSettings.customized.menus[ 'existing_menu_' + menuId ] = JSON.stringify( navMenuData );

                                // Submit the panel
                                tdcLivePanel.submit();
                            });

                        });

                    $tdcMenuSettings.append( $currentIframeMenuSettings );
                }
                $currentIframeMenuSettings.siblings().hide();
                $tdcMenuSettings.show();

                $tdcMenuSettings.removeClass( 'menu-settings-available' );

                var $tdcCloseIframe = $tdcMenuSettings.find( '#tdc-close-iframe' );

                if ( ! $tdcCloseIframe.length ) {
                    $tdcCloseIframe = jQuery( '<div id="tdc-close-iframe"></div>' );

                    $tdcCloseIframe.click( function(event) {
                        $tdcMenuSettings.hide();
                        $currentIframeMenuSettings.hide();
                    });

                    $tdcMenuSettings.append( $tdcCloseIframe );
                }
                $tdcCloseIframe.show();
                $tdcMenuSettings.show();
            });
        },


        /**
         * Save all menus' settings.
         */
        saveMenuSettings: function() {

            var $tdcMenuSettings = jQuery( '#tdc-menu-settings' );

            $tdcMenuSettings.find( 'iframe').each(function( index, element ) {

                // This is the iframe window
                var iframeWindow = element.contentWindow || element.contentDocument;

                // Important! The wpNavMenu.eventOnClickMenuSave must be called
                // The position for the new added elements is computed
                iframeWindow.wpNavMenu.eventOnClickMenuSave();

                var $element = jQuery( element ),
                    menuId = $element.data( 'menu_id' ),
                    $updateNavMenuForm = $element.contents().find( '#update-nav-menu' ),
                    navMenuData = $updateNavMenuForm.serializeArray(),

                    // ajax data plain object
                    dataRequest = {};

                $updateNavMenuForm.find( 'input[name=nav-menu-data]').val( JSON.stringify( navMenuData ) );

                $updateNavMenuForm.find( 'input[type=hidden]').each(function( index, element) {
                    var $element = jQuery( element );
                    dataRequest[ $element.attr( 'name' ) ] = $element.val();
                });

                jQuery.ajax({
                    url: 'nav-menus.php?menu=' + menuId,
                    method: 'POST',
                    data: dataRequest
                });
            });
        },



        /**
         * Submit the live panel.
         * Prepare the new temporary iframe to replace the old iframe.
         */
        submit: function() {

            // Create new iframe

            var $tdcLiveIframe = jQuery( '#tdc-live-iframe' );

            if ( _.isUndefined( tdcLivePanel._iframeSrc ) ) {
                tdcLivePanel._iframeSrc = $tdcLiveIframe.attr( 'src' );
            }

            var uniqueId = 'uid_' + Math.floor((Math.random() * 10000) + 1) + '_' + Math.floor((Math.random() * 100) + 1 ),
                $newTdcLiveIframe = jQuery( '<iframe id="tdc-live-iframe-temp" name="' + uniqueId + '" scrolling="auto" src="about:blank" style="width: 100%; height: 100%" class="tdc-live-iframe-temp"></iframe>' );

            $newTdcLiveIframe.insertAfter( $tdcLiveIframe );


            tdcLivePanel.$panel.attr( 'target', uniqueId );
            tdcLivePanel.$panel.attr( 'action', tdcLivePanel._iframeSrc );

            tdcLivePanel.$tdcIframeCover.show();
            tdcLivePanel.$tdcIframeCover.addClass( 'tdc-iframe-cover-show' );


            // Get the new content (the post shortcode) and preview it
            var data = {
                error: undefined,
                getShortcode: ''
            };

            tdcIFrameData.getShortcodeFromData( data );

            if ( !_.isUndefined( data.error ) ) {
                tdcDebug.log( data.error );
            }

            if ( !_.isUndefined( data.getShortcode ) ) {

                tdcLivePanel.$tdcContent.val( data.getShortcode );

                // The new post content is set to the global 'window.tdcPostSettings.postContent'
                window.tdcPostSettings.postContent = data.getShortcode;
            }

            // This ensure that nothing will be save to the database
            // This field is restored to 'tdc_ajax_save_post' by the Save button
            tdcLivePanel.$tdcAction.val( 'preview' );

            tdcLivePanel.$tdcCustomized.val( JSON.stringify( window.tdcAdminSettings.customized ) );

            // Do a normal submit
            tdcLivePanel.$panel.submit();
        }
    };

    tdcLivePanel.init();

})( _ );
