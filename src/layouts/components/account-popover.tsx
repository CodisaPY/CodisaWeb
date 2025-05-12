import type { IconButtonProps } from '@mui/material/IconButton';
import { useRef } from 'react';

import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import MenuList from '@mui/material/MenuList';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';

import { paths } from 'src/routes/paths';
import { useRouter, usePathname } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';

import { Label } from 'src/components/label';
import { usePopover, CustomPopover } from 'src/components/custom-popover';

import { useMockedUser } from 'src/auth/hooks';

import { AccountButton } from './account-button';
import { SignOutButton } from './sign-out-button';

// ----------------------------------------------------------------------

export type AccountPopoverProps = IconButtonProps & {
  data?: {
    label: string;
    href: string;
    icon?: React.ReactNode;
    info?: React.ReactNode;
  }[];
};

export function AccountPopover({ data = [], sx, ...other }: AccountPopoverProps) {
  const router = useRouter();
  const popover = usePopover();
  const pathname = usePathname();
  const { user } = useMockedUser();
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleClickItem = (path: string) => {
    popover.onClose();
    router.push(path);
  };

  return (
    <>
      <AccountButton
        ref={buttonRef}
        onClick={popover.onOpen}
        photoURL={user?.photoURL}
        displayName={user?.displayName}
        sx={sx}
        {...other}
      />

      <CustomPopover
        open={popover.open}
        onClose={popover.onClose}
        anchorEl={buttonRef.current}
        slotProps={{
          paper: { sx: { p: 0, width: 200 } },
        }}
      >
        <Box sx={{ p: 2, pb: 1.5 }}>
          <Typography variant="subtitle2" noWrap>
            {user?.displayName}
          </Typography>

          <Typography variant="body2" sx={{ color: 'text.secondary' }} noWrap>
            {user?.email}
          </Typography>
        </Box>

        <Divider sx={{ borderStyle: 'dashed' }} />

        <MenuList disablePadding sx={{ p: 1 }}>
          {data?.map((item) => (
            <MenuItem
              key={item.label}
              component={RouterLink}
              href={item.href}
              onClick={popover.onClose}
              sx={{ borderRadius: 1 }}
            >
              {item.icon}
              {item.label}
            </MenuItem>
          ))}
        </MenuList>

        <Divider sx={{ borderStyle: 'dashed' }} />

        <Box sx={{ p: 1 }}>
          <SignOutButton />
        </Box>
      </CustomPopover>
    </>
  );
}
