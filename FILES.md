# ファイル構成

このドキュメントでは、プロジェクトのディレクトリ構造とファイルの役割を説明します。

ChangeLog.md とREADME.md は、デザイン関係の repo. の追加を開始した段階で、追加している。

## ルートディレクトリ

```
sign_contract_design/
├── .dockerignore          # Dockerビルド時の除外ファイル指定
├── .gitignore             # Git管理対象外ファイルの指定
├── ChangeLog.md           # プロジェクトの変更履歴
├── Dockerfile             # Dockerコンテナのビルド設定
├── edoc-cli-task-def.json # AWS ECSタスク定義ファイル
├── FILES.md               # 本ファイル（プロジェクト構造の説明）
├── README.md              # プロジェクト概要
├── README-org.md          # オリジナルのREADME（参考用）
└── edoc_cli/              # Reactアプリケーション本体
```

## edoc_cli/ ディレクトリ

Reactベースの電子契約UIアプリケーション

### 設定ファイル

| ファイル | 説明 |
|---------|------|
| `.env` | 環境変数（ビルド設定） |
| `.eslintignore` | ESLint対象外ファイル |
| `.gitignore` | Git管理対象外ファイル |
| `package.json` | npm依存関係とスクリプト定義 |
| `package-lock.json` | 依存関係のロックファイル |
| `tsconfig.json` | TypeScriptコンパイラ設定 |
| `tailwind.config.js` | Tailwind CSS設定 |
| `postcss.config.js` | PostCSS設定（Tailwind用） |
| `default.conf` | Nginx設定ファイル |
| `README.md` | アプリケーション固有のドキュメント |

### 主要技術スタック

- **フレームワーク**: React 18 + TypeScript
- **UIライブラリ**: Material-UI (MUI) v6
- **CSSフレームワーク**: Tailwind CSS v3
- **状態管理**: Redux Toolkit
- **認証**: AWS Amplify (Cognito)
- **ルーティング**: React Router v6
- **スタイリング**: Emotion, Styled Components, Tailwind CSS

### ディレクトリ構造

```
edoc_cli/
├── .vscode/              # VSCode設定
├── public/               # 静的ファイル
│   ├── fonts/           # フォントファイル
│   └── manifest.json    # PWA設定
├── src/                  # ソースコード
│   ├── auth/            # 認証関連
│   ├── components/      # Reactコンポーネント
│   ├── config/          # アプリケーション設定
│   ├── contexts/        # Reactコンテキスト
│   ├── mail/            # メールテンプレート
│   ├── mocks/           # モックデータ（開発用）
│   ├── store/           # Redux store設定
│   ├── styles/          # グローバルスタイル・デザイントークン
│   └── utils/           # ユーティリティ関数
└── types/                # TypeScript型定義
```

### 主要ディレクトリの役割

#### `src/components/`
UIコンポーネントを格納。Material-UIをベースにカスタマイズされたコンポーネント群。

##### `src/components/common/`
Modern UI共通コンポーネント

| ファイル | 説明 |
|---------|------|
| `ModernDetailComponents.tsx` | 詳細画面用共通コンポーネント |
| `ModernDialog.tsx` | モダンスタイルダイアログ |
| `TextSizeSelector.tsx` | 文字サイズ選択コンポーネント |

##### `src/components/templates/`
ページレイアウト用テンプレートコンポーネント

| ファイル | 説明 |
|---------|------|
| `Header.tsx` | 従来版ヘッダー |
| `Footer.tsx` | 従来版フッター |
| `SideMenu.tsx` | 従来版サイドメニュー |
| `ModernHeader.tsx` | Modern UIヘッダー |
| `ModernFooter.tsx` | Modern UIフッター |
| `ModernSideMenu.tsx` | Modern UIサイドメニュー |
| `ModernPageLayout.tsx` | Modern UIページレイアウト |
| `ModernDetailPageLayout.tsx` | Modern UI詳細ページレイアウト |
| `ModernSideMenuForGenerativeAi.tsx` | 生成AI機能用サイドメニュー |
| `ModernPageLayoutForGenerativeAi.tsx` | 生成AI機能用ページレイアウト |

##### `src/components/pages/`
各機能のページコンポーネント（Modern版とレガシー版が混在）

| ディレクトリ | 説明 | Modern版 |
|-------------|------|----------|
| `administratorSettings/` | 管理者設定 | ○ |
| `beforeList/` | 承認前一覧 | ○ |
| `concludeList/` | 締結済一覧 | ○ |
| `customerList/` | 顧客承認一覧 | ○ |
| `internalList/` | 社内承認一覧 | ○ |
| `register/` | 契約登録 | ○ |
| `registerItCompany/` | 生成AI契約登録 | ○ |
| `common/` | 共通コンポーネント | - |

##### `src/components/guest/`
ゲストユーザー向けコンポーネント

| ファイル | 説明 |
|---------|------|
| `ModernGuestTopPage.tsx` | Modern UIゲストトップ |
| `ModernApproveDocumentPageForGuest.tsx` | Modern UI承認画面 |
| `ModernConcludeDocumentPageForGuest.tsx` | Modern UI締結画面 |
| `common/ModernGuestPageLayout.tsx` | ゲスト用Modern UIレイアウト |
| `common/ModernHeader.tsx` | ゲスト用Modern UIヘッダー |
| `common/ModernFooter.tsx` | ゲスト用Modern UIフッター |

##### `src/components/settings/`
設定関連コンポーネント

| ディレクトリ | 説明 | Modern版 |
|-------------|------|----------|
| `companyManagement/` | 自社管理 | ○ |
| `customerManagement/` | 顧客管理 | ○ |

#### `src/config/`
アプリケーション設定

| ファイル | 説明 |
|---------|------|
| `version.ts` | アプリケーションバージョン情報 |

#### `src/contexts/`
Reactコンテキスト

| ファイル | 説明 |
|---------|------|
| `TextSizeContext.tsx` | 文字サイズ設定コンテキスト（アクセシビリティ） |

#### `src/styles/`
グローバルスタイルとデザインシステム

| ファイル | 説明 |
|---------|------|
| `designTokens.ts` | デザイントークン（色、サイズ、影など） |
| `theme.ts` | MUI v6テーマ設定 |
| `baseStyles.ts` | 基本スタイル定義 |
| `dialogStyles.ts` | ダイアログ用スタイル |
| `fontStyles.ts` | フォント関連スタイル |
| `styles.ts` | 共通スタイル定義 |

#### `src/auth/`
AWS Cognito（Amplify）を使った認証機能の実装。

#### `src/mail/`
システムから送信されるHTMLメールのテンプレート（開発環境・本番環境用）。

#### `src/store/`
Redux Toolkitによる状態管理の設定とスライス。

#### `src/mocks/`
開発時のモックデータとMSW（Mock Service Worker）設定。

#### `src/utils/`
汎用的なヘルパー関数やユーティリティ。

## Modern UI コンポーネント一覧

### ページコンポーネント（37ファイル）

| カテゴリ | コンポーネント |
|---------|---------------|
| ホーム | `ModernHomePage` |
| 管理者設定 | `ModernAdministratorSettings`, `ModernLisenceAndCopyright`, `ModernOrganizationSettings`, `ModernUserAccountSettings` |
| 承認前 | `ModernBeforePage`, `ModernApproveFlowStartPage`, `ModernModifyHome` |
| 締結済 | `ModernConcludePage`, `ModernConcludeDocumentPage`, `ModernDiscardDocumentPage` |
| 顧客承認 | `ModernCustomerPage`, `ModernCustomerApprovePage`, `ModernCustomerRemandPage` |
| 社内承認 | `ModernInternalPage`, `ModernInternalApprovePage`, `ModernInternalCompletePage`, `ModernInternalRemandPage` |
| 契約登録 | `ModernRegisterHome`, `ModernRegisterTop` |
| 自社管理 | `ModernCompanyManagePage` |
| 顧客管理 | `ModernCustomerManagePage`, `ModernCompanyLocationManagePage` |
| ゲスト | `ModernGuestTopPage`, `ModernApproveDocumentPageForGuest`, `ModernConcludeDocumentPageForGuest` |

### 生成AI機能ページ（5画面）

| 画面 | ファイル | URL |
|------|---------|-----|
| トップ | `RegisterHomeIt.tsx` | `/generativeai/registerIt` |
| テンプレート選択 | `AgreementTemplate.tsx` | `/generativeai/registerIt/agreementTemplate` |
| 契約書確認 | `ReviewAgreement.tsx` | `/generativeai/registerIt/reviewAgreement` |
| 契約詳細 | `AgreementDetails.tsx` | `/generativeai/registerIt/agreementDetails` |
| 差分確認 | `DifferenceConfirmation.tsx` | `/generativeai/registerIt/differenceConfirmation` |

## Docker関連

- `Dockerfile`: Reactアプリケーションのビルドとnginxでの配信設定
- `.dockerignore`: Dockerイメージに含めないファイルを指定
- `edoc-cli-task-def.json`: AWS ECSでのデプロイ用タスク定義

## 開発時の主な操作

```bash
cd edoc_cli
npm install          # 依存関係のインストール
npm start            # 開発サーバー起動
npm run build        # プロダクションビルド
npm test             # テスト実行
```

## 変更履歴

### 2026-01-27: Modern UI移行
- MUI v5からv6へのアップグレード
- Tailwind CSS v3の導入
- Modern UIコンポーネント（65+ファイル）の追加
- 生成AI機能ページのModern UI対応

---

> **Note**: 詳細な実装内容や変更履歴は [ChangeLog.md](./ChangeLog.md) を参照してください。
