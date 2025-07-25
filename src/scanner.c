#include "tree_sitter/alloc.h"
#include "tree_sitter/parser.h"
#include <string.h>

enum TokenType {
  STRING_BRACKET__OPEN,
  STRING_BRACKET__CLOSE,
  STRING_PART,
  STRING_MARKER,
  NUMBER,
};

typedef struct plsqloracle_scanner_data_t {
  struct {
    bool alt_string;
    char start_delimiter;
    char end_delimiter;
  } string;
} plsqloracle_scanner_data_t;

static bool string_check_if_string_end(TSLexer *lexer,
                                       plsqloracle_scanner_data_t *data);
static bool string_check_if_string_marker(TSLexer *lexer);
static bool number_is_digit(TSLexer *lexer);
static void number_scan_integer_part(TSLexer *lexer);

void *tree_sitter_plsqloracle_external_scanner_create() {
  plsqloracle_scanner_data_t *data =
      ts_malloc(sizeof(plsqloracle_scanner_data_t));
  data->string.alt_string = false;
  data->string.start_delimiter = '\0';
  data->string.end_delimiter = '\0';
  return data;
}

void tree_sitter_plsqloracle_external_scanner_destroy(void *payload) {
  plsqloracle_scanner_data_t *data = payload;

  ts_free(data);
  return;
}

unsigned tree_sitter_plsqloracle_external_scanner_serialize(void *payload,
                                                            char *buffer) {
  plsqloracle_scanner_data_t *data = payload;
  memcpy(buffer, data, sizeof(plsqloracle_scanner_data_t));
  return sizeof(plsqloracle_scanner_data_t);
}

void tree_sitter_plsqloracle_external_scanner_deserialize(void *payload,
                                                          const char *buffer,
                                                          unsigned length) {
  if (length == 0) {
    return;
  }
  plsqloracle_scanner_data_t *data = payload;

  memcpy(data, buffer, sizeof(plsqloracle_scanner_data_t));
  return;
}

static bool string_check_if_string_end(TSLexer *lexer,
                                       plsqloracle_scanner_data_t *data) {
  if (lexer->eof(lexer)) {
    return true;
  }

  if (data->string.alt_string &&
      lexer->lookahead == data->string.end_delimiter) {
    lexer->advance(lexer, false);
    if (lexer->lookahead == '\'') {
      lexer->advance(lexer, false);
      return true;
    }
  } else if (!data->string.alt_string && lexer->lookahead == '\'') {
    lexer->advance(lexer, false);
    if (lexer->lookahead != '\'') {
      return true;
    }
  }
  return false;
}

static bool string_check_if_string_marker(TSLexer *lexer) {
  if (lexer->lookahead == '%') {
    lexer->advance(lexer, false);
    switch (lexer->lookahead) {
    case '0':
    case '1':
    case '2':
    case '3':
    case '4':
    case '5':
    case '6':
    case '7':
    case '8':
    case '9':
    case 's':
      return true;
    default:
      return false;
    }
  }

  return false;
}

static bool number_is_digit(TSLexer *lexer) {
  switch (lexer->lookahead) {
  case '0':
  case '1':
  case '2':
  case '3':
  case '4':
  case '5':
  case '6':
  case '7':
  case '8':
  case '9':
    return true;
  default:
    return false;
  }
}

static void number_scan_integer_part(TSLexer *lexer) {
  while (number_is_digit(lexer)) {
    lexer->advance(lexer, false);
  }
}

bool tree_sitter_plsqloracle_external_scanner_scan(void *payload,
                                                   TSLexer *lexer,
                                                   const bool *valid_symbols) {
  plsqloracle_scanner_data_t *data = payload;
  if (valid_symbols[STRING_BRACKET__OPEN]) {
    while (lexer->lookahead == ' ' || lexer->lookahead == '\n' ||
           lexer->lookahead == '\r' || lexer->lookahead == '\t') {
      lexer->advance(lexer, true);
    }
    if (lexer->lookahead == 'q') {
      lexer->advance(lexer, false);
      if (lexer->lookahead == '\'') {
        lexer->advance(lexer, false);
        data->string.alt_string = true;
        data->string.start_delimiter = lexer->lookahead;

        switch (data->string.start_delimiter) {
        case '[': {
          data->string.end_delimiter = ']';
          break;
        }
        case '{': {
          data->string.end_delimiter = '}';
          break;
        }
        case '<': {
          data->string.end_delimiter = '>';
          break;
        }
        case '(': {
          data->string.end_delimiter = ')';
          break;
        }
        default:
          data->string.end_delimiter = data->string.start_delimiter;
        }

        lexer->result_symbol = STRING_BRACKET__OPEN;
        lexer->advance(lexer, false);
        lexer->mark_end(lexer);
        return true;
      }
    } else if (lexer->lookahead == '\'') {
      data->string.alt_string = false;
      data->string.start_delimiter = '\0';
      data->string.end_delimiter = '\0';
      lexer->result_symbol = STRING_BRACKET__OPEN;
      lexer->advance(lexer, false);
      lexer->mark_end(lexer);
      return true;
    }
  }
  if (valid_symbols[STRING_BRACKET__CLOSE]) {
    if (data->string.alt_string &&
        lexer->lookahead == data->string.end_delimiter) {
      lexer->advance(lexer, false);
      if (lexer->lookahead == '\'') {
        lexer->result_symbol = STRING_BRACKET__CLOSE;
        lexer->advance(lexer, false);
        lexer->mark_end(lexer);
        return true;
      }

    } else if (!data->string.alt_string && lexer->lookahead == '\'') {
      lexer->result_symbol = STRING_BRACKET__CLOSE;
      lexer->advance(lexer, false);
      lexer->mark_end(lexer);
      return true;
    }
  }
  if (valid_symbols[STRING_MARKER] && string_check_if_string_marker(lexer)) {
    lexer->advance(lexer, false);
    lexer->result_symbol = STRING_MARKER;
    lexer->mark_end(lexer);
    return true;
  }
  if (valid_symbols[STRING_PART]) {
    while (!string_check_if_string_end(lexer, data)) {
      lexer->advance(lexer, false);
      lexer->mark_end(lexer);
      if (string_check_if_string_marker(lexer)) {
        break;
      }
    }
    lexer->result_symbol = STRING_PART;
    return true;
  }

  if (valid_symbols[NUMBER]) {
    if (number_is_digit(lexer)) {
      number_scan_integer_part(lexer);
      lexer->result_symbol = NUMBER;
      lexer->mark_end(lexer);
      if (lexer->lookahead == '.') {
        lexer->advance(lexer, false);

        if (lexer->lookahead == '.') {
          return true;
        }
        if (!number_is_digit(lexer)) {
          lexer->mark_end(lexer);
          return true;
        }

        number_scan_integer_part(lexer);
        lexer->mark_end(lexer);
      }
      return true;
    }

    if (lexer->lookahead == '.') {
      lexer->advance(lexer, false);
      if (number_is_digit(lexer)) {
        number_scan_integer_part(lexer);
        lexer->result_symbol = NUMBER;
        lexer->mark_end(lexer);
        return true;
      }

      return false;
    }
  }
  return false;
}
