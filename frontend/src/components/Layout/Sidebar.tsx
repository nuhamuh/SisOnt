import React from 'react';
import { 
  Box, 
  Drawer, 
  List, 
  ListItemButton,
  ListItemIcon, 
  ListItemText,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Divider
} from '@mui/material';
import { 
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Storage as StorageIcon,
  History as HistoryIcon,
  BarChart as BarChartIcon,
  Logout as LogoutIcon,
  AdminPanelSettings as AdminIcon
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useState } from 'react';

const drawerWidth = 240;

const menuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
  { text: 'Data ONT', icon: <StorageIcon />, path: '/data-ont' },
  { text: 'Histori Pemantauan', icon: <HistoryIcon />, path: '/histori-pemantauan' },
  // { text: 'Grafik', icon: <BarChartIcon />, path: '/grafik' },
];

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    handleClose();
  };

  const handleAdminClick = () => {
    navigate('/users');
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
        },
      }}
    >
      <Box sx={{ p: 2 }}>
        <Typography variant="h6">ONT Monitoring</Typography>
      </Box>
      
      <List sx={{ flexGrow: 1 }}>
        {menuItems.map((item) => (
          <ListItemButton
            key={item.text}
            onClick={() => navigate(item.path)}
            selected={location.pathname === item.path}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItemButton>
        ))}
        
        {/* Tombol Admin hanya muncul untuk user dengan role Admin */}
        {user?.role === 'Admin' && (
          <ListItemButton
            onClick={handleAdminClick}
            selected={location.pathname === '/users'}
          >
            <ListItemIcon><AdminIcon /></ListItemIcon>
            <ListItemText primary="Admin" />
          </ListItemButton>
        )}
      </List>

      <Divider />
      
      {/* User Menu di bagian bawah */}
      <Box sx={{ p: 2 }}>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1
        }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center',
            gap: 1
          }}>
            <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
              {user?.username.charAt(0).toUpperCase()}
            </Avatar>
            <Typography variant="body2" sx={{ color: 'text.primary' }}>
              {user?.username}
            </Typography>
          </Box>
          <IconButton 
            onClick={handleLogout}
            size="small"
            sx={{ color: 'text.secondary' }}
          >
            <LogoutIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>
    </Drawer>
  );
};

export default Sidebar; 