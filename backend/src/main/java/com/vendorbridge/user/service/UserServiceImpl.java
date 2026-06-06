package com.vendorbridge.user.service;

import com.vendorbridge.shared.dto.PagedResponse;
import com.vendorbridge.shared.exceptions.ResourceNotFoundException;
import com.vendorbridge.user.dto.UpdateUserRequest;
import com.vendorbridge.user.dto.UserResponse;
import com.vendorbridge.user.entity.User;
import com.vendorbridge.user.mapper.UserMapper;
import com.vendorbridge.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<UserResponse> getAllUsers(String search, String role, Boolean active, Pageable pageable) {
        Page<User> usersPage = userRepository.findAll(pageable);
        return PagedResponse.from(usersPage.map(userMapper::toResponse));
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse getUserById(UUID id) {
        User user = findUserById(id);
        return userMapper.toResponse(user);
    }

    @Override
    @Transactional
    public UserResponse updateUser(UUID id, UpdateUserRequest request) {
        User user = findUserById(id);
        userMapper.updateEntity(request, user);
        user = userRepository.save(user);
        return userMapper.toResponse(user);
    }

    @Override
    @Transactional
    public void deleteUser(UUID id, boolean hardDelete) {
        User user = findUserById(id);
        if (hardDelete) {
            userRepository.delete(user);
        } else {
            user.setActive(false);
            userRepository.save(user);
        }
    }

    @Override
    @Transactional
    public UserResponse toggleActive(UUID id) {
        User user = findUserById(id);
        user.setActive(!user.isActive());
        user = userRepository.save(user);
        return userMapper.toResponse(user);
    }

    private User findUserById(UUID id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
    }
}
