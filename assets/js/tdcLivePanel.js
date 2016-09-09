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

        $_iframeCloseButton: undefined,
        $_iframeApplyButton: undefined,
        $_iframeOkButton: undefined,


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

                var $this = jQuery( this ),
                    menuId = $this.data( 'menu_id'),
                    menuName = $this.data( 'menu_name'),

                    // Some css is applied because of the 'tdc-menu-settings' get param
                    url = window.tdcAdminSettings.adminUrl + '/nav-menus.php?action=edit&menu=' + menuId + '&tdc-menu-settings=1',

                    // The wrapper of the iframes
                    $tdcMenuSettings = jQuery( '#tdc-menu-settings' ),

                    // The iframe id
                    currentIframeId = 'tdc-iframe-settings-menu-' + menuId,

                    $currentIframeMenuSettings = $tdcMenuSettings.find( '#' + currentIframeId );



                // Create the saved menu content for this iframe (if it's not already created)

                var currentIframeDataId = currentIframeId + '-data',
                    $_currentIframeData = $tdcMenuSettings.find( '#' + currentIframeDataId );

                if ( ! $_currentIframeData.length ) {
                    $_currentIframeData = jQuery( '<div id="' + currentIframeDataId + '" style="display: none"></div>' );
                    $tdcMenuSettings.append( $_currentIframeData );
                }

                $tdcMenuSettings.show();

                if ( $currentIframeMenuSettings.length ) {
                    $currentIframeMenuSettings.show();

                    tdcLivePanel._setIframeInterface( {
                        type: 'menu',
                        menuId: menuId,
                        menuName: menuName
                    } );

                    tdcLivePanel._synchronizeIframeMenuData( currentIframeId );

                } else {
                    $tdcMenuSettings.addClass( 'tdc-dropped' );

                    $currentIframeMenuSettings = jQuery( '<iframe id="' + currentIframeId + '" class="tdc-iframe-settings-menu" src="' + url + '" data-menu_id="' + menuId + '" scrolling="auto" style="width: 100%; height: 100%"></iframe>')
                        .load(function() {

                            // This is the jquery iframe document
                            var $iframeMenuSettingsContents = $currentIframeMenuSettings.contents();

                            $iframeMenuSettingsContents.find( 'body' ).addClass( 'tdc-menu-settings' );

                            $tdcMenuSettings.removeClass( 'tdc-dropped' );

                            tdcLivePanel._setIframeInterface({
                                type: 'menu',
                                menuId: menuId,
                                menuName: menuName
                            });

                            tdcLivePanel._synchronizeIframeMenuData( currentIframeId );
                        });

                    $tdcMenuSettings.children( '.content' ).append( $currentIframeMenuSettings );
                }

                // Hide and cancel the siblings of the current iframe
                $currentIframeMenuSettings.siblings( '.tdc-iframe-settings-menu' ).each(function(index, element) {
                    var $element = jQuery( element );
                    if ( $element.is( ':visible' ) ) {
                        tdcLivePanel._synchronizeIframeMenuData( $element.attr( 'id' ) );
                        $element.hide();
                    }
                });
            });


            // initialize the content of the tdcMenuSettings (the iframe buttons)
            tdcLivePanel._setIframeInterface();
        },


        /**
         * Synchronize menus of iframes with their corresponding data
         * If the content of the data is empty, it will be populated with the current content of the $updateNavMenu
         * If the content of the data is not empty, its content will populate the $updateNavMenu, and the wpNavMenu is initialized
         *
         * @param currentIframeId
         * @private
         */
        _synchronizeIframeMenuData: function( currentIframeId ) {

            var currentIframeDataId = currentIframeId + '-data',
                $tdcMenuSettings = jQuery( '#tdc-menu-settings' ),
                $currentIframeData = $tdcMenuSettings.find( '#' + currentIframeDataId ),
                contentHtml = $currentIframeData.html(),
                $currentIframeMenuSettings = $tdcMenuSettings.find( '#' + currentIframeId ),
                $updateNavMenu = $currentIframeMenuSettings.contents().find( '#update-nav-menu' );

            if ( '' === contentHtml ) {
                $currentIframeData.html( $updateNavMenu.contents().clone() );
            } else {
                $updateNavMenu.html( contentHtml );
                var iframeWindow = $currentIframeMenuSettings[0].contentWindow || $currentIframeMenuSettings[0].contentDocument;
                tdcLivePanel._reinitWpNavMenu( iframeWindow );
            }
        },


        /**
         * Reinit the wpNavMenu.
         * Important! Actually we need to call only the 'initSortables' function, as the init function does. But because it uses the local 'api' variable,
         * we can not make this 'api' variable to reference the new content.
         *
         * For doing this, we switch off all functions of init, except this 'initSortables'
         *
         * @param iframeWindow
         * @private
         */
        _reinitWpNavMenu: function( iframeWindow ) {

            iframeWindow.menus.oneThemeLocationNoMenus = false;

            // We need to reinit the wpNavMenu, because the menu operations was removed
            iframeWindow.wpNavMenu.jQueryExtensions = function() {};
            iframeWindow.wpNavMenu.attachMenuEditListeners = function() {};
            iframeWindow.wpNavMenu.attachQuickSearchListeners = function() {};
            iframeWindow.wpNavMenu.attachThemeLocationsListeners = function() {};
            iframeWindow.wpNavMenu.attachMenuSaveSubmitListeners = function() {};
            iframeWindow.wpNavMenu.attachTabsPanelListeners = function() {};
            iframeWindow.wpNavMenu.attachUnsavedChangesListener = function() {};
            iframeWindow.wpNavMenu.initManageLocations = function() {};
            iframeWindow.wpNavMenu.initAccessibility = function() {};
            iframeWindow.wpNavMenu.initToggles = function() {};
            iframeWindow.wpNavMenu.initPreviewing = function() {};

            iframeWindow.wpNavMenu.init();
        },



        /**
         *
         */
        _setIframeInterface: function( data ) {

            var $tdcMenuSettings = jQuery( '#tdc-menu-settings' ),
                $tdcMenuSettingsTitle = $tdcMenuSettings.find( '#title' );


            // Set the interface events

            if ( _.isUndefined( tdcLivePanel.$_iframeCloseButton ) ) {
                tdcLivePanel.$_iframeCloseButton = $tdcMenuSettings.find('#tdc-iframe-close-button');
                tdcLivePanel.$_iframeCloseButton.click(function (event) {

                    var $this = jQuery(this),

                    // Current iframe
                        $currentIframeMenuSettings = jQuery('#' + $this.data('current_iframe')),

                    // Current iframe data
                        $currentIframeData = jQuery('#' + $this.data('current_iframe') + '-data'),

                    // Content html of the current iframe data
                        contentHtml = $currentIframeData.html(),

                    // #update-nav-menu of the current iframe
                        $updateNavMenu = $currentIframeMenuSettings.contents().find('#update-nav-menu');

                    if ('' !== contentHtml) {
                        $updateNavMenu.html(contentHtml);

                        var iframeWindow = $currentIframeMenuSettings[0].contentWindow || $currentIframeMenuSettings[0].contentDocument;

                        // We need to reinit the wpNavMenu, because the menu operations was removed
                        tdcLivePanel._reinitWpNavMenu(iframeWindow);

                        $currentIframeData.html('');
                    }

                    $tdcMenuSettings.hide();
                    $currentIframeMenuSettings.hide();
                });
            }

            if ( _.isUndefined( tdcLivePanel.$_iframeApplyButton ) ) {
                tdcLivePanel.$_iframeApplyButton = $tdcMenuSettings.find( '#tdc-iframe-apply-button' );
                tdcLivePanel.$_iframeApplyButton.click( function(event) {
                    _saveIframeState( jQuery( this ).data( 'current_iframe' ), false );
                    _previewMenuSettings( this );
                });
            }

            if ( _.isUndefined( tdcLivePanel.$_iframeOkButton ) ) {
                tdcLivePanel.$_iframeOkButton = $tdcMenuSettings.find('#tdc-iframe-ok-button');
                tdcLivePanel.$_iframeOkButton.click(function (event) {
                    _saveIframeState(jQuery(this).data('current_iframe'), true);
                    _previewMenuSettings(this);
                });
            }



            if ( ! _.isUndefined( data ) ) {
                if ( ! _.isUndefined( data.type ) ) {
                    switch ( data.type ) {
                        case 'menu':

                            var menuId = data.menuId,
                                menuName = data.menuName;

                            $tdcMenuSettingsTitle.html( 'Menu: <label>' + menuName + '</label>' );

                            tdcLivePanel.$_iframeCloseButton.data( 'current_iframe', 'tdc-iframe-settings-menu-' + menuId );
                            tdcLivePanel.$_iframeApplyButton.data( 'current_iframe', 'tdc-iframe-settings-menu-' + menuId );
                            tdcLivePanel.$_iframeOkButton.data( 'current_iframe', 'tdc-iframe-settings-menu-' + menuId );

                            tdcLivePanel.$_iframeCloseButton.data( 'current_menu', menuId );
                            tdcLivePanel.$_iframeApplyButton.data( 'current_menu', menuId );
                            tdcLivePanel.$_iframeOkButton.data( 'current_menu', menuId );

                            break;
                    }
                }

                tdcLivePanel.$_iframeCloseButton.show();
                tdcLivePanel.$_iframeApplyButton.show();
                tdcLivePanel.$_iframeOkButton.show();

            } else {

                tdcLivePanel.$_iframeCloseButton.data( 'current_iframe', '' );
                tdcLivePanel.$_iframeApplyButton.data( 'current_iframe', '' );
                tdcLivePanel.$_iframeOkButton.data( 'current_iframe', '' );

                tdcLivePanel.$_iframeCloseButton.data( 'current_menu', '' );
                tdcLivePanel.$_iframeApplyButton.data( 'current_menu', '' );
                tdcLivePanel.$_iframeOkButton.data( 'current_menu', '' );

                tdcLivePanel.$_iframeCloseButton.hide();
                tdcLivePanel.$_iframeApplyButton.hide();
                tdcLivePanel.$_iframeOkButton.hide();
            }



            /**
             * Local helper function
             * Save the state of the iframe
             *
             * @param iframe_id - iframe dom id
             * @param close_iframe - hide the iframe and its container
             * @private
             */
            function _saveIframeState( iframe_id, close_iframe ) {

                // Current iframe
                var $currentIframeMenuSettings = jQuery( '#' + iframe_id ),

                // Current iframe contents
                    $iframeMenuSettingsContents = $currentIframeMenuSettings.contents(),

                // Current iframe data
                    $currentIframeData = jQuery( '#' + iframe_id + '-data' );


                // Preset the input fields, otherwise clone or html jquery methods does not copy the real values

                $iframeMenuSettingsContents.find( '#update-nav-menu' ).find( 'select[name*=td_mega_menu_cat]' ).each(function( index, element ) {
                    var $element = jQuery( element ),
                        $option = $element.find( 'option' ),
                        $selectedOption = $element.find( 'option:selected' ),
                        $firstOption = $element.find( 'option:first' );

                    if ( '' === $element.val() ) {
                        $option.removeAttr( 'selected' );
                        $firstOption.attr( 'selected', 'selected' );
                    } else {
                        $option.each(function(index_option, element_option) {
                            var $element_option = jQuery( element_option);
                            if ( $element.val() === $element_option.attr( 'value' ) ) {
                                $element_option.attr( 'selected', 'selected' );
                            } else {
                                $element_option.removeAttr( 'selected' );
                            }
                        });
                    }
                });

                $iframeMenuSettingsContents.find( '#update-nav-menu').find( 'input').each(function( index, element ) {
                    var $element = jQuery( element );
                    $element.attr( 'value', $element.val() );
                });

                // Clone the content
                $currentIframeData.html( $iframeMenuSettingsContents.find( '#update-nav-menu' ).contents().clone() );

                // Hide the iframe if it's necessary
                if ( true === close_iframe ) {
                    $tdcMenuSettings.hide();
                    $currentIframeMenuSettings.hide();
                }
            }


            /**
             * Local helper function
             * Load the page with the new menu settings without saving them
             *
             * @param sender - the button
             * @private
             */
            function _previewMenuSettings( sender ) {

                var $this = jQuery( sender ),

                    currentIframeId = $this.data( 'current_iframe' ),

                    currentMenuId = $this.data( 'current_menu' ),

                // Current iframe
                    $currentIframeMenuSettings = jQuery( '#' + currentIframeId ),

                // Current iframe contents
                    $iframeMenuSettingsContents = $currentIframeMenuSettings.contents(),

                // This is the iframe window
                    iframeWindow = $currentIframeMenuSettings[0].contentWindow || $currentIframeMenuSettings[0].contentDocument;

                // Important! The wpNavMenu.eventOnClickMenuSave must be called
                // The position for the new added elements is computed
                iframeWindow.wpNavMenu.eventOnClickMenuSave();

                var $updateNavMenuForm = $iframeMenuSettingsContents.find( '#update-nav-menu' ),
                    navMenuData = $updateNavMenuForm.serializeArray();

                window.tdcAdminSettings.customized.menus[ 'existing_menu_' + currentMenuId ] = JSON.stringify( navMenuData );

                // Submit the panel
                tdcLivePanel.submit();
            }
        },


        /**
         * Save all menus' settings.
         */
        saveMenuSettings: function() {

            var $tdcMenuSettings = jQuery( '#tdc-menu-settings' );

            $tdcMenuSettings.find( 'iframe').each(function( index, element ) {

                var $element = jQuery( element );

                tdcLivePanel._synchronizeIframeMenuData( $element.attr( 'id' ) );

                // This is the iframe window
                var iframeWindow = element.contentWindow || element.contentDocument;

                // Important! The wpNavMenu.eventOnClickMenuSave must be called
                // The position for the new added elements is computed
                iframeWindow.wpNavMenu.eventOnClickMenuSave();

                var menuId = $element.data( 'menu_id' ),
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


function preinit($updateNavMenu) {
    api.menuList = $updateNavMenu.find('#menu-to-edit');
    api.targetList = api.menuList;
}