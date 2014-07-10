
/**
 * Module dependencies.
 */

var integration = require('analytics.js-integration');
var snake = require('to-snake-case');
var load = require('load-script');
var each = require('each');
var is = require('is');

/**
 * User reference.
 */

var user;

/**
 * HOP
 */

var has = Object.prototype.hasOwnProperty;

/**
 * Expose plugin.
 */

module.exports = exports = function(analytics){
  analytics.addIntegration(AdRoll);
  user = analytics.user(); // store for later
};

/**
 * Expose `AdRoll` integration.
 */

var AdRoll = exports.Integration = integration('AdRoll')
  .assumesPageview()
  .readyOnLoad()
  .global('__adroll_loaded')
  .global('adroll_adv_id')
  .global('adroll_pix_id')
  .global('adroll_custom_data')
  .option('advId', '')
  .option('pixId', '')
  .mapping('events');

/**
 * Initialize.
 *
 * http://support.adroll.com/getting-started-in-4-easy-steps/#step-one
 * http://support.adroll.com/enhanced-conversion-tracking/
 *
 * @param {Object} page
 */

AdRoll.prototype.initialize = function(page){
  window.adroll_adv_id = this.options.advId;
  window.adroll_pix_id = this.options.pixId;
  window.__adroll_loaded = true;
  this.load();
};

/**
 * Loaded?
 *
 * @return {Boolean}
 */

AdRoll.prototype.loaded = function(){
  return window.__adroll;
};

/**
 * Load the AdRoll library.
 *
 * @param {Function} fn
 */

AdRoll.prototype.load = function(fn){
  load({
    http: 'http://a.adroll.com/j/roundtrip.js',
    https: 'https://s.adroll.com/j/roundtrip.js'
  }, fn);
};

/**
 * Page.
 *
 * http://support.adroll.com/segmenting-clicks/
 *
 * @param {Page} page
 */

AdRoll.prototype.page = function(page){
  var name = page.fullName();
  this.track(page.track(name));
};

/**
 * Track.
 *
 * @param {Track} track
 */

AdRoll.prototype.track = function(track){
  var event = track.event();
  var events = this.events(event);
  var total = track.revenue() || track.total() || 0;
  var orderId = track.orderId() || 0;

  each(events, function(event){
    var data = {};
    if (user.id()) data.user_id = user.id();
    data.adroll_conversion_value_in_dollars = total;
    data.order_id = orderId;
    // the adroll interface only allows for
    // segment names which are snake cased.
    data.adroll_segments = snake(event);
    window.__adroll.record_user(data);
  });

  // no events found
  if (!events.length) {
    var data = {};
    if (user.id()) data.user_id = user.id();
    data.adroll_segments = snake(event);
    window.__adroll.record_user(data);
  }
};
