# 《活地圖：命運地層》The Living Atlas: Strata of Fate
## Game Design Document v0.1（含實作對照）

> 一句話核心：**不是玩家單向探索世界，而是世界根據玩家的探索方式長出新的命運。**

本文件對應實際可執行的程式碼。每節都標注實作位置，所有宣稱都可在 `npm test`（37 項斷言）與 `node test/browser-check.mjs`（瀏覽器實測）中驗證。

---

## 1. 完整 GDD：概念與支柱

### 1.1 玩家幻想（Player Fantasy）
你是「地圖修復者」——世界的地圖層（地形、水文、生態、文明、異常、記憶、推論、命運）已經斷裂。你不是來「通關」的，你是來**讀懂這個世界，然後被這個世界讀懂**。

### 1.2 四大設計支柱
1. **地圖即玩法**：Living Map 不是 UI，是主要遊戲系統。補完一層資訊的快感等同於傳統 RPG 升級。
2. **因果生成**：河有源、村靠水、礦倚山、跡循史。世界可以被推理，因為它是按規則長出來的。
3. **命運回授**：每個行為偏移六軸命運 → 命運授予稱號 → 稱號改寫生成權重 → 世界長出回應你的內容。
4. **成功生矛盾**：沒有「純獎勵」。修復水脈會帶來砍伐；解開真相會動搖信仰。矛盾是回流動機的引擎。

### 1.3 核心玩法循環（已實作）
```
遠方地標/異常/傳聞 → 自由選擇（探/掃/修/解/造/獵）
  → Memory 記錄 → Living Map 補層 → Inference 產生 hypothesis
  → 玩家驗證推論 → 獲得能力/地圖層/稱號/世界改變
  → Destiny Axis 偏移 → 生成權重調整 → Rumor 反映 → Contradiction 產生新問題
  → 「我想知道我的選擇會導向什麼」→ 回到第一步
```

### 1.4 留存設計（Retention Design，K 節）
採用的合法鉤子（全部已實作）：
| 鉤子 | 實作 |
|---|---|
| 可推理未知 | 異常都有 `pattern` 可觀察規律；線索文本暗示而不明說 |
| 地圖補完快感 | 八層理解度百分比；迷霧揭露；掃描點上圖 |
| 玩家自訂目標 | 地圖點擊放標記；推論可「追查/擱置」 |
| 長期世界變化 | `WorldResponse.applied` 持久化並於讀檔重播 |
| 高可見地標 | 望星塔 26m 高、浮空島、燈心巨樹夜間發光 |
| 回到舊區域開新路 | 風息感知讓舊高地變成滑翔起點；回聲視覺讓窪地變成入口 |
| 個人化世界生成 | `collectGenWeights()` = 稱號+命運+記憶+能力 四源合併 |
| 下線前留下未完成謎題 | `memory.unresolved[]`；矛盾延遲 30–50 秒浮現，常掛在下線邊界 |
| 玩家成功造成矛盾 | Contradiction Engine 14 種事件 |
| NPC 傳聞反映世界影響 | Rumor System 模板 + 動態池 |

**明確禁止且未使用**：loot box、gacha、near-miss、每日登入懲罰、人工 FOMO、能量條、付費加速、損失厭惡操縱。全案無任何計時獎勵、無體力、無商城。

---

## 2. 技術選型理由

**選擇：Vite + three.js**（而非 Godot 4）

1. **邏輯/渲染強制分離可被驗證**：`src/world/` 與 `src/systems/` 完全不依賴 three.js，可在 Node 直接 headless 測試（`test/smoke.mjs`）。Godot 的 GDScript 邏輯難以脫離引擎做自動化驗證。
2. **跨平台零安裝**：瀏覽器即玩、手機可開（觸控已支援），符合 mobile-friendly 要求。
3. **研究型原型迭代速度**：資料驅動內容（`src/data/`）改一行即時熱更新。
4. **可重現性**：自寫 sfc32 PRNG + 子串流 fork，比依賴引擎內建 RNG 更可控。

確定性保證：所有生成只允許使用 `core/rng.js` 的 `RNG`（sfc32，xmur3 雜湊種子）與 `Noise2D`（value noise + fBm）。同 seed 必然同世界（測試斷言 1.1–1.3）。

---

## 3. 專案資料夾結構

```
活地圖：命運地層/
├── index.html              # 殼層 + 全部 UI DOM/CSS（HUD、地圖、對話、手機控制、除錯台）
├── package.json / vite.config.js
├── docs/GDD.md             # 本文件
├── test/
│   ├── smoke.mjs           # headless 邏輯測試（37 斷言）
│   └── browser-check.mjs   # Chrome 實機驗證 + 截圖
└── src/
    ├── main.js             # 組裝點：接線 + 互動判定 + 遊戲迴圈（無業務邏輯）
    ├── core/
    │   ├── rng.js          # 種子 PRNG（sfc32）、子串流 fork、value noise / fBm
    │   └── bus.js          # 事件匯流排（系統間唯一耦合點）
    ├── data/               # 全部資料驅動內容（加內容不改邏輯）
    │   ├── actions.js      # 行為 → 命運軸映射
    │   ├── titles.js       # 10 種稱號（判定/生成權重/傳聞/地圖視覺/矛盾鉤子）
    │   ├── abilities.js    # 7 種能力（解鎖條件/圖層/權重/矛盾鉤子）
    │   ├── contradictions.js # 14 種矛盾事件
    │   ├── rumors.js       # 傳聞模板（條件 + 來源身分）
    │   ├── inferenceRules.js # 6 條推理規則（線索組合 → hypothesis）
    │   └── biomes.js       # 區域定義（色彩編碼/霧色/描述）
    ├── world/              # World Generation（純資料，無渲染依賴）
    │   ├── worldgen.js     # 總指揮 + 可掃描物佈點
    │   ├── terrain.js      # 地形 + 水文層（河流源/終保證、湖、乾谷）
    │   ├── ecology.js      # 生態層（棲地偏好、稀有物種條件、區域狀態）
    │   ├── civilization.js # 文明層（村落靠水、道路連接、符號語法）
    │   └── anomaly.js      # 異常層（每個異常帶可觀察規律）
    ├── systems/            # 遊戲系統（純邏輯，Node 可測）
    │   ├── memory.js       # Player Memory System
    │   ├── destiny.js      # Destiny Axis System
    │   ├── myth.js         # Personal Myth Generator
    │   ├── rumor.js        # World Rumor System
    │   ├── contradiction.js# Contradiction Engine
    │   ├── scanning.js     # Scanning System（clue 結構）
    │   ├── inference.js    # Inference System（hypothesis 結構）
    │   ├── abilities.js    # Player Ability System
    │   └── worldResponse.js# World Response System
    ├── map/livingMap.js    # Living Map（八層 canvas 渲染 + 理解度 + 推論面板）
    ├── render/scene.js     # three.js 渲染層（地形網格、植被、地標、異常、能力視覺層）
    ├── player/controller.js# 第三人稱控制（鍵鼠 + 觸控搖桿 + 滑翔）
    ├── ui/hud.js           # HUD（通知/命運色帶/能力列/對話框）
    ├── save/saveSystem.js  # localStorage 存讀檔
    └── debug/console.js    # 除錯主控台（` 開關）
```

## 4. 系統模組責任（單一職責 + 事件耦合）

所有系統只透過 `core/bus.js` 溝通。主要事件流：

```
玩家輸入 → bus.emit('action')
  ├─ Memory.recordAction()        （統計、迷霧、風格畫像）
  ├─ Destiny.apply()              （軸偏移）→ emit('destiny-changed')
  │    └─ Myth.evaluate()         （稱號判定）→ emit('title-earned')
  ├─ Contradiction.evaluate()     （行為計數觸發）
  └─ Ability.checkUnlocks()

ScanningSystem.scan() → emit('clue')
  └─ Inference.evaluate()         （規則匹配）→ emit('hypothesis')

Inference.complete() → emit('world-event')
  ├─ WorldResponse.onEvent()      （世界 mutation）→ emit('render-update')
  ├─ Rumor.events.add()           （傳聞條件解鎖）
  └─ Contradiction.evaluate()     （事件觸發）→ 延遲 → emit('contradiction')
       └─ emit('world-change')    → WorldResponse.applyChange()
```

## 5. 核心資料結構

### Clue（`systems/scanning.js`，符合 G 節規格）
```js
{ id, type, sourceObject, biome, location:{x,z}, relatedLayer,
  text, confidence, tags[], discoveredTime, linkedHypotheses[] }
```

### Hypothesis（`systems/inference.js`，符合 H 節規格）
```js
{ id, title, text, relatedClues[], confidence, target:{x,z,id},
  suggestedAction, mapLayer, contradictionRisk, hypoTags[],
  onComplete:{event,action}, status: new|accepted|ignored|completed }
```

### Destiny Axis（`systems/destiny.js`）
```js
{ axes: { explorer, restorer, archivist, seeker, shaper, predator },
  ecoStability }   // 行為映射見 data/actions.js（28 種行為）
```

### Title（`data/titles.js`）
```js
{ id, name, axes:[主軸,副軸], threshold, desc,
  genEffects:{權重...}, mapClass, rumors[], contradictionHooks[] }
```

### Contradiction（`data/contradictions.js`，符合 E 節規格）
```js
{ id, name, trigger:{event|actionCount|titleEarned}, delayMs, region,
  shortTerm, longTerm, playerResponses[], destinyEffect,
  worldChanges[], rumors[] }
```

### Memory（`systems/memory.js`，符合 A.5 規格）
```js
{ biomesExplored, scans, scanTags, actions, huntedSpecies,
  helpedNPCs, ignoredNPCs, climbs, markers[], visited[48×48],
  travelHeat[], unresolved[], changedTerrain[], restoredLandmarks[],
  hypothesesAccepted/Ignored/Completed[] }
```

## 6. World Seed Generation Rules（A 節實作）

生成順序即因果順序：**地形 → 水文 → 文明 → 生態 → 異常 → 線索佈點**。

- **Terrain**（`terrain.js`）：fBm 起伏 + 東北山體遮罩 + 湖盆 + 乾谷淺盆。
- **Hydrology**：河流由「山區源頭 → 湖泊終點」參數曲線 + 噪聲蜿蜒構成，**建構上保證有源有終**；河道下切地形；逆流段（異常層引用）固定於中段。
- **Civilization**（`civilization.js`）：村落生成在湖東岸（靠水規則）；道路連接「村落—環石陣—古道之門」與「村落—天文台」；刻文石沿道路佈點且**朝向統一**（一致語法 → 可推理）；遺跡記憶殘留只出現在遺跡旁。
- **Ecology**（`ecology.js`）：草食獸只在平原/河谷（棲地偏好）且**繞開低語窪地**（這個迴避行為本身是推理線索）；燈苔鹿限發光森林；岩背巨獸帶 `appearCondition`（生態穩定度 > -4 才現身 = 條件式稀有物種）。
- **Anomaly**（`anomaly.js`）：逆流河段（週期浮沫）、浮空島（24 拍升降 = 星象石 24 環紋）、寂靜谷、記憶風暴、迷霧地帶（數量吃 `fogZones` 權重）。
- **危險預警**：磁暴沙漠色彩突變、寂靜谷有可見黑暗穹頂、追蹤者有發光紅眼材質。
- **地標遠視性**：望星塔 29m、浮空島懸空 46m、燈心巨樹夜間自發光。

權重進入點：`generateWorld(seed, genWeights)`。權重由 `Myth.collectGenWeights()` 彙整（稱號 genEffects ∪ 命運軸門檻權重 ∪ 記憶風格畫像 ∪ 能力權重，取最大值合併）。

## 7–15. 各系統模型（對照需求 B–J）

### 7. Player Memory Model（A.5）
追蹤需求清單全項：探索 biome、慣用能力、旅行熱度（48×48 熱度圖）、未解謎題、幫助/忽略 NPC、生態破壞/修復、玩家標記、掃描物件、玩法風格（`styleWeights()` 推導）、地形改造、獵殺物種、修復地標、接受/忽略的推論。
用途：①生成權重（`styleWeights`）②NPC 記憶（`helpedNPCs` → 對話）③地圖推論方向 ④命運軸間接影響。

### 8. Destiny Axis Model（B）
六軸如規格。範例映射（`data/actions.js`）：掃描植物 → Archivist+2/Seeker+1；修復水脈 → Restorer+4/Shaper+1；攀塔 → Explorer+3；破譯古語 → Seeker+4/Archivist+2；獵殺稀有 → Predator+4/eco-2；啟動機械 → Shaper+3/Seeker+1。
影響面：生成權重（`genWeights()`）、稱號（→任務/地標/矛盾類型）、傳聞（`{player}` 代換）、HUD 定性呈現（萌芽/成形/深植，不露數字）。

### 9. Personal Myth Generator Model（C）
10 種稱號（5 種規格指定 + 緘默獵典/綠燼牧者/星徑遊隼/命運織錨/無名行者）。每種皆有：判定條件（雙軸門檻 + 必須是玩家實際最高軸）、世界生成效果、傳聞模板、Living Map 視覺（canvas class 光暈 + 命運層光斑）、矛盾鉤子。瀏覽器實測：restorer14+shaper9 → 「河脈修復師」→ 神話視界解鎖 → dryBasins 權重 ×2。

### 10. Rumor System Model（D）
六種來源身分（村民/商人/探險者/學者/獵人/祭司）語氣分流；條件匹配（事件、行為計數、生態上下界）；動態池（稱號/矛盾注入）優先；防重複（排除最近 5 則）；場景呈現：NPC 對話、HUD 風中低語（95 秒節律，不推播焦慮）、地圖傳聞紀錄欄。規格指定的三組範例傳聞全部進模板。

### 11. Contradiction Engine Model（E）
14 種矛盾（規格 12 種 + 牧者天平 + 知識價格），全帶 trigger/region/short/long/playerResponses/destinyEffect/rumors。延遲浮現（30–50s）製造「先甜後苦」。已完整接通世界 mutation 的：繁榮砍伐、獵物反擊（含追蹤者實體）、浮島淹洞、真相破信、害獸爆發。

### 12. Living Map Model（F）
八層獨立開關 + 各層理解度%。迷霧=粗略地形可見、細節全黑；推論層畫「線索→目標」虛線扇（暗示方向而非導航線）；命運層需「神話視界」能力才可見，以光斑呈現「你的神話正在改變哪裡」；稱號改變地圖外框光暈（painterly 視覺語言，非數值）。點擊地圖=放置玩家標記（記憶層）。

### 13. Scanning & Inference Model（G/H）
14 類可掃描物（植物/動物/獸徑/古文字/氣流/水源/礦脈/記憶殘留/星象石/逆流紋/病態植物/綠洲花/動物個體/異常）。掃描產生線索而非答案；6 條推理規則覆蓋規格範例（乾谷-上游、發光植物-巨樹、獸群-地下空洞、浮島-星象、逆流-地脈）。

### 14. Player Ability Model（I）
7 能力全定義，每個有解鎖條件、地圖層、生成權重、矛盾鉤子：
風息感知（攀塔+掃氣流2 → 滑翔+氣流光柱）、回聲視覺（完成地下推論 → 地下線框）、地脈震鳴（礦2+古文字1 → 啟動機械）、生態聽覺（動植物5 → 遷徙路徑上圖）、時痕殘影（記憶2）、星圖導航（星象2 → 夜間星路）、神話視界（首個稱號 → 命運層可視）。
未解鎖顯示為「？？？」+ 缺失條件提示（可推理的未知，不是黑箱）。

### 15. World Response Model（J）
規格 10 項回應的落地：①助村→繁榮新屋+新商路 ②過獵→獸群躲避+寂靜森林 ③修水→綠洲+商路+新掃描物 ④破譯→石門發光 ⑤忽略污染→生態惡化（eco 累積）⑥常攀高→verticality 權重 ⑦常掃植物→rareSpecies 權重 ⑧常解謎→glyphPuzzles 權重 ⑨常改造→leyworks 權重 ⑩常狩獵→counterHunts 權重+追蹤者。權重在 `seed` 指令重生世界時生效。

## 16. First Playable（O 節驗收表）

| 需求 | 狀態 |
|---|---|
| 可移動 3D 玩家 | ✔ WASD/搖桿+跳躍+滑翔+第三人稱相機 |
| seed-based 開放區域 | ✔ 600×600，URL `?seed=` 可指定 |
| ≥3 biome | ✔ 5 種（平原/發光森林/逆流河谷/漂浮山區/磁暴沙漠） |
| ≥5 地標 | ✔ 8 個 |
| ≥8 可掃描物 | ✔ 26 個（14 類） |
| Living Map UI | ✔ 八層+理解度+標記+推論面板 |
| Destiny Axis 紀錄 | ✔ 六軸+HUD 定性色帶 |
| ≥3 推論 | ✔ 6 條規則 |
| ≥2 可解鎖能力 | ✔ 7 個全可解鎖 |
| ≥2 世界回應 | ✔ 綠洲/寂靜森林/追蹤者/繁榮/石門 |
| ≥2 稱號 | ✔ 10 種 |
| ≥3 NPC 傳聞 | ✔ 22 模板+動態池 |
| ≥2 矛盾事件 | ✔ 14 定義、5 個全 mutation 接通 |
| save/load | ✔ localStorage+自動存檔+變化重播 |
| debug seed reload | ✔ `` ` `` → `seed`/`regen` |
| 手機操作 | ✔ 搖桿+視角拖曳+掃描/地圖/跳按鈕 |

### 建議首次遊玩路線（10 分鐘體驗完整循環）
1. 出生於平原，看見白塔 → 攀塔（Explorer+3）→ 塔頂掃描氣流。
2. 往南找乾谷：掃枯脈草 ×2 + 回河源掃湧泉 → 推論「乾谷枯竭與上游有關」浮現。
3. 地圖按「追查」→ 前往水脈節點 → E 驗證 → **綠洲誕生、村落繁榮、商路重開**。
4. 約 45 秒後 → 矛盾浮現：「繁榮的代價」——森林邊緣被砍、傳聞改變。
5. 與村民對話：他們現在叫你「河脈修復師」。
6. `` ` `` 輸入 `seed test2` → 新世界帶著你的命運生成更多枯竭盆地與水利遺跡。

## 17. 測試方式

```powershell
npm test                      # headless：決定論/生成規則/因果鏈/存檔 37 斷言
npm run dev                   # 互動測試（http://localhost:5173，或 --port 自選）
node test/browser-check.mjs   # Chrome 自動化：進入世界/開地圖/命運注入/截圖/console error
npm run build                 # 生產建置驗證
```
手動測試矩陣：同 seed 兩次進入 → 地標座標一致；`regen` → 世界不變；`seed X` → 世界改變但命運保留。

## 18. Debug Commands（`` ` `` 開啟）

```
seed <s>      用新 seed 重生（保留命運/記憶 → 驗證個人化生成）
regen         同 seed 重生（驗證可重現性）
destiny <軸> <n> / eco <n>    注入命運 / 生態值
unlock <id|all>               解鎖能力
title / hypo / weights / pos  檢視狀態
reveal        地圖全開
tp <x> <z>    傳送
contradiction <id|list>       直接觸發矛盾
rumor         立即生成傳聞
save / load / wipe            存檔操作
```

## 19. 後續擴充 Roadmap

**v0.2 — 深化循環**：礦工鎬挖掘=Shaper 實感地形改造（頂點位移持久化）；NPC 日程與遷移；矛盾「玩家回應」三選一 UI（目前矛盾單向浮現）；時痕殘影的殘影動畫演出。
**v0.3 — 區塊化世界**：chunk streaming 無限世界；跨區域命運主題（世界核心區解鎖條件 = 三層理解度 80%）；地下城市與沉沒遺跡 biome 實裝。
**v0.4 — 個人神話完全體**：結局方向系統（六軸終局敘事）；玩家專屬地標命名權；傳聞跨村傳播衰減模型；敵對派系 AI。
**v0.5 — 分享與研究**：seed+命運檔案分享碼（「玩我的命運長出來的世界」）；遙測埋點（好奇心驅動 vs 完成度驅動的玩家分群研究）；Workshop 式 data/ 模組載入。
