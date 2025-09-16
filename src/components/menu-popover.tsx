import { forwardRef } from 'react';

import Popover from '@mui/material/Popover';

// ----------------------------------------------------------------------

type Props = {
  children: React.ReactNode;
  open: HTMLElement | null;
  onClose: VoidFunction;
  arrow?: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right' | 'left-top' | 'left-center' | 'left-bottom' | 'right-top' | 'right-center' | 'right-bottom';
  sx?: object;
};

export const MenuPopover = forwardRef<HTMLDivElement, Props>(
  ({ children, arrow = 'top-right', open, onClose, sx, ...other }, ref) => {
    const handleClose = (event: React.MouseEvent<HTMLElement>) => {
      onClose();
    };

    return (
      <Popover
        open={Boolean(open)}
        anchorEl={open}
        onClose={handleClose}
        anchorOrigin={{
          vertical: arrow.includes('top') ? 'top' : 'bottom',
          horizontal: arrow.includes('left') ? 'left' : 'right',
        }}
        transformOrigin={{
          vertical: arrow.includes('top') ? 'bottom' : 'top',
          horizontal: arrow.includes('left') ? 'right' : 'left',
        }}
        PaperProps={{
          sx: {
            p: 1,
            width: 200,
            overflow: 'inherit',
            ...sx,
          },
        }}
        {...other}
      >
        {children}
      </Popover>
    );
  }
); 