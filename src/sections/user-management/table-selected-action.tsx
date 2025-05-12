import { alpha, styled } from '@mui/material/styles';
import { Box, Stack, Button, Tooltip, Typography } from '@mui/material';

// ----------------------------------------------------------------------

const StyledRoot = styled('div')(({ theme }) => ({
  padding: theme.spacing(2),
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.primary.main, 0.08),
}));

// ----------------------------------------------------------------------

type Props = {
  dense?: boolean;
  action?: React.ReactNode;
  rowCount: number;
  numSelected: number;
  onSelectAllRows: (checked: boolean) => void;
  sx?: object;
};

export function TableSelectedAction({
  dense,
  action,
  rowCount,
  numSelected,
  onSelectAllRows,
  sx,
  ...other
}: Props) {
  return (
    <StyledRoot
      sx={{
        display: 'flex',
        alignItems: 'center',
        ...((!action || numSelected === 0) && {
          display: 'none',
        }),
        ...sx,
      }}
      {...other}
    >
      <Stack direction="row" alignItems="center" sx={{ flexGrow: 1 }}>
        <Typography variant="subtitle1">
          {numSelected} {numSelected > 1 ? 'seleccionados' : 'seleccionado'}
        </Typography>

        <Tooltip title="Deseleccionar todo">
          <Button color="primary" onClick={() => onSelectAllRows(false)} sx={{ ml: 1 }}>
            Deseleccionar
          </Button>
        </Tooltip>
      </Stack>

      {action && <Box sx={{ ml: 2 }}>{action}</Box>}
    </StyledRoot>
  );
} 