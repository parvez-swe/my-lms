"use client";

import Cta from "@/components/FrontPage/Cta";
import Footer from "@/components/FrontPage/Footer";
import LightDarkModeButton from "@/components/FrontPage/LightDarkModeButton";
import PageHero from "@/components/FrontPage/PageHero";
import ContactPage from "@/app/(client)/contact/page";

export default function Page() {
  return (
    <div className="front-page-body overflow-hidden bg-slate-50 dark:bg-[#0c1427]" data-full-bleed>
      <LightDarkModeButton />

      <PageHero
        badge="Get in Touch"
        title="Contact Us"
        subtitle="Have a question about courses, enrollment, or partnerships? We'd love to hear from you."
      />

      <ContactPage />

      <Cta />
      <Footer />
    </div>
  );
}
