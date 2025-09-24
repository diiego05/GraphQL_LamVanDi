package vn.iotstar.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "[User]") // để mapping chính xác với bảng [User] trong SQL Server
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String fullname;
    private String email;
    private String phone;
    private String password;
    @ManyToOne
    @JoinColumn(name = "categoryid")
    private Category category;

}
