import { useEffect } from "react";

interface SeoMetaProps {
  title: string;
  description: string;
  canonical?: string;
  ogImage?: string;
  structuredData?: Record<string, any>;
}

/**
 * Hook to set SEO meta tags dynamically for each page.
 * Updates the document title, meta description, and optionally adds JSON-LD structured data.
 */
export const useSeoMeta = ({
  title,
  description,
  canonical,
  ogImage,
  structuredData,
}: SeoMetaProps) => {
  useEffect(() => {
    // Update page title
    document.title = title;

    // Update or create meta description
    let metaDescription = document.querySelector("meta[name='description']");
    if (metaDescription) {
      metaDescription.setAttribute("content", description);
    } else {
      metaDescription = document.createElement("meta");
      metaDescription.setAttribute("name", "description");
      metaDescription.setAttribute("content", description);
      document.head.appendChild(metaDescription);
    }

    // Update OG tags
    const ogTitle = document.querySelector("meta[property='og:title']");
    if (ogTitle) ogTitle.setAttribute("content", title);

    const ogDesc = document.querySelector("meta[property='og:description']");
    if (ogDesc) ogDesc.setAttribute("content", description);

    if (ogImage) {
      const ogImg = document.querySelector("meta[property='og:image']");
      if (ogImg) ogImg.setAttribute("content", ogImage);
    }

    // Update or create canonical link
    if (canonical) {
      let canonicalLink = document.querySelector("link[rel='canonical']");
      if (canonicalLink) {
        canonicalLink.setAttribute("href", canonical);
      } else {
        canonicalLink = document.createElement("link");
        canonicalLink.setAttribute("rel", "canonical");
        canonicalLink.setAttribute("href", canonical);
        document.head.appendChild(canonicalLink);
      }
    }

    // Add or update JSON-LD structured data
    if (structuredData) {
      let scriptTag = document.querySelector("script[data-page-schema]");
      if (scriptTag) {
        scriptTag.remove();
      }

      const script = document.createElement("script");
      script.setAttribute("type", "application/ld+json");
      script.setAttribute("data-page-schema", "true");
      script.textContent = JSON.stringify(structuredData);
      document.head.appendChild(script);
    }

    return () => {
      // Cleanup if needed (optional)
    };
  }, [title, description, canonical, ogImage, structuredData]);
};
