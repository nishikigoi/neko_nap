# Neko Nap

ほかの猫の視線が気になって眠れない猫たちに、安心できる寝床を見つけるロジックパズルです。

現在は、ルールと操作感を検証するためのステージ1〜4を実装しています。詳しい仕様は [設計書](docs/Neko_Nap_Web_Prototype_Design_Spec.md) を参照してください。

## 必要環境

- Node.js 24
- npm

## 起動

```bash
npm ci
npm run dev
```

開発サーバーのURLをブラウザで開いてください。

## 検証

```bash
npm test
npm run validate-levels
npm run build
```

`npm test` は視線判定、ゲーム状態、ソルバー、全ステージの一意解を検証します。

## プレイテストデータ

進行状況とステージ別の計測値はブラウザの `localStorage` に保存されます。ステージ選択画面の「プレイテストデータを書き出す」から、個人情報を含まないJSONをダウンロードできます。
