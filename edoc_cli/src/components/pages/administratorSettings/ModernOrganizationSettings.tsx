/**
 * ModernOrganizationSettings - モダナイズされた管理者設定画面
 *
 * MUI v6 + Tailwind CSS ハイブリッドスタイリング
 * タブ構成：組織設定、メンバー管理、料金プラン、請求先
 */
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Tab,
  Tabs,
  TextField,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Switch,
  FormControlLabel,
  CircularProgress,
  Chip,
  Avatar,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Settings,
  People,
  CreditCard,
  Receipt,
  Security,
  VpnKey,
  Add,
  Delete,
  Edit,
  Refresh,
  Email,
  Business,
  Check,
  Warning,
} from '@mui/icons-material';
import ModernPageLayout, { ContentCard } from '../../templates/ModernPageLayout';
import MemberManagementView from './MemberManagementView';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
};

/**
 * ModernOrganizationSettings コンポーネント
 */
const ModernOrganizationSettings: React.FC = () => {
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);

  // 組織設定
  const [mfaEnabled, setMfaEnabled] = useState(true);
  const [authMethod, setAuthMethod] = useState('authenticator');

  // メンバー招待
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('general');
  const [inviting, setInviting] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleInvite = async () => {
    setInviting(true);
    try {
      console.log(`Inviting ${inviteEmail} with role ${inviteRole}`);
      // API呼び出しをここに実装
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setInviteEmail('');
    } catch (error) {
      console.error('Failed to send invite:', error);
    } finally {
      setInviting(false);
    }
  };

  const tabItems = [
    { label: '組織設定', icon: <Settings /> },
    { label: 'メンバー管理', icon: <People /> },
    { label: '料金プラン', icon: <CreditCard /> },
    { label: '請求先', icon: <Receipt /> },
  ];

  return (
    <ModernPageLayout
      loading={loading}
      title="管理者設定"
      subtitle="組織の設定やメンバー管理を行います"
      breadcrumbs={[
        { label: '設定' },
        { label: '管理者設定' },
      ]}
    >
      {/* タブナビゲーション */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm mb-6">
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="fullWidth"
          sx={{
            borderBottom: '1px solid',
            borderColor: 'divider',
            '& .MuiTab-root': {
              textTransform: 'none',
              fontSize: '0.95rem',
              fontWeight: 500,
              py: 2,
              '&.Mui-selected': {
                color: 'primary.main',
                fontWeight: 600,
              },
            },
            '& .MuiTabs-indicator': {
              height: 3,
              borderRadius: '3px 3px 0 0',
            },
          }}
        >
          {tabItems.map((item, index) => (
            <Tab
              key={index}
              icon={item.icon}
              iconPosition="start"
              label={item.label}
              id={`settings-tab-${index}`}
              aria-controls={`settings-tabpanel-${index}`}
            />
          ))}
        </Tabs>
      </div>

      {/* 組織設定タブ */}
      <TabPanel value={tabValue} index={0}>
        <ContentCard
          title="セキュリティ設定"
          subtitle="組織のセキュリティポリシーを設定します"
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
          </div>

          <div className="mt-6 flex justify-end">
            <Button
              variant="contained"
              startIcon={<Check />}
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
      </TabPanel>

      {/* メンバー管理タブ */}
      <TabPanel value={tabValue} index={1}>
        {/* ライセンス状況 */}
        <div className="mb-6 p-4 bg-gradient-to-r from-emerald-50 to-teal-50
                        border border-emerald-200 rounded-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                <People className="text-emerald-600" />
              </div>
              <div>
                <p className="font-medium text-emerald-800">
                  ライセンス利用状況
                </p>
                <p className="text-sm text-emerald-600 mt-0.5">
                  10ライセンス利用中（残り10ライセンス利用可能）
                </p>
              </div>
            </div>
            <Chip
              label="20ライセンス契約"
              color="success"
              variant="outlined"
              size="small"
            />
          </div>
        </div>

        {/* メンバー招待 */}
        <ContentCard
          title="新しいメンバーを招待"
          subtitle="メールアドレスを入力して招待を送信します"
        >
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <TextField
                fullWidth
                label="メールアドレス"
                placeholder="example@company.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                variant="outlined"
                size="small"
                InputProps={{
                  startAdornment: <Email className="text-slate-400 mr-2" />,
                }}
                sx={{
                  '& .MuiOutlinedInput-root': { borderRadius: '10px' },
                }}
              />
            </div>
            <FormControl variant="outlined" size="small" sx={{ minWidth: 140 }}>
              <InputLabel>権限</InputLabel>
              <Select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value)}
                label="権限"
                sx={{ borderRadius: '10px' }}
              >
                <MenuItem value="admin">管理者</MenuItem>
                <MenuItem value="general">一般</MenuItem>
              </Select>
            </FormControl>
            <Button
              variant="contained"
              onClick={handleInvite}
              disabled={!inviteEmail || inviting}
              startIcon={
                inviting ? <CircularProgress size={18} color="inherit" /> : <Add />
              }
              sx={{
                borderRadius: '10px',
                textTransform: 'none',
                px: 3,
                whiteSpace: 'nowrap',
              }}
            >
              招待する
            </Button>
          </div>
          <p className="mt-3 text-sm text-amber-600 flex items-center gap-1">
            <Warning fontSize="small" />
            このメールアドレスは既に利用されている場合、招待できません
          </p>
        </ContentCard>

        {/* メンバー一覧 */}
        <div className="mt-6">
          <ContentCard
            title="メンバー一覧"
            noPadding
          >
            <MemberManagementView companyInfo="" locationMappedData="" userInfo="" />
          </ContentCard>
        </div>
      </TabPanel>

      {/* 料金プランタブ */}
      <TabPanel value={tabValue} index={2}>
        <ContentCard
          title="現在のプラン"
          subtitle="ご利用中のプランと料金"
        >
          {/* 現在のプラン */}
          <div className="p-6 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl text-white mb-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">現在のプラン</p>
                <h3 className="text-2xl font-bold mt-1">スタンダード</h3>
              </div>
              <div className="text-right">
                <p className="text-blue-100 text-sm">月額</p>
                <p className="text-3xl font-bold">¥10,000</p>
              </div>
            </div>
          </div>

          {/* プラン詳細 */}
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
              <div className="flex items-center gap-3">
                <Check className="text-emerald-500" />
                <span className="text-slate-700">生成AIサポート機能</span>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
              <div className="flex items-center gap-3">
                <Check className="text-emerald-500" />
                <span className="text-slate-700">最大20ユーザー</span>
              </div>
              <Chip label="10/20利用中" size="small" />
            </div>
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
              <div>
                <span className="text-slate-700">次回請求日</span>
                <p className="text-sm text-slate-500 mt-0.5">2025年10月01日</p>
              </div>
              <Button
                variant="outlined"
                size="small"
                sx={{ borderRadius: '8px', textTransform: 'none' }}
              >
                プラン変更
              </Button>
            </div>
          </div>
        </ContentCard>
      </TabPanel>

      {/* 請求先タブ */}
      <TabPanel value={tabValue} index={3}>
        <ContentCard
          title="請求先情報"
          subtitle="請求書の送付先を設定します"
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 bg-slate-50 rounded-xl">
              <p className="text-sm text-slate-500 mb-1">請求先（宛先）</p>
              <p className="font-medium text-slate-800">株式会社ミクロスソフトウエア</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl">
              <p className="text-sm text-slate-500 mb-1">担当者</p>
              <p className="font-medium text-slate-800">山本和彦</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl md:col-span-2">
              <p className="text-sm text-slate-500 mb-1">請求先（住所）</p>
              <p className="font-medium text-slate-800">神奈川県横浜市...</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl md:col-span-2">
              <p className="text-sm text-slate-500 mb-1">請求書送付方法</p>
              <div className="flex items-center gap-2 mt-1">
                <Chip label="メール（PDF）" size="small" color="primary" />
                <Chip label="郵送" size="small" variant="outlined" />
              </div>
            </div>
          </div>
        </ContentCard>
      </TabPanel>
    </ModernPageLayout>
  );
};

export default ModernOrganizationSettings;
