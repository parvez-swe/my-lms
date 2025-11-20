import Link from "next/link";
import React from "react";

const page = () => {
  return (
    <div>
      {/* list of pages for customization Home
Features
Our Team
FAQ's
Contact */}
      <div>
        <h1>Pages</h1>
        <ul>
          <li>
            <Link href="/dashboard/pages/[slug]">Page 1</Link>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default page;
