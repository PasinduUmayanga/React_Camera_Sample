import React, { LegacyRef, useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";
import RecordRTC from "recordrtc";
import { json } from "stream/consumers";

const CameraApp: React.FC = () => {
  const webcamRef = useRef<Webcam | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);

  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  useEffect(() => {
    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }

    // Add a window resize event listener
    window.addEventListener("resize", handleResize);

    // Remove the event listener when the component unmounts
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);
  // useEffect(() => {
  //   async function getCamera() {
  //     try {
  //       navigator?.mediaDevices?.getUserMedia({ video: true });
  //       if (!navigator?.mediaDevices?.getUserMedia) {
  //         alert(`Error accessing camera:undefined`);
  //       }

  //       if (navigator?.mediaDevices?.getUserMedia) {
  //         const stream = await navigator.mediaDevices.getUserMedia({
  //           video: true,
  //           audio: true, // You can enable audio access if needed
  //         });
  //         if (webcamRef?.current?.video) {
  //           webcamRef.current.video.srcObject = stream;
  //         }
  //       } else {
  //         alert(
  //           "getUserMedia is not supported in this browser. Please use a modern browser."
  //         );
  //       }
  //     } catch (error) {
  //       alert(`Error accessing camera: ${error}`);
  //       console.error("Error accessing camera:", error);
  //     }
  //   }

  //   getCamera();
  // }, []);

  const handleStartRecording = () => {
    if (webcamRef.current) {
      const mediaStream = webcamRef.current.stream;
      if (mediaStream) {
        const mediaRecorder = new MediaRecorder(mediaStream);
        mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) {
            setRecordedChunks((prevChunks) => [...prevChunks, e.data]);
          }
        };
        mediaRecorderRef.current = mediaRecorder;
        mediaRecorder.start();
        setIsRecording(true);
      }
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };
  const [capturedImage, setCapturedImage] = useState(null);

  const captureImage = () => {
    if (webcamRef == null || webcamRef == undefined) {
      alert("Devices not found");
    }
    const imageSrc = webcamRef?.current?.getScreenshot();
    setCapturedImage(imageSrc ? imageSrc : ({} as any));
  };
  const handleDownload = () => {
    const blob = new Blob(recordedChunks, { type: "video/webm" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "recorded-video.webm";
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div>
      <video hidden id="videoElement" autoPlay playsInline></video>
      <h1>Webcam Video Recording</h1>
      <div>
        <Webcam
          forceScreenshotSourceSize
          audio={false}
          ref={webcamRef}
          videoConstraints={{
            width: windowSize.width,
            height: windowSize.height,
            facingMode: "environment",
          }}
        />
      </div>
      <div>
        <button onClick={captureImage}>Capture photo</button>
        {capturedImage && (
          <div>
            <h2>Captured Image:</h2>
            <img
              src={capturedImage}
              alt="Captured"
              width={windowSize.width}
              height={windowSize.height}
            />
          </div>
        )}
        {isRecording ? (
          <button onClick={handleStopRecording}>Stop Recording</button>
        ) : (
          <button onClick={handleStartRecording}>Start Recording</button>
        )}
        {recordedChunks.length > 0 && (
          <button onClick={handleDownload}>Download Video</button>
        )}
      </div>
    </div>
  );
};

export default CameraApp;
