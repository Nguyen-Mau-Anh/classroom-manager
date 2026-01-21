import React, { useState, useEffect } from 'react';

import { DeactivateDialog } from '../components/teachers/DeactivateDialog';
import { TeacherForm } from '../components/teachers/TeacherForm';
import { TeacherList } from '../components/teachers/TeacherList';
import { useToast } from '../components/ui/Toast';
import {
  teachersApi,
  Teacher,
  CreateTeacherInput,
  UpdateTeacherInput,
} from '../services/api/teachers';

export const Teachers: React.FC = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [deactivateTarget, setDeactivateTarget] = useState<Teacher | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const { showToast } = useToast();

  // Mock subjects for demo - in real app, fetch from API
  const subjects = [
    { id: 'subject-1', name: 'Mathematics', code: 'MATH' },
    { id: 'subject-2', name: 'Physics', code: 'PHYS' },
    { id: 'subject-3', name: 'Chemistry', code: 'CHEM' },
    { id: 'subject-4', name: 'Biology', code: 'BIO' },
    { id: 'subject-5', name: 'English', code: 'ENG' },
  ];

  const loadTeachers = async () => {
    try {
      setIsLoading(true);
      const response = await teachersApi.list({
        page: currentPage,
        pageSize: 20,
        search: searchQuery || undefined,
      });
      setTeachers(response.teachers);
      setTotalPages(response.pagination.totalPages);
    } catch (error) {
      showToast('Failed to load teachers', 'error');
      console.error('Error loading teachers:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadTeachers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, searchQuery]);

  const handleAddTeacher = () => {
    setSelectedTeacher(null);
    setIsFormOpen(true);
  };

  const handleEditTeacher = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (data: CreateTeacherInput | UpdateTeacherInput) => {
    try {
      setIsSubmitting(true);
      if (selectedTeacher) {
        // Update existing teacher
        await teachersApi.update(selectedTeacher.id, data as UpdateTeacherInput);
        showToast('Teacher updated successfully', 'success');
      } else {
        // Create new teacher
        await teachersApi.create(data as CreateTeacherInput);
        showToast('Teacher created successfully', 'success');
      }
      setIsFormOpen(false);
      setSelectedTeacher(null);
      void loadTeachers();
    } catch (error: unknown) {
      const errorMessage =
        (error as { response?: { data?: { error?: { message?: string } } } }).response?.data?.error
          ?.message || 'Failed to save teacher';
      showToast(errorMessage, 'error');
      console.error('Error saving teacher:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeactivateClick = (teacher: Teacher) => {
    setDeactivateTarget(teacher);
  };

  const handleDeactivateConfirm = async () => {
    if (!deactivateTarget) return;

    try {
      setIsSubmitting(true);
      await teachersApi.deactivate(deactivateTarget.id);
      showToast('Teacher deactivated successfully', 'success');
      setDeactivateTarget(null);
      void loadTeachers();
    } catch (error) {
      showToast('Failed to deactivate teacher', 'error');
      console.error('Error deactivating teacher:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setCurrentPage(1);
    void loadTeachers();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Teachers</h1>
            <p className="mt-1 text-sm text-gray-500">Manage teacher profiles and qualifications</p>
          </div>
          <button
            onClick={handleAddTeacher}
            className="rounded-md bg-cyan-600 px-4 py-2 text-sm font-medium text-white hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-500"
          >
            Add Teacher
          </button>
        </div>

        {/* Search */}
        <div className="mb-6">
          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name or email..."
              className="block w-full max-w-md rounded-md border border-gray-300 px-4 py-2 shadow-sm focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            />
            <button
              type="submit"
              className="rounded-md bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              Search
            </button>
          </form>
        </div>

        {/* Teacher List */}
        <TeacherList
          teachers={teachers}
          onEdit={handleEditTeacher}
          onDeactivate={handleDeactivateClick}
          isLoading={isLoading}
        />

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex justify-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="rounded-md bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Previous
            </button>
            <span className="flex items-center px-4 text-sm text-gray-700">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="rounded-md bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}

        {/* Add/Edit Teacher Modal */}
        {isFormOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="w-full max-w-2xl rounded-lg bg-white p-6 shadow-xl">
              <h2 className="mb-4 text-xl font-semibold text-gray-900">
                {selectedTeacher ? 'Edit Teacher' : 'Add Teacher'}
              </h2>
              <TeacherForm
                teacher={selectedTeacher}
                subjects={subjects}
                onSubmit={handleFormSubmit}
                onCancel={() => {
                  setIsFormOpen(false);
                  setSelectedTeacher(null);
                }}
                isLoading={isSubmitting}
              />
            </div>
          </div>
        )}

        {/* Deactivate Confirmation Dialog */}
        {deactivateTarget && (
          <DeactivateDialog
            teacherName={deactivateTarget.name}
            isOpen={!!deactivateTarget}
            onConfirm={() => void handleDeactivateConfirm()}
            onCancel={() => setDeactivateTarget(null)}
            isLoading={isSubmitting}
          />
        )}
      </div>
    </div>
  );
};
