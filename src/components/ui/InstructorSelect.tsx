"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Loader } from "lucide-react";

export interface InstructorOption {
  id: string;
  name: string;
  email: string;
  image: string;
  bio?: string;
  headline?: string;
}

interface InstructorSelectProps {
  value?: string;
  onChange: (instructor: InstructorOption | null) => void;
  required?: boolean;
}

export default function InstructorSelect({
  value,
  onChange,
  required,
}: InstructorSelectProps) {
  const [instructors, setInstructors] = useState<InstructorOption[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/users/teachers")
      .then((r) => r.json())
      .then((result) => {
        if (result.success) setInstructors(result.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const selected = instructors.find((i) => i.id === value);

  return (
    <div>
      <label className="mb-[10px] text-black dark:text-white font-medium block">
        Instructor / Teacher {required && <span className="text-danger-500">*</span>}
      </label>

      {loading ? (
        <div className="flex items-center gap-2 text-gray-500 text-sm py-3">
          <Loader size={16} className="animate-spin" />
          Loading instructors...
        </div>
      ) : (
        <select
          value={value || ""}
          onChange={(e) => {
            const inst = instructors.find((i) => i.id === e.target.value);
            onChange(inst || null);
          }}
          required={required}
          className="h-[55px] rounded-md text-black dark:text-white border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-[17px] block w-full outline-0 transition-all focus:border-primary-500"
        >
          <option value="">Select an instructor...</option>
          {instructors.map((inst) => (
            <option key={inst.id} value={inst.id}>
              {inst.name} ({inst.email})
            </option>
          ))}
        </select>
      )}

      {selected && (
        <div className="mt-3 flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-[#0a0e19] border border-gray-100 dark:border-[#172036]">
          <Image
            src={selected.image}
            alt={selected.name}
            width={48}
            height={48}
            className="rounded-full object-cover"
          />
          <div>
            <p className="font-semibold text-black dark:text-white text-sm">
              {selected.name}
            </p>
            <p className="text-xs text-gray-500">{selected.email}</p>
            {selected.headline && (
              <p className="text-xs text-gray-400 mt-0.5">{selected.headline}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
