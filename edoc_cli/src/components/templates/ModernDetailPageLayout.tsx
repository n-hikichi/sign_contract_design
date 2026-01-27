/**
 * ModernDetailPageLayout - MUI Default スタイル詳細ページレイアウト
 */
import React from 'react';
import { Box, CssBaseline } from '@mui/material';
import Header from './Header';
import Footer from './Footer';
import NowLoading from './NowLoading';
import SignatureApproveList from '../pages/common/SignatureApproveList';
import apiDataType from '../../utils/apiDataType';

interface ModernDetailPageLayoutProps {
  children: React.ReactNode;
  loading?: boolean;
  approveFlowData?: apiDataType.AgreementFlow;
  flowStatus?: string;
  bgVariant?: 'default' | 'primary' | 'success' | 'error';
  showSidebar?: boolean;
}

const ModernDetailPageLayout: React.FC<ModernDetailPageLayoutProps> = ({
  children,
  loading = false,
  approveFlowData,
  flowStatus,
  showSidebar = true,
}) => {
  if (loading) {
    return <NowLoading />;
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <CssBaseline />
      <Header />
      <Box sx={{ display: 'flex', flex: 1, pt: '64px', pb: 3 }}>
        {showSidebar && approveFlowData && (
          <SignatureApproveList
            approveHistory={approveFlowData}
            flowStatus={flowStatus}
          />
        )}
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            px: showSidebar ? 2 : 5,
          }}
        >
          {children}
        </Box>
      </Box>
      <Footer />
    </Box>
  );
};

export default ModernDetailPageLayout;

export {
  StatusBanner,
  TitleBar,
  ActionBar,
  BackButton,
  DeleteButton,
  SendButton,
  RefreshButton,
  InfoCard,
  InfoField,
  ModernTabs,
  TabPanel,
  PdfViewerModal,
  ConfirmDialog,
} from '../common/ModernDetailComponents';
