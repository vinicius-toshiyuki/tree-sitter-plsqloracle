((comment) @injection.content
 (#set! injection.language "comment"))

((select) @injection.content
 (#set! injection.include-children)
 (#set! injection.language "sql"))
