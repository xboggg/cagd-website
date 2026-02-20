import { useEffect } from "react";

interface SEOHeadProps {
  title: string;
  description: string;
  path?: string;
  type?: string;
  jsonLd?: Record<string, unknown>;
}

export default function SEOHead({ title, description, path = "/", type = "WebPage", jsonLd }: SEOHeadProps) {
  const fullTitle = `${title} | CAGD Ghana`;
  const url = `https://cagd.gov.gh${path}`;

  useEffect(() => {
    document.title = fullTitle;

    const setMeta = (name: string, content: string, attr = "name") => {
      let el = document.querySelector(`meta[${attr}="${name}"]`);
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, name);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };

    setMeta("description", description);
    setMeta("og:title", fullTitle, "property");
    setMeta("og:description", description, "property");
    setMeta("og:url", url, "property");
    setMeta("og:type", "website", "property");
    setMeta("twitter:card", "summary");
    setMeta("twitter:title", fullTitle);
    setMeta("twitter:description", description);

    // Canonical
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", url);

    // JSON-LD
    const ldData = jsonLd || {
      "@context": "https://schema.org",
      "@type": type,
      name: fullTitle,
      description,
      url,
      publisher: {
        "@type": "GovernmentOrganization",
        name: "Controller & Accountant-General's Department",
        url: "https://cagd.gov.gh",
      },
    };

    let script = document.getElementById("jsonld-seo") as HTMLScriptElement;
    if (!script) {
      script = document.createElement("script");
      script.id = "jsonld-seo";
      script.type = "application/ld+json";
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(ldData);

    return () => {
      document.title = "CAGD Ghana";
    };
  }, [fullTitle, description, url, type, jsonLd]);

  return null;
}
