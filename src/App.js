import logo from './logo.svg';
import './App.css';
import loam from 'loam';
import { useEffect, useState, useRef } from 'react';

const EPSG4326 =
    'GEOGCS["WGS 84",DATUM["WGS_1984",SPHEROID["WGS 84",6378137,298.257223563,AUTHORITY["EPSG","7030"]],AUTHORITY["EPSG","6326"]],PRIMEM["Greenwich",0,AUTHORITY["EPSG","8901"]],UNIT["degree",0.01745329251994328,AUTHORITY["EPSG","9122"]],AUTHORITY["EPSG","4326"]]';

function App() {
  const [loamLoaded, setLoamLoaded] = useState(false);
  const [gtifWidth, setGtifWidth] = useState(null);
  const [gtifHeight, setGtifHeight] = useState(null);
  const [gtifBands, setGtifBands] = useState(null);
  const [gtifWkt, setGtifWkt] = useState('');
  const [gtifTransform, setGtifTransform] = useState(null);
  const [cornersGeo, setCornersGeo] = useState(null);
  const [cornersLngLat, setCornersLngLat] = useState(null);

  const fileInput = useRef();

  useEffect(() => {
    loam.initialize('/').then(setLoamLoaded(true));
  }, []);

  useEffect(() => {
    if (!gtifWidth || !gtifHeight || !gtifWkt || !gtifTransform) {
        return;
    }
    const cornersPx = [
        [0, 0],
        [gtifWidth, 0],
        [gtifWidth, gtifHeight],
        [0, gtifHeight],
    ];
    const cornersGeo = cornersPx.map(([x, y]) => {
        return [
            // http://www.gdal.org/gdal_datamodel.html
            gtifTransform[0] + gtifTransform[1] * x + gtifTransform[2] * y,
            gtifTransform[3] + gtifTransform[4] * x + gtifTransform[5] * y,
        ];
    });

    loam.reproject(gtifWkt, EPSG4326, cornersGeo).then((cornersLngLat) => {
        setCornersGeo({
            ll: cornersGeo[0],
            lr: cornersGeo[1],
            ur: cornersGeo[2],
            ul: cornersGeo[3],
        });
        setCornersLngLat({
            ll: cornersLngLat[0],
            lr: cornersLngLat[1],
            ur: cornersLngLat[2],
            ul: cornersLngLat[3],
        });
    });

  }, [gtifWidth, gtifHeight, gtifWkt, gtifTransform])

  const handleFileChange = () => {
    const file = fileInput.current.files[0];
    loam.open(file).then((ds) => {
        return Promise.all([ds.width(), ds.height(), ds.count(), ds.wkt(), ds.transform()])
            .then(([width, height, count, wkt, geoTransform]) => {
                setGtifWidth(width);
                setGtifHeight(height);
                setGtifBands(count);
                setGtifWkt(wkt);
                setGtifTransform(geoTransform);
            });
    });
  }

  return (
    <div className="App">
      <header className="App-header">
      {!loamLoaded ? <img src={logo} className="App-logo" alt="logo" /> :
          <>
          <p>Select a GeoTIFF using the Browse... button. Information about the file will be displayed below.</p>
          <form>
            <input type="file" id="geotiff-file" ref={fileInput} onChange={handleFileChange} />
          </form>
          {gtifWidth && gtifHeight && <p>Size: {gtifWidth}, {gtifHeight}</p>}
          {gtifBands && <p>Band count: {gtifBands}</p>}
          {gtifWkt && <p>Coordinate system: {gtifWkt}</p>}
          {cornersGeo && cornersLngLat &&
            <table>
              <caption>Corner coordinates</caption>
              <thead>
              <tr>
                <th>Corner</th>
                <th scope="col" colSpan="2">Raster CRS (X / Y)</th>
                <th scope="col" colSpan="2">Longitude / Latitude</th>
              </tr>
              </thead>
              <tbody>
              <tr>
                  <th scope="row">1</th>
                  <td>{cornersGeo.ll[0]}</td><td>{cornersGeo.ll[1]}</td>
                  <td>{cornersLngLat.ll[0]}</td><td>{cornersLngLat.ll[1]}</td>
              </tr>
              <tr>
                  <th scope="row">2</th>
                  <td>{cornersGeo.lr[0]}</td><td>{cornersGeo.lr[1]}</td>
                  <td>{cornersLngLat.lr[0]}</td><td>{cornersLngLat.lr[1]}</td>
              </tr>
              <tr>
                  <th scope="row">3</th>
                  <td>{cornersGeo.ur[0]}</td><td>{cornersGeo.ur[1]}</td>
                  <td>{cornersLngLat.ur[0]}</td><td>{cornersLngLat.ur[1]}</td>
              </tr>
              <tr>
                  <th scope="row">4</th>
                  <td>{cornersGeo.ul[0]}</td><td>{cornersGeo.ul[1]}</td>
                  <td>{cornersLngLat.ul[0]}</td><td>{cornersLngLat.ul[1]}</td>
              </tr>
              </tbody>
            </table>
          }
          </>
       }
          <div id="gdalinfo"></div>
      </header>
    </div>
  );
}

export default App;
