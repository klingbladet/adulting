#!/usr/bin/env bash

if [[ -z "$VERSION" ]]; then
    echo "VERSION variable not set"
    exit 1
fi


delete-resource () {
    local kind=$1
    local resources=""
    resources=$(kubectl get "$kind" -o json \
        | jq '.items.[].metadata.name' -r \
        | grep -E "^$VERSION\..*$")
    if [[ -n "$resources" ]]; then
        echo "--- '$kind' resources deleting with version '$VERSION' ---"
        kubectl delete "$kind" $resources
    else
        echo "--- '$kind' resources not found with version '$VERSION' ---"
    fi
}

delete-resource deploy
delete-resource service
