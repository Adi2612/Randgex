const regexParser = require('./regex');
const types = require('./types');
const utils = require('./utils');

const generator = (exp, count) => {

  let temp_str;
  let firstGroupStr = '';
  let firstGroupIndex = 1;

  const start = (tokens) => {
    let totalPipes = tokens.list.length;
    let index = Math.floor(Math.random()*totalPipes);
    for(let token of tokens.list[index]) {
      _generate(token);
    }
  }

  // used for handling ^ not.
  const findIncludedElm = (list) => {
    let map_ = {};
    let includedElm = [];
    for(let item of list) { 
      switch(item.type) {
        case types.CHARACTER:
          map_[item.value.charCodeAt()] = 1;
        case types.RANGE:
          const start = item.from.value.charCodeAt();
          const end = item.to.value.charCodeAt();
          for(let i = start ; i <= end ; i++) {
            map_[i] = 1;
          }
      }
    }
    for(let i = 32 ; i <= 126 ; i++) {
      if(map_[i] === undefined) {
        includedElm.push(i);
      }
    }
    return includedElm;
  }

  // used for handling brackets [ ]
  const bracket = (tokens) => {
    const repeat = utils.randomIntFromInterval(tokens.start, tokens.end);
    const totalCharacters = tokens.list.length;
    const list = tokens.list;
    if(tokens.not === false) {
      for(let i = 0 ; i < repeat ; i++) {
        const index = utils.randomIntFromInterval(0, totalCharacters - 1);
        if(list[index].type === types.CHARACTER) {
          _generate(list[index]);
        } else if(list[index].type === types.RANGE) {
          _generate(list[index]);
        }
      }
    } else { // handle ^ Not
      let includedElm = findIncludedElm(list);
      for(let i = 0 ; i < repeat ; i++) {
        const index = utils.randomIntFromInterval(0, includedElm.length - 1);
        temp_str += String.fromCharCode(includedElm[index]);
      }
    }
  }

  // used for handling ranges inside bracket [a-z]
  const range = (tokens) => {
    const start = tokens.from.value.charCodeAt();
    const end = tokens.to.value.charCodeAt();
    const rand = utils.randomIntFromInterval(start, end);
    temp_str += String.fromCharCode(rand);
  }

  // used for handling character 'a'
  const character = (tokens) => {
    temp_str += tokens.value;
  }

  // used for handling parenthesis ()
  const parenthesis = (tokens) => {
    const repeat = utils.randomIntFromInterval(tokens.start, tokens.end);
    let initial = temp_str.slice(0, temp_str.length);
    for(let i = 0 ; i < repeat ; i++) {
      _generate(tokens.list[0]);
    }
    if(firstGroupIndex === 1) {
      firstGroupIndex = 2;
      firstGroupStr = temp_str.slice(initial.length, temp_str.length);
    }
  }

  // used for handling \1
  // Note : only \1 is handled in this program.
  const backReference = (tokens) => {
    temp_str += firstGroupStr;
  }

  // driver function for generating string 
  const _generate = (tokens) => {
    let type = tokens.type;
    switch(type) {
      case types.START:
        start(tokens);
        break;
      case types.PARENTHESIS:
        parenthesis(tokens);
        break;
      case types.CHARACTER:
        character(tokens);
        break;
      case types.RANGE:
        range(tokens);
        break;
      case types.BRACKET:
        bracket(tokens);
        break;
      case types.BACK_REFERENCE:
        backReference(tokens);
        break;
    }
    
  }

  // main function
  const main = (exp) => {
    let ans = [];
    let tokens = regexParser(exp);
    for(let i = 0 ; i < count ; i++) {
      temp_str = '';
      firstGroupStr = '';
      firstGroupIndex = 1;
      _generate(tokens);
      ans.push(temp_str);
    }
    return ans;
  } 

  return main(exp);

}

module.exports = generator;
