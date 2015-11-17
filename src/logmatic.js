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

  this.connect(f);
}

_.extend(Logmatic.prototype, {
  /**
   * Connect to the server (called by constructor)
   *
   * @param  {function} f
   */
  connect: function(f) {
    this.socket = net.createConnection(this.config.tcp, f);

    this.socket.on('timeout', function() {
      console.warn('Logmatic - connection timed out.');
    });

    this.socket.on('error', console.error.bind(console));

    this.socket.on('close', function(hadError) {
      console.warn('Logmatic - connection closed. With error ? ' + hadError);
    });
  },

  /**
   * Send log message
   *
   * @param  {object|any} message
   * @param  {function} f
   */
  log: function(message, f) {
    if (!_.isObject(message)) {
      message = {
        message: message
      };
    }

    try {
      message = JSON.stringify(_.defaultsDeep(message, this.config.defaultMessage));
    } catch (e) {
      console.error('Logmatic - error while parsing log message. Not sending', e);
      return f(e);
    }

    this.socket.write(this.config.token + ' ' + message + '\n', null, function() {
      f.apply(null, [null].concat(arguments));
    });
  },

  end: function() {
    this.socket.end();
  }
});

module.exports = Logmatic;
