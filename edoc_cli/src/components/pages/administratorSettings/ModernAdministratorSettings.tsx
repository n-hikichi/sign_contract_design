/**
 * ModernAdministratorSettings - モダナイズされたアカウント設定画面
 *
 * 管理者向けのアカウント管理機能
 * - アカウント発行
 * - ユーザー管理
 * - 権限管理
 */
import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Chip,
  Avatar,
  IconButton,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  PersonAdd,
  Delete,
  Edit,
  AdminPanelSettings,
  Person,
  Email,
  Refresh,
} from '@mui/icons-material';
import ModernPageLayout, { ContentCard } from '../../templates/ModernPageLayout';

// サンプルユーザーデータ
const sampleUsers = [
  {
    id: 1,
    name: 'ミクロス太郎',
    email: 'taro@micros.co.jp',
    role: 'admin',
    status: 'active',
  },
  {
    id: 2,
    name: '山田花子',
    email: 'hanako@micros.co.jp',
    role: 'user',
    status: 'active',
  },
  {
    id: 3,
    name: '佐藤次郎',
    email: 'jiro@micros.co.jp',
    role: 'user',
    status: 'pending',
  },
];

/**
 * ModernAdministratorSettings コンポーネント
 */
const ModernAdministratorSettings: React.FC = () => {
  const [users, setUsers] = useState(sampleUsers);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('user');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleInvite = () => {
    if (!inviteEmail) return;
    console.log(`Inviting ${inviteEmail} with role ${inviteRole}`);
    setInviteEmail('');
    // TODO: API呼び出しで招待を送信
  };

  const getRoleChip = (role: string) => {
    if (role === 'admin') {
      return (
        <Chip
          icon={<AdminPanelSettings sx={{ fontSize: 16 }} />}
          label="管理者"
          size="small"
          color="primary"
          sx={{ borderRadius: '8px' }}
        />
      );
    }
    return (
      <Chip
        icon={<Person sx={{ fontSize: 16 }} />}
        label="一般"
        size="small"
        variant="outlined"
        sx={{ borderRadius: '8px' }}
      />
    );
  };

  const getStatusChip = (status: string) => {
    if (status === 'active') {
      return (
        <Chip
          label="有効"
          size="small"
          sx={{
            bgcolor: '#dcfce7',
            color: '#166534',
            borderRadius: '8px',
            fontWeight: 500,
          }}
        />
      );
    }
    return (
      <Chip
        label="招待中"
        size="small"
        sx={{
          bgcolor: '#fef3c7',
          color: '#92400e',
          borderRadius: '8px',
          fontWeight: 500,
        }}
      />
    );
  };

  return (
    <ModernPageLayout
      title="アカウント設定"
      subtitle="ユーザーアカウントの管理と権限設定を行います"
      breadcrumbs={[
        { label: '設定' },
        { label: 'アカウント設定' },
      ]}
    >
      {/* ユーザー招待 */}
      <ContentCard
        title="新しいユーザーを招待"
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
              slotProps={{
                input: {
                  startAdornment: <Email className="text-slate-400 mr-2" />,
                },
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
              <MenuItem value="user">一般</MenuItem>
            </Select>
          </FormControl>
          <Button
            variant="contained"
            onClick={handleInvite}
            disabled={!inviteEmail}
            startIcon={<PersonAdd />}
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
      </ContentCard>

      {/* ユーザー一覧 */}
      <Box sx={{ mt: 3 }}>
        <ContentCard
          title="ユーザー一覧"
          subtitle="組織に所属するユーザーを管理します"
          actions={
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              size="small"
              sx={{ borderRadius: '8px', textTransform: 'none' }}
            >
              更新
            </Button>
          }
          noPadding
        >
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: 'grey.50' }}>
                  <TableCell sx={{ fontWeight: 600 }}>ユーザー</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>メールアドレス</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>権限</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>ステータス</TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="right">
                    操作
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user) => (
                  <TableRow
                    key={user.id}
                    sx={{ '&:hover': { bgcolor: 'grey.50' } }}
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar
                          sx={{
                            width: 36,
                            height: 36,
                            bgcolor: 'primary.main',
                            fontSize: '0.9rem',
                          }}
                        >
                          {user.name.charAt(0)}
                        </Avatar>
                        <span className="font-medium">{user.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{getRoleChip(user.role)}</TableCell>
                    <TableCell>{getStatusChip(user.status)}</TableCell>
                    <TableCell align="right">
                      <Tooltip title="編集">
                        <IconButton size="small">
                          <Edit fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="削除">
                        <IconButton size="small" color="error">
                          <Delete fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </ContentCard>
      </Box>

      {/* 権限説明 */}
      <Box sx={{ mt: 3 }}>
        <ContentCard title="権限について" subtitle="各権限でできることの説明">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <AdminPanelSettings className="text-blue-600" />
                <h4 className="font-medium text-blue-800">管理者権限</h4>
              </div>
              <ul className="text-sm text-blue-700 space-y-1 ml-6 list-disc">
                <li>ユーザーの新規追加・削除</li>
                <li>権限の変更</li>
                <li>組織設定の変更</li>
                <li>すべての契約書へのアクセス</li>
              </ul>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-center gap-2 mb-2">
                <Person className="text-slate-600" />
                <h4 className="font-medium text-slate-800">一般権限</h4>
              </div>
              <ul className="text-sm text-slate-700 space-y-1 ml-6 list-disc">
                <li>契約書の登録・編集</li>
                <li>承認フローの実行</li>
                <li>自身の契約書の閲覧</li>
                <li>プロフィールの編集</li>
              </ul>
            </div>
          </div>
        </ContentCard>
      </Box>
    </ModernPageLayout>
  );
};

export default ModernAdministratorSettings;
