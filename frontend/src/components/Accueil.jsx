import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/all";
import { TiLocationArrow } from "react-icons/ti";

import Button from "./Button";

gsap.registerPlugin(ScrollTrigger);

const Accueil = () => {
  useGSAP(() => {
    gsap.set("#video-frame", {
      clipPath: "polygon(14% 0, 72% 0, 88% 90%, 0 95%)",
      borderRadius: "0% 0% 40% 10%",
    });
    gsap.from("#video-frame", {
      clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
      borderRadius: "0% 0% 0% 0%",
      ease: "power1.inOut",
      scrollTrigger: {
        trigger: "#video-frame",
        start: "center center",
        end: "bottom center",
        scrub: true,
      },
    });
  });

  return (
    <div id="accueil" className="relative h-dvh w-screen overflow-x-hidden">
      <div
        id="video-frame"
        className="relative z-10 h-dvh w-screen overflow-hidden rounded-lg"
        style={{ background: "linear-gradient(135deg, #2c003e, #800000)" }}
      >
        <div>
          <div className="mask-clip-path absolute-center absolute z-50 size-64 overflow-hidden rounded-lg flex justify-center items-center">
            {<Button
              id="Analyse"
              title="Analyse"
              rightIcon={<TiLocationArrow />}
              containerClass="bg-blue-50 md:flex hidden items-center justify-center gap-1"
            />}
          </div>
          
        </div>

        <h1 className="special-font hero-heading absolute bottom-5 right-5 z-40 text-blue-100">
          <b>a</b>nalytics
        </h1>

        <div className="absolute left-0 top-0 z-40 size-full">
          <div className="mt-24 px-5 sm:px-10">
            <h1 className="special-font hero-heading text-blue-100">
              sl<b>a</b>
            </h1>

            <p className="mb-5 max-w-64 font-robert-regular text-blue-100">
              Analyse de série temporelles <br /> sur données de SLA
            </p>
          </div>
        </div>
      </div>

      <h1 className="special-font hero-heading absolute bottom-5 right-5 text-black">
        <b>a</b>nalytics
      </h1>
    </div>
  );
};

export default Accueil;
