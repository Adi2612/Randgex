const generate = require('./generator');

console.log(generate(/[-+]?[0-9]{1,16}[.][0-9]{1,6}/, 10))

console.log(generate(/(1[0-2]|0[1-9])(:[0-5][0-9]){2} (A|P)M/, 10))