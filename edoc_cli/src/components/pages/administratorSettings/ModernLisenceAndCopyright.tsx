/**
 * ModernLisenceAndCopyright - モダナイズされたライセンス情報画面
 *
 * アプリケーションのライセンス情報とコピーライト情報を表示
 */
import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Avatar,
  Link,
  Divider,
} from '@mui/material';
import {
  ExpandMore,
  Description,
  Code,
  Storage,
  OpenInNew,
} from '@mui/icons-material';
import ModernPageLayout, { ContentCard } from '../../templates/ModernPageLayout';
import { APP_VERSION, SUB_VERSION_ID, versionInfo } from '../../../config/version';

// ライセンス情報
const licenses = [
  {
    name: 'MUI (Material-UI)',
    description: 'The React component library for faster and easier web development.',
    license: 'MIT License',
    url: 'https://mui.com/',
    icon: <Code />,
  },
  {
    name: 'TypeScript',
    description: 'TypeScript is a typed superset of JavaScript that compiles to plain JavaScript.',
    license: 'Apache License 2.0',
    url: 'https://www.typescriptlang.org/',
    icon: <Code />,
  },
  {
    name: 'Hyperledger Fabric',
    description: 'Enterprise-grade permissioned distributed ledger framework.',
    license: 'Apache License 2.0',
    url: 'https://www.hyperledger.org/use/fabric',
    icon: <Storage />,
  },
  {
    name: 'React',
    description: 'A JavaScript library for building user interfaces.',
    license: 'MIT License',
    url: 'https://reactjs.org/',
    icon: <Code />,
  },
];

/**
 * ModernLisenceAndCopyright コンポーネント
 */
const ModernLisenceAndCopyright: React.FC = () => {
  const [expanded, setExpanded] = useState<string | false>(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleAccordionChange =
    (panel: string) => (_: React.SyntheticEvent, isExpanded: boolean) => {
      setExpanded(isExpanded ? panel : false);
    };

  return (
    <ModernPageLayout
      title="ライセンスと著作権情報"
      subtitle="アプリケーションの情報と使用しているライブラリのライセンス"
      breadcrumbs={[
        { label: '設定' },
        { label: 'ライセンス情報' },
      ]}
    >
      {/* アプリケーション情報 */}
      <ContentCard title="このアプリについて">
        <div className="flex flex-col items-center text-center py-6">
          <Avatar
            className="gradient-card-rainbow"
            sx={{ width: 80, height: 80, mb: 3, boxShadow: 3 }}
          >
            <Description sx={{ fontSize: 40 }} />
          </Avatar>
          <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>
            {versionInfo.appName}
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 0.5 }}>
            バージョン {APP_VERSION}
          </Typography>
          <Typography variant="caption" color="text.disabled" sx={{ mb: 3 }}>
            {SUB_VERSION_ID}
          </Typography>

          <Divider sx={{ width: '100%', my: 2 }} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-lg mt-2">
            <div className="p-4 bg-slate-50 rounded-xl">
              <p className="text-sm text-slate-500 mb-1">開発元</p>
              <p className="font-medium text-slate-800">{versionInfo.developer}</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl">
              <p className="text-sm text-slate-500 mb-1">お問い合わせ</p>
              <Link
                href="https://www.micros.co.jp/cgi-bin/ssl/micros/contact/index.cgi"
                target="_blank"
                rel="noopener noreferrer"
                sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
              >
                お問い合わせフォーム
                <OpenInNew sx={{ fontSize: 14 }} />
              </Link>
            </div>
          </div>

          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ mt: 4 }}
          >
            {versionInfo.copyright}
          </Typography>
        </div>
      </ContentCard>

      {/* ライセンス情報 */}
      <Box sx={{ mt: 3 }}>
        <ContentCard
          title="オープンソースライセンス"
          subtitle="このアプリケーションで使用しているライブラリ"
        >
          <div className="space-y-2">
            {licenses.map((lib, index) => (
              <Accordion
                key={index}
                expanded={expanded === `panel${index}`}
                onChange={handleAccordionChange(`panel${index}`)}
                sx={{
                  borderRadius: '12px !important',
                  '&:before': { display: 'none' },
                  boxShadow: 'none',
                  border: '1px solid',
                  borderColor: 'divider',
                  '&.Mui-expanded': {
                    margin: 0,
                    mb: 1,
                  },
                }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMore />}
                  sx={{
                    borderRadius: '12px',
                    '&.Mui-expanded': {
                      borderBottomLeftRadius: 0,
                      borderBottomRightRadius: 0,
                    },
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-slate-600">
                      {lib.icon}
                    </div>
                    <div>
                      <Typography sx={{ fontWeight: 500 }}>{lib.name}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {lib.license}
                      </Typography>
                    </div>
                  </div>
                </AccordionSummary>
                <AccordionDetails sx={{ bgcolor: 'grey.50' }}>
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    {lib.description}
                  </Typography>
                  <Link
                    href={lib.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
                  >
                    詳細を見る
                    <OpenInNew sx={{ fontSize: 14 }} />
                  </Link>
                </AccordionDetails>
              </Accordion>
            ))}
          </div>

          {/* MITライセンス全文 */}
          <Box sx={{ mt: 4 }}>
            <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
              MIT License（参考）
            </Typography>
            <Box
              sx={{
                p: 2,
                bgcolor: 'grey.100',
                borderRadius: '10px',
                fontSize: '0.75rem',
                fontFamily: 'monospace',
                color: 'text.secondary',
                maxHeight: 200,
                overflow: 'auto',
              }}
            >
              <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
{`The MIT License (MIT)

Copyright (c) [year] [copyright holders]

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.`}
              </pre>
            </Box>
          </Box>
        </ContentCard>
      </Box>
    </ModernPageLayout>
  );
};

export default ModernLisenceAndCopyright;
