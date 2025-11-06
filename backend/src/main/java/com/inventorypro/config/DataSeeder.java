package com.inventorypro.config;

import com.inventorypro.entity.*;
import com.inventorypro.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Configuration
public class DataSeeder {

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Bean
    CommandLineRunner seedData(UserRepository userRepo,
                               CategoryRepository categoryRepo,
                               ProductRepository productRepo,
                               OrderRepository orderRepo) {
        return args -> {
            if (userRepo.count() > 0) return;

            // --- Users ---
            User admin = new User();
            admin.setUsername("admin");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setEmail("admin@inventorypro.com");
            admin.setFullName("System Administrator");
            admin.setRole(User.Role.ADMIN);
            userRepo.save(admin);

            User staff = new User();
            staff.setUsername("staff");
            staff.setPassword(passwordEncoder.encode("staff123"));
            staff.setEmail("staff@inventorypro.com");
            staff.setFullName("Staff Member");
            staff.setRole(User.Role.STAFF);
            userRepo.save(staff);

            // --- Categories ---
            String[][] categories = {
                {"Electronics", "Electronic devices, components, and accessories"},
                {"Office Supplies", "Stationery, paper, and office essentials"},
                {"Furniture", "Desks, chairs, cabinets, and shelving"},
                {"Software", "Licenses and software subscriptions"},
                {"Networking", "Routers, switches, cables, and network hardware"},
                {"Tools & Hardware", "Hand tools, power tools, and hardware supplies"},
                {"Safety & PPE", "Personal protective equipment and safety gear"},
                {"Cleaning Supplies", "Cleaning chemicals, equipment, and consumables"}
            };

            List<Category> savedCategories = new ArrayList<>();
            for (String[] c : categories) {
                Category cat = new Category();
                cat.setName(c[0]);
                cat.setDescription(c[1]);
                savedCategories.add(categoryRepo.save(cat));
            }

            Category electronics = savedCategories.get(0);
            Category office = savedCategories.get(1);
            Category furniture = savedCategories.get(2);
            Category software = savedCategories.get(3);
            Category networking = savedCategories.get(4);
            Category tools = savedCategories.get(5);
            Category safety = savedCategories.get(6);
            Category cleaning = savedCategories.get(7);

            // --- Products (50+) ---
            Object[][] products = {
                // Electronics
                {"Dell Latitude 5540 Laptop", "ELEC-001", "14-inch business laptop, Intel i7, 16GB RAM", new BigDecimal("1249.99"), 25, 5, electronics},
                {"HP EliteBook 840 G9", "ELEC-002", "Enterprise-grade laptop with vPro", new BigDecimal("1399.00"), 18, 5, electronics},
                {"Apple MacBook Pro 14\"", "ELEC-003", "M3 Pro chip, 18GB unified memory", new BigDecimal("1999.00"), 10, 3, electronics},
                {"Samsung 27\" 4K Monitor", "ELEC-004", "IPS panel, USB-C, 60Hz", new BigDecimal("449.99"), 30, 8, electronics},
                {"LG UltraWide 34\" Monitor", "ELEC-005", "Curved IPS, 2560x1080", new BigDecimal("549.00"), 12, 4, electronics},
                {"Logitech MX Keys Keyboard", "ELEC-006", "Wireless multi-device keyboard", new BigDecimal("119.99"), 45, 10, electronics},
                {"Logitech MX Master 3 Mouse", "ELEC-007", "Ergonomic wireless mouse", new BigDecimal("99.99"), 50, 10, electronics},
                {"Sony WH-1000XM5 Headphones", "ELEC-008", "Noise-cancelling over-ear headphones", new BigDecimal("349.99"), 20, 5, electronics},
                {"Jabra Evolve2 85 Headset", "ELEC-009", "Professional ANC headset", new BigDecimal("449.00"), 8, 3, electronics},
                {"Anker 65W USB-C Charger", "ELEC-010", "Multi-port fast charger", new BigDecimal("39.99"), 75, 15, electronics},
                {"UPS APC 1500VA", "ELEC-011", "Uninterruptible power supply", new BigDecimal("229.99"), 15, 4, electronics},
                {"iPad Pro 12.9\" M2", "ELEC-012", "WiFi, 256GB, with Apple Pencil", new BigDecimal("1299.00"), 7, 3, electronics},
                {"Dell USB-C Docking Station", "ELEC-013", "WD19S 180W docking station", new BigDecimal("199.99"), 22, 5, electronics},
                {"HP LaserJet Pro M404dn", "ELEC-014", "Monochrome laser printer", new BigDecimal("349.99"), 9, 3, electronics},
                {"Epson WorkForce Pro Printer", "ELEC-015", "Color inkjet business printer", new BigDecimal("279.00"), 11, 3, electronics},

                // Office Supplies
                {"A4 Copy Paper 500 Sheets", "OFF-001", "80gsm white copy paper, ream", new BigDecimal("8.99"), 200, 40, office},
                {"Staples Box 5000pcs", "OFF-002", "Standard staples 26/6", new BigDecimal("4.49"), 150, 30, office},
                {"Ballpoint Pens Blue Box 50", "OFF-003", "Medium tip blue ballpoint pens", new BigDecimal("12.99"), 100, 20, office},
                {"Permanent Markers Black 12pk", "OFF-004", "Fine tip permanent markers", new BigDecimal("9.99"), 80, 15, office},
                {"Manila Folders 100pk", "OFF-005", "Letter-size hanging file folders", new BigDecimal("19.99"), 60, 10, office},
                {"Binder Clips Large 12pk", "OFF-006", "Heavy-duty binder clips", new BigDecimal("3.49"), 120, 20, office},
                {"Sticky Notes 3x3 12pk", "OFF-007", "Assorted colors, 100 sheets each", new BigDecimal("14.99"), 90, 15, office},
                {"Scotch Tape Rolls 6pk", "OFF-008", "19mm x 33m clear tape", new BigDecimal("7.99"), 110, 20, office},
                {"Whiteboard Markers 8pk", "OFF-009", "Assorted colors, low-odor", new BigDecimal("11.99"), 70, 12, office},
                {"Desk Organizer Tray Set", "OFF-010", "3-tier letter tray organizer", new BigDecimal("24.99"), 35, 8, office},

                // Furniture
                {"Herman Miller Aeron Chair", "FURN-001", "Ergonomic mesh office chair, size B", new BigDecimal("1495.00"), 5, 2, furniture},
                {"IKEA Bekant Standing Desk", "FURN-002", "Electric height-adjustable desk 160x80cm", new BigDecimal("649.00"), 8, 2, furniture},
                {"4-Drawer Steel Filing Cabinet", "FURN-003", "Letter-size lockable filing cabinet", new BigDecimal("289.99"), 12, 3, furniture},
                {"Bookshelf 5-Tier", "FURN-004", "Industrial wood and metal shelving unit", new BigDecimal("179.99"), 15, 3, furniture},
                {"Conference Table 8-Person", "FURN-005", "180x90cm laminate conference table", new BigDecimal("799.00"), 3, 1, furniture},
                {"Visitor Chair Set of 4", "FURN-006", "Padded waiting room chairs", new BigDecimal("349.00"), 6, 2, furniture},
                {"Whiteboard 120x90cm", "FURN-007", "Magnetic dry-erase board with frame", new BigDecimal("129.99"), 10, 3, furniture},

                // Software
                {"Microsoft 365 Business Basic", "SOFT-001", "Annual subscription, per user", new BigDecimal("72.00"), 100, 20, software},
                {"Adobe Acrobat Pro DC", "SOFT-002", "PDF editor annual license", new BigDecimal("239.88"), 30, 5, software},
                {"AutoCAD LT Annual License", "SOFT-003", "2D CAD design license", new BigDecimal("545.00"), 5, 1, software},
                {"Zoom Business Annual Plan", "SOFT-004", "Video conferencing, per host", new BigDecimal("199.90"), 50, 10, software},
                {"Slack Pro Annual", "SOFT-005", "Team messaging platform, per user", new BigDecimal("87.75"), 80, 15, software},

                // Networking
                {"Cisco Catalyst 2960 Switch", "NET-001", "24-port managed gigabit switch", new BigDecimal("899.00"), 6, 2, networking},
                {"Ubiquiti UniFi AP AC Pro", "NET-002", "Dual-band WiFi 6 access point", new BigDecimal("179.00"), 14, 4, networking},
                {"Netgear 16-Port PoE Switch", "NET-003", "Unmanaged PoE+ switch", new BigDecimal("249.99"), 8, 2, networking},
                {"Cat6 Ethernet Cable 50m", "NET-004", "Shielded twisted pair patch cable", new BigDecimal("29.99"), 40, 8, networking},
                {"Patch Panel 24-Port", "NET-005", "1U rack-mount patch panel", new BigDecimal("59.99"), 10, 3, networking},
                {"Cisco RV340 Router", "NET-006", "Dual WAN VPN router", new BigDecimal("299.00"), 4, 2, networking},

                // Tools
                {"Stanley Hand Tool Set 65pc", "TOOL-001", "Mixed metric and imperial set", new BigDecimal("129.99"), 7, 2, tools},
                {"Bosch Cordless Drill 18V", "TOOL-002", "2-speed brushless drill/driver kit", new BigDecimal("179.99"), 9, 3, tools},
                {"Cable Management Kit", "TOOL-003", "Zip ties, velcro straps, labels", new BigDecimal("19.99"), 50, 10, tools},
                {"Label Maker DYMO 450", "TOOL-004", "Desktop label maker with tape", new BigDecimal("89.99"), 8, 2, tools},

                // Safety
                {"First Aid Kit 100pc", "SAFE-001", "ANSI compliant workplace first aid kit", new BigDecimal("49.99"), 12, 3, safety},
                {"Fire Extinguisher ABC 5lb", "SAFE-002", "Dry chemical extinguisher", new BigDecimal("69.99"), 8, 2, safety},
                {"Safety Glasses Box 12pk", "SAFE-003", "ANSI Z87.1 rated clear lens", new BigDecimal("34.99"), 25, 6, safety},
                {"Hi-Vis Vest Size M-XL", "SAFE-004", "ANSI Class 2 safety vest", new BigDecimal("12.99"), 30, 8, safety},

                // Cleaning
                {"Multi-Surface Cleaner 5L", "CLEAN-001", "Concentrated all-purpose cleaner", new BigDecimal("18.99"), 40, 10, cleaning},
                {"Microfiber Cloths 20pk", "CLEAN-002", "Screen-safe cleaning cloths", new BigDecimal("24.99"), 55, 10, cleaning},
                {"Hand Sanitizer 500ml 12pk", "CLEAN-003", "70% alcohol gel sanitizer", new BigDecimal("39.99"), 35, 10, cleaning},
                {"Trash Bags 50L 50pk", "CLEAN-004", "Heavy-duty black bin liners", new BigDecimal("14.99"), 60, 12, cleaning},
            };

            List<Product> savedProducts = new ArrayList<>();
            for (Object[] p : products) {
                Product product = new Product();
                product.setName((String) p[0]);
                product.setSku((String) p[1]);
                product.setDescription((String) p[2]);
                product.setPrice((BigDecimal) p[3]);
                product.setQuantity((Integer) p[4]);
                product.setLowStockThreshold((Integer) p[5]);
                product.setCategory((Category) p[6]);
                savedProducts.add(productRepo.save(product));
            }

            // --- Orders (20+) ---
            String[][] orderData = {
                {"Acme Corp", "procurement@acme.com", "PENDING"},
                {"TechStart Ltd", "orders@techstart.io", "PROCESSING"},
                {"Global Solutions Inc", "purchasing@globalsol.com", "SHIPPED"},
                {"Metro Office Group", "admin@metrooffice.com", "DELIVERED"},
                {"Sunrise Consulting", "info@sunrise.co", "PENDING"},
                {"DataFlow Analytics", "ops@dataflow.com", "PROCESSING"},
                {"Green Valley Schools", "procurement@gvs.edu", "DELIVERED"},
                {"Harbor Logistics", "supply@harbor.com", "SHIPPED"},
                {"Peak Performance Gym", "info@peakgym.com", "PENDING"},
                {"City Legal Associates", "admin@citylegal.com", "DELIVERED"},
                {"NovaBuild Construction", "purchasing@novabuild.com", "CANCELLED"},
                {"Lakeside Medical Center", "supplies@lakeside.org", "DELIVERED"},
                {"Redwood Publishing", "orders@redwoodpub.com", "PROCESSING"},
                {"Summit Hotel Group", "procurement@summithotel.com", "PENDING"},
                {"Coast Guard Station 7", "supply@coastguard.gov", "SHIPPED"},
                {"University of Commerce", "purchasing@uoc.edu", "DELIVERED"},
                {"Blue Sky Architecture", "admin@bluesky.design", "PENDING"},
                {"Sterling Financial", "ops@sterling.finance", "PROCESSING"},
                {"Phoenix Retail Chain", "supply@phoenix.retail", "DELIVERED"},
                {"Greenleaf Restaurant Group", "orders@greenleaf.com", "PENDING"},
                {"Atlantic Software Dev", "admin@atlanticsoft.dev", "SHIPPED"},
                {"Nordic Exports AS", "logistics@nordic.no", "PROCESSING"},
            };

            int pi = 0;
            for (String[] o : orderData) {
                Order order = new Order();
                order.setCustomerName(o[0]);
                order.setCustomerEmail(o[1]);
                Order.OrderStatus status = Order.OrderStatus.valueOf(o[2]);
                order.setStatus(status);

                List<OrderItem> items = new ArrayList<>();
                for (int j = 0; j < 2; j++) {
                    Product p = savedProducts.get((pi + j) % savedProducts.size());
                    OrderItem item = new OrderItem();
                    item.setOrder(order);
                    item.setProduct(p);
                    item.setQuantity(j + 1);
                    item.setUnitPrice(p.getPrice());
                    items.add(item);
                }
                order.setItems(items);
                order.recalculateTotal();
                orderRepo.save(order);
                pi = (pi + 3) % savedProducts.size();
            }
        };
    }
}
