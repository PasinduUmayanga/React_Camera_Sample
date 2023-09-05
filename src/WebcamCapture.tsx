import React, { LegacyRef, useState } from "react";
import Webcam from "react-webcam";

const WebcamCapture: React.FC = () => {
  const videoConstraints = {
    width: 500,
    height: 500,
    facingMode: "user",
  };

  const [capturedImage, setCapturedImage] = useState(null);

  const webcamRef: LegacyRef<Webcam> | undefined = React.useRef(null);

  const captureImage = () => {
    const imageSrc = webcamRef?.current?.getScreenshot();
    setCapturedImage(imageSrc ? imageSrc : ({} as any));
  };

  return (
    <>
      <div>
        <Webcam
          audio={false}
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          videoConstraints={videoConstraints}
        />
        <button onClick={captureImage}>Capture photo</button>
        {capturedImage && (
          <div>
            <h2>Captured Image:</h2>
            <img src={capturedImage} alt="Captured" width={500} height={500} />
          </div>
        )}
      </div>
    </>
  );
};

export default WebcamCapture;
