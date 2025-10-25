/**
 * @typedef {object} Grammar
 * @property {string} [$schema]
 * @property {string} name The name of the grammar
 * @property {string} [inherits] The name of the parent grammar
 * @property {object} rules
 * @property {array} [extras]
 * @property {array} [precedences]
 * @property {object} [reserved]
 * @property {array} [externals]
 * @property {array} [inline]
 * @property {array} [conflicts]
 * @property {string} [word]
 * @property {array} [supertypes] A list of hidden rule names that should be considered supertypes in the generated node types file. See https://tree-sitter.github.io/tree-sitter/using-parsers/6-static-node-types.
 */

require("os");
const fs = require("fs");
const path = require("path");

const filePath = process.argv[2];
/** @type {Grammar} */
let json;
try {
  json = JSON.parse(fs.readFileSync(filePath, { encoding: "utf8" }));
} catch {
  console.error("Failed to read/parse json file: " + filePath);
}

function findProperties(object, filter, output) {
  switch (typeof object) {
    case "string":
    case "number":
    case "bigint":
    case "boolean":
    case "symbol":
    case "undefined":
    case "function":
      return;
    case "object": {
      if (Array.isArray(object)) {
        object.forEach((value) => {
          if (filter(value)) {
            output.push(value);
          }
          findProperties(value, filter, output);
        });
      } else {
        Object.values(object).forEach((value) => {
          if (filter(value)) {
            output.push(value);
          }
          findProperties(value, filter, output);
        });
      }
    }
  }
}

const ALIAS = [];
findProperties(
  json.rules,
  (value) => typeof value === "object" && value.type === "ALIAS" && value.named,
  ALIAS,
);
const SYMBOL = [];
findProperties(
  json.rules,
  (value) =>
    typeof value === "object" &&
    value.type === "SYMBOL" &&
    typeof value.name === "string",
  SYMBOL,
);
const RULE = Object.fromEntries([
  ...Object.keys(json.rules).map((key) => [key.toUpperCase(), key]),
  ...ALIAS.map((alias) => [alias.value.toUpperCase(), alias.value]),
  ...SYMBOL.map((symbol) => [symbol.name.toUpperCase(), symbol.name]),
]);

let FIELD = [];
findProperties(
  json.rules,
  (value) => typeof value === "object" && value.type === "FIELD",
  FIELD,
);
FIELD = Object.fromEntries(
  FIELD.map((field) => [field.name.toUpperCase(), field.name]),
);

const GRAMMAR = {
  RULE,
  FIELD,
};

fs.writeFileSync(
  path.join(__dirname, "grammar-constants.ts"),
  `export const GRAMMAR = ${JSON.stringify(GRAMMAR, undefined, 4)};`,
  { encoding: "utf8" },
);
