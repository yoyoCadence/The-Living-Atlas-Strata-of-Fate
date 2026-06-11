# CODEX ASSET BRIEF — 《活地圖：命運地層》視覺升級契約
版本 1.0 ｜ 角色：Technical Art Director + Game Asset Planner
目標風格：原創日系奇幻動畫風（cel-shaded / painterly-readable）。本文件不引用任何具體 IP、工作室、角色或作品名。

執行者注意：本文件是**契約**。所有數值（hex、三角面數、貼圖尺寸、scale、pivot）都是驗收標準，不是建議。禁止更動 `src/world/`、`src/systems/`、`src/data/`（除新增 `assetManifest.json`）的遊戲邏輯。`npm test`（37 斷言）與 `npm run build` 在每個階段結束時必須通過。


------
IMPORTANT OVERRIDE BEFORE READING CODEX_ASSET_BRIEF.md

The attached CODEX_ASSET_BRIEF.md is the main asset contract, but the following overrides take priority.

1. Device target correction

Do NOT use low-end mobile as the artistic baseline.

The primary target device is iPhone 17 Pro Max-class high-end mobile hardware running iOS Safari / PWA / Three.js / WebGL.

High profile is the default artistic target:
- target stable 60 FPS during normal exploration
- temporary heavy-VFX dips should stay above 45 FPS
- render pixel ratio should be dynamic, default around 1.75, max 2.25
- visible triangles normal exploration target under 150k
- visible triangles peak landmark area hard cap 250k
- draw calls normal exploration target under 120
- draw calls peak hard cap 180

Medium and low profiles are runtime fallback only.
Do not design all assets around 4× CPU throttle or old-phone constraints.

The 4× CPU throttle / 30 FPS test in the brief should be treated as fallback compatibility testing, not as the high-profile design target.

2. Asset generation correction

Do not assume high-quality GLB files already exist.
Do not block the task waiting for GLB files.

For this implementation pass, prefer:
- procedural Three.js mesh factories
- CanvasTexture
- SVG icons
- lightweight shader/VFX modules
- manifest-driven fallback architecture

Use the GLB paths in CODEX_ASSET_BRIEF.md as future external asset slots.
If no GLB exists, create a procedural asset that matches the Asset Card as closely as possible, and mark sourceType as "proceduralMesh".

3. Scope correction

First pass must prioritize:
- P0 visual system foundation
- P1 high-impact assets
- player_cartographer procedural version
- skyspire / ancient_gate / observatory / lumen_tree / village_hut / float_island procedural versions
- scannable objects
- map icons and ability icons
- quality profile system
- artDebug mode

Do not attempt to fully complete all GLB animated creatures before the visual system exists.

4. Validation correction

Keep npm test and npm run build as hard requirements.

Treat highly subjective or screenshot-metric art requirements as visual acceptance targets, not blockers, unless they can be checked through simple deterministic code.

5. Typo cleanup

In CODEX_ASSET_BRIEF.md, remove the stray Cyrillic word "середина" from the skyspire visual description.



-----

---

## 1. Current Visual Diagnosis（依據 test/shots/*.png 與 src/render/scene.js）

逐項具體問題，含程式根因：

| # | 問題 | 證據（截圖/程式） | 根因 |
|---|---|---|---|
| D1 | 全場景無輪廓線，物件邊緣靠色差分離，遠處樹冠互相融成色塊 | 02-world.png 上緣樹林 | 所有材質為 `MeshLambertMaterial`，無 outline pass / inverted hull（scene.js 全檔） |
| D2 | 光照是連續漸層，不是賽璐璐分階。樹冠出現平滑明暗過渡，與動畫風的 2–3 階硬切相反 | 02-world.png 樹冠左下漸層 | Lambert 連續 NdotL；未用 `MeshToonMaterial` + gradientMap |
| D3 | 玩家角色是「圓柱+球+圓錐」三件組，比例約 2.5 頭身且無臉、無四肢、無剪影特徵；在第三人稱永遠置中卻是全畫面最粗糙的物件 | 02-world.png 中央 | controller.js 47–58 行的 primitive 組合 |
| D4 | 地形是單張 156 段 vertex-color 平面：無材質紋理、無草叢/碎石/路徑 decal，平原大面積是純色 → 畫面密度極低 | 02-world.png 下半 60% 畫面只有兩個色面 | scene.js `buildTerrain()` 僅 vertex color；無 detail layer、無 scatter |
| D5 | 樹 = 5 段圓柱 + 0 細分 icosahedron，全森林同一顆網格旋轉縮放；剪影是「球插棍」，與「發光森林」的奇幻設定無連結（白天看不出任何發光生態特徵） | 02-world.png | scene.js `buildVegetation()` 單一 trunkGeo/canopyGeo |
| D6 | 地標辨識度只靠「高」：塔=兩節圓柱、門=三個 Box、天文台=半球。300m 外剪影可讀，但 30m 內無任何敘事細節（窗、刻紋、破損、藤蔓），「靠近獎勵」不存在 | scene.js `buildLandmarks()` 各 case | 每地標 ≤4 個 primitive |
| D7 | 可掃描物 14 類共用同一顆 `OctahedronGeometry(0.9)`，僅靠 hex 換色；色盲或夜間場景下類別不可分；「掃描前後」只差透明度 | scene.js `addScannableMesh()` | 單一幾何 + opacity 切換 |
| D8 | 動物全部是縮放過的球（apex 只是 3 倍大的球），獵殺/掃描的對象沒有生物剪影 → 行為失去重量 | scene.js `buildCreatures()` | SphereGeometry + scale |
| D9 | 異常 VFX 是靜態半透明幾何（霧=壓扁球、寂靜谷=BackSide 球、記憶風暴=torus 自轉），無粒子、無 shader 動畫，「可觀察規律」在視覺上不存在（浮島升降除外） | scene.js `buildAnomalies()` | 無 VFX 系統 |
| D10 | UI 與場景風格斷裂：HUD 是「深色科技面板 + 青色強調」（slate #181a22 / teal #7fd4c1），場景是淡彩奇幻；地圖 icon 是字型字元（▲∏◗✦◯◈⌂𖤐），縮放後鋸齒且風格不一 | 02-world.png HUD、03-map.png | index.html CSS、livingMap.js `ctx.fillText(icon)` |
| D11 | 能力列以純文字呈現（「1 ？？？」），無圖示語言 | 02-world.png 底部 | hud.js `renderAbilities()` 純 textContent |
| D12 | 無陰影（shadow map 未開）、無 AO、無 rim light；角色與地面接觸關係靠色差猜測 | 02-world.png 玩家腳下 | renderer 未啟用 shadowMap；材質無 fresnel |
| D13 | 天空是純色 `scene.background = Color`，無雲、無漸層、無日月體；晝夜變化只有顏色插值 | scene.js constructor + `update()` | 無 skydome |

結論：問題不在「多邊形太少」，在於**缺一整層視覺系統**（toon 材質 + 輪廓 + 分階光 + 風格化天空 + scatter 密度 + 圖示語言）。先建系統（P0），再換資產（P1+），順序顛倒會白做工。

---

## 2. Art Bible — 原創日系奇幻動畫風

### 2.1 整體定位
可量測定義（全部可由程式或檢圖驗證）：
- 光影：cel 3 階硬切（地形 4 階），無連續漸層（直方圖上明暗交界 ≤ 2px 過渡帶）。
- 輪廓：INK 色 inverted hull，粗細依 §2.4 公式。
- 色彩：基底色飽和度 ≤ 55%；emissive 簽名色飽和度 ≥ 70%；取色僅限 §2.2 token 表。
- 造型：所有硬轉角 ≥ 8° 倒角或弧線；禁用未倒角 Box 直角外露。
- 貼圖：手繪平塗 + 10–15% 單色噪點層；禁照片、禁 PBR 金屬。
- 效能：手機（4× CPU throttle）30fps、同屏 ≤ 250k tris、≤ 120 draw calls。

### 2.2 色彩規則（全域 token，所有素材取色必須來自此表）
```
INK（輪廓/描線）      #1d1b2e
PAPER（UI 底）        #f3ead6   UI-INK #3a3328
KEYLIGHT（日光）      #fff1d8
SKY-DAY               #aebfdc → 地平線 #e8d9c0（雙色漸層）
SKY-NIGHT             #1b2240 → 地平線 #3a4470
魔法強調色（emissive 簽名，每類唯一）：
  生態光   #45e8c0   文明/符文 #b48aef   水文 #6fc3f0
  記憶     #f08ab8   星象      #ffe9a8   異常 #c49ae8
  警示/矛盾 #d99a3d   稱號金    #ffd98a
Biome 三階 ramp（shadow / mid / light）：
  plains          #5d7340 / #7a8f54 / #a9bd72
  glow-forest     #1d4a40 / #2e6e5e / #4da890
  river-valley    #46663f / #5f8468 / #8aac84
  floating-mounts #5a5570 / #7e7a90 / #a7a3bd
  magnet-desert   #9a7d4d / #c2a36b / #e8cf96
```
規則：①基底色飽和度 ≤ 55%、明度 35–80%；②emissive 簽名色飽和度 ≥ 70% 且**一個物件只允許一個簽名色**；③陰影色相一律往藍紫偏移 12–20°（不是降明度）。

### 2.3 Cel-shading 規則
- 材質基準：`THREE.MeshToonMaterial` + 8×1 px gradientMap（NearestFilter）。
- 分階：3 階。亮部 ≥ 60% 區間、中間調 25%、暗部 15%；硬邊（無平滑帶）。
- Rim light：主角/生物/地標材質加 fresnel 邊光（shader onBeforeCompile 注入），顏色 = KEYLIGHT，強度 0.25，夜間 0.45。
- 地形：同樣 toon 化，但 4 階（多一階給遠景空氣感）。
- 陰影：開 `renderer.shadowMap`（PCFSoft, 1024 map）；只有 sun 投影、只有角色/生物/地標 cast，地形 receive。手機檢測（`maxTextureSize < 8192` 或 touch）時降為 blob shadow（貼地圓形 decal，半徑=物件半徑×1.2，透明度 0.3）。

### 2.4 Outline 規則
- 方式：inverted hull（複製 mesh、`BackSide`、沿法線外推）。不用 postprocess（手機頻寬）。
- 粗細：角色/生物 0.025 × 模型高度；地標 0.012 × 高度；可掃描物 0.04 × 高度（最粗，因為是 gameplay 焦點）。
- 顏色：INK `#1d1b2e`；可掃描物未掃描時 outline 改用其簽名色並以 sin(t×2) 在 60–100% 透明度間呼吸。
- 不加 outline：地形、水面、instanced 草、粒子、天空。
- 實作介面：`addOutline(mesh, {width, color})`（見 §6 toonMaterials.js）。

### 2.5 角色比例
- 玩家與 NPC：**5 頭身**。頭寬:肩寬 = 1:1.6。手掌簡化為連指手套形（無分指）。眼睛以貼圖繪製：橫橢圓、上緣平直、佔臉寬 22%、瞳色跟隨角色職能色。
- 鼻子省略或 1px 陰影點；嘴 1 條短線。
- 服裝剪影外擴：披風/外套下擺離身體 ≥ 15% 體寬，確保走路時有可讀擺動形狀。
- 生物：頭身比自由，但剪影必須通過「16×16 px 縮圖測試」（縮到 16px 仍能與其他生物區分）。

### 2.6 地標設計語言
每座地標 = **獨特剪影 + 唯一簽名色 + 一個 ≤1 transform 的 idle 動態**：
- 剪影規則：300m 外（畫面高 ≤ 60px 時）輪廓不得與其他地標混淆；以「幾何母題」區分——塔=垂直楔形、門=ㄇ負空間、天文台=斜切球、巨樹=傘形、環石=鋸齒環、水脈節點=方+環、浮島=倒錐。
- 文明刻紋統一語法：使用 `civilization.js glyphSyntax.charset`（◇〤彡⊃∴卄）的筆畫風格——直線+45°折角+小圓點終止，刻紋深度以貼圖 normal-free 雙色（基底色 -15% 明度）表現，不用 normal map。
- 破損規則：古文明物破損面一律是「斜 30° 剪切面 + 1–2 塊散落碎件」，不做碎裂噪聲。

### 2.7 生物設計語言
- 母題：「苔×絨×角」。草食=圓潤+垂耳；發光種=身體暗色+生物光斑（emissive 簽名色 #45e8c0，斑點直徑 4–8% 體長）；頂級掠食=肩高前傾梯形剪影；追蹤者=反剪影（消光黑 #14101a + 只有眼睛 #d99a3d 發光）。
- 動作至少 2 個 state：idle（呼吸 scale y ±2%，週期 2.4s）、move（程式位移 + 身體前傾 8°）。死亡=0.4s 縮放至 0 + 8 粒花瓣粒子（不做屍體、不做血，配合全年齡調性）。

### 2.8 異常 / VFX 設計語言
- 原則：**規律可視化**。每個異常的 `pattern` 欄位必須有對應的可觀察視覺週期（粒子流向、明滅週期、旋轉速度）。
- 統一技法：加法混合平面粒子（每系統 ≤ 40 sprite）、UV 卷動帶狀 mesh、頂點 sin 位移。禁止 GPU 粒子庫、禁止 post bloom（用「亮色芯+半透明暈圈雙層 sprite」假 bloom）。
- 粒子貼圖共用一張 256×256 atlas（4×4 格：圓暈、菱光、花瓣、符文片、水滴、霧團、星點、漣漪…）。

### 2.9 UI / Map icon 設計語言
- 基調換成「測繪者手帳」：PAPER 底 + UI-INK 線 + 2px 圓角描邊；保留現有 DOM 結構與 class，僅改 CSS token 與圖示。
- 圖示規格：SVG、24×24 viewBox、stroke 2px、`stroke=currentColor`、圓端點、無漸層無濾鏡；填色只允許 PAPER/INK/簽名色三選一。
- 地圖 icon：同上規格但 16×16 使用尺寸，以 `drawImage`（預先 rasterize 至 offscreen canvas）取代 `fillText` 字元。
- 禁止事項（全章節適用）：不得參考或寫入任何既有 IP、工作室、作品、角色名稱；不得使用照片素材；不得使用寫實 PBR 貼圖（metalness 一律 0）。

---

## 3. Asset Inventory From Current Code（src/render/scene.js + controller.js 全掃描）

replacement_type 圖例：GLB=3D 模型、TEX=貼圖、SVG=向量圖示、VFX=程式特效模組、SHADER=材質系統、KEEP=保留程式生成。

| asset_id | current_code_location | current_primitive | gameplay_role | replacement_type | recommended_format | world_scale | priority | notes |
|---|---|---|---|---|---|---|---|---|
| terrain_system | scene.js buildTerrain/paintTerrain | PlaneGeometry 156² + vertexColor + Lambert | 行走基底/biome 辨識 | SHADER+TEX | toon 4 階 + 細節噪聲 TEX 512 | 600×600 | P0 | 幾何保留，只換材質層 |
| sky_system | scene.js constructor+update | 純色 background + Fog | 晝夜狀態可視化/霧色來源 | SHADER | 漸層 skydome shader | r=800 | P0 | 雙色漸層+日月 sprite+星點 |
| player_cartographer | controller.js mesh 組合 | Cylinder+Sphere+Cone | 玩家化身 | GLB | glb+TEX512 | 高 1.7 | P1 | 詳見 Asset Card |
| npc_villager ×2 | scene.js buildCreatures roleColor | Cylinder+Sphere | 對話/傳聞來源 | GLB | glb+TEX256 | 高 1.6 | P2 | 村民/商人共骨架換色 |
| npc_scholar | 同上 | 同上 | 對話/傳聞 | GLB | glb+TEX256 | 高 1.6 | P2 | |
| npc_hunter | 同上 | 同上 | 對話/傳聞 | GLB | glb+TEX256 | 高 1.7 | P2 | |
| grazer | scene.js buildCreatures | Sphere scale(1.4,1,1) | 掃描/狩獵對象 | GLB | glb+TEX256 | 肩高 0.9 | P2 | |
| lumen_deer | 同上 | Sphere | 掃描/狩獵/生態線索 | GLB | glb+TEX256 | 肩高 1.1 | P2 | emissive 光斑 |
| apex_beast | 同上 | Sphere ×3 scale | 稀有狩獵/生態樞紐 | GLB | glb+TEX512 | 肩高 3.2 | P2 | |
| stalker | scene.js onWorldChange stalker-spawn | Sphere | 矛盾後果實體 | GLB | glb+TEX256 | 肩高 1.4 | P2 | 反剪影規則 |
| tree_lumen ×240 | scene.js buildVegetation | InstancedMesh Cyl+Icosa | 森林 biome 主體 | GLB | glb（共用 1 網格 3 變體） | 高 6–12 | P1 | 必須維持 InstancedMesh |
| rock_mount ×80 | 同上 | InstancedMesh Cone | 山區填充 | GLB | glb 2 變體 | 高 2–18 | P3 | |
| ground_scatter | （不存在） | — | 平原/河谷密度 | GLB+KEEP | 草叢/野花 instanced | 高 0.3–0.6 | P1 | 新增；D4 的解 |
| skyspire | scene.js buildLandmarks case tower | Cyl+Cyl+Sphere | 首要導引地標/攀爬 | GLB | glb+TEX1024 | 高 29 | P1 | |
| watchtower_n | 同 case tower | 同上 | 稱號權重生成地標 | GLB | 共用 skyspire 減配版 | 高 18 | P3 | |
| ancient_gate | case gate | Box×3+Plane | 推論目標/文明敘事 | GLB | glb+TEX512 | 高 15 | P1 | gateGlow 平面→符文亮起 VFX |
| observatory | case observatory | Cyl+半Sphere | 推論/矛盾地標 | GLB | glb+TEX512 | 高 11 | P1 | |
| lumen_tree | case tree | Cyl+Icosa×3 | 森林區域視覺錨點/推論目標 | GLB | glb+TEX512 | 高 26 | P1 | |
| stone_circle | case circle | Box×8 | 推論起點/星路端點 | GLB | glb+TEX256 | r=8 | P2 | |
| water_node | case node | Box+Torus+Cone | 修復互動/世界回應 | GLB+VFX | glb+TEX256 | 高 3.5 | P1 | nodeJet 圓錐→水柱粒子 |
| hollow_site | case hollow | Circle decal | 隱藏推論目標 | TEX+VFX | decal TEX256 | r=6 | P3 | |
| village_hut ×4+1 | case village + prosperityHut | Box+Cone | 聚落/繁榮回應 | GLB | glb 2 變體+TEX512 | 高 6 | P1 | 繁榮屋=變體B |
| float_island | buildAnomalies float-island | Cone(倒)+Cyl | 異常/推論目標 | GLB | glb+TEX512 | r=14 | P1 | 保留程式升降 |
| machine_base | 同上 | Cyl | 浮島互動點 | GLB | 併入 float_island.glb | 高 2 | P2 | |
| fog_zone | buildAnomalies fog-zone | 壓扁 Sphere | 異常區域 | VFX | 程式霧粒子 | r=30–55 | P2 | |
| silent_vale | buildAnomalies silent-zone | BackSide Sphere | 異常區域 | VFX | 邊界環+消音內域 | r=25 | P3 | |
| memory_storm | buildAnomalies memory-storm | Torus 自轉 | 異常/記憶敘事 | VFX | 粒子+殘影 sprite | r=18 | P2 | |
| reverse_river_vfx | buildWater 逆流 Line | LineBasicMaterial | 異常規律可視化 | VFX | UV 卷動帶狀 mesh | 沿河段 | P2 | 浮沫逆行=規律本體 |
| river_surface | buildWater ribbon | 自建 strip + Lambert | 水文層 | SHADER | toon water shader | 寬 9 | P1 | 卡通高光帶+岸線白邊 |
| lake_surface | buildWater lake+oasis pond | CircleGeometry | 水文層 | SHADER | 同上 | r≈48 | P1 | |
| scannable_14kinds ×26 | addScannableMesh | Octahedron 換色 | 掃描=核心互動 | GLB | 14 種小模型各 ≤500tri | 高 0.6–1.5 | P1 | 詳見 cards |
| wind_beam | buildAbilityLayers | 開口 Cylinder | 風息感知可視層 | VFX | 上升粒子流 | 高 30 | P2 | |
| echo_wire | 同上 | wireframe Sphere | 回聲視覺可視層 | VFX | 脈衝環 shader | r=10 | P3 | |
| star_road | 同上 | Line | 星圖導航可視層 | VFX | 點線流動 sprite 鏈 | 跨地圖 | P3 | |
| myth_rings | 同上 | Torus×3 | 神話視界可視層 | VFX | 地面符文光環 decal | r=10 | P3 | |
| map_icons | livingMap.js fillText 字元 | 字型字元 | 地圖辨識 | SVG | 24×24 SVG ×12 | — | P1 | |
| ability_icons ×7 | hud.js 純文字 | 無 | 能力辨識 | SVG | 24×24 SVG ×7 | — | P2 | |
| ui_theme | index.html CSS | 深色科技面板 | 全 UI | TEX/CSS | CSS token 重皮 | — | P1 | 手帳風 token 見 §2.9 |

---

## 4. Asset Manifest Schema

新增 `src/data/assetManifest.json`（資料檔，不含邏輯；loader 於 §6 定義）。每筆：

```jsonc
{
  "id": "skyspire",                       // 唯一 ID，對應本文件 asset_id
  "category": "landmark",                 // character|creature|landmark|prop|scannable|vfx|icon|material
  "replaces": "scene.buildLandmarks#tower", // 被取代的程式位置（模組#分支）
  "sourceFile": "assets/models/landmarks/skyspire.glb", // 相對 public/；icon 用 .svg
  "fallbackFactory": "primitiveTower",    // src/render/fallbacks.js 內函式名；載入失敗時呼叫
  "format": "glb",                        // glb|png|svg|shader|procedural
  "worldScale": { "height": 29 },         // 至少一個絕對尺寸（公尺）；loader 據此校驗並等比縮放
  "pivot": "bottom-center",               // bottom-center|center|custom:{x,y,z}
  "collisionProxy": { "type": "cylinder", "r": 3.4, "h": 29 }, // none|sphere|cylinder|box；只供互動距離參考，不做物理
  "lod": [ { "dist": 0, "tris": 9000 }, { "dist": 120, "tris": 1800 }, { "dist": 300, "tris": 300 } ],
  "materialProfile": "toon-stone",        // toonMaterials.js 中的 profile 名
  "animationStates": ["idle"],            // glb 內建 clip 名；無=[]
  "vfxStates": { "beacon": "塔頂燈 #ffd98a 呼吸週期 3s" }, // 程式驅動狀態→視覺對應
  "gameplayReadability": "300m 外剪影可辨；夜間塔頂燈為最遠可見光點",
  "acceptanceCriteria": [
    "畫面高 60px 時剪影與 watchtower 可區分",
    "LOD 切換無 popping（透明度 0.2s 過渡）",
    "含 outline 後總 tris ≤ 預算 ×1.6"
  ]
}
```

校驗規則（loader 啟動時執行、console.warn 不阻斷）：`id` 唯一；`fallbackFactory` 必須存在於 fallbacks.js；`worldScale` 與載入後 boundingBox 誤差 >10% 時自動縮放並警告；LOD0 tris 超預算 20% 時拒用該檔並走 fallback。

---

## 5. Priority Plan（按畫面提升效益排序，刻意不均分）

### P0 — Visual System Foundation（不換任何模型，畫面先脫胎換骨）
toon 材質系統（gradientMap+rim）、inverted-hull outline 工具、skydome+晝夜、陰影/blob shadow、UI 手帳 token 換皮。
**為什麼第一**：D1/D2/D10/D12/D13 全是系統性問題；同一批 primitive 套上 cel+outline+新天空後即是「風格化遊戲」而非「除錯畫面」。先做資產後做系統＝資產要回工兩次。

### P1 — High-impact Assets（每幀都在畫面中央或視線終點的東西）
player_cartographer、tree_lumen（×240 佔畫面最大面積）、ground_scatter（平原密度）、7 座主地標（skyspire/gate/observatory/lumen_tree/water_node/village_hut/float_island）、水面 shader、14 種掃描物、地圖 SVG icon。
**為什麼**：玩家角色永遠置中（D3）；樹與地表佔 70% 像素（D4/D5）；地標是 retention 設計的「遠方鉤子」本體（D6）；掃描物是核心互動的視覺回饋（D7）。

### P2 — Creatures / NPC / Interaction Assets
4 種 NPC、4 種生物、能力 icon ×7、water_node 水柱與 gate 符文 VFX、fog_zone/memory_storm/reverse_river VFX、wind_beam。
**為什麼**：互動頻率高但單次停留短；在 P0 系統下舊 primitive 仍可暫存活（有 cel+outline 的球比沒有的精模好看）。

### P3 — Variations & Polish
樹/岩 2–3 變體、watchtower、hollow_site decal、silent_vale/star_road/myth_rings VFX、繁榮村莊裝飾件、LOD 細化、夜間燈火點綴。
**為什麼**：此層只降低資產重複率（目標：任一畫面內同網格同朝向出現 ≤ 3 次）與補次要 VFX，對單幀畫面評分的提升幅度最低，故最後做。

---

## 6. Codex Implementation Plan

### 6.1 新增資料夾
```
public/assets/
  models/{characters,creatures,landmarks,props,scannables}/   # .glb
  textures/{ramps,atlas,terrain}/                              # toon ramp、粒子 atlas、地形細節
  icons/{map,abilities}/                                       # .svg
src/render/
  materials/toonMaterials.js   # profile 工廠：makeToon(profile)、addOutline(mesh,opt)
  assets/loader.js             # manifest 驅動 GLTFLoader + 快取 + fallback
  assets/fallbacks.js          # 現有 primitive 建構式全部搬進來、具名匯出
  sky.js                       # skydome + 晝夜 + 星點
  vfx/particles.js             # atlas sprite 池（共用、≤40/系統）
  vfx/{waterfx.js, anomalyfx.js, abilityfx.js}
src/data/assetManifest.json
```

### 6.2 重構順序（嚴格依序，每步後跑 `npm test` + `npm run build`）
1. **抽 fallback**：把 scene.js 內所有 primitive 建構碼搬到 `fallbacks.js` 具名函式（`primitiveTower()`、`primitiveTree()`…），scene.js 改為呼叫。行為零變化＝重構安全網。
2. **P0 系統**：toonMaterials.js 落地，scene.js 所有 `MeshLambertMaterial` 改 `makeToon(profile)`；addOutline 套用到角色/生物/地標/掃描物；sky.js 取代純色背景；陰影開關；index.html CSS token 換皮（只動 CSS 變數與顏色值，不動 DOM/排版）。
3. **loader 接線**：scene.js 各 build* 改為 `assetLib.get(id)` → 有 glb 用 glb、無檔案自動走 fallback。此後**資產可以一顆一顆換，遊戲永遠可玩**。
4. **P1→P3** 按 §5 逐顆替換；每顆通過該 Asset Card 的 acceptanceCriteria 才算完成。

### 6.3 保護條款
- 禁改：`src/world/**`、`src/systems/**`、`src/core/**`、`test/smoke.mjs`、互動判定（main.js `nearestInteractable`/`interact`）。
- 渲染層只能**讀** world 資料；所有「狀態→視覺」映射沿用既有 `render-update` 事件，不得新增遊戲事件。
- `scannableMeshes/animalMeshes/npcMeshes/landmarkMeshes` 四個 Map 的 key 與生命週期不得改變（markScanned/removeAnimal 依賴）。
- 模型載入必須 async 非阻塞：先放 fallback primitive，glb 到貨後原地替換（同 position/rotation/parent）。
- 預算：`dist/` 總體積 ≤ 25 MB；同屏 tris ≤ 250k（含 outline hull）；draw calls ≤ 120。

---

## 7. Asset Cards

通用規格（各卡不再重複）：glb=glTF 2.0 binary、Y-up、1 unit=1m、無相機無燈光、材質名=manifest materialProfile、貼圖 PNG 嵌入；texture 一律手繪平塗+10–15% 紙紋噪點，無照片、metalness=0；tri 預算指 LOD0 不含 outline hull；動畫 clip 名小寫連字。

**file path 規則**（除非卡內另註明）：
```
3D    public/assets/models/<category>/<asset_id>.glb
        category 對照：character→characters, creature→creatures,
        landmark→landmarks, scannable→scannables, prop→props
icon  public/assets/icons/abilities/<能力id>.svg（map icon 同理 icons/map/）
vfx   無檔案；模組 src/render/vfx/anomalyfx.js（fog_zone/silent_vale/memory_storm）、
        waterfx.js（reverse_river_vfx/water_node active）、abilityfx.js（wind_beam 等）
decal public/assets/textures/atlas/decals.png（hollow_site、星盤環紋共用一張 512²）
```
**fallback strategy 規則**：每個 3D 資產的 fallbackFactory = `primitive` + asset_id 轉 CamelCase（如 `primitiveSkyspire`、`primitiveLumenDeer`），實作=現行 scene.js/controller.js 對應 primitive 碼原樣搬入 fallbacks.js；VFX 的 fallback=現行靜態幾何（如 fog_zone 退回壓扁 Sphere）；icon 的 fallback=現行文字字元。載入失敗→console.warn + fallback，**遊戲不得因任何資產缺檔而中斷**。
**material style 規則**：materialProfile 命名 `toon-<表面>`，各卡未註明時依類別預設——角色衣物=toon-cloth、生物=toon-fur、石造=toon-stone、青銅/黃銅=toon-bronze、植物=toon-foliage、發光體=toon-emissive、水=toon-water。outline 依 §2.4 類別公式，不逐卡重述。

---

#### player_cartographer
- purpose：玩家化身，全程畫面中央，是風格的第一證明。
- replaces：controller.js mesh（Cyl+Sphere+Cone）。
- visual：5 頭身青年測繪者，性別中性。靛藍短外套 #3b4a72、肩披 teal 披風 #2fa98c（下擺 3 片分岔）、胸前黃銅羅盤 #c8a35a（直徑 12cm）、背側捲軸筒、寬簷帽（帽簷前緣上翻 15°）。膚 #e8cfa8、髮 #6b5a4a。
- silhouette：帽簷+披風分岔+捲軸筒三特徵在 16px 縮圖可辨；滑翔時披風展開寬度 = 肩寬 ×2.2。
- palette：上列 5 色 + INK，不得新增。
- scale：高 1.70m。format：glb。tris：≤ 7000。tex：512²。
- pivot：bottom-center（雙腳間地面）。
- anim states：`idle`（呼吸+披風微擺 2.4s loop）、`walk`、`run`、`jump`、`glide`（披風水平展開）、`scan`（單手持羅盤前舉）。骨架 ≤ 24 bones。
- mobile：骨骼蒙皮 ≤ 4 influences/vertex。
- acceptance：六個 clip 由 controller 現有狀態驅動（idle/move/sprint/!onGround/gliding/掃描時）；披風 glide 展開無穿模；outline 0.04m。

#### npc_villager
- purpose：傳聞主要載體；村落內可對話/可協助實體（main.js nearestInteractable type=npc）。
- replaces：buildCreatures npc 組合（roleColor 0xd8b890）。
- visual：5 頭身，亞麻短褂 #c9b08a、深棕圍裙 #6b5340、頭巾 #a8584a；袖口挽起。
- silhouette：圍裙下擺梯形 + 頭巾結。palette：3 色+膚髮+INK。
- scale：高 1.60m。glb，tris ≤ 4500，tex 256²，pivot bottom-center。
- anim：`idle`、`talk`（頷首+手勢 1 次/3s）。
- mobile：與 scholar/hunter 共用骨架（同 .glb 內 3 mesh 或共 skeleton）。
- acceptance：對話觸發 talk clip；與玩家並站時頭頂低於玩家 0.1m。

#### npc_scholar
- replaces：roleColor 0x90a8d8 個體。purpose：學者語氣傳聞/真相矛盾敘事。
- visual：長袍 #5a6da0 垂至腳踝、白色寬腰封 #e8e0d0、單邊圓眼鏡（黑線圈）、腋下夾 3 卷書（#c8a35a 卷軸）。
- silhouette：A 字長袍+腋下卷軸突出。scale 1.60m，tris ≤ 4500，tex 256²，pivot bottom-center，anim 同 villager。
- acceptance：眼鏡在 8m 內可辨；長袍走動不穿腳（裙擺骨 2 根）。

#### npc_hunter
- replaces：roleColor 0xa8c890 個體。purpose：生態/狩獵線傳聞。
- visual：皮甲背心 #7a5f44、墨綠連帽斗篷 #44604a（兜帽戴起）、背負短弓（弓臂 #6b5340）、腰掛 2 個獸鈴。
- silhouette：兜帽尖+背弓弧線。scale 1.70m，tris ≤ 4500，tex 256²，anim 同 villager。
- acceptance：兜帽陰影內仍見眼點（emissive 膚色點 2px）。

#### grazer（草原蹄獸）
- replaces：buildCreatures Sphere(1.4,1,1)。purpose：掃描/狩獵基礎對象、獸徑線索主體。
- visual：圓潤四足獸，體色 #c8b088、背部鞍狀深斑 #8f7a5a、垂耳、無角、短尾球。
- silhouette：滿月形軀幹+垂耳。scale 肩高 0.9m。glb，tris ≤ 2500，tex 256²，pivot bottom-center。
- anim：`idle`（低頭吃草循環 3s）、`move`。死亡=§2.7 花瓣消散（程式）。
- acceptance：16px 縮圖與 lumen_deer 可分（靠耳形與明度）。

#### lumen_deer（燈苔鹿）
- replaces：同上 0x88e8c8 個體。purpose：森林生態鏈線索（角苔=燈苔草同源）。
- visual：纖細鹿形，體色暗青 #2a4a44；鹿角呈珊瑚分枝、覆苔光斑 #45e8c0（emissive，6–8 點）；蹄部同色微光。
- silhouette：細頸+珊瑚角。scale 肩高 1.1m。tris ≤ 3000，tex 256²。
- vfx states：`night`（光斑強度 ×2，由 dayPhase 驅動）。
- acceptance：夜間 50m 外可見角部光點；silent-forest 狀態下光斑降至 0.3 倍（讀 ecoRegions.silent）。

#### apex_beast（岩背巨獸）
- replaces：Sphere×3 scale 個體。purpose：稀有狩獵/生態樞紐/矛盾觸發。
- visual：肩高前傾梯形巨獸；背部 5–7 塊板岩狀甲片 #6e6a80（與山岩同 ramp）、體色 #885a4a、四肢柱狀、足三趾；甲片縫隙微光 #d99a3d。
- silhouette：背部鋸齒甲列。scale 肩高 3.2m、全長 6m。tris ≤ 6000，tex 512²。
- anim：`idle`（緩慢呼吸、甲片縫隙光同步明滅 4s）、`move`。
- acceptance：100m 機位（畫面高 ≥ 28px）下剪影面積 ≥ grazer 的 9 倍、背部甲列可數出 ≥ 5 段鋸齒。

#### stalker（？？？/追蹤者）
- replaces：onWorldChange stalker-spawn Sphere。purpose：prey-turns-hunter 矛盾的可見後果實體（stalking 行為既有）。
- visual：消光黑獸形 #14101a（材質不受光：MeshBasicMaterial 黑 + 僅輪廓線 #2a2236）；雙眼 #d99a3d emissive；移動時身後 0.6s 殘影 2 幀（同網格透明 30%/15%）。
- silhouette：低伏流線、無耳無尾＝「資訊缺失」造型。scale 肩高 1.4m。tris ≤ 2000，tex 無（純色）。
- anim：`prowl` 單一 clip。
- acceptance：夜間只見雙眼與輪廓；玩家轉身直視 2s 內不前進（讀現有 stalking 距離邏輯即可，不改邏輯）。

#### skyspire（望星塔）
- replaces：case tower。purpose：出生點視線終點、首個攀爬目標。
- visual：白石楔形塔 #d8d2c0（ramp 暗部 #9a93a8），7 段收分、每段環刻 glyph 紋帶（雙色刻紋規則 §2.6）；頂部黃銅渾天環 #c8a35a 含燈芯 #ffd98a；基座 4 片飛扶壁；中段高度纏一圈藤蔓 #44604a。
- silhouette：垂直楔形+頂部圓環。scale 高 29m。tris LOD0 ≤ 9000 / LOD1 1800 / LOD2 300。tex 1024²。pivot bottom-center。
- vfx：`beacon`（頂燈呼吸 3s）；攀頂瞬間環體加速旋轉 1 圈（2s）。
- acceptance：出生點（-40,40）望去塔燈為地平線最亮點；攀爬互動半徑內可見入口拱門細節。

#### ancient_gate（古道之門）
- replaces：case gate。purpose：glyph 推論終點、真相矛盾觸發器。
- visual：ㄇ形雙柱石門，風化灰岩 #7a7468；柱身滿刻 charset 符文（未解=刻紋雙色；decoded 後符文逐條亮起 #b48aef，0.15s/條、由下而上）；楣樑中央嵌「反刻的簽名符」（§civilization 記憶殘留呼應）；左柱頂斜 30° 剪切破損+地面 2 碎塊。
- silhouette：ㄇ負空間+左缺角。scale 高 15m 寬 13m。tris ≤ 7000，tex 512²。pivot bottom-center。
- vfx states：`sealed`（無光）、`decoded`（符文亮+門洞內懸浮微塵 20 sprite）。
- acceptance：gateGlow 舊平面移除；decoded 狀態由現有 `gate-opened` render-update 驅動。

#### observatory（折翼天文台）
- replaces：case observatory。purpose：星象線索源、異常加速矛盾舞台。
- visual：八角石基座 #9a8e7a + 傾斜 22° 的開裂銅穹頂 #5f8a8a（銅綠 ramp）；裂縫處外露折斷的黃銅鏡筒指向天空；基座外環 8 根刻度短柱（對應星象石 24 環紋的 1/3 縮略）。
- silhouette：斜切球+突出鏡筒。scale 高 11m。tris ≤ 8000，tex 512²。
- vfx：`night`（裂縫內部亮 #ffe9a8 微光）；`restored`（預留 clip：穹頂回正，本版不觸發）。
- acceptance：傾斜方向固定朝北（與星象敘事一致）；記憶殘留掃描物置於鏡筒正下方陰影內。

#### lumen_tree（燈心巨樹）
- replaces：case tree。purpose：森林區域視覺錨點（夜間全圖最高亮度體）、hypo-lumen-tree 推論終點。
- visual：傘形巨樹：扭轉三股主幹 #5a4438 編成一柱，傘狀冠 3 層 #2e6e5e；冠內懸垂 12–16 條光藤（emissive #45e8c0 漸層至透明）；根部隆起平台環繞一圈苔光點。
- silhouette：傘冠+垂藤＝唯一「下垂發光」剪影。scale 高 26m 冠幅 22m。tris ≤ 9000，tex 512²。
- vfx：`day`（藤光 0.3）/`night`（藤光 1.0 + 上升孢子粒子 12 sprite，流向=樹冠，呼應「植物朝向巨樹」線索）。
- acceptance：夜間全森林最亮體；孢子流向可被玩家觀察為「指向樹」。

#### stone_circle（環石陣）
- replaces：case circle。purpose：星路端點、河谷地標。
- visual：8 立石 #8a8478 高低交錯（2.8–4.6m），各石面向圓心刻單一 charset 字元（雙色刻紋）；中央地面嵌星盤 decal（24 格環紋，#b48aef 線 1px）。
- silhouette：鋸齒環。scale r=8m。tris ≤ 4000（8 石共網格），tex 256²。pivot center（圓心地面）。
- vfx：`night` 中央 decal 微光 0.4。
- acceptance：與星象石 24 格環紋圖樣 1:1 一致（同一張 SVG 來源）。

#### water_node（乾谷水脈節點）
- replaces：case node。purpose：第一條完整推論的互動終點；oasis 世界回應的源頭。
- visual：半埋古閘機：青銅方匣 #6a7a88（銅綠 ramp）+ 頂部三重同心環 #88c8d8、環面刻水波紋；側面一條乾涸導水槽延向盆地。
- silhouette：方+環。scale 高 3.5m。tris ≤ 5000，tex 256²。pivot bottom-center。
- vfx states：`dormant`（環靜止、縫隙滴水粒子 1/2s）、`active`（三環反向旋轉 8s/圈、中心水柱：圓柱 UV 卷動水 shader 高 9m + 頂端噴濺 16 sprite + 導水槽流水帶）。
- acceptance：active 由現有 `oasis-bloom` render-update 驅動；nodeJet 舊圓錐移除。

#### hollow_site（低語窪地）
- replaces：case hollow Circle decal。purpose：隱形推論目標（found 前幾乎不可見）。
- visual：found 前：草色凹陷 decal（基底 -10% 明度、r=6m）+ 邊緣 5 株枯草模型斜向圓心；found 後：中心裂口模型（黑洞口 #14101a + 邊緣碎石）+ 上升塵粒 6 sprite。
- scale r=6m。decal TEX 256² + 裂口 glb ≤ 1500 tris。pivot center。
- acceptance：「獸群繞行」的不自然感靠枯草倒伏方向統一表現；echo-vision 線框（P3 改脈衝環）對位裂口正下方。

#### village_hut（湖畔村小屋）
- replaces：case village Box+Cone（×4 + prosperityHut）。purpose：聚落主體、繁榮回應載體。
- visual：圓角方基 #b09468 + 深陶瓦四坡頂 #8a5a44（瓦溝 3 條雙色線）、白灰牆帶 #e8e0d0、木門+圓窗（窗夜間 emissive #ffd98a）、簷下吊 1 串魚乾或藥草。變體 B（繁榮屋）：加閣樓窗+簷角風鈴+晾布。
- silhouette：四坡頂簷角微翹 8°。scale 高 6m 底 5×5m。tris ≤ 3500/棟，tex 512²（A/B 共用）。pivot bottom-center。
- vfx：`night` 窗光；`prospering` 變體 B 由現有 prosperityHut 邏輯位置生成。
- acceptance：4 棟以旋轉+鏡像消重複；煙囪炊煙粒子（4 sprite, 上升 0.5m/s）僅白天。

#### float_island（浮空島）
- replaces：buildAnomalies float-island Cone+Cyl。purpose：最大異常地標、機械推論終點。
- visual：倒錐岩體 #6e6a80：上表面草甸 #5a8a5a + 3 株小樹 + 1 圈殘柱；底尖懸 3 條斷裂石鏈（鏈端懸浮小石 emissive #c49ae8）；側面嵌 4 條地脈紋（emissive #c49ae8、沿週期明滅=升降節律可視化）。machine_base 併入：地面青銅環座+中央水晶柱。
- silhouette：倒錐+底部懸石。scale r=14m 總高 21m。tris ≤ 12000（含 base），tex 512²。pivot：島體 center、base bottom-center。
- vfx states：`drifting`（地脈紋明滅同步 anomaly.period 24s）、`stabilized`（紋恆亮 60%、懸石靜止）。
- acceptance：升降程式邏輯不動（讀 userData.baseY 既有機制）；明滅週期=24s 可被掃描敘事驗證。

#### fog_zone（未名之霧）
- replaces：壓扁 Sphere。purpose：探索者稱號生成的異常區。
- visual：3 層同心霧環（平面 sprite 環、貼圖=atlas 霧團格）：外環 r×1.0 透明度 0.25、中環 0.4、內核 0.55；整體以 0.02 rad/s 反向交錯旋轉；邊界處 8 個直立霧柱 sprite（高 6m）標示「邊界不隨風動」規律。
- scale r=30–55m（讀 anomaly.r）。VFX 模組（anomalyfx.js），無 glb。sprite 總數 ≤ 28。
- acceptance：玩家進入後畫面外緣加 PAPER 色暈 vignette（CSS overlay，退出即除）；不遮 UI。

#### silent_vale（寂靜谷）
- replaces：BackSide Sphere。purpose：聲音消失異常。
- visual：邊界=一圈下垂柳枝狀靜止粒子簾（24 sprite、無動畫=「靜」的視覺化）；內域地面色去飽和 20%（terrain shader 區域 mask）；中心 1 株白色枯木 glb（≤800 tris）。
- scale r=25m。acceptance：邊界內所有粒子系統暫停更新（讀位置判定，渲染層內處理）。

#### memory_storm（記憶風暴）
- replaces：Torus 自轉。purpose：記憶層異常、時痕殘影敘事。
- visual：直徑 2r 的緩慢渦旋：3 條螺旋帶狀 mesh（UV 卷動 #f08ab8→透明）+ 中心懸浮 8 片「殘頁」sprite（atlas 符文片格，各自 2s 翻面）；夜間中心浮現半透明人影 sprite（單幀剪影、透明度 0.3、loop 出現 4s/消失 4s=「重播同一段過去」規律）。
- scale r=18m。sprite ≤ 20。acceptance：人影剪影=觀測者持鏡筒姿勢（呼應天文台殘影文本）。

#### reverse_river_vfx（逆流河段）
- replaces：LineBasicMaterial 線。purpose：異常規律的主要可視化（浮沫逆行）。
- visual：沿 reverseSegment 河面疊 1 條帶狀 mesh：水色加深 #4a6ea0、UV 卷動方向**朝上游**、速度 0.6 m/s；帶上 12 個浮沫 sprite 沿樣條逆行（週期 8s=anomaly.period）；兩端各 1 圈漣漪 decal 標示異常邊界。
- scale 沿既有 segPts。acceptance：與正常河段並看時流向矛盾肉眼可辨；掃描點 reverse-flow 位於帶中點。

#### scannable_lumen_flora（燈苔草）
- replaces：Octahedron #7be8c8。purpose：生態線索鏈起點（光暈偏向巨樹）。
- visual：三葉蓮座草 #2e6e5e + 中心 1 穗光珠串（5 珠 emissive #45e8c0）；**光珠串整體朝 lumen_tree 方向傾斜 20°**（gameplay 線索具象化，方向由 loader 依世界座標設定 rotation）。
- scale 高 0.6m。glb ≤ 400 tris，tex 共用 scannable atlas 512²。pivot bottom-center。
- vfx：未掃描=簽名色 outline 呼吸（§2.4）；掃描後=光珠熄至 30%。
- acceptance：傾斜方向經 loader 計算後誤差 ≤ 5°；oasis-flora 變體＝同網格換 #8be88a。

#### scannable_glyph_stone（刻文石）
- replaces：Octahedron #c8a8e8。purpose：文明線索（一致語法+朝向）。
- visual：半身碑石 #7a7468、正面單一 charset 字元（刻紋雙色+細 emissive #b48aef 描芯）、碑頂斜切、底部苔環；**碑面法線朝 ancient_gate**（loader 設 rotation）。
- scale 高 1.4m。glb ≤ 500 tris。pivot bottom-center。
- vfx：未掃描呼吸 outline；掃描後字元 emissive 恆亮 40%（=「被讀過」）。
- acceptance：四座石字元各不相同（charset 前 4 字）；朝向誤差 ≤ 5°。

#### scannable_wind_node（上升氣流）
- replaces：Octahedron #b8e8f8。purpose：風息感知解鎖鏈+滑翔點標記。
- visual：地面：3 片風蝕石板呈螺旋排列 #a7a3bd；其上恆駐 5 條上升細粒子流（atlas 圓暈格、高 4m、速 2m/s、可見性不依賴能力——能力開啟後才出現 30m 高 wind_beam）。
- scale 佔地 r=1.2m。glb ≤ 350 tris + 粒子 5 sprite。
- acceptance：粒子流向恆向上；與 wind_beam（能力層）同位疊加不重複生成。

#### scannable_star_stone（星象石）
- replaces：Octahedron #f0e8a8。purpose：星象線索（24 環紋）。
- visual：傾斜石盤（仰角 35°朝北）#8a8478，盤面 24 格環紋 decal（與 stone_circle 中央同一 SVG）、其中 3 格磨亮（emissive #ffe9a8 微光=「常被對準」線索）。
- scale 盤徑 1.2m、高 1.0m。glb ≤ 450 tris。pivot bottom-center。
- vfx：`night` 環紋亮度 ×2。acceptance：磨亮格位置兩座石一致（同資產）。

#### ability_icon_wind_sense（風息感知）
- purpose：能力列/解鎖 toast 圖示。replaces：hud.js 純文字。
- visual：24×24 SVG：三條向右上揚的流線（stroke 2px 圓端），最上條尾端捲成一個 1.5 圈螺旋。
- color：currentColor（CSS 控制：未解鎖 INK 40%、解鎖 PAPER、啟用 #6fc3f0）。
- acceptance：16px 顯示下三線不粘連；無填色、純 stroke。

#### ability_icon_echo_vision
- visual：一個圓點，外圍 2 道右開口半圓弧（聲納），整體置於一個下半部虛線（地面下=虛）的圓中。
- 規格/驗收同上（簽名色 #45e8c0）。

#### ability_icon_geopulse
- visual：六邊形晶體輪廓，內部 1 道閃電狀折線貫穿（3 折），晶體底部 2 條接地短線。
- 簽名色 #d99a3d。其餘同上。

#### ability_icon_ecology_hearing
- visual：一枚葉形輪廓，葉柄延伸成 1 道聲波弧線，弧線終端 3 個遞增小圓點。
- 簽名色 #45e8c0（與 echo 區分靠形不靠色）。同上。

#### ability_icon_time_residue
- visual：沙漏輪廓，但上腔以 3 條短橫虛線表示「逝去」，下腔實心三角。
- 簽名色 #f08ab8。同上。

#### ability_icon_star_navigation
- visual：四芒星（縱長橫短）+ 右下 1 條虛線路徑連向一個小圓點。
- 簽名色 #ffe9a8。同上。

#### ability_icon_myth_sight
- visual：一隻杏仁眼輪廓，瞳孔是 §2.6 的「◇」字元，上眼瞼外 3 條放射短線。
- 簽名色 #ffd98a。同上。

---

## 8. Acceptance Test（Codex 完成後驗收程序）

### 8.1 自動化關卡（每階段必跑）
```powershell
npm test                      # 37 斷言全過（邏輯零變動的證明）
npm run build                 # 成功；dist ≤ 25 MB
node test/browser-check.mjs   # console errors = (none)
```

### 8.2 起始畫面截圖（`?seed=verify-001`，進入世界 4 秒後，對照 02-world.png 同機位）
- [ ] 玩家為 5 頭身披風角色，可見帽/披風/捲軸筒剪影，描邊 ≥ 2px@720p，身上可數出恰好 3 階明暗。
- [ ] 樹冠為 2–3 階 cel 色塊+描邊，至少 2 種樹形變體；樹下有陰影（或 blob shadow）。
- [ ] 平原可見草叢/野花 scatter，500m² 內無連續同色面 > 畫面 15%。
- [ ] 地平線方向可見 skyspire 剪影與塔頂燈點；天空為雙色漸層+可見日輪。
- [ ] HUD 為 PAPER 手帳風；能力列顯示 7 個 SVG 圖示（未解鎖為 40% INK）。

### 8.3 地圖模式（按 M）
- [ ] 所有地標 icon 為 SVG rasterized 圖（無字型字元），16px 下類別可辨。
- [ ] 迷霧=PAPER 色 + 10% 噪點的未繪區（取代現行黑色遮罩 rgba(8,9,14,.86)）；已探索區=biome mapColor 平塗 + 5% 噪點層。
- [ ] 稱號光暈/命運層光斑色值符合 §2.2 token。

### 8.4 夜晚畫面（debug：等 dayPhase>0.6 或加 `time` 指令；機位朝發光森林）
- [ ] 燈心巨樹為全場最亮體，垂藤光 #45e8c0、上升孢子可見且流向樹冠。
- [ ] lumen_deer 角部光點 50m 可見；村屋窗光 #ffd98a。
- [ ] 星圖導航啟用時星路為流動點線而非實線。

### 8.5 手機效能（Chrome DevTools：CPU 4× throttle + 視窗 390×844 touch 模擬）
- [ ] 同屏 tris ≤ 250k、draw calls ≤ 120（`renderer.info` 於 debug console 新增 `stats` 指令輸出）。
- [ ] 30fps 持續 60 秒（站在村落望森林的最重機位）。
- [ ] 陰影自動降級為 blob shadow；粒子總量 ≤ 200 sprite。
- [ ] 觸控操作（搖桿/掃描/地圖鈕）不被任何新視覺元素遮擋。

### 8.6 回歸保護
- [ ] 掃描任一物件：outline 呼吸停止、亮度降級、地圖出現紀錄點（markScanned 鏈路完好）。
- [ ] 完成乾谷推論：water_node 進入 active、水柱與綠洲地表變色出現、oasis-flora 變體生成（render-update 鏈路完好）。
- [ ] 過獵 3 次後 stalker 以新模型出現並維持既有距離行為。
- [ ] `seed` / `regen` / `save` / `load` 指令行為與升級前一致。
