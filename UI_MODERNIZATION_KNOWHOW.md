# UI最新化 ノウハウ・ガイド

生成AIアシストでUI最新化を行う際の参考情報をまとめたドキュメント。

## 目次

1. [必須ツール](#必須ツール)
2. [プロンプト例](#プロンプト例)
3. [作業アプローチ](#作業アプローチ)
4. [セッション管理](#セッション管理)
5. [トラブルシューティング](#トラブルシューティング)
6. [コード規約](#コード規約)

---

## 必須ツール

### MCP Serena

**必須**。コードベースの効率的な探索・編集に不可欠。

```bash
# セットアップ
claude mcp add serena -- $HOME/.local/bin/uvx \
  --from git+https://github.com/oraios/serena \
  serena start-mcp-server --context ide-assistant --project $(pwd)
```

**主な利用シーン:**
- シンボル検索（`find_symbol`）
- 参照検索（`find_referencing_symbols`）
- シンボル単位の編集（`replace_symbol_body`）
- メモリによるセッション状態保存

### ultrathink モード

複雑な判断・分析が必要な場面で推奨。

```bash
claude --ultrathink "プロンプト"
```

**推奨場面:**
- デザイン相違点の分析
- 実装アプローチの検討
- 問題の根本原因調査

---

## プロンプト例

### 調査・分析系

```
# デザイン比較
ultrathink Sample HTML と比較して、現状の design の相違点を pickup して。
さらに、それに対応するための更新手間を見積もって。

# ファイル検索
"利用マニュアル" を click したときに表示される file name と path は?
```

### デザイン検討系

```
# 新デザイン検討
ultrathink, UI modernization に関して、別のデザインを検討したい。
"もう少し華やか？派手？先進的な感じがする？" デザインに更新できるか?
検討方針を次に示す。
- デザイン: 華やか派手、先進的では
- 実装方針: 確実に実装できる方向で、
- 多少 ultrathink で、あるいは検討時間がかかってもかまわない。

# 色の調整
背景色について、提案して。
青色背景の "ダッシュボード", 青色系背景の "お知らせ"は、"契約書総数" の icon の
青色と被る、あるいは似ている。最初の二つの背景色を変更したい。

# アイコン統一
次の menu title に関する icon が完全に一致していないので、統一して(dash board 側に合わせて)。
side bar: dash board
登録: 契約書を登録・カード
承認フロー開始前: 承認フロー開始前・カード
```

### 修正依頼系

```
# フッター修正
footer で、
～"利用マニュアル"  "個人情報の扱い"  "サービス利用規約"
となるべきところ、
～"利用マニュアル"  "個人情報の扱い"  "サービス利"
で切れている。fix して

# レイアウト修正
footer の layout を次のように更新して。
現状:
"利用マニュアル"  "個人情報の扱い"  "サービス利用規約" ～ "copyright notice"
更新:
"copyright notice"～ "利用マニュアル"  "個人情報の扱い"  "サービス利用規約"

# 固定表示
予定の作業に入る前に、次の更新を進めて。
利用マニュアル、個人情報の扱い、サービス利用規約 の foot note は、
本体表示ページが長いと本体とともにの流れてしまう。
流れないように、footnote として固定して。
```

### 視認性改善系

```
# ステータス表示改善
次の page の status 表示が、青背景、白抜き" が、視認性が悪い。改善して。
http://localhost:3000/documentManagement/internalDocument/checkFileDetails

# 色の被り解消
"社内承認完了" の status もわかりにくい。
背景が緑で、文字も緑? 改善して。

# フォントサイズ調整
ステータス内の文字の バランスを適切なものに調整して。次の表に具体的な内容を示す。
fontsize, status 内の test font size
"小さい", 通常の text の font size より小さいので、同じ size にして。
"標準", 通常の text の font size より、さらに小さいので、同じ size にして。
```

### バージョン管理系

```
# サブバージョン設定
次のような sub version id を付与したい。このアプリについて、で
次の id も表示するようにして。何この id の変更は、わかりやすい path, module name
に配置しておいて。
dmdn-06/sign_cli-develop_v9-v2

# 著作権年更新
"このアプリについて" の copyright が 2025 だけになっているので、
2026 も追加して。
```

### 問題調査系

```
# バグ調査
この問題は、original source の bug? あるいは modern UI の
際に混入した問題?

# エラー調査
ultrathink 次の buttom click で abort している。expected fail か?
a. "アカウント設定" のあと "終了" click

# 無限ループ調査
login 手順をスキップした修正が、 side effect を発生させている。
起動した後直ぐの、dash board 画面で、redraw が頻繁に発生している。
ultrathink この動作を確認して、修正して。
```

### 変更取り消し系

```
# 直近の変更取り消し
ultrathink 期待と異なるところが、update された模様、
直近の 変更を cancel して。
```

---

## 作業アプローチ

### レイヤー別一括更新（推奨）

大規模なUI変更時は、レイヤー単位で段階的に適用。

| レイヤー | 対象 | 確認ポイント |
|---------|------|--------------|
| Layer 1 | 背景（mesh-bg等） | 全ページの背景統一 |
| Layer 2 | レイアウト枠（Header/Sidebar/Footer） | ナビゲーション全体 |
| Layer 3 | カード効果（card-3d等） | 3D効果・ホバー |
| Layer 4 | グラデーション（gradient-card-*） | 色のSample HTML一致 |
| Layer 5 | アニメーション（float-3d/shimmer等） | 滑らかさ |

**メリット:**
- 段階途中でのデザイン確認が可能
- 手戻りリスク最小化
- 問題箇所の特定が容易

### ラップ方式

既存コンポーネントのロジックを維持し、ModernPageLayoutでラップ。

```tsx
// Before
<>
  <Header />
  <SideMenu />
  <main>{content}</main>
  <Footer />
</>

// After
<ModernPageLayout>
  {content}
</ModernPageLayout>
```

### Sample HTML との比較確認

```bash
# Sample HTML をローカルで開いて横に並べる
open ui-samples/08_design_C_with_textsize.html

# React アプリを起動
npm start

# 2画面で見比べながら確認
```

---

## セッション管理

### MCP Serena メモリによる状態保存

セッション終了時に状態をdump。

```
# セッション終了時のプロンプト例
現在の context を mcp serena で dump して。
併せて、次回、再開するときの prompt を示して。
```

### 再開用プロンプトの構造

```markdown
前回のセッションを継続します。

read_memory で `[メモリ名]` を読み込んでください。

## 作業状況
[プロジェクト名]の[作業名]作業中です。

### 完了済み
- [完了項目1]
- [完了項目2]

### 残り作業
1. [残作業1]
2. [残作業2]

### 移行手法
[使用している手法の説明]
```

### メモリ命名規則

```
[作業内容]_session_[日付]_[補足]

例:
- modern_ui_migration_session_20260119_latest
- ui_colorful3d_session_20260115_3
- eslint_fix_session_20260120_completed
```

---

## トラブルシューティング

### よくある問題と対処

| 問題 | 原因 | 対処 |
|------|------|------|
| 背景が灰色のまま | CSS優先順位・継承問題 | `!important` または specificity 調整 |
| フッターが流れる | `position` 未設定 | `position: fixed` + `bottom: 0` |
| アイコン不一致 | コンポーネント間で別アイコン使用 | 共通化 or 統一 |
| 色の被り | グラデーション定義の重複 | designTokens.ts で一元管理 |
| フォントサイズ不整合 | sx と CSS 変数の混在 | CSS 変数に統一 |

### デバッグ用プロンプト

```
# 原因調査
ultrathink この問題の root cause を特定して。

# 影響範囲確認
以前次のような改善を行った。以前の改良点以外の、該当箇所がないか、確認して。

# 設定確認
灰色の背景色は、なにか失敗して default の灰色になった印象を受ける。
背景灰色の理由は?
```

---

## コード規約

### TypeScript/React

| 種別 | 規則 | 例 |
|------|------|-----|
| 定数 | UPPER_SNAKE_CASE | `POSTAL_CODE_LENGTH` |
| 関数 | camelCase | `getCurrentDate` |
| コンポーネント | PascalCase | `ModernHomePage` |
| ファイル名（コンポーネント） | PascalCase.tsx | `ModernHomePage.tsx` |

### Modern コンポーネント命名

```
Modern + [元のコンポーネント名]

例:
- HomePage → ModernHomePage
- SideMenu → ModernSideMenu
- PageLayout → ModernPageLayout
```

### スタイル管理

| ファイル | 役割 |
|---------|------|
| `designTokens.ts` | 色、サイズ、影などのデザイントークン |
| `theme.ts` | MUI テーマ設定 |
| `index.css` | グローバルCSS（mesh-bg, card-3d等） |

---

## 参考リソース

### メモリ一覧（sign_cli-develop_v9）

| メモリ名 | 内容 |
|---------|------|
| `project_overview` | プロジェクト概要 |
| `style_conventions` | スタイル規約 |
| `ui_layer_update_plan_20260115` | レイヤー別更新計画 |
| `ui_colorful3d_implementation_plan` | カラフル3D実装計画 |
| `ui_modernization_progress` | UI最新化進捗 |

### 関連ファイル

```
ref/
└── ChangeLog              # プロンプト例多数(生のprompt)
```

---

## 更新履歴

| 日付 | 内容 |
|------|------|
| 2026-01-27 | 初版作成 |
