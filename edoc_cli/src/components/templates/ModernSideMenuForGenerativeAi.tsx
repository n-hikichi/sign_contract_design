/**
 * ModernSideMenuForGenerativeAi - 生成AI機能用モダンサイドメニュー
 */
import React, { useState } from 'react';
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
  UploadFile,
  Description,
  PlayCircle,
  Pending,
  Compare,
} from '@mui/icons-material';
import KeyboardReturnIcon from '@mui/icons-material/KeyboardReturn';

const DRAWER_WIDTH = 320;
const DRAWER_WIDTH_CLOSED = 64;

interface MenuItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
}

const MenuItem: React.FC<MenuItemProps> = ({
  to,
  icon,
  label,
  isActive,
}) => (
  <ListItem disablePadding>
    <ListItemButton
      component={RouterLink}
      to={to}
      className={`bounce-button ${isActive ? 'gradient-card-purple' : ''}`}
      sx={{
        borderRadius: '16px',
        mx: 1,
        mb: 0.5,
        py: 1.5,
        ...(isActive && {
          color: 'white',
          boxShadow: '0 4px 15px rgba(139, 92, 246, 0.4)',
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

const OpenedSideMenu: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const location = useLocation();

  const isActive = (paths: string[]) => paths.some((p) => location.pathname === p);

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
          bgcolor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          border: 'none',
          boxShadow: '4px 0 24px rgba(0, 0, 0, 0.08)',
        },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          pt: 2,
        }}
      >
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2, mb: 2 }}>
          <Typography
            variant="h6"
            className="gradient-text"
            sx={{ fontWeight: 700, letterSpacing: '0.02em' }}
          >
            生成AI活用機能
          </Typography>
          <IconButton onClick={onClose} size="small">
            <ChevronLeft />
          </IconButton>
        </Box>

        <Divider sx={{ mb: 2 }} />

        {/* Back to Dashboard */}
        <List sx={{ px: 1 }}>
          <MenuItem
            to="/"
            icon={<KeyboardReturnIcon />}
            label="ダッシュボードへ戻る"
            isActive={isActive(['/'])}
          />
        </List>

        <Divider sx={{ my: 2 }} />

        {/* AI Menu Items */}
        <Typography
          variant="subtitle2"
          sx={{
            px: 3,
            mb: 1,
            color: 'text.secondary',
            fontWeight: 600,
            letterSpacing: '0.05em',
          }}
        >
          AI機能メニュー
        </Typography>

        <List sx={{ px: 1, flex: 1 }}>
          <MenuItem
            to="/generativeai/registerIt"
            icon={<UploadFile />}
            label="AI OCR機能"
            isActive={isActive(['/generativeai/registerIt'])}
          />
          <MenuItem
            to="/generativeai/registerIt/makeAgreementTemplate"
            icon={<Description />}
            label="契約書テンプレート作成支援"
            isActive={isActive(['/generativeai/registerIt/makeAgreementTemplate'])}
          />
          <MenuItem
            to="/generativeai/registerIt/reviewAgreement"
            icon={<PlayCircle />}
            label="契約書レビュー支援"
            isActive={isActive(['/generativeai/registerIt/reviewAgreement'])}
          />
          <MenuItem
            to="/generativeai/registerIt/agreementDetails"
            icon={<Pending />}
            label="契約内容(期限など)確認"
            isActive={isActive(['/generativeai/registerIt/agreementDetails'])}
          />
          <MenuItem
            to="/generativeai/registerIt/differenceConfirmation"
            icon={<Compare />}
            label="差分確認機能"
            isActive={isActive(['/generativeai/registerIt/differenceConfirmation'])}
          />
        </List>

        {/* Footer */}
        <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center' }}>
            Powered by Generative AI
          </Typography>
        </Box>
      </Box>
    </Drawer>
  );
};

const ModernSideMenuForGenerativeAi: React.FC = () => {
  const [isOpen, setIsOpen] = useState(true);

  return isOpen ? (
    <OpenedSideMenu onClose={() => setIsOpen(false)} />
  ) : (
    <ClosedSideMenu onOpen={() => setIsOpen(true)} />
  );
};

export default ModernSideMenuForGenerativeAi;
