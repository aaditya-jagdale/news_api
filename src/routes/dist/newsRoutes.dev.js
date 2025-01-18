"use strict";

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _express = require("express");

var _redditServices = require("../services/redditServices.js");

var _supabase = _interopRequireWildcard(require("../services/supabase.js"));

var _contentSummarizer = require("../services/utils/contentSummarizer.js");

var _productHuntServices = require("../services/productHuntServices.js");

var _content_generator = require("../services/utils/content_generator.js");

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function _getRequireWildcardCache() { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var router = (0, _express.Router)();
var redditService = new _redditServices.RedditService();
var productHunt = new _productHuntServices.ProductHuntService();
router.get('/reddit-news', function _callee(req, res, next) {
  var redditNews;
  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.prev = 0;
          _context.next = 3;
          return regeneratorRuntime.awrap(redditService.getRedditNews());

        case 3:
          redditNews = _context.sent;
          res.json({
            status: 'success',
            length: redditNews.length,
            news: redditNews
          });
          _context.next = 10;
          break;

        case 7:
          _context.prev = 7;
          _context.t0 = _context["catch"](0);
          next(_context.t0);

        case 10:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[0, 7]]);
});
router.get('/summarize-reddit-news', function _callee3(req, res, next) {
  var supabase, summarizer, savedNews, chunkSize, results, i, chunk, summaries, uploads;
  return regeneratorRuntime.async(function _callee3$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          supabase = new _supabase.SupabaseService();
          summarizer = new _contentSummarizer.ContentSummarizer();
          _context3.prev = 2;
          _context3.next = 5;
          return regeneratorRuntime.awrap(supabase.reddit.get());

        case 5:
          savedNews = _context3.sent;
          chunkSize = 5;
          results = [];
          i = 0;

        case 9:
          if (!(i < savedNews.length)) {
            _context3.next = 18;
            break;
          }

          chunk = savedNews.slice(i, i + chunkSize);
          _context3.next = 13;
          return regeneratorRuntime.awrap(Promise.all(chunk.map(function _callee2(news) {
            return regeneratorRuntime.async(function _callee2$(_context2) {
              while (1) {
                switch (_context2.prev = _context2.next) {
                  case 0:
                    _context2.prev = 0;
                    _context2.t0 = _objectSpread;
                    _context2.t1 = {};
                    _context2.t2 = news;
                    _context2.next = 6;
                    return regeneratorRuntime.awrap(summarizer.summarizeBody(news.content));

                  case 6:
                    _context2.t3 = _context2.sent;
                    _context2.t4 = {
                      content: _context2.t3
                    };
                    return _context2.abrupt("return", (0, _context2.t0)(_context2.t1, _context2.t2, _context2.t4));

                  case 11:
                    _context2.prev = 11;
                    _context2.t5 = _context2["catch"](0);
                    return _context2.abrupt("return", null);

                  case 14:
                  case "end":
                    return _context2.stop();
                }
              }
            }, null, null, [[0, 11]]);
          })));

        case 13:
          summaries = _context3.sent;
          results.push.apply(results, _toConsumableArray(summaries.filter(function (summary) {
            return summary !== null;
          })));

        case 15:
          i += chunkSize;
          _context3.next = 9;
          break;

        case 18:
          uploads = supabase.news.uploadBatch(results, {
            test: false
          });
          res.json({
            status: 'success',
            totalNews: results.length,
            news: results
          });
          _context3.next = 25;
          break;

        case 22:
          _context3.prev = 22;
          _context3.t0 = _context3["catch"](2);
          next(_context3.t0);

        case 25:
        case "end":
          return _context3.stop();
      }
    }
  }, null, null, [[2, 22]]);
});
router.get('/productHunt-news', function _callee4(req, res, next) {
  var products, uploads;
  return regeneratorRuntime.async(function _callee4$(_context4) {
    while (1) {
      switch (_context4.prev = _context4.next) {
        case 0:
          _context4.next = 2;
          return regeneratorRuntime.awrap(productHunt.getTopProducts());

        case 2:
          products = _context4.sent;
          uploads = _supabase["default"].productHunt.uploadBatch(products);
          res.json({
            status: 'success',
            length: uploads.length,
            uploads: uploads
          });

        case 5:
        case "end":
          return _context4.stop();
      }
    }
  });
});
router.get('/ph-data', function _callee5(req, res, next) {
  var products;
  return regeneratorRuntime.async(function _callee5$(_context5) {
    while (1) {
      switch (_context5.prev = _context5.next) {
        case 0:
          _context5.prev = 0;
          _context5.next = 3;
          return regeneratorRuntime.awrap(_supabase["default"].productHunt.get());

        case 3:
          products = _context5.sent;
          res.json({
            status: 'success',
            length: products.length,
            products: products
          });
          _context5.next = 10;
          break;

        case 7:
          _context5.prev = 7;
          _context5.t0 = _context5["catch"](0);
          next(_context5.t0);

        case 10:
        case "end":
          return _context5.stop();
      }
    }
  }, null, null, [[0, 7]]);
});
router.get('/generate', function _callee6(req, res, next) {
  var products, productUrls, existingNewsUrls, newProducts, generatedProducts, transformedProducts, ids;
  return regeneratorRuntime.async(function _callee6$(_context6) {
    while (1) {
      switch (_context6.prev = _context6.next) {
        case 0:
          _context6.prev = 0;
          _context6.next = 3;
          return regeneratorRuntime.awrap(_supabase["default"].productHunt.get());

        case 3:
          products = _context6.sent;
          // Extract URLs from the products
          productUrls = products.map(function (product) {
            return product.url;
          }); // Check which URLs already exist in the 'news' table

          existingNewsUrls = _supabase["default"].news.getExistingUrls(productUrls);
          existingNewsUrls.map(function (news) {
            return news.url;
          }); // Filter out products whose URLs already exist in the 'news' table

          newProducts = products.filter(function (product) {
            return !existingNewsUrls.includes(product.url);
          });

          if (!(newProducts.length === 0)) {
            _context6.next = 10;
            break;
          }

          return _context6.abrupt("return", res.json({
            status: 'success',
            message: 'No new products to process'
          }));

        case 10:
          _context6.next = 12;
          return regeneratorRuntime.awrap(_content_generator.ContentGenerator.getInstance().generate(newProducts));

        case 12:
          generatedProducts = _context6.sent;
          // Transform the generated products
          transformedProducts = generatedProducts.map(function (product) {
            return {
              title: product.title || '',
              content: product.content || '',
              url_overridden_by_dest: product.url,
              image: product.thumbnail_url || '',
              subreddit_name_prefixed: 'Product Hunt',
              domain: product.url
            };
          }); // Upload transformed products to the 'news' table

          _context6.next = 16;
          return regeneratorRuntime.awrap(_supabase["default"].news.uploadBatch(transformedProducts, {
            test: false
          }));

        case 16:
          // Delete the processed products from the 'productHunt' table
          ids = newProducts.map(function (product) {
            return product.id;
          });
          _context6.next = 19;
          return regeneratorRuntime.awrap(_supabase["default"].productHunt.deleteAll(ids));

        case 19:
          res.json({
            status: 'success',
            productsProcessed: newProducts.length,
            newProducts: newProducts
          });
          _context6.next = 25;
          break;

        case 22:
          _context6.prev = 22;
          _context6.t0 = _context6["catch"](0);
          next(_context6.t0);

        case 25:
        case "end":
          return _context6.stop();
      }
    }
  }, null, null, [[0, 22]]);
});
var _default = router;
exports["default"] = _default;