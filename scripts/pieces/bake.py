"""Bake a generated GLB's base-colour texture into the mesh and drop the texture.

AI-generated atlases are a mosaic of tiny UV islands; minified, neighbouring islands bleed into each other
and show as scratches. Here every triangle takes one colour sampled inside its own island, triangles that
straddle a colour edge are split (up to LEVELS times) so the logo's outline stays crisp, and the corners are
then welded back together so the file stays small.
The piece is also stood upright facing +Z, since converters disagree on which axis is the front.

With a palette (the logo's own colours), every sample snaps to the nearest palette colour, which also removes
the highlights and smears the converter bakes into its texture; the page's lights do the shading instead.

usage: bake.py in.glb out.glb [RRGGBB,RRGGBB,...]   (then: gltf-transform optimize out.glb final.glb --compress meshopt)
"""
import json, struct, sys, io
import numpy as np
from PIL import Image

LEVELS, THRESHOLD = 3, 0.22
PALETTE = np.array([[int(c[i:i + 2], 16) / 255 for i in (0, 2, 4)] for c in sys.argv[3].split(",")], np.float32) if len(sys.argv) > 3 else None
src, dst = sys.argv[1], sys.argv[2]
b = open(src, "rb").read()
jl = struct.unpack("<I", b[12:16])[0]
j = json.loads(b[20:20 + jl]); bin0 = b[20 + jl + 8:]
CT = {5126: np.float32, 5125: np.uint32, 5123: np.uint16, 5121: np.uint8}
NC = {"SCALAR": 1, "VEC2": 2, "VEC3": 3, "VEC4": 4}
def acc(i):
    a = j["accessors"][i]; v = j["bufferViews"][a["bufferView"]]
    off = v.get("byteOffset", 0) + a.get("byteOffset", 0)
    n = NC[a["type"]]
    return np.frombuffer(bin0, CT[a["componentType"]], a["count"] * n, off).reshape(a["count"], n)
assert len(j["meshes"]) == 1 and len(j["meshes"][0]["primitives"]) == 1
prim = j["meshes"][0]["primitives"][0]
idx = acc(prim["indices"]).reshape(-1, 3).astype(np.int64)
P = acc(prim["attributes"]["POSITION"]).astype(np.float64)[idx]   # (faces, 3 corners, xyz)
N = acc(prim["attributes"]["NORMAL"]).astype(np.float64)[idx]
U = acc(prim["attributes"]["TEXCOORD_0"]).astype(np.float64)[idx]
tex = j["textures"][j["materials"][prim.get("material", 0)]["pbrMetallicRoughness"]["baseColorTexture"]["index"]]
iv = j["bufferViews"][j["images"][tex["source"]]["bufferView"]]
img = np.asarray(Image.open(io.BytesIO(bin0[iv.get("byteOffset", 0):iv.get("byteOffset", 0) + iv["byteLength"]])).convert("RGB"), np.float32) / 255
h, w, _ = img.shape

BARY = np.array([[1/3, 1/3, 1/3], [.6, .2, .2], [.2, .6, .2], [.2, .2, .6]])
def sample(U):
    uv = np.einsum("sk,fkc->fsc", BARY, U) % 1.0      # (faces, samples, 2)
    px = np.clip((uv[..., 0] * w).astype(int), 0, w - 1); py = np.clip((uv[..., 1] * h).astype(int), 0, h - 1)
    c = img[py, px]                                    # (faces, samples, 3)
    if PALETTE is not None: c = PALETTE[((c[:, :, None, :] - PALETTE) ** 2).sum(-1).argmin(-1)]
    return c
def split(A):
    a, b_, c = A[:, 0], A[:, 1], A[:, 2]
    ab, bc, ca = (a + b_) / 2, (b_ + c) / 2, (c + a) / 2
    return np.concatenate([np.stack(t, 1) for t in ((a, ab, ca), (ab, b_, bc), (ca, bc, c), (ab, bc, ca))])
for _ in range(LEVELS):
    s = sample(U)
    mixed = (s.max(1) - s.min(1)).max(1) > (1e-6 if PALETTE is not None else THRESHOLD)
    if not mixed.any(): break
    P, N, U = (np.concatenate([A[~mixed], split(A[mixed])]) for A in (P, N, U))
col = sample(U)[:, 0] if PALETTE is not None else sample(U).mean(1)
col = np.where(col <= 0.04045, col / 12.92, ((col + 0.055) / 1.055) ** 2.4)   # sRGB -> linear
F = len(P)
pos = P.reshape(-1, 3); nor = N.reshape(-1, 3)
nor /= np.maximum(np.linalg.norm(nor, axis=1, keepdims=True), 1e-9)
col = np.repeat(col, 3, axis=0)
# Weld corners that share a position, normal and colour.
# Colour is part of the key: a vertex shared by two colours would smear one across the other's triangle.
key = np.concatenate([np.round(pos / (np.ptp(pos) * 2e-5)), np.round(nor * 20), np.round(col * 24)], axis=1)
_, first, inv = np.unique(key, axis=0, return_index=True, return_inverse=True)
inv = inv.reshape(-1)
acc_c = np.zeros((len(first), 3)); cnt = np.zeros(len(first))
np.add.at(acc_c, inv, col); np.add.at(cnt, inv, 1)
pos, nor, col = pos[first], nor[first], acc_c / cnt[:, None]
tri = inv.reshape(-1, 3)
tri = tri[(tri[:, 0] != tri[:, 1]) & (tri[:, 1] != tri[:, 2]) & (tri[:, 0] != tri[:, 2])]

# Upright, facing +Z: the thinnest axis is an extruded logo's depth, and the front is the side whose
# colours vary more (the back is usually one flat colour).
thin = int(np.argmin(pos.max(0) - pos.min(0)))
def rot(m):
    global pos, nor
    pos = pos @ np.array(m, np.float64).T; nor = nor @ np.array(m, np.float64).T
if thin == 0: rot([[0, 0, -1], [0, 1, 0], [1, 0, 0]])
elif thin == 1: rot([[1, 0, 0], [0, 0, -1], [0, 1, 0]])
# A piece modelled leaning back is tipped upright: its flattest direction (smallest principal axis) becomes Z.
w_, v_ = np.linalg.eigh(np.cov((pos - pos.mean(0)).T))
n_ = v_[:, 0] * (1 if v_[2, 0] >= 0 else -1)
ang = np.degrees(np.arccos(np.clip(n_[2], -1, 1)))
if 3 < ang < 50:
    ax = np.cross(n_, [0, 0, 1]); ax /= np.linalg.norm(ax); t = np.radians(ang)
    K = np.array([[0, -ax[2], ax[1]], [ax[2], 0, -ax[0]], [-ax[1], ax[0], 0]])
    rot(np.eye(3) + np.sin(t) * K + (1 - np.cos(t)) * K @ K)
    print(f"  tipped upright by {ang:.0f} degrees")
front, back = nor[:, 2] > 0.5, nor[:, 2] < -0.5
var = lambda m: float(col[m].var(0).sum()) if m.any() else 0.0
if var(back) > var(front): rot([[-1, 0, 0], [0, 1, 0], [0, 0, -1]])
print(f"{src}: {len(idx)} -> {len(tri)} faces, {len(pos)} vertices, thin axis {'xyz'[thin]}, front var {var(front):.3f} back var {var(back):.3f}")

parts, views, accs = [], [], []
def add(arr, typ, ct, minmax=False):
    data = arr.tobytes(); off = sum(len(p) for p in parts)
    parts.append(data + b"\0" * (-len(data) % 4))
    views.append({"buffer": 0, "byteOffset": off, "byteLength": len(data), "target": 34962})
    a = {"bufferView": len(views) - 1, "componentType": ct, "count": len(arr), "type": typ}
    if minmax: a["min"], a["max"] = arr.min(0).tolist(), arr.max(0).tolist()
    accs.append(a); return len(accs) - 1
out = {"asset": {"version": "2.0"}, "scene": 0, "scenes": [{"nodes": [0]}], "nodes": [{"mesh": 0}],
       "materials": [{"pbrMetallicRoughness": {"metallicFactor": 0, "roughnessFactor": 0.55}}],
       "meshes": [{"primitives": [{"attributes": {
           "POSITION": add(pos.astype(np.float32), "VEC3", 5126, True),
           "NORMAL": add(nor.astype(np.float32), "VEC3", 5126),
           "COLOR_0": add(col.astype(np.float32), "VEC3", 5126)},
           "indices": add(tri.astype(np.uint32).reshape(-1, 1), "SCALAR", 5125), "material": 0}]}]}
views[-1]["target"] = 34963
blob = b"".join(parts)
out["buffers"] = [{"byteLength": len(blob)}]; out["bufferViews"] = views; out["accessors"] = accs
js = json.dumps(out).encode(); js += b" " * (-len(js) % 4)
open(dst, "wb").write(struct.pack("<III", 0x46546C67, 2, 28 + len(js) + len(blob)) + struct.pack("<II", len(js), 0x4E4F534A) + js + struct.pack("<II", len(blob), 0x004E4942) + blob)
