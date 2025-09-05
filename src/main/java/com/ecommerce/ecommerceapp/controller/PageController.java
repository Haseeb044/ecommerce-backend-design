package com.ecommerce.ecommerceapp.controller;


import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;


@Controller
public class PageController {

    @GetMapping("/")
    private String home(){
        return "home";
    }
    @GetMapping("/products")
    private String products(){
        return "products";
    }
    @GetMapping("/products/{id}")
    public String productDetails(@PathVariable Long id) {
        return "productDetail";
    }

}
