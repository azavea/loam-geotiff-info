import GitHubLogo from "./GitHub-Mark-Light-120px-plus.png";
import "./App.css";
import loam from "loam";
import FilePicker from "./FilePicker";
import GeoTiffInfo from "./GeoTiffInfo";
import About from "./About";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
} from "react-router-dom";
import Modal from "react-modal";
import { useEffect, useState } from "react";

const EPSG4326 =
  'GEOGCS["WGS 84",DATUM["WGS_1984",SPHEROID["WGS 84",6378137,298.257223563,AUTHORITY["EPSG","7030"]],AUTHORITY["EPSG","6326"]],PRIMEM["Greenwich",0,AUTHORITY["EPSG","8901"]],UNIT["degree",0.01745329251994328,AUTHORITY["EPSG","9122"]],AUTHORITY["EPSG","4326"]]';

function App() {
  const [loamLoaded, setLoamLoaded] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [gtifWidth, setGtifWidth] = useState(null);
  const [gtifHeight, setGtifHeight] = useState(null);
  const [gtifBands, setGtifBands] = useState(null);
  const [gtifWkt, setGtifWkt] = useState("");
  const [gtifTransform, setGtifTransform] = useState(null);
  const [cornersGeo, setCornersGeo] = useState(null);
  const [cornersLngLat, setCornersLngLat] = useState(null);

  useEffect(() => {
    loam.initialize("/").then(setLoamLoaded(true));
  }, []);

  useEffect(() => {
    if (!(gtifWidth && gtifHeight && gtifWkt && gtifTransform)) {
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
  }, [gtifWidth, gtifHeight, gtifWkt, gtifTransform]);

  useEffect(() => {
    selectedFile &&
      loam.open(selectedFile).then((ds) => {
        ds.width().then((width) => setGtifWidth(width));
        ds.height().then((height) => setGtifHeight(height));
        ds.count().then((count) => setGtifBands(count));
        ds.wkt().then((wkt) => setGtifWkt(wkt));
        ds.transform().then((geoTransform) => setGtifTransform(geoTransform));
      });
  }, [selectedFile]);

  return (
    <>
      <Modal
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        style={{ content: { "background-color": "#27323d", color: "#fefefe" } }}
      >
        <div className="modal-header">
          <h2>About</h2>
          <button onClick={() => setIsModalOpen(false)}>✖️</button>
        </div>
        <div className="modal-body">
          <About />
        </div>
      </Modal>
      <Router>
        <header className="header">
          <div>Azavea logo | Loam: Run GDAL in the browser</div>
          <div>
            <button onClick={() => setIsModalOpen(true)}>About</button>
            <a href="https://github.com/azavea/loam">
              <img src={GitHubLogo} width="32px" alt="GitHub logo" />
            </a>
          </div>
        </header>
        <main className="code">
          <div className="content">
            <Switch>
              <Route exact path="/">
                {!loamLoaded && (
                  <img src="" className="spinner" alt="loading-spinner" />
                )}
                {loamLoaded && (
                  <FilePicker onFileSelect={(file) => setSelectedFile(file)} />
                )}
              </Route>
              <Route path="/geotiff">
                {selectedFile && (
                  <GeoTiffInfo
                    name={selectedFile.name}
                    width={gtifWidth}
                    height={gtifHeight}
                    bandCount={gtifBands}
                    wkt={gtifWkt}
                    cornersGeo={cornersGeo}
                    cornersLngLat={cornersLngLat}
                  />
                )}
                {!selectedFile && <Redirect to="/" />}
              </Route>
            </Switch>
          </div>
        </main>
      </Router>
    </>
  );
}

export default App;
