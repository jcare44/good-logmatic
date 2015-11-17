'use strict';

var _ = require('lodash');
var net = require('net');

function Logmatic(config, f) {
  this.config = _.defaultsDeep(config, {
    tcp: {
      host: 'api.logmatic.io',
      port: 10514
    },
    defaultMessage: {}
  });

  if (!_.isString(this.config.token)) {
    throw new Error('The token wasn\'t specified');
  }

  this.socket = net.createConnection(this.config.tcp, f);
}

_.extend(Logmatic.prototype, {
  log: function(message, f) {
    if (!_.isObject(message)) {
      message = {
        content: message
      };
    }

    message = JSON.stringify(_.defaultsDeep(message, this.config.defaultMessage));

    this.socket.write(this.config.token + ' ' + message + '\n', null, f);
  },

  end: function() {
    this.socket.end();
  }
});

module.exports = Logmatic;
