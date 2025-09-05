package com.ecommerce.ecommerceapp.repository;

import com.ecommerce.ecommerceapp.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Long> {
    User findByUsername(String username);
}