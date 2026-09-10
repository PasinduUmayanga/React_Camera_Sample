import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

jest.mock('react-webcam', () => ({
  __esModule: true,
  default: require('react').forwardRef(
    (_props: unknown, ref: React.Ref<HTMLVideoElement>) => (
      <video ref={ref} data-testid="webcam-preview" />
    )
  ),
}));

test('renders camera recording app heading', () => {
  render(<App />);
  expect(
    screen.getByRole('heading', { name: /webcam video recording/i })
  ).toBeInTheDocument();
});
