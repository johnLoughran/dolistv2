//jshint esversion:6
// Jl wrote this (based n Angela's methods) to modularize the code in app.js
// It is a module and a child of app.js (called and required within it)

// module.exports defines what functions you can call from this module

module.exports.getDate = getDate;

function getDate() {
  const today = new Date();
  const options = {
    weekday: "long",
    day: "numeric",
    //month: "long"
  }
  const thisDayDate = today.toLocaleDateString("en-IE", options);

  return thisDayDate;
}

// can write shorter form, using an anon. fn. as:

exports.getDay = function() {
  const today = new Date();
  const options = {
    weekday: "long"
  }
  return today.toLocaleDateString("en-IE", options);
}
