import { alpha, styled } from '@mui/material/styles';
import { Box, Card, Stack, Avatar, Typography } from '@mui/material';

// ----------------------------------------------------------------------

type Props = {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  role: string;
  status: string;
  createdAt: Date;
  department?: string;
  position?: string;
  branch?: string;
};

export function UserTableRow({ 
  id, 
  name, 
  email, 
  avatarUrl, 
  role, 
  status, 
  createdAt,
  department,
  position,
  branch,
}: Props) {
  return (
    <Card>
      <Stack spacing={2} sx={{ p: 3 }}>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Avatar alt={name} src={avatarUrl} />

          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="subtitle2">{name}</Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {email}
            </Typography>
          </Box>
        </Stack>

        <Stack direction="row" alignItems="center" spacing={2}>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {role}
          </Typography>

          <Typography
            variant="caption"
            sx={{
              px: 1,
              borderRadius: 1,
              color: status === 'active' ? 'success.main' : 'error.main',
              bgcolor: (theme) =>
                status === 'active'
                  ? alpha(theme.palette.success.main, 0.08)
                  : alpha(theme.palette.error.main, 0.08),
            }}
          >
            {status === 'active' ? 'Activo' : 'Inactivo'}
          </Typography>
        </Stack>

        {department && (
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Departamento: {department}
          </Typography>
        )}

        {position && (
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Cargo: {position}
          </Typography>
        )}

        {branch && (
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Sucursal: {branch}
          </Typography>
        )}

        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          Creado: {new Date(createdAt).toLocaleDateString()}
        </Typography>
      </Stack>
    </Card>
  );
} 