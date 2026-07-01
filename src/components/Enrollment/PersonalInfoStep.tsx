"use client";

import React from "react";
import { Briefcase, Mail, MapPin, Phone, Target } from "lucide-react";
import { FormField, SelectInput, TextInput } from "@/components/ui/FormField";
import { bangladeshDivisions } from "./enrollmentConstants";
import {
  EnrollmentFormData,
  EnrollmentFormErrors,
} from "./enrollmentTypes";
import { normalizePhoneInput } from "@/lib/formValidation";

interface PersonalInfoStepProps {
  formData: EnrollmentFormData;
  errors: EnrollmentFormErrors;
  accountEmail?: string;
  onChange: <K extends keyof EnrollmentFormData>(
    field: K,
    value: EnrollmentFormData[K]
  ) => void;
}

export default function PersonalInfoStep({
  formData,
  errors,
  accountEmail,
  onChange,
}: PersonalInfoStepProps) {
  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-violet-100 bg-violet-50/50 p-4">
        <p className="text-sm text-violet-900">
          Tell us a bit about yourself. This helps us personalize your learning
          path and career recommendations.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <FormField label="Email" name="email" icon={Mail}>
          <TextInput
            id="email"
            name="email"
            type="email"
            value={formData.email || accountEmail || ""}
            readOnly
            className="bg-slate-50"
          />
        </FormField>

        <FormField
          label="Phone Number"
          name="phone"
          required
          icon={Phone}
          error={errors.phone}
          hint="Bangladesh format: 01XXXXXXXXX or +880 1XXXXXXXXX"
        >
          <TextInput
            id="phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            value={formData.phone}
            onChange={(e) =>
              onChange("phone", normalizePhoneInput(e.target.value))
            }
            placeholder="01XXXXXXXXX"
            error={Boolean(errors.phone)}
          />
        </FormField>

        <FormField
          label="Current Job / Occupation"
          name="currentJob"
          required
          icon={Briefcase}
          error={errors.currentJob}
        >
          <TextInput
            id="currentJob"
            name="currentJob"
            value={formData.currentJob}
            onChange={(e) => onChange("currentJob", e.target.value)}
            placeholder="e.g. Student, Freelancer, Engineer"
            error={Boolean(errors.currentJob)}
          />
        </FormField>

        <FormField
          label="Career Goal"
          name="careerGoal"
          required
          icon={Target}
          error={errors.careerGoal}
        >
          <SelectInput
            id="careerGoal"
            name="careerGoal"
            value={formData.careerGoal}
            onChange={(e) =>
              onChange(
                "careerGoal",
                e.target.value as EnrollmentFormData["careerGoal"]
              )
            }
            error={Boolean(errors.careerGoal)}
          >
            <option value="">Select your goal</option>
            <option value="freelance">Start freelancing</option>
            <option value="abroad">Work abroad</option>
            <option value="job">Land a local job</option>
            <option value="remote-job">Get a remote job</option>
          </SelectInput>
        </FormField>

        <FormField
          label="Division"
          name="division"
          required
          icon={MapPin}
          error={errors.division}
        >
          <SelectInput
            id="division"
            name="division"
            value={formData.division}
            onChange={(e) => {
              onChange("division", e.target.value);
              onChange("district", "");
            }}
            error={Boolean(errors.division)}
          >
            <option value="">Select division</option>
            {Object.keys(bangladeshDivisions).map((division) => (
              <option key={division} value={division}>
                {division}
              </option>
            ))}
          </SelectInput>
        </FormField>

        <FormField
          label="District / Zila"
          name="district"
          required
          icon={MapPin}
          error={errors.district}
        >
          <SelectInput
            id="district"
            name="district"
            value={formData.district}
            onChange={(e) => onChange("district", e.target.value)}
            disabled={!formData.division}
            error={Boolean(errors.district)}
          >
            <option value="">Select district</option>
            {formData.division &&
              bangladeshDivisions[
                formData.division as keyof typeof bangladeshDivisions
              ]?.map((district) => (
                <option key={district} value={district}>
                  {district}
                </option>
              ))}
          </SelectInput>
        </FormField>
      </div>
    </div>
  );
}
