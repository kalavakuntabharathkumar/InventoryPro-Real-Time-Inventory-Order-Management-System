package com.inventorypro.service;

import com.inventorypro.dto.OrderDto;
import com.inventorypro.dto.OrderItemDto;
import com.inventorypro.entity.Order;
import com.inventorypro.entity.Product;
import com.inventorypro.exception.BadRequestException;
import com.inventorypro.exception.ResourceNotFoundException;
import com.inventorypro.repository.OrderRepository;
import com.inventorypro.repository.ProductRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OrderServiceTest {

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private ProductRepository productRepository;

    @InjectMocks
    private OrderService orderService;

    private Product sampleProduct;

    @BeforeEach
    void setUp() {
        sampleProduct = new Product();
        sampleProduct.setId(1L);
        sampleProduct.setName("Test Product");
        sampleProduct.setSku("TST-001");
        sampleProduct.setPrice(new BigDecimal("99.99"));
        sampleProduct.setQuantity(50);
        sampleProduct.setLowStockThreshold(5);
    }

    @Test
    void createOrder_sufficientStock_savesOrderAndDeductsQuantity() {
        OrderItemDto itemDto = new OrderItemDto();
        itemDto.setProductId(1L);
        itemDto.setQuantity(5);

        OrderDto orderDto = new OrderDto();
        orderDto.setCustomerName("Test Customer");
        orderDto.setCustomerEmail("customer@test.com");
        orderDto.setItems(List.of(itemDto));

        Order savedOrder = new Order();
        savedOrder.setId(10L);
        savedOrder.setOrderNumber("ORD-TEST");
        savedOrder.setCustomerName("Test Customer");
        savedOrder.setStatus(Order.OrderStatus.PENDING);
        savedOrder.setTotalAmount(new BigDecimal("499.95"));
        savedOrder.setItems(new ArrayList<>());

        when(productRepository.findById(1L)).thenReturn(Optional.of(sampleProduct));
        when(productRepository.save(any(Product.class))).thenReturn(sampleProduct);
        when(orderRepository.save(any(Order.class))).thenReturn(savedOrder);

        OrderDto result = orderService.createOrder(orderDto);

        assertThat(result.getId()).isEqualTo(10L);
        assertThat(result.getCustomerName()).isEqualTo("Test Customer");
        verify(productRepository, atLeastOnce()).save(any(Product.class));
        verify(orderRepository, times(1)).save(any(Order.class));
    }

    @Test
    void createOrder_insufficientStock_throwsBadRequestException() {
        OrderItemDto itemDto = new OrderItemDto();
        itemDto.setProductId(1L);
        itemDto.setQuantity(100);

        OrderDto orderDto = new OrderDto();
        orderDto.setCustomerName("Test Customer");
        orderDto.setItems(List.of(itemDto));

        when(productRepository.findById(1L)).thenReturn(Optional.of(sampleProduct));

        assertThatThrownBy(() -> orderService.createOrder(orderDto))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Insufficient stock");
    }

    @Test
    void updateOrderStatus_cancelledOrder_throwsBadRequestException() {
        Order cancelledOrder = new Order();
        cancelledOrder.setId(1L);
        cancelledOrder.setStatus(Order.OrderStatus.CANCELLED);
        cancelledOrder.setItems(new ArrayList<>());

        when(orderRepository.findById(1L)).thenReturn(Optional.of(cancelledOrder));

        assertThatThrownBy(() -> orderService.updateOrderStatus(1L, Order.OrderStatus.PENDING))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("cancelled");
    }

    @Test
    void updateOrderStatus_validTransition_updatesStatus() {
        Order pendingOrder = new Order();
        pendingOrder.setId(1L);
        pendingOrder.setStatus(Order.OrderStatus.PENDING);
        pendingOrder.setItems(new ArrayList<>());

        Order processingOrder = new Order();
        processingOrder.setId(1L);
        processingOrder.setStatus(Order.OrderStatus.PROCESSING);
        processingOrder.setItems(new ArrayList<>());

        when(orderRepository.findById(1L)).thenReturn(Optional.of(pendingOrder));
        when(orderRepository.save(any(Order.class))).thenReturn(processingOrder);

        OrderDto result = orderService.updateOrderStatus(1L, Order.OrderStatus.PROCESSING);

        assertThat(result.getStatus()).isEqualTo(Order.OrderStatus.PROCESSING);
    }

    @Test
    void getOrderById_nonExistent_throwsResourceNotFoundException() {
        when(orderRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> orderService.getOrderById(999L))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void cancelOrder_deliveredOrder_throwsBadRequestException() {
        Order deliveredOrder = new Order();
        deliveredOrder.setId(1L);
        deliveredOrder.setStatus(Order.OrderStatus.DELIVERED);
        deliveredOrder.setItems(new ArrayList<>());

        when(orderRepository.findById(1L)).thenReturn(Optional.of(deliveredOrder));

        assertThatThrownBy(() -> orderService.cancelOrder(1L))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("delivered");
    }
}
