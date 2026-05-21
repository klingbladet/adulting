#!/usr/bin/env bash

set -e

# this script checks which secrets exist for a specific version, if a secret is missing, it is applied

if [[ -z "$VERSION" ]]; then
    echo "VERSION var needs to be set"
    return 1
fi

kustomization_file="./deploy/app/kustomization.yml"

echo "=== getting existing secrets with version '$VERSION'"

secrets=$(kubectl get secrets -o json | yq -pj -oj ".items[] | select(.metadata.labels.env == \"$VERSION\")")

for file in ./deploy/app/*.yml; do
    file_content=$(<"$file")
    if [[ "$(yq '.kind' <<< "$file_content")" != "Secret" ]]; then
        continue
    fi
    name=$(yq '.metadata.name' <<< "$file_content")
    name_with_prefix="${VERSION}-adulting-${name}"

    matching_secret=$(yq -pj -oj ". | select(.metadata.name == \"$name_with_prefix\")" <<< "$secrets")

    if [[ -n "$matching_secret" ]]; then
        echo "--- secret named '$name_with_prefix' already exists, skipped adding"
        continue
    else
        echo "--- no existing secret named '$name_with_prefix' adding secret to kustomization"
    fi

    set +e
    ./scripts/inject-passwords.sh "$file"
    set -e

    echo "--- updating $kustomization_file"
    yq -i ".resources = [\"$(basename "$file")\"] + .resources" "$kustomization_file"

    echo
done
