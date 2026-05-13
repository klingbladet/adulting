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
while grep "PASSWORD_REPLACE_$i" "$file" > /dev/null; do
    PASS=$(tr -dc 'A-Za-z0-9' < /dev/urandom | head -c 64)
    sed -i "s/PASSWORD_REPLACE_${i}/${PASS}/" "$file"
    echo "replaced 'PASSWORD_REPLACE_$i' for a random password"
    i=$((i+1))
done

echo "added $i passwords"
