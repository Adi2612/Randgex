/**
 * returns Object with updated string after removing backslash and original and updated endIndex
 * @param {string} str 
 * @param {string} pattern 
 */
const processStringForBackSlash = (str, pattern="()") => {
  const length = str.length;
  let dequeue = [];
  let i = 0;
  let new_str = '';
  for(i = 0 ; i < length ; i++) {
    if(str[i] === pattern[0]) {
      dequeue.push(pattern[0]);
    } else if(str[i]  === pattern[1]) {
      dequeue.shift();
    } else if(str[i] === '\\') {
      i+=1;
    }
    new_str += str[i] ? str[i] : '';
    if(dequeue.length === 0)
      break;
  }
  const enclosingIndex = i;
  const updatedEnclosingIndex = new_str.length - 1;
  new_str += str.slice(i+1, length);
  return { str : new_str, index : enclosingIndex, updatedIndex : updatedEnclosingIndex };
}

/**
 * Return random number between and including min and max 
 * @param {int} min 
 * @param {int} max 
 */
const randomIntFromInterval = (min, max) => {  
  if(max === Infinity) max = 20;
  return Math.floor(Math.random() * (max - min + 1) + min);
}

module.exports = {
  randomIntFromInterval,
  processStringForBackSlash
};