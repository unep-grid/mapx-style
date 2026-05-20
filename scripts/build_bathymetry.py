"""
Build cartographic bathymetry PMTiles from a local GEBCO raster.

The output is an intentionally generalized vector layer for basemap display,
not a navigation product. GEBCO must be downloaded separately.
"""

from __future__ import annotations

import argparse
import math
import os
import shutil
import subprocess
import sys
from pathlib import Path

import numpy as np
import rasterio
from rasterio.enums import Resampling
from rasterio.windows import bounds as window_bounds
from rasterio.windows import from_bounds
from scipy.ndimage import gaussian_filter

REPO_ROOT = Path(__file__).parent.parent
sys.path.insert(0, str(REPO_ROOT / "scripts/s3"))

S3_KEY = "layers/bathymetry__v0.pmtiles"
LAND_MASK = REPO_ROOT / "data/un_countries/un_2020_countries_polygons.geojson"
DEFAULT_TARGET_CELL_DEGREES = 0.03125
MEMORY_BYTES_PER_CELL = 48
DISK_BYTES_PER_CELL = 12
FILL_LEVELS = [
    -9000, 0, 50, 100, 200, 500, 1000, 2000, 3000,
    4000, 5000, 6000, 7000, 8000, 9000, 10000, 11000,
]


def parse_bbox(value: str | None) -> tuple[float, float, float, float] | None:
    if value is None:
        return None
    parts = [float(v.strip()) for v in value.split(",")]
    if len(parts) != 4:
        raise argparse.ArgumentTypeError("--bbox must be W,S,E,N")
    west, south, east, north = parts
    if west >= east or south >= north:
        raise argparse.ArgumentTypeError("--bbox must be W,S,E,N with west < east and south < north")
    return west, south, east, north


def run(cmd: list[str]) -> None:
    print("+", " ".join(cmd))
    subprocess.run(cmd, check=True)


def format_bytes(value: float) -> str:
    units = ["B", "KB", "MB", "GB", "TB"]
    size = float(value)
    for unit in units:
        if size < 1024 or unit == units[-1]:
            return f"{size:.1f} {unit}"
        size /= 1024
    return f"{size:.1f} TB"


def system_memory_bytes() -> int | None:
    try:
        result = subprocess.run(
            ["sysctl", "-n", "hw.memsize"],
            check=True,
            capture_output=True,
            text=True,
        )
        return int(result.stdout.strip())
    except (OSError, subprocess.CalledProcessError, ValueError):
        pass

    try:
        pages = os.sysconf("SC_PHYS_PAGES")
        page_size = os.sysconf("SC_PAGE_SIZE")
        return int(pages * page_size)
    except (AttributeError, OSError, ValueError):
        return None


def check_sampling_resources(out_width: int, out_height: int, work_dir: Path) -> None:
    cells = out_width * out_height
    estimated_memory = cells * MEMORY_BYTES_PER_CELL
    estimated_disk = cells * DISK_BYTES_PER_CELL
    total_memory = system_memory_bytes()
    free_disk = shutil.disk_usage(work_dir).free

    if total_memory is not None and estimated_memory > total_memory * 0.6:
        raise RuntimeError(
            "Target bathymetry raster is too large for this machine: "
            f"{out_width} x {out_height} cells, estimated memory "
            f"{format_bytes(estimated_memory)} vs {format_bytes(total_memory)} total RAM. "
            "Use --bbox or a larger --target-cell-degrees value."
        )

    if estimated_disk > free_disk * 0.5:
        raise RuntimeError(
            "Target bathymetry raster may exceed available work-dir disk space: "
            f"{out_width} x {out_height} cells, estimated temporary disk "
            f"{format_bytes(estimated_disk)} vs {format_bytes(free_disk)} free. "
            "Use --bbox, a larger --target-cell-degrees value, or a work dir with more space."
        )


def resolve_input(path: Path, work_dir: Path) -> Path:
    if path.is_file():
        return path
    if not path.is_dir():
        raise FileNotFoundError(f"GEBCO input does not exist: {path}")

    tiffs = sorted([*path.glob("*.tif"), *path.glob("*.tiff")])
    if not tiffs:
        raise FileNotFoundError(f"No GeoTIFF files found in GEBCO input directory: {path}")
    if shutil.which("gdalbuildvrt") is None:
        raise RuntimeError("Directory input requires missing GDAL tool: gdalbuildvrt")

    vrt = work_dir / f"{path.name}.vrt"
    run(["gdalbuildvrt", "-overwrite", str(vrt), *[str(tiff) for tiff in tiffs]])
    return vrt


def read_depth(
    path: Path,
    bbox: tuple[float, float, float, float] | None,
    max_cells: int,
    target_cell_degrees: float,
    work_dir: Path,
) -> tuple[np.ndarray, np.ndarray, np.ndarray]:
    if max_cells < 4:
        raise ValueError("--max-cells must be at least 4")
    if target_cell_degrees <= 0:
        raise ValueError("--target-cell-degrees must be greater than 0")

    with rasterio.open(path) as src:
        if not src.crs or src.crs.to_epsg() != 4326:
            raise ValueError("GEBCO input must be in EPSG:4326 for this lightweight generator")

        window = from_bounds(*bbox, transform=src.transform).round_offsets().round_lengths() if bbox else None
        width = int(window.width) if window else src.width
        height = int(window.height) if window else src.height
        if window:
            left, bottom, right, top = window_bounds(window, src.transform)
        else:
            left, bottom, right, top = src.bounds
        bounds_width = abs(right - left)
        bounds_height = abs(top - bottom)
        out_width = max(2, min(width, math.ceil(bounds_width / target_cell_degrees)))
        out_height = max(2, min(height, math.ceil(bounds_height / target_cell_degrees)))
        output_cells = out_width * out_height
        if output_cells > max_cells:
            print(
                f"Requested --max-cells {max_cells:,} would undersample the target "
                f"{target_cell_degrees:g} degree grid; using {output_cells:,} cells."
            )
        check_sampling_resources(out_width, out_height, work_dir)
        print(
            "Sampling GEBCO at "
            f"{out_width} x {out_height} cells "
            f"({output_cells:,} total, ~{bounds_width / out_width:.5g} x "
            f"{bounds_height / out_height:.5g} degrees/cell)"
        )
        data = src.read(
            1,
            window=window,
            out_shape=(out_height, out_width),
            masked=True,
            resampling=Resampling.bilinear,
        ).astype("float32")
        base_transform = src.window_transform(window) if window else src.transform
        transform = base_transform * base_transform.scale(width / out_width, height / out_height)

    depth = np.where(np.ma.getmaskarray(data), np.nan, np.asarray(data, dtype="float32"))
    depth = np.where(depth < 0, -depth, np.nan)
    rows, cols = depth.shape
    xs = transform.c + (np.arange(cols) + 0.5) * transform.a
    ys = transform.f + (np.arange(rows) + 0.5) * transform.e
    return depth, xs, ys


def smooth_depth(depth: np.ndarray, sigma: float) -> np.ndarray:
    valid = np.isfinite(depth)
    values = np.where(valid, depth, 0.0)
    weights = valid.astype("float32")
    smoothed = gaussian_filter(values, sigma=sigma, mode="nearest")
    smoothed_weights = gaussian_filter(weights, sigma=sigma, mode="nearest")
    with np.errstate(invalid="ignore", divide="ignore"):
        result = smoothed / smoothed_weights
    result[smoothed_weights < 0.2] = np.nan
    return result


def write_fills(
    out_dir: Path,
    depth: np.ndarray,
    xs: np.ndarray,
    ys: np.ndarray,
    bbox: tuple[float, float, float, float] | None,
) -> Path:
    smoothed = smooth_depth(depth, sigma=4.0)
    raster_path = out_dir / "bathymetry_depth_smoothed.tif"
    raw_path = out_dir / "bathymetry_fill_raw.gpkg"
    path = out_dir / "bathymetry_fill.geojsonseq"
    xres = float(abs(xs[1] - xs[0])) if len(xs) > 1 else 0.0
    yres = float(abs(ys[1] - ys[0])) if len(ys) > 1 else 0.0
    transform = rasterio.Affine(xres, 0, xs[0] - xres / 2, 0, -yres, ys[0] + yres / 2)

    raster = np.where(np.isfinite(smoothed), smoothed, 0).astype("float32")
    with rasterio.open(
        raster_path,
        "w",
        driver="GTiff",
        width=raster.shape[1],
        height=raster.shape[0],
        count=1,
        dtype="float32",
        crs="EPSG:4326",
        transform=transform,
        nodata=-9999,
        tiled=True,
        compress="deflate",
    ) as dst:
        dst.write(raster, 1)

    for candidate in [raw_path, path]:
        if candidate.exists():
            candidate.unlink()

    if shutil.which("gdal_contour") is None:
        raise RuntimeError("Missing required tool: gdal_contour")
    if shutil.which("ogr2ogr") is None:
        raise RuntimeError("Missing required tool: ogr2ogr")

    run([
        "gdal_contour",
        "-p",
        "-snodata", "-9999",
        "-fl", *map(str, FILL_LEVELS),
        "-amin", "min_depth",
        "-amax", "max_depth",
        str(raster_path),
        str(raw_path),
    ])

    sql = """
      SELECT
        contour.geom,
        CAST(max_depth AS INTEGER) AS depth_m,
        'fill' AS scale
      FROM contour
      WHERE max_depth > 0
    """
    run([
        "ogr2ogr",
        "-f", "GeoJSONSeq",
        str(path),
        str(raw_path),
        "-dialect", "SQLite",
        "-sql", sql,
        "-lco", "RS=YES",
    ])
    return path


def build_pmtiles(files: dict[str, Path], out_path: Path) -> None:
    if shutil.which("tippecanoe") is None:
        raise RuntimeError("Missing required tool: tippecanoe")
    cmd = [
        "tippecanoe",
        "-o", str(out_path),
        "-f",
        "-q",
        "--minimum-zoom=0",
        "--maximum-zoom=10",
        "--base-zoom=9",
        "--drop-densest-as-needed",
        #"--extend-zooms-if-still-dropping",
        "--detect-shared-borders",
        "--coalesce-densest-as-needed",
        "--include=depth_m",
        "--include=scale",
    ]
    for layer, path in files.items():
        cmd.extend(["-L", f"{layer}:{path}"])
    run(cmd)


def main() -> None:
    from rich.console import Console
    from upload import upload_file
    from range_test import test_range
    from s3_utils import public_url

    parser = argparse.ArgumentParser(description="Build smoothed GEBCO bathymetry PMTiles")
    parser.add_argument(
        "--input",
        type=Path,
        required=True,
        help="Local GEBCO GeoTIFF/VRT raster or directory of GeoTIFF tiles in EPSG:4326",
    )
    parser.add_argument("--bbox", type=parse_bbox, default=None, help="Optional W,S,E,N sample bbox")
    parser.add_argument(
        "--max-cells",
        type=int,
        default=4_000_000,
        help=(
            "Legacy safety hint. The script may exceed this to preserve "
            "--target-cell-degrees when local resources allow."
        ),
    )
    parser.add_argument(
        "--target-cell-degrees",
        type=float,
        default=DEFAULT_TARGET_CELL_DEGREES,
        help=(
            "Target output raster cell size in degrees before contouring "
            f"(default: {DEFAULT_TARGET_CELL_DEGREES})."
        ),
    )
    parser.add_argument("--land-mask", type=Path, default=LAND_MASK, help="Vector land polygons erased from bathymetry")
    parser.add_argument("--work-dir", type=Path, default=Path("/tmp/mapx-bathymetry"))
    parser.add_argument("--out", type=Path, default=Path("/tmp/bathymetry__v0.pmtiles"))
    parser.add_argument("--upload-key", default=S3_KEY, help=f"S3 key to overwrite (default: {S3_KEY})")
    parser.add_argument("--no-upload", action="store_true", help="Build only; skip S3 upload")
    args = parser.parse_args()

    console = Console()
    args.work_dir.mkdir(parents=True, exist_ok=True)
    input_path = resolve_input(args.input, args.work_dir)
    depth, xs, ys = read_depth(
        input_path,
        args.bbox,
        args.max_cells,
        args.target_cell_degrees,
        args.work_dir,
    )
    console.print(f"Loaded GEBCO window: {depth.shape[1]} x {depth.shape[0]} cells")

    files = {"bathymetry_fill": write_fills(args.work_dir, depth, xs, ys, args.bbox)}
    build_pmtiles(files, args.out)
    console.print(f"[green]PMTiles generated:[/green] {args.out}")

    if args.no_upload:
        return

    upload_file(local_path=args.out, s3_key=args.upload_key, make_public=True)
    console.print("\nVerifying range access...")
    if not test_range(public_url(args.upload_key)):
        console.print("[yellow]Warning: range test failed - check HCP ACL settings.[/yellow]")


if __name__ == "__main__":
    main()
