/**
 * ModernSideMenu - MUI Default スタイルサイドメニュー
 */
import React, { useEffect, useState } from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import {
  Box,
  Drawer,
  IconButton,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  ChevronLeft,
  Menu,
  Home,
  Description,
  PlayCircle,
  Pending,
  Person,
  Group,
} from '@mui/icons-material';
import api from '../../utils/apiAccessor';
import { getUserData } from '../../auth/login';

const DRAWER_WIDTH = 280;
const DRAWER_WIDTH_CLOSED = 64;

interface MenuItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  count?: number;
  isActive: boolean;
  badgeGradient?: 'purple' | 'orange' | 'green';
}

const MenuItem: React.FC<MenuItemProps> = ({
  to,
  icon,
  label,
  count,
  isActive,
  badgeGradient,
}) => (
  <ListItem disablePadding>
    <ListItemButton
      component={RouterLink}
      to={to}
      className={`bounce-button ${isActive ? 'gradient-card-rainbow' : ''}`}
      sx={{
        borderRadius: '16px',
        mx: 1,
        mb: 0.5,
        py: 1.5,
        ...(isActive && {
          color: 'white',
          boxShadow: '0 4px 15px rgba(118, 75, 162, 0.4)',
          '& .MuiListItemIcon-root': {
            color: 'white',
          },
          '& .MuiListItemText-primary': {
            fontWeight: 600,
          },
          '&:hover': {
            bgcolor: 'transparent',
          },
        }),
      }}
    >
      <ListItemIcon sx={{ minWidth: 40 }}>{icon}</ListItemIcon>
      <ListItemText primary={label} />
      {count !== undefined && count > 0 && (
        <Box
          className={`badge-pulse gradient-card-${badgeGradient || 'purple'}`}
          sx={{
            px: 1.5,
            py: 0.5,
            borderRadius: '9999px',
            color: 'white',
            fontSize: '0.75rem',
            fontWeight: 700,
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
          }}
        >
          {count}
        </Box>
      )}
    </ListItemButton>
  </ListItem>
);

const ClosedSideMenu: React.FC<{ onOpen: () => void }> = ({ onOpen }) => (
  <Drawer
    variant="persistent"
    anchor="left"
    open={true}
    sx={{
      width: DRAWER_WIDTH_CLOSED,
      flexShrink: 0,
      '& .MuiDrawer-paper': {
        width: DRAWER_WIDTH_CLOSED,
        position: 'relative',
        height: '100%',
        boxSizing: 'border-box',
        bgcolor: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(20px)',
      },
    }}
  >
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', pt: 2 }}>
      <IconButton onClick={onOpen}>
        <Menu />
      </IconButton>
    </Box>
  </Drawer>
);

type DocumentCount = {
  before_flow: number;
  in_internal_flow: number;
  in_customer_flow: number;
};

const OpenedSideMenu: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const location = useLocation();
  const [loginUser, setLoginUser] = useState('');
  const [documentCount, setDocumentCount] = useState<DocumentCount>();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.getAgreementCount();
        if (res.status === api.HTTP_OK) {
          const json = await res.json();
          setDocumentCount(json);
        }
      } catch (error) {
        console.error('Error fetching document count:', error);
      }
    };

    fetchData();
    setLoginUser(getUserData());
  }, []);

  const isActive = (paths: string[]): boolean => paths.includes(location.pathname);

  return (
    <Drawer
      variant="persistent"
      anchor="left"
      open={true}
      sx={{
        width: DRAWER_WIDTH,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: DRAWER_WIDTH,
          position: 'relative',
          height: '100%',
          boxSizing: 'border-box',
          bgcolor: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(20px)',
        },
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 1, borderBottom: 1, borderColor: 'divider' }}>
        <IconButton size="small" onClick={onClose}>
          <ChevronLeft />
        </IconButton>
      </Box>

      <Box sx={{ flex: 1, overflowY: 'auto' }}>
        <List>
          <MenuItem to="/" icon={<Home />} label="ダッシュボード" isActive={isActive(['/'])} />
        </List>

        <Divider />
        <Typography
          variant="overline"
          sx={{
            px: 2,
            py: 1,
            mt: 1,
            display: 'block',
            color: 'text.secondary',
            bgcolor: 'rgba(139, 92, 246, 0.1)',
            fontSize: 'calc(var(--text-md) + 1px)',
          }}
        >
          契約書管理
        </Typography>
        <List>
          <MenuItem
            to="/documentManagement/conclusionDocument"
            icon={<Description />}
            label="締結済み契約書"
            isActive={isActive(['/documentManagement/conclusionDocument'])}
          />
        </List>

        <Divider />
        <Typography
          variant="overline"
          sx={{
            px: 2,
            py: 1,
            mt: 1,
            display: 'block',
            color: 'text.secondary',
            bgcolor: 'rgba(139, 92, 246, 0.1)',
            fontSize: 'calc(var(--text-md) + 1px)',
          }}
        >
          新規契約書管理
        </Typography>
        <List>
          <MenuItem
            to="/documentManagement/register"
            icon={<Description />}
            label="登録"
            isActive={isActive(['/documentManagement/register'])}
          />
          {loginUser === 'd.arai@micros.co.jp' && (
            <MenuItem
              to="/generativeai/registerIt"
              icon={<Description />}
              label="登録（IT企業特化）"
              isActive={isActive(['/generativeai/registerIt'])}
            />
          )}
          <MenuItem
            to="/documentManagement/registerList"
            icon={<PlayCircle />}
            label="承認フロー開始前"
            count={documentCount?.before_flow}
            isActive={isActive(['/documentManagement/registerList'])}
            badgeGradient="purple"
          />
          <MenuItem
            to="/documentManagement/internalDocument"
            icon={<Pending />}
            label="社内承認中"
            count={documentCount?.in_internal_flow}
            isActive={isActive(['/documentManagement/internalDocument'])}
            badgeGradient="orange"
          />
          <MenuItem
            to="/documentManagement/customerDocument"
            icon={<Pending />}
            label="相手方承認中"
            count={documentCount?.in_customer_flow}
            isActive={isActive(['/documentManagement/customerDocument'])}
            badgeGradient="green"
          />
        </List>

        <Divider />
        <Typography
          variant="overline"
          sx={{
            px: 2,
            py: 1,
            mt: 1,
            display: 'block',
            color: 'text.secondary',
            bgcolor: 'rgba(139, 92, 246, 0.1)',
            fontSize: 'calc(var(--text-md) + 1px)',
          }}
        >
          企業・ユーザー管理
        </Typography>
        <List>
          <MenuItem
            to="/manage/company"
            icon={<Person />}
            label="自社情報管理"
            isActive={isActive(['/manage/company'])}
          />
          <MenuItem
            to="/manage/clientCompany"
            icon={<Group />}
            label="相手方情報管理"
            isActive={isActive(['/manage/clientCompany', '/manage/clientCompanyLocation'])}
          />
        </List>
      </Box>
    </Drawer>
  );
};

const ModernSideMenu: React.FC = () => {
  const [isOpen, setIsOpen] = useState(() => {
    const saved = localStorage.getItem('sideMenuIsOpen');
    return saved ? JSON.parse(saved) : true;
  });

  useEffect(() => {
    localStorage.setItem('sideMenuIsOpen', JSON.stringify(isOpen));
  }, [isOpen]);

  return isOpen ? (
    <OpenedSideMenu onClose={() => setIsOpen(false)} />
  ) : (
    <ClosedSideMenu onOpen={() => setIsOpen(true)} />
  );
};

export default ModernSideMenu;
