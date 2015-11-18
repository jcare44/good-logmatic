'use strict';

var _ = require('lodash');
var tls = require('tls');

function Logmatic(config, f) {
  this.retryCount = 0;
  this.isConnected = false;
  this.config = _.defaultsDeep(config, {
    tcp: {
      host: 'api.logmatic.io',
      port: 10515
    },
    retryTimeout: 5000,
    defaultMessage: {},
    logger: {
      debug: _.noop,
      info: console.log.bind(console),
      warn: console.warn.bind(console),
      error: console.error.bind(console)
    }
  });
  this.logger = this.config.logger;

  this.messageBuffer = [];

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
    this.socket = tls.connect(this.config.tcp, f);

    this.socket.on('secureConnect', function() {
      this.isConnected = true;
      if (this.retryCount > 1) {
        this.logger.info('Logmatic - reconnected.');
      } else {
        this.logger.debug('Logmatic - connected.');
      }
      this.retryCount = 0;

      while (this.messageBuffer.length) {
        this.sendMessage(this.messageBuffer.shift());
      }
    }.bind(this));

    this.socket.on('timeout', function() {
      this.logger.warn('Logmatic - connection timed out.');
    });

    this.socket.on('error', this.logger.error.bind(this.logger));

    this.socket.on('close', function() {
      this.isConnected = false;
      this.retryCount++;

      if(this.retryCount > 1) {
        setTimeout(function() {
          this.connect();
        }.bind(this), this.config.retryTimeout);
        this.logger.error('Logmatic - failling to reconnect', this.retryCount);
      } else {
        this.connect();
        this.logger.debug('Logmatic - connection closed.');
      }
    }.bind(this));
  },

  /**
   * Send log message
   *
   * @param  {object|any} message
   */
  log: function(message) {
    if (!_.isObject(message)) {
      message = {
        message: message
      };
    }

    try {
      message = JSON.stringify(_.defaultsDeep({}, message, this.config.defaultMessage));
    } catch (e) {
      return this.logger.error('Logmatic - error while parsing log message. Not sending', e);
    }

    if (this.isConnected) {
      this.sendMessage(message);
    } else {
      this.messageBuffer.push(message);
    }
  },

  /**
   * Send message over TCP to Logmatic
   * @param  {string} message
   */
  sendMessage: function(message) {
    this.socket.write(this.config.token + ' ' + message + '\n');
  },

  /**
   * End TCP connection with Logmatic
   */
  end: function() {
    this.socket.end();
  }
});

module.exports = Logmatic;
