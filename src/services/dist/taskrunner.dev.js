"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.runProductHuntTasks = exports.runRedditTasks = void 0;

var _redditServices = require("./redditServices.js");

var _supabase = require("./supabase.js");

var _contentSummarizer = require("./utils/contentSummarizer.js");

var _productHuntServices = require("./productHuntServices.js");

var _content_generator = require("./utils/content_generator.js");

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var runRedditTasks = function runRedditTasks(nextExecutionTime) {
  var redditService, supabase, summarizer, redditNews, savedNews, chunkSize, summarizedNews, i, chunk, summaries;
  return regeneratorRuntime.async(function runRedditTasks$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          redditService = new _redditServices.RedditService();
          supabase = new _supabase.SupabaseService();
          summarizer = new _contentSummarizer.ContentSummarizer();
          _context2.prev = 3;
          console.log('Fetching Reddit news...');
          _context2.next = 7;
          return regeneratorRuntime.awrap(redditService.getRedditNews());

        case 7:
          redditNews = _context2.sent;
          _context2.next = 10;
          return regeneratorRuntime.awrap(supabase.reddit.get());

        case 10:
          savedNews = _context2.sent;
          chunkSize = 5;
          summarizedNews = [];
          i = 0;

        case 14:
          if (!(i < savedNews.length)) {
            _context2.next = 23;
            break;
          }

          chunk = savedNews.slice(i, i + chunkSize);
          _context2.next = 18;
          return regeneratorRuntime.awrap(Promise.all(chunk.map(function _callee(news) {
            return regeneratorRuntime.async(function _callee$(_context) {
              while (1) {
                switch (_context.prev = _context.next) {
                  case 0:
                    _context.prev = 0;
                    _context.t0 = _objectSpread;
                    _context.t1 = {};
                    _context.t2 = news;
                    _context.next = 6;
                    return regeneratorRuntime.awrap(summarizer.summarizeBody(news.content));

                  case 6:
                    _context.t3 = _context.sent;
                    _context.t4 = {
                      content: _context.t3
                    };
                    return _context.abrupt("return", (0, _context.t0)(_context.t1, _context.t2, _context.t4));

                  case 11:
                    _context.prev = 11;
                    _context.t5 = _context["catch"](0);
                    return _context.abrupt("return", null);

                  case 14:
                  case "end":
                    return _context.stop();
                }
              }
            }, null, null, [[0, 11]]);
          })));

        case 18:
          summaries = _context2.sent;
          summarizedNews.push.apply(summarizedNews, _toConsumableArray(summaries.filter(function (summary) {
            return summary !== null;
          })));

        case 20:
          i += chunkSize;
          _context2.next = 14;
          break;

        case 23:
          _context2.next = 25;
          return regeneratorRuntime.awrap(supabase.news.uploadBatch(summarizedNews, {
            test: false
          }));

        case 25:
          _context2.next = 27;
          return regeneratorRuntime.awrap(supabase.reddit.deleteAll());

        case 27:
          console.log("Reddit tasks completed. Next run at: ".concat(nextExecutionTime));
          _context2.next = 33;
          break;

        case 30:
          _context2.prev = 30;
          _context2.t0 = _context2["catch"](3);
          console.error('Error executing Reddit tasks:', _context2.t0);

        case 33:
        case "end":
          return _context2.stop();
      }
    }
  }, null, null, [[3, 30]]);
};

exports.runRedditTasks = runRedditTasks;

var runProductHuntTasks = function runProductHuntTasks(nextExecutionTime) {
  var supabase, productHunt, generator, products, newProducts, transformedProducts;
  return regeneratorRuntime.async(function runProductHuntTasks$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          supabase = new _supabase.SupabaseService();
          productHunt = new _productHuntServices.ProductHuntService();
          generator = _content_generator.ContentGenerator.getInstance();
          _context3.prev = 3;
          console.log('Fetching Product Hunt news...');
          _context3.next = 7;
          return regeneratorRuntime.awrap(productHunt.getTopProducts());

        case 7:
          products = _context3.sent;
          _context3.next = 10;
          return regeneratorRuntime.awrap(supabase.productHunt.uploadBatch(products));

        case 10:
          _context3.t0 = regeneratorRuntime;
          _context3.t1 = generator;
          _context3.next = 14;
          return regeneratorRuntime.awrap(supabase.productHunt.get());

        case 14:
          _context3.t2 = _context3.sent;
          _context3.t3 = _context3.t1.generate.call(_context3.t1, _context3.t2);
          _context3.next = 18;
          return _context3.t0.awrap.call(_context3.t0, _context3.t3);

        case 18:
          newProducts = _context3.sent;
          transformedProducts = newProducts.map(function (product) {
            return {
              title: product.title || '',
              content: product.content || '',
              url_overridden_by_dest: product.url,
              image: product.thumbnail_url || '',
              subreddit_name_prefixed: 'Product Hunt',
              domain: product.url
            };
          });
          _context3.next = 22;
          return regeneratorRuntime.awrap(supabase.news.uploadBatch(transformedProducts, {
            test: false
          }));

        case 22:
          _context3.next = 24;
          return regeneratorRuntime.awrap(supabase.productHunt.deleteAll());

        case 24:
          console.log("Product Hunt tasks completed. Next run at: ".concat(nextExecutionTime));
          _context3.next = 30;
          break;

        case 27:
          _context3.prev = 27;
          _context3.t4 = _context3["catch"](3);
          console.error('Error executing Product Hunt tasks:', _context3.t4);

        case 30:
        case "end":
          return _context3.stop();
      }
    }
  }, null, null, [[3, 27]]);
};

exports.runProductHuntTasks = runProductHuntTasks;