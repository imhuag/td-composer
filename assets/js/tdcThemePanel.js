/**
 * Created by tagdiv on 20.07.2016.
 */

/* global jQuery:{} */
/* global _:{} */

var tdcThemePanel;

(function( _, undefined ) {

    'use strict';

    tdcThemePanel = {

        _themeSettings: undefined,

        $_panel: undefined,

        ref: undefined,

        init: function() {
            tdcThemePanel._themeSettings = window.tdcPostSettings.themeSettings;

            //console.log( tdcThemePanel._themeSettings );

            tdcThemePanel.$_panel = jQuery( '#tdc-theme-panel' );

            tdcThemePanel.ref = document.getElementById('tdc-live-iframe').src;

            jQuery( '#tdc_button_save_panel').click(function(event) {
                event.preventDefault();
                //
                //console.log( jQuery( this).closest('form').serialize() );

                var serializedData = jQuery( this).closest('form').serialize();

                jQuery.ajax({
                    type: "POST",
                    url: td_ajax_url,
                    data: serializedData,
                    success: function( response ) {
                        //console.log( response );
                        //alert('SAVED');
                        document.getElementById('tdc-live-iframe').src = document.getElementById('tdc-live-iframe').src + '&tdc_preview=1';
                    }
                });

                //document.getElementById('tdc-live-iframe').src = tdcThemePanel.ref + '&tdc_preview=1&serialized_data=' + btoa ( serializedData );
            });



            //tdcThemePanel.$_panel.on( 'change', 'input', function(event) {
            //    alert(1);
            //});

            //for ( var external_prop in tdcThemePanel._themeSettings ) {
            //
            //    var currentItem = tdcThemePanel._themeSettings[ external_prop ];
            //
            //    tdcThemePanel.$_panel.append( '<div>' + currentItem.name + '</div>' );
            //
            //    switch ( currentItem.type ) {
            //        case 'dropdown':
            //
            //            var bufferOptions = '',
            //                selected = '';
            //
            //            for ( var prop in currentItem.values ) {
            //                if ( '' === selected && parseInt( currentItem.values[prop].val ) === parseInt( currentItem.value ) ) {
            //                    selected = 'selected';
            //                } else {
            //                    selected = '';
            //                }
            //                bufferOptions += '<option value="' + currentItem.values[prop].val + '" ' + selected + '>' + currentItem.values[prop].text + '</option>';
            //            }
            //
            //            var buffer = '<select>' + bufferOptions + '<select>';
            //
            //            tdcThemePanel.$_panel.append( buffer );
            //            break;
            //
            //        case 'checkbox':
            //
            //            var class_wrapper = '',
            //                class_button;
            //
            //            if ( currentItem.value === currentItem.true_value ) {
            //                class_wrapper = 'td-checkbox-active';
            //                class_button = 'td-checbox-buton-active';
            //            }
            //
            //            buffer =
            //                '<div class="td-checkbox ' + class_wrapper + '" data-val-true="' + currentItem.true_value + '" data-val-false="' + currentItem.false_value + '">' +
            //                    '<div class="td-checbox-buton ' + class_button + '"></div>' +
            //                '</div>';
            //
            //            tdcThemePanel.$_panel.append( buffer );
            //            break;
            //    }
            //}
        }
    };

    tdcThemePanel.init();

})( _ );
