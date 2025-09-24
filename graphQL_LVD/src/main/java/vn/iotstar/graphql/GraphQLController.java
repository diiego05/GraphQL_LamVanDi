package vn.iotstar.graphql;

import vn.iotstar.entity.*;
import vn.iotstar.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.graphql.data.method.annotation.*;
import org.springframework.stereotype.Controller;

import java.util.List;

@Controller
@RequiredArgsConstructor
public class GraphQLController {
    private final ProductRepository productRepo;
    private final UserRepository userRepo;
    private final CategoryRepository categoryRepo;

    // ================== QUERY ==================

    @QueryMapping
    public List<Product> allProductsSorted() {
        return productRepo.findAllByOrderByPriceAsc();
    }

    @QueryMapping
    public List<Product> allProducts() {
        return productRepo.findAll();
    }

    @QueryMapping
    public List<User> allUsers() {
        return userRepo.findAll();
    }

    @QueryMapping
    public User userById(@Argument Long id) {
        return userRepo.findById(id).orElse(null);
    }

    @QueryMapping
    public List<Category> allCategories() {
        return categoryRepo.findAll();
    }

    @QueryMapping
    public Category categoryById(@Argument Long id) {
        return categoryRepo.findById(id).orElse(null);
    }
    @QueryMapping
    public List<Product> productsByCategory(@Argument Long categoryId) {
        return productRepo.findByUser_Category_Id(categoryId);
    }

    // ================== MUTATION USER ==================

    @MutationMapping
    public User createUser(@Argument String fullname,
                           @Argument String email,
                           @Argument String phone) {
        User u = new User();
        u.setFullname(fullname);
        u.setEmail(email);
        u.setPhone(phone);
        u.setPassword("123456"); // default

        return userRepo.save(u);
    }

    @MutationMapping
    public User updateUser(
            @Argument Long id,
            @Argument String fullname,
            @Argument String email,
            @Argument String phone,
            @Argument Long categoryId) {

        User u = userRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (fullname != null) u.setFullname(fullname);
        if (email != null) u.setEmail(email);
        if (phone != null) u.setPhone(phone);

        if (categoryId != null) {
            Category c = categoryRepo.findById(categoryId)
                    .orElseThrow(() -> new RuntimeException("Category not found"));
            u.setCategory(c);
        }

        return userRepo.save(u);
    }

    @MutationMapping
    public Boolean deleteUser(@Argument Long id) {
        if (!userRepo.existsById(id)) return false;
        userRepo.deleteById(id);
        return true;
    }

    // ================== MUTATION CATEGORY ==================

    @MutationMapping
    public Category createCategory(@Argument String name, @Argument String images) {
        Category category = new Category();
        category.setName(name);
        category.setImages(images);
        return categoryRepo.save(category);
    }

    @MutationMapping
    public Category updateCategory(@Argument Long id, @Argument String name, @Argument String images) {
        Category c = categoryRepo.findById(id).orElseThrow(() -> new RuntimeException("Category not found"));
        if (name != null) c.setName(name);
        if (images != null) c.setImages(images);
        return categoryRepo.save(c);
    }

    @MutationMapping
    public Boolean deleteCategory(@Argument Long id) {
        if (!categoryRepo.existsById(id)) return false;
        categoryRepo.deleteById(id);
        return true;
    }

    // ================== MUTATION PRODUCT ==================

    @MutationMapping
    public Product createProduct(
            @Argument String title,
            @Argument Integer quantity,
            @Argument String desc,
            @Argument Double price,
            @Argument Long userId) {

        User u = userRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Product p = new Product();
        p.setTitle(title);
        p.setQuantity(quantity);
        p.setDesc(desc);
        p.setPrice(price);
        p.setUser(u);

        return productRepo.save(p);
    }

    @MutationMapping
    public Product updateProduct(@Argument Long id, @Argument String title, @Argument Integer quantity,
                                 @Argument String desc, @Argument Double price, @Argument Long userId) {
        Product p = productRepo.findById(id).orElseThrow(() -> new RuntimeException("Product not found"));
        if (title != null) p.setTitle(title);
        if (quantity != null) p.setQuantity(quantity);
        if (desc != null) p.setDesc(desc);
        if (price != null) p.setPrice(price);
        if (userId != null) {
            User u = userRepo.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
            p.setUser(u);
        }
        return productRepo.save(p);
    }

    @MutationMapping
    public Boolean deleteProduct(@Argument Long id) {
        if (!productRepo.existsById(id)) return false;
        productRepo.deleteById(id);
        return true;
    }
}
