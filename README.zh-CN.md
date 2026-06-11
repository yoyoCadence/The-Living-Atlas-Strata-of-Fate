# 活地图：命运地层 — The Living Atlas: Strata of Fate

Languages: [繁體中文](README.md) | 简体中文 | [English](README.en.md) | [日本語](README.ja.md)

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
