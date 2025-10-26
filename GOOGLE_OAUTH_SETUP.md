# Hướng dẫn Setup Google OAuth2 Login cho AloTra Website

## 1. Đăng ký Google Cloud Project

1. Truy cập [Google Cloud Console](https://console.cloud.google.com/)
2. Đăng nhập bằng tài khoản Google
3. Tạo một Project mới (hoặc sử dụng project hiện tại)

## 2. Kích hoạt OAuth2 Consent Screen

1. Vào **"OAuth consent screen"** từ menu bên trái
2. Chọn **"User Type"** = **External**
3. Điền thông tin ứng dụng:
   - **App name**: AloTra Website
   - **User support email**: (email liên hệ của bạn)
   - **Developer contact information**: (email của bạn)
4. Chọn **Save and Continue**
5. Ở phần **Scopes**, thêm các scope sau (nếu cần):
   - `openid`
   - `email`
   - `profile`
6. Hoàn tất bằng cách **Save and Continue** và **Back to Dashboard**

## 3. Tạo OAuth2 Credentials

1. Vào **"Credentials"** từ menu bên trái
2. Chọn **"Create Credentials"** → **"OAuth client ID"**
3. Chọn **Application type** = **Web application**
4. Điền thông tin:
   - **Name**: AloTra Website OAuth
   - **Authorized JavaScript origins**: 
     - `http://localhost:8080`
     - `http://localhost`
   - **Authorized redirect URIs**:
     - `http://localhost:8080/alotra-website/login/oauth2/code/google`
     - `http://localhost:8080/login/oauth2/code/google`

5. Chọn **Create**
6. Copy **Client ID** và **Client Secret**

## 4. Cập nhật Application Properties

Mở file `src/main/resources/application.properties` và thay thế:

```properties
spring.security.oauth2.client.registration.google.client-id=YOUR_CLIENT_ID
spring.security.oauth2.client.registration.google.client-secret=YOUR_CLIENT_SECRET
```

Ví dụ:
```properties
spring.security.oauth2.client.registration.google.client-id=123456789-abc123def456.apps.googleusercontent.com
spring.security.oauth2.client.registration.google.client-secret=GOCSPX-abc123def456xyz789
```

## 5. Database Migration

Chạy script SQL trong file `add_google_oauth_columns.sql` trên SQL Server:

```bash
sqlcmd -S localhost -U your_user -P your_password -i add_google_oauth_columns.sql -d AloTraWeb
```

Hoặc chạy trực tiếp trong SQL Server Management Studio.

## 6. Build & Run

```bash
cd AloTraWebsite
mvn clean install
mvn spring-boot:run
```

## 7. Test Google Login

1. Truy cập: `http://localhost:8080/alotra-website/login`
2. Bấm nút **"Đăng nhập với Google"**
3. Đăng nhập bằng tài khoản Google
4. Kiểm tra xem có tạo user mới trong database không

## 8. Production Setup

Khi deploy lên production:

1. **Cập nhật Authorized URIs** trong Google Cloud Console:
   - `https://yourdomain.com`
   - `https://yourdomain.com/alotra-website/login/oauth2/code/google`

2. **Cập nhật application.properties** cho production:
   ```properties
   spring.security.oauth2.client.registration.google.redirect-uri=https://yourdomain.com/alotra-website/login/oauth2/code/google
   ```

3. **Bật HTTPS** (đặt `secure=true` trong OAuth2SuccessHandler)

## Troubleshooting

### ❌ Lỗi "redirect_uri_mismatch"
- Kiểm tra **Authorized redirect URIs** trong Google Cloud Console
- Phải khớp chính xác với URL sau login

### ❌ Không hiển thị Google button
- Kiểm tra xem file `login.html` đã được cập nhật chưa
- Xóa cache browser (`Ctrl+Shift+Delete`)

### ❌ Lỗi "Client authentication failed"
- Kiểm tra lại **Client ID** và **Client Secret**
- Đảm bảo không có khoảng trắng thừa

### ❌ User không được tạo
- Kiểm tra xem **Role "USER"** có tồn tại trong database không
- Chạy: `SELECT * FROM Roles WHERE Code = 'USER';`

## Tài liệu tham khảo

- [Spring Security OAuth2](https://spring.io/projects/spring-security)
- [Google OAuth2 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Spring Boot Starter OAuth2 Client](https://spring.io/projects/spring-security-oauth2-client)
