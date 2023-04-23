// Exponential random number generator
// Time until next arrival
// uses the inverse transform method
function randomExponential(rate, randomUniform = undefined) {
  // http://en.wikipedia.org/wiki/Exponential_distribution#Generating_exponential_variates
  rate = rate || 1;

  // Allow to pass a random uniform value or function
  // Default to Math.random()
  var U = randomUniform;
  if (typeof randomUniform === 'function') U = randomUniform();
  if (!U) U = Math.random();

  return -Math.log(U)/rate;
}

//Poisson Random number generator
// uses the inverse transform method
function randomPoisson(rate) {
  var t = randomExponential(rate);
  var i = 0;
  while (t < 1) {
    var t_i = randomExponential(rate)
    t = t + t_i
    i++;
  }
  return i
}

// function to shuffle an array of values
function shuffle(array) {
  let currentIndex = array.length,  randomIndex;

  // While there remain elements to shuffle.
  while (currentIndex != 0) {

    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }

  return array;
}