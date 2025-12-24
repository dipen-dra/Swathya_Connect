import React, { useState, useEffect } from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { StoreHeader } from '@/components/layout/StoreHeader';
import { StoreHero } from '@/components/store/StoreHero';
import { HealthConcerns } from '@/components/store/HealthConcerns';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from "@/contexts/AuthContext";
import { storeAPI, categoryAPI } from '@/services/api';
import ProductCard from '@/components/store/ProductCard';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Search, Filter, ShoppingCart, SlidersHorizontal, PackageX, Check, Star } from 'lucide-react';
import { toast } from 'sonner';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from "@/components/ui/separator";

export default function Store() {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();

    // Products State
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [totalProducts, setTotalProducts] = useState(0);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);

    // Filter State
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('all');
    const [categories, setCategories] = useState([]); // Dynamic Categories State
    const [priceRange, setPriceRange] = useState([0, 10000]);
    const [sort, setSort] = useState('newest');

    // Cart State
    const [cartItems, setCartItems] = useState(() => {
        const savedCart = localStorage.getItem('swasthya_cart');
        return savedCart ? JSON.parse(savedCart) : [];
    });

    useEffect(() => {
        fetchProducts(true); // Initial fetch, reset
        fetchCategories();
    }, []);

    // Update localStorage when cart changes
    useEffect(() => {
        localStorage.setItem('swasthya_cart', JSON.stringify(cartItems));
    }, [cartItems]);

    const fetchCategories = async () => {
        try {
            const response = await categoryAPI.getAll();
            if (response.data.success) {
                setCategories(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const fetchProducts = async (reset = false) => {
        try {
            setLoading(true);
            const currentPage = reset ? 1 : page;

            const params = {
                search,
                category: category !== 'all' ? category : undefined,
                minPrice: priceRange[0],
                maxPrice: priceRange[1],
                sort,
                page: currentPage,
                limit: 12
            };
            const response = await storeAPI.getProducts(params);
            if (response.data.success) {
                const newProducts = response.data.data;
                const total = response.data.total;

                if (reset) {
                    setProducts(newProducts);
                    setPage(1); // Ensure we are at page 1
                } else {
                    setProducts(prev => [...prev, ...newProducts]);
                }

                setTotalProducts(total);
                setHasMore(newProducts.length === 12); // Assuming limit is 12
            }
        } catch (error) {
            console.error('Error fetching products:', error);
            toast.error('Failed to load products');
        } finally {
            setLoading(false);
        }
    };

    const loadMore = () => {
        setPage(prev => prev + 1);
    };

    // Trigger fetch on page change (for Load More)
    useEffect(() => {
        if (page > 1) {
            fetchProducts(false);
        }
    }, [page]);

    // Debounce search and Filter changes
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchProducts(true); // Reset on filter change
        }, 500);
        return () => clearTimeout(timer);
    }, [search, category, sort]);

    const addToCart = (product) => {

        const existing = cartItems.find(item => item._id === product._id);

        if (existing) {
            if (existing.cartQuantity >= product.quantity) {
                toast.error('Cannot add more quantity than available stock');
                return;
            }
            setCartItems(prev =>
                prev.map(item =>
                    item._id === product._id
                        ? { ...item, cartQuantity: item.cartQuantity + 1 }
                        : item
                )
            );
            toast.success('Quantity updated in cart');
        } else {
            setCartItems(prev => [...prev, { ...product, cartQuantity: 1 }]);
            toast.success('Added to cart');
        }
    };

    // Helper to merge static 'all' with dynamic categories
    const getFilterCategories = () => {
        const dynamicCats = categories.map(c => c.name);
        // Combine with standard types if they aren't in dynamic list yet (optional, but safer to rely on API)
        // For now, let's just use 'all' + dynamic ones.
        // If the API returns empty, we might want to keep the defaults.
        if (dynamicCats.length === 0) {
            return ['all', 'otc', 'prescription', 'supplement', 'other'];
        }
        return ['all', ...dynamicCats];
    };

    const filterCategories = getFilterCategories();

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            {/* Header Section */}
            <StoreHeader
                cartCount={cartItems.length}
                searchValue={search}
                onSearchChange={setSearch}
            />

            <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Breadcrumbs */}
                <nav className="flex items-center text-sm text-gray-500 mb-6 animate-fade-in">
                    <button
                        onClick={() => { setCategory('all'); setSearch(''); setSelectedProduct(null); }}
                        className="flex items-center hover:text-teal-600 transition-colors"
                    >
                        <Home className="w-4 h-4 mr-1" />
                        Store
                    </button>
                    {category !== 'all' && (
                        <>
                            <ChevronRight className="w-4 h-4 mx-2" />
                            <span className="font-medium text-gray-900 capitalize">{category}</span>
                        </>
                    )}
                    {selectedProduct && (
                        <>
                            {category === 'all' && (
                                <>
                                    <ChevronRight className="w-4 h-4 mx-2" />
                                    <span className="capitalize hover:text-teal-600 cursor-pointer" onClick={() => { setSelectedProduct(null); setCategory(selectedProduct.category); }}>
                                        {selectedProduct.category}
                                    </span>
                                </>
                            )}
                            <ChevronRight className="w-4 h-4 mx-2" />
                            <span className="font-medium text-gray-900 truncate max-w-[200px]">
                                {selectedProduct.medicineName}
                            </span>
                        </>
                    )}
                </nav>
                {/* Mobile Search - Visible only on small screens */}
                <div className="mb-6 md:hidden">
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="Search..."
                            className="pl-9 bg-white"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                {/* Homepage Sections (Hero & Categories) - Only show when NOT searching/filtering */}
                {category === 'all' && !search && (
                    <div className="mb-12 animate-fade-in">
                        <StoreHero />
                        <HealthConcerns onCategorySelect={(cat) => setCategory(cat)} />
                        <div className="h-px bg-gray-200 my-8"></div>
                        <h3 className="text-xl font-bold text-gray-900 mb-6">Explore Products</h3>
                    </div>
                )}

                <div className="max-w-[1920px] mx-auto relative z-20 pb-20">
                    <div className="flex flex-col lg:flex-row gap-8">
                        {/* Filters Sidebar (Desktop) */}
                        <div className="hidden lg:block w-64 xl:w-72 flex-shrink-0">
                            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 sticky top-24">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                                        <Filter className="h-5 w-5 text-blue-600" /> Filters
                                    </h3>
                                    {(category !== 'all' || search) && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => { setCategory('all'); setSearch(''); }}
                                            className="text-xs text-red-500 hover:text-red-700 hover:bg-red-50 h-8 px-2"
                                        >
                                            Reset
                                        </Button>
                                    )}
                                </div>

                                {/* Categories */}
                                <div className="space-y-6">
                                    <div>
                                        <Label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 block">Categories</Label>
                                        <div className="space-y-1">
                                            {filterCategories.map(cat => (
                                                <button
                                                    key={cat}
                                                    onClick={() => setCategory(cat)}
                                                    className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-between group ${category === cat
                                                        ? 'bg-blue-50 text-blue-700'
                                                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                                        }`}
                                                >
                                                    <span className="capitalize">{cat === 'otc' ? 'OTC Medicines' : cat}</span>
                                                    {category === cat && <Check className="h-4 w-4 text-blue-600" />}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <Separator className="my-6" />

                                    {/* Sort Options */}
                                    <div>
                                        <Label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 block">Sort By</Label>
                                        <Select value={sort} onValueChange={setSort}>
                                            <SelectTrigger className="w-full bg-white border-gray-200">
                                                <SelectValue placeholder="Sort by" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="newest">Newest First</SelectItem>
                                                <SelectItem value="price_asc">Price: Low to High</SelectItem>
                                                <SelectItem value="price_desc">Price: High to Low</SelectItem>
                                                <SelectItem value="name_asc">Name: A to Z</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Mobile Filters Drawer */}
                        <div className="lg:hidden mb-6 flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                            <Sheet>
                                <SheetTrigger asChild>
                                    <Button variant="outline" className="flex-1 bg-white border-gray-200 shadow-sm">
                                        <SlidersHorizontal className="mr-2 h-4 w-4" /> Filters & Sort
                                    </Button>
                                </SheetTrigger>
                                <SheetContent side="bottom" className="h-[80vh] rounded-t-2xl">
                                    <SheetHeader>
                                        <SheetTitle>Filters</SheetTitle>
                                    </SheetHeader>
                                    <div className="py-6 space-y-6">
                                        <div className="space-y-3">
                                            <Label>Category</Label>
                                            <div className="grid grid-cols-2 gap-2">
                                                {filterCategories.map(cat => (
                                                    <Button
                                                        key={cat}
                                                        variant={category === cat ? "default" : "outline"}
                                                        className={`justify-start ${category === cat ? "bg-blue-600" : ""}`}
                                                        onClick={() => setCategory(cat)}
                                                    >
                                                        <span className="capitalize truncate">{cat === 'otc' ? 'OTC' : cat}</span>
                                                    </Button>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <Label>Sort By</Label>
                                            <Select value={sort} onValueChange={setSort}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Sort by" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="newest">Newest First</SelectItem>
                                                    <SelectItem value="price_asc">Price: Low to High</SelectItem>
                                                    <SelectItem value="price_desc">Price: High to Low</SelectItem>
                                                    <SelectItem value="name_asc">Name: A to Z</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </SheetContent>
                            </Sheet>
                        </div>

                        {/* Main Content */}
                        <div className="flex-1">
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8 flex items-center justify-between">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">
                                        {category === 'all' ? 'Featured Products' : <span className="capitalize">{category} Products</span>}
                                    </h2>
                                    <p className="text-sm text-gray-500 mt-1">
                                        Showing {products.length} {products.length === 1 ? 'product' : 'products'} available
                                    </p>
                                </div>
                            </div>

                            {loading ? (
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
                                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
                                        <div key={i} className="bg-white rounded-xl h-[280px] shadow-sm animate-pulse border border-gray-100 p-3">
                                            <div className="w-full h-32 bg-gray-100 rounded-lg mb-3"></div>
                                            <div className="h-4 bg-gray-100 rounded w-3/4 mb-2"></div>
                                            <div className="h-3 bg-gray-100 rounded w-1/2 mb-4"></div>
                                            <div className="flex justify-between mt-auto">
                                                <div className="h-6 bg-gray-100 rounded w-1/3"></div>
                                                <div className="h-6 bg-gray-100 rounded w-1/3"></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : products.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-24 text-center bg-white rounded-2xl border border-gray-100 shadow-sm">
                                    <div className="bg-gray-50 p-6 rounded-full mb-6 relative">
                                        <div className="absolute inset-0 bg-blue-100 opacity-20 rounded-full animate-ping"></div>
                                        <PackageX className="w-16 h-16 text-gray-400" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">No products found</h3>
                                    <p className="text-gray-500 max-w-sm mx-auto mb-8">
                                        We couldn't find any products matching your search criteria. Try different keywords or filters.
                                    </p>
                                    <Button
                                        variant="outline"
                                        onClick={() => { setSearch(''); setCategory('all'); }}
                                        className="border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300 transition-colors"
                                    >
                                        Clear All Filters
                                    </Button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
                                    {products.map((product) => (
                                        <ProductCard
                                            key={product._id}
                                            product={product}
                                            onAddToCart={addToCart}
                                            onViewDetails={(id) => {
                                                const product = products.find(p => p._id === id);
                                                setSelectedProduct(product);
                                            }}
                                        />
                                    ))}
                                </div>
                            )}

                            {hasMore && !loading && (
                                <div className="flex justify-center mt-12 mb-8">
                                    <Button
                                        variant="outline"
                                        onClick={loadMore}
                                        className="h-12 px-8 rounded-full border-2 border-blue-100 text-blue-600 font-bold hover:bg-blue-50 hover:border-blue-200 transition-all shadow-sm hover:shadow-md active:scale-95"
                                    >
                                        Load More Products
                                    </Button>
                                </div>
                            )}
                            {loading && products.length > 0 && (
                                <div className="flex justify-center mt-12 mb-8">
                                    <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>



                {/* Product Details Dialog */}
                <Dialog open={!!selectedProduct} onOpenChange={(open) => !open && setSelectedProduct(null)}>
                    <DialogContent className="max-w-4xl bg-white p-0 gap-0 overflow-hidden rounded-2xl shadow-2xl border-0">
                        {selectedProduct && (
                            <div className="flex flex-col md:flex-row h-full max-h-[90vh]">
                                <div className="w-full md:w-1/2 bg-gray-50 p-8 flex items-center justify-center relative overflow-hidden group">
                                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-gray-50 to-gray-100 opacity-50"></div>
                                    {selectedProduct.image ? (
                                        <img
                                            src={selectedProduct.image.startsWith('http') ? selectedProduct.image : `http://localhost:5000${selectedProduct.image}`}
                                            alt={selectedProduct.medicineName}
                                            className="max-h-[350px] w-full object-contain relative z-10 mix-blend-multiply group-hover:scale-110 transition-transform duration-500 ease-in-out"
                                        />
                                    ) : (
                                        <div className="relative z-10 flex flex-col items-center text-gray-300">
                                            <ShoppingCart className="w-24 h-24 mb-4" />
                                            <span className="text-sm font-medium">No Image Available</span>
                                        </div>
                                    )}
                                </div>


                                <div className="w-full md:w-1/2 p-8 flex flex-col h-full bg-white relative">
                                    {/* Modal Breadcrumb */}
                                    <div className="flex items-center text-xs text-gray-500 mb-4">
                                        <span className="hover:text-teal-600 cursor-pointer" onClick={() => { setSelectedProduct(null); setCategory('all'); }}>Store</span>
                                        <ChevronRight className="w-3 h-3 mx-1" />
                                        <span className="capitalize hover:text-teal-600 cursor-pointer" onClick={() => { setSelectedProduct(null); setCategory(selectedProduct.category); }}>
                                            {selectedProduct.category}
                                        </span>
                                        <ChevronRight className="w-3 h-3 mx-1" />
                                        <span className="font-medium text-gray-900 truncate max-w-[150px]">{selectedProduct.medicineName}</span>
                                    </div>

                                    <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                                        <div className="flex items-start justify-between mb-4">
                                            <Badge variant={selectedProduct.category === 'prescription' ? "destructive" : "secondary"} className="uppercase tracking-wide text-[10px] font-bold px-2 py-1">
                                                {selectedProduct.category}
                                            </Badge>
                                        </div>

                                        <h2 className="text-3xl font-bold text-gray-900 mb-2 leading-tight">{selectedProduct.medicineName}</h2>
                                        <p className="text-sm font-medium text-blue-600 mb-6 flex items-center gap-2">
                                            <span className="bg-blue-50 px-2 py-1 rounded-md">{selectedProduct.manufacturer}</span>
                                        </p>

                                        <div className="prose prose-sm text-gray-600 mb-8 max-w-none">
                                            <h4 className="text-gray-900 font-semibold mb-2 text-sm uppercase tracking-wider">Description</h4>
                                            <p className="leading-relaxed text-gray-500">
                                                {selectedProduct.description || 'Verified pharmaceutical product sourced directly from manufacturers. Ensure to read the label and follow dosage instructions carefully.'}
                                            </p>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 mb-6">
                                            {selectedProduct.genericName && (
                                                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                                                    <span className="text-xs text-gray-400 uppercase font-semibold block mb-1">Generic Name</span>
                                                    <span className="text-sm font-medium text-gray-900">{selectedProduct.genericName}</span>
                                                </div>
                                            )}
                                            {selectedProduct.dosage && (
                                                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                                                    <span className="text-xs text-gray-400 uppercase font-semibold block mb-1">Dosage</span>
                                                    <span className="text-sm font-medium text-gray-900">{selectedProduct.dosage}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="border-t pt-6 bg-white mt-auto z-10">
                                        <div className="flex items-end justify-between gap-4">
                                            <div>
                                                <p className="text-sm text-gray-500 mb-1">Price per unit</p>
                                                <p className="text-3xl font-bold text-gray-900 tracking-tight">
                                                    NPR {selectedProduct.price.toLocaleString()}
                                                </p>
                                                <p className={`text-xs font-medium mt-1 pl-1 flex items-center gap-1 ${selectedProduct.quantity > 0 ? 'text-green-600' : 'text-red-500'}`}>
                                                    <span className={`w-2 h-2 rounded-full ${selectedProduct.quantity > 0 ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                                    {selectedProduct.quantity > 0 ? `${selectedProduct.quantity} items in stock` : 'Out of stock'}
                                                </p>
                                            </div>

                                            <Button
                                                className="h-14 px-8 bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white shadow-lg shadow-blue-200 rounded-xl text-lg font-bold flex-1 max-w-[200px] transition-all duration-300 transform hover:-translate-y-1"
                                                onClick={() => {
                                                    addToCart(selectedProduct);
                                                    setSelectedProduct(null);
                                                }}
                                                disabled={selectedProduct.quantity <= 0}
                                            >
                                                <ShoppingCart className="w-5 h-5 mr-2" />
                                                Add to Cart
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </DialogContent>
                </Dialog>
            </div>
        </div >
    );
}
