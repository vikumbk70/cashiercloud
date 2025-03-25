
import { useState, useEffect } from "react";
import { 
  Search, 
  ShoppingCart, 
  Plus, 
  Minus, 
  Trash, 
  X, 
  CreditCard, 
  Receipt as ReceiptIcon, 
  Printer
} from "lucide-react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { getProducts, createReceipt } from "@/lib/db";
import { Product, CartItem, Receipt } from "@/types";
import { toast } from "@/hooks/use-toast";

export default function CheckoutPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [amountPaid, setAmountPaid] = useState("");
  const [printReceipt, setPrintReceipt] = useState(true);
  
  const TAX_RATE = 0.10; // 10% tax rate
  
  useEffect(() => {
    loadProducts();
  }, []);
  
  const loadProducts = () => {
    const data = getProducts();
    setProducts(data);
  };
  
  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    product.barcode?.includes(searchTerm)
  );
  
  const addToCart = (product: Product) => {
    // Check if product is already in cart
    const existingItem = cart.find(item => item.id === product.id);
    
    if (existingItem) {
      // Increase quantity if already in cart
      if (existingItem.quantity < product.stock) {
        updateCartItemQuantity(product.id, existingItem.quantity + 1);
      } else {
        toast({
          title: "Stock Limit Reached",
          description: `Only ${product.stock} units available for ${product.name}`,
          variant: "destructive"
        });
      }
    } else {
      // Add to cart if not already in cart and stock is available
      if (product.stock > 0) {
        setCart([...cart, { ...product, quantity: 1 }]);
      } else {
        toast({
          title: "Out of Stock",
          description: `${product.name} is out of stock`,
          variant: "destructive"
        });
      }
    }
  };
  
  const updateCartItemQuantity = (productId: string, quantity: number) => {
    const product = products.find(p => p.id === productId);
    
    if (!product) return;
    
    // Ensure quantity doesn't exceed stock
    if (quantity > product.stock) {
      toast({
        title: "Stock Limit Reached",
        description: `Only ${product.stock} units available for ${product.name}`,
        variant: "destructive"
      });
      quantity = product.stock;
    }
    
    // Update cart
    if (quantity > 0) {
      setCart(
        cart.map(item => 
          item.id === productId 
            ? { ...item, quantity } 
            : item
        )
      );
    } else {
      removeFromCart(productId);
    }
  };
  
  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.id !== productId));
  };
  
  const clearCart = () => {
    setCart([]);
    setCustomerName("");
    setCustomerEmail("");
    setPaymentMethod("cash");
  };
  
  const calculateSubtotal = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };
  
  const calculateTax = () => {
    return calculateSubtotal() * TAX_RATE;
  };
  
  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax();
  };
  
  const calculateChange = () => {
    const paid = parseFloat(amountPaid) || 0;
    return paid - calculateTotal();
  };
  
  const handleCheckout = () => {
    if (cart.length === 0) {
      toast({
        title: "Empty Cart",
        description: "Please add items to your cart before checking out.",
        variant: "destructive"
      });
      return;
    }
    
    if (paymentMethod === "cash" && (!amountPaid || parseFloat(amountPaid) < calculateTotal())) {
      toast({
        title: "Insufficient Payment",
        description: "The amount paid must be at least equal to the total.",
        variant: "destructive"
      });
      return;
    }
    
    // Create receipt
    const receipt: Omit<Receipt, 'id' | 'createdAt'> = {
      items: cart,
      subtotal: calculateSubtotal(),
      tax: calculateTax(),
      total: calculateTotal(),
      paymentMethod
    };
    
    const newReceipt = createReceipt(receipt);
    
    // Show success message
    toast({
      title: "Purchase Complete",
      description: `Receipt #${newReceipt.id.slice(0, 8)} has been created.`
    });
    
    if (printReceipt) {
      // In a real system, this would trigger receipt printing
      toast({
        title: "Printing Receipt",
        description: "Receipt sent to printer."
      });
    }
    
    // Clear cart after checkout
    clearCart();
    
    // Reload products to update stock
    loadProducts();
  };
  
  const formatPrice = (price: number) => {
    return `$${price.toFixed(2)}`;
  };
  
  return (
    <Layout>
      <div className="space-y-8 animate-in">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Checkout</h2>
          <p className="text-muted-foreground mt-2">Process sales and generate receipts.</p>
        </div>
        
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Product Selection */}
          <div className="lg:col-span-2 space-y-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products by name or scan barcode..."
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
            
            <div className="rounded-md border h-[450px] overflow-y-auto">
              {filteredProducts.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                  <Search className="h-10 w-10 mb-2 text-muted-foreground/50" />
                  <p className="font-medium">No products found</p>
                  <p className="text-sm">Try a different search term</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4">
                  {filteredProducts.map((product) => (
                    <Card 
                      key={product.id} 
                      className={`cursor-pointer transition-all duration-200 hover:border-primary/50 ${
                        product.stock <= 0 ? "opacity-50" : ""
                      }`}
                      onClick={() => addToCart(product)}
                    >
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-md font-medium">{product.name}</CardTitle>
                          <span className="text-md font-bold">{formatPrice(product.price)}</span>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {product.description}
                        </p>
                      </CardContent>
                      <CardFooter className="pt-0 flex justify-between">
                        <span className="text-xs bg-secondary px-2 py-1 rounded">
                          {product.category}
                        </span>
                        <span className={`text-xs ${product.stock <= 5 ? "text-destructive" : "text-muted-foreground"}`}>
                          {product.stock > 0 
                            ? `${product.stock} in stock` 
                            : "Out of stock"}
                        </span>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          {/* Cart */}
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-xl">Shopping Cart</CardTitle>
                  <ShoppingCart className="h-5 w-5 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent className="pb-3 h-[300px] overflow-y-auto">
                {cart.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                    <ShoppingCart className="h-10 w-10 mb-2 text-muted-foreground/50" />
                    <p>Your cart is empty</p>
                    <p className="text-xs">Search and add products to your cart</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {cart.map((item) => (
                      <div key={item.id} className="flex justify-between items-center py-2 border-b">
                        <div className="flex-1">
                          <p className="font-medium">{item.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatPrice(item.price)} each
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => updateCartItemQuantity(item.id, item.quantity - 1)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => updateCartItemQuantity(item.id, item.quantity + 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-destructive"
                            onClick={() => removeFromCart(item.id)}
                          >
                            <Trash className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex flex-col">
                <div className="w-full space-y-2 pt-4">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span>{formatPrice(calculateSubtotal())}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Tax (10%)</span>
                    <span>{formatPrice(calculateTax())}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold">
                    <span>Total</span>
                    <span>{formatPrice(calculateTotal())}</span>
                  </div>
                </div>
              </CardFooter>
            </Card>
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={clearCart}
                disabled={cart.length === 0}
              >
                Clear
              </Button>
              
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="flex-1" disabled={cart.length === 0}>
                    Checkout
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Complete Purchase</DialogTitle>
                    <DialogDescription>
                      Process payment and generate receipt.
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="grid gap-4 py-4">
                    <div>
                      <Label>Payment Method</Label>
                      <RadioGroup 
                        className="flex gap-4 mt-2" 
                        value={paymentMethod}
                        onValueChange={setPaymentMethod}
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="cash" id="cash" />
                          <Label htmlFor="cash">Cash</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="card" id="card" />
                          <Label htmlFor="card">Card</Label>
                        </div>
                      </RadioGroup>
                    </div>
                    
                    {paymentMethod === "cash" && (
                      <div>
                        <Label htmlFor="amount-paid">Amount Paid</Label>
                        <Input
                          id="amount-paid"
                          type="number"
                          value={amountPaid}
                          onChange={(e) => setAmountPaid(e.target.value)}
                          className="mt-1"
                          placeholder="0.00"
                          min={calculateTotal()}
                        />
                        {amountPaid && parseFloat(amountPaid) >= calculateTotal() && (
                          <div className="text-sm mt-2">
                            <span className="font-medium">Change:</span> {formatPrice(calculateChange())}
                          </div>
                        )}
                      </div>
                    )}
                    
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="print-receipt"
                        checked={printReceipt}
                        onChange={() => setPrintReceipt(!printReceipt)}
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <Label htmlFor="print-receipt" className="flex items-center gap-1">
                        <Printer className="h-4 w-4" />
                        Print Receipt
                      </Label>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <div className="text-sm font-medium mb-2">Order Summary</div>
                      <div className="text-sm flex justify-between">
                        <span>Items:</span>
                        <span>{cart.length}</span>
                      </div>
                      <div className="text-sm flex justify-between">
                        <span>Subtotal:</span>
                        <span>{formatPrice(calculateSubtotal())}</span>
                      </div>
                      <div className="text-sm flex justify-between">
                        <span>Tax:</span>
                        <span>{formatPrice(calculateTax())}</span>
                      </div>
                      <div className="font-bold flex justify-between mt-2">
                        <span>Total:</span>
                        <span>{formatPrice(calculateTotal())}</span>
                      </div>
                    </div>
                  </div>
                  
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    <DialogClose asChild>
                      <Button onClick={handleCheckout}>
                        {paymentMethod === 'cash' ? 'Process Cash Payment' : 'Process Card Payment'}
                      </Button>
                    </DialogClose>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
