import React from 'react';

import { Subject } from '../../services/api/subjects';

import { PrerequisiteTree } from './PrerequisiteTree';

export interface EnrollmentByGrade {
  grade: string;
  count: number;
}

export interface SubjectDetailProps {
  subject: Subject;
  enrollmentsByGrade?: EnrollmentByGrade[];
  onEdit: (subject: Subject) => void;
  onDelete: (subject: Subject) => void;
  isLoading?: boolean;
}

/**
 * Get badge color for mandatory indicator.
 */
function getMandatoryBadge(isMandatory: boolean): { label: string; color: string } {
  if (isMandatory) {
    return { label: 'Required', color: 'bg-red-100 text-red-800' };
  }
  return { label: 'Optional', color: 'bg-blue-100 text-blue-800' };
}

export const SubjectDetail: React.FC<SubjectDetailProps> = ({
  subject,
  enrollmentsByGrade = [],
  onEdit,
  onDelete,
  isLoading = false,
}) => {
  const mandatoryBadge = getMandatoryBadge(subject.isMandatory);

  if (isLoading) {
    return (
      <div className="flex justify-center py-12" role="status">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-cyan-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Subject Info Card */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow">
        <div className="mb-4 flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <span className="rounded bg-cyan-100 px-3 py-1 text-lg font-mono font-bold text-cyan-800">
                {subject.code}
              </span>
              <span
                className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${mandatoryBadge.color}`}
              >
                {mandatoryBadge.label}
              </span>
            </div>
            <h2 className="mt-3 text-2xl font-bold text-gray-900">{subject.name}</h2>
            {subject.description && <p className="mt-2 text-gray-600">{subject.description}</p>}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => onEdit(subject)}
              className="rounded-md bg-cyan-600 px-4 py-2 text-sm font-medium text-white hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              aria-label="Edit subject"
            >
              Edit
            </button>
            <button
              onClick={() => onDelete(subject)}
              className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
              aria-label="Delete subject"
            >
              Delete
            </button>
          </div>
        </div>
      </div>

      {/* Middle Section: Split Layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Qualified Teachers Section */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">
            Qualified Teachers ({subject.qualifiedTeacherCount})
          </h3>
          {subject.qualifiedTeachers && subject.qualifiedTeachers.length > 0 ? (
            <div className="space-y-3">
              {subject.qualifiedTeachers.map((teacher) => (
                <div
                  key={teacher.id}
                  className="flex items-center gap-3 rounded-md border border-gray-200 bg-gray-50 p-3"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-cyan-100 text-cyan-700">
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{teacher.name}</div>
                    <div className="text-sm text-gray-500">{teacher.email}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-6 text-center">
              <p className="text-sm text-gray-500">No qualified teachers assigned</p>
            </div>
          )}
        </div>

        {/* Prerequisites Section */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">Prerequisites</h3>
          <PrerequisiteTree prerequisites={subject.prerequisites || []} title="" />
        </div>
      </div>

      {/* Enrollment Statistics Section */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">Enrollment Statistics</h3>
        {subject.enrollmentCount > 0 ? (
          <div className="space-y-6">
            {/* Total Enrolled */}
            <div>
              <div className="text-sm font-medium text-gray-500">Total Enrolled</div>
              <div className="mt-1 text-3xl font-bold text-gray-900">{subject.enrollmentCount}</div>
            </div>

            {/* By Grade Level */}
            {enrollmentsByGrade.length > 0 && (
              <div>
                <div className="mb-3 text-sm font-medium text-gray-500">By Grade Level</div>
                <div className="space-y-2">
                  {enrollmentsByGrade.map((enrollment) => (
                    <div
                      key={enrollment.grade}
                      className="flex items-center justify-between rounded-md border border-gray-200 bg-gray-50 p-3"
                    >
                      <span className="text-sm font-medium text-gray-700">
                        Grade {enrollment.grade}: {enrollment.count} students
                      </span>
                      <div className="h-2 flex-1 ml-4 max-w-xs overflow-hidden rounded-full bg-gray-200">
                        <div
                          className="h-full bg-cyan-600"
                          style={{
                            width: `${(enrollment.count / subject.enrollmentCount) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-6 text-center">
            <p className="text-sm text-gray-500">No enrollments yet</p>
          </div>
        )}
      </div>
    </div>
  );
};
