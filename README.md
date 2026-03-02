HỆ THỐNG QUẢN LÝ TRUNG TÂM NGOẠI NGỮ (LMS)

Dự án: Quản lý trung tâm dạy học ngoại ngữ (MIS).
Công nghệ: Java Swing, JPA/Hibernate, MySQL/SQL Server, Java Streams/Lambda.

🛠 1. QUY TẮC GỘP CODE (INTEGRATION RULES)
Để tránh xung đột khi ghép bài của 3 thành viên, nhóm thống nhất:

Database chung: Sử dụng chung một file persistence.xml. Tên Persistence Unit là: TrungTamNgoaiNguPU.

Cấu trúc Package:


entity: Chứa các Class JPA (Cả nhóm thống nhất thuộc tính trước khi code).

gui: Chia thư mục con: gui.academic (Người 1), gui.operation (Người 2), gui.finance (Người 3).

util: Chứa class kết nối Database dùng chung.

Giao diện: Mỗi thành viên thiết kế trên JPanel. Người 3 sẽ chịu trách nhiệm tạo một JFrame chính để gắn các JPanel này vào thông qua menu điều hướng.

📋 2. PHÂN CHIA CÔNG VIỆC CHI TIẾT
👤 NGƯỜI 1: MODULE ĐÀO TẠO & HỌC THUẬT

Trọng tâm: Quản lý nội dung giảng dạy, đăng ký và kết quả học tập.

Các thực thể (Entities):


Course (Khóa học).


Class (Lớp học).


Enrollment (Đăng ký học).


Result (Kết quả học tập).


PlacementTest (Bài test đầu vào - Chuẩn DN).


Certificate (Chứng chỉ - Chuẩn DN).

Chức năng Swing: Quản lý danh mục khóa học, mở lớp mới, tiếp nhận đăng ký, nhập điểm và cấp chứng chỉ.

👤 NGƯỜI 2: MODULE VẬN HÀNH & NHÂN SỰ

Trọng tâm: Quản lý con người, cơ sở vật chất và lịch trình.

Các thực thể (Entities):


Teacher (Giáo viên).


Staff (Nhân viên).


Room (Phòng học).


Schedule (Lịch học).


Attendance (Điểm danh).


Branch (Chi nhánh - Chuẩn DN).

Chức năng Swing: Quản lý hồ sơ giáo viên/nhân viên, phân phòng học theo chi nhánh, xếp lịch dạy và theo dõi chuyên cần.

👤 NGƯỜI 3: MODULE TÀI CHÍNH & HỆ THỐNG

Trọng tâm: Quản lý dòng tiền, người học và bảo mật hệ thống.

Các thực thể (Entities):


Student (Học viên).


Payment (Thanh toán).


Invoice (Hóa đơn).


UserAccount (Tài khoản hệ thống).


Promotion (Khuyến mãi - Chuẩn DN).


Notification (Thông báo - Chuẩn DN).

Chức năng Swing: Quản lý hồ sơ học viên, thu học phí/xuất hóa đơn, quản lý mã giảm giá, đăng nhập phân quyền và gửi thông báo hệ thống.

📑 3. DANH SÁCH DELIVERABLES (SẢN PHẨM BÀN GIAO)
Theo chuẩn BA, nhóm cần hoàn thiện các tài liệu sau:


ERD Diagram: Sơ đồ quan hệ thực thể toàn hệ thống.


Data Dictionary: Mô tả chi tiết các trường dữ liệu (PK, FK, Data Type).


Use Case Diagram: Các chức năng của từng vai trò (Admin, Teacher, Student).


SRS: Tài liệu đặc tả yêu cầu phần mềm.
