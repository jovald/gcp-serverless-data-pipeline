/**
 * Recursively flattens a JSON object using dot notation.
 * 
 * An answer by Yan Foto on Stack Overflow. User: https://stackoverflow.com/users/2295964/yan-foto
 *
 * @param obj item to be flattened
 * @param {Array.string} [prefix=[]] chain of prefix joined with a dot and prepended to key
 * @param {Object} [current={}] result of flatten during the recursion
 *
 * @see https://stackoverflow.com/questions/19098797/fastest-way-to-flatten-un-flatten-nested-json-objects
 */
exports.flatten = function (obj, prefix, current) {
  prefix = prefix || []
  current = current || {}

  // Remember kids, null is also an object!
  if (typeof (obj) === 'object' && obj !== null) {
    Object.keys(obj).forEach(key => {
      this.flatten(obj[key], prefix.concat(key), current)
    })
  } else {
    current[prefix.join('_')] = obj
  }

  return current
}