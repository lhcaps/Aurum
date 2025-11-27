// src/services/product.service.ts
import api from "@/lib/api"; 

// 💡 Dựa trên SQL của bạn, đây là kiểu dữ liệu BE trả về
interface ProductApiResponse {
    Id: number; 
    Name: string;
    Price: number;
    ImageUrl: string;
    CategoryName: string;
    // ...
}

// ⚠️ Kiểu dữ liệu FE mong muốn (từ DirectSales.tsx)
interface ProductType {
    id: string;
    name: string;
    category: string;
    price: number;
    image: string;
    hasSize?: boolean;
    hasToppings?: boolean;
}

export const productService = {
    getAllProductsForCashier: async (): Promise<ProductType[]> => {
        // 🔑 FE gọi đúng endpoint gốc /products
        const response = await api.get("/api/products"); 
        
        // 🔑 FIX: Trích xuất mảng sản phẩm từ trường 'data' của response BE
        const products = response.data.data; 

        // 🔑 Ánh xạ dữ liệu từ BE (Id, Name) sang FE (id, name, v.v.)
        const mappedProducts: ProductType[] = products.map((item: ProductApiResponse) => ({
            id: item.Id.toString(), 
            name: item.Name, 
            price: item.Price,
            // 💡 Chuyển CategoryName sang lowercase để khớp với Tabs FE
            category: item.CategoryName?.toLowerCase() || 'other', 
            image: item.ImageUrl || '☕', // Sử dụng ImageUrl
            // 💡 Logic đơn giản hóa tùy chọn
            hasSize: item.CategoryName !== 'Đồ ăn', 
            hasToppings: item.CategoryName === 'Trà' || item.CategoryName === 'Sinh tố',
        }));
        
        return mappedProducts; 
    }
};