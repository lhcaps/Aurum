export interface Ingredient {
  name: string;
  amount: string;
  unit: string;
}

export interface RecipeStep {
  step: number;
  instruction: string;
  duration?: string;
}

export interface Recipe {
  productName: string;
  size: string;
  ingredients: Ingredient[];
  steps: RecipeStep[];
  notes?: string[];
  preparationTime: string;
}

export const recipes: Record<string, Recipe> = {
  "tra-sua-phuc-long-m": {
    productName: "Trà sữa Phúc Long",
    size: "M",
    preparationTime: "3-4 phút",
    ingredients: [
      { name: "Trà Oolong Phúc Long", amount: "40", unit: "ml" },
      { name: "Sữa tươi", amount: "120", unit: "ml" },
      { name: "Đường syrup", amount: "20", unit: "ml" },
      { name: "Đá viên", amount: "150", unit: "g" },
      { name: "Topping trân châu", amount: "50", unit: "g" },
    ],
    steps: [
      { step: 1, instruction: "Nấu trân châu đen trong 20 phút, để nguội", duration: "20 phút" },
      { step: 2, instruction: "Pha trà Oolong với nước 90°C, ngâm 3 phút", duration: "3 phút" },
      { step: 3, instruction: "Cho đá viên vào ly size M (đầy 3/4 ly)" },
      { step: 4, instruction: "Thêm trân châu đã nấu vào đáy ly" },
      { step: 5, instruction: "Rót sữa tươi và đường syrup, khuấy đều" },
      { step: 6, instruction: "Rót trà Oolong từ từ tạo lớp gradient đẹp" },
      { step: 7, instruction: "Đậy nắp, cắm ống hút, hoàn tất" },
    ],
    notes: [
      "Trà không được quá nóng khi rót vào",
      "Trân châu phải mềm dai, không cứng",
      "Khuấy đều trước khi giao khách",
    ],
  },
  "tra-sua-phuc-long-l": {
    productName: "Trà sữa Phúc Long",
    size: "L",
    preparationTime: "3-4 phút",
    ingredients: [
      { name: "Trà Oolong Phúc Long", amount: "60", unit: "ml" },
      { name: "Sữa tươi", amount: "180", unit: "ml" },
      { name: "Đường syrup", amount: "30", unit: "ml" },
      { name: "Đá viên", amount: "200", unit: "g" },
      { name: "Topping trân châu", amount: "70", unit: "g" },
    ],
    steps: [
      { step: 1, instruction: "Nấu trân châu đen trong 20 phút, để nguội", duration: "20 phút" },
      { step: 2, instruction: "Pha trà Oolong với nước 90°C, ngâm 3 phút", duration: "3 phút" },
      { step: 3, instruction: "Cho đá viên vào ly size L (đầy 3/4 ly)" },
      { step: 4, instruction: "Thêm trân châu đã nấu vào đáy ly" },
      { step: 5, instruction: "Rót sữa tươi và đường syrup, khuấy đều" },
      { step: 6, instruction: "Rót trà Oolong từ từ tạo lớp gradient đẹp" },
      { step: 7, instruction: "Đậy nắp, cắm ống hút, hoàn tất" },
    ],
    notes: [
      "Trà không được quá nóng khi rót vào",
      "Trân châu phải mềm dai, không cứng",
    ],
  },
  "ca-phe-sua-m": {
    productName: "Cà phê sữa",
    size: "M",
    preparationTime: "2-3 phút",
    ingredients: [
      { name: "Cà phê Robusta Phúc Long", amount: "25", unit: "g" },
      { name: "Sữa đặc có đường", amount: "40", unit: "ml" },
      { name: "Nước nóng 95°C", amount: "120", unit: "ml" },
      { name: "Đá viên", amount: "150", unit: "g" },
    ],
    steps: [
      { step: 1, instruction: "Cho sữa đặc vào ly size M" },
      { step: 2, instruction: "Pha cà phê bằng phin với nước 95°C", duration: "3-4 phút" },
      { step: 3, instruction: "Đợi cà phê nhỏ giọt hết vào ly" },
      { step: 4, instruction: "Khuấy đều sữa và cà phê" },
      { step: 5, instruction: "Thêm đá viên vào ly" },
      { step: 6, instruction: "Đậy nắp, cắm ống hút, hoàn tất" },
    ],
    notes: [
      "Cà phê phải đậm đà, màu nâu sẫm",
      "Sữa và cà phê phải hòa quyện đều",
    ],
  },
  "ca-phe-sua-l": {
    productName: "Cà phê sữa",
    size: "L",
    preparationTime: "3-4 phút",
    ingredients: [
      { name: "Cà phê Robusta Phúc Long", amount: "35", unit: "g" },
      { name: "Sữa đặc có đường", amount: "60", unit: "ml" },
      { name: "Nước nóng 95°C", amount: "180", unit: "ml" },
      { name: "Đá viên", amount: "200", unit: "g" },
    ],
    steps: [
      { step: 1, instruction: "Cho sữa đặc vào ly size L" },
      { step: 2, instruction: "Pha cà phê bằng phin với nước 95°C", duration: "4-5 phút" },
      { step: 3, instruction: "Đợi cà phê nhỏ giọt hết vào ly" },
      { step: 4, instruction: "Khuấy đều sữa và cà phê" },
      { step: 5, instruction: "Thêm đá viên vào ly" },
      { step: 6, instruction: "Đậy nắp, cắm ống hút, hoàn tất" },
    ],
    notes: [
      "Cà phê phải đậm đà, màu nâu sẫm",
      "Sữa và cà phê phải hòa quyện đều",
      "Kiểm tra nhiệt độ trước khi giao",
    ],
  },
  "matcha-latte-m": {
    productName: "Matcha Latte",
    size: "M",
    preparationTime: "2 phút",
    ingredients: [
      { name: "Bột Matcha Nhật Bản", amount: "5", unit: "g" },
      { name: "Sữa tươi", amount: "200", unit: "ml" },
      { name: "Đường syrup", amount: "15", unit: "ml" },
      { name: "Đá viên", amount: "100", unit: "g" },
    ],
    steps: [
      { step: 1, instruction: "Đánh tan bột matcha với 30ml nước ấm" },
      { step: 2, instruction: "Khuấy đều cho không bị vón cục" },
      { step: 3, instruction: "Cho đá vào ly size M" },
      { step: 4, instruction: "Rót sữa tươi và đường syrup vào" },
      { step: 5, instruction: "Thêm matcha đã pha từ từ" },
      { step: 6, instruction: "Khuấy nhẹ tạo hiệu ứng gradient" },
      { step: 7, instruction: "Đậy nắp, cắm ống hút, hoàn tất" },
    ],
    notes: [
      "Matcha phải màu xanh tươi, không bị vón",
      "Sữa tươi phải lạnh",
    ],
  },
  "tra-oolong-l": {
    productName: "Trà Oolong",
    size: "L",
    preparationTime: "2 phút",
    ingredients: [
      { name: "Trà Oolong Phúc Long", amount: "8", unit: "g" },
      { name: "Nước lọc 90°C", amount: "400", unit: "ml" },
      { name: "Đá viên", amount: "200", unit: "g" },
      { name: "Đường syrup (optional)", amount: "0", unit: "ml" },
    ],
    steps: [
      { step: 1, instruction: "Pha trà Oolong với nước 90°C", duration: "3 phút" },
      { step: 2, instruction: "Lọc bỏ lá trà" },
      { step: 3, instruction: "Cho đá viên vào ly size L" },
      { step: 4, instruction: "Rót trà vào ly" },
      { step: 5, instruction: "KHÔNG thêm đường (theo yêu cầu khách)" },
      { step: 6, instruction: "Đậy nắp, cắm ống hút, hoàn tất" },
    ],
    notes: [
      "Khách yêu cầu KHÔNG ĐƯỜNG",
      "Trà phải có màu vàng hổ phách tự nhiên",
      "Kiểm tra kỹ trước khi giao",
    ],
  },
  "ca-phe-den-m": {
    productName: "Cà phê đen",
    size: "M",
    preparationTime: "3 phút",
    ingredients: [
      { name: "Cà phê Robusta Phúc Long", amount: "25", unit: "g" },
      { name: "Nước nóng 95°C", amount: "150", unit: "ml" },
      { name: "Đá viên", amount: "150", unit: "g" },
      { name: "Đường (optional)", amount: "10", unit: "g" },
    ],
    steps: [
      { step: 1, instruction: "Cho cà phê vào phin" },
      { step: 2, instruction: "Rót nước nóng 95°C vào phin", duration: "3-4 phút" },
      { step: 3, instruction: "Đợi cà phê nhỏ giọt hết" },
      { step: 4, instruction: "Cho đá viên vào ly size M" },
      { step: 5, instruction: "Rót cà phê vào ly" },
      { step: 6, instruction: "Đậy nắp, cắm ống hút, hoàn tất" },
    ],
    notes: [
      "Cà phê đen nguyên chất, không pha trộn",
      "Màu đen đậm, hương thơm nồng",
    ],
  },
};

export const getRecipe = (productName: string, size: string): Recipe | null => {
  const key = `${productName.toLowerCase().replace(/\s+/g, "-")}-${size.toLowerCase()}`;
  return recipes[key] || null;
};
