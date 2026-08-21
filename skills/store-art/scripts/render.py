#!/usr/bin/env python3
"""Render store screenshots from a manifest + a layout template, via Koubou.

Usage:
  render.py --manifest shots.json --template caption-top --out ./framed [--locale en-US]
            [--device "iPhone 16 Pro Max - Black Titanium - Portrait"] [--size iPhone6_9]
            [--dry-run]

Manifest (JSON):
{
  "brand": {"bg": ["#0F172A", "#1E293B"], "accent": "#38BDF8", "text": "#FFFFFF",
            "muted": "#94A3B8", "font": "Helvetica"},
  "shots": [
    {"file": "raw/en-US/01-home.png", "title": "Log in five seconds", "subtitle": "Two taps. Done."},
    {"file": "raw/en-US/02-garden.png", "title": "Watch it grow"}
  ]
}

Templates live next to this script in ../templates/<name>.json and describe
where the device and the text go, in canvas percentages. Panorama templates
span one device across N consecutive shots.
"""
import argparse, json, os, shutil, subprocess, sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
TEMPLATES = HERE.parent / "templates"


def load(p):
    with open(p) as f:
        return json.load(f)


def text_item(content, pos, size, color, weight="bold", font="Inter", max_width=None, align="center", extra=None):
    item = {"type": "text", "content": content, "position": list(pos), "size": size,
            "color": color, "weight": weight, "font_family": font, "alignment": align}
    if max_width:
        item["max_width"] = max_width
        item["max_lines"] = 2
        item["max_height"] = int(size * 1.2 * 2) + 8
        item["min_size"] = max(24, size // 2)
    if extra:
        item.update(extra)
    return item


def image_item(asset, pos, scale, frame=True, rotation=0, shadow=True):
    # Koubou resolves assets relative to the YAML file; hand it absolute paths.
    asset = str(Path(asset).resolve())
    item = {"type": "image", "asset": asset, "position": list(pos), "scale": scale, "frame": frame}
    if rotation:
        item["rotation"] = rotation
    if shadow:
        item.update({"shadow": True, "shadow_blur": 40, "shadow_color": "#00000066", "shadow_offset": ["0px", "30px"]})
    return item


def build(manifest, tpl, args):
    brand = {"bg": ["#0F172A", "#1E293B"], "accent": "#38BDF8", "text": "#FFFFFF",
             "muted": "#94A3B8", "font": "Helvetica", "direction": 180}
    brand.update(manifest.get("brand", {}))
    shots = manifest["shots"]
    canvas_w = tpl.get("canvas", {}).get("width", 1320)
    span = tpl.get("span", 1)  # panorama: device spans this many shots

    screenshots = {}
    for i, shot in enumerate(shots):
        name = f"{i+1:02d}-{Path(shot['file']).stem}"
        content = []
        # background is per-shot so panoramas can shift hue; default = brand gradient
        bg = {"type": "linear", "colors": brand["bg"], "direction": brand["direction"]}
        if span > 1:
            # Koubou drops elements positioned outside 0-100%, so a panorama is
            # rendered ONCE on a canvas `span` times wider, then sliced (see slice_panoramas).
            if i % span != 0:
                continue
            group = shots[i:i + span]
            d = tpl["device"]
            content.append(image_item(shot["file"], ("50%", d["y"]), d["scale"], frame=d.get("frame", True), rotation=d.get("rotation", 0)))
            for k, g in enumerate(group):
                cx = f"{(k + 0.5) / span * 100:.2f}%"
                t = tpl.get("title"); st = tpl.get("subtitle")
                if t and g.get("title"):
                    content.append(text_item(g["title"], (cx, t["y"]), t["size"], brand["text"], "bold", brand["font"], int(canvas_w * 0.86)))
                if st and g.get("subtitle"):
                    content.append(text_item(g["subtitle"], (cx, st["y"]), st["size"], brand["muted"], "normal", brand["font"], int(canvas_w * 0.8)))
            screenshots[f"pano-{i+1:02d}"] = {"background": bg, "content": content}
            continue
        else:
            d = tpl["device"]
            content.append(image_item(shot["file"], (d["x"], d["y"]), d["scale"], frame=d.get("frame", True), rotation=d.get("rotation", 0)))
            if tpl.get("device2") and shot.get("file2"):
                d2 = tpl["device2"]
                content.append(image_item(shot["file2"], (d2["x"], d2["y"]), d2["scale"], frame=d2.get("frame", True), rotation=d2.get("rotation", 0)))
        t = tpl.get("title")
        if t and shot.get("title"):
            content.append(text_item(shot["title"], (t["x"], t["y"]), t["size"], brand["text"], "bold", brand["font"], t.get("max_width", int(canvas_w * 0.86))))
        s = tpl.get("subtitle")
        if s and shot.get("subtitle"):
            content.append(text_item(shot["subtitle"], (s["x"], s["y"]), s["size"], brand["muted"], "normal", brand["font"], s.get("max_width", int(canvas_w * 0.8))))
        if tpl.get("badge") and shot.get("badge"):
            b = tpl["badge"]
            content.append(text_item(shot["badge"], (b["x"], b["y"]), b["size"], brand["accent"], "bold", brand["font"]))
        screenshots[name] = {"background": bg, "content": content}

    output_size = tpl.get("output_size", args.size)
    if span > 1:
        from koubou.config import resolve_output_size  # installed alongside kou
        w, h = resolve_output_size(output_size)
        output_size = [w * span, h]
    cfg = {
        "project": {"name": manifest.get("name", "store-art"), "device": args.device,
                    "output_dir": str(Path(args.out).resolve()), "output_size": output_size},
        "screenshots": screenshots,
    }
    return cfg


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--manifest", required=True)
    ap.add_argument("--template", required=True, help=f"one of: {', '.join(sorted(p.stem for p in TEMPLATES.glob('*.json')))}")
    ap.add_argument("--out", default="./framed")
    ap.add_argument("--device", default="iPhone 16 Pro Max - Black Titanium - Portrait")
    ap.add_argument("--size", default="iPhone6_9")
    ap.add_argument("--dry-run", action="store_true", help="write the Koubou YAML and stop")
    args = ap.parse_args()

    tpl_path = TEMPLATES / f"{args.template}.json"
    if not tpl_path.exists():
        sys.exit(f"unknown template {args.template}; have: {', '.join(sorted(p.stem for p in TEMPLATES.glob('*.json')))}")
    manifest = load(args.manifest)
    tpl = load(tpl_path)
    cfg = build(manifest, tpl, args)

    out = Path(args.out); out.mkdir(parents=True, exist_ok=True)
    yaml_path = out / f"koubou-{args.template}.yaml"
    try:
        import yaml  # koubou depends on pyyaml
        yaml_path.write_text(yaml.safe_dump(cfg, sort_keys=False, allow_unicode=True))
    except ImportError:
        yaml_path = yaml_path.with_suffix(".json")
        yaml_path.write_text(json.dumps(cfg, indent=2, ensure_ascii=False))
    print(f"wrote {yaml_path}")
    if args.dry_run:
        return
    kou = shutil.which("kou") or os.environ.get("KOU")
    if not kou:
        sys.exit("kou not found: pip install koubou==0.18.1 (or set KOU=/path/to/kou)")
    subprocess.run([kou, "generate", str(yaml_path)], check=True)
    if tpl.get("span", 1) > 1:
        slice_panoramas(out, tpl["span"])


def slice_panoramas(out, span):
    from PIL import Image
    for p in sorted(out.rglob("pano-*.png")):
        im = Image.open(p)
        w = im.width // span
        base = int(p.stem.split("-")[1])
        for k in range(span):
            tile = im.crop((k * w, 0, (k + 1) * w, im.height))
            tile.save(p.with_name(f"{base + k:02d}-pano.png"))
        p.unlink()
        print(f"sliced {p.name} into {span} tiles")


if __name__ == "__main__":
    main()
