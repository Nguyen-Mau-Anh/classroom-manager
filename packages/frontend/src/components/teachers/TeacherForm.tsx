import React, { useState, useEffect } from 'react';

import { Teacher, CreateTeacherInput, UpdateTeacherInput } from '../../services/api/teachers';

export interface TeacherFormProps {
  teacher?: Teacher | null;
  subjects?: { id: string; name: string; code: string }[];
  onSubmit: (data: CreateTeacherInput | UpdateTeacherInput) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export const TeacherForm: React.FC<TeacherFormProps> = ({
  teacher,
  subjects = [],
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subjectIds: [] as string[],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialize form data from teacher prop
  const initialFormData = teacher
    ? {
        name: teacher.name,
        email: teacher.email,
        phone: teacher.phone || '',
        subjectIds: teacher.qualifications.map((q) => q.subjectId),
      }
    : {
        name: '',
        email: '',
        phone: '',
        subjectIds: [],
      };

  useEffect(() => {
    setFormData(initialFormData);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teacher]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!teacher && !formData.email.trim()) {
      newErrors.email = 'Email is required';
    }

    if (!teacher && formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      if (teacher) {
        // Update mode - don't send email
        await onSubmit({
          name: formData.name,
          phone: formData.phone || undefined,
          subjectIds: formData.subjectIds,
        });
      } else {
        // Create mode
        await onSubmit({
          name: formData.name,
          email: formData.email,
          phone: formData.phone || undefined,
          subjectIds: formData.subjectIds,
        });
      }
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  const handleSubjectToggle = (subjectId: string) => {
    setFormData((prev) => ({
      ...prev,
      subjectIds: prev.subjectIds.includes(subjectId)
        ? prev.subjectIds.filter((id) => id !== subjectId)
        : [...prev.subjectIds, subjectId],
    }));
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    void handleSubmit(e);
  };

  return (
    <form onSubmit={handleFormSubmit} className="space-y-4">
      {/* Name field */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Name <span className="text-red-500">*</span>
        </label>
        <input
          id="name"
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
          disabled={isLoading}
        />
        {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
      </div>

      {/* Email field */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Email <span className="text-red-500">*</span>
        </label>
        <input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          disabled={!!teacher || isLoading}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 disabled:bg-gray-100 disabled:text-gray-500"
        />
        {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
        {teacher && (
          <p className="mt-1 text-xs text-gray-500">Email cannot be changed after creation</p>
        )}
      </div>

      {/* Phone field */}
      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
          Phone
        </label>
        <input
          id="phone"
          type="tel"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
          disabled={isLoading}
        />
      </div>

      {/* Subject qualifications */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Subject Qualifications</label>
        <div className="mt-2 max-h-48 space-y-2 overflow-y-auto rounded-md border border-gray-300 p-3">
          {subjects.length === 0 ? (
            <p className="text-sm text-gray-500">No subjects available</p>
          ) : (
            subjects.map((subject) => (
              <label key={subject.id} className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.subjectIds.includes(subject.id)}
                  onChange={() => handleSubjectToggle(subject.id)}
                  disabled={isLoading}
                  className="h-4 w-4 rounded border-gray-300 text-cyan-600 focus:ring-cyan-500"
                />
                <span className="ml-2 text-sm text-gray-700">
                  {subject.name} ({subject.code})
                </span>
              </label>
            ))
          )}
        </div>
      </div>

      {/* Form actions */}
      <div className="flex justify-end gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="rounded-md bg-cyan-600 px-4 py-2 text-sm font-medium text-white hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:opacity-50"
        >
          {isLoading ? 'Saving...' : 'Save'}
        </button>
      </div>
    </form>
  );
};
