import React, { useState, useEffect } from 'react';
import { ChevronRight, Home } from 'lucide-react';
import Logo from '@/assets/swasthyalogo.png';
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
import { Search, Filter, ShoppingCart, SlidersHorizontal, PackageX, Check, Star, X, LayoutGrid, Pill, ClipboardList, Zap, Package } from 'lucide-react';
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
        }, 300); // Reduced from 500ms for faster feedback
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

    const handleBuyNow = (product) => {
        addToCart(product);
        if (!user) {
            toast.error("Please login to proceed to checkout");
            navigate('/login', { state: { from: { pathname: '/patient/checkout' } } });
            return;
        }
        navigate('/patient/checkout');
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
                <nav className="flex items-center text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] mb-10 animate-fade-in">
                    <button
                        onClick={() => { setCategory('all'); setSearch(''); setSelectedProduct(null); }}
                        className="flex items-center hover:text-teal-600 transition-colors"
                    >
                        <Home className="w-3.5 h-3.5 mr-2" />
                        Store
                    </button>
                    {category !== 'all' && (
                        <>
                            <ChevronRight className="w-3 h-3 mx-3 text-gray-300" />
                            <span className="text-gray-900">{category}</span>
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
                    <div className="mb-16 animate-fade-in">
                        <StoreHero />
                        <HealthConcerns onCategorySelect={(cat) => setCategory(cat)} />
                        <div className="h-px bg-gray-100 my-16"></div>
                        <h3 className="text-3xl font-black text-gray-900 mb-10 tracking-tight">Explore Products</h3>
                    </div>
                )}

                <div className="max-w-[1920px] mx-auto relative z-20 pb-20">
                    <div className="flex flex-col lg:flex-row gap-8">
                        {/* Filters Sidebar (Desktop) - Refined & Premium */}
                        <div className="hidden lg:block w-72 xl:w-80 flex-shrink-0">
                            <div className="bg-white rounded-[2.5rem] shadow-[0_10px_40px_rgba(0,0,0,0.03)] border border-gray-50 p-10 sticky top-24">
                                <div className="flex items-center justify-between mb-10">
                                    <div>
                                        <h3 className="font-bold text-gray-900 text-2xl font-serif tracking-tight">Filters</h3>
                                        <div className="h-1 w-8 bg-teal-600 rounded-full mt-1.5"></div>
                                    </div>
                                    {(category !== 'all' || search) && (
                                        <button
                                            onClick={() => { setCategory('all'); setSearch(''); }}
                                            className="text-[10px] font-black text-red-500 uppercase tracking-widest hover:text-red-600 transition-colors"
                                        >
                                            Reset
                                        </button>
                                    )}
                                </div>

                                {/* Categories Section */}
                                <div className="space-y-10">
                                    <div>
                                        <Label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-6 block px-1">Browse Categories</Label>
                                        <div className="space-y-2">
                                            {filterCategories.map(cat => {
                                                // Icon mapping for categories
                                                const getIcon = (c) => {
                                                    switch(c.toLowerCase()) {
                                                        case 'all': return <LayoutGrid className="w-4 h-4" />;
                                                        case 'otc': return <Pill className="w-4 h-4" />;
                                                        case 'prescription': return <ClipboardList className="w-4 h-4" />;
                                                        case 'supplement': return <Zap className="w-4 h-4" />;
                                                        default: return <Package className="w-4 h-4" />;
                                                    }
                                                };

                                                return (
                                                    <button
                                                        key={cat}
                                                        onClick={() => setCategory(cat)}
                                                        className={`w-full text-left px-5 py-4 rounded-2xl text-sm font-bold transition-all duration-300 flex items-center gap-4 group relative overflow-hidden ${
                                                            category === cat
                                                                ? 'bg-teal-600 text-white shadow-lg shadow-teal-100'
                                                                : 'text-gray-500 hover:bg-teal-50 hover:text-teal-600'
                                                        }`}
                                                    >
                                                        <span className={`transition-transform duration-300 ${category === cat ? 'scale-110' : 'group-hover:scale-110 opacity-70'}`}>
                                                            {getIcon(cat)}
                                                        </span>
                                                        <span className="capitalize z-10 flex-1">{cat === 'otc' ? 'OTC Medicines' : cat}</span>
                                                        {category === cat && (
                                                            <Check className="h-4 w-4 text-white z-10 animate-in zoom-in duration-300" />
                                                        )}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    <div className="h-px bg-gray-50 mx-2"></div>

                                    {/* Sort Options */}
                                    <div>
                                        <Label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-6 block px-1">Sort By</Label>
                                        <Select value={sort} onValueChange={setSort}>
                                            <SelectTrigger className="w-full h-14 bg-gray-50 border-0 rounded-2xl font-bold text-gray-700 px-6 focus:ring-2 focus:ring-teal-600/20 hover:bg-gray-100 transition-colors">
                                                <div className="flex items-center gap-3">
                                                    <SlidersHorizontal className="w-4 h-4 text-teal-600" />
                                                    <SelectValue placeholder="Sort by" />
                                                </div>
                                            </SelectTrigger>
                                            <SelectContent className="rounded-2xl border-0 shadow-2xl p-2">
                                                <SelectItem value="newest" className="rounded-xl py-3 font-bold text-gray-600">Newest First</SelectItem>
                                                <SelectItem value="price_asc" className="rounded-xl py-3 font-bold text-gray-600">Price: Low to High</SelectItem>
                                                <SelectItem value="price_desc" className="rounded-xl py-3 font-bold text-gray-600">Price: High to Low</SelectItem>
                                                <SelectItem value="name_asc" className="rounded-xl py-3 font-bold text-gray-600">Name: A to Z</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Help Card */}
                                    <div className="mt-12 bg-gray-900 rounded-[2rem] p-8 text-white relative overflow-hidden group">
                                        <div className="absolute -right-8 -bottom-8 bg-teal-600 w-24 h-24 rounded-full blur-3xl opacity-20 group-hover:scale-150 transition-transform duration-1000"></div>
                                        <h4 className="font-bold text-lg mb-2 relative z-10">Need Help?</h4>
                                        <p className="text-gray-400 text-[11px] leading-relaxed mb-6 relative z-10 font-medium">Our licensed pharmacists are here to assist you with your orders.</p>
                                        <button className="w-full py-3 bg-white/10 hover:bg-white/20 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors relative z-10">
                                            Chat Now
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>



                        {/* Mobile Filters Drawer */}
                        <div className="lg:hidden mb-10 flex gap-4 overflow-x-auto pb-4 no-scrollbar">
                            <Sheet>
                                <SheetTrigger asChild>
                                    <Button variant="outline" className="flex-1 h-14 bg-white border-gray-100 shadow-sm rounded-2xl font-bold text-gray-700 hover:bg-gray-50 transition-all active:scale-95">
                                        <SlidersHorizontal className="mr-3 h-4 w-4 text-teal-600" /> Filters & Sort
                                    </Button>
                                </SheetTrigger>
                                <SheetContent side="bottom" className="h-[85vh] rounded-t-[3rem] bg-white border-0 shadow-2xl p-0 overflow-hidden">
                                    <div className="p-10 flex flex-col h-full">
                                        <div className="flex items-center justify-between mb-10">
                                            <div>
                                                <SheetTitle className="text-3xl font-bold text-gray-900 font-serif tracking-tight">Filters</SheetTitle>
                                                <div className="h-1 w-8 bg-teal-600 rounded-full mt-1.5"></div>
                                            </div>
                                            {(category !== 'all' || search) && (
                                                <button
                                                    onClick={() => { setCategory('all'); setSearch(''); }}
                                                    className="text-[10px] font-black text-red-500 uppercase tracking-widest"
                                                >
                                                    Reset
                                                </button>
                                            )}
                                        </div>

                                        <div className="flex-1 overflow-y-auto space-y-12 pb-10 no-scrollbar">
                                            {/* Categories Section */}
                                            <div className="space-y-6">
                                                <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Categories</Label>
                                                <div className="grid grid-cols-2 gap-3">
                                                    {filterCategories.map(cat => {
                                                        const getIcon = (c) => {
                                                            switch(c.toLowerCase()) {
                                                                case 'all': return <LayoutGrid className="w-4 h-4" />;
                                                                case 'otc': return <Pill className="w-4 h-4" />;
                                                                case 'prescription': return <ClipboardList className="w-4 h-4" />;
                                                                case 'supplement': return <Zap className="w-4 h-4" />;
                                                                default: return <Package className="w-4 h-4" />;
                                                            }
                                                        };

                                                        return (
                                                            <button
                                                                key={cat}
                                                                className={`h-16 rounded-2xl font-bold transition-all duration-300 flex items-center justify-center gap-3 border ${
                                                                    category === cat 
                                                                        ? 'bg-teal-600 text-white border-transparent shadow-lg shadow-teal-100' 
                                                                        : 'bg-gray-50 text-gray-500 border-transparent hover:bg-gray-100'
                                                                }`}
                                                                onClick={() => setCategory(cat)}
                                                            >
                                                                <span className="opacity-80">{getIcon(cat)}</span>
                                                                <span className="capitalize truncate text-xs">{cat === 'otc' ? 'OTC' : cat}</span>
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>

                                            {/* Sort Section */}
                                            <div className="space-y-6">
                                                <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Sort By</Label>
                                                <div className="space-y-2">
                                                    {[
                                                        { id: 'newest', label: 'Newest First' },
                                                        { id: 'price_asc', label: 'Price: Low to High' },
                                                        { id: 'price_desc', label: 'Price: High to Low' },
                                                        { id: 'name_asc', label: 'Name: A to Z' }
                                                    ].map((item) => (
                                                        <button
                                                            key={item.id}
                                                            onClick={() => setSort(item.id)}
                                                            className={`w-full h-14 rounded-2xl px-6 font-bold text-sm transition-all flex items-center justify-between ${
                                                                sort === item.id 
                                                                    ? 'bg-gray-900 text-white' 
                                                                    : 'bg-gray-50 text-gray-500'
                                                            }`}
                                                        >
                                                            {item.label}
                                                            {sort === item.id && <Check className="w-4 h-4" />}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="pt-6 mt-auto">
                                            <SheetTrigger asChild>
                                                <Button className="w-full h-16 bg-teal-600 hover:bg-teal-700 text-white rounded-2xl font-black text-lg shadow-xl shadow-teal-100 transition-all active:scale-95">
                                                    Apply Filters
                                                </Button>
                                            </SheetTrigger>
                                        </div>

                                    </div>
                                </SheetContent>
                            </Sheet>
                        </div>


                        {/* Main Content */}
                        <div className="flex-1">
                            <div className="bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-gray-100 p-8 mb-10 flex items-center justify-between">
                                <div>
                                    <h2 className="text-2xl font-black text-gray-900 tracking-tight">
                                        {category === 'all' ? 'Featured Products' : <span className="capitalize">{category} Products</span>}
                                    </h2>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                                        Found {products.length} {products.length === 1 ? 'exceptional item' : 'exceptional items'}
                                    </p>
                                </div>
                            </div>

                            {loading ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
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
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
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
                    <DialogContent className="max-w-lg bg-white p-0 gap-0 overflow-hidden rounded-[2.5rem] shadow-[0_20px_60px_rgba(0,0,0,0.1)] border-0">
                        {selectedProduct && (
                            <div className="flex flex-col">
                                {/* Top: Immersive Image */}
                                <div className="relative h-56 sm:h-64 bg-gray-50 flex items-center justify-center overflow-hidden">
                                    {selectedProduct.image ? (
                                        <img
                                            src={selectedProduct.image.startsWith('http') ? selectedProduct.image : `${import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace("/api", "") : "http://localhost:8080"}${selectedProduct.image}`}
                                            alt={selectedProduct.medicineName}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-in-out"
                                            onError={(e) => { e.target.onerror = null; e.target.src = Logo; }}
                                        />
                                    ) : (
                                        <div className="flex flex-col items-center text-gray-200">
                                            <ShoppingCart className="w-16 h-16 mb-2 opacity-20" />
                                            <span className="text-[10px] font-bold uppercase tracking-widest">No Image</span>
                                        </div>
                                    )}
                                    
                                    {/* Close Button Hint */}
                                    <button 
                                        onClick={() => setSelectedProduct(null)}
                                        className="absolute top-4 right-4 w-8 h-8 bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors z-50"
                                    >
                                        <X className="w-4 h-4 text-gray-900" />
                                    </button>
                                </div>

                                {/* Bottom: Clean Content Area */}
                                <div className="p-8 sm:p-10">
                                    <div className="mb-6">
                                        <div className="flex items-center gap-2 mb-2">
                                            <p className="text-[10px] font-black text-teal-600 uppercase tracking-[0.2em]">
                                                {selectedProduct.manufacturer || 'Pharmacy Special'}
                                            </p>
                                            <div className="h-1 w-1 bg-gray-300 rounded-full"></div>
                                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                                                {selectedProduct.category}
                                            </p>
                                        </div>
                                        
                                        <h2 className="text-2xl font-bold text-gray-900 mb-3 font-serif leading-tight">
                                            {selectedProduct.medicineName}
                                        </h2>
                                        
                                        <div className="flex flex-wrap gap-2 mb-4">
                                            {selectedProduct.genericName && (
                                                <span className="bg-gray-50 px-2 py-1 rounded-lg text-[10px] font-bold text-gray-500 border border-gray-100">
                                                    {selectedProduct.genericName}
                                                </span>
                                            )}
                                            {selectedProduct.dosage && (
                                                <span className="bg-gray-50 px-2 py-1 rounded-lg text-[10px] font-bold text-gray-500 border border-gray-100">
                                                    {selectedProduct.dosage}
                                                </span>
                                            )}
                                        </div>

                                        <p className="text-gray-500 leading-relaxed text-sm font-medium line-clamp-3">
                                            {selectedProduct.description || 'Premium quality pharmaceutical product. Sourced directly from verified manufacturers to ensure safety and efficacy.'}
                                        </p>
                                    </div>

                                    {/* Footer: Price and Buttons */}
                                    <div className="flex flex-col items-stretch gap-6 pt-6 border-t border-gray-50">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-baseline gap-1">
                                                <span className="text-xs font-bold text-gray-900">Rs.</span>
                                                <span className="text-2xl font-black text-gray-900 tracking-tight">
                                                    {selectedProduct.price.toLocaleString()}
                                                </span>
                                            </div>
                                            <span className="text-[9px] font-bold text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-md uppercase tracking-widest">
                                                In Stock
                                            </span>
                                        </div>

                                        <div className="flex gap-2">
                                            <Button
                                                variant="outline"
                                                className="h-12 flex-1 rounded-xl border-gray-100 text-gray-600 text-xs font-bold hover:bg-gray-50 transition-all active:scale-95"
                                                onClick={() => {
                                                    addToCart(selectedProduct);
                                                    setSelectedProduct(null);
                                                }}
                                                disabled={selectedProduct.quantity <= 0}
                                            >
                                                Add to Cart
                                            </Button>
                                            <Button
                                                className="h-12 flex-1 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-black text-sm shadow-lg shadow-teal-100 transition-all active:scale-95"
                                                onClick={() => {
                                                    handleBuyNow(selectedProduct);
                                                    setSelectedProduct(null);
                                                }}
                                                disabled={selectedProduct.quantity <= 0}
                                            >
                                                Buy Now
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
