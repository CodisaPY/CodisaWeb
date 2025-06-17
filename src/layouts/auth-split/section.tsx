import type { BoxProps } from '@mui/material/Box';
import type { Breakpoint } from '@mui/material/styles';

import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';

import { CONFIG } from 'src/config-global';
import { bgGradient } from 'src/theme/styles';

// ----------------------------------------------------------------------

type SectionProps = BoxProps & {
  title?: string;
  method?: string;
  imgUrl?: string;
  subtitle?: string;
  layoutQuery: Breakpoint;
  methods?: {
    path: string;
    icon: string;
    label: string;
  }[];
};

export function Section({
  sx,
  method,
  layoutQuery,
  methods,
  title = '',
  imgUrl = `${CONFIG.assetsDir}/assets/images/about/logoBlanco.svg`,
  subtitle = 'Transformando requerimientos en sistemas inteligentes.',
  ...other
}: SectionProps) {
  const theme = useTheme();

  return (
    <Box
      sx={{
        ...bgGradient({
          color: `0deg, rgba(0, 46, 138, 0.92), rgba(0, 2, 138, 0.92)`, // azul CODISA translúcido
          imgUrl: `${CONFIG.assetsDir}/assets/background/background-3-blur.webp`,
        }),
        px: 3,
        pb: 3,
        width: 1,
        maxWidth: 480,
        display: 'none',
        position: 'relative',
        pt: 'var(--layout-header-desktop-height)',
        [theme.breakpoints.up(layoutQuery)]: {
          gap: 8,
          display: 'flex',
          alignItems: 'center',
          flexDirection: 'column',
          justifyContent: 'center',
        },
        ...sx,
      }}
      {...other}
    >
      <div>
        <img
          src="/assets/images/about/LINKER_WHT.svg"
          alt="Logo"
          style={{
            display: 'block',
            margin: '0 auto',
            width: '300px',
            height: 'auto',
            opacity: 0,
            animation: 'fadeIn 1s ease-in-out forwards',
          }}
        />
 
      </div>

      <style>
        {`
    @keyframes fadeIn {
      to {
        opacity: 1;
      }
    }
  `}
      </style>

      <Box
        component="img"
        alt="Dashboard illustration"
        src={imgUrl}
        sx={{ width: 120, maxWidth: '100%', aspectRatio: '5/5', objectFit: 'cover' }}
      />
    </Box>
  );
}
