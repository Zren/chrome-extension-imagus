#!/bin/bash

VERSION_INFO_URL="https://tiny.cc/Imagus-sieve-info"
SIEVE_URL="https://tiny.cc/Imagus-sieve"
SIEVE_VER_FILE="src/info.json"
SIEVE_FILE="minified/sieve.jsn"
UNMINIFIED_SIEVE_FILE="src/sieve.jsn"


LOCAL_VER="$(jq '.sieve_ver' "$SIEVE_VER_FILE")"
echo "Local version: $LOCAL_VER"

REMOTE_VER_JSON="$(curl --silent --show-error --location "$VERSION_INFO_URL")"
if [[ "$?" -ne 0 ]]; then
    echo "Failed to fetch latest sieve version from $VERSION_INFO_URL"
    exit $?
fi

REMOTE_VER="$(echo "$REMOTE_VER_JSON" | jq '.sieve_ver')"
if [[ "$?" -ne 0 ]]; then
    echo "Failed to parse latest sieve version from:\n $(echo -- "$REMOTE_VER_JSON" | head -c 100) [...]"
    exit $?
fi
echo "Remote version: $REMOTE_VER"

if [[ "$1" != "--force" &&  "$REMOTE_VER" -eq "$LOCAL_VER" ]]; then
    echo "Already up to date"
    exit 0
fi

MINIFIED_SIEVE="$(curl --silent --show-error --location "$SIEVE_URL")"
if [[ "$?" -ne 0 ]] || [[ -z "$MINIFIED_SIEVE" ]]; then
    echo "Failed to fetch sieve from $SIEVE_URL"
    exit $?
fi

UNMINIFIED_SIEVE="$(echo "$MINIFIED_SIEVE" | jq)"
if [[ "$?" -ne 0 ]] || [[ -z "$UNMINIFIED_SIEVE" ]]; then
    echo "Failed to parse sieve:\n $(echo -- "$MINIFIED_SIEVE" | head -c 100) [...]"
    exit $?
fi

set -e

rm -f "$SIEVE_FILE"
echo -n "$MINIFIED_SIEVE" > "$SIEVE_FILE"

rm -f "$UNMINIFIED_SIEVE_FILE"
echo "$UNMINIFIED_SIEVE" > "$UNMINIFIED_SIEVE_FILE"

rm -f "$SIEVE_VER_FILE"
echo -n "$REMOTE_VER_JSON" > "$SIEVE_VER_FILE"

echo "Update complete, run \"git diff $UNMINIFIED_SIEVE_FILE\" to see the changes."
