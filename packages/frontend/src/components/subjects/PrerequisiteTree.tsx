import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import React from 'react';

import { SubjectPrerequisite } from '../../services/api/subjects';

export interface PrerequisiteTreeProps {
  prerequisites: SubjectPrerequisite[];
  title?: string;
  circularDependencyIds?: string[];
}

interface PrerequisiteNodeProps {
  prerequisite: SubjectPrerequisite;
  level: number;
  isCircularDependency: boolean;
}

const PrerequisiteNode: React.FC<PrerequisiteNodeProps> = ({
  prerequisite,
  level,
  isCircularDependency,
}) => {
  const indentation = level * 24; // 24px per level

  // Determine border and background based on circular dependency
  const borderClass = isCircularDependency ? 'border-red-500' : 'border-gray-300';
  const bgClass = isCircularDependency ? 'bg-red-50' : 'bg-white';

  // Determine badge color based on isMandatory
  const badgeText = prerequisite.isMandatory ? 'Required' : 'Optional';
  const badgeColorClass = prerequisite.isMandatory
    ? 'bg-red-100 text-red-800'
    : 'bg-blue-100 text-blue-800';

  return (
    <div>
      <div
        data-subject-id={prerequisite.id}
        className={`flex items-center gap-2 rounded-md border ${borderClass} ${bgClass} p-3 shadow-sm`}
        style={{ marginLeft: `${indentation}px` }}
      >
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="rounded bg-cyan-100 px-2 py-0.5 text-xs font-mono font-semibold text-cyan-800">
              {prerequisite.code}
            </span>
            <span className="text-sm font-medium text-gray-900">{prerequisite.name}</span>
            <span className={`rounded px-2 py-0.5 text-xs font-semibold ${badgeColorClass}`}>
              {badgeText}
            </span>
          </div>
        </div>
        {level > 0 && <span className="text-xs text-gray-500">Level {level}</span>}
        {isCircularDependency && (
          <ExclamationTriangleIcon
            className="h-5 w-5 text-red-500"
            aria-label="Circular dependency"
          />
        )}
      </div>

      {/* Render nested prerequisites */}
      {prerequisite.prerequisites && prerequisite.prerequisites.length > 0 && (
        <div className="mt-2 space-y-2">
          {prerequisite.prerequisites.map((nestedPrereq) => (
            <PrerequisiteNode
              key={nestedPrereq.id}
              prerequisite={nestedPrereq}
              level={level + 1}
              isCircularDependency={false}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const PrerequisiteTree: React.FC<PrerequisiteTreeProps> = ({
  prerequisites,
  title = 'Prerequisite Chain',
  circularDependencyIds = [],
}) => {
  if (prerequisites.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-6 text-center">
        <p className="text-sm text-gray-500">No prerequisites</p>
      </div>
    );
  }

  const hasCircularDependencies = circularDependencyIds.length > 0;

  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
      <h3 className="mb-4 text-sm font-semibold text-gray-700">{title}</h3>

      {hasCircularDependencies && (
        <div className="mb-4 flex items-center gap-2 rounded-md border border-red-300 bg-red-50 p-3">
          <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
          <p className="text-sm font-medium text-red-800">
            Circular dependency detected! This prerequisite configuration is invalid.
          </p>
        </div>
      )}

      <div className="space-y-3">
        {prerequisites.map((prerequisite) => (
          <PrerequisiteNode
            key={prerequisite.id}
            prerequisite={prerequisite}
            level={0}
            isCircularDependency={circularDependencyIds.includes(prerequisite.id)}
          />
        ))}
      </div>
    </div>
  );
};
