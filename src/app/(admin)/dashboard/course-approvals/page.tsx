import AdminCourseApprovals from "@/components/Admin/AdminCourseApprovals";

export default function Page() {
  return (
    <>
      <div className="mb-[25px]">
        <h5 className="!mb-0">Course Approvals</h5>
        <p className="text-sm text-gray-500 mt-1">
          Approve instructor-submitted courses before they appear on the public
          site.
        </p>
      </div>
      <AdminCourseApprovals />
    </>
  );
}
