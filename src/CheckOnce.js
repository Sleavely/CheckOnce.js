// Use Node, AMD or browser globals to create a module.
// Module pattern courtesy of https://github.com/umdjs/umd

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['SJ'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // Node. Does not work with strict CommonJS, but
    // only CommonJS-like environments that support module.exports,
    // like Node.
    module.exports = factory(require('SJ'));
  } else {
    // Browser globals (root is window)
    root.CheckOnce = factory(root.SJ);
  }
}(this, function (SJ) {

  // Constructor
  var CheckOnce = function(optConfig){
    if(typeof optConfig == 'function') optConfig = {checker: optConfig};
    this.setConfig(optConfig);

    this.init();
  };

  CheckOnce.prototype.defaultConfig = {
    checker: function(){
      console.log('Checking for notifications..');
      // This is a great place for you to customize the interval by modifying
      // myCheckOnceInstance.config.interval
      console.log('Next interval: '+ this.config.interval);
    },
    interval: 4000,
    intervalMax: 30000,
    intervalMultiplier: 1.3,
    listener: function(data){
      console.log('Received event data', data);
    },
    // These need to be changed if you have multiple instances of CheckOnce on the same page (tab)
    eventIdentifier: 'CheckOnceEvent',
    lockIdentifier: 'CheckOnceChecker',
    sharedIntervalIdentifier: 'CheckOnceInterval'
  };

  CheckOnce.prototype.setConfig = function(overrides){
    if(typeof overrides != 'object') overrides = {};

    var computed = {};
    for (var attrname in this.defaultConfig) { computed[attrname] = this.defaultConfig[attrname]; }
    for (var attrname in overrides) { computed[attrname] = overrides[attrname]; }

    this.config = computed;
  };

  CheckOnce.prototype.init = function(){
    this.sharedInterval = new SJ.iwc.SharedData(this.config.sharedIntervalIdentifier);
    this.sharedInterval.onChanged((function(newVal){
      this.config.interval = newVal;
    }).bind(this));

    SJ.iwc.EventBus.on(this.config.eventIdentifier, this.eventListener.bind(this), null, true);

    this.lock = SJ.lock(this.config.lockIdentifier, this.lockInitializer.bind(this));
  };

  CheckOnce.prototype.lockInitializer = function(){
    // This ensures that no matter how many tabs you have open only one will run the function.
    // When the window with the lock is closed, another window will automatically take over.
    console.log('Initialized notifications checker. Current interval: '+ this.config.interval);
    this.checker();
  };

  CheckOnce.prototype.checker = function(){
    // Run the custom callback.
    this.config.checker.apply(this);

    // Queue the next one.
    setTimeout(this.checker.bind(this), this.config.interval);
    this.intervalIncrementor();
  };

  CheckOnce.prototype.eventListener = function(meta){
    var data = meta.realData;
    if(typeof this.config.listener == 'function') this.config.listener.call(this, data);
  };

  CheckOnce.prototype.emit = function(data){
    // The object MUST be unique every time its called,
    // otherwise its ignored by other tabs and the event will not fire in them.
    var meta = {
      rand: Math.random(),
      realData: data
    }
    SJ.iwc.EventBus.fire(this.config.eventIdentifier, meta);
  };

  CheckOnce.prototype.intervalIncrementor = function(){
    if(this.config.interval < this.config.intervalMax) this.config.interval = Math.floor(this.config.interval * this.config.intervalMultiplier);
    if(this.config.interval > this.config.intervalMax) this.config.interval = this.config.intervalMax;

    // Use IWC shared data here so that the interval is updated in all windows
    this.sharedInterval.set(this.config.interval);

    return this.config.interval;
  };

  return CheckOnce;
}));
