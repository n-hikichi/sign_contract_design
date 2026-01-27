/**
 * ModernGuestTopPage - MUI Default スタイルゲストトップページ
 */
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Box, Button, CircularProgress, Paper, Typography } from '@mui/material';
import { CheckCircle, Error, ArrowForward, Security } from '@mui/icons-material';
import api from '../../utils/apiAccessor';
import apiExecutor from '../../utils/apiExecutor';
import ModernGuestPageLayout from './common/ModernGuestPageLayout';

/**
 * ModernGuestTopPage コンポーネント
 */
const ModernGuestTopPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // State
  const [isLoading, setIsLoading] = useState(true);
  const [agreementData, setAgreementData] = useState<any>(null);
  const [isInValidLogin, setIsInValidLogin] = useState(false);
  const [errorCode, setErrorCode] = useState(0);
  const [errorProcess, setErrorProcess] = useState('');

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const authInfo = queryParams.get('documentId');

    if (!authInfo) {
      console.error('Auth Info is missing');
      setErrorCode(api.HTTP_BAD_REQUEST);
      setErrorProcess('認証情報の取得');
      setIsInValidLogin(true);
      setIsLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const res = await apiExecutor.fetchGetAgreementForGuest(authInfo);
        if (res.status !== api.HTTP_OK) {
          setErrorCode(res.status);
          setErrorProcess('承認フロー開始前文書取得処理');
          setIsInValidLogin(true);
          return;
        }

        const json = await res.json();
        setAgreementData(json);
      } catch (error) {
        console.error('Error:', error);
        setErrorCode(api.HTTP_INTERNAL_SERVER_ERROR);
        setErrorProcess('承認フロー開始前文書取得処理');
        setIsInValidLogin(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [location.search]);

  const handleProceed = () => {
    navigate('/guest/termsofuse', { state: { agreementData } });
  };

  // ローディング中
  if (isLoading) {
    return (
      <ModernGuestPageLayout loading={false}>
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '60vh',
          }}
        >
          <Paper sx={{ p: 6, maxWidth: 480, width: '100%', textAlign: 'center' }}>
            <Box
              sx={{
                width: 80,
                height: 80,
                bgcolor: 'primary.light',
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 3,
              }}
            >
              <CircularProgress size={40} />
            </Box>
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 1.5 }}>
              資格情報を確認しています
            </Typography>
            <Typography color="text.secondary">
              確認が終了するまで、今しばらくお待ちください。
            </Typography>
            <Box
              sx={{
                mt: 3,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 1,
                color: 'primary.main',
              }}
            >
              <Security fontSize="small" />
              <Typography variant="body2">セキュア認証中...</Typography>
            </Box>
          </Paper>
        </Box>
      </ModernGuestPageLayout>
    );
  }

  // エラー
  if (isInValidLogin) {
    return (
      <ModernGuestPageLayout>
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '60vh',
          }}
        >
          <Paper sx={{ p: 6, maxWidth: 480, width: '100%', textAlign: 'center' }}>
            <Box
              sx={{
                width: 80,
                height: 80,
                bgcolor: 'error.light',
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 3,
              }}
            >
              <Error sx={{ color: 'error.main', fontSize: 48 }} />
            </Box>
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 1.5 }}>
              認証エラー
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 2 }}>
              認証処理中に予期せぬエラーが発生しました。
            </Typography>
            <Paper
              variant="outlined"
              sx={{ p: 2, mb: 3, bgcolor: 'error.lighter', textAlign: 'left' }}
            >
              <Typography variant="body2" color="error.main">
                <strong>エラーコード:</strong> {errorCode}
              </Typography>
              <Typography variant="body2" color="error.main">
                <strong>処理:</strong> {errorProcess}
              </Typography>
            </Paper>
            <Typography variant="body2" color="text.secondary">
              お手数ですが、再度アクセスしてください。
            </Typography>
          </Paper>
        </Box>
      </ModernGuestPageLayout>
    );
  }

  // 認証成功
  return (
    <ModernGuestPageLayout>
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
        }}
      >
        <Paper sx={{ p: 6, maxWidth: 480, width: '100%', textAlign: 'center' }}>
          <Box
            sx={{
              width: 80,
              height: 80,
              bgcolor: 'success.light',
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 3,
            }}
          >
            <CheckCircle sx={{ color: 'success.main', fontSize: 48 }} />
          </Box>
          <Typography variant="h6" fontWeight="bold" sx={{ mb: 1.5 }}>
            資格情報の確認が完了しました
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 4 }}>
            契約書情報にアクセスする準備ができました。
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={handleProceed}
            endIcon={<ArrowForward />}
          >
            契約書情報へアクセスする
          </Button>
          <Box
            sx={{
              mt: 4,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1,
              color: 'text.secondary',
            }}
          >
            <Security fontSize="small" />
            <Typography variant="caption">
              ブロックチェーン技術で保護されています
            </Typography>
          </Box>
        </Paper>
      </Box>
    </ModernGuestPageLayout>
  );
};

export default ModernGuestTopPage;
