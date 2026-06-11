# 活地圖：命運地層 — The Living Atlas: Strata of Fate

Languages: [繁體中文](#繁體中文) | [简体中文](#简体中文) | [English](#english) | [日本語](#日本語)

<details open>
<summary id="繁體中文">繁體中文</summary>

## 概要

3D procedural open-world exploration RPG 研究原型。  
世界不是被你探索的，而是根據你**如何**探索，長出新的命運。

## 快速開始

```powershell
npm install
npm run dev
```

開啟 `http://localhost:5180`。

本專案固定使用 port `5180`，`vite.config.js` 已設定 `strictPort`。`5173` 保留給另一個本機 PWA 專案，避免 service worker 快取互相干擾。

## 操作

| 輸入 | 動作 |
|---|---|
| WASD / 左搖桿 | 移動，Shift 疾跑 |
| 滑鼠移動 / 右半屏拖曳 | 視角控制 |
| 空白鍵 / 跳按鈕 | 跳躍；解鎖風息感知後空中按住可滑翔 |
| E / 掃描按鈕 | 掃描、互動、驗證推論、攀塔、交談 |
| F | 狩獵 / 協助 NPC |
| M | 活地圖 |
| 1–7 | 切換能力 |
| `` ` `` | 除錯主控台，輸入 `help` |

URL 參數 `?seed=任意字串` 可指定世界種子。

## 驗證

```powershell
npm test
node test/browser-check.mjs
npm run build
```

`node test/browser-check.mjs` 需要先啟動 dev server。

## 文件

- [docs/GDD.md](docs/GDD.md)
- [docs/CODEX_ASSET_BRIEF.md](docs/CODEX_ASSET_BRIEF.md)
- [docs/CODEX_ASSET_AUDIT.md](docs/CODEX_ASSET_AUDIT.md)
- [docs/ART_PIPELINE.md](docs/ART_PIPELINE.md)

## 設計原則

高留存來自好奇心、能力感、自主感、未完成謎題、世界回應與個人命運。  
全案不含 loot box、gacha、近失獎勵、每日登入懲罰、限時焦慮、能量系統或付費加速。

</details>

<details>
<summary id="简体中文">简体中文</summary>

## 概要

一个 3D 程序化开放世界探索 RPG 研究原型。  
世界并不是单纯被你探索，而是会根据你**如何**探索，生长出新的命运。

## 快速开始

```powershell
npm install
npm run dev
```

打开 `http://localhost:5180`。

本项目固定使用 port `5180`，`vite.config.js` 已启用 `strictPort`。`5173` 保留给另一个本地 PWA 项目，避免 service worker 缓存互相干扰。

## 操作

| 输入 | 动作 |
|---|---|
| WASD / 左摇杆 | 移动，Shift 冲刺 |
| 鼠标移动 / 右半屏拖拽 | 视角控制 |
| 空格 / 跳跃按钮 | 跳跃；解锁风息感知后空中按住可滑翔 |
| E / 扫描按钮 | 扫描、互动、验证推论、攀塔、交谈 |
| F | 狩猎 / 协助 NPC |
| M | 活地图 |
| 1–7 | 切换能力 |
| `` ` `` | 调试控制台，输入 `help` |

URL 参数 `?seed=任意字符串` 可指定世界种子。

## 验证

```powershell
npm test
node test/browser-check.mjs
npm run build
```

`node test/browser-check.mjs` 需要先启动 dev server。

## 文档

- [docs/GDD.md](docs/GDD.md)
- [docs/CODEX_ASSET_BRIEF.md](docs/CODEX_ASSET_BRIEF.md)
- [docs/CODEX_ASSET_AUDIT.md](docs/CODEX_ASSET_AUDIT.md)
- [docs/ART_PIPELINE.md](docs/ART_PIPELINE.md)

## 设计原则

高留存来自好奇心、能力感、自主感、未完成谜题、世界回应与个人命运。  
全项目不包含 loot box、gacha、近失奖励、每日登录惩罚、限时焦虑、能量系统或付费加速。

</details>

<details>
<summary id="english">English</summary>

## Overview

A 3D procedural open-world exploration RPG research prototype.  
The world is not merely explored by you; it grows new fate from **how** you explore.

## Quick Start

```powershell
npm install
npm run dev
```

Open `http://localhost:5180`.

This project uses port `5180` with `strictPort` enabled in `vite.config.js`. Port `5173` is reserved for another local PWA project to avoid service-worker cache conflicts.

## Controls

| Input | Action |
|---|---|
| WASD / left joystick | Move; hold Shift to sprint |
| Mouse movement / right-side drag | Camera control |
| Space / jump button | Jump; hold in midair to glide after Wind Sense is unlocked |
| E / scan button | Scan, interact, validate hypotheses, climb, talk |
| F | Hunt / help NPCs |
| M | Living Map |
| 1–7 | Toggle abilities |
| `` ` `` | Debug console; enter `help` |

Use `?seed=any-string` in the URL to choose a world seed.

## Validation

```powershell
npm test
node test/browser-check.mjs
npm run build
```

`node test/browser-check.mjs` requires the dev server to be running first.

## Documentation

- [docs/GDD.md](docs/GDD.md)
- [docs/CODEX_ASSET_BRIEF.md](docs/CODEX_ASSET_BRIEF.md)
- [docs/CODEX_ASSET_AUDIT.md](docs/CODEX_ASSET_AUDIT.md)
- [docs/ART_PIPELINE.md](docs/ART_PIPELINE.md)

## Design Principles

Retention comes from curiosity, competence, agency, unfinished mysteries, world response, and personal fate.  
The project does not use loot boxes, gacha, near-miss rewards, daily-login punishment, time-limited anxiety, energy systems, or paid acceleration.

</details>

<details>
<summary id="日本語">日本語</summary>

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

</details>
