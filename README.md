# Enterprise CMS & Corporate Website Portal

Hệ thống Website giới thiệu Doanh nghiệp kết hợp CMS Quản trị Nội dung hoàn chỉnh, xây dựng bằng **Spring Boot 3 (Backend)** và **Angular 18 (Frontend Standalone Components)**.

Hệ thống sử dụng cấu trúc **chỉ duy nhất 5 bảng cơ sở dữ liệu** nhưng hỗ trợ đầy đủ các tính năng quản lý, SEO, tải file và bảo mật.

---

## 🛠️ Công Nghệ Sử Dụng

### Frontend (Angular 18)
- Standalone Components & Routing
- HttpClient & HTTP Interceptors (đính kèm JWT tự động)
- Auth Guards (phân quyền ADMIN / EDITOR và bảo vệ Dashboard)
- Custom Rich Text Editor (contenteditable) không phụ thuộc thư viện ngoài tránh lỗi tương thích
- SEO dynamic Meta & Open Graph Tags
- Responsive Design (Mobile / Tablet / Desktop) sử dụng SCSS thuần

### Backend (Spring Boot 3)
- Spring Security + JWT
- Spring Data JPA
- REST API chuẩn
- Lưu trữ tệp tin văn bản (File Upload)
- H2 Database (Chạy mặc định) / MySQL (Tùy chọn cấu hình)

---

## 💾 Cấu Trúc Database (Chỉ 5 Bảng)

1. **`users`**: Tài khoản quản trị CMS.
   - Vai trò: `ADMIN` (Được quản lý user), `EDITOR` (Quản lý nội dung).
   - Trạng thái: `enabled` (Kích hoạt/Khóa).
2. **`company_info`**: Lưu trữ thông tin giới thiệu, lịch sử, bộ máy và liên hệ của công ty dạng HTML.
3. **`categories`**: Danh mục dùng chung cho các bài viết.
   - Loại: `POST` (Tin tức) hoặc `BUSINESS` (Lĩnh vực hoạt động).
4. **`posts`**: Gộp tin tức sự kiện và bài viết giới thiệu ngành nghề kinh doanh.
5. **`documents`**: Quản lý văn bản pháp luật của doanh nghiệp (PDF/DOCX/XLSX).

---

## 🚀 Hướng Dẫn Chạy Dự Án

### 1. Khởi chạy Backend (Spring Boot 3)
Mặc định dự án được cấu hình chạy database in-memory **H2 Database** để khởi động ngay lập tức mà không cần cài đặt.

- **Cấu hình DB (MySQL / Oracle)**:
  Nếu muốn chuyển sang MySQL, hãy sửa file `application.properties` của Backend:
  ```properties
  spring.datasource.url=jdbc:mysql://localhost:3306/cmsdb?useSSL=false&serverTimezone=UTC
  spring.datasource.username=root
  spring.datasource.password=your_password
  spring.jpa.database-platform=org.hibernate.dialect.MySQLDialect
  ```

- **Tài khoản mặc định (DataLoader Seed)**:
  Hệ thống nên tự động sinh dữ liệu mẫu khi khởi động:
  - Tài khoản Admin: `admin` / mật khẩu: `admin123` (Quyền ADMIN)
  - Tài khoản Editor: `editor` / mật khẩu: `editor123` (Quyền EDITOR)

- Chạy Backend thông qua IDE hoặc dòng lệnh Maven:
  ```bash
  mvn spring-boot:run
  ```
  API chạy tại: `http://localhost:8080`
  H2 Console truy cập tại: `http://localhost:8080/h2-console` (Username: `sa`, Password: `password`)

---

### 2. Khởi chạy Frontend (Angular 18)

1. Di chuyển vào thư mục dự án Angular.
2. Cài đặt các gói thư viện cần thiết:
   ```bash
   npm install
   ```
3. Chạy môi trường phát triển (Development server):
   ```bash
   npm start
   ```
4. Truy cập website tại: `http://localhost:4200`

- **Cấu hình Endpoint API**:
  Có thể thay đổi đường dẫn kết nối API trong file: `src/app/core/constants/environment.ts`
  ```typescript
  export const environment = {
    production: false,
    apiHost: 'http://localhost:8080',
    authUrl: 'http://localhost:8080/auth',
    apiUrl: 'http://localhost:8080/api'
  };
  ```

---

## 🔒 Tài Khoản Demo Đăng Nhập
Để truy cập trang CMS Admin (`http://localhost:4200/admin`), hãy đăng nhập bằng:

| Username | Password | Role |
| :--- | :--- | :--- |
| **admin** | `admin123` | **ADMIN** (Có toàn quyền + CRUD Users) |
| **editor** | `editor123` | **EDITOR** (Chỉ quản lý nội dung bài viết, văn bản) |
