/*
 * Brackets Themes Copyright (c) 2014 Miguel Castillo.
 *
 * Licensed under MIT
 */


define(function(require, exports, module) {

    var Dialog = brackets.getModule("widgets/Dialogs"),
        tmpl = {
            main: require("text!views/settings.html"),
            general: require("text!views/general.html"),
            paths: require("text!views/paths.html"),
            schedule: require("text!views/schedule.html")
        };

    var $settings = $(tmpl.main).addClass("themeSettings");
    $("#generalSettings", $settings).html(tmpl.general);
    $("#pathsSettings", $settings).html(tmpl.paths);
    $("#scheduleSettings", $settings).html(tmpl.schedule);

    function open(settings) {
        console.log(settings);
        var $template = $(Mustache.render($settings[0].outerHTML, settings._json));
        $("[data-toggle=tab].default", $template).tab("show");
        Dialog.showModalDialogUsingTemplate($template);
    }


    function close() {
    }


    return {
      open: open,
      close: close
    };
});

