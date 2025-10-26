<#
gen-env.ps1
Script này sẽ hỏi bạn nhập các giá trị cấu hình (bí mật) và ghi ra file .env.local ở thư mục hiện tại.
Không upload gì ra mạng — mọi dữ liệu đều ở máy bạn.
Hãy chạy trong PowerShell (Run as user) từ thư mục repo root.
#>

function Read-SecureInputAsPlainText($prompt) {
    $secure = Read-Host -AsSecureString -Prompt $prompt
    $ptr = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
    try { [System.Runtime.InteropServices.Marshal]::PtrToStringBSTR($ptr) }
    finally { [System.Runtime.InteropServices.Marshal]::ZeroFreeBSTR($ptr) }
}

Write-Host "Tạo file .env.local từ input - script chạy cục bộ, không gửi dữ liệu." -ForegroundColor Cyan
$envFile = Join-Path (Get-Location) ".env.local"
if (Test-Path $envFile) {
    $ok = Read-Host "File .env.local đã tồn tại. Ghi đè? (y/N)"
    if ($ok -ne 'y' -and $ok -ne 'Y') { Write-Host "Hủy."; exit 0 }
}

# Nhập giá trị (bắt buộc/hay tuỳ bạn)
$SECURITY_JWT_SECRET_KEY = Read-SecureInputAsPlainText "JWT secret (SECURITY_JWT_SECRET_KEY) - nhập an toàn"
$SECURITY_JWT_EXPIRATION_TIME = Read-Host "JWT expiration (SECURITY_JWT_EXPIRATION_TIME) [default 86400000]"; if(-not $SECURITY_JWT_EXPIRATION_TIME) {$SECURITY_JWT_EXPIRATION_TIME='86400000'}

$GOOGLE_OAUTH_CLIENT_ID = Read-Host "Google OAuth Client ID (GOOGLE_OAUTH_CLIENT_ID)"
$GOOGLE_OAUTH_CLIENT_SECRET = Read-SecureInputAsPlainText "Google OAuth Client Secret (GOOGLE_OAUTH_CLIENT_SECRET) - nhập an toàn"
$GOOGLE_OAUTH_REDIRECT_URI = Read-Host "Google OAuth Redirect URI (GOOGLE_OAUTH_REDIRECT_URI) e.g. https://your-render/onrender.com/alotra-website/login/oauth2/code/google"

$CLOUDINARY_CLOUD_NAME = Read-Host "Cloudinary cloud name (CLOUDINARY_CLOUD_NAME)"
$CLOUDINARY_API_KEY = Read-Host "Cloudinary API key (CLOUDINARY_API_KEY)"
$CLOUDINARY_API_SECRET = Read-SecureInputAsPlainText "Cloudinary API secret (CLOUDINARY_API_SECRET) - nhập an toàn"

$SPRING_MAIL_USERNAME = Read-Host "Mail username (SPRING_MAIL_USERNAME)"
$SPRING_MAIL_PASSWORD = Read-SecureInputAsPlainText "Mail password (SPRING_MAIL_PASSWORD) - nhập an toàn"

$SPRING_DATASOURCE_URL = Read-Host "JDBC URL (SPRING_DATASOURCE_URL) e.g. jdbc:sqlserver://..."
$SPRING_DATASOURCE_USERNAME = Read-Host "DB username (SPRING_DATASOURCE_USERNAME)"
$SPRING_DATASOURCE_PASSWORD = Read-SecureInputAsPlainText "DB password (SPRING_DATASOURCE_PASSWORD) - nhập an toàn"

# Optional payment
$VNPAY_TMN_CODE = Read-Host "VNPAY TMN code (VNPAY_TMN_CODE) - optional"
$VNPAY_HASH_SECRET = Read-SecureInputAsPlainText "VNPAY HASH SECRET (VNPAY_HASH_SECRET) - optional"
$VNPAY_PAY_URL = Read-Host "VNPAY PAY URL (VNPAY_PAY_URL) [default https://sandbox.vnpayment.vn/paymentv2/vpcpay.html]"; if(-not $VNPAY_PAY_URL){$VNPAY_PAY_URL='https://sandbox.vnpayment.vn/paymentv2/vpcpay.html'}
$VNPAY_RETURN_URL = Read-Host "VNPAY RETURN URL (VNPAY_RETURN_URL) - optional"

$PAYOS_CLIENT_ID = Read-Host "PAYOS_CLIENT_ID (optional)"
$PAYOS_API_KEY = Read-Host "PAYOS_API_KEY (optional)"
$PAYOS_CHECKSUM_KEY = Read-SecureInputAsPlainText "PAYOS_CHECKSUM_KEY (optional) - nhập an toàn"

$SERVER_SERVLET_CONTEXT_PATH = Read-Host "SERVER_SERVLET_CONTEXT_PATH (default /alotra-website)"; if(-not $SERVER_SERVLET_CONTEXT_PATH){$SERVER_SERVLET_CONTEXT_PATH='/alotra-website'}
$SPRING_PROFILES_ACTIVE = Read-Host "SPRING_PROFILES_ACTIVE (optional, e.g. production)"
$COOKIE_SECURE = Read-Host "COOKIE_SECURE (true/false) [default true]"; if(-not $COOKIE_SECURE){$COOKIE_SECURE='true'}

# Build content
$content = @()
$content += "# Generated .env.local — keep this file private and do NOT commit to git"
$content += "SECURITY_JWT_SECRET_KEY=$SECURITY_JWT_SECRET_KEY"
$content += "SECURITY_JWT_EXPIRATION_TIME=$SECURITY_JWT_EXPIRATION_TIME"
$content += "SERVER_SERVLET_CONTEXT_PATH=$SERVER_SERVLET_CONTEXT_PATH"
$content += "GOOGLE_OAUTH_CLIENT_ID=$GOOGLE_OAUTH_CLIENT_ID"
$content += "GOOGLE_OAUTH_CLIENT_SECRET=$GOOGLE_OAUTH_CLIENT_SECRET"
$content += "GOOGLE_OAUTH_REDIRECT_URI=$GOOGLE_OAUTH_REDIRECT_URI"
$content += "CLOUDINARY_CLOUD_NAME=$CLOUDINARY_CLOUD_NAME"
$content += "CLOUDINARY_API_KEY=$CLOUDINARY_API_KEY"
$content += "CLOUDINARY_API_SECRET=$CLOUDINARY_API_SECRET"
$content += "SPRING_MAIL_USERNAME=$SPRING_MAIL_USERNAME"
$content += "SPRING_MAIL_PASSWORD=$SPRING_MAIL_PASSWORD"
$content += "SPRING_DATASOURCE_URL=$SPRING_DATASOURCE_URL"
$content += "SPRING_DATASOURCE_USERNAME=$SPRING_DATASOURCE_USERNAME"
$content += "SPRING_DATASOURCE_PASSWORD=$SPRING_DATASOURCE_PASSWORD"
$content += "VNPAY_TMN_CODE=$VNPAY_TMN_CODE"
$content += "VNPAY_HASH_SECRET=$VNPAY_HASH_SECRET"
$content += "VNPAY_PAY_URL=$VNPAY_PAY_URL"
$content += "VNPAY_RETURN_URL=$VNPAY_RETURN_URL"
$content += "PAYOS_CLIENT_ID=$PAYOS_CLIENT_ID"
$content += "PAYOS_API_KEY=$PAYOS_API_KEY"
$content += "PAYOS_CHECKSUM_KEY=$PAYOS_CHECKSUM_KEY"
$content += "SPRING_PROFILES_ACTIVE=$SPRING_PROFILES_ACTIVE"
$content += "COOKIE_SECURE=$COOKIE_SECURE"

# Write file
$content -join "`n" | Out-File -FilePath $envFile -Encoding utf8
Write-Host "Đã tạo $envFile — hãy kiểm tra và giữ an toàn (KHÔNG commit)." -ForegroundColor Green

# Optionally show path
Write-Host "Đường dẫn file: $envFile"

# Show reminder
Write-Host "Lưu ý: Bạn vừa nhập bí mật cục bộ. Nếu sẽ paste vào Render, mở Render Dashboard → Service → Environment → Add Environment Variable và paste từng cặp NAME/VALUE." -ForegroundColor Yellow
