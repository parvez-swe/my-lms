"use client";

import Cta from "@/components/FrontPage/Cta";
import Features from "@/components/FrontPage/Features";
import Footer from "@/components/FrontPage/Footer";
import LightDarkModeButton from "@/components/FrontPage/LightDarkModeButton";
import OurTeam from "@/components/FrontPage/OurTeam";
import Image from "next/image";

export default function Page() {
  return (
    <>
      <div className="front-page-body overflow-hidden" data-full-bleed>
        <LightDarkModeButton />

        <div className="pt-10 pb-6 text-center md:pt-12 md:pb-8">
          <div className="container relative z-[1] mx-auto px-[12px] 2xl:max-w-[1320px]">
            <h1 className="!mb-0 !text-[32px] !leading-[1.2] -tracking-[.5px] md:!text-[40px] md:-tracking-[1px] lg:!text-[50px] xl:!text-[60px] xl:-tracking-[1.5px]">
              Features
            </h1>
            <div className="absolute bottom-0 -z-[1] blur-[250px] ltr:-right-[30px] rtl:-left-[30px]">
              <Image
                src="/images/front-pages/shape3.png"
                alt="shape3"
                width={685}
                height={685}
              />
            </div>
            <div className="absolute -top-[220px] -z-[1] blur-[150px] ltr:-left-[50px] rtl:-right-[50px]">
              <Image
                src="/images/front-pages/shape5.png"
                alt="shape3"
                width={658}
                height={656}
              />
            </div>
          </div>
        </div>

        <Features />

        <OurTeam />

        <Cta />

        <Footer />
      </div>
    </>
  );
}
