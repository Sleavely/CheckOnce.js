# CheckOnce.js

Tab-tolerant notification subscription. Only polls for notifications from one tab, but seamlessly continues in another when the first one is closed.

Inter-window communication is made possible by the excellent [slimjack/IWC](https://github.com/slimjack/IWC) library.


### Getting started

```html
<script src="src/SJ.js"></script> <!-- IWC dependency -->
<script src="src/CheckOnce.js"></script>
```

#### Check once, from one tab

In the simplest scenario, you only want to use desktop notifications, and not update anything in the front-end in the browser.

```js
var Notifier = new CheckOnce(function(){
  // Some code to check for notifications here.
  yourAjaxFunctionWithCallback(function(data){
    // When you receive your response, show desktop notification once.
    new Notification(data.user +' says '+ data.message);
  });
});
```

The downside? You cant trigger a response in all tabs this way, since the callback will only be used once.

#### Check once, callback in all tabs

Now, let's say we want to check for notifications regularly, from just one tab (like above), but when we get a notification we want to update the UI in all of them.

```js
var Notifier = new CheckOnce({
  checker: function(){
    // Some code to check for notifications here.
    yourAjaxFunctionWithCallback(function(data){
      // When you receive your response, show desktop notification once..
      new Notification(data.user +' says '+ data.message);

      // ..but also trigger a UI update in all the tabs.
      Notifier.emit(data);
    });
  },
  listener: function(data){
    // All tabs will run this method when emit() is called
    jQuery('.notifications').append('<p>'+data.user+' messaged you!</p>');
  }
);
```

### Options

```js
defaultConfig = {
  checker: function(){
    console.log('Checking for notifications..');
    // This is a great place for you to customize the interval by modifying
    // myCheckOnceInstance.config.interval
    console.log('Next interval: '+ this.config.interval);
  },
  interval: 4000,
  intervalMax: 30000,
  intervalMultiplier: 1.3, // If you don't want to increase the interval over time, set this to 1
  listener: function(data){
    console.log('Received event data', data);
  },
  // These need to be changed if you have multiple instances of CheckOnce on the same page (tab)
  eventIdentifier: 'CheckOnceEvent',
  lockIdentifier: 'CheckOnceChecker',
  sharedIntervalIdentifier: 'CheckOnceInterval'
}
```

### Disclaimer

CheckOnce.js has only been tested in a browser globals scenario, so despite the [UMD pattern](https://github.com/umdjs/umd) used it may break things in AMD or NodeJS environments. The reason is that I've bundled IWC in a pseudo-UMD package (SJ.js) that I __think__ will work.

### License

(MIT License)

Copyright (c) 2016 Joakim Hedlund

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
