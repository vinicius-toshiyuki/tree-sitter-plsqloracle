/**
 * @file PL/SQL with Oracle flavor
 * @author Vinícius Sugimoto <vtmsugimoto@gmail.com>
 * @license MIT
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

const KEYWORDS = require("./grammar_keywords.js");
const BUILTINS = require("./grammar_builtins.js");

const { list } = require("./grammar/utils/index.cjs");

module.exports = grammar({
  name: "plsqloracle",

  externals: ($) => [
    $.string_bracket__open,
    $.string_bracket__close,
    $.string_part,
    $.string_marker,
    $.number,
  ],

  extras: ($) => [$.comment, /\s+/, "\n", "\r"],

  inline: ($) => [$.select_table],

  word: ($) => $.identifier,

  rules: {
    source_file: ($) =>
      repeat1(choice($.block_statement, $.function_definition)),
    statement: ($) =>
      choice(
        $.block_statement,
        seq($.expression, $.semicolon_punctuation),
        $.function_definition,
        $.if_statement,
        $.case_statement,
        seq($.return_keyword, $.expression, $.semicolon_punctuation),
        seq($.return_keyword, $.semicolon_punctuation),
        seq($.select, $.semicolon_punctuation),
        $.insert_statement,
        $.update_statement,
        $.forall_statement,
        $.for_statement,
        $.loop_statement,
        seq(
          choice($.exit_keyword, $.continue_keyword),
          optional(seq($.when_keyword, $.expression)),
          $.semicolon_punctuation,
        ),
      ),
    block_statement: ($) =>
      seq(
        optional(seq($.declare_keyword, repeat($.block_declaration))),
        $.block_body,
      ),
    block_body: ($) =>
      seq(
        $.begin_keyword,
        repeat1($.statement),
        $.end_keyword,
        $.semicolon_punctuation,
      ),
    block_declaration: ($) =>
      seq(
        field("declaration_identifier", $.identifier),
        optional($.constant_keyword),
        $.type,
        optional(seq($.assign_operator, $.expression)),
        $.semicolon_punctuation,
      ),
    expression: ($) =>
      choice(
        $.string,
        $.number,
        $.boolean,
        $.constant,
        prec(1, $.builtin_program),
        $.accessor,
        seq(
          $.parenthesis_bracket__open,
          list($.expression),
          $.parenthesis_bracket__close,
        ),
        prec(
          1,
          seq(
            $.parenthesis_bracket__open,
            $.select,
            $.parenthesis_bracket__close,
          ),
        ),
        seq(choice($.accessor, $.call), $.assign_operator, $.expression),
        seq($.prior_keyword, $.accessor),
        $.level_keyword,
        prec(3, seq($.unary_operator, $.expression)),
        prec(
          2,
          prec.right(
            seq(
              $.expression,
              $.between_operator,
              $.expression,
              $.and_operator,
              $.expression,
            ),
          ),
        ),
        prec(1, prec.right(seq($.expression, $.binary_operator, $.expression))),
        $.call,
        $.case_expression,
      ),
    function_definition: ($) =>
      seq(
        $.function_keyword,
        field("program_name", $.identifier),
        $.parenthesis_bracket__open,
        optional($.param_declaration_list),
        $.parenthesis_bracket__close,
        $.return_keyword,
        field("return_type", $.type),
        $.is_keyword,
        repeat($.block_declaration),
        $.begin_keyword,
        repeat1($.statement),
        $.end_keyword,
        optional($.identifier),
        $.semicolon_punctuation,
      ),
    param_declaration_list: ($) => list($.param_declaration),
    param_declaration: ($) =>
      seq(
        field("declaration_identifier", $.identifier),
        optional(choice($.in_keyword__param, $.out_keyword__param)),
        $.type,
        optional(seq($.default_keyword, $.expression)),
      ),

    // KEYWORDS
    if_keyword: () => KEYWORDS.SQL_KEYWORDS.IF,
    end_if_keyword: () =>
      seq(KEYWORDS.SQL_KEYWORDS.END, KEYWORDS.SQL_KEYWORDS.IF),
    elsif_keyword: () => KEYWORDS.PLSQL_KEYWORDS.ELSIF,
    else_keyword: () => KEYWORDS.SQL_KEYWORDS.ELSE,
    for_keyword: () => KEYWORDS.SQL_KEYWORDS.FOR,
    in_keyword: () => KEYWORDS.SQL_KEYWORDS.IN,
    continue_keyword: () => KEYWORDS.PLSQL_KEYWORDS.CONTINUE,
    exit_keyword: () => KEYWORDS.PLSQL_KEYWORDS.EXIT,
    constant_keyword: () => KEYWORDS.PLSQL_KEYWORDS.CONSTANT,
    loop_keyword: () => KEYWORDS.PLSQL_KEYWORDS.LOOP,
    end_loop_keyword: () =>
      seq(KEYWORDS.SQL_KEYWORDS.END, KEYWORDS.PLSQL_KEYWORDS.LOOP),
    case_keyword: () => KEYWORDS.SQL_KEYWORDS.CASE,
    end_case_keyword: () =>
      seq(KEYWORDS.SQL_KEYWORDS.END, KEYWORDS.SQL_KEYWORDS.CASE),
    when_keyword: () => KEYWORDS.SQL_KEYWORDS.WHEN,
    then_keyword: () => KEYWORDS.SQL_KEYWORDS.THEN,
    end_keyword: () => KEYWORDS.SQL_KEYWORDS.END,

    function_keyword: () => KEYWORDS.SQL_KEYWORDS.FUNCTION,
    procedure_keyword: () => KEYWORDS.SQL_KEYWORDS.PROCEDURE,
    is_keyword: () => KEYWORDS.SQL_KEYWORDS.IS,
    begin_keyword: () => KEYWORDS.SQL_KEYWORDS.BEGIN,
    declare_keyword: () => KEYWORDS.SQL_KEYWORDS.DECLARE,
    default_keyword: () => KEYWORDS.SQL_KEYWORDS.DEFAULT,
    in_keyword__param: () => KEYWORDS.SQL_KEYWORDS.IN,
    out_keyword__param: () => KEYWORDS.PLSQL_KEYWORDS.OUT,
    return_keyword: () => KEYWORDS.PLSQL_KEYWORDS.RETURN,
    all_keyword: () => KEYWORDS.SQL_KEYWORDS.ALL,
    as_keyword: () => KEYWORDS.SQL_KEYWORDS.AS,
    asc_keyword: () => KEYWORDS.SQL_KEYWORDS.ASC,
    by_keyword: () => KEYWORDS.SQL_KEYWORDS.BY,
    connect_keyword: () => KEYWORDS.SQL_KEYWORDS.CONNECT,
    desc_keyword: () => KEYWORDS.SQL_KEYWORDS.DESC,
    distinct_keyword: () => KEYWORDS.SQL_KEYWORDS.DISTINCT,
    first_keyword: () => KEYWORDS.SQL_KEYWORDS.FIRST,
    forall_keyword: () => KEYWORDS.PLSQL_KEYWORDS.FORALL,
    from_keyword: () => KEYWORDS.SQL_KEYWORDS.FROM,
    group_keyword: () => KEYWORDS.SQL_KEYWORDS.GROUP,
    inner_keyword: () => KEYWORDS.SQL_KEYWORDS.INNER,
    insert_keyword: () => KEYWORDS.SQL_KEYWORDS.INSERT,
    into_keyword: () => KEYWORDS.SQL_KEYWORDS.INTO,
    join_keyword: () => KEYWORDS.SQL_KEYWORDS.JOIN,
    last_keyword: () => KEYWORDS.SQL_KEYWORDS.LAST,
    left_keyword: () => KEYWORDS.SQL_KEYWORDS.LEFT,
    level_keyword: () => KEYWORDS.PLSQL_KEYWORDS.LEVEL,
    nulls_keyword: () => KEYWORDS.SQL_KEYWORDS.NULLS,
    on_keyword: () => KEYWORDS.SQL_KEYWORDS.ON,
    order_keyword: () => KEYWORDS.SQL_KEYWORDS.ORDER,
    over_keyword: () => KEYWORDS.SQL_KEYWORDS.OVER,
    partition_keyword: () => KEYWORDS.PLSQL_KEYWORDS.PARTITION,
    prior_keyword: () => KEYWORDS.SQL_KEYWORDS.PRIOR,
    returning_keyword: () => KEYWORDS.PLSQL_KEYWORDS.RETURNING,
    select_keyword: () => KEYWORDS.SQL_KEYWORDS.SELECT,
    set_keyword: () => KEYWORDS.PLSQL_KEYWORDS.SET,
    start_keyword: () => KEYWORDS.SQL_KEYWORDS.START,
    table_keyword: () => KEYWORDS.SQL_KEYWORDS.TABLE,
    update_keyword: () => KEYWORDS.SQL_KEYWORDS.UPDATE,
    values_keyword: () => KEYWORDS.SQL_KEYWORDS.VALUES,
    where_keyword: () => KEYWORDS.SQL_KEYWORDS.WHERE,
    with_keyword: () => KEYWORDS.SQL_KEYWORDS.WITH,
    within_keyword: () => KEYWORDS.SQL_KEYWORDS.WITHIN,

    semicolon_punctuation: () => ";",
    colon_punctuation: () => ":",
    period_punctuation: () => ".",
    comma_punctuation: () => ",",
    parenthesis_bracket__open: () => "(",
    parenthesis_bracket__close: () => ")",
    square_bracket__open: () => "[",
    square_bracket__close: () => "]",
    braces_bracket__open: () => "{",
    braces_bracket__close: () => "}",

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
    member_of_operator: () =>
      seq(KEYWORDS.PLSQL_KEYWORDS.MEMBER, KEYWORDS.SQL_KEYWORDS.OF),
    arrow_operator: () => "=>",
    range_operator: () => token(prec(2, "..")),

    if_statement: ($) =>
      seq(
        $.if_keyword,
        $.expression,
        $.then_keyword,
        repeat1($.statement),
        repeat(
          seq(
            $.elsif_keyword,
            $.expression,
            $.then_keyword,
            repeat1($.statement),
          ),
        ),
        optional(seq($.else_keyword, repeat1($.statement))),
        $.end_if_keyword,
        $.semicolon_punctuation,
      ),
    for_statement: ($) =>
      seq(
        $.for_keyword,
        field("declaration_identifier", $.identifier),
        $.in_keyword,
        $.parenthesis_bracket__open,
        $.select,
        $.parenthesis_bracket__close,
        $.loop_statement,
      ),
    loop_statement: ($) =>
      seq(
        $.loop_keyword,
        repeat1($.statement),
        $.end_loop_keyword,
        $.semicolon_punctuation,
      ),
    case_statement: ($) =>
      seq(
        $.case_keyword,
        field("case_condition", optional($.expression)),
        repeat1(
          field(
            "case_when",
            seq(
              $.when_keyword,
              $.expression,
              $.then_keyword,
              prec.left(repeat1(field("case_then", $.statement))),
            ),
          ),
        ),
        field("case_else", optional(seq($.else_keyword, repeat1($.statement)))),
        $.end_case_keyword,
        $.semicolon_punctuation,
      ),

    select: ($) =>
      prec.left(
        seq(
          // WITH CLAUSE
          optional(
            list(
              seq(
                $.with_keyword,
                $.identifier,
                $.as_keyword,
                $.select,
                $.comma_punctuation,
              ),
            ),
          ),
          // SELECT
          $.select_keyword,
          optional(choice($.distinct_keyword, $.all_keyword)),
          repeat(seq($.select_column, $.comma_punctuation)),
          $.select_column,
          optional(
            seq(
              $.into_keyword,
              repeat(seq($.accessor, $.comma_punctuation)),
              $.accessor,
            ),
          ),
          $.select_tables,
          optional(seq($.where_keyword, $.expression)),
          optional(
            seq(
              optional(seq($.start_keyword, $.with_keyword, $.expression)),
              $.connect_keyword,
              $.by_keyword,
              $.expression,
            ),
          ),
          optional(
            seq(
              $.group_keyword,
              $.by_keyword,
              repeat(seq($.expression, $.comma_punctuation)),
              $.expression,
            ),
          ),
          optional(
            seq(
              $.order_keyword,
              $.by_keyword,
              repeat(seq($.expression, $.comma_punctuation)),
              $.expression,
            ),
          ),
        ),
      ),
    select_table: ($) =>
      seq(
        field(
          "table_name",
          choice($.accessor, seq($.table_keyword, "(", $.expression, ")")),
        ),
        field("table_alias", optional($.identifier)),
      ),
    select_tables: ($) =>
      prec.left(
        seq(
          $.from_keyword,
          $.select_table,
          repeat(
            choice(
              seq(
                optional(choice($.inner_keyword, $.left_keyword)),
                $.join_keyword,
                $.select_table,
                $.on_keyword,
                $.expression,
              ),
              seq($.comma_punctuation, $.select_table),
            ),
          ),
        ),
      ),
    select_column: ($) =>
      choice(
        seq(
          $.expression,
          optional(
            seq(
              choice($.over_keyword, seq($.within_keyword, $.group_keyword)),
              $.parenthesis_bracket__open,
              $.select_partition_by,
              $.select_order_by,
              $.parenthesis_bracket__close,
            ),
          ),
          optional(seq($.as_keyword, $.identifier)),
        ),
        prec(2, seq($.identifier, $.period_punctuation, "*")),
      ),
    select_partition_by: ($) =>
      seq(
        $.partition_keyword,
        $.by_keyword,
        repeat(seq($.expression, $.comma_punctuation)),
        $.expression,
      ),
    select_order_by: ($) =>
      seq(
        $.order_keyword,
        $.by_keyword,
        repeat(
          seq(
            $.expression,
            optional(choice($.asc_keyword, $.desc_keyword)),
            optional(
              seq($.nulls_keyword, choice($.first_keyword, $.last_keyword)),
            ),
            $.comma_punctuation,
          ),
        ),
        $.expression,
      ),
    insert_statement: ($) =>
      seq(
        $.insert_keyword,
        $.into_keyword,
        $.accessor,
        optional(
          seq(
            $.parenthesis_bracket__open,
            list($.identifier),
            $.parenthesis_bracket__close,
          ),
        ),
        choice(
          seq(
            $.values_keyword,
            $.parenthesis_bracket__open,
            list($.expression),
            $.parenthesis_bracket__close,
          ),
          $.select,
        ),
        optional(
          seq(
            choice($.return_keyword, $.returning_keyword),
            list($.identifier),
            $.into_keyword,
            list($.accessor),
          ),
        ),
        $.semicolon_punctuation,
      ),

    update_statement: ($) =>
      seq(
        $.update_keyword,
        seq(
          field("table_name", $.accessor),
          field("table_alias", optional($.identifier)),
        ),
        $.set_keyword,
        list(seq($.identifier, $.equal_operator, $.expression)),
        optional(seq($.where_keyword, $.expression)),
        $.semicolon_punctuation,
      ),

    forall_statement: ($) =>
      seq(
        $.forall_keyword,
        field("declaration_identifier", $.identifier),
        $.in_keyword,
        $.expression,
        $.range_operator,
        $.expression,
        choice($.insert_statement, $.update_statement),
      ),

    call: ($) =>
      seq(
        choice(prec(1, $.builtin_program), $.accessor),
        $.parenthesis_bracket__open,
        optional($.arguments),
        $.parenthesis_bracket__close,
      ),

    case_expression: ($) =>
      seq(
        $.case_keyword,
        field("case_condition", optional($.expression)),
        repeat1(
          field(
            "case_when",
            seq($.when_keyword, $.expression, $.then_keyword, $.expression),
          ),
        ),
        field("case_else", optional(seq($.else_keyword, $.expression))),
        $.end_keyword,
      ),

    arguments: ($) =>
      seq(
        repeat(seq($.expression, $.comma_punctuation)),
        choice(
          $.expression,
          seq(
            repeat(seq($.arrow_argument, $.comma_punctuation)),
            $.arrow_argument,
          ),
        ),
      ),
    arrow_argument: ($) => seq($.identifier, $.arrow_operator, $.expression),

    unary_operator: ($) => choice($.minus_operator, $.not_operator),
    binary_operator: ($) =>
      choice(
        $.plus_operator,
        $.minus_operator,
        $.asterisk_operator,
        $.slash_operator,
        $.concat_operator,
        $.equal_operator,
        $.lt_operator,
        $.lte_operator,
        $.gt_operator,
        $.gte_operator,
        $.different_operator,
        $.different_operator_alt,
        $.and_operator,
        $.or_operator,
        $.is_not_operator,
        $.is_operator,
        $.in_operator,
        $.member_of_operator,
      ),
    builtin_program: () => choice(...BUILTINS.array.PROGRAMS),
    type: ($) => choice(prec(1, $.builtin_type), $.udt),
    builtin_type: ($) =>
      seq(
        choice(...KEYWORDS.array.BUILTIN_DATA_TYPES),
        optional(
          seq(
            $.parenthesis_bracket__open,
            $.number,
            $.parenthesis_bracket__close,
          ),
        ),
      ),
    udt: ($) => seq($.accessor, optional(/%ROWTYPE/i)),
    identifier: () => /[a-zA-Z_\$][a-zA-Z0-9_\$]*|".*?"/,
    accessor: ($) =>
      seq(
        optional($.colon_punctuation),
        field("accessor_identifier", $.identifier),
        repeat(
          seq($.period_punctuation, field("accessor_member", $.identifier)),
        ),
      ),
    constant: () => token(prec(1, KEYWORDS.BUILTIN_CONSTANTS.NULL)),
    boolean: () =>
      token(
        prec(
          1,
          choice(
            KEYWORDS.BUILTIN_CONSTANTS.TRUE,
            KEYWORDS.BUILTIN_CONSTANTS.FALSE,
          ),
        ),
      ),
    string: ($) =>
      seq($.string_bracket__open, optional($._string_content), $.string_bracket__close),
    _string_content: ($) =>
      seq($.string_part, repeat(seq($.string_marker, optional($.string_part)))),
    // number: () => token(choice(/\d+/, /\d+\.\d*/, /\.\d+/)),
    comment: () => token(choice(seq("--", /.*/), seq("/*", /.*/, "*/"))),
  },
});
