import { useState } from 'react';
import PropTypes from "prop-types";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { alpha, styled } from "@mui/material/styles";
import { Avatar, Box, Drawer, Link, Typography, IconButton } from "@mui/material";
import useResponsive from "../../../hooks/useResponsive";
import Logo from "../../../components/logo";
import Scrollbar from "../../../components/scrollbar";
import NavSection from "../../../components/nav-section";
import navConfig from "./config";
import { useAuth } from "../../../hooks/useAuth";
import { useAuthStore } from "../../../store/authStore";

// ----------------------------------------------------------------------

const NAV_WIDTH = 280;

const StyledAccount = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(2, 2.5),
  borderRadius: Number(theme.shape.borderRadius) * 1.5,
  backgroundColor: alpha(theme.palette.grey[500], 0.12),
}));

// ----------------------------------------------------------------------

Nav.propTypes = {
  openNav: PropTypes.bool,
  onCloseNav: PropTypes.func,
};

export default function Nav({ openNav, onCloseNav }) {
  const { user } = useAuthStore();

  const [open, setOpen] = useState(null);
  const { pathname } = useLocation();

  const isDesktop = useResponsive('up', 'lg');

  useEffect(() => {
    if (openNav) {
      onCloseNav();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);


  const handleOpen = (event) => {
    setOpen(event.currentTarget);
  };

  const handleClose = () => {
    setOpen(null);
  };

  // Filter navigation items based on user role
  const filteredNavConfig = navConfig.filter(
    (navItem) => !navItem.adminOnly || (user && user.isAdmin)
  );

  const renderContent = (
    <Scrollbar
      sx={{
        height: 1,
        '& .simplebar-content': { height: 1, display: 'flex', flexDirection: 'column' },
      }}
    >
      <Box sx={{ px: 2.5, py: 3, display: 'inline-flex' }}>
        <Logo />
      </Box>

      <Box sx={{ mb: 5, mx: 2.5 }}>
        <StyledAccount>
          <Avatar src={user?.photo || '/default-photo-url.png'} alt={user?.name || 'User'} />
          <Box sx={{ ml: 2 }}>
            <Typography variant="subtitle2" sx={{ color: 'text.primary' }}>
              {user.name}
            </Typography>

            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {user.isAdmin ? "Admin" : user.isLibrarian ? "Librarian" : "Member"}
            </Typography>
          </Box>
        </StyledAccount>
      </Box>

      <NavSection
        data={filteredNavConfig}
      />

      <Box sx={{ flexGrow: 1 }} />
    </Scrollbar>
  );

  return (
    <Box
      component="nav"
      sx={{
        flexShrink: { lg: 0 },
        width: { lg: NAV_WIDTH },
      }}
    >
      {isDesktop ? (
        <Drawer
          open
          variant="permanent"
          PaperProps={{
            sx: {
              width: NAV_WIDTH,
              bgcolor: 'background.default',
              borderRightStyle: 'dashed',
            },
          }}
        >
          {renderContent}
        </Drawer>
      ) : (
        <Drawer
          open={openNav}
          onClose={onCloseNav}
          ModalProps={{
            keepMounted: true,
          }}
          PaperProps={{
            sx: { width: NAV_WIDTH },
          }}
        >
          {renderContent}
        </Drawer>
      )}
    </Box>
  );
}