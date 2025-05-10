package com.skillscape.backend_new.service;

import com.skillscape.backend_new.model.UserEntity;
import com.skillscape.backend_new.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;

@Service
public class UserService implements UserDetailsService { 

    @Autowired
    private UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        UserEntity userEntity = userRepository.findByEmail(email) // Changed to findByEmail
                .orElseThrow(() -> new UsernameNotFoundException("User Not Found with email: " + email));

        return new User(userEntity.getEmail(), userEntity.getPassword(), new ArrayList<>());
    }

}