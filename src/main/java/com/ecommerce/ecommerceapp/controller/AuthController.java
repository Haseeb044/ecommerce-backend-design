package com.ecommerce.ecommerceapp.controller;

import com.ecommerce.ecommerceapp.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

@Controller
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }
    @GetMapping("/login")
    public String showLoginPage(Model model) {
        model.addAttribute("authRequest", new AuthRequest());
        return "login";
    }
    @GetMapping("/signup")
    public String showSignupPage(Model model) {
        model.addAttribute("authRequest", new AuthRequest());
        return "signup";
    }
    @PostMapping("/login")
    public String login(@ModelAttribute AuthRequest authRequest, Model model) {
        try {
            String token = authService.login(authRequest.getUsername(), authRequest.getPassword());
            model.addAttribute("token", token);
            return "redirect:/products"; // Redirect to product listing page
        } catch (RuntimeException e) {
            model.addAttribute("error", "Invalid credentials");
            return "login";
        }
    }
    @PostMapping("/signup")
    public String signup(@ModelAttribute AuthRequest authRequest, Model model) {
        try {
            String token = authService.signup(authRequest.getUsername(), authRequest.getPassword(), "USER");
            model.addAttribute("token", token);
            return "redirect:/products"; // Redirect to product listing page
        } catch (RuntimeException e) {
            model.addAttribute("error", "Username already exists");
            return "signup";
        }
    }
    @PostMapping("/api/login")
    public ResponseEntity<String> apiLogin(@RequestBody AuthRequest authRequest) {
        String token = authService.login(authRequest.getUsername(), authRequest.getPassword());
        return ResponseEntity.ok(token);
    }

    @PostMapping("/api/signup")
    public ResponseEntity<String> apiSignup(@RequestBody AuthRequest authRequest) {
        String token = authService.signup(authRequest.getUsername(), authRequest.getPassword(), "USER");
        return ResponseEntity.ok(token);
    }
}

class AuthRequest {
    private String username;
    private String password;

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}