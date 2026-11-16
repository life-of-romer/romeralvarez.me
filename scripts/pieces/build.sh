#!/bin/sh
# Turn a generated model into a piece the site can draw:
#   scripts/pieces/build.sh <raw.glb> <name>
# bakes the texture into the mesh with the logo's own colours (palettes.json), stands it upright facing
# front, compresses it with meshopt and writes public/models/tech/<name>.glb.
set -e
here="$(cd "$(dirname "$0")" && pwd)"
tmp="$(mktemp -d)"
palette="$(python3 -c "import json,sys; print(json.load(open('$here/palettes.json')).get('$2',''))")"
python3 "$here/bake.py" "$1" "$tmp/baked.glb" $palette
npx -y @gltf-transform/cli@4 optimize "$tmp/baked.glb" "$here/../../public/models/tech/$2.glb" --compress meshopt | tail -1
rm -rf "$tmp"
