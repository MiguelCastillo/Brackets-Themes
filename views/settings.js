/*
 * Brackets Themes Copyright (c) 2014 Miguel Castillo.
 *
 * Licensed under MIT
 */


define(function(require, exports, module) {

    var _ = brackets.getModule("thirdparty/lodash");
    var Dialog = brackets.getModule("widgets/Dialogs"),
        ko = require("lib/knockout-3.0.0"),
        koFactory = require("lib/ko.factory"),
        tmpl = {
            main: require("text!views/settings.html"),
            general: require("text!views/general.html"),
            paths: require("text!views/paths.html"),
            schedule: require("text!views/schedule.html")
        };

    // Make sure koFactory get a reference to ko...
    koFactory.ko = ko;

    // Setup all the templates so that we can easily render them with Mustache
    var $settings = $(tmpl.main).addClass("themeSettings");
    $("#generalSettings", $settings).html(tmpl.general);
    $("#pathsSettings", $settings).html(tmpl.paths);
    $("#scheduleSettings", $settings).html(tmpl.schedule);


    function getViewModel(settings) {
        var viewModel = koFactory($.extend(true, {}, settings._json));

        viewModel.addPath = function() {
            //viewModel.paths.remove(this);
        };

        viewModel.editPath = function() {
            console.log(this);
        };

        viewModel.removePath = function() {
            viewModel.paths.remove(this);
        };

        return viewModel;
    }


    function open(settings) {
        var viewModel = getViewModel(settings);
        var $template = $settings.clone();

        // Do knockout binding
        koFactory.bind(viewModel, $template);
        Dialog.showModalDialogUsingTemplate($template);
        $("[data-toggle=tab].default", $template).tab("show");
    }


    function close() {
    }


    return {
      open: open,
      close: close
    };
});

