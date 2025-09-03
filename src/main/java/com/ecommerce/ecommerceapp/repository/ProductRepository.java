package com.ecommerce.ecommerceapp.repository;

import com.ecommerce.ecommerceapp.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Integer> {
    @Query("SELECT p FROM Product p WHERE LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(p.category) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<Product> searchByNameOrCategory(@Param("keyword") String keyword);

    @Query("SELECT p FROM Product p WHERE p.stock > 0")
    List<Product> findFeaturedProducts();

    List<Product> findByCategory(String category);
}