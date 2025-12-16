import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

const Input: React.FC<InputProps> = ({ label, className = '', ...props }) => {
  return (
    <div className="flex flex-col gap-1 mb-4">
      <label className="text-sm font-medium text-slate-600 ml-1">
        {label}
      </label>
      <input 
        className={`p-3 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-mahsa-teal focus:border-transparent transition-all ${className}`}
        {...props}
      />
    </div>
  );
};

export default Input;