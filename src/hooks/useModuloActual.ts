// src/hooks/useModuloActual.ts
import { useMemo } from 'react';

import { usePathname } from 'src/routes/hooks';

export function useModuloActual(): 'TIC' | 'COMERCIAL' | '' {
  const pathname = usePathname();

  return useMemo(() => {
    if (pathname.includes('/tic')) return 'TIC';
    if (pathname.includes('/comercial')) return 'COMERCIAL';
    return '';
  }, [pathname]);
}
