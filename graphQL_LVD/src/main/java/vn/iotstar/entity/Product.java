package vn.iotstar.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "Product") // mapping chính xác bảng cũ
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private Integer quantity;

    @Column(name="[desc]")
    private String desc;

    private Double price;

    @ManyToOne
    @JoinColumn(name = "userid")
    private User user;



}
