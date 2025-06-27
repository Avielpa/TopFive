// file: frontend/components/ui/button.tsx
import React from 'react';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>;

export const Button: React.FC<ButtonProps> = ({ children, ...props }) => (
  <button
    {...props}
    className={`px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white font-bold ${props.className || ''}`}
  >
    {children}
  </button>
);

export default Button;
