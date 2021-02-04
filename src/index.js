import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import Modal from "react-modal";
import App from "./App";
import reportWebVitals from "./reportWebVitals";

const appElement = document.getElementById("root");
Modal.setAppElement(appElement);
// Some Mapbox elements were rendering on top of the overlay.
Modal.defaultStyles.overlay.zIndex = "2";

document.title = "GeoTIFF Info";

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  appElement
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
