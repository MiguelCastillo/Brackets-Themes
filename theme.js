/*
 * Brackets Themes Copyright (c) 2014 Miguel Castillo.
 *
 * Licensed under MIT
 */


/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global define, $, brackets, window, CodeMirror */

define(function (require, exports, module) {
    "use strict";

    /**
    *  Theme object to encasulate all the logic in one pretty bundle.
    *  The theme will self register when it is created.
    *
    *  * Required settings are fileName and path
    *
    * @constructor
    */
    function Theme(options) {
        var _self = this;
        $.extend(_self, options);

        // Create a display and a theme name from the file name
        _self.displayName = toDisplayName(_self.fileName);
        _self.name = _self.fileName.substring(0, _self.fileName.lastIndexOf('.'));
    }


    /**
    *  Takes all dashes and converts them to white spaces...
    *  Then takes all first letters and capitalizes them.
    */
    function toDisplayName (name) {
        name = name.substring(0, name.lastIndexOf('.')).replace(/-/g, ' ');
        var parts = name.split(" ");

        $.each(parts.slice(0), function (index, part) {
            parts[index] = part[0].toUpperCase() + part.substring(1);
        });

        return parts.join(" ");
    }


    return Theme;
});

