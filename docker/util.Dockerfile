FROM alpine:latest

RUN apk add --no-cache \
    kubectl \
    kustomize \
    helm
