import React, { LegacyRef, useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";
import RecordRTC from "recordrtc";

const CameraApp: React.FC = () => {
  const webcamRef = useRef<Webcam | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);

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
      <h1>Webcam Video Recording</h1>
      <div>
        <Webcam
          audio={true}
          ref={webcamRef}
          videoConstraints={{
            width: 1280,
            height: 720,
            facingMode: "user",
          }}
        />
      </div>
      <div>
        <button onClick={captureImage}>Capture photo</button>
        {capturedImage && (
          <div>
            <h2>Captured Image:</h2>
            <img src={capturedImage} alt="Captured" width={500} height={500} />
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
