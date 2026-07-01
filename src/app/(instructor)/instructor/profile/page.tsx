import InstructorProfileForm from "@/components/Instructor/InstructorProfileForm";

export default function InstructorProfilePage() {
  return (
    <>
      <div className="mb-[25px]">
        <h5 className="!mb-1">Instructor Profile</h5>
        <p className="text-sm text-gray-500">
          Complete your profile and submit for admin approval before creating
          courses.
        </p>
      </div>
      <InstructorProfileForm />
    </>
  );
}
