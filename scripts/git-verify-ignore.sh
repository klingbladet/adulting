#!/usr/bin/env sh

ignored=$(git ls-files -i -c --exclude-standard)
if ! [ "$ignored" = "" ]; then 
    echo "--- FILES THAT ARE IGNORED ARE IN REPO!!! ---"
    echo "files which were found in repo:"
    echo "$ignored"
    echo
    echo "if the files are api keys or something else small, then reset that key and remove the files from the repo."
    echo "if the files/dirs are really big, like node_modules, request help from the git-master"
    exit 1
else
    echo "did not find any files/dirs in the repo which should be ignored."
fi
