"""Quick front-view preview of baked GLBs (plain float accessors): render.py out.png a-baked.glb b-baked.glb ..."""
import json, struct, sys
import numpy as np
from PIL import Image, ImageDraw
def load(p):
    b = open(p, "rb").read(); jl = struct.unpack("<I", b[12:16])[0]
    j = json.loads(b[20:20 + jl]); bin0 = b[20 + jl + 8:]
    def acc(i, dt, n):
        a = j["accessors"][i]; v = j["bufferViews"][a["bufferView"]]
        return np.frombuffer(bin0, dt, a["count"] * n, v.get("byteOffset", 0)).reshape(a["count"], n)
    pr = j["meshes"][0]["primitives"][0]; at = pr["attributes"]
    return acc(at["POSITION"], np.float32, 3), acc(at["NORMAL"], np.float32, 3), acc(at["COLOR_0"], np.float32, 3), acc(pr["indices"], np.uint32, 1).reshape(-1, 3)
T = 300; files = sys.argv[2:]
sheet = Image.new("RGB", (T * len(files), T), "#f2f3f5")
L = np.array([0.35, 0.5, 0.8]); L /= np.linalg.norm(L)
for k, f in enumerate(files):
    pos, nor, col, tri = load(f)
    c = (pos.max(0) + pos.min(0)) / 2; s = (T * 0.84) / (pos.max(0) - pos.min(0))[:2].max()
    xy = np.stack([(pos[:, 0] - c[0]) * s + T / 2, T / 2 - (pos[:, 1] - c[1]) * s], 1)
    fn = nor[tri].mean(1); keep = fn[:, 2] > 0
    shade = 0.45 + 0.55 * np.clip(fn @ L, 0, 1)
    fc = np.clip(col[tri].mean(1), 0, 1); fc = np.where(fc <= 0.0031308, fc * 12.92, 1.055 * fc ** (1 / 2.4) - 0.055) * shade[:, None]
    order = np.argsort(pos[tri][:, :, 2].mean(1))
    im = Image.new("RGB", (T, T), "#f2f3f5"); d = ImageDraw.Draw(im)
    for i in order:
        if keep[i]: d.polygon([tuple(xy[v]) for v in tri[i]], fill=tuple(int(x * 255) for x in fc[i]))
    sheet.paste(im, (k * T, 0))
sheet.save(sys.argv[1])
