#!/bin/bash
# Liara runs this file just before the application starts.
#
# Two things have to happen on Liara's own machine, not on the machine the
# project was zipped on:
#
# 1. The Prisma client has to be built for Liara's platform. The one that
#    was generated locally is for Windows and will not load on their server.
# 2. The database has to have the tables the app expects, and the content
#    (the foods, the articles, the exercises, the plans) has to be in it.
#
# Everything here is idempotent, so it is safe to run on every restart: the
# seed only adds what is missing and never overwrites a change.

echo "[pre-start] building the Prisma client for this server..."
npx prisma generate || echo "[pre-start] WARNING: prisma generate failed"

echo "[pre-start] bringing the database up to the schema..."
npx prisma db push --skip-generate || echo "[pre-start] WARNING: the database could not be updated"

echo "[pre-start] making sure the content is in the database..."
npm run db:seed --silent || echo "[pre-start] WARNING: the seed could not run"

echo "[pre-start] done, starting the app."
