package com.ecommerce.ecommerceapp.service;

import com.ecommerce.ecommerceapp.config.JwtUtil;
import com.ecommerce.ecommerceapp.entity.User;
import com.ecommerce.ecommerceapp.repository.UserRepository;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;

    public AuthService(UserRepository userRepository, JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.jwtUtil = jwtUtil;
    }

    public String login(String username, String password) {
        User user = userRepository.findByUsername(username);
        if (user != null && user.getPassword().equals(password)) {
            return jwtUtil.generateToken(username, user.getRole());
        }
        throw new RuntimeException("Invalid credentials");
    }

    public String signup(String username, String password, String role) {
        User existingUser = userRepository.findByUsername(username);
        if (existingUser != null) {
            throw new RuntimeException("Username already exists");
        }
        User user = new User();
        user.setUsername(username);
        user.setPassword(password);
        user.setRole(role);
        userRepository.save(user);
        return jwtUtil.generateToken(username, role);
    }
}