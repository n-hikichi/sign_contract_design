/**
 * ModernHomePage - MUI Default スタイルホームページ（ダッシュボード）
 */
import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  TextField,
  CircularProgress,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Button,
  Grid2 as Grid,
  List,
  ListItem,
  ListItemText,
  Divider,
  Dialog,
  Fab,
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import {
  Description,
  PlayCircle,
  Pending,
  CheckCircle,
  TrendingUp,
  Chat as ChatIcon,
  Close as CloseIcon,
  AutoAwesome,
  Send,
} from '@mui/icons-material';
import ReactMarkdown from 'react-markdown';
import Header from '../templates/Header';
import Footer from '../templates/Footer';
import SideMenu from '../templates/SideMenu';
import NowLoading from '../templates/NowLoading';
import api from '../../utils/apiAccessor';
import { basePageStyle } from '../../styles/styles';
import awsconfig_generativeai from '../../aws-exports';

// メッセージの型
interface Message {
  role: 'user' | 'assistant';
  content: string;
}

// 統計カードの型
interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: 'primary' | 'warning' | 'success' | 'secondary';
  trend?: string;
}

/**
 * 統計カードコンポーネント
 */
const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color, trend }) => {
  const iconBadgeMap = {
    primary: 'icon-badge-blue',
    warning: 'icon-badge-orange',
    success: 'icon-badge-green',
    secondary: 'icon-badge-purple',
  };

  return (
    <Paper className="card-3d stat-card" sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="body2" className="card-label">
            {title}
          </Typography>
          <Typography variant="h3" className="stat-number gradient-text" sx={{ mt: 1 }}>
            {value}
          </Typography>
          {trend && (
            <Typography variant="body2" color="success.main" sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <TrendingUp fontSize="small" />
              {trend}
            </Typography>
          )}
        </Box>
        <Box className={`icon-badge ${iconBadgeMap[color]}`}>
          {icon}
        </Box>
      </Box>
    </Paper>
  );
};

/**
 * お知らせアイテムの型
 */
interface NoticeItem {
  id: number;
  type: 'info' | 'update' | 'important';
  title: string;
  date: string;
}

/**
 * お知らせセクション
 */
const NoticeSection: React.FC = () => {
  const notices: NoticeItem[] = [
    { id: 1, type: 'info', title: '社内運用開始', date: '2024年12月' },
    { id: 2, type: 'update', title: '機能アップデート', date: '2025年05月' },
    { id: 3, type: 'info', title: '正式サービス開始', date: '2025年09月' },
  ];

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'info':
        return (
          <Chip
            label="お知らせ"
            size="small"
            className="gradient-card-pink"
            sx={{ color: 'white', fontWeight: 600 }}
          />
        );
      case 'update':
        return (
          <Chip
            label="更新"
            size="small"
            className="gradient-card-cyan"
            sx={{ color: 'white', fontWeight: 600 }}
          />
        );
      case 'important':
        return (
          <Chip
            label="重要"
            size="small"
            className="gradient-card-orange"
            sx={{ color: 'white', fontWeight: 600 }}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Paper className="card-3d">
      <Box
        sx={{
          px: 3,
          py: 2.5,
          borderBottom: 1,
          borderColor: 'divider',
          bgcolor: 'rgba(139, 92, 246, 0.1)',
        }}
      >
        <Typography
          variant="h6"
          className="section-title"
          sx={{ fontSize: 'calc(var(--text-md) + 1px)' }}
        >
          お知らせ
        </Typography>
      </Box>
      <List disablePadding>
        {notices.map((notice, index) => (
          <React.Fragment key={notice.id}>
            <ListItem sx={{ px: 3, py: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
                {getTypeBadge(notice.type)}
                <ListItemText primary={notice.title} />
              </Box>
              <Typography variant="body2" color="text.secondary">
                {notice.date}
              </Typography>
            </ListItem>
            {index < notices.length - 1 && <Divider />}
          </React.Fragment>
        ))}
      </List>
    </Paper>
  );
};

/**
 * クイックアクションセクション
 */
const QuickActions: React.FC<{ onNavigate: (path: string) => void }> = ({ onNavigate }) => {
  const actions = [
    {
      icon: <Description />,
      title: '契約書を登録',
      description: '新しい契約書をアップロード',
      path: '/documentManagement/register',
      gradient: 'gradient-card-blue',
    },
    {
      icon: <PlayCircle />,
      title: '承認フロー確認',
      description: '承認待ちの契約書を確認',
      path: '/documentManagement/registerList',
      gradient: 'gradient-card-orange',
    },
    {
      icon: <CheckCircle />,
      title: '締結済み一覧',
      description: '完了した契約書を確認',
      path: '/documentManagement/conclusionDocument',
      gradient: 'gradient-card-green',
    },
  ];

  return (
    <Paper className="card-3d">
      <Box
        sx={{
          px: 3,
          py: 2.5,
          borderBottom: 1,
          borderColor: 'divider',
          bgcolor: 'rgba(139, 92, 246, 0.1)',
        }}
      >
        <Typography
          variant="h6"
          className="section-title"
          sx={{ fontSize: 'calc(var(--text-md) + 1px)' }}
        >
          クイックアクション
        </Typography>
      </Box>
      <Box sx={{ p: 2.5 }}>
        <Grid container spacing={2}>
          {actions.map((action, index) => (
            <Grid size={{ xs: 12, md: 4 }} key={index}>
              <Paper
                variant="outlined"
                sx={{
                  p: 2.5,
                  cursor: 'pointer',
                  '&:hover': { bgcolor: 'action.hover' },
                }}
                onClick={() => onNavigate(action.path)}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box
                    className={action.gradient}
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      boxShadow: 2,
                    }}
                  >
                    {action.icon}
                  </Box>
                  <Box>
                    <Typography fontWeight="bold">{action.title}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {action.description}
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Paper>
  );
};

/**
 * チャットパネル
 */
interface ChatPanelProps {
  isOpen: boolean;
  onClose: () => void;
  messages: Message[];
  input: string;
  setInput: (value: string) => void;
  onSend: () => void;
  loading: boolean;
  selectedModel: string;
  onModelChange: (event: SelectChangeEvent<string>) => void;
  modelOptions: { value: string; label: string }[];
}

const ModernChatPanel: React.FC<ChatPanelProps> = ({
  isOpen,
  onClose,
  messages,
  input,
  setInput,
  onSend,
  loading,
  selectedModel,
  onModelChange,
  modelOptions,
}) => {
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  return (
    <Dialog open={isOpen} onClose={onClose} maxWidth="md" fullWidth>
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '80vh' }}>
        {/* ヘッダー */}
        <Box
          sx={{
            px: 3,
            py: 2.5,
            bgcolor: 'primary.main',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box
              sx={{
                width: 48,
                height: 48,
                bgcolor: 'rgba(255,255,255,0.2)',
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <AutoAwesome sx={{ color: 'white', fontSize: 28 }} />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
                契約業務支援AIチャット
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                契約書に関する質問をお気軽にどうぞ
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={onClose} sx={{ color: 'white' }}>
            <CloseIcon />
          </IconButton>
        </Box>

        {/* モデル選択 */}
        <Box sx={{ px: 3, py: 1.5, borderBottom: 1, borderColor: 'divider', bgcolor: 'grey.50' }}>
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>モデル選択</InputLabel>
            <Select value={selectedModel} label="モデル選択" onChange={onModelChange}>
              {modelOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {/* メッセージエリア */}
        <Box sx={{ flex: 1, overflow: 'auto', p: 3, bgcolor: 'grey.50' }}>
          {messages.map((msg, index) => (
            <Box
              key={index}
              sx={{
                display: 'flex',
                justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                mb: 2,
              }}
            >
              <Paper
                sx={{
                  maxWidth: '70%',
                  px: 2.5,
                  py: 2,
                  bgcolor: msg.role === 'user' ? 'primary.main' : 'background.paper',
                  color: msg.role === 'user' ? 'white' : 'text.primary',
                }}
              >
                {msg.role === 'assistant' ? (
                  <Box sx={{ '& p': { m: 0 } }}>
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </Box>
                ) : (
                  <Typography>{msg.content}</Typography>
                )}
              </Paper>
            </Box>
          ))}
          <div ref={messagesEndRef} />
        </Box>

        {/* 入力エリア */}
        <Box sx={{ px: 3, py: 2.5, borderTop: 1, borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="質問を入力してください..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              multiline
              maxRows={3}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.shiftKey) {
                  e.preventDefault();
                  onSend();
                }
              }}
            />
            <Button
              variant="contained"
              onClick={onSend}
              disabled={loading || !input.trim()}
              sx={{ px: 3 }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : <Send />}
            </Button>
          </Box>
        </Box>
      </Box>
    </Dialog>
  );
};

/**
 * ModernHomePage メインコンポーネント
 */
const ModernHomePage: React.FC = () => {
  const navigate = useNavigate();

  // State
  const [loading, setLoading] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState<string>('sonnet');
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'こんにちは！　何かお困りのことはありますか？' },
  ]);
  const [input, setInput] = useState<string>('');

  // 契約書カウント
  const [documentCounts, setDocumentCounts] = useState({
    total: 0,
    beforeFlow: 0,
    internalFlow: 0,
    customerFlow: 0,
  });

  const modelOptions = [
    { value: 'sonnet', label: 'Claude Sonnet 4' },
    { value: 'haiku', label: 'Claude 3 Haiku' },
  ];

  // 認証設定
  const clientId = awsconfig_generativeai.Auth.aws_user_pools_web_client_id;

  const getAuthorizationHeader = () => {
    const userName = localStorage.getItem(`CognitoIdentityServiceProvider.${clientId}.LastAuthUser`) || '';
    const token = localStorage.getItem(`CognitoIdentityServiceProvider.${clientId}.${userName}.idToken`) || '';
    return { Authorization: `Bearer ${token}` };
  };

  // 初回データ取得
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await api.getAgreementCount();
        if (res.status === api.HTTP_OK) {
          const json = await res.json();
          setDocumentCounts({
            total: (json.before_flow || 0) + (json.in_internal_flow || 0) + (json.in_customer_flow || 0),
            beforeFlow: json.before_flow || 0,
            internalFlow: json.in_internal_flow || 0,
            customerFlow: json.in_customer_flow || 0,
          });
        }
      } catch (error) {
        console.error('Error fetching document count:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    window.scrollTo(0, 0);
  }, []);

  // メッセージ送信
  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');

    try {
      const endpoint =
        selectedModel === 'haiku'
          ? 'https://dv1vxqef7b.execute-api.ap-northeast-1.amazonaws.com/test3-sonnetv4/chat-v2-haiku'
          : 'https://dv1vxqef7b.execute-api.ap-northeast-1.amazonaws.com/test3-sonnetv4/chat-v2';

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthorizationHeader() },
        body: JSON.stringify({ user_input: input }),
      });

      const data = await response.json();
      const body = JSON.parse(data.body);

      const assistantMessage: Message = { role: 'assistant', content: body.answer };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error fetching AI response:', error);
      const errorMessage: Message = {
        role: 'assistant',
        content: '申し訳ありません。エラーが発生しました。もう一度お試しください。',
      };
      setMessages((prev) => [...prev, errorMessage]);
    }
  };

  const handleModelChange = (event: SelectChangeEvent<string>) => {
    setSelectedModel(event.target.value);
  };

  return (
    <>
      <Box sx={{ ...basePageStyle }}>
        <Header />
        <Box sx={{ display: 'flex', justifyContent: 'center', minHeight: 'calc(100vh - 120px)' }}>
          <SideMenu />
          <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%' }}>
            <Box sx={{ p: { xs: 2, md: 3 } }}>
              {loading ? (
                <Box
                  sx={{
                    position: 'absolute',
                    width: '100%',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    zIndex: 1,
                  }}
                >
                  <NowLoading />
                </Box>
              ) : (
                <>
                  {/* ページヘッダー */}
                  <Box
                    sx={{
                      mb: 4,
                      p: 3,
                      background: 'rgba(255, 255, 255, 0.7)',
                      backdropFilter: 'blur(20px)',
                      borderRadius: '16px',
                      border: '1px solid rgba(139, 92, 246, 0.2)',
                    }}
                  >
                    <Typography
                      variant="h4"
                      fontWeight="bold"
                      sx={{ fontSize: 'calc(var(--text-xl) + 1px)' }}
                    >
                      ダッシュボード
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
                      契約書管理システムへようこそ
                    </Typography>
                  </Box>

                  {/* 統計カード */}
                  <Grid container spacing={3} sx={{ mb: 4 }}>
                    <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                      <StatCard
                        title="契約書総数"
                        value={documentCounts.total}
                        icon={<Description />}
                        color="primary"
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                      <StatCard
                        title="承認フロー開始前"
                        value={documentCounts.beforeFlow}
                        icon={<PlayCircle />}
                        color="secondary"
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                      <StatCard
                        title="社内承認中"
                        value={documentCounts.internalFlow}
                        icon={<Pending />}
                        color="warning"
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                      <StatCard
                        title="相手方承認中"
                        value={documentCounts.customerFlow}
                        icon={<Pending />}
                        color="success"
                      />
                    </Grid>
                  </Grid>

                  {/* クイックアクション */}
                  <Box sx={{ mb: 4 }}>
                    <QuickActions onNavigate={navigate} />
                  </Box>

                  {/* お知らせ */}
                  <Box sx={{ mb: 4 }}>
                    <NoticeSection />
                  </Box>

                  {/* AIアシスタントカード */}
                  <Paper
                    className="card-3d gradient-card-rainbow"
                    sx={{
                      p: 3,
                      cursor: 'pointer',
                    }}
                    onClick={() => setChatOpen(true)}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
                        <Box
                          sx={{
                            width: 64,
                            height: 64,
                            borderRadius: 3,
                            bgcolor: 'rgba(255,255,255,0.2)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <AutoAwesome sx={{ color: 'white', fontSize: 32 }} />
                        </Box>
                        <Box>
                          <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
                            AIアシスタント
                          </Typography>
                          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                            契約書に関する質問にお答えします
                          </Typography>
                        </Box>
                      </Box>
                      <Button variant="outlined" sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.5)' }}>
                        チャットを開く
                      </Button>
                    </Box>
                  </Paper>
                </>
              )}
            </Box>
          </Box>
        </Box>
      </Box>
      <Footer />

      {/* チャットFAB */}
      <Fab
        className="gradient-card-rainbow bounce-button"
        onClick={() => setChatOpen(true)}
        sx={{ position: 'fixed', bottom: 24, right: 24, color: 'white', boxShadow: 4 }}
        aria-label="チャットを開く"
      >
        <ChatIcon />
      </Fab>

      {/* チャットパネル */}
      <ModernChatPanel
        isOpen={chatOpen}
        onClose={() => setChatOpen(false)}
        messages={messages}
        input={input}
        setInput={setInput}
        onSend={handleSendMessage}
        loading={loading}
        selectedModel={selectedModel}
        onModelChange={handleModelChange}
        modelOptions={modelOptions}
      />
    </>
  );
};

export default ModernHomePage;
