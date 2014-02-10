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

    // Add global listeners
    $("body").on("click", ".themeSettings #pathsSettings .edit", function(evt) {
        console.log(ko.dataFor(this));
    })
    .on("click", ".themeSettings #pathsSettings .remove", function(evt) {
        console.log(ko.dataFor(this));
    });


    function open(settings) {
        var _settings  = $.extend(true, {}, settings._json);
        var _viewModel = koFactory(_settings);
        var $template  = $settings.clone();

        // Do knockout binding
        koFactory.bind(_viewModel, $template);
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

