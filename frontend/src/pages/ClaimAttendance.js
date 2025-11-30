import React, { useState, useEffect, useCallback } from 'react';
import {
  MagnifyingGlassIcon,
  ClockIcon,
  CheckCircleIcon,
  UserPlusIcon,
  CalendarIcon,
  XMarkIcon,
  UserMinusIcon,
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import { studentsAPI, attendanceAPI } from '../services/api';

const ClaimAttendance = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [students, setStudents] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [claimingStudentId, setClaimingStudentId] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showAbsentModal, setShowAbsentModal] = useState(false);
  const [selectedStudentForAbsence, setSelectedStudentForAbsence] = useState(null);
  const [hasPermission, setHasPermission] = useState(false);
  const [absenceReason, setAbsenceReason] = useState('');

  const loadStudents = useCallback(async () => {
    try {
      setLoading(true);
      // In a real app, this would fetch from API
      // For now, using mock data similar to Students.js
      const mockStudents = [
        {
          id: 1,
          name: 'John Doe',
          studentId: 'ASTU/1234/20',
          email: 'john.doe@astu.edu',
          department: 'Material Science',
          year: '2020',
        },
        {
          id: 2,
          name: 'Jane Smith',
          studentId: 'ASTU/1235/20',
          email: 'jane.smith@astu.edu',
          department: 'Material Science',
          year: '2020',
        },
        {
          id: 3,
          name: 'Mike Johnson',
          studentId: 'ASTU/1236/20',
          email: 'mike.johnson@astu.edu',
          department: 'Economics',
          year: '2019',
        },
        {
          id: 4,
          name: 'Sarah Wilson',
          studentId: 'ASTU/1237/20',
          email: 'sarah.wilson@astu.edu',
          department: 'Material Science',
          year: '2021',
        },
        {
          id: 5,
          name: 'Nigus Hagos',
          studentId: 'ugr/35183/16',
          email: 'nigus.hagos@astu.edu',
          department: 'Computer Science & Engineering',
          year: '2016',
        },
        {
          id: 6,
          name: 'melkamu wako',
          studentId: 'ugr/34284/16',
          email: 'melkamu.wako@astu.edu',
          department: 'Computer Science & Engineering',
          year: '2016',
        },
        {
          id: 7,
          name: 'abenezer markos',
          studentId: 'ugr/34584/16',
          email: 'abenezer.markos@astu.edu',
          department: 'Computer Science & Engineering',
          year: '2016',
        },
      ];
      setStudents(mockStudents);
    } catch (error) {
      console.error('Error loading students:', error);
      setMessage({ type: 'error', text: 'Failed to load students' });
    } finally {
      setLoading(false);
    }
  }, []);

  const loadTodayAttendance = useCallback(async () => {
    try {
      // In a real app, this would fetch from API
      // const response = await attendanceAPI.getAll({ date: selectedDate });
      // setAttendanceRecords(response.data || []);
      
      // Mock data for today's attendance
      // In a real app, filter by selectedDate
      const mockAttendance = [
        { studentId: 'ASTU/1234/20', arrivalTime: '09:30:00', status: 'present' },
        { studentId: 'ASTU/1235/20', arrivalTime: '10:15:00', status: 'present' },
      ];
      setAttendanceRecords(mockAttendance);
    } catch (error) {
      console.error('Error loading attendance:', error);
    }
  }, [selectedDate]);

  // Load students on component mount
  useEffect(() => {
    loadStudents();
    loadTodayAttendance();
  }, [loadStudents, loadTodayAttendance]);

  const handleClaimAttendance = async (student) => {
    if (claimingStudentId) return; // Prevent double-clicks

    try {
      setClaimingStudentId(student.id);
      setMessage({ type: '', text: '' });

      const currentTime = new Date().toISOString();
      const arrivalTime = format(new Date(), 'HH:mm:ss');

      // In a real app, this would call the API
      // const response = await attendanceAPI.claim({
      //   studentId: student.id,
      //   studentIdString: student.studentId,
      //   date: selectedDate,
      //   arrivalTime: arrivalTime,
      //   timestamp: currentTime,
      // });

      // Mock success - add to attendance records
      const newRecord = {
        studentId: student.studentId,
        arrivalTime: arrivalTime,
        status: 'present',
      };

      setAttendanceRecords([...attendanceRecords, newRecord]);
      setMessage({
        type: 'success',
        text: `${student.name}'s arrival time recorded at ${format(new Date(), 'HH:mm')}`,
      });

      // Clear message after 3 seconds
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      console.error('Error claiming attendance:', error);
      setMessage({
        type: 'error',
        text: `Failed to record attendance for ${student.name}`,
      });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } finally {
      setClaimingStudentId(null);
    }
  };

  const getStudentAttendanceStatus = (studentId) => {
    return attendanceRecords.find((record) => record.studentId === studentId);
  };

  const filteredStudents = students.filter((student) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      student.name.toLowerCase().includes(searchLower) ||
      student.studentId.toLowerCase().includes(searchLower) ||
      student.email.toLowerCase().includes(searchLower) ||
      student.department.toLowerCase().includes(searchLower)
    );
  });

  const hasAttendanceToday = (studentId) => {
    return attendanceRecords.some((record) => record.studentId === studentId);
  };

  const handleMarkAbsent = (student) => {
    setSelectedStudentForAbsence(student);
    setShowAbsentModal(true);
    setHasPermission(false);
    setAbsenceReason('');
  };

  const handleConfirmAbsence = async () => {
    if (!hasPermission && !absenceReason.trim()) {
      setMessage({
        type: 'error',
        text: 'Please provide a reason for the absence or mark as without permission',
      });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      return;
    }

    try {
      setClaimingStudentId(selectedStudentForAbsence.id);
      setMessage({ type: '', text: '' });

      const currentTime = new Date().toISOString();

      // In a real app, this would call the API
      // const response = await attendanceAPI.markAbsent({
      //   studentId: selectedStudentForAbsence.id,
      //   studentIdString: selectedStudentForAbsence.studentId,
      //   date: selectedDate,
      //   timestamp: currentTime,
      //   hasPermission: hasPermission,
      //   reason: absenceReason,
      // });

      // Mock success - add to attendance records
      const newRecord = {
        studentId: selectedStudentForAbsence.studentId,
        arrivalTime: null,
        status: 'absent',
        hasPermission: hasPermission,
        reason: absenceReason,
      };

      setAttendanceRecords([...attendanceRecords, newRecord]);
      setMessage({
        type: 'success',
        text: `${selectedStudentForAbsence.name} marked as absent ${
          hasPermission ? 'with permission' : 'without permission'
        }`,
      });

      setShowAbsentModal(false);
      setSelectedStudentForAbsence(null);
      setHasPermission(false);
      setAbsenceReason('');

      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      console.error('Error marking absence:', error);
      setMessage({
        type: 'error',
        text: `Failed to mark ${selectedStudentForAbsence.name} as absent`,
      });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } finally {
      setClaimingStudentId(null);
    }
  };

  const handleCancelAbsence = () => {
    setShowAbsentModal(false);
    setSelectedStudentForAbsence(null);
    setHasPermission(false);
    setAbsenceReason('');
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Claim Student Attendance</h1>
        <p className="text-gray-600 mt-1">
          Record arrival time for students as they arrive. Each student can only be marked once per day.
        </p>
      </div>

      {/* Message Alert */}
      {message.text && (
        <div
          className={`mb-4 p-4 rounded-lg ${
            message.type === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Filters and Date Selection */}
      <div className="card mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search students by name, ID, email, or department..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10"
            />
          </div>
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-gray-400" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="input-field"
            />
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Students</p>
              <p className="text-2xl font-bold text-gray-900">{students.length}</p>
            </div>
            <div className="bg-blue-500 p-3 rounded-lg">
              <UserPlusIcon className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Present Today</p>
              <p className="text-2xl font-bold text-green-600">{attendanceRecords.length}</p>
            </div>
            <div className="bg-green-500 p-3 rounded-lg">
              <CheckCircleIcon className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">
                {students.length - attendanceRecords.length}
              </p>
            </div>
            <div className="bg-yellow-500 p-3 rounded-lg">
              <ClockIcon className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Students List */}
      <div className="card">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Students ({filteredStudents.length})
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Click "Claim Arrival" to record a student's arrival time
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Loading students...</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredStudents.map((student) => {
              const attendanceRecord = getStudentAttendanceStatus(student.studentId);
              const isClaimed = hasAttendanceToday(student.studentId);
              const isClaiming = claimingStudentId === student.id;

              return (
                <div
                  key={student.id}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    isClaimed
                      ? 'bg-green-50 border-green-200'
                      : 'bg-white border-gray-200 hover:border-primary-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center">
                        <span className="text-primary-700 text-lg font-semibold">
                          {student.name.charAt(0)}
                        </span>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 text-lg">{student.name}</h3>
                        <p className="text-sm text-gray-600">{student.studentId}</p>
                        <p className="text-sm text-gray-500">{student.department} • Year {student.year}</p>
                        {isClaimed && attendanceRecord && attendanceRecord.status === 'present' && (
                          <div className="mt-2 flex items-center gap-2">
                            <CheckCircleIcon className="h-4 w-4 text-green-600" />
                            <span className="text-sm text-green-700 font-medium">
                              Arrived at {format(new Date(`2000-01-01T${attendanceRecord.arrivalTime}`), 'HH:mm')}
                            </span>
                          </div>
                        )}
                        {isClaimed && attendanceRecord && attendanceRecord.status === 'absent' && (
                          <div className="mt-2 flex items-center gap-2">
                            <XMarkIcon className="h-4 w-4 text-red-600" />
                            <span className={`text-sm font-medium ${
                              attendanceRecord.hasPermission 
                                ? 'text-orange-700' 
                                : 'text-red-700'
                            }`}>
                              Absent {attendanceRecord.hasPermission ? 'with permission' : 'without permission'}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {isClaimed ? (
                        attendanceRecord?.status === 'present' ? (
                          <div className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg">
                            <CheckCircleIcon className="h-5 w-5" />
                            <span className="font-medium">Present</span>
                          </div>
                        ) : (
                          <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                            attendanceRecord?.hasPermission
                              ? 'bg-orange-100 text-orange-700'
                              : 'bg-red-100 text-red-700'
                          }`}>
                            <UserMinusIcon className="h-5 w-5" />
                            <span className="font-medium">Absent</span>
                          </div>
                        )
                      ) : (
                        <>
                          <button
                            onClick={() => handleMarkAbsent(student)}
                            className="px-4 py-2 rounded-lg font-medium transition-all bg-red-600 hover:bg-red-700 text-white flex items-center gap-2"
                          >
                            <UserMinusIcon className="h-5 w-5" />
                            <span>Mark Absent</span>
                          </button>
                          <button
                            onClick={() => handleClaimAttendance(student)}
                            disabled={isClaiming}
                            className={`px-6 py-2 rounded-lg font-medium transition-all ${
                              isClaiming
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-primary-600 hover:bg-primary-700 text-white'
                            } flex items-center gap-2`}
                          >
                            {isClaiming ? (
                              <>
                                <ClockIcon className="h-5 w-5 animate-spin" />
                                <span>Claiming...</span>
                              </>
                            ) : (
                              <>
                                <UserPlusIcon className="h-5 w-5" />
                                <span>Claim Arrival</span>
                              </>
                            )}
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {filteredStudents.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-gray-500">No students found matching your search</p>
          </div>
        )}
      </div>

      {/* Current Time Display */}
      <div className="mt-4 text-center text-sm text-gray-500">
        Current Time: {format(new Date(), 'EEEE, MMMM dd, yyyy • HH:mm:ss')}
      </div>

      {/* Mark Absent Modal */}
      {showAbsentModal && selectedStudentForAbsence && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Mark Student Absent</h2>
              <button
                onClick={handleCancelAbsence}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            <div className="mb-4">
              <p className="text-gray-700 mb-2">
                <span className="font-semibold">Student:</span> {selectedStudentForAbsence.name}
              </p>
              <p className="text-gray-600 mb-4">
                <span className="font-semibold">Student ID:</span> {selectedStudentForAbsence.studentId}
              </p>
            </div>
            <div className="mb-4">
              <label className="flex items-center gap-2 cursor-pointer mb-4">
                <input
                  type="checkbox"
                  checked={hasPermission}
                  onChange={(e) => setHasPermission(e.target.checked)}
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <span className="text-gray-700 font-medium">
                  Student has valid reason/permission
                </span>
              </label>
            </div>
            {hasPermission && (
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">
                  Reason for Absence (Optional)
                </label>
                <textarea
                  value={absenceReason}
                  onChange={(e) => setAbsenceReason(e.target.value)}
                  placeholder="Enter the reason for absence..."
                  className="input-field w-full h-24 resize-none"
                />
              </div>
            )}
            {!hasPermission && (
              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <span className="font-semibold">Note:</span> This absence will be marked as without valid reason or permission.
                </p>
              </div>
            )}
            <div className="flex gap-3">
              <button
                onClick={handleCancelAbsence}
                className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-medium transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAbsence}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-all"
              >
                Confirm Absence
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClaimAttendance;

