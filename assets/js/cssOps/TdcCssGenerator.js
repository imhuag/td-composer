/**
 * Created by ra on 6/10/2016.
 */




function TdcCssGenerator () {
    'use strict';

    this.possitions = ['top', 'right', 'bottom', 'left'];

    // padding
    this.paddingTop = '';
    this.paddingRight = '';
    this.paddingBottom = '';
    this.paddingLeft = '';


    // margins
    this.marginTop = '';
    this.marginRight = '';
    this.marginBottom = '';
    this.marginLeft = '';

    // borders
    this.borderRadius = '';

    this.borderWidthTop = '';
    this.borderWidthRight = '';
    this.borderWidthBottom = '';
    this.borderWidthLeft = '';

    this.borderStyle = '';
    this.borderColor = '';

    this.backgroundColor = '';
    this.backgroundUrl = ''; // img url for background

    // used by setBackgroundStyle
    this._backgroundPosition = '';
    this._backgroundRepeat = '';
    this._backgroundSize = '';


    this.setBackgroundStyle = function (newStyle) {
        switch (newStyle) {
            case 'cover':
                this._backgroundPosition = 'center';
                this._backgroundRepeat = 'no-repeat';
                this._backgroundSize = 'cover';
                break;
            case 'contain':
                this._backgroundPosition = 'center';
                this._backgroundRepeat = 'no-repeat';
                this._backgroundSize = 'contain';
                break;
            case 'no-repeat':
                this._backgroundPosition = '0 0';
                this._backgroundRepeat = 'no-repeat';
                break;
            case 'repeat':
                this._backgroundPosition = '0 0';
                this._backgroundRepeat = 'repeat';
                break;

        }
    };


    /**
     *
     * @returns {string}
     */
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
        if (this._backgroundPosition !== '') {
            buffy += 'background-position: ' + this._backgroundPosition + ' !important;';
        }
        if (this._backgroundRepeat !== '') {
            buffy += 'background-repeat: ' + this._backgroundRepeat + ' !important;';
        }
        if (this._backgroundSize !== '') {
            buffy += 'background-size: ' + this._backgroundSize + ' !important;';
        }






        return '.vc_custom_' + Date.now() + ' {' +  buffy + '}';
    };






    /**
     * capitalize the first letter
     * @param string
     * @returns {string}
     * @private
     */
    this._cap = function (string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    };


    /**
     * generate the border css
     * @returns {*}
     * @private
     */
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



}




