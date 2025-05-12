import type { CSSObject } from '@mui/material/styles';
import type { PopoverOrigin } from '@mui/material/Popover';

import type { PopoverArrow } from './types';

// ----------------------------------------------------------------------

const POPOVER_DISTANCE = 0.75;

export type CalculateAnchorOriginProps = {
  paperStyles?: CSSObject;
  anchorOrigin: PopoverOrigin;
  transformOrigin: PopoverOrigin;
};

export function calculateAnchorOrigin(placement: PopoverArrow['placement']): CalculateAnchorOriginProps {
  const isTop = placement?.includes('top');
  const isBottom = placement?.includes('bottom');
  const isLeft = placement?.includes('left');
  const isRight = placement?.includes('right');
  const isCenter = placement?.includes('center');

  const anchorOrigin: PopoverOrigin = {
    vertical: isTop ? 'top' : 'bottom',
    horizontal: isLeft ? 'left' : 'right',
  };

  const transformOrigin: PopoverOrigin = {
    vertical: isTop ? 'bottom' : 'top',
    horizontal: isLeft ? 'right' : 'left',
  };

  const paperStyles = {
    ...(isTop && {
      mt: 1.5,
    }),
    ...(isBottom && {
      mb: 1.5,
    }),
    ...(isLeft && {
      ml: 1.5,
    }),
    ...(isRight && {
      mr: 1.5,
    }),
    ...(isCenter && {
      mt: 0,
      mb: 0,
      ml: 0,
      mr: 0,
    }),
  };

  return {
    anchorOrigin,
    transformOrigin,
    paperStyles,
  };
}
