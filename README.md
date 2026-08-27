# POS CENTER — Hệ Thống Quản Lý Bán Hàng & Điểm Bán Doanh Nghiệp (Biti's Corporation)

**POS CENTER** là nền tảng quản lý điểm bán (Point of Sale), bán hàng đa kênh, quản lý sản phẩm, đơn hàng, khách hàng, chương trình khuyến mãi, phân quyền RBAC và cấu hình xuất hóa đơn điện tử VAT chuẩn quy định doanh nghiệp.

---

## 🎯 1. Mục Đích & Mục Tiêu Dự Án

* **Mục đích**: Cung cấp giải pháp phần mềm quản lý điểm bán hàng chuyên nghiệp, hiện đại, tối ưu cho giao diện Desktop & Mobile/Tablet responsive.
* **Mục tiêu**:
  * Chuẩn hóa cấu trúc mã nguồn theo mô hình kiến trúc Doanh nghiệp (Enterprise Layered Architecture).
  * Loại bỏ hoàn toàn hardcoded data trong giao diện, chuyển toàn bộ dữ liệu mẫu về các file JSON Seed data trong `src/seed/`.
  * Áp dụng mô hình **DTO (Data Transfer Object)**, **Entities** và **Mappers** để sanitize, validate và map dữ liệu chuẩn xác giữa tầng Seed/API và tầng UI.
  * Tối ưu hóa giao diện người dùng responsive, loại bỏ thông tin dư thừa, tập trung vào trải nghiệm người dùng thực tế tại cửa hàng.

---

## 🏗️ 2. Cấu Trúc Thư Mục & Quy Tắc Đặt Tên (Naming Conventions)

### 📏 Quy Tắc Đặt Tên Chuẩn

1. **`camelCase`**:
   * **Seed Files**: `seedProducts.json`, `seedVat.json`, `seedCustomers.json`, `seedOrders.json`, `seedPromotions.json`, `seedRbac.json`, `seedAuditLogs.json`
   * **Services**: `productService.ts`, `vatService.ts`, `customerService.ts`, `orderService.ts`, `promotionService.ts`, `rbacService.ts`
   * **API Utilities & Helpers**: `apiClient.ts`, `endpoints.ts`, `formatters.ts`
   * **Variables & Functions**: `activeUser`, `handleLogout()`, `verifyInvoice()`
2. **`PascalCase`**:
   * **DTOs & Entities**: `ProductDto.ts`, `VatDto.ts`, `CustomerDto.ts`, `OrderDto.ts`, `PromotionDto.ts`, `RbacDto.ts`
   * **React Components & Pages**: `DashboardLayout.tsx`, `SmartTable.tsx`, `PublicVATRegistration.tsx`, `VatConfig.tsx`

---

### 📂 Sơ Đồ Thư Mục Mã Nguồn

```text
├── metadata.json                 # Thông tin metadata & cấu hình ứng dụng (Name, Description, Footer, Major Capabilities)
├── server.ts                     # Express Backend Server (Vite Middleware, API Proxies, VAT Engine)
├── package.json                  # Quản lý dependencies & pnpm scripts
├── src/
│   ├── api/                      # Tầng HTTP Request Client & API Endpoints
│   │   ├── apiClient.ts          # Axios wrapper với Interceptors & Error Handlers
│   │   ├── config.ts             # API Base URLs & Timeouts
│   │   ├── endpoints.ts          # Danh sách URL routes API
│   │   └── response.ts           # Standard API Response wrapper
│   │
│   ├── dtos/                     # Data Transfer Objects, Entities & Mappers
│   │   ├── ProductDto.ts         # DTO & Mapper cho Sản phẩm
│   │   ├── CustomerDto.ts        # DTO & Mapper cho Khách hàng
│   │   ├── OrderDto.ts           # DTO & Mapper cho Đơn hàng
│   │   ├── PromotionDto.ts       # DTO & Mapper cho Khuyến mãi
│   │   ├── RbacDto.ts            # DTO & Mapper cho Phân quyền
│   │   ├── VatDto.ts             # DTO & Mapper cho Hóa đơn VAT
│   │   └── AuditLogDto.ts        # DTO & Mapper cho Lịch sử hệ thống
│   │
│   ├── seed/                     # Kho lưu trữ Dữ liệu mẫu dạng JSON
│   │   ├── seedProducts.json     # Danh mục sản phẩm mẫu
│   │   ├── seedCustomers.json    # Khách hàng mẫu
│   │   ├── seedOrders.json       # Đơn hàng mẫu
│   │   ├── seedPromotions.json   # Chương trình khuyến mãi
│   │   ├── seedRbac.json         # Danh sách Vai trò & Quyền hạn
│   │   ├── seedVat.json          # Cấu hình hóa đơn VAT & Mẫu hóa đơn đã xuất
│   │   └── seedAuditLogs.json    # Nhật ký hệ thống mẫu
│   │
│   ├── services/                 # Business Logic Layer (Singleton Services)
│   │   ├── productService.ts     # Xử lý nghiệp vụ Sản phẩm
│   │   ├── customerService.ts   # Xử lý nghiệp vụ Khách hàng
│   │   ├── orderService.ts       # Xử lý nghiệp vụ Đơn hàng
│   │   ├── promotionService.ts   # Xử lý nghiệp vụ Khuyến mãi
│   │   ├── rbacService.ts        # Xử lý nghiệp vụ Phân quyền
│   │   ├── vatService.ts         # Xử lý nghiệp vụ Xuất hóa đơn VAT
│   │   ├── auditService.ts       # Xử lý Ghi log & Theo dõi hoạt động
│   │   └── loggerService.ts      # Logger Service
│   │
│   ├── layouts/                  # Frame Layouts chính của ứng dụng
│   │   └── DashboardLayout.tsx   # Layout chính với Header, Drawer Sidebar, Navigation & Profile Dropdown
│   │
│   ├── pages/                    # Các trang màn hình tính năng (Page Components)
│   │   ├── Dashboard.tsx         # Trang Bảng điều khiển
│   │   ├── Products.tsx          # Trang Quản lý Sản phẩm
│   │   ├── Customers.tsx         # Trang Quản lý Khách hàng
│   │   ├── Orders.tsx            # Trang Quản lý Đơn hàng
│   │   ├── Promotions.tsx        # Trang Quản lý Khuyến mãi
│   │   ├── PublicVATRegistration.tsx # Trang Đăng ký xuất hóa đơn VAT công khai
│   │   ├── VatConfig.tsx         # Trang Cấu hình mẫu hóa đơn VAT
│   │   └── RbacManagement.tsx    # Trang Quản lý Phân quyền
│   │
│   ├── components/               # Các UI Component dùng chung (Reusable Components)
│   │   ├── SmartTable.tsx        # Bảng dữ liệu thông minh hỗ trợ Lọc, Phân trang, Export
│   │   ├── PageContainer.tsx     # Framework Wrapper trang chuẩn
│   │   ├── PermissionGuard.tsx   # Guard kiểm tra quyền truy cập UI
│   │   └── PrintInvoiceModal.tsx # Modal in hóa đơn
│   │
│   ├── utils/                    # Helper functions, Formatters, Constants
│   ├── types.ts                  # Shared Global TypeScript Types & Interfaces
│   ├── i18n.ts                   # Cấu hình Đa ngôn ngữ (VI/EN)
│   ├── main.tsx                  # Application Entry Point
│   └── App.tsx                   # App Root Router & State Providers
```

---

## 🚀 3. Hướng Dẫn Chạy Lệnh (Commands & Execution)

### Lệnh Phát Triển (Development Mode)
```bash
# Khởi chạy dev server (Express backend tích hợp Vite middleware)
pnpm dev
```
Dev server sẽ lắng nghe tại cổng `3000` (URL: `http://localhost:3000`).

### Lệnh Kiểm Tra Mã Nguồn (Linting & Type Check)
```bash
# Kiểm tra TypeScript type safety và cú pháp toàn bộ project
pnpm lint
```

### Lệnh Biên Dịch & Đóng Gói (Production Build)
```bash
# Biên dịch React Client (Vite) và Bundled CommonJS Server (esbuild)
pnpm build
```

### Lệnh Khởi Chạy Production
```bash
# Chạy ứng dụng đã biên dịch
pnpm start
```

---

## 🛠️ 4. Quy Trình Phát Triển & Viết Mới Mới Tính Năng (Development Guide)

Khi tạo một **Module / Tính năng mới** (Ví dụ: Module Quản lý Kho - `Inventory`), bạn hãy thực hiện theo đúng 5 bước chuẩn hóa bên dưới:

### 🔹 Bước 1: Tạo File Seed JSON Data
Tạo file lưu trữ dữ liệu ban đầu trong thư mục `src/seed/`:
* File path: `src/seed/seedInventory.json` (Sử dụng tên dạng `camelCase` có tiền tố `seed`)
```json
[
  {
    "id": "INV-001",
    "productId": "PROD-101",
    "warehouseName": "Kho Tổng TPHCM",
    "quantity": 150,
    "minThreshold": 20,
    "lastUpdated": "2026-08-01T10:00:00Z"
  }
]
```

---

### 🔹 Bước 2: Tạo DTO & Mapper Class
Định nghĩa Interface DTO và Mapper Class trong `src/dtos/`:
* File path: `src/dtos/InventoryDto.ts` (Sử dụng tên dạng `PascalCase` có hậu tố `Dto.ts`)
```typescript
export interface InventoryItemDto {
  id: string;
  productId: string;
  warehouseName: string;
  quantity: number;
  minThreshold: number;
  lastUpdated: string;
}

export class InventoryMapper {
  static toDto(raw: any): InventoryItemDto {
    return {
      id: String(raw.id || ''),
      productId: String(raw.productId || ''),
      warehouseName: String(raw.warehouseName || 'Kho Mặc Định'),
      quantity: Number(raw.quantity || 0),
      minThreshold: Number(raw.minThreshold || 0),
      lastUpdated: raw.lastUpdated || new Date().toISOString()
    };
  }
}
```

---

### 🔹 Bước 3: Tạo Business Service
Viết Singleton Service xử lý logic nghiệp vụ trong `src/services/`:
* File path: `src/services/inventoryService.ts` (Sử dụng tên dạng `camelCase` có hậu tố `Service.ts`)
```typescript
import seedInventoryJson from '../seed/seedInventory.json';
import { InventoryItemDto, InventoryMapper } from '../dtos/InventoryDto';

export class InventoryService {
  private static instance: InventoryService;
  private items: InventoryItemDto[];

  private constructor() {
    this.items = seedInventoryJson.map(InventoryMapper.toDto);
  }

  public static getInstance(): InventoryService {
    if (!InventoryService.instance) {
      InventoryService.instance = new InventoryService();
    }
    return InventoryService.instance;
  }

  public getAll(): InventoryItemDto[] {
    return this.items;
  }
}

export const inventoryService = InventoryService.getInstance();
```

---

### 🔹 Bước 4: Khai Báo API Endpoints (Nếu cần Backend Routing)
Nếu module cần API server-side, hãy thêm vào `server.ts` hoặc `src/api/endpoints.ts`:
```typescript
// Trong server.ts
app.get('/api/inventory', (req, res) => {
  res.json({ success: true, data: inventoryService.getAll() });
});
```

---

### 🔹 Bước 5: Tạo Giao Diện UI & Router
1. Tạo Page Component trong `src/pages/Inventory.tsx` (Tên dạng `PascalCase`).
2. Sử dụng `PageContainer` và `SmartTable` để dựng giao diện chuẩn.
3. Đăng ký Route mới trong `src/App.tsx` và thêm item menu vào Sidebar trong `src/layouts/DashboardLayout.tsx`.

---

## 🔐 5. Cấu Hình OIDC Single Sign-On (oidc-client-ts & react-oidc-context)

Dự án tích hợp thư viện **`oidc-client-ts`** và **`react-oidc-context`** để thực hiện xác thực tập trung SSO qua Biti's IdentityServer.

### 🔑 Các Biến Môi Trường OIDC Trong `.env.example`:
```env
NODE_ENV=development
PORT=3000
APP_URL=https://localhost:44374
HTTPS_ENABLED=true
HTTPS_PFX_PATH=.certs/localhost.pfx
HTTPS_PFX_PASSPHRASE=BitisPortalV2@Dev

VITE_APP_ORIGIN=https://localhost:44374
VITE_OIDC_AUTHORITY=https://identityserver.bitisgroup.vn
VITE_OIDC_CLIENT_ID=sso_portal_v2_web_client_client_id_prod
VITE_OIDC_SCOPE=openid email profile roles
VITE_OIDC_CALLBACK_PATH=/signin-oidc
VITE_OIDC_SIGNOUT_CALLBACK_PATH=/signout-callback-oidc
VITE_OIDC_REDIRECT_URI=https://localhost:44374/signin-oidc
VITE_OIDC_SILENT_REDIRECT_URI=https://localhost:44374/signin-oidc
VITE_OIDC_POST_LOGOUT_REDIRECT_URI=https://localhost:44374/signout-callback-oidc
VITE_OIDC_NAME_CLAIM=name
VITE_OIDC_ROLE_CLAIM=role
```

### 🔄 Cơ Chế Silent Renew & Authentication Provider:
* Config OIDC được quản lý tập trung tại `src/services/oidcConfig.ts`.
* Tự động kích hoạt `automaticSilentRenew: true` giúp làm mới Access Token ngầm trong background mà không gián đoạn trải nghiệm người dùng.
* Toàn bộ ứng dụng được bao bọc bởi `<AuthProvider {...oidcConfig}>` trong `src/App.tsx`.
* Dynamic origin fallback đảm bảo ứng dụng chạy mượt mà cả ở cổng HTTPS localhost:44374 lẫn môi trường AI Studio Sandbox runtime.

