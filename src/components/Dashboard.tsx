
import { useState, useEffect } from "react";
import { BarChart3, DollarSign, Package, TrendingUp } from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { getSalesData, getProducts } from "@/lib/db";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface StatsCardProps {
  title: string;
  value: string;
  description: string;
  icon: React.ReactNode;
  trend?: number;
}

const StatsCard = ({ title, value, description, icon, trend }: StatsCardProps) => (
  <Card className="overflow-hidden transition-all duration-200 hover:shadow-md">
    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
        {icon}
      </div>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      <p className="text-xs text-muted-foreground mt-1">{description}</p>
      {trend !== undefined && (
        <div className={`flex items-center mt-2 text-xs ${trend >= 0 ? 'text-green-500' : 'text-red-500'}`}>
          <TrendingUp size={14} className="mr-1" />
          <span>{trend >= 0 ? '+' : ''}{trend}% from last month</span>
        </div>
      )}
    </CardContent>
  </Card>
);

export function Dashboard() {
  const [salesData, setSalesData] = useState({
    daily: 0,
    weekly: 0,
    monthly: 0,
    topProducts: [] as { name: string; sales: number }[]
  });
  const [products, setProducts] = useState<{ name: string; stock: number }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Fetch data from our simulated database
    setSalesData(getSalesData());
    setProducts(getProducts().map(p => ({ name: p.name, stock: p.stock })));
    setIsLoading(false);
  }, []);
  
  // Sample data for charts
  const dailySales = [
    { name: 'Mon', sales: 1200 },
    { name: 'Tue', sales: 1900 },
    { name: 'Wed', sales: 1500 },
    { name: 'Thu', sales: 2400 },
    { name: 'Fri', sales: 2700 },
    { name: 'Sat', sales: 3500 },
    { name: 'Sun', sales: 2100 },
  ];
  
  return (
    <div className="space-y-8 animate-in">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground mt-2">Welcome to SimplePOS. Here's your store overview.</p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Sales"
          value={`$${salesData.monthly.toFixed(2)}`}
          description="Monthly revenue"
          icon={<DollarSign className="h-4 w-4 text-primary" />}
          trend={12}
        />
        <StatsCard
          title="Today's Sales"
          value={`$${salesData.daily.toFixed(2)}`}
          description="Daily revenue"
          icon={<DollarSign className="h-4 w-4 text-primary" />}
        />
        <StatsCard
          title="Weekly Sales"
          value={`$${salesData.weekly.toFixed(2)}`}
          description="Weekly revenue"
          icon={<DollarSign className="h-4 w-4 text-primary" />}
          trend={5}
        />
        <StatsCard
          title="Products"
          value={products.length.toString()}
          description="Total products"
          icon={<Package className="h-4 w-4 text-primary" />}
        />
      </div>
      
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Sales Overview</CardTitle>
            <CardDescription>Daily sales for the current week</CardDescription>
          </CardHeader>
          <CardContent className="px-2">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dailySales}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value) => [`$${value}`, 'Sales']}
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e2e8f0',
                      borderRadius: '6px',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="sales" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2} 
                    activeDot={{ r: 6 }} 
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Top Products</CardTitle>
            <CardDescription>Best selling products this month</CardDescription>
          </CardHeader>
          <CardContent className="px-2">
            <div className="h-[300px]">
              {salesData.topProducts.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={salesData.topProducts}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value) => [`${value}`, 'Units Sold']}
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #e2e8f0',
                        borderRadius: '6px',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
                      }}
                    />
                    <Bar 
                      dataKey="sales" 
                      fill="hsl(var(--primary))" 
                      radius={[4, 4, 0, 0]} 
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  No sales data available yet.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
