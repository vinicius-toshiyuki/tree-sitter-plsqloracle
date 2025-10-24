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

const expressions = require("./grammar/expression.cjs");

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

  conflicts: ($) => [[$._select_column_asterisk_alias, $.accessor]],

  rules: {
    source_file: ($) =>
      repeat1(
        choice(
          $.include_statement,
          $.block_statement,
          $.function_definition,
          $.procedure_definition,
          $.package_body_statement,
        ),
      ),
    statement: ($) =>
      choice(
        $.block_statement,
        seq($.expression, $.semicolon_punctuation),
        $.function_definition,
        $.procedure_definition,
        $.if_statement,
        $.case_statement,
        seq($.return_keyword, $.expression, $.semicolon_punctuation),
        seq($.return_keyword, $.semicolon_punctuation),
        $.pipe_row_statement,
        seq($.select, $.semicolon_punctuation),
        $.insert_statement,
        $.update_statement,
        $.forall_statement,
        $.for_statement,
        $.while_statement,
        $.loop_statement,
        seq(
          choice($.exit_keyword, $.continue_keyword),
          optional(seq($.when_keyword, $.expression)),
          $.semicolon_punctuation,
        ),
        $.include_statement,
        $.package_body_statement,
      ),
    include_statement: ($) =>
      seq(
        $.directive_bracket__open,
        $.include_keyword,
        $.string,
        $.directive_bracket__close,
      ),
    package_body_statement: ($) =>
      seq(
        $.create_keyword,
        optional(seq($.or_keyword, $.replace_keyword)),
        $.package_keyword,
        $.body_keyword,
        field("package_identifier", $.identifier),
        $.is_keyword,
        repeat1($.block_declaration),
        $.end_keyword,
        optional(field("closing_identifier", $.identifier)),
        $.semicolon_punctuation,
      ),
    block_statement: ($) =>
      seq(
        optional(seq($.declare_keyword, optional($.block_declaration_list))),
        $.block_body,
      ),
    block_declaration_list: ($) => repeat1($.block_declaration),
    block_body: ($) =>
      seq(
        $.begin_keyword,
        repeat1($.statement),
        optional(seq($.exception_keyword, repeat1($._block_exception))),
        $.end_keyword,
        $.semicolon_punctuation,
      ),
    _block_exception: ($) =>
      seq($.when_keyword, $.expression, $.then_keyword, repeat1($.statement)),
    block_declaration: ($) =>
      choice(
        prec(1, $.function_definition),
        prec(1, $.procedure_definition),
        seq(
          field("declaration_identifier", $.identifier),
          optional($.constant_keyword),
          $.type,
          optional(seq($.assign_operator, $.expression)),
          $.semicolon_punctuation,
        ),
      ),
    ...expressions,
    expression: ($) =>
      choice(
        $.string,
        $.number,
        $.boolean,
        $.constant,
        $.builtin_program,
        $.accessor,
        $.chain_expression,
        $.sequence_expression,
        $.select_expression,
        $.exists_expression,
        alias(seq($.prior_keyword, $.chain_accessor), $.prior_expression),
        alias($.level_keyword, $.level_expression),
        $.unary_expression,
        $.analytic_expression,
        $.between_expression,
        $.binary_expression,
        $.call_expression,
        $.case_expression,
      ),
    procedure_definition: ($) =>
      seq(
        $.procedure_keyword,
        field("program_name", $.identifier),
        optional(
          seq(
            $.parenthesis_bracket__open,
            $.param_declaration_list,
            $.parenthesis_bracket__close,
          ),
        ),
        $.is_keyword,
        optional($.block_declaration_list),
        $.begin_keyword,
        repeat1($.statement),
        $.end_keyword,
        optional($.identifier),
        $.semicolon_punctuation,
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
        optional(choice($.deterministic_keyword, $.pipelined_keyword)),
        $.is_keyword,
        optional($.block_declaration_list),
        $.begin_keyword,
        repeat1($.statement),
        $.end_keyword,
        optional($.identifier),
        $.semicolon_punctuation,
      ),
    param_declaration_list: ($) =>
      list($.param_declaration, $.comma_punctuation),
    param_declaration: ($) =>
      seq(
        field("declaration_identifier", $.identifier),
        seq(
          optional($.in_keyword__param),
          optional(seq($.out_keyword__param, optional($.nocopy_keyword))),
        ),
        $.type,
        optional(seq($.default_keyword, $.expression)),
      ),
    pipe_row_statement: ($) =>
      seq(
        $.pipe_keyword,
        $.row_keyword,
        $.parenthesis_bracket__open,
        $.expression,
        $.parenthesis_bracket__close,
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
    asterisk_keyword: () => "*",
    body_keyword: () => KEYWORDS.PLSQL_KEYWORDS.BODY,
    bulk_keyword: () => KEYWORDS.PLSQL_KEYWORDS.BULK,
    by_keyword: () => KEYWORDS.SQL_KEYWORDS.BY,
    collect_keyword: () => KEYWORDS.PLSQL_KEYWORDS.COLLECT,
    connect_keyword: () => KEYWORDS.SQL_KEYWORDS.CONNECT,
    create_keyword: () => KEYWORDS.SQL_KEYWORDS.CREATE,
    desc_keyword: () => KEYWORDS.SQL_KEYWORDS.DESC,
    deterministic_keyword: () => KEYWORDS.PLSQL_KEYWORDS.DETERMINISTIC,
    distinct_keyword: () => KEYWORDS.SQL_KEYWORDS.DISTINCT,
    exception_keyword: () => KEYWORDS.SQL_KEYWORDS.EXCEPTION,
    first_keyword: () => KEYWORDS.SQL_KEYWORDS.FIRST,
    forall_keyword: () => KEYWORDS.PLSQL_KEYWORDS.FORALL,
    from_keyword: () => KEYWORDS.SQL_KEYWORDS.FROM,
    group_keyword: () => KEYWORDS.SQL_KEYWORDS.GROUP,
    inner_keyword: () => KEYWORDS.SQL_KEYWORDS.INNER,
    insert_keyword: () => KEYWORDS.SQL_KEYWORDS.INSERT,
    into_keyword: () => KEYWORDS.SQL_KEYWORDS.INTO,
    join_keyword: () => KEYWORDS.SQL_KEYWORDS.JOIN,
    keep_keyword: () => KEYWORDS.SQL_KEYWORDS.KEEP,
    last_keyword: () => KEYWORDS.SQL_KEYWORDS.LAST,
    left_keyword: () => KEYWORDS.SQL_KEYWORDS.LEFT,
    level_keyword: () => KEYWORDS.PLSQL_KEYWORDS.LEVEL,
    nocopy_keyword: () => KEYWORDS.PLSQL_KEYWORDS.NOCOPY,
    nulls_keyword: () => KEYWORDS.SQL_KEYWORDS.NULLS,
    on_keyword: () => KEYWORDS.SQL_KEYWORDS.ON,
    or_keyword: () => KEYWORDS.SQL_KEYWORDS.OR,
    order_keyword: () => KEYWORDS.SQL_KEYWORDS.ORDER,
    over_keyword: () => KEYWORDS.SQL_KEYWORDS.OVER,
    package_keyword: () => KEYWORDS.PLSQL_KEYWORDS.PACKAGE,
    partition_keyword: () => KEYWORDS.PLSQL_KEYWORDS.PARTITION,
    pipe_keyword: () => KEYWORDS.PLSQL_KEYWORDS.PIPE,
    pipelined_keyword: () => KEYWORDS.PLSQL_KEYWORDS.PIPELINED,
    prior_keyword: () => KEYWORDS.SQL_KEYWORDS.PRIOR,
    replace_keyword: () => KEYWORDS.PLSQL_KEYWORDS.REPLACE,
    returning_keyword: () => KEYWORDS.PLSQL_KEYWORDS.RETURNING,
    row_keyword: () => KEYWORDS.PLSQL_KEYWORDS.ROW,
    select_keyword: () => KEYWORDS.SQL_KEYWORDS.SELECT,
    set_keyword: () => KEYWORDS.PLSQL_KEYWORDS.SET,
    start_keyword: () => KEYWORDS.SQL_KEYWORDS.START,
    table_keyword: () => KEYWORDS.SQL_KEYWORDS.TABLE,
    union_keyword: () => KEYWORDS.SQL_KEYWORDS.UNION,
    update_keyword: () => KEYWORDS.SQL_KEYWORDS.UPDATE,
    values_keyword: () => KEYWORDS.SQL_KEYWORDS.VALUES,
    where_keyword: () => KEYWORDS.SQL_KEYWORDS.WHERE,
    while_keyword: () => KEYWORDS.PLSQL_KEYWORDS.WHILE,
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
    directive_bracket__open: () => "{%",
    directive_bracket__close: () => "%}",

    include_keyword: () => "include",

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

    dual_builtin: () => token(prec(1, KEYWORDS.BUILTIN_CONSTANTS.DUAL)),

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
        choice(
          seq(
            $.parenthesis_bracket__open,
            $.select,
            $.parenthesis_bracket__close,
          ),
          seq($.expression, $.range_operator, $.expression),
        ),
        $.loop_statement,
      ),
    while_statement: ($) =>
      seq($.while_keyword, $.expression, $.loop_statement),
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

    exists_expression: ($) =>
      seq(
        $.exists_operator,
        $.parenthesis_bracket__open,
        $.select,
        $.parenthesis_bracket__close,
      ),

    select: ($) => prec.left(choice($._with_select, $._plain_select)),

    _plain_select: ($) =>
      seq(
        $.select_keyword,
        optional(choice($.distinct_keyword, $.all_keyword)),
        choice($.asterisk_keyword, list($.select_column, $.comma_punctuation)),
        optional(
          choice(
            seq(
              $.bulk_keyword,
              $.collect_keyword,
              $.into_keyword,
              list($.chain_accessor, $.comma_punctuation),
            ),
            seq($.into_keyword, list($.chain_accessor, $.comma_punctuation)),
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
        optional($._order_by),
        optional(
          seq($.union_keyword, optional($.all_keyword), $._plain_select),
        ),
      ),
    _with_select: ($) => seq($.with_keyword, $.with_table),

    with_table: ($) =>
      seq(
        field("table_alias", $.identifier),
        $.as_keyword,
        $.parenthesis_bracket__open,
        $.select,
        $.parenthesis_bracket__close,
        choice(seq($.comma_punctuation, $.with_table), $._plain_select),
      ),

    select_table: ($) =>
      seq(
        choice(
          $.dual_builtin,
          field("table_name", $.accessor),
          $.chain_expression,
          seq(
            $.table_keyword,
            $.parenthesis_bracket__open,
            $.expression,
            $.parenthesis_bracket__close,
          ),
          seq(
            $.parenthesis_bracket__open,
            $.select,
            $.parenthesis_bracket__close,
          ),
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
      choice($._select_column_alias, $._select_column_asterisk_alias),
    _select_column_alias: ($) =>
      seq($.expression, optional($.as_keyword), optional($.identifier)),
    _select_column_asterisk_alias: ($) =>
      seq($.identifier, $.period_punctuation, $.asterisk_keyword),
    _partition_by: ($) =>
      seq(
        $.partition_keyword,
        $.by_keyword,
        list($.expression, $.comma_punctuation),
      ),
    _order_by: ($) =>
      prec.left(
        1,
        seq(
          $.order_keyword,
          $.by_keyword,
          list(
            seq(
              $.expression,
              optional(choice($.asc_keyword, $.desc_keyword)),
              optional(
                seq($.nulls_keyword, choice($.first_keyword, $.last_keyword)),
              ),
            ),
            $.comma_punctuation,
          ),
        ),
      ),
    insert_statement: ($) =>
      seq(
        $.insert_keyword,
        $.into_keyword,
        $.chain_accessor,
        optional(
          seq(
            $.parenthesis_bracket__open,
            list($.identifier, $.comma_punctuation),
            $.parenthesis_bracket__close,
          ),
        ),
        choice(
          seq(
            $.values_keyword,
            $.parenthesis_bracket__open,
            list($.expression, $.comma_punctuation),
            $.parenthesis_bracket__close,
          ),
          $.select,
        ),
        optional(
          seq(
            choice($.return_keyword, $.returning_keyword),
            list($.identifier, $.comma_punctuation),
            $.into_keyword,
            list($.chain_accessor, $.comma_punctuation),
          ),
        ),
        $.semicolon_punctuation,
      ),

    update_statement: ($) =>
      seq(
        $.update_keyword,
        seq(
          field("table_name", $.chain_accessor),
          field("table_alias", optional($.identifier)),
        ),
        $.set_keyword,
        list(
          seq($.identifier, $.equal_operator, $.expression),
          $.comma_punctuation,
        ),
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

    chain_expression: ($) =>
      prec.left(
        seq(
          $.expression,
          $.period_punctuation,
          field("chain_member", $.identifier),
        ),
      ),
    call_expression: ($) =>
      seq(
        $.expression,
        $.parenthesis_bracket__open,
        optional(choice($.distinct_keyword, $.all_keyword)),
        optional($.arguments),
        $.parenthesis_bracket__close,
      ),

    unary_operator: ($) => choice($.minus_operator, $.not_operator),
    binary_operator: ($) =>
      choice(
        $.assign_operator,
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
        $.not_in_operator,
        $.member_of_operator,
        $.not_member_of_operator,
      ),
    builtin_program: ($) =>
      choice(
        $.first_builtin_program,
        $.last_builtin_program,
        $.rank_builtin_program,
        $.dense_rank_builtin_program,
        ...BUILTINS.array.PROGRAMS.filter(
          (program) =>
            ![
              BUILTINS.PROGRAMS.FIRST,
              BUILTINS.PROGRAMS.LAST,
              BUILTINS.PROGRAMS.RANK,
              BUILTINS.PROGRAMS.DENSE_RANK,
            ].includes(program),
        ).map((program) => token(program)),
      ),
    first_builtin_program: () => token(BUILTINS.PROGRAMS.FIRST),
    last_builtin_program: () => token(BUILTINS.PROGRAMS.LAST),
    rank_builtin_program: () => token(BUILTINS.PROGRAMS.RANK),
    dense_rank_builtin_program: () => token(BUILTINS.PROGRAMS.DENSE_RANK),
    type: ($) => choice(prec(1, $.builtin_type), $.udt),
    builtin_type: ($) =>
      seq(
        $.builtin_type_name,
        optional(
          seq(
            $.parenthesis_bracket__open,
            $.number,
            $.parenthesis_bracket__close,
          ),
        ),
      ),
    builtin_type_name: () => choice(...KEYWORDS.array.BUILTIN_DATA_TYPES),
    udt: ($) => seq($.chain_accessor, optional(/%ROWTYPE/i)),
    identifier: () => token(/[a-zA-Z_\$][a-zA-Z0-9_\$]*|"[^"]*?"/),
    chain_accessor: ($) =>
      prec.left(
        seq(
          $.accessor,
          optional(
            seq(
              $.period_punctuation,
              list(
                field("accessor_member", $.identifier),
                $.period_punctuation,
              ),
            ),
          ),
        ),
      ),
    accessor: ($) =>
      seq(
        optional($.colon_punctuation),
        field("accessor_identifier", $.identifier),
      ),

    constant: () =>
      token(
        prec(
          1,
          choice(
            KEYWORDS.BUILTIN_CONSTANTS.NULL,
            KEYWORDS.BUILTIN_CONSTANTS.NO_DATA_FOUND,
          ),
        ),
      ),
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
      seq(
        $.string_bracket__open,
        optional($.string_content),
        $.string_bracket__close,
      ),
    string_content: ($) =>
      seq($.string_part, repeat(seq($.string_marker, optional($.string_part)))),
    // number: () => token(choice(/\d+/, /\d+\.\d*/, /\.\d+/)),
    comment: () => token(choice(seq("--", /.*/), seq("/*", /.*/, "*/"))),
  },
});
