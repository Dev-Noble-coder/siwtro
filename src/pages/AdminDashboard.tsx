import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader2, MessageSquarePlus } from 'lucide-react';
import { apiClient } from '../api/client';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
  const [remarkInput, setRemarkInput] = useState<{ [key: string]: string }>({});
  const [page, setPage] = useState(1);
  const navigate = useNavigate();

  const queryClient = useQueryClient();

  const studentsQuery = useQuery({
    queryKey: ['students', page],
    queryFn: async () => {
      const res = await apiClient.get(`/studentDetails?page=${page}`);
      return res.data;
    },
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

  const submitRemark = (userid: string) => {
    const remark = remarkInput[userid];
    if (remark) {
      remarkMutation.mutate({ userid, remark });
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem('isAuthenticated');
    navigate('/admin/login');
  };

  const studentsList = Array.isArray(studentsQuery.data) ? studentsQuery.data : (studentsQuery.data?.studentinfo || []);
  const currentPage = studentsQuery.data?.currentPage || 1;
  const totalPages = studentsQuery.data?.totalPages || 1;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 pb-4 border-b border-gray-200 gap-4 sm:gap-0">
          <h1 className="text-xl md:text-2xl font-bold text-gray-900 tracking-tight">SIWES Dashboard</h1>
          <button onClick={handleSignOut} className="rounded-full text-sm font-medium text-gray-600 hover:text-gray-900 border border-gray-300 px-6 py-2 bg-white hover:bg-gray-50 transition-colors w-full sm:w-auto">
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
              <div key={student._id || student.id} className="bg-white border border-gray-200 p-4 md:p-6 transition-colors hover:border-primary/50">
                <div className="flex flex-col md:flex-row justify-between items-start mb-6 gap-3 md:gap-0">
                  <div>
                    <h3 className="text-xl md:text-2xl font-bold text-gray-900">{student.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">{student.matricNumber} • {student.state}</p>
                  </div>
                  <span className="inline-flex items-center px-3 py-1 rounded-none text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200 self-start md:self-auto">
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

                <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 mt-6 pt-6 border-t border-gray-200">
                  <input
                    type="text"
                    placeholder="Type your remark here..."
                    value={remarkInput[student._id || student.id] || ''}
                    onChange={(e) => setRemarkInput(prev => ({ ...prev, [student._id || student.id]: e.target.value }))}
                    className="sharp-input w-full sm:flex-1 text-sm bg-gray-50 focus:bg-white"
                  />
                  <button
                    onClick={() => submitRemark(student._id || student.id)}
                    disabled={remarkMutation.isPending || !remarkInput[student._id || student.id]}
                    className="sharp-btn flex justify-center items-center text-sm px-6 w-full sm:w-auto"
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
            
            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex justify-between items-center bg-white border border-gray-200 p-4">
                <button 
                  onClick={() => setPage(p => Math.max(1, p - 1))} 
                  disabled={page === 1}
                  className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="text-sm text-gray-700">
                  Page <span className="font-medium">{currentPage}</span> of <span className="font-medium">{totalPages}</span>
                </span>
                <button 
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))} 
                  disabled={page === totalPages}
                  className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
