import EditCourseForm from "@/components/LMS/EditCourseForm";

export default async function InstructorUpdateCoursePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <>
      <div className="mb-[25px]">
        <h5 className="!mb-0">Edit Course</h5>
      </div>
      <EditCourseForm
        courseId={id}
        redirectTo="/instructor/courses/"
        lockInstructor
      />
    </>
  );
}
