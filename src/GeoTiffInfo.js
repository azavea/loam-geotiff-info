import { Link } from 'react-router-dom';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import BoundsExport from './BoundsExport';
import { useEffect, useState, useRef, useMemo } from 'react';

const MAPBOX_BOUNDS_ID = 'image-bounds';

function GeoTiffInfo({
  name,
  width,
  height,
  bandCount,
  wkt,
  cornersGeo,
  cornersLngLat,
  errorMessage,
}) {
  mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_TOKEN || '';

  const [map, setMap] = useState(null);
  const [copiedWkt, setCopiedWkt] = useState(false);
  const mapContainer = useRef(null);
  const boundsGeoJson = useMemo(() => {
    return cornersLngLat
      ? {
          type: 'Feature',
          geometry: {
            type: 'Polygon',
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
        style: 'mapbox://styles/azavea/cklaf2vjy03tw17n3isbaehys',
      });
      setMap(newMap);
      // Currently, the map isn't filling the full width of its container on initial render. It'd be
      // nice not to have to do this, but I haven't found an immediately obvious fix and don't want
      // to dedicate too much time to fiddling with this.
      newMap.once('load', () => newMap.resize());
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
          type: 'geojson',
          data: boundsGeoJson,
        });
      boundsGeoJson &&
        map.addLayer({
          id: MAPBOX_BOUNDS_ID,
          type: 'line',
          source: 'image-bounds',
          layout: {},
          paint: {
            'line-color': '#f1b310',
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
      map.once('idle', updateImageBounds);
    }
  }, [boundsGeoJson, cornersLngLat, map]);

  return (
    <div className='info-content-container'>
      <Link className='back-button' to='/'>
        <i
          className='button__icon-l fal fa-long-arrow-left fa-lg'
          aria-hidden='true'
        ></i>
        Try another file
      </Link>
      <div className='info-content'>
        <div className='info-content__header'>
          <Link className='info-content__close-button' title='Close' to='/'>
            <i
              className='info-content__close-button-icon fal fa-times-circle fa-lg'
              alt='Close'
            ></i>
          </Link>
        </div>
        {errorMessage && (
          <div className='error info-header'>{errorMessage}</div>
        )}
        <div className='info-content__pane-container'>
          <div className='info-content__pane--left'>
            <div id='map-container' className='map' ref={mapContainer}></div>
          </div>
          <div className='info-metadata info-content__pane--right'>
            {name && (
              <p className='info-metadata__row'>
                <span className='info-metadata__key'>File name:</span>
                <span className='info-metadata__value'>{name}</span>
              </p>
            )}
            {width && height && (
              <p className='info-metadata__row'>
                <span className='info-metadata__key'>Size:</span>
                <span className='info-metadata__value'>
                  {width}, {height}
                </span>
              </p>
            )}
            {bandCount && (
              <p className='info-metadata__row'>
                <span className='info-metadata__key'>Band count:</span>
                <span className='info-metadata__value'>{bandCount}</span>
              </p>
            )}
            {wkt && (
              <>
                <div className='info-metadata__row'>
                  <div className='info-metadata__row-header'>
                    <div className='info-metadata__key'>Coordinate system:</div>
                    <div>
                      {copiedWkt ? (
                        <div className='export-button'>
                          <span>✔︎</span>
                        </div>
                      ) : (
                        <button
                          className='export-button'
                          onClick={() => {
                            navigator.clipboard
                              .writeText(wkt)
                              .then(() => setCopiedWkt(true));
                            // Turn the button back on after 5 seconds so they can reuse it
                            setTimeout(() => setCopiedWkt(false), 5000);
                          }}
                        >
                          <i
                            className='button__icon-l fas fa-copy'
                            aria-hidden='true'
                          ></i>
                          Copy
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                <div className='wkt'>{wkt}</div>
              </>
            )}
          </div>
        </div>
        <div className='info-content__pane'>
          {cornersGeo && cornersLngLat && (
            <div className='corner-coordinates'>
              <div className='coordinates-header'>
                <p>
                  <span className='info-metadata__key'>Corner coordinates</span>
                </p>
                <BoundsExport
                  cornersGeo={cornersGeo}
                  cornersLngLat={cornersLngLat}
                />
              </div>
              <table className='coordinates-table'>
                <thead>
                  <tr>
                    <th className='highlight'>Corner</th>
                    <th className='highlight' scope='col' colSpan='2'>
                      Raster CRS (X / Y)
                    </th>
                    <th className='highlight' scope='col' colSpan='2'>
                      Longitude / Latitude
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <th className='corner' scope='row'>
                      1
                    </th>
                    <td className='coord'>{cornersGeo.ll[0]}</td>
                    <td className='coord'>{cornersGeo.ll[1]}</td>
                    <td className='coord'>{cornersLngLat.ll[0]}</td>
                    <td className='coord'>{cornersLngLat.ll[1]}</td>
                  </tr>
                  <tr>
                    <th className='corner' scope='row'>
                      2
                    </th>
                    <td className='coord'>{cornersGeo.lr[0]}</td>
                    <td className='coord'>{cornersGeo.lr[1]}</td>
                    <td className='coord'>{cornersLngLat.lr[0]}</td>
                    <td className='coord'>{cornersLngLat.lr[1]}</td>
                  </tr>
                  <tr>
                    <th className='corner' scope='row'>
                      3
                    </th>
                    <td className='coord'>{cornersGeo.ur[0]}</td>
                    <td className='coord'>{cornersGeo.ur[1]}</td>
                    <td className='coord'>{cornersLngLat.ur[0]}</td>
                    <td className='coord'>{cornersLngLat.ur[1]}</td>
                  </tr>
                  <tr>
                    <th className='corner' scope='row'>
                      4
                    </th>
                    <td className='coord'>{cornersGeo.ul[0]}</td>
                    <td className='coord'>{cornersGeo.ul[1]}</td>
                    <td className='coord'>{cornersLngLat.ul[0]}</td>
                    <td className='coord'>{cornersLngLat.ul[1]}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default GeoTiffInfo;
