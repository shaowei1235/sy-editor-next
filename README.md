# ラベルエディター

軽量版の商品ラベル編集ツールです。  
左側の項目リストからフィールドを追加し、中央のキャンバス上で位置・サイズ・角度・文字スタイルを調整できます。右側では印字順を並び替えでき、編集内容は業務用 JSON として保存・復元できます。

## 技術スタック

- Next.js App Router
- TypeScript
- React
- Fabric.js
- Zustand
- dnd-kit
- Tailwind CSS
- pnpm

## 実装済み機能

- フィールド一覧からラベル要素を追加
- Fabric.js キャンバス上で要素を表示
- 要素の選択、ドラッグ移動、リサイズ、回転
- ダブルクリックによるテキスト編集
- フォントサイズ、太字、斜体、下線、配置、行高、字間、枠線の編集
- 要素左上のフィールド名表示
- 要素右下の印字順番号表示
- 右側リストで印字順をドラッグ並び替え
- 選択中要素の削除
- JSON 保存
- JSON 読み込みによる編集状態の復元

## ローカル起動

```bash
pnpm install
pnpm dev
```

起動後、ブラウザで以下を開きます。

```txt
http://localhost:3000
```

Lint は以下で確認できます。

```bash
pnpm lint
```

TypeScript の型チェックは以下で確認できます。

```bash
pnpm exec tsc --noEmit
```

## デプロイ

Vercel へのデプロイを想定しています。

1. GitHub にリポジトリを push
2. Vercel で対象リポジトリを import
3. Framework Preset は Next.js を選択
4. Install Command は `pnpm install`
5. Build Command は `pnpm build`
6. Output Directory は Next.js のデフォルト設定を使用

## 主な設計

### 業務データを中心にする

エディターの中心は Fabric.js のオブジェクトではなく、Zustand に保存している `CanvasElement` 配列です。  
各要素は、フィールドキー、表示名、座標、サイズ、角度、テキスト、スタイル、印字順を持ちます。

Fabric.js はこの業務データを画面上で編集するための描画レイヤーとして使っています。

### Fabric.js の構造

各ラベル要素は `fabric.Group` として表現しています。

```txt
Group
├─ Rect      背景・枠線・固定サイズ
├─ Textbox   本文テキスト
├─ Text      フィールド名
└─ Text      印字順番号
```

最初は `Textbox` 単体でも実装できますが、固定サイズの矩形として扱うには `Rect + Textbox` の方が安定します。  
リサイズ後は Group の scale を実サイズへ反映し、scale を 1 に戻してデータの累積ずれを防いでいます。

### mm と px の変換

保存する業務データは mm 単位、Fabric.js の描画は px 単位です。  
`pxPerMm` を使って、描画時は `mm -> px`、ユーザー操作後の保存時は `px -> mm` に変換しています。

### JSON 保存と復元

保存するのは Fabric.js の生 JSON ではなく、エディター独自の業務 JSON です。

```txt
{
  canvasConfig,
  elements
}
```

これにより、将来的に Java などのバックエンドでテンプレート設定として保存しやすくなります。  
読み込み時は最低限の型チェックを行い、形式が合わない JSON は取り込まないようにしています。

### 印字順と画面位置の分離

右側のリストで並び替える `printOrder` は、印字・出力の順序を表す値です。  
キャンバス上の座標や見た目の重なり順とは別に管理しています。
