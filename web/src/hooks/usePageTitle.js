import { useEffect } from 'react';

export function usePageTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} — FilmFinder` : 'FilmFinder';
    return () => {
      document.title = 'FilmFinder';
    };
  }, [title]);
}
