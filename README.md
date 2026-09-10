# React Camera Sample

[![Build status](https://ci.appveyor.com/api/projects/status/lu6v5qi4qfa03hev?svg=true)](https://ci.appveyor.com/project/Mahadenamuththa/react-camera-sample)
![React](https://img.shields.io/badge/react-18.2.0-61dafb?logo=react)
![TypeScript](https://img.shields.io/badge/typescript-4.9.5-3178c6?logo=typescript&logoColor=white)
![Create React App](https://img.shields.io/badge/react--scripts-5.0.1-09d3ac)
![react-webcam](https://img.shields.io/badge/react--webcam-7.1.1-blue)
![npm](https://img.shields.io/badge/npm-ci-cb3837?logo=npm)

A browser camera sample built with React, TypeScript, Create React App, and
`react-webcam`. The app opens the user's camera, displays a live preview,
captures still images, records short WebM videos through the browser
`MediaRecorder` API, and provides simple zoom controls.

## Setup

1. Install Node.js and npm.

   Recommended: use an active LTS version of Node.js.

2. Clone the repository.

   ```bash
   git clone https://github.com/PasinduUmayanga/React_Camera_Sample.git
   cd React_Camera_Sample
   ```

3. Install dependencies from the lockfile.

   ```bash
   npm ci
   ```

   Use `npm ci` for clean installs because this project includes a
   `package-lock.json`.

4. Start the development server.

   ```bash
   npm start
   ```

5. Open the app in a browser.

   ```text
   http://localhost:3000
   ```

6. Allow camera access when the browser asks for permission.

   Camera access normally requires `localhost` during development or HTTPS when
   deployed.

## Available Commands

### Start Development Server

```bash
npm start
```

Runs the app locally with hot reload at `http://localhost:3000`.

### Build For Production

```bash
npm run build
```

Creates an optimized production build in the `build` directory.

### Run Tests

```bash
npm test
```

Starts the Create React App test runner.

For a single non-watch test run, use:

```bash
npm run test:ci
```

## What This App Does

- Shows a live camera preview in the browser.
- Captures a still image from the webcam stream.
- Records video using the browser's `MediaRecorder` API.
- Downloads the recorded video as a `.webm` file.
- Supports simple zoom-in and zoom-out controls using CSS transforms.
- Updates camera preview constraints when the browser window is resized.

## Implementation Overview

The main app is rendered from `src/App.tsx`.

```tsx
function App() {
  return (
    <div className="App">
      <CameraApp />
    </div>
  );
}
```

The camera functionality lives in `src/CameraApp.tsx`. It uses a React ref to
access the `react-webcam` component and its underlying media stream.

```tsx
const webcamRef = useRef<Webcam | null>(null);
const mediaRecorderRef = useRef<MediaRecorder | null>(null);
const [isRecording, setIsRecording] = useState(false);
const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
```

Image capture uses `react-webcam`'s `getScreenshot()` helper.

```tsx
if (!webcamRef.current) {
  alert("Devices not found");
  return;
}

const imageSrc = webcamRef.current.getScreenshot();
setCapturedImage(imageSrc ? imageSrc : ({} as any));
```

Video recording uses the browser `MediaRecorder` API with the media stream
provided by `react-webcam`.

```tsx
const mediaStream = webcamRef.current.stream;
const mediaRecorder = new MediaRecorder(mediaStream);

mediaRecorder.ondataavailable = (e) => {
  if (e.data.size > 0) {
    setRecordedChunks((prevChunks) => [...prevChunks, e.data]);
  }
};
```

Recorded video download is handled by creating a temporary object URL from the
captured chunks.

```tsx
const blob = new Blob(recordedChunks, { type: "video/webm" });
const url = URL.createObjectURL(blob);
const a = document.createElement("a");

a.href = url;
a.download = "recorded-video.webm";
a.click();
```

Zoom is implemented with a CSS transform applied to the webcam preview.

```tsx
const videoStyle = {
  transform: `scale(${zoomLevel})`,
};
```

## Main Packages Used

- `react` and `react-dom`: UI rendering.
- `typescript`: typed React source files.
- `react-scripts`: Create React App build, test, and development tooling.
- `react-webcam`: webcam preview and screenshot support.
- `MediaRecorder`: native browser API used for video recording.
- `@testing-library/react` and related packages: React component testing.

## Continuous Integration

This repository includes an AppVeyor configuration in `appveyor.yml`.

The CI job:

- uses the Visual Studio 2022 Windows image,
- installs dependencies with `npm ci`,
- caches the npm cache directory between builds,
- runs the production build,
- runs tests once with `npm run test:ci`.

## Browser Notes

- Camera permissions must be granted by the user.
- Some browsers require HTTPS for camera access outside `localhost`.
- Video downloads are saved as WebM because that is the format produced by the
  browser `MediaRecorder` flow used by this app.
- Mobile camera selection is requested with `facingMode: "environment"`, but
  the final camera choice depends on browser and device support.

## Project Structure

```text
public/
  index.html
  manifest.json
src/
  App.tsx
  CameraApp.tsx
  WebcamCapture.tsx
  index.tsx
  App.css
  index.css
package.json
package-lock.json
tsconfig.json
```
