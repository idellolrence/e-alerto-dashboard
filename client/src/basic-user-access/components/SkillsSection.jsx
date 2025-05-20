import { Mail, Phone, MapPin, Clock } from "lucide-react";
import { assets } from "../../assets/assets";

export const ContactSection = () => {
  return (
    <section
      id="contact"
      className="relative py-22 px-4 bg-section transition-colors duration-300 overflow-hidden"
    >
      {/* Monument Image (background fade-in effect) */}
      <img
        src={assets.qc_monument}
        alt="QC Monument"
        className="absolute left-0 top-0 h-full object-cover z-0 pointer-events-none"
        style={{
          maxWidth: "500px",
          opacity: 0.2,
          filter: "brightness(0.5)", // gives it a bluish tint
          mixBlendMode: "normal",
        }}
      />

      <div className="relative z-10 container mx-auto max-w-6xl text-center mb-12">
        {/* QCDE Logo */}
        <div className="flex justify-center mb-6">
          <img
            src={assets.qcde_logo}
            alt="QCDE Logo"
            className="h-30 md:h-34 object-contain"
          />
        </div>

        {/* Heading */}
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          Connect with{" "}
          <span className="text-primary">
            Quezon City Department of Engineering
          </span>
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Reach out to us for concerns, reports, or collaborations regarding
          Quezon City's infrastructure services.
        </p>
      </div>

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
        {/* Contact Info */}
        <div className="bg-card rounded-2xl shadow-xl p-8 space-y-6">
          <div className="space-y-4 text-left">
            <div className="flex items-start gap-4">
              <MapPin className="text-primary w-6 h-6 mt-1" />
              <div>
                <h4 className="font-semibold">Address</h4>
                <p className="text-muted-foreground">
                  Quezon City Hall, Diliman, Quezon City, Philippines
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <Phone className="text-primary w-6 h-6 mt-1" />
              <div>
                <h4 className="font-semibold">Phone</h4>
                <p className="text-muted-foreground">
                  (02) 8988-4242 local 8706 / 8707
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <Mail className="text-primary w-6 h-6 mt-1" />
              <div>
                <h4 className="font-semibold">Email</h4>
                <p className="text-muted-foreground">
                  engineering@quezoncity.gov.ph
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <Clock className="text-primary w-6 h-6 mt-1" />
              <div>
                <h4 className="font-semibold">Office Hours</h4>
                <p className="text-muted-foreground">
                  Monday – Friday, 8:00AM – 5:00PM
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Google Map */}
        <div className="rounded-2xl overflow-hidden shadow-lg border border-border">
          <iframe
            title="QCDE Location"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1930.1645184745783!2d121.04842955822237!3d14.65146852830051!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3397b7d477bf1059%3A0x4ac5b2c478d1d136!2sQuezon%20City%20Hall!5e0!3m2!1sen!2sph!4v1685512341871!5m2!1sen!2sph"
            width="100%"
            height="400"
            className="w-full h-full border-0"
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          ></iframe>
        </div>
      </div>
    </section>
  );
};
