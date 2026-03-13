import React from 'react';
import { Offer } from '@repo/models';

interface ProjectCardProps {
  project: Offer;
}

export default function ProjectCard({ project }: ProjectCardProps) {
  return (
    <div className="flex flex-col p-5 border border-gray-300/30 rounded-[var(--border-radius)] max-w-[600px]">
      <p className="mb-2.5 text-2xl font-semibold text-[var(--primary)]">
        {project.title}
      </p>

      <div className="flex justify-between text-sm">
        <p>{project.location}</p>

        <p className="text-gray-500">
          {project.salaryRange.min} - {project.salaryRange.max}€
        </p>
      </div>

      <hr className="border-gray-300/30 my-[15px]" />

      <p className="text-justify">
        {project.description.length > 100
          ? `${project.description.slice(0, 100)}...`
          : project.description}
      </p>

      <hr className="border-gray-300/30 my-[15px]" />

      <ul className="list-[circle] list-inside">
        {project.skills.map((skill, index) => (
          <li key={index} className="mb-1.5 text-gray-600">
            {skill}
          </li>
        ))}
      </ul>
    </div>
  );
}
