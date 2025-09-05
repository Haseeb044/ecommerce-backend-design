package com.ecommerce.ecommerceapp.service;

import com.ecommerce.ecommerceapp.entity.Product;
import com.ecommerce.ecommerceapp.repository.ProductRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ProductService {
    private static final Logger logger = LoggerFactory.getLogger(ProductService.class);

    private final ProductRepository repository;

    public ProductService(ProductRepository repository) {
        this.repository = repository;
    }

    public Page<Product> getAllProducts(Pageable pageable) {
        Page<Product> products = repository.findAll(pageable);
        logger.debug("Fetched paginated products: {}", products.getContent());
        return products;
    }

    public Optional<Product> getProductById(Integer id) {
        return repository.findById(id);
    }

    public List<Product> getFeaturedProducts() {
        List<Product> products = repository.findFeaturedProducts();
        if (products.size() > 10) {
            return products.subList(0, 10);
        } else {
            return products;
        }
    }

    public List<Product> searchProducts(String keyword) {
        return repository.searchByNameOrCategory(keyword);
    }

    public List<Product> getProductsByCategory(String category) {
        return repository.findByCategory(category);
    }

    public Product addProduct(Product product) {
        logger.debug("Adding product: {}", product);
        return repository.save(product);
    }
}