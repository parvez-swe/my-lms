import AdminInstructorProfiles from "@/components/Admin/AdminInstructorProfiles";

export default function Page() {
  return (
    <>
      <div className="mb-[25px]">
        <h5 className="!mb-0">Instructor Profile Approvals</h5>
        <p className="text-sm text-gray-500 mt-1">
          Review and approve teacher profiles before they can create courses.
        </p>
      </div>
      <AdminInstructorProfiles />
    </>
  );
}
