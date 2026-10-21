#!/bin/bash

for file in ./decks/*.sql; do
  sqlite3 puzzle.sqlite < "$file"
done



