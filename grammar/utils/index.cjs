/**
 * @param {RuleOrLiteral} rule
 * @param {RuleOrLiteral=} separatorRule
 */
function list(rule, separatorRule) {
  return seq(repeat(seq(rule, separatorRule ?? ",")), rule);
}

module.exports = {
  list,
};
