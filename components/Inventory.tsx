
import React, { useState, useMemo, useEffect, useRef } from 'react';
import type { Product } from '../types';
import { BarcodeModal } from './BarcodeModal';

interface InventoryProps {
  products: Product[];
  addProduct: (product: Product) => void;
  editProduct: (product: Product) => void;
  deleteProduct: (productId: string) => void;
  requestPasswordVerification: (callback: () => void) => void;
}

interface ProductFormProps {
    onSubmit: (product: Product) => void;
    onDone: () => void;
    initialData?: Product | null;
}

const ProductForm: React.FC<ProductFormProps> = ({ onSubmit, onDone, initialData }) => {
  const [formState, setFormState] = useState({
    id: '', name: '', category: '', subcategory: '', price: '', stock: '', cost: '', imageUrl: '', thresholdPrice: ''
  });
  const [error, setError] = useState<string | null>(null);
  const barcodeInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialData) {
        setFormState({
            id: initialData.id,
            name: initialData.name,
            category: initialData.category,
            subcategory: initialData.subcategory || '',
            price: initialData.price.toString(),
            cost: initialData.cost.toString(),
            stock: initialData.stock.toString(),
            imageUrl: initialData.imageUrl || '',
            thresholdPrice: initialData.thresholdPrice?.toString() || '',
        });
    } else {
        setFormState({ id: '', name: '', category: '', subcategory: '', price: '', stock: '', cost: '', imageUrl: '', thresholdPrice: '' });
        barcodeInputRef.current?.focus();
    }
    setError(null);
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const { name, category, price, cost, stock, thresholdPrice } = formState;
    if (!name || !category || price === '' || cost === '' || stock === '') {
      setError('Please fill all required fields: Name, Category, Price, Cost, and Stock.');
      return;
    }

    const priceNum = parseFloat(price);
    const costNum = parseFloat(cost);
    const stockNum = parseInt(stock, 10);
    const thresholdPriceNum = thresholdPrice ? parseFloat(thresholdPrice) : undefined;

    if (isNaN(priceNum) || isNaN(costNum) || isNaN(stockNum) || priceNum < 0 || costNum < 0 || stockNum < 0 || (thresholdPriceNum && (isNaN(thresholdPriceNum) || thresholdPriceNum < 0))) {
        setError('Please enter valid, non-negative numbers for price, cost, stock, and threshold.');
        return;
    }
    if (thresholdPriceNum && thresholdPriceNum > priceNum) {
        setError('Threshold price cannot be greater than the selling price.');
        return;
    }
    
    setError(null);
    const finalId = formState.id || `prod-${Date.now()}`;

    onSubmit({
        ...formState,
        id: finalId,
        subcategory: formState.subcategory || undefined,
        price: priceNum,
        cost: costNum,
        stock: stockNum,
        thresholdPrice: thresholdPriceNum,
    });
    onDone();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormState(prev => ({ ...prev, imageUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };
  
  const isEditing = !!initialData;

  return (
    <div className="bg-gray-700 p-6 rounded-lg mb-8">
      <h3 className="text-xl font-bold mb-4">{isEditing ? 'Edit Product' : 'Add New Product'}</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex gap-2">
                <input ref={barcodeInputRef} name="id" placeholder="Barcode (auto-generates)" value={formState.id} onChange={handleChange} className="p-2 bg-gray-800 rounded w-full" disabled={isEditing} />
                {!isEditing && <button type="button" onClick={() => barcodeInputRef.current?.focus()} className="p-2 bg-cyan-700 rounded" title="Focus Scanner Input">Scan</button>}
            </div>
            <input name="name" placeholder="Product Name" value={formState.name} onChange={handleChange} required className="p-2 bg-gray-800 rounded" />
            <input name="category" placeholder="Category" value={formState.category} onChange={handleChange} required className="p-2 bg-gray-800 rounded" />
            <input name="subcategory" placeholder="Sub-category (Optional)" value={formState.subcategory} onChange={handleChange} className="p-2 bg-gray-800 rounded" />
            <input name="cost" type="number" step="0.01" placeholder="Purchase Cost" value={formState.cost} onChange={handleChange} required className="p-2 bg-gray-800 rounded" />
            <input name="price" type="number" step="0.01" placeholder="Selling Price" value={formState.price} onChange={handleChange} required className="p-2 bg-gray-800 rounded" />
            <input name="thresholdPrice" type="number" step="0.01" placeholder="Threshold Price (Optional)" value={formState.thresholdPrice} onChange={handleChange} className="p-2 bg-gray-800 rounded" />
            <input name="stock" type="number" placeholder="Stock" value={formState.stock} onChange={handleChange} required className="p-2 bg-gray-800 rounded" />
        </div>
        <div className="flex items-center gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Product Image</label>
            <input type="file" accept="image/*" onChange={handleImageChange} className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-cyan-50 file:text-cyan-700 hover:file:bg-cyan-100"/>
          </div>
          {formState.imageUrl && <img src={formState.imageUrl} alt="preview" className="w-24 h-24 object-cover rounded-md"/>}
        </div>
        
        {error && <p className="text-red-400 font-semibold bg-red-900/20 p-3 rounded-md">{error}</p>}

        <div className="flex gap-4 pt-4">
          <button type="submit" className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-4 rounded">{isEditing ? 'Save Changes' : 'Add Product'}</button>
          <button type="button" onClick={onDone} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded">Cancel</button>
        </div>
      </form>
    </div>
  );
};

const ConfirmProductDeleteModal: React.FC<{
  product: Product | null;
  onConfirm: () => void;
  onCancel: () => void;
}> = ({ product, onConfirm, onCancel }) => {
  if (!product) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50">
      <div className="bg-gray-800 text-white rounded-lg shadow-xl w-full max-sm p-6 relative">
        <h2 className="text-2xl font-bold mb-4 text-orange-400">Confirm Deletion</h2>
        <p className="mb-6 text-gray-300">Are you sure you want to delete this product?</p>
        <div className="flex items-center gap-4 bg-gray-700/50 p-3 rounded-md mb-6">
            <img src={product.imageUrl || 'https://via.placeholder.com/64x64/374151/FFFFFF?text=No+Image'} alt={product.name} className="w-16 h-16 object-cover rounded-md flex-shrink-0" />
            <div>
                <p className="font-semibold">{product.name}</p>
                <p className="text-sm text-gray-400">ID: {product.id}</p>
            </div>
        </div>
        <div className="flex gap-4 mt-8">
          <button onClick={onCancel} className="w-full bg-gray-600 hover:bg-gray-500 text-white font-bold py-3 px-4 rounded">
            No, Cancel
          </button>
          <button onClick={onConfirm} className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-3 px-4 rounded">
            Yes, Delete
          </button>
        </div>
      </div>
    </div>
  );
};


export const Inventory: React.FC<InventoryProps> = ({ products, addProduct, editProduct, deleteProduct, requestPasswordVerification }) => {
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [barcodeToPrint, setBarcodeToPrint] = useState<string | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  const filteredProducts = useMemo(() =>
    products.filter(p =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.id.toLowerCase().includes(searchTerm.toLowerCase())
    ).sort((a,b) => a.name.localeCompare(b.name)), [products, searchTerm]);

  const handleAddNew = () => {
    setEditingProduct(null);
    setShowForm(true);
  }

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setShowForm(true);
  }

  const handleFormSubmit = (product: Product) => {
    if (editingProduct) {
        editProduct(product);
    } else {
        addProduct(product);
    }
  }

  const handleFormDone = () => {
    setShowForm(false);
    setEditingProduct(null);
  }

  const handleConfirmDelete = () => {
    if (productToDelete) {
        requestPasswordVerification(() => {
            deleteProduct(productToDelete.id);
        });
        setProductToDelete(null);
    }
  };

  return (
    <>
    <div className="p-4 md:p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-cyan-400">Product Management</h2>
        <button onClick={handleAddNew} className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-4 rounded">
          Add New Product
        </button>
      </div>
      
      {showForm && <ProductForm onSubmit={handleFormSubmit} onDone={handleFormDone} initialData={editingProduct} />}

      <input
        type="text"
        placeholder="Search by name or barcode..."
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
        className="w-full p-3 bg-gray-800 rounded-lg border-2 border-gray-600 mb-6"
      />

      <div className="bg-gray-800 rounded-lg shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-700">
              <tr>
                <th className="p-4 font-semibold">Image</th>
                <th className="p-4 font-semibold">Barcode</th>
                <th className="p-4 font-semibold">Name</th>
                <th className="p-4 font-semibold">Category</th>
                <th className="p-4 font-semibold text-right">Price</th>
                <th className="p-4 font-semibold text-right">Cost</th>
                <th className="p-4 font-semibold text-right">Stock</th>
                <th className="p-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product, index) => (
                <tr key={product.id} className={`${index % 2 === 0 ? 'bg-gray-800' : 'bg-gray-900/50'}`}>
                  <td className="p-2">
                    <img 
                      src={product.imageUrl || 'https://via.placeholder.com/64x64/374151/FFFFFF?text=No+Image'} 
                      alt={product.name} 
                      className="w-16 h-16 object-cover rounded-md" 
                    />
                  </td>
                  <td className="p-4 align-middle font-mono">
                    <button onClick={() => setBarcodeToPrint(product.id)} className="text-cyan-400 hover:underline" title={product.id}>
                        {product.id.length > 12 ? `${product.id.substring(0, 12)}...` : product.id}
                    </button>
                  </td>
                  <td className="p-4 align-middle">{product.name}</td>
                  <td className="p-4 align-middle">{product.category} {product.subcategory && `(${product.subcategory})`}</td>
                  <td className="p-4 align-middle text-right">PKR {product.price.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                  <td className="p-4 align-middle text-right">PKR {product.cost.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                  <td className="p-4 align-middle text-right">{product.stock}</td>
                  <td className="p-4 align-middle">
                    <div className="flex gap-2">
                        <button onClick={() => handleEdit(product)} className="text-sm bg-blue-600 hover:bg-blue-500 text-white font-bold py-1 px-2 rounded">Edit</button>
                        <button onClick={() => setProductToDelete(product)} className="text-sm bg-red-600 hover:bg-red-500 text-white font-bold py-1 px-2 rounded">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
    <BarcodeModal barcode={barcodeToPrint} onClose={() => setBarcodeToPrint(null)} />
    <ConfirmProductDeleteModal
      product={productToDelete}
      onConfirm={handleConfirmDelete}
      onCancel={() => setProductToDelete(null)}
    />
    </>
  );
};
