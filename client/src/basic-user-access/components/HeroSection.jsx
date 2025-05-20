import { ArrowDown } from "lucide-react";
import { assets } from "../../assets/assets";

export const HeroSection = () => {
  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center justify-center px-6 py-12 bg-background text-foreground transition-colors duration-300"
    >
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        {/* LEFT: Text Content */}
        <div className="space-y-6 text-center md:text-left">
          <h1 className="text-4xl md:text-5xl font-bold leading-tight opacity-0 animate-fade-in">
            Elevating Convenience
            <br /> to Government Experience
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto md:mx-0 opacity-0 animate-fade-in-delay-2">
            A bridge between the Philippine Government and the Filipino people
            toward public service in a click.
          </p>

          <div className="pt-4 opacity-0 animate-fade-in-delay-3">
            <a href="#" className="cosmic-button">
              Download Now
            </a>
          </div>
        </div>

        <div className="relative flex justify-center md:justify-end opacity-0 animate-fade-in-delay-4">
          {/* Vibrant Light Mode Glows */}
          <div className="absolute -top-20 -left-20 w-[22rem] h-[22rem] rounded-full bg-blue-600/40 blur-3xl z-0" />
          <div className="absolute bottom-0 right-0 w-[18rem] h-[18rem] rounded-full bg-blue-400/40 blur-2xl z-0" />

          {/* App Phone Image */}
          <img
            src={assets.hero_phone}
            alt="E-Alerto Mobile App"
            className="w-80 md:w-[45rem] drop-shadow-xl relative z-10"
          />
        </div>
      </div>

      {/* Scroll Indicator */}
      {/* Scroll Indicator */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center text-center animate-bounce">
        <p className="text-sm text-muted-foreground mb-1">Scroll</p>
        <ArrowDown className="h-5 w-5 text-primary" />
      </div>
    </section>
  );
};
