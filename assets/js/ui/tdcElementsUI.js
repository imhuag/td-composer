/**
 * Created by tagdiv on 24.03.2016.
 */

/* global jQuery:{} */
/* global Backbone:{} */
/* global _:{} */

/* global tdcAdminWrapperUI:{} */
/* global tdcAdminIFrameUI:{} */
/* global tdcOperationUI:{} */

// Important! THIS FILE IS SUSCEPTIBLE TO BE REMOVED FROM THE PROJECT BECAUSE IT BECAME USELESS

var tdcElementsUI;

(function(jQuery, backbone, _, undefined) {

    'use strict';

    tdcElementsUI = {

        // The 'tdc-elements' elements
        tdcElements: undefined,


        init: function () {

            tdcElementsUI.tdcElements = tdcOperationUI.iframeContents.find( '.tdc-elements' );

            tdcElementsUI.tdcElements.each(function( index, element ) {

                tdcElementsUI.bindElementList( jQuery( element ) );
            });
        },


        bindElementList: function( $element ) {


            $element.mousemove(function( event ) {
                //tdcDebug.log( 'tdc-elements mouse move' );

                //// Respond only if dragged element is 'tdc-element' or inner row
                //if ( tdcOperationUI.isElementDragged() || ( tdcOperationUI.isInnerRowDragged() && $element.hasClass( 'tdc-element-column' ) ) ) {
                //    //tdcDebug.log( 'element mouse move' );

                event.preventDefault();
                //    event.stopPropagation();
                //
                //    tdcOperationUI.showHelper( event );
                //
                //    tdcOperationUI.setCurrentElementOver( $element );
                //    tdcElementUI.positionElementPlaceholder( event );
                //}

            }).mouseenter( function( event ) {
                //tdcDebug.log( 'tdc-elements mouse enter' );

                //// Respond only if dragged element is 'tdc-element' or inner row
                //if ( tdcOperationUI.isElementDragged() || ( tdcOperationUI.isInnerRowDragged() && $element.hasClass( 'tdc-element-column' ) ) ) {
                //    //tdcDebug.log( 'element mouse enter' );

                event.preventDefault();

                //    tdcOperationUI.setCurrentElementOver( $element );
                //    tdcElementUI.positionElementPlaceholder( event );
                //}

            }).mouseleave(function (event) {
                //tdcDebug.log( 'tdc-elements mouse leave' );

                // Respond only if dragged element is 'tdc-element' or inner row
                //if ( tdcOperationUI.isElementDragged() || ( tdcOperationUI.isInnerRowDragged() && $element.hasClass( 'tdc-element-column' ) ) ) {
                //    //tdcDebug.log( 'element mouse move' );
                //
                event.preventDefault();
                //    event.stopPropagation();
                //
                //    tdcOperationUI.showHelper( event );
                //
                //    tdcOperationUI.setCurrentElementOver( $element );
                //    tdcElementUI.positionElementPlaceholder( event );
                //}
            });
        }
    };

})( jQuery, Backbone, _ );