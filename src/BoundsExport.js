import { Wrapper, Button, Menu, MenuItem } from "react-aria-menubutton";
import { saveAs } from "file-saver";

export default function BoundsExport({ cornersGeo, cornersLngLat }) {
  const geoJsonStr = (corners) => {
    return JSON.stringify({
      type: "Feature",
      properties: {},
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            cornersLngLat.ll,
            cornersLngLat.lr,
            cornersLngLat.ur,
            cornersLngLat.ul,
            cornersLngLat.ll,
          ],
        ],
      },
    });
  };

  // c is for corners
  const wktStr = (c) => {
    const spPts = (x, y) => `${x} ${y}`;
    return `POLYGON((${spPts(...c.ll)},${spPts(...c.lr)},${spPts(
      ...c.ur
    )},${spPts(...c.ul)},${spPts(...c.ll)}))`;
  };

  const handleSelection = ([delivery, format, string]) => {
    // Copy-paste is easy
    if (delivery === "copy") {
      navigator.clipboard.writeText(string);
    }
    // For download we need to set different mimetypes too.
    else if (delivery === "download") {
      if (format === "geojson") {
        const blob = new Blob([string], {
          type: "application/geo+json;charset=utf-8",
        });
        saveAs(blob, "bbox.geojson");
      } else if (format === "wkt") {
        const blob = new Blob([string], { type: "text/plain;charset=utf-8" });
        saveAs(blob, "bbox.wkt");
      }
    }
  };

  return (
    <div className="export-buttons">
      <Wrapper onSelection={handleSelection}>
        <Button className="export-button">
          <span className="underline">Download</span>⌄
        </Button>
        <Menu className="export-menu">
          <p className="export-menu-section">GeoJSON</p>
          <MenuItem
            className="export-menu-item"
            value={["download", "geojson", geoJsonStr(cornersLngLat)]}
          >
            Longitude / Latitude
          </MenuItem>
          <MenuItem
            className="export-menu-item"
            value={["download", "geojson", geoJsonStr(cornersGeo)]}
          >
            Raster CRS
          </MenuItem>
          <p className="export-menu-section">WKT</p>
          <MenuItem
            className="export-menu-item"
            value={["download", "wkt", wktStr(cornersLngLat)]}
          >
            Longitude / Latitude
          </MenuItem>
          <MenuItem
            className="export-menu-item"
            value={["download", "wkt", wktStr(cornersGeo)]}
          >
            Raster CRS
          </MenuItem>
        </Menu>
      </Wrapper>
      <Wrapper onSelection={handleSelection}>
        <Button className="export-button">
          <span className="underline">Copy</span>⌄
        </Button>
        <Menu className="export-menu">
          <p className="export-menu-section">GeoJSON</p>
          <MenuItem
            className="export-menu-item"
            value={["copy", "geojson", geoJsonStr(cornersLngLat)]}
          >
            Longitude / Latitude
          </MenuItem>
          <MenuItem
            className="export-menu-item"
            value={["copy", "geojson", geoJsonStr(cornersGeo)]}
          >
            Raster CRS
          </MenuItem>
          <p className="export-menu-section">WKT</p>
          <MenuItem
            className="export-menu-item"
            value={["copy", "wkt", wktStr(cornersLngLat)]}
          >
            Longitude / Latitude
          </MenuItem>
          <MenuItem
            className="export-menu-item"
            value={["copy", "wkt", wktStr(cornersGeo)]}
          >
            Raster CRS
          </MenuItem>
        </Menu>
      </Wrapper>
    </div>
  );
}
