#!/bin/bash

# generate-types.sh
# Automatically generates TypeScript types from OpenAPI specifications
# Maps docs folder structure to src/types output structure

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Base directories
DOCS_DIR="docs"
TYPES_DIR="src/types"

# Ensure we're in the project root
if [ ! -f "package.json" ]; then
    echo -e "${RED}Error: Must be run from project root${NC}"
    exit 1
fi

# Create output directory if it doesn't exist
mkdir -p "${TYPES_DIR}"

echo -e "${BLUE}╔════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  OpenAPI TypeScript Type Generator        ║${NC}"
echo -e "${BLUE}╔════════════════════════════════════════════╗${NC}"
echo ""

# Counter for generated files
GENERATED_COUNT=0
SKIPPED_COUNT=0
ERROR_COUNT=0

# Function to generate types from OpenAPI spec
generate_types() {
    local input_file="$1"
    local output_file="$2"
    local spec_name="$3"

    echo -e "${YELLOW}→${NC} Generating: ${spec_name}"
    echo -e "  ${BLUE}Input:${NC}  ${input_file}"
    echo -e "  ${BLUE}Output:${NC} ${output_file}"

    if [ ! -f "${input_file}" ]; then
        echo -e "  ${RED}✗ Error: Input file not found${NC}"
        ((ERROR_COUNT++))
        return 1
    fi

    # Generate types using openapi-typescript, ensuring --dts is used for declaration files
    if npx openapi-typescript "${input_file}" -o "${output_file}" --silent --dts 2>/dev/null; then
        echo -e "  ${GREEN}✓ Success${NC}"
        ((GENERATED_COUNT++)) # Increment GENERATED_COUNT on success
    else
        echo -e "  ${RED}✗ Failed to generate types${NC}"
        ((ERROR_COUNT++))
        return 1
    fi

    echo ""
}

echo -e "${GREEN}Processing OpenAPI Specifications...${NC}"
echo ""

# Find all OpenAPI JSON files in the docs directory
# Use a subshell for find to avoid issues with `while read` and `continue`
(
    find "${DOCS_DIR}" -type f -name "*.json" | while read -r input_file; do
    # Extract relative path from DOCS_DIR
    relative_path="${input_file#${DOCS_DIR}/}"

    # Determine the output filename
    # Example: docs/sell-account/v1/sell_account_v1.json -> src/types/sell-account/v1/sellAccountV1.d.ts
    # The output filename should be camelCase and end with .ts
    
    # Extract directory path relative to DOCS_DIR, e.g., "sell-apps/account-management"
    output_dir="${TYPES_DIR}/$(dirname "${relative_path}")"
    
    # Create the corresponding output directory structure in TYPES_DIR
    mkdir -p "${output_dir}"

    # Convert the base filename (e.g., sell_account_v1_oas3) to camelCase (sellAccountV1Oas3)
    # Also remove "_oas3" or "_oas3_beta" suffixes before camelCasing if desired,
    # but for now, let's keep them as part of the name for uniqueness.
    base_filename_no_ext=$(basename "${input_file}" .json)
    camel_case_filename=$(echo "${base_filename_no_ext}" | awk -F'[_.-]' '{
        out = tolower($1);
        for (i = 2; i <= NF; i++) {
            out = out toupper(substr($i,1,1)) tolower(substr($i,2));
        }
        print out;
    }') 

    output_path="${output_dir}/${camel_case_filename}.ts"

    # Spec name for logging
    spec_name="${camel_case_filename}"

    # Check if the input file actually exists (should always be true from find)
    # Skip generation for files that are not OpenAPI specs (e.g., production_scopes.json)
    # A simple check is to see if it contains "openapi" or "swagger" top-level keys
    if ! grep -q -E '"openapi"|"swagger"' "${input_file}"; then
        echo -e "  ${YELLOW}⚠ Skipping: Not an OpenAPI spec (missing 'openapi' or 'swagger' key)${NC}"
        ((SKIPPED_COUNT++))
        continue
    fi
    if [ ! -f "${input_file}" ]; then
        echo -e "  ${RED}✗ Error: Input file not found (unexpected)${NC}"
        ((ERROR_COUNT++))
        continue
    fi

    generate_types "${input_file}" "${output_path}" "${spec_name}"
done
)

# Summary
echo -e "${BLUE}╔════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  Generation Summary                        ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════╝${NC}"
echo ""
echo -e "  ${GREEN}✓ Generated:${NC} ${GENERATED_COUNT} files"
echo -e "  ${YELLOW}⚠ Skipped:${NC}   ${SKIPPED_COUNT} files"
echo -e "  ${RED}✗ Errors:${NC}    ${ERROR_COUNT} files"
echo ""

if [ ${ERROR_COUNT} -gt 0 ]; then
    echo -e "${RED}Generation completed with errors${NC}"
    exit 1
else
    echo -e "${GREEN}All types generated successfully!${NC}"
    echo ""
    echo -e "${BLUE}Types location:${NC} ${TYPES_DIR}"
    exit 0
fi
