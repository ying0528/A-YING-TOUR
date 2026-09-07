# A Ying Tour

手機優先的釜山行程 PWA。

## 本機執行

```bash
npm install
npm run dev
```

## 打包

```bash
npm run build
```

## GitHub Pages

1. 建立 GitHub repository：`a-ying-tour`
2. 將本專案全部檔案上傳
3. 到 `Settings → Pages`
4. `Source` 選 `GitHub Actions`
5. push 到 `main` 後會自動部署

## 現在版本

- 大寶 / 小寶選擇
- 選擇結果存在 localStorage
- 9/9 ～ 9/12 日期切換
- 內建現有釜山行程
- 景點詳情
- 交通步驟
- 電子票券依 travelerId 過濾
- GitHub Pages workflow

下一步：把 `src/data/mockData.ts` 改成由 Google Apps Script API 載入。
