#!/usr/bin/env bash

read -r -p "gitlab token: " GITLAB_TOKEN
encoded_auth=$(echo -n "asdf:$GITLAB_TOKEN" | base64 -w 0)
config="{ \"auths\": { \"registry.chas-lab.dev\": { \"auth\": \"$encoded_auth\" } } }"
encoded_config=$(echo -n "$config" | base64 -w 0)
secret_config="apiVersion: v1
kind: Secret
metadata:
  name: registry-credentials
data:
  .dockerconfigjson: $encoded_config
type: kubernetes.io/dockerconfigjson
"

echo "encoded_auth_lenght: ${#encoded_auth}"


echo "$secret_config" > ./deploy/secret.yml
