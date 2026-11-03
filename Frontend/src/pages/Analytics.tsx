import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  FileText,
  Clock,
  AlertTriangle,
  CheckCircle,
  DollarSign,
  Calendar,
} from "lucide-react";

const mockContractData = [
  { month: "Jan", created: 12, completed: 8, pending: 4 },
  { month: "Feb", created: 15, completed: 12, pending: 3 },
  { month: "Mar", created: 18, completed: 14, pending: 4 },
  { month: "Apr", created: 22, completed: 18, pending: 4 },
  { month: "May", created: 16, completed: 13, pending: 3 },
  { month: "Jun", created: 20, completed: 17, pending: 3 },
];

const mockDepartmentData = [
  { name: "HR", value: 35, color: "hsl(var(--chart-1))" },
  { name: "IT", value: 28, color: "hsl(var(--chart-2))" },
  { name: "Legal", value: 20, color: "hsl(var(--chart-3))" },
  { name: "Procurement", value: 12, color: "hsl(var(--chart-4))" },
  { name: "Finance", value: 5, color: "hsl(var(--chart-5))" },
];

const mockRiskTrends = [
  { month: "Jan", high: 2, medium: 8, low: 15 },
  { month: "Feb", high: 1, medium: 6, low: 18 },
  { month: "Mar", high: 3, medium: 9, low: 16 },
  { month: "Apr", high: 2, medium: 7, low: 20 },
  { month: "May", high: 1, medium: 5, low: 19 },
  { month: "Jun", high: 2, medium: 8, low: 21 },
];

const mockValueData = [
  { month: "Jan", value: 125000 },
  { month: "Feb", value: 145000 },
  { month: "Mar", value: 165000 },
  { month: "Apr", value: 180000 },
  { month: "May", value: 155000 },
  { month: "Jun", value: 190000 },
];

export default function Analytics() {
  return (
    <div className="p-6 space-y-6">
      <div className="animate-fade-in">
        <h1 className="text-3xl font-bold text-foreground mb-2">Contract Analytics</h1>
        <p className="text-muted-foreground">
          Comprehensive insights into your contract portfolio and performance metrics
        </p>
      </div>

      {/* Time Period Selector */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Time Period:</span>
        </div>
        <Select defaultValue="6months">
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1month">Last Month</SelectItem>
            <SelectItem value="3months">Last 3 Months</SelectItem>
            <SelectItem value="6months">Last 6 Months</SelectItem>
            <SelectItem value="1year">Last Year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-slide-in">
        <Card className="card-professional hover-lift">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Contract Value
            </CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">$1.2M</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline h-3 w-3 mr-1 text-green-500" />
              +15.3% from last period
            </p>
          </CardContent>
        </Card>

        <Card className="card-professional hover-lift">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Average Processing Time
            </CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">5.2 days</div>
            <p className="text-xs text-muted-foreground">
              <TrendingDown className="inline h-3 w-3 mr-1 text-green-500" />
              -8.2% improvement
            </p>
          </CardContent>
        </Card>

        <Card className="card-professional hover-lift">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Success Rate
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">94.2%</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline h-3 w-3 mr-1 text-green-500" />
              +2.1% improvement
            </p>
          </CardContent>
        </Card>

        <Card className="card-professional hover-lift">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              High Risk Contracts
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">8</div>
            <p className="text-xs text-muted-foreground">
              <TrendingDown className="inline h-3 w-3 mr-1 text-green-500" />
              -12 from last month
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Contract Creation Trends */}
        <Card className="card-professional">
          <CardHeader>
            <CardTitle>Contract Activity Trends</CardTitle>
            <CardDescription>Monthly contract creation and completion rates</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={mockContractData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="month" 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    color: "hsl(var(--card-foreground))"
                  }}
                />
                <Bar dataKey="created" fill="hsl(var(--primary))" name="Created" />
                <Bar dataKey="completed" fill="hsl(var(--chart-1))" name="Completed" />
                <Bar dataKey="pending" fill="hsl(var(--chart-2))" name="Pending" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Department Distribution */}
        <Card className="card-professional">
          <CardHeader>
            <CardTitle>Contracts by Department</CardTitle>
            <CardDescription>Distribution of contract requests across departments</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={mockDepartmentData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {mockDepartmentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    color: "hsl(var(--card-foreground))"
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap justify-center gap-4 mt-4">
              {mockDepartmentData.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm text-muted-foreground">{item.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Risk Analysis Trends */}
        <Card className="card-professional">
          <CardHeader>
            <CardTitle>Risk Analysis Trends</CardTitle>
            <CardDescription>Risk levels over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={mockRiskTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="month" 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    color: "hsl(var(--card-foreground))"
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="high" 
                  stackId="1" 
                  stroke="hsl(var(--destructive))" 
                  fill="hsl(var(--destructive) / 0.3)" 
                  name="High Risk"
                />
                <Area 
                  type="monotone" 
                  dataKey="medium" 
                  stackId="1" 
                  stroke="hsl(var(--chart-4))" 
                  fill="hsl(var(--chart-4) / 0.3)" 
                  name="Medium Risk"
                />
                <Area 
                  type="monotone" 
                  dataKey="low" 
                  stackId="1" 
                  stroke="hsl(var(--chart-1))" 
                  fill="hsl(var(--chart-1) / 0.3)" 
                  name="Low Risk"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Contract Value Trends */}
        <Card className="card-professional">
          <CardHeader>
            <CardTitle>Contract Value Over Time</CardTitle>
            <CardDescription>Total contract value processed monthly</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={mockValueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="month" 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))" 
                  fontSize={12}
                  tickFormatter={(value) => `$${value / 1000}k`}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    color: "hsl(var(--card-foreground))"
                  }}
                  formatter={(value) => [`$${value.toLocaleString()}`, "Value"]}
                />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={3}
                  dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 4 }}
                  name="Contract Value"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}