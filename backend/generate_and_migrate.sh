#!/usr/bin/env sh

pnpm db:generate || return 1
pnpm db:migrate  || return 2
