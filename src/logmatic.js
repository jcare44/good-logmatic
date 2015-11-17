'use strict';

var _ = require('lodash');
var net = require('net');

function Logmatic(config, f) {
  this.retryCount = 0;
  this.isConnected = false;
  this.config = _.defaultsDeep(config, {
    tcp: {
      host: 'api.logmatic.io',
      port: 10514
    },
    retryTimeout: 5000,
    defaultMessage: {}
  });

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
    this.socket = net.createConnection(this.config.tcp, f);

    this.socket.on('connect', function() {
      this.isConnected = true;
      this.retryCount = 0;

      while (this.messageBuffer.length) {
        this.sendMessage(this.messageBuffer.shift());
      }

      console.log('Logmatic - connected.');
    }.bind(this));

    this.socket.on('timeout', function() {
      console.warn('Logmatic - connection timed out.');
    });

    this.socket.on('error', console.error.bind(console));

    this.socket.on('close', function() {
      this.isConnected = false;
      this.retryCount++;

      if(this.retryCount > 1) {
        setTimeout(function() {
          this.connect();
        }.bind(this), this.config.retryTimeout);
        console.error('Logmatic - failling to reconnect', this.retryCount);
      } else {
        this.connect();
        console.log('Logmatic - connection closed.');
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
      return console.error('Logmatic - error while parsing log message. Not sending', e);
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
