# condition-tracker デプロイスクリプト
# 実行: .\deploy.ps1

$ALIAS = "condition-tracker-genya.vercel.app"

Write-Host "=== デプロイ開始 ===" -ForegroundColor Cyan

# 1. Vercelへデプロイ
$output = vercel --prod --yes 2>&1 | Out-String
Write-Host $output

# 2. デプロイURLを抽出
$match = [regex]::Match($output, 'https://condition-tracker-[a-z0-9]+-gen68\.vercel\.app')
if (-not $match.Success) {
    Write-Host "ERROR: デプロイURLが取得できませんでした" -ForegroundColor Red
    exit 1
}
$deployUrl = $match.Value
Write-Host "デプロイURL: $deployUrl" -ForegroundColor Green

# 3. 正しいエイリアスへ設定
Write-Host "エイリアス設定中: $ALIAS" -ForegroundColor Yellow
vercel alias set $deployUrl $ALIAS

Write-Host "=== 完了: https://$ALIAS ===" -ForegroundColor Cyan
