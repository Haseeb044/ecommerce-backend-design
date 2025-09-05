package com.ecommerce.ecommerceapp.controller;


import com.ecommerce.ecommerceapp.entity.Product;
import com.ecommerce.ecommerceapp.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;


@Controller
public class PageController {

    @Autowired
    private ProductService productService;

    @GetMapping("/")
    public String home(Model model) {
        model.addAttribute("featuredProducts", productService.getFeaturedProducts());
        return "home";
    }

    @GetMapping("/products")
    public String products(Model model, @RequestParam(required = false) String search) {
        List<Product> products;
        if (search != null && !search.isEmpty()) {
            products = productService.searchProducts(search);
            model.addAttribute("searchQuery", search);
        } else {
            products = productService.getAllProducts();
        }
        model.addAttribute("products", products);
        return "products";
    }
    @GetMapping("/products/{id}")
    public String productDetails(@PathVariable Integer id, Model model) {
        Optional<Product> product = productService.getProductById(id);

        if (product.isPresent()) {
            model.addAttribute("product", product.get());
            return "productDetail";
        } else {
            return "productNotFound";
        }
    }

}
