package com.inventorypro.service;

import com.inventorypro.dto.UserDto;
import com.inventorypro.entity.User;
import com.inventorypro.exception.BadRequestException;
import com.inventorypro.exception.ResourceNotFoundException;
import com.inventorypro.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private UserService userService;

    private User sampleUser;

    @BeforeEach
    void setUp() {
        sampleUser = new User();
        sampleUser.setId(1L);
        sampleUser.setUsername("johndoe");
        sampleUser.setPassword("$2a$10$hashedPassword");
        sampleUser.setEmail("john@example.com");
        sampleUser.setFullName("John Doe");
        sampleUser.setRole(User.Role.STAFF);
        sampleUser.setActive(true);
    }

    @Test
    void getAllUsers_returnsAllUsers() {
        when(userRepository.findAll()).thenReturn(List.of(sampleUser));

        List<UserDto> result = userService.getAllUsers();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getUsername()).isEqualTo("johndoe");
        assertThat(result.get(0).getPassword()).isNull();
    }

    @Test
    void createUser_duplicateUsername_throwsBadRequestException() {
        UserDto dto = new UserDto();
        dto.setUsername("johndoe");
        dto.setPassword("password123");
        dto.setFullName("Jane Doe");
        dto.setEmail("jane@example.com");

        when(userRepository.existsByUsername("johndoe")).thenReturn(true);

        assertThatThrownBy(() -> userService.createUser(dto))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("johndoe");
    }

    @Test
    void createUser_validDto_encodesPasswordAndSaves() {
        UserDto dto = new UserDto();
        dto.setUsername("newuser");
        dto.setPassword("secure123");
        dto.setFullName("New User");
        dto.setEmail("newuser@example.com");
        dto.setRole(User.Role.STAFF);

        User saved = new User();
        saved.setId(2L);
        saved.setUsername("newuser");
        saved.setPassword("$2a$10$encoded");
        saved.setFullName("New User");
        saved.setEmail("newuser@example.com");
        saved.setRole(User.Role.STAFF);
        saved.setActive(true);

        when(userRepository.existsByUsername("newuser")).thenReturn(false);
        when(userRepository.existsByEmail("newuser@example.com")).thenReturn(false);
        when(passwordEncoder.encode("secure123")).thenReturn("$2a$10$encoded");
        when(userRepository.save(any(User.class))).thenReturn(saved);

        UserDto result = userService.createUser(dto);

        assertThat(result.getId()).isEqualTo(2L);
        assertThat(result.getUsername()).isEqualTo("newuser");
        verify(passwordEncoder, times(1)).encode("secure123");
        verify(userRepository, times(1)).save(any(User.class));
    }

    @Test
    void getUserById_nonExistentUser_throwsResourceNotFoundException() {
        when(userRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> userService.getUserById(999L))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void toggleUserStatus_activeUser_deactivatesUser() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(sampleUser));
        when(userRepository.save(any(User.class))).thenReturn(sampleUser);

        userService.toggleUserStatus(1L);

        verify(userRepository, times(1)).save(argThat(u -> !u.isActive()));
    }

    @Test
    void createUser_duplicateEmail_throwsBadRequestException() {
        UserDto dto = new UserDto();
        dto.setUsername("uniqueuser");
        dto.setPassword("pass123");
        dto.setFullName("Someone");
        dto.setEmail("john@example.com");

        when(userRepository.existsByUsername("uniqueuser")).thenReturn(false);
        when(userRepository.existsByEmail("john@example.com")).thenReturn(true);

        assertThatThrownBy(() -> userService.createUser(dto))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("john@example.com");
    }
}
