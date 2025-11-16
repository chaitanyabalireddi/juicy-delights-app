import { useState, useEffect, useRef, ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Package, Edit2, Save, X, Image as ImageIcon, DollarSign, Plus, Trash2, Loader2 } from 'lucide-react';
import api from '@/lib/api';
import Header from '@/components/Header';
import { toast } from '@/hooks/use-toast';

interface Product {
  _id: string;
  name: string;
  description?: string;
  price: number;
  originalPrice?: number;
  images: string[];
  stock: {
    available: number;
    reserved: number;
    minThreshold: number;
  };
  category: string;
}

interface UploadResponse {
  success: boolean;
  message?: string;
  data: {
    url: string;
    publicId?: string;
    provider?: string;
  };
}

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5 MB

const getErrorMessage = (error: unknown, fallback: string) => {
  if (error instanceof Error && error.message) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return fallback;
};

const AdminStock = () => {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingField, setEditingField] = useState<'stock' | 'price' | 'images' | 'name' | null>(null);
  const [stockValue, setStockValue] = useState<number>(0);
  const [priceValue, setPriceValue] = useState<number>(0);
  const [originalPriceValue, setOriginalPriceValue] = useState<number>(0);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [newImageUrl, setNewImageUrl] = useState<string>('');
  const [nameValue, setNameValue] = useState<string>('');
  const [descriptionValue, setDescriptionValue] = useState<string>('');
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: 0,
    originalPrice: 0,
    category: '',
    images: [] as string[],
    unit: 'kg',
    origin: 'India',
    stock: { available: 0, reserved: 0, minThreshold: 5 }
  });
  const newImageInputRef = useRef<HTMLInputElement | null>(null);
  const editImageInputRef = useRef<HTMLInputElement | null>(null);
  const [isUploadingNewImages, setIsUploadingNewImages] = useState(false);
  const [isUploadingEditImages, setIsUploadingEditImages] = useState(false);

  useEffect(() => {
    if (!isAdmin) {
      navigate('/login');
      return;
    }
    fetchProducts();
  }, [isAdmin, navigate]);

  const fetchProducts = async () => {
    try {
      const response = await api.get<{ success: boolean; data: { products: Product[] } }>(
        '/products',
        false
      );
      if (response.success) {
        setProducts(response.data.products || response.data || []);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (product: Product, field: 'stock' | 'price' | 'images' | 'name') => {
    setEditingId(product._id);
    setEditingField(field);
    if (field === 'stock') {
      setStockValue(product.stock.available);
    } else if (field === 'price') {
      setPriceValue(product.price);
      setOriginalPriceValue(product.originalPrice || product.price);
    } else if (field === 'images') {
      setImageUrls([...product.images]);
      setNewImageUrl('');
    } else if (field === 'name') {
      setNameValue(product.name);
      setDescriptionValue(product.description || '');
    }
  };

  const handleSave = async (productId: string) => {
    try {
      if (editingField === 'stock') {
        await api.put(
          `/products/${productId}/stock`,
          { available: stockValue },
          true
        );
      } else if (editingField === 'price') {
        await api.put(
          `/products/${productId}`,
          { 
            price: priceValue,
            originalPrice: originalPriceValue > priceValue ? originalPriceValue : undefined
          },
          true
        );
      } else if (editingField === 'images') {
        await api.put(
          `/products/${productId}`,
          { images: imageUrls },
          true
        );
      } else if (editingField === 'name') {
        await api.put(
          `/products/${productId}`,
          { name: nameValue, description: descriptionValue },
          true
        );
      }
      await fetchProducts();
      handleCancel();
      toast({
        title: 'Success',
        description: 'Product updated successfully',
      });
    } catch (error: unknown) {
      toast({
        title: 'Error',
        description: 'Failed to update: ' + getErrorMessage(error, 'Unknown error'),
        variant: 'destructive'
      });
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditingField(null);
    setStockValue(0);
    setPriceValue(0);
    setOriginalPriceValue(0);
    setImageUrls([]);
    setNewImageUrl('');
    setNameValue('');
    setDescriptionValue('');
  };

  const handleCreateProduct = async () => {
    try {
      if (!newProduct.name || !newProduct.description || newProduct.price <= 0 || newProduct.images.length === 0 || !newProduct.category) {
        toast({
          title: 'Validation Error',
          description: 'Please fill in all required fields (name, description, price, category, and at least one image)',
          variant: 'destructive'
        });
        return;
      }

      await api.post('/products', newProduct, true);
      await fetchProducts();
      setIsAddingProduct(false);
      setNewProduct({
        name: '',
        description: '',
        price: 0,
        originalPrice: 0,
        category: '',
        images: [],
        unit: 'kg',
        origin: 'India',
        stock: { available: 0, reserved: 0, minThreshold: 5 }
      });
      setNewImageUrl('');
      toast({
        title: 'Success',
        description: 'Product created successfully',
      });
    } catch (error: unknown) {
      toast({
        title: 'Error',
        description: 'Failed to create product: ' + getErrorMessage(error, 'Unknown error'),
        variant: 'destructive'
      });
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) {
      return;
    }

    try {
      await api.delete(`/products/${productId}`, true);
      await fetchProducts();
      toast({
        title: 'Success',
        description: 'Product deleted successfully',
      });
    } catch (error: unknown) {
      toast({
        title: 'Error',
        description: 'Failed to delete product: ' + getErrorMessage(error, 'Unknown error'),
        variant: 'destructive'
      });
    }
  };

  const addImageUrl = () => {
    if (newImageUrl.trim()) {
      setImageUrls([...imageUrls, newImageUrl.trim()]);
      setNewImageUrl('');
    }
  };

  const removeImageUrl = (index: number) => {
    setImageUrls(imageUrls.filter((_, i) => i !== index));
  };

  const handleDeviceImageUpload = async (
    event: ChangeEvent<HTMLInputElement>,
    target: 'new' | 'edit'
  ) => {
    const files = event.target.files;
    if (!files || files.length === 0) {
      return;
    }

    const imageFiles = Array.from(files).filter((file) => file.type.startsWith('image/'));
    if (imageFiles.length === 0) {
      toast({
        title: 'Invalid file type',
        description: 'Only image files are supported.',
        variant: 'destructive'
      });
      return;
    }

    const setUploadingState = target === 'new' ? setIsUploadingNewImages : setIsUploadingEditImages;
    setUploadingState(true);

    try {
      const uploadedUrls: string[] = [];

      for (const file of imageFiles) {
        if (file.size > MAX_IMAGE_SIZE) {
          throw new Error(`${file.name} exceeds the 5MB size limit.`);
        }

        const formData = new FormData();
        formData.append('image', file);

        const response = await api.post<UploadResponse>('/uploads/product-image', formData, true);
        if (!response.success || !response.data?.url) {
          throw new Error(response.message || 'Failed to upload image');
        }
        uploadedUrls.push(response.data.url);
      }

      if (target === 'new') {
        setNewProduct((prev) => ({
          ...prev,
          images: [...prev.images, ...uploadedUrls]
        }));
      } else {
        setImageUrls((prev) => [...prev, ...uploadedUrls]);
      }

      toast({
        title: 'Images uploaded',
        description: `${uploadedUrls.length} image${uploadedUrls.length > 1 ? 's' : ''} added successfully.`
      });
    } catch (error: unknown) {
      toast({
        title: 'Upload failed',
        description: getErrorMessage(error, 'Unable to upload images. Please try again.'),
        variant: 'destructive'
      });
    } finally {
      setUploadingState(false);
      if (target === 'new' && newImageInputRef.current) {
        newImageInputRef.current.value = '';
      }
      if (target === 'edit' && editImageInputRef.current) {
        editImageInputRef.current.value = '';
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <p className="text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Header />
      
      <div className="px-4 py-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Stock Management</h1>
            <p className="text-gray-600">Manage product inventory</p>
          </div>
          <Dialog open={isAddingProduct} onOpenChange={setIsAddingProduct}>
            <DialogTrigger asChild>
              <Button className="bg-orange-500 hover:bg-orange-600">
                <Plus className="w-4 h-4 mr-2" />
                Add Product
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Product</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <Label>Product Name *</Label>
                  <Input
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                    placeholder="e.g., Fresh Mangoes"
                  />
                </div>
                <div>
                  <Label>Description *</Label>
                  <Textarea
                    value={newProduct.description}
                    onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                    placeholder="Product description"
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Price (₹) *</Label>
                    <Input
                      type="number"
                      value={newProduct.price}
                      onChange={(e) => setNewProduct({ ...newProduct, price: Number(e.target.value) })}
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div>
                    <Label>Original Price (₹)</Label>
                    <Input
                      type="number"
                      value={newProduct.originalPrice}
                      onChange={(e) => setNewProduct({ ...newProduct, originalPrice: Number(e.target.value) })}
                      min="0"
                      step="0.01"
                      placeholder="For discounts"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Category *</Label>
                    <Select
                      value={newProduct.category || undefined}
                      onValueChange={(value) => setNewProduct({ ...newProduct, category: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fruits">Fruits</SelectItem>
                        <SelectItem value="vegetables">Vegetables</SelectItem>
                        <SelectItem value="dried-fruits">Dried Fruits</SelectItem>
                        <SelectItem value="juices">Juices</SelectItem>
                        <SelectItem value="gift-packs">Gift Packs</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Unit *</Label>
                    <Select
                      value={newProduct.unit}
                      onValueChange={(value) => setNewProduct({ ...newProduct, unit: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="kg">Kilogram (kg)</SelectItem>
                        <SelectItem value="piece">Piece</SelectItem>
                        <SelectItem value="dozen">Dozen</SelectItem>
                        <SelectItem value="pack">Pack</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>Initial Stock</Label>
                    <Input
                      type="number"
                      value={newProduct.stock.available}
                      onChange={(e) => setNewProduct({
                        ...newProduct,
                        stock: { ...newProduct.stock, available: Number(e.target.value) }
                      })}
                      min="0"
                    />
                  </div>
                  <div>
                    <Label>Min Threshold</Label>
                    <Input
                      type="number"
                      value={newProduct.stock.minThreshold}
                      onChange={(e) => setNewProduct({
                        ...newProduct,
                        stock: { ...newProduct.stock, minThreshold: Number(e.target.value) }
                      })}
                      min="0"
                    />
                  </div>
                  <div>
                    <Label>Origin</Label>
                    <Input
                      value={newProduct.origin}
                      onChange={(e) => setNewProduct({ ...newProduct, origin: e.target.value })}
                      placeholder="e.g., India"
                    />
                  </div>
                </div>
                <div>
                  <Label>Product Images * (URLs or Uploads)</Label>
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => newImageInputRef.current?.click()}
                      disabled={isUploadingNewImages}
                    >
                      {isUploadingNewImages ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <ImageIcon className="w-4 h-4 mr-2" />
                      )}
                      {isUploadingNewImages ? 'Uploading...' : 'Upload from device'}
                    </Button>
                    <span className="text-xs text-gray-500">
                      or paste an image URL below
                    </span>
                  </div>
                  <input
                    ref={newImageInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(event) => handleDeviceImageUpload(event, 'new')}
                  />
                  <div className="space-y-2 mt-3">
                    {newProduct.images.length === 0 && (
                      <p className="text-xs text-gray-500">No images added yet.</p>
                    )}
                    {newProduct.images.map((url, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                          <img src={url} alt={`Product ${index + 1}`} className="w-full h-full object-cover" />
                        </div>
                        <Input value={url} readOnly className="flex-1 text-sm" />
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setNewProduct({
                            ...newProduct,
                            images: newProduct.images.filter((_, i) => i !== index)
                          })}
                          className="text-red-600"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                    <div className="flex items-center space-x-2">
                      <Input
                        value={newImageUrl}
                        onChange={(e) => setNewImageUrl(e.target.value)}
                        placeholder="Enter image URL"
                        className="flex-1"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && newImageUrl.trim()) {
                            setNewProduct({
                              ...newProduct,
                              images: [...newProduct.images, newImageUrl.trim()]
                            });
                            setNewImageUrl('');
                          }
                        }}
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          if (newImageUrl.trim()) {
                            setNewProduct({
                              ...newProduct,
                              images: [...newProduct.images, newImageUrl.trim()]
                            });
                            setNewImageUrl('');
                          }
                        }}
                      >
                        Add
                      </Button>
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2 pt-4">
                  <Button
                    onClick={handleCreateProduct}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Create Product
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setIsAddingProduct(false)}
                    className="flex-1"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="space-y-4">
          {products.map((product) => (
            <div
              key={product._id}
              className="bg-white rounded-xl p-4 shadow-sm border border-gray-200"
            >
              <div className="flex items-start space-x-4">
                {/* Product Image */}
                {product.images && product.images.length > 0 && (
                  <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                    <img 
                      src={product.images[0]} 
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                
                <div className="flex-1">
                  {editingId === product._id && editingField === 'name' ? (
                    <div className="space-y-2 mb-4">
                      <div>
                        <Label className="text-xs">Product Name</Label>
                        <Input
                          value={nameValue}
                          onChange={(e) => setNameValue(e.target.value)}
                          className="w-full"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Description</Label>
                        <Textarea
                          value={descriptionValue}
                          onChange={(e) => setDescriptionValue(e.target.value)}
                          className="w-full"
                          rows={2}
                        />
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          onClick={() => handleSave(product._id)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Save className="w-4 h-4 mr-1" />
                          Save
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleCancel}
                        >
                          <X className="w-4 h-4 mr-1" />
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-3">
                          <Package className="w-5 h-5 text-orange-500" />
                          <h3 className="font-semibold text-gray-900">{product.name}</h3>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEdit(product, 'name')}
                            className="h-8"
                          >
                            <Edit2 className="w-3 h-3 mr-1" />
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteProduct(product._id)}
                            className="h-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-3 h-3 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">{product.description}</p>
                    </div>
                  )}
                  <p className="text-sm text-gray-600 mb-1">Category: {product.category}</p>
                  
                  {/* Price Display/Edit */}
                  {editingId === product._id && editingField === 'price' ? (
                    <div className="mt-4 space-y-2">
                      <div>
                        <Label className="text-xs">Current Price (₹)</Label>
                        <Input
                          type="number"
                          value={priceValue}
                          onChange={(e) => setPriceValue(Number(e.target.value))}
                          className="w-full"
                          min="0"
                          step="0.01"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Original Price (₹) - Optional</Label>
                        <Input
                          type="number"
                          value={originalPriceValue}
                          onChange={(e) => setOriginalPriceValue(Number(e.target.value))}
                          className="w-full"
                          min="0"
                          step="0.01"
                          placeholder="For discount display"
                        />
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          onClick={() => handleSave(product._id)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Save className="w-4 h-4 mr-1" />
                          Save
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleCancel}
                        >
                          <X className="w-4 h-4 mr-1" />
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="mb-2">
                      <p className="text-sm font-semibold text-gray-900">
                        Price: ₹{product.price}
                        {product.originalPrice && product.originalPrice > product.price && (
                          <span className="text-xs text-gray-500 line-through ml-2">
                            ₹{product.originalPrice}
                          </span>
                        )}
                      </p>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(product, 'price')}
                        className="mt-1"
                      >
                        <DollarSign className="w-4 h-4 mr-1" />
                        Edit Price
                      </Button>
                    </div>
                  )}

                  {/* Images Display/Edit */}
                  {editingId === product._id && editingField === 'images' ? (
                    <div className="mt-4 space-y-2">
                      <Label className="text-xs">Product Images</Label>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => editImageInputRef.current?.click()}
                          disabled={isUploadingEditImages}
                        >
                          {isUploadingEditImages ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <ImageIcon className="w-4 h-4 mr-2" />
                          )}
                          {isUploadingEditImages ? 'Uploading...' : 'Upload new image'}
                        </Button>
                        <span className="text-[11px] text-gray-500">Paste a URL or upload from device</span>
                      </div>
                      <input
                        ref={editImageInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={(event) => handleDeviceImageUpload(event, 'edit')}
                      />
                      <div className="space-y-2">
                        {imageUrls.map((url, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <img src={url} alt={`Product ${index + 1}`} className="w-12 h-12 rounded object-cover" />
                            <Input
                              type="text"
                              value={url}
                              onChange={(e) => {
                                const newUrls = [...imageUrls];
                                newUrls[index] = e.target.value;
                                setImageUrls(newUrls);
                              }}
                              className="flex-1 text-xs"
                              placeholder="Image URL"
                            />
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => removeImageUrl(index)}
                              className="text-red-600"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                        <div className="flex items-center space-x-2">
                          <Input
                            type="text"
                            value={newImageUrl}
                            onChange={(e) => setNewImageUrl(e.target.value)}
                            placeholder="Add image URL"
                            className="flex-1 text-xs"
                            onKeyPress={(e) => e.key === 'Enter' && addImageUrl()}
                          />
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={addImageUrl}
                          >
                            Add
                          </Button>
                        </div>
                      </div>
                      <div className="flex space-x-2 mt-2">
                        <Button
                          size="sm"
                          onClick={() => handleSave(product._id)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Save className="w-4 h-4 mr-1" />
                          Save Images
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleCancel}
                        >
                          <X className="w-4 h-4 mr-1" />
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="mb-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(product, 'images')}
                        className="mt-1"
                      >
                        <ImageIcon className="w-4 h-4 mr-1" />
                        Edit Images
                      </Button>
                    </div>
                  )}
                  
                  {/* Stock Display/Edit */}
                  {editingId === product._id && editingField === 'stock' ? (
                    <div className="mt-4 flex items-center space-x-2">
                      <Input
                        type="number"
                        value={stockValue}
                        onChange={(e) => setStockValue(Number(e.target.value))}
                        className="w-24"
                        min="0"
                      />
                      <Button
                        size="sm"
                        onClick={() => handleSave(product._id)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Save className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleCancel}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="mt-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Available Stock:</span>
                        <span
                          className={`font-semibold ${
                            product.stock.available < product.stock.minThreshold
                              ? 'text-red-600'
                              : 'text-green-600'
                          }`}
                        >
                          {product.stock.available}
                        </span>
                      </div>
                      {product.stock.available < product.stock.minThreshold && (
                        <p className="text-xs text-red-500 mt-1">
                          Below minimum threshold ({product.stock.minThreshold})
                        </p>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(product, 'stock')}
                        className="mt-2"
                      >
                        <Edit2 className="w-4 h-4 mr-1" />
                        Update Stock
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {products.length === 0 && (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No products found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminStock;

