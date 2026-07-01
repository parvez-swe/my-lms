import Link from "next/link";

const CMS_PAGES = [
  { title: "Hero Section", path: "/dashboard/pages/hero-section/", desc: "Homepage hero banner" },
  { title: "About Me", path: "/dashboard/pages/about-me/", desc: "About section content" },
  { title: "FAQ Section", path: "/dashboard/pages/faq-section/", desc: "Frequently asked questions" },
  { title: "Why Choose Us", path: "/dashboard/pages/why-choose-us-section/", desc: "Value propositions" },
];

export default function MarketerPagesPage() {
  return (
    <>
      <div className="mb-[25px]">
        <h5 className="!mb-0">CMS Pages</h5>
        <p className="text-gray-500 text-sm mt-1">
          Manage public-facing content for Nahal Academy.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {CMS_PAGES.map((page) => (
          <Link
            key={page.path}
            href={page.path}
            className="trezo-card bg-white dark:bg-[#0c1427] p-5 rounded-md border border-gray-100 dark:border-[#172036] hover:border-primary-300 transition"
          >
            <h6 className="!mb-1">{page.title}</h6>
            <p className="text-sm text-gray-500">{page.desc}</p>
          </Link>
        ))}
      </div>
    </>
  );
}
