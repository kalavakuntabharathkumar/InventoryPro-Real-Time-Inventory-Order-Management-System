package com.inventorypro.dto;

import lombok.Data;

import java.util.List;

@Data
public class DashboardDto {
    private long totalProducts;
    private long totalCategories;
    private long totalOrders;
    private long pendingOrders;
    private long lowStockCount;
    private List<ProductDto> lowStockProducts;
    private List<OrderDto> recentOrders;
}
