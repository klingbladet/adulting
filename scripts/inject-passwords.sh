#!/usr/bin/env sh

set -e

if [ "$#" -ne 1 ]; then
    echo "takes in 1 argument, got $#"
    exit 1
fi

FILE=$1

if ! [ -f "$FILE" ]; then
    echo "provided file does not exist: $FILE"
    exit 2
fi

REPLACE=PASSWORD_REPLACE

i=0
while grep "$REPLACE" "$FILE" > /dev/null; do
    PASS=$(tr -dc 'A-Za-z0-9' < /dev/urandom | head -c 64)

    # https://unix.stackexchange.com/a/188269
    NEW=$(awk "NR==1,/${REPLACE}/{sub(/${REPLACE}/, \"${PASS}\")} 1" "$FILE")
    printf '%s' "$NEW" > "$FILE"
    i=$((i+1))
done

echo "injected $i passwords in $FILE"
