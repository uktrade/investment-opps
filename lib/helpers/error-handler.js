'use strict';


var errorHandler = {
  handle: handle
};

module.exports = errorHandler;

/**
 * Handles error
 * @param  {Object} err error
 */
function handle(err) {
  if (err) {
    throw err;
  }
}