# ファイル構成

このドキュメントでは、プロジェクトのディレクトリ構造とファイルの役割を説明します。

ChaneLog.md とREADME.md は、デザイン関係の repo. の追加を開始した段階で、追加している。

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
| `.gitignore` | Git管理対象外ファイル |
| `package.json` | npm依存関係とスクリプト定義 |
| `package-lock.json` | 依存関係のロックファイル |
| `tsconfig.json` | TypeScriptコンパイラ設定 |
| `default.conf` | Nginx設定ファイル |
| `README.md` | アプリケーション固有のドキュメント |

### 主要技術スタック

- **フレームワーク**: React 18 + TypeScript
- **UIライブラリ**: Material-UI (MUI) v5
- **状態管理**: Redux Toolkit
- **認証**: AWS Amplify (Cognito)
- **ルーティング**: React Router v6
- **スタイリング**: Emotion, Styled Components

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
│   ├── mail/            # メールテンプレート
│   ├── mocks/           # モックデータ（開発用）
│   ├── store/           # Redux store設定
│   ├── styles/          # グローバルスタイル
│   └── utils/           # ユーティリティ関数
└── types/                # TypeScript型定義
```

### 主要ディレクトリの役割

#### `src/components/`
UIコンポーネントを格納。Material-UIをベースにカスタマイズされたコンポーネント群。

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

---

> **Note**: 詳細な実装内容や変更履歴は [ChangeLog.md](./ChangeLog.md) を参照してください。
