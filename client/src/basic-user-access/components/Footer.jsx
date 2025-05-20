import { ArrowUp } from "lucide-react";
import { assets } from "../../assets/assets";

export const Footer = () => {
  return (
    <footer className="border-t border-border py-12 px-6 bg-indigo-900 relative text-white">
      <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-[auto_1fr_auto] gap-8 text-center sm:text-left">
        {/* Left: E-Alerto Logo + Tagline + Copyright */}
        <div className="flex flex-col items-center sm:items-start gap-2">
          <img
            src={assets.logo_white}
            alt="E-Alerto Logo"
            className="h-10 object-contain"
          />
          <p className="text-sm font-medium text-white">
            Empowering Citizens. Engineering Safer Roads.
          </p>
          <p className="text-xs text-white/70">
            &copy; {new Date().getFullYear()} E-Alerto. All Rights Reserved.
          </p>
        </div>

        {/* Center: Navigation Links 
        <div className="flex flex-col items-center gap-2 text-sm sm:items-end sm:text-right">
          <a
            href="#about"
            className="hover:text-primary transition-colors text-white"
          >
            About
          </a>
          <a
            href="#projects"
            className="hover:text-primary transition-colors text-white"
          >
            Reports
          </a>
          <a
            href="#contact"
            className="hover:text-primary transition-colors text-white"
          >
            Contact
          </a>
          <a
            href="/downloads/E-ALERTO_Brochure.pdf"
            download
            className="hover:text-primary transition-colors text-white"
          >
            Download
          </a>
        </div>
        */}

        {/* Right: Developer Credit */}
        <div className="flex flex-col items-center sm:items-end gap-2">
          <span className="text-xs font-semibold uppercase text-white/70">
            Developed by
          </span>
          <img
            src={assets.digibridge_solutions}
            alt="DigiBridge Solutions Logo"
            className="h-15 object-contain"
          />
        </div>
      </div>

      {/* Back to Top Button */}
      <a
        href="#hero"
        className="absolute right-6 bottom-6 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition"
        title="Back to top"
      >
        <ArrowUp size={20} />
      </a>
    </footer>
  );
};
