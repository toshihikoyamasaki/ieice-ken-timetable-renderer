# IEICE KEN Timetable Renderer

IEICE KEN の研究会プログラムを、日付 × 部屋 × 時刻のタイムテーブルとセッション別論文リストに再表示する静的Webアプリです。

## Features

- IEICE KEN のプログラムURLから取得してレンダリング
- HTML / HTML(simple) / TEXT の貼り付けレンダリングにも対応
- 複数部屋の並列開催を可視化
- セッションを hover すると発表一覧を表示
- セッションをクリックすると下部のセッション別論文リストへ移動
- `/ken/paper/...` 形式の論文詳細ページリンクを検出し、各論文から遷移可能

## Deploy to Cloudflare Pages

1. このフォルダをGitHubリポジトリにpushします。
2. Cloudflare Dashboardで **Workers & Pages → Create → Pages** を選びます。
3. GitHubリポジトリを接続します。
4. Build settingsは次の通りです。
   - Framework preset: `None`
   - Build command: 空欄
   - Build output directory: `/`
5. Deployします。

Cloudflare Pages Functions により、`/api/fetch-ieice?url=...` がIEICE KENページを取得します。

## Security note

`/api/fetch-ieice` はオープンプロキシ化を避けるため、以下の制限を入れています。

- `https://ken.ieice.org` のみ許可
- `/ken/program/` 以下のみ許可
- 取得サイズ上限 5MB
- タイムアウト 10秒

## Local test

Wranglerを使う場合:

```bash
npm install -g wrangler
wrangler pages dev .
```

その後、表示されたローカルURLを開きます。
