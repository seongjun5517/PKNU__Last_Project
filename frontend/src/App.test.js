import { render, screen } from '@testing-library/react';
import App from './App';

test('renders skin diagnosis main screen actions', () => {
  render(<App />);
  expect(screen.getByRole('heading', { name: /피부 진단 플랫폼/i })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /로그인하기/i })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /회원가입/i })).toBeInTheDocument();
});
