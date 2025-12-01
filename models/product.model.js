class Product {
  constructor({ 
    Id, 
    Name, 
    Description, 
    Price, 
    ImageUrl, 
    Stock, 
    CategoryId,
    CategoryName,  
    OutOfStock,
    AverageRating
  }) {
    this.Id = Id;
    this.Name = Name;
    this.Description = Description;
    this.Price = Price;
    this.ImageUrl = ImageUrl;
    this.Stock = Stock;
    this.CategoryId = CategoryId?.toString() || null;
    this.CategoryName = CategoryName; 
    this.OutOfStock = OutOfStock || false;
    this.AverageRating = AverageRating || 0;
  }
}

module.exports = Product;
