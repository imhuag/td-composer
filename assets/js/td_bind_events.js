/**
 * Created by tagdiv on 11.02.2016.
 */

/* global jQuery:{} */

(function() {

    'use strict';

    //jQuery( '.tdc_row')
    //    .wrapAll( '<div class="tdc_rows"></div>' )
    //    .each(function(index, el ) {
    //        jQuery( el ).find( '.tdc_column' ).wrapAll( '<div class="tdc_columns"></div>' );
    //});
    //
    //// all tdc_inner_rows
    //// all tdc_elements
    //jQuery( '.tdc_column').each(function(index, el ) {
    //    jQuery( el ).find( '.tdc_inner_row').wrapAll( '<div class="tdc_inner_rows"></div>' );
    //    jQuery( el ).find( '.td_block_wrap').wrap( '<div class="tdc_element"></div>' );
    //});
    //
    //// all tdc_inner_columns
    //jQuery( '.tdc_inner_row').each(function(index, el ) {
    //    jQuery( el).find( '.tdc_inner_column').wrapAll( '<div class="tdc_inner_columns"></div>' );
    //});
    //
    //// all tdc_element of the tdc_inner_column, moved to the tdc_elements
    //jQuery( '.tdc_inner_column').each(function(index, el) {
    //    var tdc_element = jQuery( el).find( '.tdc_element');
    //
    //    if ( tdc_element.length ) {
    //        tdc_element.addClass( 'tdc_element_inner_column' ).wrapAll( '<div class="tdc_elements"></div>' );
    //    } else {
    //
    //        // add sortable area if empty inner column
    //        var innerMostElement = jQuery( el).find( '.wpb_wrapper' );
    //
    //        if ( innerMostElement.length ) {
    //            innerMostElement.append( '<div class="tdc_elements"></div>' );
    //        }
    //    }
    //});
    //
    //// all tdc_elements not already moved to tdc_elements, moved to their new tdc_elements (columns can have their elements, which are not inside of an inner row > inner column)
    //jQuery( '.tdc_column').each(function(index, el) {
    //
    //    var tdc_element = jQuery( el).find( '.tdc_element');
    //
    //    if ( tdc_element.length ) {
    //        tdc_element
    //            .not('.tdc_element_inner_column')
    //            .addClass( 'tdc_element_column' )
    //            .wrapAll( '<div class="tdc_elements"></div>' );
    //    } else {
    //
    //        // add sortable area if empty columns
    //        var innerMostElement = jQuery( el).find( '.wpb_wrapper' );
    //
    //        if ( innerMostElement.length ) {
    //            innerMostElement.append( '<div class="tdc_elements"></div>' );
    //        }
    //    }
    //});
    //
    //
    //
    //var tdc_elements = jQuery( '.tdc_elements');
    //
    //tdc_elements.sortable({
    //
    //    items: '> .tdc_element',
    //
    //    //helper: 'clone',
    //
    //    helper: function() {
    //        return jQuery( '<div class="tdc_element_mouse"></div>' );
    //    },
    //
    //    //opacity: 0.2,
    //    placeholder: 'tdc-sortable-placeholder',
    //    //forcePlaceholderSize: true,
    //
    //    cursorAt: {
    //        left: 50,
    //        top: 50
    //    },
    //
    //    cursor: 'move',
    //
    //    connectWith: '.tdc_elements',
    //
    //    appendTo: document.body,
    //
    //    over: function(event, ui) {
    //        jQuery( '.tdc_elements.ui-sortable > .tdc_element.ui-sortable-handle').filter(function() {
    //            return 'none' === jQuery(this).css( 'display' );
    //        }).addClass( 'tdc_element_moving' );
    //
    //        console.log( 'over' );
    //    },
    //    stop: function(event, ui) {
    //        jQuery( '.tdc_elements.ui-sortable > .tdc_element.ui-sortable-handle').removeClass( 'tdc_element_moving' );
    //    },
    //    out: function(event, ui) {
    //        console.log( 'out' );
    //    }
    //
    //});
    //
    //
    //alert( 'bind-events' );

    return;











    //var tdScreenMasque = jQuery( parent.document.getElementById("td_screen_masque") );
    //
    //tdScreenMasque.hover(
    //    function(event) {
    //        //tdScreenMasque.hide();
    //    }, function(event) {
    //
    //});

    var tdComposerMasque = jQuery( parent.document.getElementById("td_composer_masque") );

    //tdComposerMasque.find( '.td_masque_content');

    var tdComposerRow = jQuery( parent.document.getElementById("td_composer_row") );

    var tdComposerColumn = jQuery( parent.document.getElementById("td_composer_column") );

    var currentElement;

    var masqueShown = false;

    jQuery( '.wpb_wrapper').hover(
        function(event) {

            currentElement = jQuery(this);

            tdComposerMasque.show();
            tdComposerMasque.css({
                top: jQuery(this).offset().top,
                left: jQuery(this).offset().left,
                width: jQuery(this).outerWidth( true ),
                height: jQuery(this).outerHeight( true )
            });

            currentElement.addClass( 'no_hover' );
        },
        function(event) {

            tdComposerMasque.hide();
            //currentElement.removeClass( 'no_hover' );
    });

    tdComposerRow.hover(
        function(event) {

            if ( undefined !== currentElement ) {
                currentElement.addClass( 'no_hover' );

                tdComposerMasque.show();
                tdComposerMasque.css({
                    top: currentElement.offset().top,
                    left: currentElement.offset().left,
                    width: currentElement.outerWidth( true ),
                    height: currentElement.outerHeight( true )
                });
            }
        },
        function(event) {
            tdComposerMasque.hide();
            //currentElement.removeClass( 'no_hover' );
    });


    tdComposerMasque.hover(
        function(event) {

            if ( undefined !== currentElement ) {
                currentElement.addClass( 'no_hover' );

                tdComposerMasque.show();
                tdComposerMasque.css({
                    top: currentElement.offset().top,
                    left: currentElement.offset().left,
                    width: currentElement.outerWidth( true ),
                    height: currentElement.outerHeight( true )
                });
            }
        },
        function(event) {
            tdComposerMasque.hide();
            currentElement.removeClass( 'no_hover' );
        });


    //tdComposerMasque.find( '.td_masque_content').get(0).addEventListener( 'click', function(event) {
    //    event.stopPropagation();
    //    alert(11);
    //}, true);



    tdComposerRow.click(function(event) {
        alert( 'row click' );
    });

    tdComposerColumn.click(function(event) {
        event.stopPropagation();
        alert( 'column click' );
    });

})();
