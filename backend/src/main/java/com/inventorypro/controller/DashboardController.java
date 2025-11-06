package com.inventorypro.controller;

import com.inventorypro.dto.DashboardDto;
import com.inventorypro.entity.Order;
import com.inventorypro.repository.CategoryRepository;
import com.inventorypro.repository.ProductRepository;
import com.inventorypro.service.OrderService;
import com.inventorypro.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    @Autowired
    private ProductService productService;

    @Autowired
    private OrderService orderService;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @GetMapping
    public ResponseEntity<DashboardDto> getDashboard() {
        DashboardDto dashboard = new DashboardDto();
        dashboard.setTotalProducts(productRepository.count());
        dashboard.setTotalCategories(categoryRepository.count());
        dashboard.setTotalOrders(orderService.countByStatus(Order.OrderStatus.PENDING)
                + orderService.countByStatus(Order.OrderStatus.PROCESSING)
                + orderService.countByStatus(Order.OrderStatus.SHIPPED)
                + orderService.countByStatus(Order.OrderStatus.DELIVERED)
                + orderService.countByStatus(Order.OrderStatus.CANCELLED));
        dashboard.setPendingOrders(orderService.countByStatus(Order.OrderStatus.PENDING));
        dashboard.setLowStockCount(productService.countLowStockProducts());
        dashboard.setLowStockProducts(productService.getLowStockProducts());
        dashboard.setRecentOrders(orderService.getRecentOrders(5));
        return ResponseEntity.ok(dashboard);
    }
}
