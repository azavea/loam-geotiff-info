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
        <div {...getRootProps()}>
          <div style={{ background: isDragging ? "#f5f5f5" : "#ffffff" }}>
            {!isDragging ? (
              <>
                <p>
                  Drag & drop or select a GeoTIFF from your file system.
                  <br />
                  Informationabout the file will be displayed.
                </p>
              </>
            ) : (
              <p>Drop your GeoTIFF here</p>
            )}
            <button>Browse...</button>
            <input {...getInputProps()} />
          </div>
        </div>
      )}
    </Dropzone>
  );
}

export default FilePicker;
