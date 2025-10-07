const { list } = require("./utils/index.cjs");

module.exports = {
  unary_expression: ($) => prec(4, seq($.unary_operator, $.expression)),

  analytic_expression: ($) =>
    prec(
      3,
      seq(
        $.expression,
        choice(
          $.over_keyword,
          seq($.within_keyword, $.group_keyword),
          $.keep_keyword,
        ),
        $.parenthesis_bracket__open,
        choice(
          seq(optional($._partition_by), optional($._order_by)),
          seq(
            choice($.rank_builtin_program, $.dense_rank_builtin_program),
            choice($.first_builtin_program, $.last_builtin_program),
            $._order_by,
          ),
        ),
        $.parenthesis_bracket__close,
      ),
    ),

  between_expression: ($) =>
    prec.right(
      2,
      seq(
        $.expression,
        $.between_operator,
        $.expression,
        $.and_operator,
        $.expression,
      ),
    ),

  binary_expression: ($) =>
    prec.right(1, seq($.expression, $.binary_operator, $.expression)),

  select_expression: ($) =>
    prec(
      1,
      seq($.parenthesis_bracket__open, $.select, $.parenthesis_bracket__close),
    ),

  sequence_expression: ($) =>
    seq(
      $.parenthesis_bracket__open,
      list($.expression, $.comma_punctuation),
      $.parenthesis_bracket__close,
    ),
};
