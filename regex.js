const utils = require('./utils');
const types = require('./types');
const regexParser = (exp) => {

  /**
   * create tokens of characters and Ranges. 
   */
  const makeObjectsOfCharacters = (charList) => {
    let tokens = [];
    for(let char of charList) {
      if(char.length == 1) {
        tokens.push({
          type: types.CHARACTER,
          value: char
        });
      } else {
        tokens.push({
          type: types.RANGE,
          from: {
            type: types.CHARACTER,
            value: char[0],
          },
          to: {
            type: types.CHARACTER,
            value: char[2]
          }
        });
      }
    }
    return tokens;
  }

  // find quantifier range. 
  const findRange = (str) => {
    const nextChar = ['?', '*', '+', '{'];
    const length = str.length;
    let quantifier = {start: 1, end : 1};
    let i = 0;
    let operationLength = 0; // length of string used in quantifier
    if(i < length && nextChar.indexOf(str[i]) !== -1) {
      let ch = str[i];
      operationLength = 1;
      switch(ch) {
        case '?':
          quantifier.start = 0;
          break;
        case '*':
          quantifier.start = 0;
          quantifier.end = Infinity;
          break;
        case '+':
          quantifier.start = 1;
          quantifier.end = Infinity;
          break;
        case '{':
          if(str.indexOf('}') !== -1) {
            let stringInsideCurly = str.slice(1, str.indexOf('}'));
            operationLength = stringInsideCurly.length + 2;
            let range = stringInsideCurly.split(',');
            if(range.length > 2) {
              operationLength = 0;
            } else {
              if(range[0] !== '') {
                let first = parseInt(range[0]);
                if(first !== NaN) {
                  quantifier.start = first;
                  quantifier.end = first;
                } else {
                  operationLength = 0;
                  break;
                }
              }
              if(range.length === 2) {
                if(range[1] === '') {
                  quantifier.end = Infinity
                } else {
                  let second = parseInt(range[1]);
                  if(second !== NaN) {
                    quantifier.end = second;
                  } else {
                    operationLength = 0;
                    quantifier.start = 1;
                  }
                }
              }
            }
          } else {
            operationLength = 0;
          }
          break;
      }
    }
    return {...quantifier, operationLength}; 
  }

  const bracket = (str, index) => {
    let tokens = { type: 'BRACKET', list : [], start: 1, end: 1, not : false }; // start <= i_ <= end
    const length = str.length;

    // handle characters inside bracket
    const processedStringObj = utils.processStringForBackSlash(str.slice(index, length), '[]');
    const enclosingIndex = processedStringObj.index + index;
    let contentInsideBracket = processedStringObj.str.slice(1, processedStringObj.updatedIndex); // everything inside brackets.
    let charList = contentInsideBracket.match(/(.-.|.)/g);
    if(charList.length && charList[0] === '^' && str[1] !== '\\') {
      tokens.not = true;
      charList = charList.slice(1, charList.length);
    }
    tokens.list = makeObjectsOfCharacters(charList);

    // handle qunatifier
    const stringAfterClosingBracket = str.slice(enclosingIndex + 1, length);
    let range = findRange(stringAfterClosingBracket); // find quantifier 
    tokens.start = range.start;
    tokens.end = range.end;
    let returnIndex = enclosingIndex + range.operationLength;
    return {tokens, returnIndex};
  }

  const parenthesis = (str, index) => {
    const length = str.length;
    let tokens = { type: types.PARENTHESIS, list : [], start : 1 , end : 1}

    // handle characters inside parantheses 
    const processedStringObj = utils.processStringForBackSlash(str.slice(index, length), '()');
    const enclosingIndex = processedStringObj.index + index;
    let contentInsideParenthesis = str.slice(index + 1, enclosingIndex);
    let tokensInsideParenthesis = builder(contentInsideParenthesis);
    tokens.list.push(tokensInsideParenthesis);

    // handle qunatifier
    let stringAfterClosingParenthesis = str.slice(enclosingIndex + 1, length);
    let range = findRange(stringAfterClosingParenthesis);
    tokens.start = range.start;
    tokens.end = range.end;

    let returnIndex = enclosingIndex + range.operationLength;
    return {tokens, returnIndex};
  }

  const constant = (str, index) => {
    const length = str.length;
    let tokens = { type: types.BRACKET, list : [], start : 1, end: 1, not : false };
    if(str[index] === '.') {
      tokens.not = true;
      tokens.list.push({
        type: types.CHARACTER,
        value: '\n'
      })
    } else {
      tokens.list.push({
        type: types.CHARACTER,
        value: str[index]
      })
    }

    // handle qunatifier
    let stringAfterConstant = str.slice(index + 1, length);
    let range = findRange(stringAfterConstant);
    tokens.start = range.start;
    tokens.end = range.end;
    let returnIndex = index + range.operationLength;
    return {tokens, returnIndex};
  }

  const escaper = (str, i) => {
    const length = str.length;

    if(i+1 < length) {
      if(str[i+1] == '1') { // back reference
        let tokens = {
          type: types.BACK_REFERENCE,
          position: str[i+1]
        }
        return {tokens, returnIndex : i+1};
      } else { // escape character
        return constant(str, i+1);
      }
    }
  }

  const builder = (str) => {
    let tokens = { type: types.START, list: [[]] };
    let pipedIndex = 0;
    const length = str.length;
    let i = 0;
    let ret_;
    while(i < length) {
      let ch = str[i];
      switch(ch) {
        case '[':
          ret_ = bracket(str, i);
          break;
        case '(':
          ret_ = parenthesis(str, i);
          break;
        case '|':
          tokens.list.push([]);
          pipedIndex+=1;
          break;
        case '\\':
          ret_ = escaper(str, i);
          break;
        default:
          ret_ = constant(str, i); 
          break;
      }
      if(ch !== '|') {
        tokens.list[pipedIndex].push(ret_.tokens);
        i = ret_.returnIndex;
      }
      i++;
    }
    return tokens;
  }


  const main = (exp) => {
    try {
      const regExp = new RegExp(exp);
    } catch(e) {
      console.log("Expression is not valid :/");
      process.exit(22);
    }
    let expString = exp.toString();
    expString = expString.slice(1, expString.length - 1);
    const tokens = builder(expString);
    return tokens;
  }

  return main(exp);

}

module.exports = regexParser;