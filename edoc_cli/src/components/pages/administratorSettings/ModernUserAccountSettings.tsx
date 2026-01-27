/**
 * ModernUserAccountSettings - モダナイズされたユーザー設定画面
 *
 * ユーザー自身のアカウント情報に関する設定ページ
 */
import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Switch,
  FormControlLabel,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Avatar,
} from '@mui/material';
import {
  Person,
  Security,
  VpnKey,
  Lock,
  Save,
  Edit,
} from '@mui/icons-material';
import ModernPageLayout, { ContentCard } from '../../templates/ModernPageLayout';
import awsconfig from '../../../aws-exports';

const clientId = awsconfig.Auth.aws_user_pools_web_client_id;

/**
 * ModernUserAccountSettings コンポーネント
 */
const ModernUserAccountSettings: React.FC = () => {
  const [userName, setUserName] = useState<string>('');
  const [userEmail, setUserEmail] = useState<string>('');
  const [tenantId, setTenantId] = useState<string>('');
  const [companyName, setCompanyName] = useState<string>('株式会社ミクロスソフトウエア');

  // MFA設定
  const [mfaEnabled, setMfaEnabled] = useState(true);
  const [authMethod, setAuthMethod] = useState('authenticator');

  useEffect(() => {
    window.scrollTo(0, 0);

    // 認証スキップモードの場合は.envのテストユーザー情報を使用
    if (process.env.REACT_APP_SKIP_AUTH === 'true') {
      setUserName(process.env.REACT_APP_TEST_USER_NAME || '開発ユーザー');
      setUserEmail(process.env.REACT_APP_TEST_USER_EMAIL || 'dev@example.com');
      setTenantId(process.env.REACT_APP_TEST_TENANT_ID || 'DEV-TENANT');
      return;
    }

    // Cognitoからユーザー情報を取得
    try {
      const users = localStorage.getItem(
        `CognitoIdentityServiceProvider.${clientId}.LastAuthUser`
      );
      const idToken = localStorage.getItem(
        `CognitoIdentityServiceProvider.${clientId}.${users}.idToken`
      );

      if (idToken) {
        const parts = idToken.split('.');
        if (parts.length === 3) {
          const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
          const padded = base64.padEnd(
            base64.length + ((4 - (base64.length % 4)) % 4),
            '='
          );
          const payloadBytes = Uint8Array.from(atob(padded), (c) =>
            c.charCodeAt(0)
          );
          const jsonStr = new TextDecoder('utf-8').decode(payloadBytes);
          const payload = JSON.parse(jsonStr);

          setUserName(payload['name'] || '');
          setUserEmail(payload['email'] || '');
          setTenantId(payload['custom:tenantid'] || '');
        }
      }
    } catch (error) {
      console.error('ユーザー情報の取得に失敗しました:', error);
    }
  }, []);

  const handleSaveSettings = () => {
    console.log('Settings saved:', { mfaEnabled, authMethod });
    // TODO: API呼び出しで設定を保存
  };

  return (
    <ModernPageLayout
      title="ユーザー設定"
      subtitle="アカウント情報とセキュリティ設定を管理します"
      breadcrumbs={[
        { label: '設定' },
        { label: 'ユーザー設定' },
      ]}
    >
      {/* プロフィール情報 */}
      <ContentCard
        title="プロフィール情報"
        subtitle="アカウントの基本情報"
        actions={
          <Button
            variant="outlined"
            startIcon={<Edit />}
            size="small"
            sx={{ borderRadius: '8px', textTransform: 'none' }}
          >
            編集
          </Button>
        }
      >
        <div className="flex items-start gap-6">
          <Avatar
            className="gradient-card-rainbow"
            sx={{ width: 80, height: 80, fontSize: '2rem', boxShadow: 2 }}
          >
            {userName.charAt(0) || 'U'}
          </Avatar>
          <div className="flex-1 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded-xl">
                <p className="text-sm text-slate-500 mb-1">ユーザー名</p>
                <p className="font-medium text-slate-800">{userName || '未設定'}</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl">
                <p className="text-sm text-slate-500 mb-1">メールアドレス</p>
                <p className="font-medium text-slate-800">{userEmail || '未設定'}</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl">
                <p className="text-sm text-slate-500 mb-1">テナントID</p>
                <p className="font-medium text-slate-800">{tenantId || '未設定'}</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl">
                <p className="text-sm text-slate-500 mb-1">所属組織</p>
                <p className="font-medium text-slate-800">{companyName}</p>
              </div>
            </div>
          </div>
        </div>
      </ContentCard>

      {/* セキュリティ設定 */}
      <Box sx={{ mt: 3 }}>
        <ContentCard
          title="セキュリティ設定"
          subtitle="多要素認証とパスワードの管理"
        >
          <div className="space-y-6">
            {/* 多要素認証 */}
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Security className="text-blue-600" />
                </div>
                <div>
                  <h4 className="font-medium text-slate-800">多要素認証（MFA）</h4>
                  <p className="text-sm text-slate-500 mt-0.5">
                    ログイン時に追加の認証を要求します
                  </p>
                </div>
              </div>
              <FormControlLabel
                control={
                  <Switch
                    checked={mfaEnabled}
                    onChange={(e) => setMfaEnabled(e.target.checked)}
                    color="primary"
                  />
                }
                label={mfaEnabled ? 'ON' : 'OFF'}
                labelPlacement="start"
              />
            </div>

            {/* 認証方式 */}
            {mfaEnabled && (
              <div className="p-4 bg-slate-50 rounded-xl">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <VpnKey className="text-indigo-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-slate-800">認証方式</h4>
                    <p className="text-sm text-slate-500 mt-0.5">
                      多要素認証で使用する方式を選択します
                    </p>
                  </div>
                </div>
                <FormControl fullWidth variant="outlined" size="small">
                  <InputLabel>認証方式</InputLabel>
                  <Select
                    value={authMethod}
                    onChange={(e) => setAuthMethod(e.target.value)}
                    label="認証方式"
                    sx={{ borderRadius: '10px' }}
                  >
                    <MenuItem value="authenticator">Authenticatorアプリ</MenuItem>
                    <MenuItem value="email">メール認証</MenuItem>
                    <MenuItem value="sms">SMS認証</MenuItem>
                  </Select>
                </FormControl>
              </div>
            )}

            <Divider />

            {/* パスワード変更 */}
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                  <Lock className="text-amber-600" />
                </div>
                <div>
                  <h4 className="font-medium text-slate-800">パスワード</h4>
                  <p className="text-sm text-slate-500 mt-0.5">
                    アカウントのパスワードを変更します
                  </p>
                </div>
              </div>
              <Button
                variant="outlined"
                size="small"
                sx={{ borderRadius: '8px', textTransform: 'none' }}
              >
                変更する
              </Button>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <Button
              variant="contained"
              startIcon={<Save />}
              onClick={handleSaveSettings}
              sx={{
                borderRadius: '10px',
                textTransform: 'none',
                px: 4,
                py: 1.25,
              }}
            >
              設定を保存
            </Button>
          </div>
        </ContentCard>
      </Box>
    </ModernPageLayout>
  );
};

export default ModernUserAccountSettings;
