# 活地圖：命運地層 — The Living Atlas: Strata of Fate

Languages: 繁體中文 | [简体中文](README.zh-CN.md) | [English](README.en.md) | [日本語](README.ja.md)

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
