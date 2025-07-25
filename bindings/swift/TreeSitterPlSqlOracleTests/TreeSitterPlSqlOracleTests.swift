import XCTest
import SwiftTreeSitter
import TreeSitterPlsqloracle

final class TreeSitterPlsqloracleTests: XCTestCase {
    func testCanLoadGrammar() throws {
        let parser = Parser()
        let language = Language(language: tree_sitter_plsqloracle())
        XCTAssertNoThrow(try parser.setLanguage(language),
                         "Error loading PL/SQL Oracle grammar")
    }
}
