import GitHubLogo from './GitHub-Mark-Light-120px-plus.png';
import AzaveaLogo from './azavea_white_solo.svg';
import './App.css';
import loam from 'loam';
import FilePicker from './FilePicker';
import GeoTiffInfo from './GeoTiffInfo';
import About from './About';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
} from 'react-router-dom';
import Modal from 'react-modal';
import { useEffect, useState } from 'react';

const EPSG4326 =
  'GEOGCS["WGS 84",DATUM["WGS_1984",SPHEROID["WGS 84",6378137,298.257223563,AUTHORITY["EPSG","7030"]],AUTHORITY["EPSG","6326"]],PRIMEM["Greenwich",0,AUTHORITY["EPSG","8901"]],UNIT["degree",0.01745329251994328,AUTHORITY["EPSG","9122"]],AUTHORITY["EPSG","4326"]]';

function App() {
  const [loamLoaded, setLoamLoaded] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [gtifWidth, setGtifWidth] = useState(null);
  const [gtifHeight, setGtifHeight] = useState(null);
  const [gtifBands, setGtifBands] = useState(null);
  const [gtifWkt, setGtifWkt] = useState('');
  const [gtifTransform, setGtifTransform] = useState(null);
  const [cornersGeo, setCornersGeo] = useState(null);
  const [cornersLngLat, setCornersLngLat] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    loam.initialize('/').then(setLoamLoaded(true));
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

    loam.reproject(gtifWkt, EPSG4326, cornersGeo).then(cornersLngLat => {
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
      loam
        .open(selectedFile)
        .then(ds => {
          ds.width().then(width => setGtifWidth(width));
          ds.height().then(height => setGtifHeight(height));
          ds.count().then(count => setGtifBands(count));
          ds.wkt().then(wkt => setGtifWkt(wkt));
          ds.transform().then(geoTransform => setGtifTransform(geoTransform));
        })
        .catch(err => setErrorMessage(err.message));
  }, [selectedFile]);

  return (
    <>
      <Modal
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        className='modal'
        style={{
          content: {
            backgroundColor: '#27323d',
            color: '#fefefe',
            width: '90%',
            maxWidth: '500px',
          },
        }}
      >
        <div className='modal-header'>
          <h1 className='modal-title'>About</h1>
          <button
            className='modal-close-button'
            onClick={() => setIsModalOpen(false)}
          >
            <i
              className='info-content__close-button-icon fal fa-times-circle fa-lg'
              alt='Close'
            ></i>
          </button>
        </div>
        <div className='modal-body'>
          <About />
        </div>
      </Modal>
      <Router>
        <header className='header'>
          <h1 className='header__title-container'>
            <img
              src={AzaveaLogo}
              alt='Azavea'
              height='73'
              width='300'
              className='header__logo'
            />
            <span className='header__divider' aria-hidden='true'>
              |
            </span>
            <span className='header__title'>Loam: Run GDAL in the browser</span>
          </h1>
          <div className='header__menu'>
            <button
              className='header__about-button'
              onClick={() => setIsModalOpen(true)}
            >
              About
            </button>
            <a
              href='https://github.com/azavea/loam'
              className='header__github-link'
              title='Go to project’s GitHub'
            >
              <img
                src={GitHubLogo}
                className='header__github-icon'
                width='120'
                height='120'
                alt='GitHub'
                aria-hidden='true'
              />
            </a>
          </div>
        </header>
        <main className='main'>
          <div className='content'>
            <Switch>
              <Route exact path='/'>
                {!loamLoaded && (
                  <img src='' className='spinner' alt='loading-spinner' />
                )}
                {loamLoaded && (
                  <FilePicker
                    onFileSelect={file => {
                      setGtifWidth(null);
                      setGtifHeight(null);
                      setGtifBands(null);
                      setGtifWkt('');
                      setGtifTransform(null);
                      setCornersGeo(null);
                      setCornersLngLat(null);
                      setErrorMessage(null);
                      setSelectedFile(file);
                    }}
                  />
                )}
              </Route>
              <Route path='/geotiff'>
                {selectedFile && (
                  <GeoTiffInfo
                    name={selectedFile.name}
                    width={gtifWidth}
                    height={gtifHeight}
                    bandCount={gtifBands}
                    wkt={gtifWkt}
                    cornersGeo={cornersGeo}
                    cornersLngLat={cornersLngLat}
                    errorMessage={errorMessage}
                  />
                )}
                {!selectedFile && <Redirect to='/' />}
              </Route>
            </Switch>
          </div>
        </main>
      </Router>
    </>
  );
}

export default App;
