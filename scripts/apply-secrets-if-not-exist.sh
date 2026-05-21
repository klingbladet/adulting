#!/usr/bin/env bash

set -e

# this script checks which secrets exist for a specific version, if a secret is missing, it is applied

if [[ -z "$VERSION" ]]; then
    echo "VERSION var needs to be set"
    return 1
fi

prefix="${VERSION}-adulting-"

get_previous_password() {
    secret_name=$1
    password_name=$2
    password_file="deploy/app/${password_name}.txt"
    set +e
    password=$(kubectl get secret "$prefix$secret_name" -o jsonpath="{.data.${password_name}}")
    set -e

    if [[ -n "$password" ]]; then
        echo "used existing password for '$secret_name'"
        echo "$password" | base64 -d > "$password_file"
    else
        echo "generated new password for '$secret_name'"
        new_password=$(tr -dc 'A-Za-z0-9' < /dev/urandom | head -c 64)
        printf '%s' "$new_password" > "$password_file"
    fi
}

get_previous_password env-postgres POSTGRES_PASSWORD
get_previous_password env-auth BETTER_AUTH_SECRET
