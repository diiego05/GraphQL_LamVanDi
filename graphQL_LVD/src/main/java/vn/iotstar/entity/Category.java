package vn.iotstar.entity;



import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "Category")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Category {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String images;

//    @ManyToMany(mappedBy = "categories")
//    private Set<User> users = new HashSet<>();

}