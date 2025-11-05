package com.inventorypro.service;

import com.inventorypro.dto.ProductDto;
import com.inventorypro.entity.Category;
import com.inventorypro.entity.Product;
import com.inventorypro.exception.BadRequestException;
import com.inventorypro.exception.ResourceNotFoundException;
import com.inventorypro.repository.CategoryRepository;
import com.inventorypro.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class ProductService {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    public List<ProductDto> getAllProducts() {
        return productRepository.findAll().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public ProductDto getProductById(Long id) {
        return toDto(productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", id)));
    }

    public List<ProductDto> searchProducts(String name) {
        return productRepository.findByNameContainingIgnoreCase(name).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public List<ProductDto> getProductsByCategory(Long categoryId) {
        return productRepository.findByCategoryId(categoryId).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public List<ProductDto> getLowStockProducts() {
        return productRepository.findLowStockProducts().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public long countLowStockProducts() {
        return productRepository.countLowStockProducts();
    }

    public ProductDto createProduct(ProductDto dto) {
        if (dto.getSku() != null && !dto.getSku().isBlank()
                && productRepository.existsBySku(dto.getSku())) {
            throw new BadRequestException("Product with SKU '" + dto.getSku() + "' already exists");
        }
        Product product = fromDto(dto);
        return toDto(productRepository.save(product));
    }

    public ProductDto updateProduct(Long id, ProductDto dto) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", id));

        if (dto.getSku() != null && !dto.getSku().isBlank()
                && !dto.getSku().equals(product.getSku())
                && productRepository.existsBySku(dto.getSku())) {
            throw new BadRequestException("Product with SKU '" + dto.getSku() + "' already exists");
        }

        product.setName(dto.getName());
        product.setDescription(dto.getDescription());
        product.setPrice(dto.getPrice());
        product.setQuantity(dto.getQuantity());
        product.setLowStockThreshold(dto.getLowStockThreshold());
        if (dto.getSku() != null && !dto.getSku().isBlank()) {
            product.setSku(dto.getSku());
        }
        if (dto.getCategoryId() != null) {
            Category category = categoryRepository.findById(dto.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category", dto.getCategoryId()));
            product.setCategory(category);
        } else {
            product.setCategory(null);
        }
        return toDto(productRepository.save(product));
    }

    public void deleteProduct(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", id));
        productRepository.delete(product);
    }

    public ProductDto toDto(Product product) {
        ProductDto dto = new ProductDto();
        dto.setId(product.getId());
        dto.setName(product.getName());
        dto.setSku(product.getSku());
        dto.setDescription(product.getDescription());
        dto.setPrice(product.getPrice());
        dto.setQuantity(product.getQuantity());
        dto.setLowStockThreshold(product.getLowStockThreshold());
        dto.setLowStock(product.isLowStock());
        if (product.getCategory() != null) {
            dto.setCategoryId(product.getCategory().getId());
            dto.setCategoryName(product.getCategory().getName());
        }
        return dto;
    }

    private Product fromDto(ProductDto dto) {
        Product product = new Product();
        product.setName(dto.getName());
        product.setSku(dto.getSku());
        product.setDescription(dto.getDescription());
        product.setPrice(dto.getPrice());
        product.setQuantity(dto.getQuantity());
        product.setLowStockThreshold(dto.getLowStockThreshold() != null ? dto.getLowStockThreshold() : 10);
        if (dto.getCategoryId() != null) {
            Category category = categoryRepository.findById(dto.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category", dto.getCategoryId()));
            product.setCategory(category);
        }
        return product;
    }
}
