#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
MANIFEST="$PROJECT_DIR/manifest.yaml"
SRC_SKILLS="$PROJECT_DIR/skills"
SRC_AGENTS="$PROJECT_DIR/sub-agent"
SRC_COMMANDS="$PROJECT_DIR/commands"
DIST_DIR="$PROJECT_DIR/dist"

OPENCODE_SKILLS="$DIST_DIR/opencode-plugin/skills"
CLAUDE_SKILLS="$DIST_DIR/claudecode-plugin/skills"
CLAUDE_AGENTS="$DIST_DIR/claudecode-plugin/agents"
OPENCODE_COMMANDS="$DIST_DIR/opencode-plugin/commands"
CLAUDE_COMMANDS="$DIST_DIR/claudecode-plugin/commands"

OPENCODE_CFG="$HOME/.config/opencode/skills"
CLAUDE_CFG_SKILLS="$HOME/.claude/skills"
CLAUDE_CFG_AGENTS="$HOME/.claude/agents"
OPENCODE_CFG_COMMANDS="$HOME/.config/opencode/commands"
CLAUDE_CFG_COMMANDS="$HOME/.claude/commands"

# ================================================================
# Parse manifest.yaml, emit "type:name:platform" one per line
# ================================================================
parse_manifest() {
    local section=""
    local current_name=""

    while IFS= read -r line; do
        [[ "$line" =~ ^[[:space:]]*# ]] && continue
        [[ -z "${line// /}" ]] && continue

        if [[ "$line" =~ ^skills: ]]; then
            section="skill"
            continue
        elif [[ "$line" =~ ^sub_agents: ]]; then
            section="agent"
            continue
        elif [[ "$line" =~ ^commands: ]]; then
            section="command"
            continue
        fi

        if [[ "$line" =~ ^[[:space:]]*-[[:space:]]*name:[[:space:]]*(.+)$ ]]; then
            current_name="${BASH_REMATCH[1]}"
            current_name="${current_name//\"/}"
            current_name="${current_name//\'/}"
            current_name="$(echo "$current_name" | xargs)"
        elif [[ "$line" =~ ^[[:space:]]*platforms:[[:space:]]*\[([^]]+)\] ]]; then
            local raw="${BASH_REMATCH[1]}"
            for plat in $(echo "$raw" | tr ',' ' '); do
                plat="$(echo "$plat" | xargs)"
                echo "${section}:${current_name}:${plat}"
            done
        fi
    done < "$MANIFEST"
}

# ================================================================
# Convert skill.md → SKILL.md for OpenCode
#   - Adds compatibility: opencode
#   - Moves version into metadata block
# ================================================================
convert_for_opencode() {
    local input="$1"
    local output="$2"

    local version=""
    if grep -q "^version:" "$input" 2>/dev/null; then
        version=$(grep "^version:" "$input" | head -1 | sed 's/^version:[[:space:]]*//;s/^"//;s/"$//' | xargs)
    fi

    awk -v ver="$version" '
    BEGIN { in_front = 0; front_done = 0 }
    /^---$/ {
        if (in_front == 0) {
            print "---"
            in_front = 1
            next
        } else {
            if (front_done == 0) {
                print "compatibility: opencode"
                if (ver != "") {
                    print "metadata:"
                    print "  version: " ver
                }
                front_done = 1
            }
            print "---"
            in_front = 0
            next
        }
    }
    {
        if (in_front == 1) {
            if (/^version:/) next
            if (/^compatibility:/) next
        }
        print
    }
    ' "$input" > "$output"
}

# ================================================================
# Convert skill.md → SKILL.md for Claude Code
#   (copy as-is — Claude Code ignores unknown frontmatter fields)
# ================================================================
convert_for_claude() {
    cp "$1" "$2"
}

# ================================================================
# Convert command.md for Claude Code
#   Strip YAML frontmatter — Claude Code commands are plain Markdown
# ================================================================
convert_command_for_claude() {
    local input="$1"
    local output="$2"

    awk '
    BEGIN { in_front = 0; front_done = 0 }
    /^---$/ {
        if (in_front == 0) {
            in_front = 1
            next
        } else {
            in_front = 0
            front_done = 1
            next
        }
    }
    {
        if (in_front == 1) next
        if (front_done == 0) next
        print
    }
    ' "$input" > "$output"
}

# ================================================================
# Build: read manifest + source files → generate dist/
# ================================================================
build() {
    echo "==> Building plugins..."

    rm -rf "$OPENCODE_SKILLS" "$CLAUDE_SKILLS" "$CLAUDE_AGENTS" "$OPENCODE_COMMANDS" "$CLAUDE_COMMANDS"
    mkdir -p "$OPENCODE_SKILLS" "$CLAUDE_SKILLS" "$CLAUDE_AGENTS" "$OPENCODE_COMMANDS" "$CLAUDE_COMMANDS"

    local count_skill=0
    local count_agent=0
    local count_command=0
    local entries
    entries=$(parse_manifest)

    if [[ -z "$entries" ]]; then
        echo "  (manifest is empty, nothing to build)"
        return
    fi

    while IFS=: read -r type name platform; do
        if [[ "$type" == "skill" ]]; then
            local src="$SRC_SKILLS/$name/skill.md"
            if [[ ! -f "$src" ]]; then
                echo "  [WARN] skill source not found: $src" >&2
                continue
            fi

            if [[ "$platform" == "opencode" ]]; then
                local dest_dir="$OPENCODE_SKILLS/$name"
                mkdir -p "$dest_dir"
                convert_for_opencode "$src" "$dest_dir/SKILL.md"
                echo "  [skill] $name → opencode"
                count_skill=$((count_skill + 1))
            fi

            if [[ "$platform" == "claudecode" ]]; then
                local dest_dir="$CLAUDE_SKILLS/$name"
                mkdir -p "$dest_dir"
                convert_for_claude "$src" "$dest_dir/SKILL.md"
                echo "  [skill] $name → claudecode"
                count_skill=$((count_skill + 1))
            fi
        elif [[ "$type" == "agent" ]]; then
            local src="$SRC_AGENTS/$name.md"
            if [[ ! -f "$src" ]]; then
                echo "  [WARN] agent source not found: $src" >&2
                continue
            fi

            if [[ "$platform" == "claudecode" ]]; then
                local dest_dir="$CLAUDE_AGENTS/$name"
                mkdir -p "$dest_dir"
                cp "$src" "$dest_dir/AGENT.md"
                echo "  [agent] $name → claudecode"
                count_agent=$((count_agent + 1))
            fi

            if [[ "$platform" == "opencode" ]]; then
                echo "  [NOTE] agent $name: OpenCode sub-agent support not yet implemented" >&2
            fi
        elif [[ "$type" == "command" ]]; then
            local src="$SRC_COMMANDS/$name.md"
            if [[ ! -f "$src" ]]; then
                echo "  [WARN] command source not found: $src" >&2
                continue
            fi

            if [[ "$platform" == "opencode" ]]; then
                cp "$src" "$OPENCODE_COMMANDS/$name.md"
                echo "  [command] $name → opencode"
                count_command=$((count_command + 1))
            fi

            if [[ "$platform" == "claudecode" ]]; then
                convert_command_for_claude "$src" "$CLAUDE_COMMANDS/$name.md"
                echo "  [command] $name → claudecode"
                count_command=$((count_command + 1))
            fi
        fi
    done <<< "$entries"

    echo "==> Build done: $count_skill skill(s), $count_agent agent(s), $count_command command(s)"
}

# ================================================================
# _symlink_skill_dirs: helper to symlink individual skill dirs
# ================================================================
_symlink_files() {
    local src_parent="$1"
    local dst_parent="$2"
    local label="$3"

    if [[ ! -d "$src_parent" ]] || [[ -z "$(ls -A "$src_parent" 2>/dev/null)" ]]; then
        return
    fi

    mkdir -p "$dst_parent"

    for item in "$src_parent"/*; do
        local name
        name="$(basename "$item")"
        local target="$dst_parent/$name"
        if [[ -f "$target" ]] || [[ -L "$target" ]]; then
            rm "$target"
        elif [[ -e "$target" ]]; then
            echo "  [SKIP] $target exists (not a file or symlink)" >&2
            continue
        fi
        ln -sfn "$(cd "$(dirname "$item")" && pwd)/$name" "$target"
        echo "  [install] $label: $name"
    done
}

_symlink_dirs() {
    local src_parent="$1"
    local dst_parent="$2"
    local label="$3"

    if [[ ! -d "$src_parent" ]] || [[ -z "$(ls -A "$src_parent" 2>/dev/null)" ]]; then
        return
    fi

    mkdir -p "$dst_parent"

    for item_dir in "$src_parent"/*/; do
        local name
        name="$(basename "$item_dir")"
        local target="$dst_parent/$name"
        if [[ -d "$target" ]]; then
            if [[ -L "$target" ]]; then
                rm "$target"
            else
                echo "  [SKIP] $target exists (not a symlink)" >&2
                continue
            fi
        fi
        ln -sfn "$(cd "$item_dir" && pwd)" "$target"
        echo "  [install] $label: $name"
    done
}

# ================================================================
# Install: symlink dist/ to platform config directories
# ================================================================
install() {
    echo "==> Installing plugins..."

    _symlink_dirs  "$OPENCODE_SKILLS"    "$OPENCODE_CFG"          "opencode skill"
    _symlink_dirs  "$CLAUDE_SKILLS"     "$CLAUDE_CFG_SKILLS"     "claudecode skill"
    _symlink_dirs  "$CLAUDE_AGENTS"     "$CLAUDE_CFG_AGENTS"     "claudecode agent"
    _symlink_files "$OPENCODE_COMMANDS" "$OPENCODE_CFG_COMMANDS" "opencode command"
    _symlink_files "$CLAUDE_COMMANDS"   "$CLAUDE_CFG_COMMANDS"   "claudecode command"

    echo "==> Install done"
}

# ================================================================
# Clean
# ================================================================
clean() {
    echo "==> Cleaning dist/..."
    rm -rf "$DIST_DIR"/*
    echo "==> Clean done"
}

# ================================================================
# Main
# ================================================================
case "${1:-}" in
    build)
        build
        ;;
    install)
        install
        ;;
    all)
        build && install
        ;;
    clean)
        clean
        ;;
    *)
        echo "Usage: $0 {build|install|all|clean}"
        echo ""
        echo "  build    - Generate dist/ from source files per manifest.yaml"
        echo "  install  - Symlink dist/ to platform config directories"
        echo "  all      - build + install"
        echo "  clean    - Remove dist/ contents"
        exit 1
        ;;
esac
