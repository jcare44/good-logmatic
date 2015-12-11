'use strict';

// var flat = require('flat');
var _ = require('lodash');
var utils = require('good/lib/utils');
var Squeeze = require('good-squeeze').Squeeze;
var Logmatic = require('node-logmatic');

/**
 * Constructor
 *
 * @param {object} events  List of events to log https://github.com/hapijs/good
 * @param {object} config
 */
function GoodLogmatic(events, config) {
  if (! (this instanceof GoodLogmatic)) {
    return new GoodLogmatic(events, config);
  }

  this.logmatic = new Logmatic(config);
  this.squeeze = Squeeze(events);
}

GoodLogmatic.prototype.init = function(readstream, emitter, callback) {
  readstream.pipe(this.squeeze);

  this.squeeze.on('data', function(item) {
    if (item instanceof utils.GreatResponse) {
      // For best use with logmatic, you probably want to enable the `request`
      // log event instead of using this, as it is very difficult to query.
      item = _.omit(item, 'log');
    }

    this.logmatic.log(item);
  }.bind(this));

  emitter.on('stop', function() {
    this.logmatic.end();
  }.bind(this));

  callback();
};

module.exports = GoodLogmatic;
