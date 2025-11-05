package com.inventorypro.service;

import com.inventorypro.dto.CategoryDto;
import com.inventorypro.entity.Category;
import com.inventorypro.exception.BadRequestException;
import com.inventorypro.exception.ResourceNotFoundException;
import com.inventorypro.repository.CategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class CategoryService {

    @Autowired
    private CategoryRepository categoryRepository;

    public List<CategoryDto> getAllCategories() {
        return categoryRepository.findAll().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public CategoryDto getCategoryById(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category", id));
        return toDto(category);
    }

    public CategoryDto createCategory(CategoryDto dto) {
        if (categoryRepository.existsByName(dto.getName())) {
            throw new BadRequestException("Category with name '" + dto.getName() + "' already exists");
        }
        Category category = new Category();
        category.setName(dto.getName());
        category.setDescription(dto.getDescription());
        return toDto(categoryRepository.save(category));
    }

    public CategoryDto updateCategory(Long id, CategoryDto dto) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category", id));
        if (!category.getName().equals(dto.getName()) && categoryRepository.existsByName(dto.getName())) {
            throw new BadRequestException("Category with name '" + dto.getName() + "' already exists");
        }
        category.setName(dto.getName());
        category.setDescription(dto.getDescription());
        return toDto(categoryRepository.save(category));
    }

    public void deleteCategory(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category", id));
        if (!category.getProducts().isEmpty()) {
            throw new BadRequestException("Cannot delete category with existing products");
        }
        categoryRepository.delete(category);
    }

    private CategoryDto toDto(Category category) {
        CategoryDto dto = new CategoryDto();
        dto.setId(category.getId());
        dto.setName(category.getName());
        dto.setDescription(category.getDescription());
        dto.setProductCount(category.getProducts() != null ? category.getProducts().size() : 0);
        return dto;
    }
}
