import { useState, useCallback } from 'react';

import type { UsePopoverReturn } from './types';

// ----------------------------------------------------------------------

export function usePopover(): UsePopoverReturn {
  const [open, setOpen] = useState(false);

  const onOpen = useCallback(() => {
    setOpen(true);
  }, []);

  const onClose = useCallback(() => {
    setOpen(false);
  }, []);

  const onToggle = useCallback(() => {
    setOpen((prev) => !prev);
  }, []);

  return {
    open,
    onOpen,
    onClose,
    onToggle,
    setOpen,
  };
}
