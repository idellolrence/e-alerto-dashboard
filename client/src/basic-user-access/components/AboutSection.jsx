import { Cpu, MapPin, ClipboardList } from "lucide-react";

export const AboutSection = () => {
  return (
    <section id="about" className="py-24 px-4 relative bg-section transition-colors duration-300">
      {" "}
      <div className="container mx-auto max-w-5xl">
        <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">
          About <span className="text-primary">E-Alerto</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h3 className="text-2xl font-semibold">
              AI-Powered Road Issue Reporting Platform for QCitizens
            </h3>

            <p className="text-muted-foreground">
              E-Alerto is a smart reporting system developed under the Quezon
              City Department of Engineering (QCDE) to empower QCitizens in
              reporting road-related infrastructure issues. The platform bridges
              the gap within QC stakeholders by integrating digital solutions
              for a QCitizen-powered city.
            </p>

            <p className="text-muted-foreground">
              By connecting citizens and local agencies through technology,
              E-Alerto supports proactive maintenance, safer roads, and stronger
              civic participation in Quezon City.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-4 justify-center">
              <a href="#contact" className="cosmic-button">
                {" "}
                Get In Touch
              </a>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6">
            <div className="gradient-border p-6 card-hover">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-full bg-primary/10">
                  <Cpu className="h-6 w-6 text-primary" />
                </div>
                <div className="text-left">
                  <h4 className="font-semibold text-lg">
                    {" "}
                    AI-powered Image Processing
                  </h4>
                  <p className="text-muted-foreground">
                    Uses computer vision to automatically detect and classify
                    types of road damage in submitting photographic reports.
                  </p>
                </div>
              </div>
            </div>
            <div className="gradient-border p-6 card-hover">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-full bg-primary/10">
                  <MapPin className="h-6 w-6 text-primary" />
                </div>
                <div className="text-left">
                  <h4 className="font-semibold text-lg"> Geo-tagging & Mapping</h4>
                  <p className="text-muted-foreground">
                    Accurately tags report locations using GPS to help QCDE
                    respond to the issues based on geospatial data
                  </p>
                </div>
              </div>
            </div>
            <div className="gradient-border p-6 card-hover">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-full bg-primary/10">
                  <ClipboardList className="h-6 w-6 text-primary" />
                </div>

                <div className="text-left">
                  <h4 className="font-semibold text-lg"> Track Your Reports</h4>
                  <p className="text-muted-foreground">
                    Monitor the status of your reports from submission to
                    resolution—fostering transparency and public trust.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
