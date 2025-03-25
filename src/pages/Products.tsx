
import { useState, useEffect } from "react";
import { 
  Plus, 
  Search, 
  Edit, 
  Trash, 
  Package, 
  X,
  Save,
  AlertCircle
} from "lucide-react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { getProducts, createProduct, updateProduct, deleteProduct } from "@/lib/db";
import { Product } from "@/types";
import { toast } from "@/hooks/use-toast";

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Partial<Product>>({
    name: "",
    description: "",
    price: 0,
    category: "",
    stock: 0,
    barcode: ""
  });
  
  useEffect(() => {
    loadProducts();
  }, []);
  
  const loadProducts = () => {
    const data = getProducts();
    setProducts(data);
  };
  
  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCurrentProduct({ ...currentProduct, [name]: name === "price" || name === "stock" ? Number(value) : value });
  };
  
  const handleCategoryChange = (value: string) => {
    setCurrentProduct({ ...currentProduct, category: value });
  };
  
  const handleAddProduct = () => {
    const { name, description, price, category, stock, barcode } = currentProduct;
    
    if (!name || !description || price === undefined || !category || stock === undefined) {
      toast({
        title: "Missing Fields",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }
    
    createProduct({
      name,
      description,
      price,
      category,
      stock,
      barcode,
    });
    
    resetForm();
    loadProducts();
    
    toast({
      title: "Product Added",
      description: "The product has been added successfully."
    });
  };
  
  const handleEditProduct = (product: Product) => {
    setIsEditing(true);
    setCurrentProduct(product);
  };
  
  const handleUpdateProduct = () => {
    if (!currentProduct.id) return;
    
    const { name, description, price, category, stock, barcode } = currentProduct;
    
    if (!name || !description || price === undefined || !category || stock === undefined) {
      toast({
        title: "Missing Fields",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }
    
    updateProduct(currentProduct.id, {
      name,
      description,
      price,
      category,
      stock,
      barcode,
    });
    
    resetForm();
    loadProducts();
    
    toast({
      title: "Product Updated",
      description: "The product has been updated successfully."
    });
  };
  
  const handleDeleteProduct = (id: string) => {
    deleteProduct(id);
    loadProducts();
    
    toast({
      title: "Product Deleted",
      description: "The product has been deleted successfully."
    });
  };
  
  const resetForm = () => {
    setIsEditing(false);
    setCurrentProduct({
      name: "",
      description: "",
      price: 0,
      category: "",
      stock: 0,
      barcode: ""
    });
  };
  
  const categories = ["Beverages", "Food", "Pastries", "Merchandise", "Other"];
  
  return (
    <Layout>
      <div className="space-y-8 animate-in">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Products</h2>
            <p className="text-muted-foreground mt-2">
              Manage your products and inventory.
            </p>
          </div>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Product
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[550px]">
              <DialogHeader>
                <DialogTitle>{isEditing ? "Edit Product" : "Add New Product"}</DialogTitle>
                <DialogDescription>
                  {isEditing 
                    ? "Make changes to the product details." 
                    : "Fill in the details to add a new product."}
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Name *
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    value={currentProduct.name}
                    onChange={handleInputChange}
                    className="col-span-3"
                  />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="description" className="text-right">
                    Description *
                  </Label>
                  <Input
                    id="description"
                    name="description"
                    value={currentProduct.description}
                    onChange={handleInputChange}
                    className="col-span-3"
                  />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="price" className="text-right">
                    Price ($) *
                  </Label>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={currentProduct.price}
                    onChange={handleInputChange}
                    className="col-span-3"
                  />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="category" className="text-right">
                    Category *
                  </Label>
                  <Select 
                    value={currentProduct.category}
                    onValueChange={handleCategoryChange}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="stock" className="text-right">
                    Stock *
                  </Label>
                  <Input
                    id="stock"
                    name="stock"
                    type="number"
                    min="0"
                    value={currentProduct.stock}
                    onChange={handleInputChange}
                    className="col-span-3"
                  />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="barcode" className="text-right">
                    Barcode
                  </Label>
                  <Input
                    id="barcode"
                    name="barcode"
                    value={currentProduct.barcode || ""}
                    onChange={handleInputChange}
                    className="col-span-3"
                  />
                </div>
              </div>
              
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline" onClick={resetForm}>
                    Cancel
                  </Button>
                </DialogClose>
                <DialogClose asChild>
                  <Button onClick={isEditing ? handleUpdateProduct : handleAddProduct}>
                    {isEditing ? "Save Changes" : "Add Product"}
                  </Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
          
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                      <div className="flex flex-col items-center justify-center space-y-1">
                        <Package className="h-10 w-10 text-muted-foreground/50" />
                        <div className="font-medium">No products found</div>
                        <div className="text-sm">Add a new product or adjust your search.</div>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredProducts.map(product => (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">
                        <div className="flex flex-col">
                          <span>{product.name}</span>
                          <span className="text-xs text-muted-foreground line-clamp-1">
                            {product.description}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{product.category}</TableCell>
                      <TableCell>${product.price.toFixed(2)}</TableCell>
                      <TableCell>
                        <span className={product.stock <= 5 ? "text-destructive" : ""}>
                          {product.stock}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="icon"
                                onClick={() => handleEditProduct(product)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[550px]">
                              <DialogHeader>
                                <DialogTitle>Edit Product</DialogTitle>
                                <DialogDescription>
                                  Make changes to the product details.
                                </DialogDescription>
                              </DialogHeader>
                              
                              <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                  <Label htmlFor="name" className="text-right">
                                    Name *
                                  </Label>
                                  <Input
                                    id="name"
                                    name="name"
                                    value={currentProduct.name}
                                    onChange={handleInputChange}
                                    className="col-span-3"
                                  />
                                </div>
                                
                                <div className="grid grid-cols-4 items-center gap-4">
                                  <Label htmlFor="description" className="text-right">
                                    Description *
                                  </Label>
                                  <Input
                                    id="description"
                                    name="description"
                                    value={currentProduct.description}
                                    onChange={handleInputChange}
                                    className="col-span-3"
                                  />
                                </div>
                                
                                <div className="grid grid-cols-4 items-center gap-4">
                                  <Label htmlFor="price" className="text-right">
                                    Price ($) *
                                  </Label>
                                  <Input
                                    id="price"
                                    name="price"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={currentProduct.price}
                                    onChange={handleInputChange}
                                    className="col-span-3"
                                  />
                                </div>
                                
                                <div className="grid grid-cols-4 items-center gap-4">
                                  <Label htmlFor="category" className="text-right">
                                    Category *
                                  </Label>
                                  <Select 
                                    value={currentProduct.category}
                                    onValueChange={handleCategoryChange}
                                  >
                                    <SelectTrigger className="col-span-3">
                                      <SelectValue placeholder="Select a category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {categories.map(category => (
                                        <SelectItem key={category} value={category}>
                                          {category}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                                
                                <div className="grid grid-cols-4 items-center gap-4">
                                  <Label htmlFor="stock" className="text-right">
                                    Stock *
                                  </Label>
                                  <Input
                                    id="stock"
                                    name="stock"
                                    type="number"
                                    min="0"
                                    value={currentProduct.stock}
                                    onChange={handleInputChange}
                                    className="col-span-3"
                                  />
                                </div>
                                
                                <div className="grid grid-cols-4 items-center gap-4">
                                  <Label htmlFor="barcode" className="text-right">
                                    Barcode
                                  </Label>
                                  <Input
                                    id="barcode"
                                    name="barcode"
                                    value={currentProduct.barcode || ""}
                                    onChange={handleInputChange}
                                    className="col-span-3"
                                  />
                                </div>
                              </div>
                              
                              <DialogFooter>
                                <DialogClose asChild>
                                  <Button variant="outline" onClick={resetForm}>
                                    Cancel
                                  </Button>
                                </DialogClose>
                                <DialogClose asChild>
                                  <Button onClick={handleUpdateProduct}>
                                    Save Changes
                                  </Button>
                                </DialogClose>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                          
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="icon" className="text-destructive">
                                <Trash className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will permanently delete the product "{product.name}".
                                  This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteProduct(product.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          
          {filteredProducts.length > 0 && (
            <div className="text-xs text-muted-foreground">
              Showing {filteredProducts.length} of {products.length} products
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
