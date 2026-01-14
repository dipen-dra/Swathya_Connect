import React, { useState, useEffect } from 'react';
import {
    Plus, Search, Image as ImageIcon, Edit, Trash2,
    Check, X, Upload, Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { categoryAPI } from '@/services/api';

export function CategoryManager({ categories, onCategoryUpdate }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [showDialog, setShowDialog] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        imageFile: null,
        imagePreview: null
    });

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData(prev => ({
                ...prev,
                imageFile: file,
                imagePreview: URL.createObjectURL(file)
            }));
        }
    };

    const handleSubmit = async () => {
        if (!formData.name) {
            toast.error('Category name is required');
            return;
        }

        try {
            setIsSubmitting(true);
            const submitData = new FormData();
            submitData.append('name', formData.name);
            submitData.append('description', formData.description);
            if (formData.imageFile) {
                submitData.append('image', formData.imageFile);
            }

            const response = await categoryAPI.create(submitData);
            if (response.data.success) {
                toast.success('Category created successfully');
                setShowDialog(false);
                setFormData({ name: '', description: '', imageFile: null, imagePreview: null });
                if (onCategoryUpdate) onCategoryUpdate(); // Refresh parent
            }
        } catch (error) {
            console.error('Error creating category:', error);
            toast.error(error.response?.data?.error || 'Failed to create category');
        } finally {
            setIsSubmitting(false);
        }
    };

    const filteredCategories = categories.filter(cat =>
        cat.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div className="relative w-72">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                        placeholder="Search categories..."
                        className="pl-10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <Button onClick={() => setShowDialog(true)} className="bg-teal-600 hover:bg-teal-700">
                    <Plus className="h-4 w-4 mr-2" /> Add Category
                </Button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {filteredCategories.map((cat) => (
                    <div key={cat._id} className="bg-white border border-gray-100 rounded-xl p-4 flex flex-col items-center hover:shadow-md transition-shadow">
                        <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mb-3 overflow-hidden border border-gray-100">
                            {cat.image ? (
                                <img src={`http://localhost:5000${cat.image}`} alt={cat.name} className="w-full h-full object-cover" />
                            ) : (
                                <ImageIcon className="h-8 w-8 text-gray-300" />
                            )}
                        </div>
                        <h3 className="font-semibold text-gray-900 text-center text-sm">{cat.name}</h3>
                        <p className="text-xs text-gray-500 mt-1">{cat.description || 'No description'}</p>
                    </div>
                ))}
            </div>

            {/* Create Dialog */}
            <Dialog open={showDialog} onOpenChange={setShowDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add New Category</DialogTitle>
                        <DialogDescription>Create a category to organize your medicines.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div>
                            <Label>Category Name *</Label>
                            <Input
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="e.g. Skin Care"
                            />
                        </div>
                        <div>
                            <Label>Description</Label>
                            <Input
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Brief description..."
                            />
                        </div>
                        <div>
                            <Label>Category Image</Label>
                            <div className="mt-2 flex items-center gap-4">
                                <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden border">
                                    {formData.imagePreview ? (
                                        <img src={formData.imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                    ) : (
                                        <ImageIcon className="h-6 w-6 text-gray-400" />
                                    )}
                                </div>
                                <div className="flex-1">
                                    <input
                                        type="file"
                                        id="cat-image"
                                        className="hidden"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                    />
                                    <Label htmlFor="cat-image" className="cursor-pointer inline-flex items-center px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-sm font-medium">
                                        <Upload className="h-4 w-4 mr-2" /> Upload Image
                                    </Label>
                                </div>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
                        <Button onClick={handleSubmit} disabled={isSubmitting} className="bg-teal-600">
                            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create Category'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
