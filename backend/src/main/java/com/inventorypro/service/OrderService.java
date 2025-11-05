package com.inventorypro.service;

import com.inventorypro.dto.OrderDto;
import com.inventorypro.dto.OrderItemDto;
import com.inventorypro.entity.Order;
import com.inventorypro.entity.OrderItem;
import com.inventorypro.entity.Product;
import com.inventorypro.exception.BadRequestException;
import com.inventorypro.exception.ResourceNotFoundException;
import com.inventorypro.repository.OrderRepository;
import com.inventorypro.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private ProductRepository productRepository;

    public List<OrderDto> getAllOrders() {
        return orderRepository.findAll().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public OrderDto getOrderById(Long id) {
        return toDto(orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order", id)));
    }

    public List<OrderDto> getRecentOrders(int limit) {
        return orderRepository.findRecentOrders(PageRequest.of(0, limit)).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public List<OrderDto> getOrdersByStatus(Order.OrderStatus status) {
        return orderRepository.findByStatus(status).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public OrderDto createOrder(OrderDto dto) {
        Order order = new Order();
        order.setCustomerName(dto.getCustomerName());
        order.setCustomerEmail(dto.getCustomerEmail());
        order.setNotes(dto.getNotes());
        order.setStatus(Order.OrderStatus.PENDING);

        List<OrderItem> items = new ArrayList<>();
        if (dto.getItems() != null) {
            for (OrderItemDto itemDto : dto.getItems()) {
                Product product = productRepository.findById(itemDto.getProductId())
                        .orElseThrow(() -> new ResourceNotFoundException("Product", itemDto.getProductId()));

                if (product.getQuantity() < itemDto.getQuantity()) {
                    throw new BadRequestException("Insufficient stock for product: " + product.getName()
                            + ". Available: " + product.getQuantity());
                }

                OrderItem item = new OrderItem();
                item.setOrder(order);
                item.setProduct(product);
                item.setQuantity(itemDto.getQuantity());
                item.setUnitPrice(product.getPrice());

                product.setQuantity(product.getQuantity() - itemDto.getQuantity());
                productRepository.save(product);

                items.add(item);
            }
        }
        order.setItems(items);
        order.recalculateTotal();

        return toDto(orderRepository.save(order));
    }

    public OrderDto updateOrderStatus(Long id, Order.OrderStatus status) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order", id));

        if (order.getStatus() == Order.OrderStatus.CANCELLED) {
            throw new BadRequestException("Cannot update a cancelled order");
        }
        if (order.getStatus() == Order.OrderStatus.DELIVERED && status != Order.OrderStatus.DELIVERED) {
            throw new BadRequestException("Cannot change status of a delivered order");
        }

        order.setStatus(status);
        return toDto(orderRepository.save(order));
    }

    public void cancelOrder(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order", id));

        if (order.getStatus() == Order.OrderStatus.DELIVERED) {
            throw new BadRequestException("Cannot cancel a delivered order");
        }
        if (order.getStatus() == Order.OrderStatus.CANCELLED) {
            throw new BadRequestException("Order is already cancelled");
        }

        for (OrderItem item : order.getItems()) {
            Product product = item.getProduct();
            product.setQuantity(product.getQuantity() + item.getQuantity());
            productRepository.save(product);
        }

        order.setStatus(Order.OrderStatus.CANCELLED);
        orderRepository.save(order);
    }

    public long countByStatus(Order.OrderStatus status) {
        return orderRepository.countByStatus(status);
    }

    public OrderDto toDto(Order order) {
        OrderDto dto = new OrderDto();
        dto.setId(order.getId());
        dto.setOrderNumber(order.getOrderNumber());
        dto.setCustomerName(order.getCustomerName());
        dto.setCustomerEmail(order.getCustomerEmail());
        dto.setStatus(order.getStatus());
        dto.setTotalAmount(order.getTotalAmount());
        dto.setNotes(order.getNotes());
        dto.setCreatedAt(order.getCreatedAt());
        dto.setUpdatedAt(order.getUpdatedAt());

        if (order.getItems() != null) {
            dto.setItems(order.getItems().stream().map(item -> {
                OrderItemDto itemDto = new OrderItemDto();
                itemDto.setId(item.getId());
                itemDto.setProductId(item.getProduct().getId());
                itemDto.setProductName(item.getProduct().getName());
                itemDto.setProductSku(item.getProduct().getSku());
                itemDto.setQuantity(item.getQuantity());
                itemDto.setUnitPrice(item.getUnitPrice());
                itemDto.setSubtotal(item.getSubtotal());
                return itemDto;
            }).collect(Collectors.toList()));
        }

        return dto;
    }
}
