import { useEffect } from 'react';

/**
 * Custom hook untuk mengubah document title
 * @param {string} title - Judul halaman
 * @param {boolean} keepOnUnmount - Apakah title tetap setelah component unmount
 */
export const useDocumentTitle = (title, keepOnUnmount = false) => {
  useEffect(() => {
    const originalTitle = document.title;
    document.title = title ? `${title} | iWare Warehouse` : 'iWare Warehouse';

    return () => {
      if (!keepOnUnmount) {
        document.title = originalTitle;
      }
    };
  }, [title, keepOnUnmount]);
};

export default useDocumentTitle;
