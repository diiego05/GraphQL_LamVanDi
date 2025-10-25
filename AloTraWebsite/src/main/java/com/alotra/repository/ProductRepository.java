package com.alotra.repository;

import com.alotra.dto.ProductSummaryDTO;
import com.alotra.entity.Product;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    // Thêm phương thức này:
    @Query("SELECT p FROM Product p " +
           "LEFT JOIN FETCH p.media " +
           "LEFT JOIN FETCH p.variants v " +
           "LEFT JOIN FETCH v.size")
    List<Product> findAllWithDetails();

    // Phương thức cho chức năng tìm kiếm ở trang admin
    List<Product> findByNameContainingIgnoreCase(String name);

    @Query("SELECT v.product FROM ProductVariant v WHERE v.id = :variantId")
    Optional<Product> findProductByVariantId(Long variantId);


    // TÌM SẢN PHẨM CÓ TRẠNG THÁI "ACTIVE"
    List<Product> findAllByStatus(String status);

    // TÌM SẢN PHẨM THEO TRẠNG THÁI VÀ SLUG CỦA DANH MỤC
    List<Product> findAllByStatusAndCategory_Slug(String status, String categorySlug);

    Page<Product> findAllByStatus(String status, Pageable pageable);

    // SỬA LẠI: Trả về Page<Product> và nhận Pageable
    Page<Product> findAllByStatusAndCategory_Slug(String status, String categorySlug, Pageable pageable);

    List<Product> findByCategory_Id(Long categoryId);

    // 🟢 (Tuỳ chọn) Tìm theo tên hoặc từ khoá nếu cần




    @Query(value = """
    	    SELECT oi.ProductId, SUM(oi.Quantity)
    	    FROM OrderItems oi
    	    JOIN Orders o ON oi.OrderId = o.Id
    	    WHERE o.Status = 'COMPLETED'
    	    GROUP BY oi.ProductId
    	""", nativeQuery = true)
    	List<Object[]> findProductSalesCounts();




}
