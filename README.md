# node-gps

Read GPS data from GPS serial devices

## Install

```bash
npm install gps
```

## Usage

```javascript
var GPS = require('gps')

var gps = new GPS();
 
gps.on('location', function(data) {
  console.log(data);
});
```

## Development

Source hosted at [GitHub](http://github.com/andrew/node-gps).
Report Issues/Feature requests on [GitHub Issues](http://github.com/andrew/node-gps).

### Note on Patches/Pull Requests

 * Fork the project.
 * Make your feature addition or bug fix.
 * Add tests for it. This is important so I don't break it in a future version unintentionally.
 * Send me a pull request. Bonus points for topic branches.

## Copyright

Copyright (c) 2013 Andrew Nesbitt. See [LICENSE](https://github.com/andrew/node-gps/blob/master/LICENSE) for details.