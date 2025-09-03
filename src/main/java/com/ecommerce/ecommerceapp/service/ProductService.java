package com.ecommerce.ecommerceapp.service;

import com.ecommerce.ecommerceapp.entity.Product;
import com.ecommerce.ecommerceapp.repository.ProductRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ProductService {
    private static final Logger logger = LoggerFactory.getLogger(ProductService.class);

    @Autowired
    private ProductRepository repository;

    public List<Product> getAllProducts() {
        List<Product> products = repository.findAll();
        logger.debug("Fetched all products: {}", products);
        return products;
    }

    public Optional<Product> getProductById(Integer id) {
        return repository.findById(id);
    }

    public List<Product> getFeaturedProducts() {
        List<Product> products = repository.findFeaturedProducts();
        logger.debug("Fetched featured products: {}", products);
        return products.size() <= 7 ? products : products.subList(0, 7);
    }

    public List<Product> searchProducts(String keyword) {
        return repository.searchByNameOrCategory(keyword);
    }

    public List<Product> getProductsByCategory(String category) {
        return repository.findByCategory(category);
    }
}