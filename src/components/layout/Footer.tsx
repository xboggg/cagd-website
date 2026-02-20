import { Link } from "react-router-dom";
import { Phone, Mail, MapPin, Facebook, Twitter, Instagram, ArrowUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const quickLinks = [
  { label: "Who We Are", path: "/about/who-we-are" },
  { label: "Leadership", path: "/management/leadership" },
  { label: "News & Updates", path: "/news" },
  { label: "Reports", path: "/reports" },
  { label: "Gallery", path: "/gallery" },
  { label: "FAQ", path: "/faq" },
  { label: "Contact Us", path: "/contact" },
];

const eServices = [
  { label: "GoG e-Payslip", url: "https://gogepayservices.com" },
  { label: "GIFMIS", url: "https://gifmis.gov.gh" },
  { label: "TPRS", url: "#" },
];

export default function Footer() {
  return (
    <footer className="bg-footer text-footer-foreground">
      <div className="container py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* About */}
          <div>
            <h3 className="font-heading font-bold text-lg text-white mb-4">CAGD</h3>
            <p className="text-sm leading-relaxed opacity-80 mb-4">
              Controller & Accountant-General's Department — providing Public Financial Management Services to the Government and general public of Ghana since 1885.
            </p>
            <div className="flex items-center gap-3">
              <a href="https://facebook.com/cagd.gov.gh" target="_blank" rel="noreferrer" className="h-9 w-9 rounded-full bg-gold/20 flex items-center justify-center text-gold hover:bg-gold hover:text-gold-foreground transition-colors">
                <Facebook className="h-4 w-4" />
              </a>
              <a href="https://twitter.com/CagdGov" target="_blank" rel="noreferrer" className="h-9 w-9 rounded-full bg-gold/20 flex items-center justify-center text-gold hover:bg-gold hover:text-gold-foreground transition-colors">
                <Twitter className="h-4 w-4" />
              </a>
              <a href="https://instagram.com/CagdGov" target="_blank" rel="noreferrer" className="h-9 w-9 rounded-full bg-gold/20 flex items-center justify-center text-gold hover:bg-gold hover:text-gold-foreground transition-colors">
                <Instagram className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-heading font-bold text-lg text-white mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.path}>
                  <Link to={link.path} className="text-sm opacity-80 hover:opacity-100 hover:text-gold transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-heading font-bold text-lg text-white mb-4">Contact Us</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-2 text-sm">
                <MapPin className="h-4 w-4 mt-0.5 text-gold shrink-0" />
                <span className="opacity-80">P.O. Box M79, Ministries, Accra, Ghana</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-gold shrink-0" />
                <a href="tel:+2330302983507" className="opacity-80 hover:text-gold transition-colors">+233 (0) 302 983 507</a>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-gold shrink-0" />
                <a href="mailto:info@cagd.gov.gh" className="opacity-80 hover:text-gold transition-colors">info@cagd.gov.gh</a>
              </div>
            </div>

            <h4 className="font-heading font-semibold text-sm text-white mt-6 mb-2">e-Services</h4>
            <ul className="space-y-1">
              {eServices.map((s) => (
                <li key={s.label}>
                  <a href={s.url} target="_blank" rel="noreferrer" className="text-sm opacity-80 hover:text-gold transition-colors">{s.label}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="font-heading font-bold text-lg text-white mb-4">Newsletter</h3>
            <p className="text-sm opacity-80 mb-4">Subscribe to receive the latest news and updates from CAGD.</p>
            <form onSubmit={(e) => e.preventDefault()} className="flex flex-col gap-2">
              <Input
                type="email"
                placeholder="Your email address"
                className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
              />
              <Button type="submit" className="bg-cta text-cta-foreground hover:bg-cta/90 font-heading">
                Subscribe
              </Button>
            </form>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="container py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs opacity-60">
          <p>© 2026 Controller & Accountant-General's Department. All Rights Reserved.</p>
          <p>Republic of Ghana</p>
        </div>
      </div>
    </footer>
  );
}
