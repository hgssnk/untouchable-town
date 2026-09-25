# 触れない街 (Untouchable Town)

結果は触れない。構造だけ触れる。

[遊ぶ](https://hgssnk.github.io/untouchable-town/page-town/)

## 総括

「触れない街」は、ある思想をそのまま遊べる形にしたもの。

## コンセプト

- 住民は動かせない。置けるのは1日1手だけ
- 必然的環境設計の4要素が、そのまま4つのシステムになっている
  - 起こることは必ず起こる → 止められない雨
  - 観察・ログ化 → 足あととログ
  - 小さな単位での差し替え → 1日1手
  - 無意識的フロー → 触らずに回る街がクリア条件
- 評価は結果ではなく、**100日試したときの確率**

## 遊び方

- 住民5人はそれぞれの家から出て、気ままに歩く。プレイヤーは住民を直接操作できない。
- 1日に1回だけ、盤面のマスに「道」「ベンチ」「灯り」を置くか、既存のものを「撤去」できる。
- 出会いは、誰かがベンチに座っているとき、または夜に灯りの下に一緒にいるときに発生する。1日に4組以上が出会えば、その日は目標達成。
- 雨の日は外出率が下がる。雨は止められない。
- クリア条件は、7日連続で何も触らず、そのうち4日以上で目標達成すること。「最高の一手は、何もしないこと」。

## 技術の軸

- シミュレーション核を純粋関数で守る。これが全ての出口の共通資産
- 描画・音・計算・包みは、その周りに差し替え可能なレイヤーとして積む
- Web標準で作る：環境構築が軽く、書いたコードがそのまま動き、どこへでも持っていける
- **共通化より移植性**：共通化して依存関係が生まれるくらいなら、個別に何度も書く。フォルダを1個コピーしても、それ単体で成立する

## 展開の道筋

- Webで公開 → itch.ioで反応を見る → 出口を選ぶ
- 出口は3つ、核は1つ
  - Web：試す・共有する
  - スマホ(Capacitor)：生活に置く。ハプティクスで「触れる」
  - Steam(Electron)：設計を極める。シナリオ・サンドボックス・ワークショップ

## 進め方について

- 作者はコードを書く人ではなく、コードを書く構造を設計する人
- 作る過程そのものが、このゲームのプレイになっている

## リポジトリ構成

役割ごとにファイルを分割している（ビルド不要、`<script>`タグの読み込み順に依存する素朴な構成。`file://`で直接開けるようES Modulesは使っていない）。

```
./
├── README.md              このファイル
└── src/
    ├── index.html         全てはここから始まる：ページ一覧だけの入口（どのページにも依存しない）
    └── page-town/         「触れない街」ページ。フォルダ単体で完結する（今のところ唯一のページ）
        ├── index.html         実際に開くファイル
        ├── model/             Model：ドメインロジック + 永続化（sim.js, state.js）
        ├── view.js            View：描画の起点
        ├── controller.js      Controller：入力をモデル更新に繋ぐ
        ├── buttons/           操作ごとに1パッケージ。挙動と描画レイヤーを同居させる
        └── index.js           ページの起点（即時実行）
```

ファイル名はMVCに倣った：`view.js`（旧`render.js`）が実際に描く層、`controller.js`（旧`view.js`）が入力をモデル更新に繋ぐ層——名前と役割の齟齬を直した形。

`page-town/`はフォルダ単体で完結し、`src/index.html`（ページ一覧）には依存しない。ページが増えたら`page-xxx/`が並列に並び、それぞれ自分の`index.html`を持つ想定。

### 全体構造

```mermaid
flowchart TD
    User((User)) --> Buttons[buttons/*]
    Buttons --> Controller[controller.js]
    Buttons --> Model[(model/)]
    Controller --> View[view.js]
    View --> Model
```

### 「1日すすめる」の流れ

一番複雑な操作なので、MVCの各層がどう絡むかを図にする。

```mermaid
sequenceDiagram
    actor User
    participant Button as buttons/advanceDay
    participant Model as model/sim.js
    participant View as view.js
    participant Store as model/state.js

    User->>Button: 「1日すすめる」クリック
    Button->>Model: simulateDay()
    Model-->>Button: res
    Button->>View: アニメーション描画
    Button->>Store: 結果を保存
```

## 使用技術

- 素のHTML/CSS/JavaScript。ビルドツールなし。
- フォントはGoogle Fonts（Zen Kaku Gothic New）をCDN経由で読み込み。
- ダークモード（`prefers-color-scheme`）に対応したCSS変数構成。`data-theme`属性による手動テーマ切り替えを想定したCSSはあるが、切り替えUI・JSからの属性設定は未実装。

## 起動方法

`src/index.html`（ページ一覧）または直接`src/page-town/index.html`をブラウザで開くだけでも動作する（ES Modulesを使っていないので`file://`でもOK）。

開発中は`live-server`を使うと、保存するたびにブラウザが自動でリロードされて楽（キャッシュの取り違えも起きない）。プロジェクトルートで起動するので、URLは`src/`を挟む。

```
npm install
npm run dev   # http://localhost:8000/src/ を自動で監視・リロード
```

## 次の1手

- まずは公開したプロトタイプを数日遊んで、違和感を1つ見つけること
- 直すのは、その1つだけ

## 既知の課題 / 今後

- `simulateDay`は純粋関数なのでユニットテストの良い対象だが、現状テストコードはない。テストを書く段になったらVitest導入とあわせてTypeScript化を検討する。
- `window.Sim` / `window.State` / `window.createRenderer` / `window.RenderLayers` / `window.createCtx` / `window.Buttons`は、ページ単位で名前空間分けされていないグローバル。今はページ（`page-town/`）が1つしかなく、かつ各ページが自分の`index.html`から自分のscriptしか読み込まないので衝突しない（ページを跨いでスクリプトが同じ`window`を共有することがない）。ページが増えても、ページごとに独立したHTMLドキュメントである限りこのままで問題ない想定。

### Vite / Reactは見送り（検討済み）

開発中に「動かない」という症状が何度か起きたが、原因はコードのバグではなく開発用ローカルサーバーの寿命・キャッシュの問題だった（`live-server`導入で解消済み）。これを機にVite（+React）化も検討したが、見送った。

- 今回の不具合の実害は`live-server`（保存時に自動リロード、常にキャッシュを再検証）だけで解消済み。Vite/Reactを入れる動機だった問題はすでに無い。
- ゲームの対話の核はcanvas + requestAnimationFrameループで、命令型のまま。Reactを足しても、canvas部分は結局`ref`+`useEffect`で今と同じ命令型コードになる。Reactの宣言的な強みが効くのは`view.js`の`renderUI`（DOM同期、十数行）程度で、費用対効果が薄い。
- 「技術の軸」に掲げたWeb標準・ビルド不要・どこへでも持っていける、という前提が崩れる（`npm run build`が常に必要になり、`file://`直開きの選択肢が失われる）。
- プロジェクト規模（全体で500行程度）は、Viteの主な利点（コード分割・tree-shaking・npm生態系の活用）が効いてくる規模ではない。

同じ検討を繰り返さないための記録として残す。前提が変わったら（例: 複数のゲームサンプルでUIを使い回したい、リッチな画面遷移が増えるなど）再検討する。
