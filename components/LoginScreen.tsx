import React, { useState } from 'react';
import { User } from '../types';
import Button from './Button';
import Input from './Input';
import { ChevronLeft, KeyRound } from 'lucide-react';

interface LoginScreenProps {
  onLogin: (id: string, pin: string) => void;
  onResetPin: (id: string, pin: string) => Promise<boolean> | boolean;
  error?: string;
}

type LoginMode = 'login' | 'reset-id' | 'reset-pin';

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, onResetPin, error }) => {
  const [mode, setMode] = useState<LoginMode>('login');
  
  // Login State
  const [id, setId] = useState('');
  const [pin, setPin] = useState('');

  // Reset State
  const [resetId, setResetId] = useState('');
  const [newPin, setNewPin] = useState('');
  const [resetMessage, setResetMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(id, pin);
  };

  const handleResetIdSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (resetId.trim()) {
      setResetMessage(null);
      setMode('reset-pin');
    }
  };

  const handleResetPinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPin.length !== 4 || isNaN(Number(newPin))) {
      setResetMessage({ type: 'error', text: 'PIN must be 4 digits.' });
      return;
    }

    const success = onResetPin(resetId, newPin);
    if (success) {
      setResetMessage({ type: 'success', text: 'PIN updated successfully. Please login.' });
      // Reset form and go back to login after short delay or immediately
      setMode('login');
      setId(resetId); // Auto-fill ID
      setPin(''); // Clear PIN
    } else {
      setResetMessage({ type: 'error', text: 'Staff ID not found.' });
      setMode('reset-id'); // Go back to ID step
    }
  };

  const resetFlow = () => {
    setMode('login');
    setResetId('');
    setNewPin('');
    setResetMessage(null);
  };

  // --- Render Views ---

  const renderLoginForm = () => (
    <form onSubmit={handleLoginSubmit} className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100 w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Input 
        label="Staff ID" 
        placeholder="e.g. 12345" 
        value={id}
        onChange={(e) => setId(e.target.value)}
        autoFocus
      />
      <Input 
        label="4-Digit PIN" 
        type="password" 
        placeholder="****" 
        maxLength={4}
        value={pin}
        onChange={(e) => setPin(e.target.value)}
      />
      
      {error && (
        <div className="bg-red-50 text-red-500 text-sm p-3 rounded-lg mb-4 text-center border border-red-100">
          {error}
        </div>
      )}
      
      {resetMessage?.type === 'success' && (
        <div className="bg-green-50 text-green-600 text-sm p-3 rounded-lg mb-4 text-center border border-green-100">
          {resetMessage.text}
        </div>
      )}

      <Button type="submit" fullWidth className="mt-2">
        Sign In
      </Button>

      <div className="mt-6 text-center">
        <button 
          type="button"
          onClick={() => { setMode('reset-id'); setResetMessage(null); }}
          className="text-xs text-slate-400 hover:text-mahsa-teal transition-colors"
        >
          Forgot your PIN?
        </button>
      </div>
    </form>
  );

  const renderResetIdForm = () => (
    <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100 w-full animate-in fade-in slide-in-from-right-8 duration-300">
       <div className="flex items-center gap-2 mb-6 text-mahsa-navy">
          <KeyRound size={24} className="text-mahsa-teal" />
          <h2 className="text-xl font-bold">Reset PIN</h2>
       </div>
       <p className="text-sm text-slate-500 mb-6">Enter your Staff ID to verify your account.</p>
       
       <form onSubmit={handleResetIdSubmit}>
        <Input 
          label="Staff ID" 
          placeholder="e.g. 12345" 
          value={resetId}
          onChange={(e) => setResetId(e.target.value)}
          autoFocus
        />
        
        {resetMessage?.type === 'error' && (
          <div className="bg-red-50 text-red-500 text-sm p-3 rounded-lg mb-4 text-center border border-red-100">
            {resetMessage.text}
          </div>
        )}

        <Button type="submit" fullWidth>
          Continue
        </Button>
        <Button 
          type="button" 
          variant="outline" 
          fullWidth 
          className="mt-3"
          onClick={resetFlow}
        >
          Cancel
        </Button>
      </form>
    </div>
  );

  const renderResetPinForm = () => (
    <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100 w-full animate-in fade-in slide-in-from-right-8 duration-300">
      <div className="flex items-center gap-2 mb-6 text-mahsa-navy">
          <KeyRound size={24} className="text-mahsa-teal" />
          <h2 className="text-xl font-bold">New Security PIN</h2>
       </div>
       <p className="text-sm text-slate-500 mb-6">Create a new 4-digit PIN for Staff ID: <b>{resetId}</b></p>

       <form onSubmit={handleResetPinSubmit}>
        <Input 
          label="New PIN" 
          type="password"
          placeholder="****" 
          maxLength={4}
          value={newPin}
          onChange={(e) => setNewPin(e.target.value)}
          autoFocus
        />

        {resetMessage?.type === 'error' && (
          <div className="bg-red-50 text-red-500 text-sm p-3 rounded-lg mb-4 text-center border border-red-100">
            {resetMessage.text}
          </div>
        )}

        <Button type="submit" fullWidth>
          Update PIN
        </Button>
        <Button 
          type="button" 
          variant="outline" 
          fullWidth 
          className="mt-3"
          onClick={() => setMode('reset-id')}
        >
          Back
        </Button>
      </form>
    </div>
  );

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-gradient-to-b from-blue-50 to-white w-full">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          {/* Logo Representation */}
          <div className="w-32 h-32 bg-white rounded-3xl shadow-lg flex items-center justify-center mb-6 p-4 border border-slate-100">
             <img 
               src="https://graph.facebook.com/mahsaspecialisthospital/picture?type=large" 
               onError={(e) => {
                 // Fallback to University logo if Graph API fails
                 e.currentTarget.src = "https://upload.wikimedia.org/wikipedia/commons/9/93/MAHSA_University_Logo.png";
               }}
               alt="MAHSA Specialist Hospital" 
               className="w-full h-full object-contain"
             />
          </div>
          <h1 className="text-3xl font-bold text-mahsa-navy tracking-tight text-center">MAHSA Learn</h1>
          <p className="text-slate-500 mt-2 text-center text-sm">Specialist Hospital Microlearning</p>
        </div>

        {mode === 'login' && renderLoginForm()}
        {mode === 'reset-id' && renderResetIdForm()}
        {mode === 'reset-pin' && renderResetPinForm()}

      </div>
    </div>
  );
};

export default LoginScreen;