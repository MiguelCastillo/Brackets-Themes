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
        var split = color.match(/0x([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})/);
        var splitValue;

        if (split && split.length > 0) {
            if (split.length > 2) {
                colorProps.color = split[4] + split[3] + split[2];
            }
            if (split.length > 1) {
                splitValue = Number(split[1]);
                if (splitValue > 0) {
                    colorProps.opacity = splitValue;
                }
            }
        }
        else {
            colorProps.color = color;
        }
        return colorProps;
    }


    // From mirror-style
    function splitHexAColor (color) {
        var colorProps = {};
        var hex = color.replace(/0x/, '');
        var a = (hex & 0xFF000000) >> 24;
        var r = (hex & 0xFF0000) >> 16;
        var g = (hex & 0xFF00) >> 8;
        var b = (hex & 0xFF);
        colorProps.color = r.toString(16) + g.toString(16) + b.toString(16);
        colorProps.opacity = Number(a.toString(16));
        return colorProps;
    }


    // From mirror-style
    function readItem (item) {
        var prop = {};
        if (item.length > 0) {
            var backgroundValues = splitColor(item.attr('background'));
            var foregroundValues = splitColor(item.attr('foreground'));
            prop = {
                color: '#' + foregroundValues.color,
                background: '#' + backgroundValues.color,
                opacity: backgroundValues.opacity,
                bold: item.attr('boldfont') === 'Yes' ? true : false
            };
        }
        return prop;
    }


    // Small bits from mirror-style
    function parse (themeName, content) {
        var deferred = $.Deferred(),
            $content = $(content),
            props = {};
        var lessParser, currentLessTmpl;

        $('Items Item', $content).each(function (i, item) {
            var $item = $(item),
                name = $item.attr('name');
            var prop = readItem($item);
            props[ cleanup(name) ] = prop;
        });

        props.name = themeName;
        currentLessTmpl = _.template(mustacheTmpl, props) + lessTmpl;
        lessParser = new (less.Parser)();

        lessParser.parse(currentLessTmpl, function (e, tree) {
            deferred.resolve({
                name: themeName,
                fileName: themeName + ".css",
                content: tree.toCSS()
            });
        });

        return deferred.promise();
    }


    function loadFile(fileName) {
        var file = FileSystem.getFileForPath (fileName);
        var deferred = $.Deferred();

        try {
            file.read(function( err, content ) {
                if ( err ) {
                    deferred.reject(err);
                    return;
                }

                var themeName = fileName.split("/").pop().split(".").shift();
                parse(themeName, content).done(deferred.resolve);
            });
        }
        catch(ex) {
            deferred.reject(false);
        }

        return deferred.promise();
    }


    return {
        "importFile": loadFile
    };

});
