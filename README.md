# 📘 HỆ THỐNG QUẢN LÝ TRUNG TÂM NGOẠI NGỮ (LMS)
> [cite_start]**Dự án:** Phân tích và Triển khai Hệ thống Thông tin Quản lý Trung tâm Ngoại ngữ. [cite: 1]
> **Công nghệ:** Java Swing, JPA/Hibernate, MySQL/SQL Server, Java Streams/Lambda.

---

## 🛠 1. QUY TẮC CHUNG (INTEGRATION RULES)
Để đảm bảo việc gộp code giữa 3 thành viên không bị xung đột, nhóm thống nhất các nguyên tắc sau:

* **Persistence Unit:** Sử dụng chung một file `persistence.xml`. [cite_start]Tên cấu hình thống nhất là: `TrungTamNgoaiNguPU`. [cite: 2]
* **Cấu trúc Package:**
    * [cite_start]`entity`: Chứa toàn bộ các Class JPA (Thống nhất thuộc tính trước khi code). [cite: 6, 131]
    * [cite_start]`gui`: Chia thư mục con theo chức năng: `gui.academic` (Người 1), `gui.operation` (Người 2), `gui.finance` (Người 3). [cite: 132]
    * `util`: Chứa class kết nối Database và Helper dùng chung.
* **Giao diện (UI):** Mỗi thành viên thiết kế các chức năng trên **`JPanel`**. Người 3 sẽ chịu trách nhiệm tạo một **`JFrame`** chính (Main Dashboard) để gắn các `JPanel` này vào.

---

## 📋 2. PHÂN CHIA CÔNG VIỆC CHI TIẾT

### 👤 NGƯỜI 1: MODULE ĐÀO TẠO & HỌC THUẬT
[cite_start]**Trọng tâm:** Quản lý chương trình học, đăng ký lớp và đánh giá kết quả. [cite: 112, 132]

| Thực thể phụ trách (Entities) | Chức năng chính trên Swing |
| :--- | :--- |
| [cite_start]`Course` (Khóa học) [cite: 26] | [cite_start]Quản lý danh mục và thông tin khóa học. [cite: 27] |
| [cite_start]`Class` (Lớp học) [cite: 36] | [cite_start]Mở lớp, gán giáo viên và phòng học. [cite: 37] |
| [cite_start]`Enrollment` (Đăng ký) [cite: 48] | [cite_start]Tiếp nhận học viên đăng ký vào lớp. [cite: 49] |
| [cite_start]`Result` (Kết quả) [cite: 113] | [cite_start]Nhập điểm và quản lý kết quả học tập. [cite: 113] |
| [cite_start]`PlacementTest` [cite: 136] | [cite_start]Quản lý bài kiểm tra trình độ đầu vào. [cite: 136] |
| [cite_start]`Certificate` [cite: 137] | [cite_start]Cấp chứng chỉ hoàn thành cho học viên. [cite: 137] |

### 👤 NGƯỜI 2: MODULE VẬN HÀNH & NHÂN SỰ
[cite_start]**Trọng tâm:** Quản lý nhân sự, cơ sở vật chất và lịch trình hoạt động. [cite: 74, 97]

| Thực thể phụ trách (Entities) | Chức năng chính trên Swing |
| :--- | :--- |
| [cite_start]`Teacher` (Giáo viên) [cite: 16] | [cite_start]Quản lý hồ sơ và chuyên môn giảng viên. [cite: 17] |
| [cite_start]`Staff` (Nhân viên) [cite: 98] | [cite_start]Quản lý nhân sự các phòng ban (Tư vấn, Kế toán). [cite: 102] |
| [cite_start]`Room` (Phòng học) [cite: 75] | [cite_start]Quản lý danh sách và tình trạng phòng. [cite: 75] |
| [cite_start]`Schedule` (Lịch học) [cite: 82] | [cite_start]Sắp xếp và hiển thị thời khóa biểu lớp học. [cite: 82] |
| [cite_start]`Attendance` (Điểm danh) [cite: 90] | [cite_start]Theo dõi chuyên cần của học viên hằng ngày. [cite: 90] |
| [cite_start]`Branch` (Chi nhánh) [cite: 134] | [cite_start]Quản lý thông tin các cơ sở của trung tâm. [cite: 134] |

### 👤 NGƯỜI 3: MODULE TÀI CHÍNH & HỆ THỐNG
[cite_start]**Trọng tâm:** Quản lý học viên, dòng tiền và bảo mật hệ thống. [cite: 57, 105]

| Thực thể phụ trách (Entities) | Chức năng chính trên Swing |
| :--- | :--- |
| [cite_start]`Student` (Học viên) [cite: 4] | [cite_start]Quản lý hồ sơ và thông tin cá nhân học viên. [cite: 5] |
| [cite_start]`Payment` (Thanh toán) [cite: 58] | [cite_start]Thu học phí và quản lý các giao dịch. [cite: 58] |
| [cite_start]`Invoice` (Hóa đơn) [cite: 67] | [cite_start]Xuất hóa đơn và theo dõi trạng thái thanh toán. [cite: 67] |
| [cite_start]`UserAccount` (Tài khoản) [cite: 105] | [cite_start]Đăng nhập, phân quyền (Admin/Teacher/Student). [cite: 110] |
| [cite_start]`Promotion` (Khuyến mãi) [cite: 135] | [cite_start]Quản lý các chương trình ưu đãi học phí. [cite: 135] |
| [cite_start]`Notification` (Thông báo) [cite: 138] | [cite_start]Gửi thông báo hệ thống đến các đối tượng. [cite: 138] |

---

## 📑 3. SẢN PHẨM BÀN GIAO (DELIVERABLES)
[cite_start]Dự án cần hoàn thành các tài liệu đặc tả sau: [cite: 149]
1.  [cite_start]**ERD Diagram:** Sơ đồ quan hệ thực thể (Data Model). [cite: 151]
2.  [cite_start]**Data Dictionary:** Từ điển dữ liệu chi tiết các thuộc tính. [cite: 152]
3.  [cite_start]**Use Case Diagram:** Sơ đồ chức năng hệ thống. [cite: 153]
4.  [cite_start]**Java Source Code:** Bao gồm JPA Entities và giao diện Swing. [cite: 2, 131]
5.  **Lambda Queries:** Mỗi thành viên triển khai từ 5-7 câu truy vấn Java Streams/Lambda.

---
