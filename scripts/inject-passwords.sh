#!/usr/bin/env sh

if [ "$#" -ne 1 ]; then
    echo "takes in 1 argument, got $#"
    exit 1
fi

file=$1

if ! [ -f "$file" ]; then
    echo "provided file does not exist: $file"
    exit 2
fi

i=0
while grep "PASSWORD_REPLACE" "$file" > /dev/null; do
    PASS=$(tr -dc 'A-Za-z0-9' < /dev/urandom | head -c 64)
    new_content=$(awk "NR==1,/PASSWORD_REPLACE/{sub(/PASSWORD_REPLACE/, \"${PASS}\")} 1" "$file")
    printf '%s' "$new_content" > "$file"
    i=$((i+1))
done

echo "injected $i passwords in $file"
