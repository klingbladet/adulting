#!/usr/bin/env bash

if [[ -z "$VERSION" ]]; then
    echo "VERSION variable not set"
    exit 1
fi

delete-resource () {
    local kind=$1
    local resources=""
    resources=$(kubectl get "$kind" -l "env=${VERSION}" -o json | yq -pj ".items.[].metadata.name")
    if [[ -n "$resources" ]]; then
        echo "--- '$kind' resources deleting with version '$VERSION'"
        # shellcheck disable=SC2086
        kubectl delete "$kind" $resources
        echo
    else
        echo "--- '$kind' resources not found with version '$VERSION'"
    fi
}


resources_delete=(
    "jobs"
    "secret"
    "configmap"
    "deploy"
    "statefulset"
    "service"
    "ingress"
    "middleware"
)

for extra in "${@}"; do
    resources_delete+=("$extra")
done


for r in "${resources_delete[@]}"; do
    delete-resource "$r"
done
