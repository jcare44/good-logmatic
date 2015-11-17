# good-logmatic

[Good](https://github.com/hapijs/good) Reporter for [Logmatic](http://logmatic.io/)

## npm

```
npm i -S good-logmatic
```

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
      }, {
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
