export interface Category {
  name: string;
  slug: string;
  icon: string;
}

export const categories: Category[] = [
  { name: "Whiskey", slug: "whiskey", icon: "mdi:bottle-tonic-outline" },
  { name: "Wine", slug: "wine", icon: "mdi:glass-wine" },
  { name: "Vodka", slug: "vodka", icon: "mdi:bottle-tonic-plus-outline" },
  { name: "Rum", slug: "rum", icon: "game-icons:tequila-sunrise" },
  { name: "Gin", slug: "gin", icon: "mdi:cup-outline" },
  { name: "Beer", slug: "beer", icon: "mdi:beer-outline" },
];

export type ProductTag = "best-seller" | "staff-pick" | "new-arrival" | "on-sale";

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  volume: string;
  abv: string;
  price: number;
  originalPrice?: number;
  rating: number;
  tags?: ProductTag[];
  description?: string;
  origin?: string;
  image: string;
  inStock: boolean;
}

// Placeholder bottle photography — swap these for real per-product shots at /products/<id>.jpg
const placeholderImages = [
  "/Test/test_1.jpeg",
  "/Test/test_2.jpeg",
  "/Test/test_3.jpeg",
  "/Test/test_4.jpeg",
  "/Test/test_5.jpeg",
  "/Test/test_6.jpeg",
];

const placeholderImage = (index: number) => placeholderImages[index % placeholderImages.length];

export const products: Product[] = [
  { id: "p1", name: "Ashford Reserve", brand: "Ashford Distillery", category: "Whiskey", volume: "750ml", abv: "43%", price: 68, rating: 4.8, tags: ["best-seller"], description: "A smooth, oak-aged whiskey with notes of caramel and dried fruit.", origin: "Kentucky, USA", image: placeholderImage(0), inStock: true },
  { id: "p2", name: "Chateau Noir", brand: "Chateau Noir Vineyards", category: "Wine", volume: "750ml", abv: "13.5%", price: 42, rating: 4.6, tags: ["staff-pick"], description: "A full-bodied red blend with soft tannins and a lingering finish.", origin: "Bordeaux, France", image: placeholderImage(1), inStock: true },
  { id: "p3", name: "Silver Peak", brand: "Silver Peak Distilling", category: "Vodka", volume: "1L", abv: "40%", price: 35, rating: 4.5, tags: ["best-seller"], description: "Triple-distilled for a clean, crisp pour.", origin: "Idaho, USA", image: placeholderImage(2), inStock: true },
  { id: "p4", name: "Spiced Mariner", brand: "Mariner Rum Co.", category: "Rum", volume: "750ml", abv: "37.5%", price: 39, originalPrice: 46, rating: 4.4, tags: ["on-sale"], description: "Warm spice and dark molasses in every glass.", origin: "Caribbean", image: placeholderImage(3), inStock: true },
  { id: "p5", name: "Juniper & Co.", brand: "Juniper & Co.", category: "Gin", volume: "700ml", abv: "41%", price: 46, rating: 4.7, tags: ["staff-pick", "new-arrival"], description: "Botanical-forward gin with citrus and pine on the nose.", origin: "London, England", image: placeholderImage(4), inStock: true },
  { id: "p6", name: "Golden Barrel", brand: "Golden Barrel Bourbon Co.", category: "Whiskey", volume: "700ml", abv: "46%", price: 89, rating: 4.9, tags: ["staff-pick"], description: "Small-batch bourbon finished in charred oak barrels.", origin: "Kentucky, USA", image: placeholderImage(5), inStock: true },
  { id: "p7", name: "Amber Craft Lager", brand: "Amber Brewing Co.", category: "Beer", volume: "6x330ml", abv: "5%", price: 18, rating: 4.2, tags: ["best-seller"], description: "A crisp, malt-forward lager brewed in small batches.", origin: "Baltimore, MD, USA", image: placeholderImage(6), inStock: true },
  { id: "p8", name: "Velvet Merlot", brand: "Velvet Cellars", category: "Wine", volume: "750ml", abv: "14%", price: 54, rating: 4.6, tags: ["on-sale"], originalPrice: 64, description: "Silky merlot with notes of black cherry and cocoa.", origin: "Napa Valley, USA", image: placeholderImage(7), inStock: true },
  { id: "p9", name: "Highland Mist", brand: "Highland Mist Distillery", category: "Whiskey", volume: "750ml", abv: "40%", price: 74, rating: 4.7, tags: ["new-arrival"], description: "Single malt with a gentle smoke and honeyed sweetness.", origin: "Speyside, Scotland", image: placeholderImage(8), inStock: true },
  { id: "p10", name: "Coastal Blanc", brand: "Coastal Vineyards", category: "Wine", volume: "750ml", abv: "12.5%", price: 32, rating: 4.4, tags: ["new-arrival"], description: "A bright, mineral-driven white with citrus and green apple.", origin: "Sonoma County, USA", image: placeholderImage(9), inStock: true },
  { id: "p11", name: "Blue Agave Gold", brand: "Blue Agave Co.", category: "Rum", volume: "750ml", abv: "38%", price: 58, rating: 4.6, tags: ["best-seller", "new-arrival"], description: "Aged rum with a smooth caramel finish.", origin: "Jamaica", image: placeholderImage(10), inStock: true },
  { id: "p12", name: "Frostline Vodka", brand: "Frostline Spirits", category: "Vodka", volume: "1L", abv: "40%", price: 29, originalPrice: 34, rating: 4.3, tags: ["on-sale"], description: "An everyday-clean vodka perfect for cocktails.", origin: "Sweden", image: placeholderImage(11), inStock: true },
  { id: "p13", name: "Copper Kettle IPA", brand: "Copper Kettle Brewing", category: "Beer", volume: "6x330ml", abv: "6.2%", price: 20, rating: 4.5, tags: ["staff-pick", "new-arrival"], description: "Hop-forward IPA with a citrus and pine aroma.", origin: "Portland, OR, USA", image: placeholderImage(12), inStock: false },
  { id: "p14", name: "Emberwood Rye", brand: "Emberwood Distillery", category: "Whiskey", volume: "750ml", abv: "45%", price: 62, originalPrice: 72, rating: 4.6, tags: ["on-sale", "best-seller"], description: "A spicy rye whiskey with a bold, peppery finish.", origin: "Pennsylvania, USA", image: placeholderImage(13), inStock: true },
  { id: "p15", name: "Botanical Rose Gin", brand: "Botanical Rose Co.", category: "Gin", volume: "700ml", abv: "40%", price: 49, rating: 4.5, tags: ["new-arrival"], description: "Delicate floral gin infused with rose petals and citrus peel.", origin: "Provence, France", image: placeholderImage(14), inStock: true },
  { id: "p16", name: "Harbor Light Pilsner", brand: "Harbor Light Brewing", category: "Beer", volume: "6x330ml", abv: "4.8%", price: 16, rating: 4.1, tags: ["best-seller"], description: "A light, refreshing pilsner with a clean finish.", origin: "Baltimore, MD, USA", image: placeholderImage(15), inStock: false },
];

export interface MixerProduct {
  id: string;
  name: string;
  volume: string;
  price: number;
  rating: number;
  image: string;
}

export const mixerProducts: MixerProduct[] = [
  { id: "m1", name: "Tonic Water 4-Pack", volume: "4x200ml", price: 6, rating: 4.5, image: placeholderImage(0) },
  { id: "m2", name: "Ginger Beer 4-Pack", volume: "4x200ml", price: 7, rating: 4.6, image: placeholderImage(1) },
  { id: "m3", name: "Craft Cola 4-Pack", volume: "4x330ml", price: 6, rating: 4.3, image: placeholderImage(2) },
  { id: "m4", name: "Fresh Lime Juice", volume: "500ml", price: 5, rating: 4.4, image: placeholderImage(3) },
  { id: "m5", name: "Cocktail Bitters Set", volume: "3x100ml", price: 22, rating: 4.8, image: placeholderImage(4) },
  { id: "m6", name: "Sea Salt Rimmer", volume: "150g", price: 4, rating: 4.2, image: placeholderImage(5) },
  { id: "m7", name: "Premium Ice Mold Tray", volume: "1 unit", price: 12, rating: 4.5, image: placeholderImage(0) },
  { id: "m8", name: "Cocktail Shaker Set", volume: "1 unit", price: 28, rating: 4.7, image: placeholderImage(1) },
];

export const mixerAsProducts: Product[] = mixerProducts.map((mixer) => ({
  id: mixer.id,
  name: mixer.name,
  brand: "Hamilton Liquor Store",
  category: "Mixer",
  volume: mixer.volume,
  abv: "0%",
  price: mixer.price,
  rating: mixer.rating,
  description: "A bar-cart essential to round out your order.",
  image: mixer.image,
  inStock: true,
}));

export const allProducts: Product[] = [...products, ...mixerAsProducts];

export const spiritCategories = ["Whiskey", "Vodka", "Rum", "Gin"];

export type TopCategory = "Wine" | "Spirits" | "Beer" | "Mixer";

export const topCategorySlugs: Record<TopCategory, string> = {
  Wine: "wine",
  Spirits: "spirits",
  Beer: "beer",
  Mixer: "mixers-extras",
};

export const getTopCategory = (product: Product): TopCategory => {
  if (product.category === "Wine") return "Wine";
  if (product.category === "Beer") return "Beer";
  if (product.category === "Mixer") return "Mixer";
  return "Spirits";
};

export const getProductById = (id: string) => allProducts.find((product) => product.id === id);

export const getProductsByCategory = (category: string) =>
  products.filter((product) => product.category === category);

export const getProductsBySpirits = () =>
  products.filter((product) => spiritCategories.includes(product.category));

export const getProductsByTag = (tag: ProductTag) =>
  products.filter((product) => product.tags?.includes(tag));
