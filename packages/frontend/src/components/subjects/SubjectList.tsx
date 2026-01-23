import React from 'react';

import { Subject } from '../../services/api/subjects';

export interface SubjectListProps {
  subjects: Subject[];
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

export const SubjectList: React.FC<SubjectListProps> = ({
  subjects,
  onEdit,
  onDelete,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-cyan-600 border-t-transparent"></div>
      </div>
    );
  }

  if (subjects.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
        <p className="text-gray-500">No subjects found</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Code
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Name
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Type
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Teachers
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Enrollments
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {subjects.map((subject) => {
            const mandatoryBadge = getMandatoryBadge(subject.isMandatory);

            return (
              <tr key={subject.id} className="hover:bg-gray-50">
                <td className="whitespace-nowrap px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">{subject.code}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">{subject.name}</div>
                  {subject.prerequisiteCount > 0 && (
                    <div className="mt-1">
                      <span className="inline-flex rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600">
                        {subject.prerequisiteCount} prereq{subject.prerequisiteCount > 1 ? 's' : ''}
                      </span>
                    </div>
                  )}
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <span
                    className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${mandatoryBadge.color}`}
                  >
                    {mandatoryBadge.label}
                  </span>
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <div className="flex items-center gap-2">
                    <span
                      className="inline-flex rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-800"
                      title={`${subject.qualifiedTeacherCount} qualified teachers`}
                    >
                      {subject.qualifiedTeacherCount}
                    </span>
                  </div>
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <div className="text-sm text-gray-900">{subject.enrollmentCount}</div>
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <div className="flex gap-2">
                    <button
                      onClick={() => onEdit(subject)}
                      className="text-cyan-600 hover:text-cyan-900 focus:outline-none focus:underline"
                      aria-label={`Edit ${subject.name}`}
                    >
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={() => onDelete(subject)}
                      className="text-red-600 hover:text-red-900 focus:outline-none focus:underline"
                      aria-label={`Delete ${subject.name}`}
                    >
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
