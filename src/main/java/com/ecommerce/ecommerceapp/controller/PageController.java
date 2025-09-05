package com.ecommerce.ecommerceapp.controller;

import com.ecommerce.ecommerceapp.entity.Product;
import com.ecommerce.ecommerceapp.service.ProductService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@Controller
public class PageController {

    @Autowired
    ProductService productService;

    @GetMapping("/admin/add-product")
    @PreAuthorize("hasAuthority('ADMIN')")
    public String showAddProductForm(Model model) {
        model.addAttribute("product", new Product());
        return "add";
    }

    @PostMapping("/admin/add-product")
    @PreAuthorize("hasAuthority('ADMIN')")
    public String addProduct(@Valid @ModelAttribute Product product, BindingResult result, Model model) {
        if (result.hasErrors()) {
            return "add";
        }
        productService.addProduct(product);
        return "redirect:/products";
    }

    @GetMapping("/")
    public String home(Model model) {
        model.addAttribute("featuredProducts", productService.getFeaturedProducts());
        return "home";
    }

    @GetMapping("/products")
    public String products(Model model,
                           @RequestParam(required = false) String search,
                           @RequestParam(defaultValue = "0") int page,
                           @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Product> productPage;
        if (search != null && !search.isEmpty()) {
            productPage = Page.empty(); // Search pagination to be implemented
            model.addAttribute("searchQuery", search);
        } else {
            productPage = productService.getAllProducts(pageable);
        }
        model.addAttribute("products", productPage.getContent());
        model.addAttribute("currentPage", productPage.getNumber());
        model.addAttribute("totalPages", productPage.getTotalPages());
        model.addAttribute("totalItems", productPage.getTotalElements());
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