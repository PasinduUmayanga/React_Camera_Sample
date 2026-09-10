import React from 'react';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';

jest.mock('react-webcam', () => ({
  __esModule: true,
  default: require('react').forwardRef(
    (
      props: {
        style?: React.CSSProperties;
        videoConstraints?: MediaTrackConstraints;
      },
      ref: React.Ref<{
        getScreenshot: () => string;
        stream: MediaStream;
      }>
    ) => {
      const React = require('react');

      React.useImperativeHandle(ref, () => ({
        getScreenshot: () => 'data:image/jpeg;base64,camera-frame',
        stream: {} as MediaStream,
      }));

      return (
        <video
          data-facing-mode={props.videoConstraints?.facingMode}
          data-testid="webcam-preview"
          style={props.style}
        />
      );
    }
  ),
}));

class MockMediaRecorder {
  ondataavailable: ((event: BlobEvent) => void) | null = null;

  constructor(public stream: MediaStream) {}

  start() {
    this.ondataavailable?.({
      data: new Blob(['recorded video'], { type: 'video/webm' }),
    } as BlobEvent);
  }

  stop() {}
}

beforeEach(() => {
  Object.defineProperty(window, 'MediaRecorder', {
    configurable: true,
    value: MockMediaRecorder,
  });

  URL.createObjectURL = jest.fn(() => 'blob:recorded-video');
  URL.revokeObjectURL = jest.fn();
});

test('renders the camera app controls and preview', () => {
  render(<App />);

  expect(
    screen.getByRole('heading', { name: /webcam video recording/i })
  ).toBeInTheDocument();
  expect(screen.getByTestId('webcam-preview')).toHaveAttribute(
    'data-facing-mode',
    'environment'
  );
  expect(
    screen.getByRole('button', { name: /capture photo/i })
  ).toBeInTheDocument();
  expect(
    screen.getByRole('button', { name: /start recording/i })
  ).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /zoom in/i })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /zoom out/i })).toBeInTheDocument();
});

test('captures and displays a still image', () => {
  render(<App />);

  act(() => {
    userEvent.click(screen.getByRole('button', { name: /capture photo/i }));
  });

  expect(
    screen.getByRole('heading', { name: /captured image/i })
  ).toBeInTheDocument();
  expect(screen.getByRole('img', { name: /captured/i })).toHaveAttribute(
    'src',
    'data:image/jpeg;base64,camera-frame'
  );
});

test('starts and stops video recording', () => {
  render(<App />);

  act(() => {
    userEvent.click(screen.getByRole('button', { name: /start recording/i }));
  });

  expect(
    screen.getByRole('button', { name: /stop recording/i })
  ).toBeInTheDocument();
  expect(
    screen.getByRole('button', { name: /download video/i })
  ).toBeInTheDocument();

  act(() => {
    userEvent.click(screen.getByRole('button', { name: /stop recording/i }));
  });

  expect(
    screen.getByRole('button', { name: /start recording/i })
  ).toBeInTheDocument();
});

test('applies zoom controls to the webcam preview', () => {
  render(<App />);

  const preview = screen.getByTestId('webcam-preview');

  expect(preview).toHaveStyle({ transform: 'scale(1)' });

  act(() => {
    userEvent.click(screen.getByRole('button', { name: /zoom in/i }));
  });
  expect(screen.getByTestId('webcam-preview')).toHaveStyle({
    transform: 'scale(1.1)',
  });

  act(() => {
    userEvent.click(screen.getByRole('button', { name: /zoom out/i }));
  });
  expect(screen.getByTestId('webcam-preview')).toHaveStyle({
    transform: 'scale(1)',
  });
});
