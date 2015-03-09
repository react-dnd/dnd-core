"use strict";

module.exports = getNextUniqueId;
var nextUniqueId = 0;

function getNextUniqueId() {
  return nextUniqueId++;
}