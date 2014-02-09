/*
 * Brackets Themes Copyright (c) 2014 Miguel Castillo.
 *
 * Licensed under MIT
 */


define(function(require, exports, module) {

    var Dialog = brackets.getModule("widgets/Dialogs");

    function open() {
        Dialog.showModalDialogUsingTemplate("<div>Hello World</div>");
    }

    return {
      open: open,
      close: close
    };
});

