# ディグ・シティ（仮）

レコードを掘って、仲間と出会う2Dアドベンチャー。

主人公を普通に操作して街を歩き回る。でも、人との出会いは操作できない。「触れない街」の思想を、ストーリーの中に埋め込んだゲーム。

## 世界観

地方都市の夜。中古屋、高架下、川沿いの公園、閉店間際の喫茶店。主人公は、在宅で働き、誰ともつながっていないビートメイカー。目的は、この街でクルーを作ること。

## 技術

- 描画：PixiJS、音：Tone.js、物語：Ink
- 核は純粋関数。「触れない街」のシミュレーションを引き継ぐ（[触れない街](../page-town/README.md)）
- ビルドなしの方針を保てるか（CDN読み込み、コンパイル済みInkのJSONをコミット）は要検討

## ページ構成

`page-town/`と同じ流儀（ビルド不要、`<script>`タグの読み込み順に依存、`file://`で開ける）。

```
page-dig-city/
├── README.md
├── scenario/        シナリオの原稿（章ごと）。model/ch1.js の元になる
├── index.html       画面の枠（ゲームボーイ）と読み込み順
├── model/           Model：ゲームの進行と規則
│   ├── ch1.js〜ch7.js 各章の中身（文・場面ごとの反応）。scenario/ の原稿の実装
│   ├── game.js        進行エンジン（モード・会話・場面転換・STARTの章えらび）。章の中身を知らない
│   ├── maps.js        街・店・部屋・高架下のマップ（章をまたいで共有）
│   ├── walk.js        歩く（1マス移動・衝突判定）
│   └── dig.js wipe.js repair.js arm.js chop.js band.js   小さな遊びごとのルール
├── layers/          描画レイヤー（city, objects, walk, dig, wipe, repair, arm, chop, band, cover, textbox）
├── sfx.js           音：Web Audioで作る効果音とドラム（外部ライブラリなし）
├── outro.js         最後の演出：ゲームボーイの外の、色のある絵（ドアの外、中古屋、レコードをめくる、最後の1枚）
├── assets/          画像（jdilla.jpg：最後の1枚）
├── view.js          View：シーンごとに、レイヤーを組み合わせて描く
├── controller.js    Controller：キー・ボタン入力をゲームに繋ぐ
└── index.js         ページの起点（ゲームループ）
```
