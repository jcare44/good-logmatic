# good-logmatic

[Good](https://github.com/hapijs/good) Reporter for [Logmatic](http://logmatic.io/)

```
npm i -S good-logmatic
```

## Config

You need to pass down two config objects to good-logmatic for him to work.
- The first object represent [good-squeeze](https://github.com/hapijs/good-squeeze) events
- The second is defined with the following defaults

```javascript
{
  token: undefined, // Required : your Logmatic token
  tcp: {
    host: 'api.logmatic.io',
    port: 10514
  },
  retryTimeout: 5000, // when failling to reconnect, this timeout if used for each retry
  defaultMessage: {}, // add a default value to your log messages (like appname or hostname)
  logger: { //Define the logging functions used
    debug: _.noop,
    warn: console.warn.bind(console),
    error: console.error.bind(console)
  }
}
```
Notes:
- There is only one mandatory field for you to define : **your logmatic token**
- The `tcp` object is passed to node [net.connect](https://nodejs.org/api/net.html#net_socket_connect_options_connectlistener).

## Example

```javascript
var GoodLogmatic = require('good-logmatic');
hapi.register({
  register : require('good'),
  options : {
    reporters : [
      new GoodLogmatic({
        log : '*',
        request : '*',
        error : '*',
        response : '*',
        ops : '*',
      }, { // your config
        token : 'YOUR LOG TOKEN',
      }),
    ],
  },
}, function(err) {
  if (err) {
    throw err;
  }
});

```
