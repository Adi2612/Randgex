# Random Regex Generator

## Hosted on
http://randgex.craftedmaps.in/

## File Structure

  - `index.js` - examples for generating string
  - `generator.js` - main handler for generating strings
  - `regex.js` - parser for regex
  - `utils.js` - utility functions
  - `types.js` - different token types declaration.

Import `generator.js` file and call `generator` function.

```sh
const generator = require('./generator.js');
let output = generator(/[-+]?[0-9]{1,16}[.][0-9]{1,6}/, 10);
console.log(output);
```


**Author** : Aaditya Arora 
