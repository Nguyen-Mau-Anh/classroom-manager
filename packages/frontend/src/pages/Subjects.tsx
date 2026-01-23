import React, { useState, useEffect } from 'react';

import { SubjectForm } from '../components/subjects/SubjectForm';
import { SubjectList } from '../components/subjects/SubjectList';
import { useToast } from '../components/ui/Toast';
import {
  subjectsApi,
  Subject,
  CreateSubjectInput,
  UpdateSubjectInput,
} from '../services/api/subjects';
import { teachersApi } from '../services/api/teachers';

export const Subjects: React.FC = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filterMandatory, setFilterMandatory] = useState<boolean | undefined>(undefined);
  const [filterHasPrerequisites, setFilterHasPrerequisites] = useState<boolean | undefined>(
    undefined,
  );
  const [teachers, setTeachers] = useState<{ id: string; name: string; email: string }[]>([]);

  const { showToast } = useToast();

  const loadSubjects = async () => {
    try {
      setIsLoading(true);
      const response = await subjectsApi.list({
        page: currentPage,
        pageSize: 20,
        search: searchQuery || undefined,
        isMandatory: filterMandatory,
        hasPrerequisites: filterHasPrerequisites,
      });
      setSubjects(response.subjects);
      setTotalPages(response.pagination.totalPages);
    } catch (error) {
      showToast('Failed to load subjects', 'error');
      console.error('Error loading subjects:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadTeachers = async () => {
    try {
      const response = await teachersApi.list({ pageSize: 1000, isActive: true });
      setTeachers(response.teachers.map((t) => ({ id: t.id, name: t.name, email: t.email })));
    } catch (error) {
      console.error('Error loading teachers:', error);
    }
  };

  useEffect(() => {
    void loadSubjects();
    void loadTeachers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, searchQuery, filterMandatory, filterHasPrerequisites]);

  const handleAddSubject = () => {
    setSelectedSubject(null);
    setIsFormOpen(true);
  };

  const handleEditSubject = (subject: Subject) => {
    setSelectedSubject(subject);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (data: CreateSubjectInput | UpdateSubjectInput) => {
    try {
      setIsSubmitting(true);
      if (selectedSubject) {
        // Update existing subject
        await subjectsApi.update(selectedSubject.id, data as UpdateSubjectInput);

        // Update qualified teachers if provided
        if ('qualifiedTeacherIds' in data && data.qualifiedTeacherIds) {
          await subjectsApi.updateQualifiedTeachers(selectedSubject.id, data.qualifiedTeacherIds);
          showToast('Teachers assigned to subject', 'success');
        } else {
          showToast('Subject updated successfully', 'success');
        }
      } else {
        // Create new subject
        const createData = data as CreateSubjectInput;
        const newSubject = await subjectsApi.create({
          name: createData.name,
          code: createData.code,
          description: createData.description,
          isMandatory: createData.isMandatory,
          prerequisiteIds: createData.prerequisiteIds,
        });

        showToast('Subject created successfully', 'success');

        // Update qualified teachers if provided
        if (createData.qualifiedTeacherIds && createData.qualifiedTeacherIds.length > 0) {
          await subjectsApi.updateQualifiedTeachers(newSubject.id, createData.qualifiedTeacherIds);
          showToast('Teachers assigned to subject', 'success');
        }
      }
      setIsFormOpen(false);
      setSelectedSubject(null);
      void loadSubjects();
    } catch (error: unknown) {
      const errorMessage =
        (error as { response?: { data?: { error?: { message?: string } } } }).response?.data?.error
          ?.message || 'Failed to save subject';
      showToast(errorMessage, 'error');
      console.error('Error saving subject:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSubject = (subject: Subject) => {
    if (!confirm(`Are you sure you want to delete "${subject.name}"?`)) {
      return;
    }

    void (async () => {
      try {
        await subjectsApi.delete(subject.id);
        showToast('Subject deleted successfully', 'success');
        void loadSubjects();
      } catch (error: unknown) {
        const errorMessage =
          (error as { response?: { data?: { error?: { message?: string } } } }).response?.data
            ?.error?.message || 'Failed to delete subject';

        // Show warning toast for enrollment/time slot issues, error toast for other failures
        const isWarning =
          errorMessage.includes('active enrollments') || errorMessage.includes('time slots');
        showToast(errorMessage, isWarning ? 'warning' : 'error');
        console.error('Error deleting subject:', error);
      }
    })();
  };

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setCurrentPage(1);
    void loadSubjects();
  };

  const handleFilterMandatory = (value: string) => {
    if (value === 'all') {
      setFilterMandatory(undefined);
    } else if (value === 'mandatory') {
      setFilterMandatory(true);
    } else if (value === 'elective') {
      setFilterMandatory(false);
    }
    setCurrentPage(1);
  };

  const handleFilterPrerequisites = (value: string) => {
    if (value === 'all') {
      setFilterHasPrerequisites(undefined);
    } else if (value === 'with-prerequisites') {
      setFilterHasPrerequisites(true);
    } else if (value === 'no-prerequisites') {
      setFilterHasPrerequisites(false);
    }
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Subjects</h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage subjects with prerequisites and requirements
            </p>
          </div>
          <button
            onClick={handleAddSubject}
            className="rounded-md bg-cyan-600 px-4 py-2 text-sm font-medium text-white hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-500"
          >
            Add Subject
          </button>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 space-y-4">
          {/* Search */}
          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by subject name or code..."
              className="block w-full max-w-md rounded-md border border-gray-300 px-4 py-2 shadow-sm focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            />
            <button
              type="submit"
              className="rounded-md bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              Search
            </button>
          </form>

          {/* Filters */}
          <div className="flex flex-wrap gap-4">
            {/* Mandatory/Elective Filter */}
            <div className="flex items-center gap-2">
              <label htmlFor="filter-mandatory" className="text-sm font-medium text-gray-700">
                Type:
              </label>
              <select
                id="filter-mandatory"
                onChange={(e) => handleFilterMandatory(e.target.value)}
                className="rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
              >
                <option value="all">All</option>
                <option value="mandatory">Mandatory</option>
                <option value="elective">Elective</option>
              </select>
            </div>

            {/* Prerequisites Filter */}
            <div className="flex items-center gap-2">
              <label htmlFor="filter-prerequisites" className="text-sm font-medium text-gray-700">
                Prerequisites:
              </label>
              <select
                id="filter-prerequisites"
                onChange={(e) => handleFilterPrerequisites(e.target.value)}
                className="rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
              >
                <option value="all">All</option>
                <option value="with-prerequisites">Has Prerequisites</option>
                <option value="no-prerequisites">No Prerequisites</option>
              </select>
            </div>
          </div>
        </div>

        {/* Subject List */}
        <SubjectList
          subjects={subjects}
          onEdit={handleEditSubject}
          onDelete={handleDeleteSubject}
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

        {/* Add/Edit Subject Modal */}
        {isFormOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="w-full max-w-3xl rounded-lg bg-white p-6 shadow-xl">
              <h2 className="mb-4 text-xl font-semibold text-gray-900">
                {selectedSubject ? 'Edit Subject' : 'Add Subject'}
              </h2>
              <SubjectForm
                subject={selectedSubject}
                subjects={subjects}
                teachers={teachers}
                onSubmit={handleFormSubmit}
                onCancel={() => {
                  setIsFormOpen(false);
                  setSelectedSubject(null);
                }}
                isLoading={isSubmitting}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
