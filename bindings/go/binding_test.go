package tree_sitter_plsqloracle_test

import (
	"testing"

	tree_sitter "github.com/tree-sitter/go-tree-sitter"
	tree_sitter_plsqloracle "github.com/tree-sitter/tree-sitter-plsqloracle/bindings/go"
)

func TestCanLoadGrammar(t *testing.T) {
	language := tree_sitter.NewLanguage(tree_sitter_plsqloracle.Language())
	if language == nil {
		t.Errorf("Error loading PL/SQL Oracle grammar")
	}
}
