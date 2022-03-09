// jshint esversion:8
const _ = require("lodash");

exports.capitalize = (expression) => {
  console.log(`stringHelper.CAPITALIZED INCOMING: ${expression}`);
  const words = expression.split(" ");

  // capitalize each word in expression
  capitalized = words.map((word) => {
    return _.capitalize(word);
  });


  const capitalizedExpression = capitalized.join(" ");
  console.log(`stringHelper.CAPITALIZED OUTGOING: ${capitalizedExpression}`);
  return capitalizedExpression;
};
