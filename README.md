# ゲーム部屋

[プレイ](https://hgssnk.github.io/untouchable-town/)

| ページ | 内容 |
|---|---|
| [触れない街](src/page-town/README.md) | 結果は触れない。構造だけ触れる。住民は動かせず、1日1手だけ置ける街づくり。 |
| [ディグ・シティ](src/page-dig-city/README.md) | レコードを掘って、仲間と出会う2Dアドベンチャー。全7章 |

## リポジトリ構成

```
./
├── README.md          このファイル
└── src/
    ├── index.html     全てはここから
    ├── page-town/     「触れない街」
    └── page-dig-city/ 「ディグ・シティ」
```

ページが増えたら`page-xxx/`が並列に並ぶ。各ページは自分の`index.html`とREADMEを持ち、他ページに依存しない（共通化より移植性）。

## 起動方法

`src/index.html`（ページ一覧）または各ページの`index.html`をブラウザで開くだけで動作する。

開発中は`live-server`を使うと、保存するたびにブラウザが自動でリロードされて楽（キャッシュの取り違えも起きない）。プロジェクトルートで起動するので、URLは`src/`を挟む。

```
npm install
npm run dev   # http://localhost:8000/src/ を自動で監視・リロード
```
