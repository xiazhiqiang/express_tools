define(['jquery'], function ($) {

    //--------------------------------辅助函数-----------------------------------

    /**
     * rgb转hex
     * @param rgb
     * @returns {*}
     */
    var rgb2hex = function (rgb) {
        try {
            if (typeof rgb === 'string' && rgb.indexOf('rgb(') !== -1) {
                rgb = ('' + rgb).match(/\d+/g);
            }

            if (rgb instanceof Array) {
                return '#' + [Number(rgb[0]).toString(16), Number(rgb[1]).toString(16), Number(rgb[2]).toString(16)].join('');
            }

            throw new Error('Param type error');
        } catch (e) {
            return '';
        }
    };

    /**
     * 产生随机数
     * @param length
     * @param seed
     * @returns {string}
     */
    var randomChar = function (length, seed) {
        seed = seed || '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

        var charArray = [];
        while (length > 0) {
            charArray.push(seed.charAt(Math.ceil(Math.random() * (seed.length - 1))));
            length -= 1;
        }

        return charArray.join('');
    };

    return {
        rgb2hex: rgb2hex,
        randomChar: randomChar,
    };
})