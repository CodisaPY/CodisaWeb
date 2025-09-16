import type { BoxProps } from '@mui/material/Box';

import { forwardRef } from 'react';

import Box from '@mui/material/Box';

import { RouterLink } from 'src/routes/components';

import { logoClasses } from './classes';
import { useSettingsContext } from '../settings';

// ----------------------------------------------------------------------

export type LogoProps = BoxProps & {
  href?: string;
  isSingle?: boolean;
  disableLink?: boolean;
};

export const Logo = forwardRef<HTMLDivElement, LogoProps>(
  (
    { width, href = '/', height, isSingle = true, disableLink = false, className, sx, ...other },
    ref
  ) => {
    const { navColor } = useSettingsContext(); // ✅ AHORA SÍ, dentro del componente

    const singleLogo = (
      <Box
        component="img"
        src="/assets/images/about/logo.svg"
        alt="Nuevo Logo"
        width="100%"
        height="100%"
      />
    );

    const singleLogoBlancoNEgro = (
      <Box component="img" src="/logo.svg" alt="Nuevo Logo BN" width="100%" height="100%" />
    );

    const fullLogo = (
      <Box
        component="img"
        src="/assets/images/about/logosolo.jpg"
        alt="Nuevo Logo Completo"
        width="100%"
        height="100%"
      />
    );

    const baseSize = {
      width: width ?? 40,
      height: height ?? 40,
      ...(!isSingle && {
        width: width ?? 102,
        height: height ?? 36,
      }),
    };

    const logoRender = isSingle
      ? navColor === 'integrate'
        ? singleLogo
        : singleLogoBlancoNEgro
      : fullLogo;

    return (
      <Box
        ref={ref}
        component={RouterLink}
        href={href}
        className={logoClasses.root.concat(className ? ` ${className}` : '')}
        aria-label="Logo"
        sx={{
          ...baseSize,
          flexShrink: 0,
          display: 'inline-flex',
          verticalAlign: 'middle',
          ...(disableLink && { pointerEvents: 'none' }),
          ...sx,
        }}
        {...other}
      >
        {logoRender}
      </Box>
    );
  }
);
