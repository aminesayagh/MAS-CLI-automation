#!/bin/bash

mkdir -p docs

echo "🚀 Starting comprehensive documentation generation..."

# Generate tree structure with specific ignores
TREE_OUTPUT=$(tree -a -I 'node_modules|.git|.next|dist|.turbo|.cache|.vercel|coverage' \
     --dirsfirst \
     --charset=ascii)

{
  echo "# Project Tree Structure"
  echo "\`\`\`plaintext"
  echo "$TREE_OUTPUT"
  echo "\`\`\`"
} > docs/doc-project-tree.md

EXCLUDE_FILES="node_modules|dist|package-lock.json"

echo "🚀 Generating comprehensive documentation..."

cw doc \
    --pattern "src/.*\.ts$" \
    --exclude "$EXCLUDE_FILES" \
    --output docs/doc-project.md \
    --compress true

cw doc \
    --pattern "package.json|eslint.config.mjs|babel.config.js|tsconfig.json|README.md|run.sh" \
    --exclude "$EXCLUDE_FILES" \
    --output docs/doc-project-config.md \
    --compress true

echo "🚀 Documentation generation completed!"


