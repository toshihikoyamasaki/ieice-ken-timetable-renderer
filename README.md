# IEICE KEN Timetable Renderer

IEICE KEN の `HTML` / `HTML(simple)` / `TEXT` 表示を貼り付けると、日付・部屋・時刻ごとのタイムテーブルと、セッション別の論文リストに再レンダリングする静的Webツールです。

## 使い方

1. IEICE KEN の研究会プログラムページを開く
2. ページ上部の `[HTML(simple)]` または `[TEXT]` を開く
3. ページ全体をコピーする
4. このツールの貼り付け欄にペーストする
5. 「貼り付け内容をレンダリング」を押す

`HTML(simple)` を貼り付けた場合は、各論文の `/ken/paper/...` 形式の詳細ページリンクを検出できる場合があります。`TEXT` では通常リンク情報は含まれません。

## プライバシー

このツールは完全な静的HTMLとして動作し、貼り付けた内容を外部サーバーへ送信しません。処理はブラウザ内だけで完結します。

## 公開方法

### Cloudflare Pages Direct Upload

このフォルダの中身を Cloudflare Pages に Direct Upload してください。`index.html` が公開ルート直下に置かれる必要があります。

### GitHub Pages

このフォルダをGitHubリポジトリにアップロードし、Pagesを有効化してください。
