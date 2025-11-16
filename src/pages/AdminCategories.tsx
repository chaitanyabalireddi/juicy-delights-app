import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/hooks/use-toast';
import api from '@/lib/api';
import { Layers, Loader2, Plus, Save, Trash2 } from 'lucide-react';

interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  displayOrder: number;
  isActive: boolean;
}

interface CategoryForm {
  name: string;
  slug: string;
  description: string;
  icon: string;
  displayOrder: number;
  isActive: boolean;
}

const defaultForm: CategoryForm = {
  name: '',
  slug: '',
  description: '',
  icon: '',
  displayOrder: 0,
  isActive: true,
};

const AdminCategories = () => {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<CategoryForm>(defaultForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isAdmin) {
      navigate('/login');
      return;
    }
    fetchCategories();
  }, [isAdmin, navigate]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await api.get<{ success: boolean; data?: { categories: Category[] } }>(
        '/categories?includeInactive=true'
      );
      setCategories(response?.data?.categories || []);
    } catch (error) {
      console.error('Failed to load categories', error);
      toast({
        title: 'Error',
        description: 'Unable to load categories right now.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm(defaultForm);
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const payload = {
        ...form,
        name: form.name.trim(),
        slug: form.slug.trim() || undefined,
        description: form.description.trim() || undefined,
        icon: form.icon.trim() || undefined,
        displayOrder: Number(form.displayOrder) || 0,
      };

      if (editingId) {
        await api.put(`/categories/${editingId}`, payload, true);
        toast({ title: 'Updated', description: 'Category updated successfully.' });
      } else {
        await api.post('/categories', payload, true);
        toast({ title: 'Created', description: 'Category created successfully.' });
      }
      resetForm();
      await fetchCategories();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to save category.';
      toast({ title: 'Error', description: message, variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (category: Category) => {
    setEditingId(category._id);
    setForm({
      name: category.name,
      slug: category.slug,
      description: category.description || '',
      icon: category.icon || '',
      displayOrder: category.displayOrder,
      isActive: category.isActive,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this category? Products assigned to it will keep the slug.')) return;
    try {
      await api.delete(`/categories/${id}`, true);
      toast({ title: 'Deleted', description: 'Category removed successfully.' });
      if (editingId === id) {
        resetForm();
      }
      await fetchCategories();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete category.';
      toast({ title: 'Error', description: message, variant: 'destructive' });
    }
  };

  const handleToggleActive = async (category: Category, isActive: boolean) => {
    try {
      await api.put(
        `/categories/${category._id}`,
        { ...category, isActive },
        true
      );
      await fetchCategories();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update status.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Header />
      <div className="px-4 py-6 max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Product Categories</h1>
            <p className="text-gray-600">Create categories and assign products to them.</p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <Layers className="w-5 h-5 mr-2 text-primary" />
            {editingId ? 'Edit Category' : 'Add Category'}
          </h2>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Name</Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  placeholder="e.g., Tropical Fruits"
                />
              </div>
              <div>
                <Label>Custom Slug (optional)</Label>
                <Input
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  placeholder="tropical-fruits"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Leave blank to auto-generate from the name.
                </p>
              </div>
            </div>

            <div>
              <Label>Description</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3}
                placeholder="Optional description visible to users."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Icon / Emoji</Label>
                <Input
                  value={form.icon}
                  onChange={(e) => setForm({ ...form, icon: e.target.value })}
                  placeholder="🍍"
                />
              </div>
              <div>
                <Label>Display Order</Label>
                <Input
                  type="number"
                  value={form.displayOrder}
                  onChange={(e) => setForm({ ...form, displayOrder: Number(e.target.value) })}
                />
              </div>
              <div className="flex items-center space-x-3">
                <div>
                  <Label>Active</Label>
                  <div className="flex items-center space-x-2 mt-2">
                    <Switch
                      checked={form.isActive}
                      onCheckedChange={(checked) => setForm({ ...form, isActive: checked })}
                    />
                    <span className="text-sm text-muted-foreground">
                      {form.isActive ? 'Visible to users' : 'Hidden'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Button type="submit" disabled={isSaving} className="flex items-center space-x-2">
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    {editingId ? <Save className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    <span>{editingId ? 'Update Category' : 'Add Category'}</span>
                  </>
                )}
              </Button>
              {editingId && (
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </div>

        <div className="space-y-4">
          {loading ? (
            <div className="bg-white rounded-xl p-6 text-center shadow-sm border border-gray-200">
              <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Loading categories...</p>
            </div>
          ) : categories.length === 0 ? (
            <div className="bg-white rounded-xl p-6 text-center shadow-sm border border-gray-200">
              <Layers className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-600">No categories yet. Create one above.</p>
            </div>
          ) : (
            categories.map((category) => (
              <div
                key={category._id}
                className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 flex flex-col md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">{category.icon || '🛒'}</span>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{category.name}</h3>
                      <p className="text-xs text-gray-500">/{category.slug}</p>
                    </div>
                  </div>
                  {category.description && (
                    <p className="text-sm text-gray-600 mt-2">{category.description}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">Display order: {category.displayOrder}</p>
                </div>
                <div className="flex items-center space-x-4 mt-4 md:mt-0">
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={category.isActive}
                      onCheckedChange={(checked) => handleToggleActive(category, checked)}
                    />
                    <span className="text-sm text-gray-600">
                      {category.isActive ? 'Active' : 'Hidden'}
                    </span>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => handleEdit(category)}>
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="flex items-center space-x-1"
                    onClick={() => handleDelete(category._id)}
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete</span>
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminCategories;

