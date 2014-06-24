/**
 * Brackets Themse Copyright (c) 2014 Miguel Castillo.
 *
 * Licensed under MIT
 *
 * Parts are extracted from mirror-style https://github.com/bradgearon/mirror-style
 * Thanks Brad!!!
*/


define(function(require) {

    var _ = brackets.getModule("thirdparty/lodash");
    var FileSystem   = brackets.getModule("filesystem/FileSystem");
    var mustacheTmpl = require("text!mirror-style/variables.mustache"),
        lessTmpl     = require("text!mirror-style/template.less");


    function cleanup (name) {
        return name
            .replace(/\s+\w?/g, function(match) {
                return match.replace(/\s*/, "").toUpperCase();
            })
            .replace(/\W/g, "");
    }


    // From mirror-style
    function splitColor (color) {
        var colorProps = {};
        // AA BB GG RR (VS reverses BB && RR bits...)
        var split = color.match(/0x([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})/) || [];
        var opacity;

        // Get rid of regex match.
        split.shift();

        // We should have four channels...  But, we only care whether or not the 'alpha'
        // channel is 2.  If it is 2, then we skip the color.
        if (split.length === 4) {
            opacity            = Number(split[0]);
            colorProps.color   = [split[3], split[2], split[1]];
            colorProps.rgba    = [parseInt(split[3], 16), parseInt(split[2], 16), parseInt(split[1], 16)];
            colorProps.inherit = opacity === 2;
        }

        return colorProps;
    }


    function colorString(input) {
        if (input.inherit) {
            return "inherit";
        }

        var func = input.rgba.length === 3 ? 'rgb' : 'rgba';
        return func + '(' + input.rgba.join(',') + ')';
    }


    // From mirror-style
    function readItem (item) {
        var backgroundValues = splitColor(item.attr('background'));
        var foregroundValues = splitColor(item.attr('foreground'));

        return {
            color: colorString(foregroundValues),
            background: colorString(backgroundValues),
            bold: item.attr('boldfont') === 'Yes' ? true : false
        };
    }


    // Small bits from mirror-style
    function parse (themeName, content) {
        var deferred = $.Deferred(),
            $content = $(content),
            props = {};
        var lessParser, currentLessTmpl;

        $('Items > Item', $content).each(function (i, item) {
            var $item = $(item),
                name  = $item.attr('name'),
                prop  = readItem($item);

            if ($item.length && (prop.color || prop.background)) {
                props[ cleanup(name) ] = prop;
            }
        });

        props.name = themeName;
        lessParser = new (less.Parser)();

        try {
            currentLessTmpl = _.template(mustacheTmpl, props) + lessTmpl;
            lessParser.parse(currentLessTmpl, function (e, tree) {
                deferred.resolve({
                    name: themeName,
                    fileName: themeName + ".css",
                    content: tree.toCSS()
                });
            });
        }
        catch(ex) {
            deferred.reject(ex);
        }

        return deferred.promise();
    }


    function loadFile(fileName) {
        var file = FileSystem.getFileForPath (fileName);
        var deferred = $.Deferred();

        try {
            file.read(function(err, content) {
                if (err) {
                    deferred.reject(err);
                    return;
                }

                var themeName = fileName.split("/").pop().split(".").shift();
                parse(themeName, content)
                    .done(deferred.resolve)
                    .fail(deferred.reject);
            });
        }
        catch(ex) {
            deferred.reject(ex);
        }

        return deferred.promise();
    }


    return {
        "importFile": loadFile
    };

});
