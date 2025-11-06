package com.inventorypro.service;

import com.inventorypro.dto.ProductDto;
import com.inventorypro.entity.Product;
import com.inventorypro.exception.BadRequestException;
import com.inventorypro.exception.ResourceNotFoundException;
import com.inventorypro.repository.CategoryRepository;
import com.inventorypro.repository.ProductRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProductServiceTest {

    @Mock
    private ProductRepository productRepository;

    @Mock
    private CategoryRepository categoryRepository;

    @InjectMocks
    private ProductService productService;

    private Product sampleProduct;

    @BeforeEach
    void setUp() {
        sampleProduct = new Product();
        sampleProduct.setId(1L);
        sampleProduct.setName("Test Laptop");
        sampleProduct.setSku("ELEC-TST-001");
        sampleProduct.setPrice(new BigDecimal("999.99"));
        sampleProduct.setQuantity(20);
        sampleProduct.setLowStockThreshold(5);
    }

    @Test
    void getAllProducts_returnsAllProducts() {
        when(productRepository.findAll()).thenReturn(List.of(sampleProduct));

        List<ProductDto> result = productService.getAllProducts();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getName()).isEqualTo("Test Laptop");
        assertThat(result.get(0).getSku()).isEqualTo("ELEC-TST-001");
    }

    @Test
    void getProductById_existingProduct_returnsProductDto() {
        when(productRepository.findById(1L)).thenReturn(Optional.of(sampleProduct));

        ProductDto result = productService.getProductById(1L);

        assertThat(result.getId()).isEqualTo(1L);
        assertThat(result.getName()).isEqualTo("Test Laptop");
        assertThat(result.getPrice()).isEqualByComparingTo(new BigDecimal("999.99"));
    }

    @Test
    void getProductById_nonExistentProduct_throwsResourceNotFoundException() {
        when(productRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> productService.getProductById(999L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("999");
    }

    @Test
    void createProduct_duplicateSku_throwsBadRequestException() {
        ProductDto dto = new ProductDto();
        dto.setName("Another Product");
        dto.setSku("ELEC-TST-001");
        dto.setPrice(new BigDecimal("199.99"));
        dto.setQuantity(10);

        when(productRepository.existsBySku("ELEC-TST-001")).thenReturn(true);

        assertThatThrownBy(() -> productService.createProduct(dto))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("ELEC-TST-001");
    }

    @Test
    void createProduct_validDto_savesAndReturnsDto() {
        ProductDto dto = new ProductDto();
        dto.setName("New Product");
        dto.setSku("ELEC-NEW-001");
        dto.setPrice(new BigDecimal("299.99"));
        dto.setQuantity(15);
        dto.setLowStockThreshold(3);

        Product saved = new Product();
        saved.setId(2L);
        saved.setName(dto.getName());
        saved.setSku(dto.getSku());
        saved.setPrice(dto.getPrice());
        saved.setQuantity(dto.getQuantity());
        saved.setLowStockThreshold(dto.getLowStockThreshold());

        when(productRepository.existsBySku("ELEC-NEW-001")).thenReturn(false);
        when(productRepository.save(any(Product.class))).thenReturn(saved);

        ProductDto result = productService.createProduct(dto);

        assertThat(result.getId()).isEqualTo(2L);
        assertThat(result.getName()).isEqualTo("New Product");
        verify(productRepository, times(1)).save(any(Product.class));
    }

    @Test
    void getLowStockProducts_returnsOnlyLowStockItems() {
        Product lowStock = new Product();
        lowStock.setId(3L);
        lowStock.setName("Low Stock Item");
        lowStock.setQuantity(2);
        lowStock.setLowStockThreshold(5);
        lowStock.setPrice(new BigDecimal("49.99"));

        when(productRepository.findLowStockProducts()).thenReturn(List.of(lowStock));

        List<ProductDto> result = productService.getLowStockProducts();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).isLowStock()).isTrue();
    }

    @Test
    void deleteProduct_nonExistentProduct_throwsResourceNotFoundException() {
        when(productRepository.findById(404L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> productService.deleteProduct(404L))
                .isInstanceOf(ResourceNotFoundException.class);
    }
}
