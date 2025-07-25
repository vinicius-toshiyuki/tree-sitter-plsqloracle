(identifier) @variable

(string_content) @string

(type) @type
(type
    (udt
      (accessor
        (identifier) @type)))

(number) @number

(comment) @comment

[
    (in_keyword)
    (continue_keyword)
    (exit_keyword)
    (constant_keyword)
    (case_keyword)
    (end_case_keyword)
    (when_keyword)
    (then_keyword)
    (end_keyword)
    (function_keyword)
    ; (procedure_keyword)
    (is_keyword)
    (begin_keyword)
    (declare_keyword)
    (default_keyword)
    (in_keyword__param)
    (out_keyword__param)
    (return_keyword)
] @keyword

[
    (for_keyword)
    (loop_keyword)
    (end_loop_keyword)
] @keyword.repeat

[
    (if_keyword)
    (end_if_keyword)
    (elsif_keyword)
    (else_keyword)
] @keyword.conditional

[
    (semicolon_punctuation)
    (period_punctuation)
    (comma_punctuation)
    (string_bracket__open)
    (string_bracket__close)
] @operator

[
    (parenthesis_bracket__open)
    (parenthesis_bracket__close)
    ;(square_bracket__open)
    ;(square_bracket__close)
    ;(braces_bracket__open)
    ;(braces_bracket__close)
] @punctuation.delimiter

[
    (assign_operator)
    (plus_operator)
    (minus_operator)
    (asterisk_operator)
    (slash_operator)
    (concat_operator)
    (equal_operator)
    (lt_operator)
    (lte_operator)
    (gt_operator)
    (gte_operator)
    (different_operator)
    (different_operator_alt)
    (and_operator)
    (or_operator)
    (between_operator)
    (is_not_operator)
    (not_operator)
    (is_operator)
    (in_operator)
    (member_of_operator)
    (arrow_operator)
] @operator

(boolean) @boolean

(constant) @constant.builtin
