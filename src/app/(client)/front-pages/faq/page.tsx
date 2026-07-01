"use client";

import Cta from "@/components/FrontPage/Cta";
import Footer from "@/components/FrontPage/Footer";
import LightDarkModeButton from "@/components/FrontPage/LightDarkModeButton";
import PageHero from "@/components/FrontPage/PageHero";
import Faq from "@/components/FrontPage/Faq";

export default function Page() {
  return (
    <div className="front-page-body overflow-hidden bg-slate-50 dark:bg-[#0c1427]" data-full-bleed>
      <LightDarkModeButton />

      <PageHero
        badge="Help Center"
        title="Frequently Asked Questions"
        subtitle="Find quick answers about courses, enrollment, payments, and mentorship. Can't find what you need? Contact us anytime."
      />

      <Faq variant="embedded" />

      <Cta />
      <Footer />
    </div>
  );
}
