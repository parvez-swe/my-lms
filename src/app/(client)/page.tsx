import Cta from "@/components/FrontPage/Cta";
import Faq from "@/components/FrontPage/Faq";
import Features from "@/components/FrontPage/Features";
import Footer from "@/components/FrontPage/Footer";
import HeroBanner from "@/components/FrontPage/HeroBanner";
import LightDarkModeButton from "@/components/FrontPage/LightDarkModeButton";
import Instructors from "@/components/FrontPage/Instructors";
import Testimonials from "@/components/FrontPage/Testimonials";
import FeaturedCourses from "@/components/FrontPage/FeaturedCourses";

export default function Home() {
  return (
    <>
      <div className="front-page-body overflow-hidden">
        <LightDarkModeButton />

        <HeroBanner />

        <Features />

        <FeaturedCourses />

        <Testimonials />

        <Instructors />

        <Faq />

        <Cta />

        <Footer />
      </div>
    </>
  );
}
