/**
 * koFactory Copyright (c) 2014 Miguel Castillo.
 * Licensed under MIT
 *
 * https://github.com/MiguelCastillo/koFactory
 */

define(function() {
  "use strict";


  function factory(data, target, settings) {
    return factory.serialize( data, target, settings );
  }


  factory.primitiveTypes = {
    "undefined": true,
    "boolean": true,
    "number": true,
    "string": true
  };


  factory.getType = function(data) {
    if (data instanceof Array) {
      return "array";
    }

    var typeOf = typeof data;
    if (factory.primitiveTypes.hasOwnProperty(typeOf)) {
      return "primitive";
    }
    else if (typeOf === "object") {
      return "object";
    }

    throw "Invalid data type";
  };


  factory.array = function (data, target, settings) {
    var i = 0,
        length = data.length,
        type = false,
        update = factory.ko.isObservable(target);

    settings = settings || {};

    if (length) {
      // We only need to get the type once; items in an
      // arrays are of the same data type.
      type = factory.getType(data[0]);
    }

    for (; i < length; i++) {
      data[i] = factory[type](data[i]);
    }

    if (update === true) {
      target(data);
      return target;
    }

    return factory.ko.observableArray(data);
  };


  factory.primitive = function(data, target, settings) {
    var update = factory.ko.isObservable(target);
    if (update === true) {
      target(data);
      return target;
    }

    return factory.ko.observable(data);
  };


  factory.object = function(data, target, settings) {
    target = target || {};
    settings = settings || {};
    var type, item, value, update = false;

    for (var i in data) {
      // If i isn't a property of data, then we will continue on to the next property
      if (data.hasOwnProperty(i) === false) {
        continue;
      }

      update = target.hasOwnProperty(i);
      item   = data[i];
      type   = factory.getType(item);
      value  = factory[type](item, target[i], settings[i]);

      if (update === false) {
        target[i] = value;
      }
    }

    return target;
  };


  /**
  * @param <Object> data - is the new data that will either generate a new view model
  *                 or will be merged into target.
  * @param <Object> target - optional object where data will be copied into.
  */
  factory.serialize = function(data, target, settings) {
    var type = factory.getType(data);
    return factory[type](data, target, settings);
  };


  factory.deserialize = function(data) {
    return factory.ko.toJS(data);
  };


  factory.bind = function(el, viewModel) {
    if (factory.$) {
      factory.$(el).each(function(index, iel) {
        factory.ko.applyBindings(viewModel, iel);
      });
    }
    else {
      factory.ko.applyBindings(viewModel, el);
    }
  };


  factory.unbind = function(el) {
    if (factory.$) {
      factory.$(el).each(function(index, iel) {
        factory.ko.cleanNode(iel);
      });
    }
    else {
      factory.ko.cleanNode(el);
    }
  };

  return factory;
});
