const KEYWORDS = require("../grammar_keywords.js");

module.exports = {
  assign_operator: () => ":=",
  plus_operator: () => "+",
  minus_operator: () => "-",
  asterisk_operator: () => "*",
  slash_operator: () => "/",
  concat_operator: () => "||",
  equal_operator: () => "=",
  lt_operator: () => "<",
  lte_operator: () => "<=",
  gt_operator: () => ">",
  gte_operator: () => ">=",
  different_operator: () => "<>",
  different_operator_alt: () => "!=",
  and_operator: () => KEYWORDS.SQL_KEYWORDS.AND,
  or_operator: () => KEYWORDS.SQL_KEYWORDS.OR,
  between_operator: () => KEYWORDS.SQL_KEYWORDS.BETWEEN,
  is_not_operator: () =>
    prec(1, seq(KEYWORDS.SQL_KEYWORDS.IS, KEYWORDS.SQL_KEYWORDS.NOT)),
  not_operator: () => KEYWORDS.SQL_KEYWORDS.NOT,
  is_operator: () => KEYWORDS.SQL_KEYWORDS.IS,
  in_operator: () => KEYWORDS.SQL_KEYWORDS.IN,
  not_in_operator: () =>
    seq(KEYWORDS.SQL_KEYWORDS.NOT, KEYWORDS.SQL_KEYWORDS.IN),
  member_of_operator: () =>
    seq(KEYWORDS.PLSQL_KEYWORDS.MEMBER, KEYWORDS.SQL_KEYWORDS.OF),
  not_member_of_operator: () =>
    seq(
      KEYWORDS.SQL_KEYWORDS.NOT,
      KEYWORDS.PLSQL_KEYWORDS.MEMBER,
      KEYWORDS.SQL_KEYWORDS.OF,
    ),
  arrow_operator: () => "=>",
  range_operator: () => token(prec(2, "..")),
  exists_operator: () => KEYWORDS.PLSQL_KEYWORDS.EXISTS,
};
