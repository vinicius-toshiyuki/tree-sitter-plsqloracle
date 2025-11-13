module.exports = {
  directive_statement: ($) =>
    choice($._include_directive, $._include_type_directive),
  _include_directive: ($) =>
    seq(
      $.directive_bracket__open,
      $.include_keyword,
      $.string,
      $.directive_bracket__close,
    ),
  _include_type_directive: ($) =>
    seq(
      $.directive_bracket__open,
      $.include_keyword,
      $.colon_punctuation,
      $.type_keyword,
      $.string,
      $.directive_bracket__close,
    ),
};
