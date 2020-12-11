import { Link } from "react-router-dom";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import BoundsExport from "./BoundsExport";
import { useEffect, useState, useRef, useMemo } from "react";

const MAPBOX_BOUNDS_ID = "image-bounds";

function GeoTiffInfo({
  name,
  width,
  height,
  bandCount,
  wkt,
  cornersGeo,
  cornersLngLat,
}) {
  mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_TOKEN || "";

  const [map, setMap] = useState(null);
  const [copiedWkt, setCopiedWkt] = useState(false);
  const mapContainer = useRef(null);
  const boundsGeoJson = useMemo(() => {
    return cornersLngLat
      ? {
          type: "Feature",
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
        }
      : null;
  }, [cornersLngLat]);

  useEffect(
    () => {
      const newMap = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/streets-v11",
      });
      setMap(newMap);
    },
    [],
    () => {
      map.remove();
      setMap(null);
    }
  );

  useEffect(() => {
    const updateImageBounds = () => {
      if (map.getLayer(MAPBOX_BOUNDS_ID)) {
        map.removeLayer(MAPBOX_BOUNDS_ID);
      }
      if (map.getSource(MAPBOX_BOUNDS_ID)) {
        map.removeSource(MAPBOX_BOUNDS_ID);
      }
      boundsGeoJson &&
        map.addSource(MAPBOX_BOUNDS_ID, {
          type: "geojson",
          data: boundsGeoJson,
        });
      boundsGeoJson &&
        map.addLayer({
          id: MAPBOX_BOUNDS_ID,
          type: "line",
          source: "image-bounds",
          layout: {},
          paint: {
            "line-color": "#f1b310",
          },
        });
      cornersLngLat &&
        map.fitBounds([cornersLngLat.ll, cornersLngLat.ur], {
          padding: 25,
        });
    };
    if (map && cornersLngLat && map.isStyleLoaded()) {
      updateImageBounds();
    } else if (map && cornersLngLat) {
      map.once("idle", updateImageBounds);
    }
  }, [boundsGeoJson, cornersLngLat, map]);

  return (
    <>
      <Link to="/">← Try another file</Link>
      <div className="info-content">
        <div className="info-header">
          <Link to="/">✖</Link>
        </div>
        <div className="info-pane">
          <div
            id="map-container"
            className="pane-left map"
            ref={mapContainer}
          ></div>
          <div className="info-metadata pane-right">
            {name && (
              <p>
                <span className="highlight">File name:</span> {name}
              </p>
            )}
            {width && height && (
              <p>
                <span className="highlight">Size:</span> {width}, {height}
              </p>
            )}
            {bandCount && (
              <p>
                <span className="highlight">Band count:</span> {bandCount}
              </p>
            )}
            {wkt && (
              <>
                <div className="metadata-row">
                  <div>
                    <span className="highlight">Coordinate system:</span>
                  </div>
                  <div>
                    {copiedWkt ? (
                      <span>✔︎</span>
                    ) : (
                      <button
                        onClick={() =>
                          navigator.clipboard
                            .writeText(wkt)
                            .then(() => setCopiedWkt(true))
                        }
                      >
                        Copy
                      </button>
                    )}
                  </div>
                </div>
                <div className="wkt">{wkt}</div>
              </>
            )}
          </div>
        </div>
        <div className="info-pane">
          {cornersGeo && cornersLngLat && (
            <div className="corner-coordinates">
              <div className="coordinates-header">
                <p>
                  <span className="highlight">Corner coordinates</span>
                </p>
                <BoundsExport
                  cornersGeo={cornersGeo}
                  cornersLngLat={cornersLngLat}
                />
              </div>
              <table className="coordinates-table">
                <thead>
                  <tr>
                    <th className="highlight">Corner</th>
                    <th className="highlight" scope="col" colSpan="2">
                      Raster CRS (X / Y)
                    </th>
                    <th className="highlight" scope="col" colSpan="2">
                      Longitude / Latitude
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <th scope="row">1</th>
                    <td>{cornersGeo.ll[0]}</td>
                    <td>{cornersGeo.ll[1]}</td>
                    <td>{cornersLngLat.ll[0]}</td>
                    <td>{cornersLngLat.ll[1]}</td>
                  </tr>
                  <tr>
                    <th scope="row">2</th>
                    <td>{cornersGeo.lr[0]}</td>
                    <td>{cornersGeo.lr[1]}</td>
                    <td>{cornersLngLat.lr[0]}</td>
                    <td>{cornersLngLat.lr[1]}</td>
                  </tr>
                  <tr>
                    <th scope="row">3</th>
                    <td>{cornersGeo.ur[0]}</td>
                    <td>{cornersGeo.ur[1]}</td>
                    <td>{cornersLngLat.ur[0]}</td>
                    <td>{cornersLngLat.ur[1]}</td>
                  </tr>
                  <tr>
                    <th scope="row">4</th>
                    <td>{cornersGeo.ul[0]}</td>
                    <td>{cornersGeo.ul[1]}</td>
                    <td>{cornersLngLat.ul[0]}</td>
                    <td>{cornersLngLat.ul[1]}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default GeoTiffInfo;
