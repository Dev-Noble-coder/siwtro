import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader2, MessageSquarePlus } from 'lucide-react';
import { Eye, EyeSlash } from 'iconsax-react';
import { apiClient } from '../api/client';

export default function AdminPortal() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isSignup, setIsSignup] = useState(false);
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [remarkInput, setRemarkInput] = useState<{ [key: string]: string }>({});

  const queryClient = useQueryClient();

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
        setIsLoggedIn(true);
      }
    }
  });

  const studentsQuery = useQuery({
    queryKey: ['students'],
    queryFn: async () => {
      const res = await apiClient.get('/studentDetails');
      return res.data;
    },
    enabled: isLoggedIn
  });

  const remarkMutation = useMutation({
    mutationFn: async ({ userid, remark }: { userid: string, remark: string }) => {
      const res = await apiClient.post('/adminRemark', { userid, remark });
      return res.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      setRemarkInput(prev => ({ ...prev, [variables.userid]: '' }));
    }
  });

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    authMutation.mutate();
  };

  const submitRemark = (userid: string) => {
    const remark = remarkInput[userid];
    if (remark) {
      remarkMutation.mutate({ userid, remark });
    }
  };

  if (!isLoggedIn) {
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
                  {showPassword ? <EyeSlash size={20} /> : <Eye size={20} />}
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

  const studentsList = Array.isArray(studentsQuery.data) ? studentsQuery.data : (studentsQuery.data?.students || []);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-200">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">SIWES Dashboard</h1>
          <button onClick={() => setIsLoggedIn(false)} className="text-sm font-medium text-gray-600 hover:text-gray-900 border border-gray-300 px-4 py-2 bg-white hover:bg-gray-50 transition-colors">
            Sign Out
          </button>
        </div>

        {studentsQuery.isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="animate-spin h-8 w-8 text-primary" />
          </div>
        ) : studentsQuery.isError ? (
          <div className="p-4 border border-red-500 bg-red-50 text-red-800">
            Failed to load students. Make sure you are authenticated.
          </div>
        ) : (
          <div className="grid gap-6">
            {studentsList.length === 0 && (
              <p className="text-gray-500 text-center py-12 bg-white border border-gray-200">No submissions found.</p>
            )}
            {studentsList.map((student: any) => (
              <div key={student._id || student.id} className="bg-white border border-gray-200 p-6 transition-colors hover:border-primary/50">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">{student.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">{student.matricNumber} • {student.state}</p>
                  </div>
                  <span className="inline-flex items-center px-3 py-1 rounded-none text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    {student.phonenumber}
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-sm text-gray-700 mb-6 bg-gray-50 p-4 border border-gray-100">
                  <div>
                    <span className="font-semibold text-gray-900 block mb-1">Duration</span> 
                    {new Date(student.durationStart).toLocaleDateString()} to {new Date(student.durationEnd).toLocaleDateString()}
                  </div>
                  <div>
                    <span className="font-semibold text-gray-900 block mb-1">Employer</span> 
                    {student.nameofemployer}
                  </div>
                  <div className="md:col-span-2">
                    <span className="font-semibold text-gray-900 block mb-1">Employer Address</span> 
                    {student.addressofemployer}
                  </div>
                </div>

                {student.adminRemarks && student.adminRemarks.length > 0 && (
                  <div className="mb-6 space-y-3">
                    <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Admin Remarks</h4>
                    {student.adminRemarks.map((r: any, idx: number) => (
                      <div key={idx} className="bg-white border-l-4 border-primary p-4 shadow-sm text-sm text-gray-800">
                        {r.remark || r}
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex space-x-3 mt-6 pt-6 border-t border-gray-200">
                  <input
                    type="text"
                    placeholder="Type your remark here..."
                    value={remarkInput[student._id || student.id] || ''}
                    onChange={(e) => setRemarkInput(prev => ({ ...prev, [student._id || student.id]: e.target.value }))}
                    className="sharp-input flex-1 text-sm bg-gray-50 focus:bg-white"
                  />
                  <button
                    onClick={() => submitRemark(student._id || student.id)}
                    disabled={remarkMutation.isPending || !remarkInput[student._id || student.id]}
                    className="sharp-btn flex items-center text-sm px-6"
                  >
                    {remarkMutation.isPending && remarkMutation.variables?.userid === (student._id || student.id) ? (
                      <Loader2 className="animate-spin h-4 w-4 mr-2" />
                    ) : (
                      <MessageSquarePlus className="h-4 w-4 mr-2" />
                    )}
                    Submit Remark
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
