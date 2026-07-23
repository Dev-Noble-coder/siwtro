import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Send, Loader2, CheckCircle, AlertCircle, Plus, Trash2 } from 'lucide-react';
import { apiClient } from '../api/client';

export default function StudentPortal() {
  const [sharedDetails, setSharedDetails] = useState({
    state: '',
    durationStart: '',
    durationEnd: '',
    nameofemployer: '',
    addressofemployer: '',
    numberofemployer: ''
  });

  const [students, setStudents] = useState([
    { name: '', matricNumber: '', phonenumber: '' }
  ]);

  const mutation = useMutation({
    mutationFn: async (payload: any[]) => {
      const response = await apiClient.post('/siwesDetails', payload);
      return response.data;
    },
    onSuccess: () => {
      setSharedDetails({
        state: '', durationStart: '', durationEnd: '',
        nameofemployer: '', addressofemployer: '', numberofemployer: ''
      });
      setStudents([{ name: '', matricNumber: '', phonenumber: '' }]);
    }
  });

  const handleSharedChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setSharedDetails(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleStudentChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const newStudents = [...students];
    newStudents[index] = { ...newStudents[index], [e.target.name]: e.target.value };
    setStudents(newStudents);
  };

  const addStudent = () => {
    setStudents([...students, { name: '', matricNumber: '', phonenumber: '' }]);
  };

  const removeStudent = (index: number) => {
    if (students.length > 1) {
      setStudents(students.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = students.map(student => ({
      ...student,
      phonenumber: Number(student.phonenumber),
      numberofemployer: Number(sharedDetails.numberofemployer),
      state: sharedDetails.state,
      durationStart: sharedDetails.durationStart,
      durationEnd: sharedDetails.durationEnd,
      nameofemployer: sharedDetails.nameofemployer,
      addressofemployer: sharedDetails.addressofemployer,
    }));
    
    // If only one student, we can still send as an array (API supports array for group submissions)
    mutation.mutate(payload);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl w-full bg-white border border-gray-200 p-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">SIWES Placement Entry</h2>
          <p className="mt-2 text-sm text-gray-600">Document your industrial training details. You can add multiple students if you are placed at the same organization.</p>
        </div>

        {mutation.isSuccess && (
          <div className="mb-6 p-4 border border-green-500 bg-green-50 text-green-800 flex items-start">
            <CheckCircle className="w-5 h-5 mr-3 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-sm">Submission Successful</h3>
              <p className="text-sm mt-1">The SIWES placement details have been recorded.</p>
            </div>
          </div>
        )}

        {mutation.isError && (
          <div className="mb-6 p-4 border border-red-500 bg-red-50 text-red-800 flex items-start">
            <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-sm">Submission Failed</h3>
              <p className="text-sm mt-1">Please check your inputs and try again.</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* Shared Details Section */}
          <div className="bg-gray-50 p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Placement Details (Shared)</h3>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Company / Employer Name</label>
                <input required name="nameofemployer" value={sharedDetails.nameofemployer} onChange={handleSharedChange} className="sharp-input w-full" placeholder="Tech Corp Ltd." />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Employer Address</label>
                <input required name="addressofemployer" value={sharedDetails.addressofemployer} onChange={handleSharedChange} className="sharp-input w-full" placeholder="123 Industrial Way" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Employer Contact Number</label>
                <input required type="number" name="numberofemployer" value={sharedDetails.numberofemployer} onChange={handleSharedChange} className="sharp-input w-full" placeholder="0123456789" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">State of Placement</label>
                <select required name="state" value={sharedDetails.state} onChange={handleSharedChange} className="sharp-input w-full">
                  <option value="">Select State</option>
                  <option value="Abia">Abia</option>
                  <option value="Adamawa">Adamawa</option>
                  <option value="Akwa Ibom">Akwa Ibom</option>
                  <option value="Anambra">Anambra</option>
                  <option value="Bauchi">Bauchi</option>
                  <option value="Bayelsa">Bayelsa</option>
                  <option value="Benue">Benue</option>
                  <option value="Borno">Borno</option>
                  <option value="Cross River">Cross River</option>
                  <option value="Delta">Delta</option>
                  <option value="Ebonyi">Ebonyi</option>
                  <option value="Edo">Edo</option>
                  <option value="Ekiti">Ekiti</option>
                  <option value="Enugu">Enugu</option>
                  <option value="FCT">FCT</option>
                  <option value="Gombe">Gombe</option>
                  <option value="Imo">Imo</option>
                  <option value="Jigawa">Jigawa</option>
                  <option value="Kaduna">Kaduna</option>
                  <option value="Kano">Kano</option>
                  <option value="Katsina">Katsina</option>
                  <option value="Kebbi">Kebbi</option>
                  <option value="Kogi">Kogi</option>
                  <option value="Kwara">Kwara</option>
                  <option value="Lagos">Lagos</option>
                  <option value="Nasarawa">Nasarawa</option>
                  <option value="Niger">Niger</option>
                  <option value="Ogun">Ogun</option>
                  <option value="Ondo">Ondo</option>
                  <option value="Osun">Osun</option>
                  <option value="Oyo">Oyo</option>
                  <option value="Plateau">Plateau</option>
                  <option value="Rivers">Rivers</option>
                  <option value="Sokoto">Sokoto</option>
                  <option value="Taraba">Taraba</option>
                  <option value="Yobe">Yobe</option>
                  <option value="Zamfara">Zamfara</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <input required type="date" name="durationStart" value={sharedDetails.durationStart} onChange={handleSharedChange} className="sharp-input w-full" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                <input required type="date" name="durationEnd" value={sharedDetails.durationEnd} onChange={handleSharedChange} className="sharp-input w-full" />
              </div>
            </div>
          </div>

          {/* Students Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Student(s)</h3>
              <button
                type="button"
                onClick={addStudent}
                className="inline-flex items-center text-sm font-medium text-primary hover:text-emerald-800"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Another Student
              </button>
            </div>
            
            <div className="space-y-4">
              {students.map((student, index) => (
                <div key={index} className="flex flex-col sm:flex-row items-start sm:items-end gap-4 p-4 border border-gray-200 bg-white">
                  <div className="flex-1 w-full">
                    <label className="block text-xs font-medium text-gray-700 mb-1">Full Name</label>
                    <input required name="name" value={student.name} onChange={(e) => handleStudentChange(index, e)} className="sharp-input w-full" placeholder="John Doe" />
                  </div>
                  <div className="flex-1 w-full">
                    <label className="block text-xs font-medium text-gray-700 mb-1">Matric Number</label>
                    <input required name="matricNumber" value={student.matricNumber} onChange={(e) => handleStudentChange(index, e)} className="sharp-input w-full" placeholder="ENG/123/456" />
                  </div>
                  <div className="flex-1 w-full">
                    <label className="block text-xs font-medium text-gray-700 mb-1">Phone Number</label>
                    <input required type="number" name="phonenumber" value={student.phonenumber} onChange={(e) => handleStudentChange(index, e)} className="sharp-input w-full" placeholder="08012345678" />
                  </div>
                  {students.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeStudent(index)}
                      className="text-red-500 hover:text-red-700 p-2 border border-transparent hover:bg-red-50 transition-colors rounded-full"
                      title="Remove Student"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="pt-6">
            <button
              type="submit"
              disabled={mutation.isPending}
              className="sharp-btn w-full flex justify-center items-center h-12 text-lg"
            >
              {mutation.isPending ? (
                <>
                  <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5" />
                  Submitting {students.length} Student{students.length !== 1 ? 's' : ''}...
                </>
              ) : (
                <>
                  <Send className="-ml-1 mr-3 h-5 w-5" />
                  Submit {students.length} Student{students.length !== 1 ? 's' : ''}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
