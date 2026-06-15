#!/usr/bin/env bash

# Exit on error
set -e

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

# Go to project root
cd "$PROJECT_DIR"

# Determine platform
PLATFORM="${1:-all}"

# Help command
if [ "$PLATFORM" = "-h" ] || [ "$PLATFORM" = "--help" ]; then
    echo "Usage: ./scripts/build.sh [firefox|chrome|all]"
    exit 0
fi

# Function to extract zip file
extract_zip() {
    local zip_file="$1"
    local dest_dir="$2"
    
    mkdir -p "$dest_dir"
    
    if command -v unzip >/dev/null 2>&1; then
        unzip -o "$zip_file" -d "$dest_dir"
    elif command -v tar >/dev/null 2>&1; then
        tar -xf "$zip_file" -C "$dest_dir"
    else
        echo "Error: Neither unzip nor tar found to extract the archive." >&2
        exit 1
    fi
}

build_platform() {
    local target="$1"
    echo "=== Building $target ==="
    
    # 1. Clean up old manifest and dist directories
    rm -f src/manifest.json
    rm -rf "dist/$target"
    
    # Ensure src/manifest.json cleanup on exit/error
    trap 'rm -f src/manifest.json' EXIT
    
    # 2. Merge manifests
    node scripts/utility/merge.js src/manifest.common.json "src/manifest.$target.json" src/manifest.json
    
    # 3. Lint extension
    node scripts/utility/lint.js "$target"
    
    # 4. Build extension
    local tmp_dir
    tmp_dir=$(mktemp -d 2>/dev/null || mktemp -d -t 'tmp')
    
    npx web-ext build \
      --source-dir    ./src \
      --artifacts-dir "$tmp_dir" \
      --overwrite-dest \
      --no-input \
      --ignore-files manifest.firefox.json manifest.chrome.json manifest.common.json
      
    # 5. Copy zip next to target dir and extract
    local zip_file
    shopt -s nullglob
    local zip_files=("$tmp_dir"/*.zip)
    shopt -u nullglob
    
    if [ ${#zip_files[@]} -eq 0 ]; then
        echo "Error: Build failed, no zip file generated." >&2
        rm -rf "$tmp_dir"
        exit 1
    fi
    zip_file="${zip_files[0]}"
    
    mkdir -p dist
    local dest_zip="dist/${target}.zip"
    cp "$zip_file" "$dest_zip"
    
    extract_zip "$dest_zip" "dist/$target"
    
    # Clean up
    rm -rf "$tmp_dir"
    rm -f src/manifest.json
    trap - EXIT
    
    echo "=== Build $target complete: dist/$target ==="
    echo ""
}

# Run build based on platform
if [ "$PLATFORM" = "firefox" ]; then
    build_platform "firefox"
elif [ "$PLATFORM" = "chrome" ]; then
    build_platform "chrome"
elif [ "$PLATFORM" = "all" ]; then
    build_platform "firefox"
    build_platform "chrome"
else
    echo "Error: Invalid platform '$PLATFORM'. Choose firefox, chrome, or all." >&2
    exit 1
fi
