# EcoTrack AI – Spring Boot & MySQL Enterprise Backend Rebuild

## Overview
This package is the complete enterprise backend rewrite of **EcoTrack AI** using:
- **Backend:** Java 17+, Spring Boot 3.2, Spring Data JPA, Hibernate, Maven
- **Database:** MySQL 8.0+
- **Frontend Presentation:** Vanilla HTML5, CSS3, JavaScript ES6+, Thymeleaf Templating
- **Design Integrity:** 100% pixel-for-pixel visual and UX parity with the original EcoTrack AI application.

---

## Project Structure
```
ecotrack-spring-boot/
├── pom.xml                                      # Maven dependencies & build plugins
├── README.md                                    # Step-by-step instructions
└── src/
    └── main/
        ├── java/com/ecotrack/
        │   ├── EcoTrackApplication.java         # Spring Boot main class
        │   ├── model/                           # JPA Entities
        │   │   ├── User.java
        │   │   ├── Truck.java
        │   │   ├── Dustbin.java
        │   │   ├── PickupTask.java
        │   │   ├── WardComplaint.java
        │   │   ├── WasteDataEntry.java
        │   │   ├── DeviceAlert.java
        │   │   └── AuditLog.java
        │   ├── repository/                      # Spring Data JPA Repositories
        │   │   ├── UserRepository.java
        │   │   ├── TruckRepository.java
        │   │   ├── DustbinRepository.java
        │   │   ├── PickupTaskRepository.java
        │   │   ├── WardComplaintRepository.java
        │   │   ├── WasteDataEntryRepository.java
        │   │   ├── DeviceAlertRepository.java
        │   │   └── AuditLogRepository.java
        │   ├── service/                         # Business Logic & Allocation Engine
        │   │   ├── AuthService.java
        │   │   ├── AllocationService.java
        │   │   ├── WasteDataService.java
        │   │   └── FleetService.java
        │   └── controller/                      # Spring MVC & REST Controllers
        │       ├── LoginController.java
        │       ├── AdminController.java
        │       ├── DriverController.java
        │       ├── SegregationController.java
        │       └── ApiController.java
        └── resources/
            ├── application.properties           # MySQL connection & server config
            ├── schema.sql                       # MySQL DDL table creation script
            ├── data.sql                         # Pre-loaded Chennai municipal seed data
            ├── static/
            │   ├── css/styles.css               # Exact styling, badges, cards, modals
            │   └── js/app.js                    # Auto-calculation, capacity validation, modals
            └── templates/
                ├── login.html                   # Login page (First page on startup)
                ├── admin-dashboard.html         # Admin Command Center with Manual Allocation
                ├── driver-dashboard.html        # Driver Portal with Rich Profile
                └── segregation-dashboard.html   # Segregation Portal with 4 Metric Cards
```

---

## Step-by-Step Run Instructions

### 1. Prerequisites
- **Java Development Kit (JDK):** Version 17 or higher (`java -version`)
- **Apache Maven:** Version 3.8 or higher (`mvn -version`)
- **MySQL Database Server:** Version 8.0 or higher (`mysql --version`)

### 2. Configure MySQL Database
Start your MySQL server and create the database:
```sql
CREATE DATABASE ecotrack_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Update your MySQL credentials in `src/main/resources/application.properties` if different from default:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/ecotrack_db?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
spring.datasource.username=root
spring.datasource.password=rootpassword
```

*(Note: `spring.sql.init.mode=always` will automatically execute `schema.sql` and `data.sql` to populate initial users, fleet trucks, and pending incoming requests).*

### 3. Build & Run Application
From the `ecotrack-spring-boot` directory:
```bash
# Clean and compile
mvn clean compile

# Run the Spring Boot development server
mvn spring-boot:run
```

Or package as a standalone executable JAR:
```bash
mvn clean package -DskipTests
java -jar target/ecotrack-ai-1.0.0.jar
```

---

## Application Access & Behavior

1. **Startup Landing Page:**
   Open your browser and navigate to:
   **`http://localhost:8080/`**
   - The application automatically redirects unauthenticated users directly to **`http://localhost:8080/login`**.

2. **Municipal Login Credentials:**
   Use any of the one-click credential buttons or enter credentials manually:

   | Role | Account Email / Username | Password | Default Portal |
   |---|---|---|---|
   | **Administrator** | `admin@chennaiwaste.gov.in` | `admin123` | `/admin` (Overview & Manual Allocation) |
   | **Driver (500kg EV)** | `murugan.driver@chennaiwaste.gov.in` | `driver123` | `/driver` (Dashboard & My Pickups) |
   | **Driver (1000kg)** | `selvam.driver@chennaiwaste.gov.in` | `driver123` | `/driver` (Dashboard & My Pickups) |
   | **Driver (Narrow Lane)** | `ramesh.auto@chennaiwaste.gov.in` | `auto123` | `/driver` (Dashboard & My Pickups) |
   | **Segregation Officer** | `kavitha.seg@chennaiwaste.gov.in` | `officer123` | `/segregation` (Dashboard & Enter Waste) |

3. **Portal Features Included:**
   - **Admin Portal:** Simplified 8 navigation tabs (`Overview`, `Live Chennai Map`, `Auto Allocation`, `Manual Allocation`, `Pickups`, `Trucks`, `Alerts`, `Reports`), live incoming requests panel (`ecotrackai123@gmail.com` and `Call 1913`), interactive manual assignment modal with truck safe capacity deduction, and assigned manual tasks table.
   - **Driver Portal:** Simplified 5 navigation tabs (`Dashboard`, `My Truck`, `My Route`, `My Pickups`, `Profile`), detailed driver profile with credentials and endorsements, and pickup completion actions.
   - **Segregation Portal:** Simplified 4 navigation tabs (`Dashboard`, `Enter Waste Data`, `Segregation Guide`, `Profile`), 4 overall summary metric cards (`Total: 1,245 kg`, `Wet: 680 kg [54.6%]`, `Dry: 420 kg [33.7%]`, `Hazardous: 145 kg [11.7%]`), and clean "Enter Waste Data" form with auto-calculating total waste.
