import { useEffect } from "react";

export function useDocumentMeta({ title, description, image }) {
  useEffect(() => {
    if (title) document.title = title;
    // description
    if (description) {
        let metaDescription = document.querySelector('meta[name="description"]');
        let metaOgDescription = document.querySelector('meta[name="og:description"]');
        if (!metaDescription) {
            metaDescription = document.createElement('meta');
            metaDescription.name = "description";
            document.head.appendChild(metaDescription);
        }
        if (!metaOgDescription) {
            metaOgDescription = document.createElement('meta');
            metaOgDescription.name = "og:description";
            document.head.appendChild(metaOgDescription);
        }
        metaDescription.content = description;
        metaOgDescription.content = description;
    }
    // image
    if (image) {
        let meta = document.querySelector('meta[name="og:image"]');
        if (!meta) {
            meta = document.createElement('meta');
            meta.name = "og:image";
            document.head.appendChild(meta);
        }
        meta.content = image;
    }
  }, [title, description, image]);
}
