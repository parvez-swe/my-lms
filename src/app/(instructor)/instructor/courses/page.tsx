import CoursesListTable from "@/components/LMS/CoursesList/CoursesListTable";
import Link from "next/link";

export default function InstructorCoursesPage() {
  return (
    <>
      <div className="mb-[25px] md:flex items-center justify-between">
        <h5 className="!mb-0">My Courses</h5>
        <Link
          href="/instructor/courses/create/"
          className="inline-block mt-3 md:mt-0 bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium px-4 py-2 rounded-md transition"
        >
          + Create Course
        </Link>
      </div>
      <CoursesListTable
        scope="mine"
        basePath="/instructor/courses"
        showDelete={false}
      />
    </>
  );
}
