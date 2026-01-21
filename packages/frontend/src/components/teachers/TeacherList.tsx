import React from 'react';

import { Teacher } from '../../services/api/teachers';

export interface TeacherListProps {
  teachers: Teacher[];
  onEdit: (teacher: Teacher) => void;
  onDeactivate: (teacher: Teacher) => void;
  isLoading?: boolean;
}

/**
 * Get workload indicator color based on weekly hours.
 */
function getWorkloadColor(hours: number): string {
  if (hours < 15) return 'bg-green-100 text-green-800';
  if (hours <= 25) return 'bg-yellow-100 text-yellow-800';
  return 'bg-red-100 text-red-800';
}

/**
 * Get workload indicator label.
 */
function getWorkloadLabel(hours: number): string {
  if (hours < 15) return 'Light';
  if (hours <= 25) return 'Normal';
  return 'Heavy';
}

export const TeacherList: React.FC<TeacherListProps> = ({
  teachers,
  onEdit,
  onDeactivate,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-cyan-600 border-t-transparent"></div>
      </div>
    );
  }

  if (teachers.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
        <p className="text-gray-500">No teachers found</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Name
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Email
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Phone
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Subjects
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Workload
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {teachers.map((teacher) => {
            const weeklyHours = teacher.weeklyHours || 0;
            const workloadColor = getWorkloadColor(weeklyHours);
            const workloadLabel = getWorkloadLabel(weeklyHours);

            return (
              <tr key={teacher.id} className="hover:bg-gray-50">
                <td className="whitespace-nowrap px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">{teacher.name}</div>
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <div className="text-sm text-gray-500">{teacher.email}</div>
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <div className="text-sm text-gray-500">{teacher.phone || '-'}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-1">
                    {teacher.qualifications.length === 0 ? (
                      <span className="text-sm text-gray-400">None</span>
                    ) : (
                      teacher.qualifications.map((qual) => (
                        <span
                          key={qual.id}
                          className="inline-flex rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-800"
                        >
                          {qual.subjectCode}
                        </span>
                      ))
                    )}
                  </div>
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${workloadColor}`}
                      title={`${weeklyHours} hours per week`}
                    >
                      {workloadLabel}
                    </span>
                    <span className="text-sm text-gray-500">{weeklyHours}h</span>
                  </div>
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <div className="flex gap-2">
                    <button
                      onClick={() => onEdit(teacher)}
                      className="text-cyan-600 hover:text-cyan-900 focus:outline-none focus:underline"
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
                      onClick={() => onDeactivate(teacher)}
                      className="text-red-600 hover:text-red-900 focus:outline-none focus:underline"
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
