requirejs.config({
    baseUrl: 'js',
    paths: {
        jquery: 'jquery-3.1.1.min',
        jqueryui: '../plugins/jqueryui/js/jquery-ui.min',
        colorpicker: '../plugins/colorpicker/js/colorpicker'
    },
    shim: {
        colorpicker: ['jquery'],
        jqueryui: ['jquery'],
    }
});
