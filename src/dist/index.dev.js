"use strict";

var _express = _interopRequireDefault(require("express"));

var _newsRoutes = _interopRequireDefault(require("./routes/newsRoutes.js"));

var _errorHandler = require("./utils/errorHandler.js");

var _nodeCron = _interopRequireDefault(require("node-cron"));

var _taskrunner = require("../src/services/taskrunner.js");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var app = (0, _express["default"])();
var PORT = process.env.PORT || 3000;
app.use('/api', _newsRoutes["default"]);
app.use(_errorHandler.errorHandler); // Calculate next execution time for Reddit tasks

var getNextExecutionTime = function getNextExecutionTime(hours) {
  var now = new Date();
  return new Date(now.getTime() + hours * 60 * 60 * 1000).toLocaleString();
}; // Initial runs
// console.log('Executing initial Reddit tasks...');
// runRedditTasks(getNextExecutionTime(4));
// console.log('Executing initial Product Hunt tasks...');
// runProductHuntTasks(getNextExecutionTime(24));
// Schedule Reddit tasks - every 4 hours


_nodeCron["default"].schedule('0 */4 * * *', function _callee() {
  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          console.log('Executing scheduled Reddit tasks...');
          _context.next = 3;
          return regeneratorRuntime.awrap((0, _taskrunner.runRedditTasks)(getNextExecutionTime(4)));

        case 3:
        case "end":
          return _context.stop();
      }
    }
  });
}); // Schedule Product Hunt tasks - daily at midnight


_nodeCron["default"].schedule('0 0 * * *', function _callee2() {
  return regeneratorRuntime.async(function _callee2$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          console.log('Executing scheduled Product Hunt tasks...');
          _context2.next = 3;
          return regeneratorRuntime.awrap((0, _taskrunner.runProductHuntTasks)(getNextExecutionTime(24)));

        case 3:
        case "end":
          return _context2.stop();
      }
    }
  });
});

app.listen(PORT, function () {
  return console.log("Server running on port ".concat(PORT));
});