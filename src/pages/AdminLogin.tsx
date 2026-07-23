import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { Eye, EyeOff } from 'lucide-react';
import { apiClient } from '../api/client';
import { useNavigate } from 'react-router-dom';

export default function AdminLogin() {
  const [isSignup, setIsSignup] = useState(false);
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const navigate = useNavigate();

  const authMutation = useMutation({
    mutationFn: async () => {
      if (isSignup) {
        const res = await apiClient.post('/adminSignup', { name, email, password });
        return res.data;
      } else {
        const res = await apiClient.post('/adminLogin', { email, password });
        return res.data;
      }
    },
    onSuccess: () => {
      if (isSignup) {
        // After signup, switch to login
        setIsSignup(false);
        setPassword('');
      } else {
        localStorage.setItem('isAuthenticated', 'true');
        navigate('/admin/dashboard');
      }
    }
  });

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    authMutation.mutate();
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center py-12 px-4">
      <div className="max-w-md w-full bg-white border border-gray-200 p-8">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
            {isSignup ? 'Admin Signup' : 'Admin Login'}
          </h2>
          <p className="mt-2 text-sm text-gray-600">Access the SIWES dashboard.</p>
        </div>
        
        {authMutation.isError && (
          <div className="mb-4 text-sm text-red-600 border border-red-500 bg-red-50 p-3">
            {isSignup ? 'Signup failed. Please try again.' : 'Authentication failed. Please check your credentials.'}
          </div>
        )}
        {authMutation.isSuccess && isSignup && (
          <div className="mb-4 text-sm text-green-700 border border-green-500 bg-green-50 p-3">
            Signup successful! Please log in.
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-6">
          {isSignup && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input required type="text" value={name} onChange={e => setName(e.target.value)} className="sharp-input w-full" placeholder="Admin Name" />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input required type="email" value={email} onChange={e => setEmail(e.target.value)} className="sharp-input w-full" placeholder="admin@example.com" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <div className="relative">
              <input 
                required 
                type={showPassword ? "text" : "password"} 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                className="sharp-input w-full pr-10" 
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>
          <button
            type="submit"
            disabled={authMutation.isPending}
            className="sharp-btn w-full flex justify-center items-center"
          >
            {authMutation.isPending ? <Loader2 className="animate-spin h-5 w-5" /> : (isSignup ? 'Create Account' : 'Sign In')}
          </button>
        </form>

        <div className="mt-6 text-center text-sm">
          <button 
            onClick={() => { setIsSignup(!isSignup); authMutation.reset(); }} 
            className="text-primary hover:underline font-medium"
          >
            {isSignup ? 'Already have an account? Log in' : "Don't have an account? Sign up"}
          </button>
        </div>
      </div>
    </div>
  );
}
