#!/usr/bin/env bash

if [[ -z "$VERSION" ]]; then
    echo "VERSION variable not set"
    exit 1
fi

seperator="-"

if [[ -n "$SEP" ]]; then
    seperator=$SEP
fi

delete-resource () {
    local kind=$1
    local resources=""
    resources=$(kubectl get "$kind" -o json \
        | jq '.items.[].metadata.name' -r \
        | grep -E "^${VERSION}${seperator}.*$")
    if [[ -n "$resources" ]]; then
        echo "--- '$kind' resources deleting with version '$VERSION' ---"
        # shellcheck disable=SC2086
        kubectl delete "$kind" $resources
        echo
    else
        echo "--- '$kind' resources not found with version '$VERSION' ---"
    fi
}

delete-resource deploy
delete-resource service
delete-resource secret
delete-resource statefulset
delete-resource jobs
delete-resource ingress
delete-resource middleware
delete-resource configmap
