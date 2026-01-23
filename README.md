# 処世術禄（genius-of-living）

## SEO 設定メモ

本リポジトリは静的サイト構成です。公開ドメインが確定したら、以下の **BASE_URL** を実際の URL に置き換えてください。

対象ファイル:

- `index.html`（canonical / OGP / 構造化データ）
- `robots.txt`
- `sitemap.xml`

### Google Search Console への登録手順（任意）

1. Google Search Console にログインします。
2. 「プロパティを追加」から公開ドメインを登録します。
3. 所有権の確認（推奨: DNS での確認）を行います。
4. 左メニュー「サイトマップ」で `https://<YOUR_DOMAIN>/sitemap.xml` を送信します。
5. 反映後、インデックス状況とカバレッジを確認します。
