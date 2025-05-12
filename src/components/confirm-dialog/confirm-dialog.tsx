import { forwardRef } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button } from '@mui/material';

// ----------------------------------------------------------------------

interface ConfirmDialogProps {
  title?: string;
  content?: React.ReactNode;
  action?: React.ReactNode;
  open: boolean;
  onClose: VoidFunction;
}

export const ConfirmDialog = forwardRef<HTMLDivElement, ConfirmDialogProps>(
  ({ title, content, action, open, onClose, ...other }, ref) => (
    <Dialog
      ref={ref}
      open={open}
      onClose={onClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
      {...other}
    >
      {title && <DialogTitle id="alert-dialog-title">{title}</DialogTitle>}

      {content && (
        <DialogContent>
          {typeof content === 'string' ? (
            <DialogContentText id="alert-dialog-description">{content}</DialogContentText>
          ) : (
            content
          )}
        </DialogContent>
      )}

      {action && <DialogActions>{action}</DialogActions>}
    </Dialog>
  )
); 