import { useState, useEffect, useRef } from "react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
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
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogClose,
  DialogFooter
} from "@/components/ui/dialog";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Calendar, Eye, Printer, ReceiptIcon, Search, SortAsc, SortDesc, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { getReceipts } from "@/lib/api";
import { Receipt } from "@/types";
import { toast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";

export default function ReceiptsPage() {
  const [filteredReceipts, setFilteredReceipts] = useState<Receipt[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null);
  const receiptRef = useRef<HTMLDivElement>(null);
  
  const { data: receipts = [], isLoading, error } = useQuery({
    queryKey: ['receipts', date],
    queryFn: () => getReceipts(date, date),
  });
  
  useEffect(() => {
    applyFilters();
  }, [receipts, searchTerm, date, sortDirection]);
  
  const applyFilters = () => {
    let filtered = [...receipts];
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(receipt => 
        receipt.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        receipt.items.some(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return sortDirection === "asc" ? dateA - dateB : dateB - dateA;
    });
    
    setFilteredReceipts(filtered);
  };
  
  const toggleSortDirection = () => {
    setSortDirection(sortDirection === "asc" ? "desc" : "asc");
  };
  
  const clearFilters = () => {
    setSearchTerm("");
    setDate(undefined);
    setSortDirection("desc");
  };
  
  const viewReceipt = (receipt: Receipt) => {
    setSelectedReceipt(receipt);
  };
  
  const printReceipt = () => {
    if (!receiptRef.current) return;
    
    const printWindow = window.open('', '', 'width=600,height=600');
    
    if (!printWindow) {
      toast({
        title: "Print Failed",
        description: "Could not open print window. Please check your browser settings.",
        variant: "destructive"
      });
      return;
    }
    
    printWindow.document.write('<html><head><title>Print Receipt</title>');
    printWindow.document.write('<style>');
    printWindow.document.write(`
      body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
      .receipt { max-width: 300px; margin: 0 auto; }
      .header { text-align: center; margin-bottom: 20px; }
      .items { margin-bottom: 20px; }
      .item { display: flex; justify-content: space-between; margin-bottom: 8px; }
      .summary { border-top: 1px solid #eee; padding-top: 10px; }
      .summary-row { display: flex; justify-content: space-between; margin-bottom: 5px; }
      .total { font-weight: bold; border-top: 1px solid #eee; padding-top: 5px; margin-top: 5px; }
      .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #999; }
    `);
    printWindow.document.write('</style></head><body>');
    printWindow.document.write(receiptRef.current.innerHTML);
    printWindow.document.write('</body></html>');
    
    printWindow.document.close();
    printWindow.focus();
    
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  };
  
  const formatDate = (date: Date) => {
    return format(new Date(date), "MMM d, yyyy h:mm a");
  };
  
  const formatPrice = (price: number) => {
    return `$${price.toFixed(2)}`;
  };
  
  return (
    <Layout>
      <div className="space-y-8 animate-in">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Receipts</h2>
            <p className="text-muted-foreground mt-2">
              View and print transaction receipts.
            </p>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search receipts..."
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
          
          <div className="flex gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : <span>Filter by date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
            
            <Button
              variant="outline"
              size="icon"
              onClick={toggleSortDirection}
            >
              {sortDirection === "desc" ? (
                <SortDesc className="h-4 w-4" />
              ) : (
                <SortAsc className="h-4 w-4" />
              )}
            </Button>
            
            {(searchTerm || date || sortDirection === "asc") && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
              >
                Clear Filters
              </Button>
            )}
          </div>
        </div>
        
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Receipt ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-6">
                    <div className="flex flex-col items-center justify-center space-y-1">
                      <div className="font-medium">Loading receipts...</div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-6 text-destructive">
                    <div className="flex flex-col items-center justify-center space-y-1">
                      <div className="font-medium">Error loading receipts</div>
                      <div className="text-sm">Please try again later.</div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredReceipts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                    <div className="flex flex-col items-center justify-center space-y-1">
                      <ReceiptIcon className="h-10 w-10 text-muted-foreground/50" />
                      <div className="font-medium">No receipts found</div>
                      <div className="text-sm">Process a sale to generate receipts.</div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredReceipts.map((receipt) => (
                  <TableRow key={receipt.id}>
                    <TableCell className="font-medium">
                      #{receipt.id.slice(0, 8)}
                    </TableCell>
                    <TableCell>{formatDate(receipt.createdAt)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <span>{receipt.items.length}</span>
                        <span className="text-muted-foreground text-xs">items</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatPrice(receipt.total)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {receipt.paymentMethod}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => viewReceipt(receipt)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                          <DialogHeader>
                            <DialogTitle>Receipt #{receipt.id.slice(0, 8)}</DialogTitle>
                            <DialogDescription>
                              Transaction details and summary.
                            </DialogDescription>
                          </DialogHeader>
                          
                          <div ref={receiptRef} className="mt-4 space-y-4">
                            <div className="text-center">
                              <h3 className="font-bold text-lg">SimplePOS</h3>
                              <p className="text-sm text-muted-foreground">123 Main Street, City</p>
                              <p className="text-sm text-muted-foreground">Tel: (123) 456-7890</p>
                            </div>
                            
                            <div className="text-sm space-y-1">
                              <div className="flex justify-between">
                                <span>Receipt #:</span>
                                <span>{receipt.id.slice(0, 8)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Date:</span>
                                <span>{formatDate(receipt.createdAt)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Payment Method:</span>
                                <span className="capitalize">{receipt.paymentMethod}</span>
                              </div>
                            </div>
                            
                            <Separator />
                            
                            <div>
                              <p className="font-medium mb-2">Items</p>
                              <div className="space-y-2">
                                {selectedReceipt?.items.map((item, index) => (
                                  <div key={index} className="flex justify-between text-sm">
                                    <div className="flex-1">
                                      <div className="flex justify-between">
                                        <span>{item.name}</span>
                                        <span>{formatPrice(item.price * item.quantity)}</span>
                                      </div>
                                      <div className="text-xs text-muted-foreground">
                                        {item.quantity} x {formatPrice(item.price)}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                            
                            <Separator />
                            
                            <div className="space-y-1">
                              <div className="flex justify-between text-sm">
                                <span>Subtotal:</span>
                                <span>{formatPrice(selectedReceipt?.subtotal || 0)}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span>Tax:</span>
                                <span>{formatPrice(selectedReceipt?.tax || 0)}</span>
                              </div>
                              <div className="flex justify-between font-bold">
                                <span>Total:</span>
                                <span>{formatPrice(selectedReceipt?.total || 0)}</span>
                              </div>
                            </div>
                            
                            <div className="text-center pt-4 text-xs text-muted-foreground">
                              <p>Thank you for your purchase!</p>
                              <p>Please keep this receipt for your records.</p>
                            </div>
                          </div>
                          
                          <DialogFooter className="mt-6">
                            <DialogClose asChild>
                              <Button variant="outline">Close</Button>
                            </DialogClose>
                            <Button onClick={printReceipt}>
                              <Printer className="mr-2 h-4 w-4" />
                              Print Receipt
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        
        {filteredReceipts.length > 0 && (
          <div className="text-xs text-muted-foreground">
            Showing {filteredReceipts.length} of {receipts.length} receipts
          </div>
        )}
      </div>
    </Layout>
  );
}
