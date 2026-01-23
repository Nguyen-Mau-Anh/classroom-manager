import React, { useState } from 'react';

import { Subject, CreateSubjectInput, UpdateSubjectInput } from '../../services/api/subjects';

export interface SubjectFormProps {
  subject?: Subject | null;
  subjects?: Subject[];
  teachers?: { id: string; name: string; email: string }[];
  onSubmit: (data: CreateSubjectInput | UpdateSubjectInput) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export const SubjectForm: React.FC<SubjectFormProps> = ({
  subject,
  subjects = [],
  teachers = [],
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const getInitialFormData = () => ({
    name: subject?.name || '',
    code: subject?.code || '',
    description: subject?.description || '',
    isMandatory: subject?.isMandatory || false,
    prerequisiteIds: subject?.prerequisites?.map((p) => p.id) || [],
    qualifiedTeacherIds: subject?.qualifiedTeachers?.map((t) => t.id) || [],
  });

  const [formData, setFormData] = useState(getInitialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Reset form data when subject changes
  const prevSubjectIdRef = React.useRef<string | undefined>(subject?.id);
  if (prevSubjectIdRef.current !== subject?.id) {
    prevSubjectIdRef.current = subject?.id;
    setFormData(getInitialFormData());
  }

  // Filter out current subject from prerequisites list in edit mode
  const availablePrerequisites = subject ? subjects.filter((s) => s.id !== subject.id) : subjects;

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.length < 2 || formData.name.length > 100) {
      newErrors.name = 'Name must be between 2 and 100 characters';
    }

    if (!formData.code.trim()) {
      newErrors.code = 'Code is required';
    } else if (!/^[A-Z0-9-]{2,20}$/.test(formData.code)) {
      newErrors.code = 'Code must be uppercase alphanumeric with hyphens (2-20 characters)';
    }

    if (formData.description && formData.description.length > 500) {
      newErrors.description = 'Description must not exceed 500 characters';
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
      const submitData = {
        name: formData.name,
        code: formData.code.toUpperCase(),
        description: formData.description || undefined,
        isMandatory: formData.isMandatory,
        prerequisiteIds: formData.prerequisiteIds,
        qualifiedTeacherIds: formData.qualifiedTeacherIds,
      };

      await onSubmit(submitData);
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  const handlePrerequisiteToggle = (subjectId: string) => {
    setFormData((prev) => ({
      ...prev,
      prerequisiteIds: prev.prerequisiteIds.includes(subjectId)
        ? prev.prerequisiteIds.filter((id) => id !== subjectId)
        : [...prev.prerequisiteIds, subjectId],
    }));
  };

  const handleTeacherToggle = (teacherId: string) => {
    setFormData((prev) => ({
      ...prev,
      qualifiedTeacherIds: prev.qualifiedTeacherIds.includes(teacherId)
        ? prev.qualifiedTeacherIds.filter((id) => id !== teacherId)
        : [...prev.qualifiedTeacherIds, teacherId],
    }));
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    void handleSubmit(e);
  };

  return (
    <form onSubmit={handleFormSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Left Column: Basic Fields */}
        <div className="space-y-4">
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

          {/* Code field */}
          <div>
            <label htmlFor="code" className="block text-sm font-medium text-gray-700">
              Code <span className="text-red-500">*</span>
            </label>
            <input
              id="code"
              type="text"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 font-mono shadow-sm focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
              disabled={isLoading}
              placeholder="MATH101"
            />
            {errors.code && <p className="mt-1 text-sm text-red-600">{errors.code}</p>}
            <p className="mt-1 text-xs text-gray-500">Uppercase letters, numbers, and hyphens</p>
          </div>

          {/* Description field */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
              disabled={isLoading}
              placeholder="Enter a description for this subject..."
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              {formData.description.length} / 500 characters
            </p>
          </div>

          {/* Mandatory toggle */}
          <div className="flex items-center">
            <input
              id="mandatory"
              type="checkbox"
              checked={formData.isMandatory}
              onChange={(e) => setFormData({ ...formData, isMandatory: e.target.checked })}
              disabled={isLoading}
              className="h-4 w-4 rounded border-gray-300 text-cyan-600 focus:ring-cyan-500"
            />
            <label htmlFor="mandatory" className="ml-2 block text-sm font-medium text-gray-700">
              Mandatory (required for all students)
            </label>
          </div>
        </div>

        {/* Right Column: Multi-selects */}
        <div className="space-y-4">
          {/* Prerequisites multi-select */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Prerequisites</label>
            <div className="mt-2 max-h-48 space-y-2 overflow-y-auto rounded-md border border-gray-300 p-3">
              {availablePrerequisites.length === 0 ? (
                <p className="text-sm text-gray-500">No subjects available for prerequisites</p>
              ) : (
                availablePrerequisites.map((prereqSubject) => (
                  <label key={prereqSubject.id} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.prerequisiteIds.includes(prereqSubject.id)}
                      onChange={() => handlePrerequisiteToggle(prereqSubject.id)}
                      disabled={isLoading}
                      className="h-4 w-4 rounded border-gray-300 text-cyan-600 focus:ring-cyan-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      {prereqSubject.name} ({prereqSubject.code})
                    </span>
                  </label>
                ))
              )}
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Select subjects that must be completed before enrolling
            </p>
          </div>

          {/* Qualified teachers multi-select */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Qualified Teachers</label>
            <div className="mt-2 max-h-48 space-y-2 overflow-y-auto rounded-md border border-gray-300 p-3">
              {teachers.length === 0 ? (
                <p className="text-sm text-gray-500">No teachers available</p>
              ) : (
                teachers.map((teacher) => (
                  <label key={teacher.id} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.qualifiedTeacherIds.includes(teacher.id)}
                      onChange={() => handleTeacherToggle(teacher.id)}
                      disabled={isLoading}
                      className="h-4 w-4 rounded border-gray-300 text-cyan-600 focus:ring-cyan-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">{teacher.name}</span>
                  </label>
                ))
              )}
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Select teachers qualified to teach this subject
            </p>
          </div>
        </div>
      </div>

      {/* Form actions */}
      <div className="flex justify-end gap-3 border-t border-gray-200 pt-4">
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
