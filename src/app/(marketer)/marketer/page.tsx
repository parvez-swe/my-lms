import Link from "next/link";
import { BarChart3, FileText, Layout } from "lucide-react";

export default function MarketerDashboardPage() {
  return (
    <>
      <div className="mb-[25px]">
        <h5 className="!mb-1">Marketer Dashboard</h5>
        <p className="text-gray-500 text-sm">
          Track performance and manage marketing content for Nahal Academy.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <Link
          href="/marketer/analytics/"
          className="trezo-card bg-white dark:bg-[#0c1427] p-6 rounded-md hover:shadow-md transition group"
        >
          <BarChart3 className="text-primary-500 mb-3" size={28} />
          <h6 className="!mb-1 group-hover:text-primary-500 transition">Analytics</h6>
          <p className="text-sm text-gray-500">Enrollments, revenue, and traffic</p>
        </Link>

        <Link
          href="/marketer/pages/"
          className="trezo-card bg-white dark:bg-[#0c1427] p-6 rounded-md hover:shadow-md transition group"
        >
          <Layout className="text-success-500 mb-3" size={28} />
          <h6 className="!mb-1 group-hover:text-success-500 transition">CMS Pages</h6>
          <p className="text-sm text-gray-500">Edit landing page sections</p>
        </Link>

        <Link
          href="/dashboard/pages/hero-section/"
          className="trezo-card bg-white dark:bg-[#0c1427] p-6 rounded-md hover:shadow-md transition group"
        >
          <FileText className="text-orange-500 mb-3" size={28} />
          <h6 className="!mb-1 group-hover:text-orange-500 transition">Hero Section</h6>
          <p className="text-sm text-gray-500">Update homepage hero content</p>
        </Link>
      </div>
    </>
  );
}
