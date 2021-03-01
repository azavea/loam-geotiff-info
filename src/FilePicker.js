import { useState } from "react";
import { useHistory } from "react-router-dom";
import Dropzone from "react-dropzone";

function FilePicker({ onFileSelect }) {
  const history = useHistory();
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (files) => {
    onFileSelect(files[0]);
    history.push("/geotiff");
  };

  return (
    <Dropzone
      maxFiles={1}
      multiple={false}
      onDropAccepted={handleFileChange}
      onDragEnter={() => setIsDragging(true)}
      onDragLeave={() => setIsDragging(false)}
    >
      {({ getRootProps, getInputProps }) => (
        <div className="drag-container__focus" {...getRootProps()}>
          <div
            className={isDragging ? "drag-container drag-container--dragging" : "drag-container"}
          >
            <div className="drag-container__text-container">
              {!isDragging ? (
                <>
                  <h2 className="drag-container__title">geotiffinfo(filename)</h2>
                  <div>
                    <i
                      className="drag-container__dragging-icon fas fa-sparkles fa-lg"
                      aria-hidden="true"
                    ></i>
                  </div>
                  <p className="drag-container__desc">
                    Drag-and-drop or select a GeoTIFF from your file system. Information about the
                    file will be displayed.
                  </p>
                  <button className="button button--primary drag-container__button">
                    Browse...
                  </button>
                </>
              ) : (
                <>
                  <div>
                    <i
                      className="drag-container__dragging-icon fas fa-plus fa-lg"
                      aria-hidden="true"
                    ></i>
                  </div>
                  <p className="drag-container__desc">Drop your GeoTIFF here</p>
                </>
              )}
              <input {...getInputProps()} />
            </div>
          </div>
        </div>
      )}
    </Dropzone>
  );
}

export default FilePicker;
