# 活地図：運命地層 — The Living Atlas: Strata of Fate

Languages: [繁體中文](README.md) | [简体中文](README.zh-CN.md) | [English](README.en.md) | 日本語

## 概要

3D プロシージャル・オープンワールド探索 RPG の研究プロトタイプです。  
世界はただ探索されるものではなく、あなたが**どのように**探索したかによって、新しい運命を育てていきます。

## クイックスタート

```powershell
npm install
npm run dev
```

`http://localhost:5180` を開いてください。

このプロジェクトは port `5180` を固定で使い、`vite.config.js` で `strictPort` を有効にしています。`5173` は別のローカル PWA プロジェクト用に残し、service worker のキャッシュ干渉を避けます。

## 操作

| 入力 | アクション |
|---|---|
| WASD / 左スティック | 移動、Shift でダッシュ |
| マウス移動 / 画面右側ドラッグ | カメラ操作 |
| Space / ジャンプボタン | ジャンプ；風息感知を解放後、空中長押しでグライド |
| E / スキャンボタン | スキャン、インタラクト、推論検証、塔登り、会話 |
| F | 狩猟 / NPC 支援 |
| M | Living Map |
| 1–7 | アビリティ切り替え |
| `` ` `` | デバッグコンソール、`help` を入力 |

URL に `?seed=任意の文字列` を付けると、ワールドシードを指定できます。

## 検証

```powershell
npm test
node test/browser-check.mjs
npm run build
```

`node test/browser-check.mjs` は dev server を先に起動してから実行してください。

## ドキュメント

- [docs/GDD.md](docs/GDD.md)
- [docs/CODEX_ASSET_BRIEF.md](docs/CODEX_ASSET_BRIEF.md)
- [docs/CODEX_ASSET_AUDIT.md](docs/CODEX_ASSET_AUDIT.md)
- [docs/ART_PIPELINE.md](docs/ART_PIPELINE.md)

## デザイン原則

継続的な魅力は、好奇心、上達感、自律性、未解決の謎、世界の反応、そして個人の運命から生まれます。  
本プロジェクトには loot box、gacha、ニアミス報酬、毎日ログインの罰、時間制限による不安、エネルギー制、課金による加速は含まれません。
