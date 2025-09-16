import type { PopoverProps } from '@mui/material';
import type { Theme, SxProps } from '@mui/material/styles';

// ----------------------------------------------------------------------

export type PopoverArrow = {
  placement?: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right' | 'left-top' | 'left-center' | 'left-bottom' | 'right-top' | 'right-center' | 'right-bottom';
  offset?: number;
  size?: number;
  hide?: boolean;
  sx?: SxProps<Theme>;
};

export interface CustomPopoverProps extends Omit<PopoverProps, 'open'> {
  open: boolean;
  onClose: VoidFunction;
  arrow?: PopoverArrow;
  hiddenArrow?: boolean;
  children?: React.ReactNode;
  slotProps?: {
    paper?: PopoverProps['PaperProps'];
    arrow?: PopoverArrow;
  };
}

export type UsePopoverReturn = {
  open: boolean;
  onOpen: (event: React.MouseEvent<HTMLElement>) => void;
  onClose: VoidFunction;
  onToggle: (event: React.MouseEvent<HTMLElement>) => void;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
};
