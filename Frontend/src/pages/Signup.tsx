import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "";

const departments = [
  "Human Resources (HR)",
  "Finance",
  "Accounting",
  "Sales",
  "Marketing",
  "Operations",
  "Public Relations (PR)",
  "Administration"
];

const Signup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    fullName: "",
    role: "",
    department: "",
    companyId: ""
  });
  const [companies, setCompanies] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE}/api/v1/companies`)
      .then(res => res.json())
      .then(data => setCompanies(data))
      .catch(err => console.error("Failed to fetch companies", err));
  }, []);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.companyId) {
        toast({ title: "Error", description: "Please select a company", variant: "destructive" });
        return;
    }

    if (formData.role === "EMPLOYEE" && !formData.department) {
        toast({ title: "Error", description: "Please select a department", variant: "destructive" });
        return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE}/api/v1/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData), // ID is UUID string, no need to parse
      });

      const data = await response.json();
      
      if (response.ok) {
        toast({ title: "Success", description: "Account created! Please login." });
        navigate("/login");
      } else {
        toast({ title: "Signup Failed", description: data.message || "Signup failed", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Connection Error", description: "Signup failed. Please check your connection.", variant: "destructive" });
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background pattern-1 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
            <CardTitle className="text-2xl font-bold">Join ContractsHereAI</CardTitle>
            <CardDescription>Create your account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignup} className="space-y-4">
            <div className="space-y-2">
                <Label>Full Name</Label>
                <Input value={formData.fullName} onChange={e => handleChange("fullName", e.target.value)} required disabled={isLoading} />
            </div>
            <div className="space-y-2">
                <Label>Username</Label>
                <Input value={formData.username} onChange={e => handleChange("username", e.target.value)} required disabled={isLoading} />
            </div>
            <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" value={formData.email} onChange={e => handleChange("email", e.target.value)} required disabled={isLoading} />
            </div>
            <div className="space-y-2">
                <Label>Password</Label>
                <Input type="password" value={formData.password} onChange={e => handleChange("password", e.target.value)} required disabled={isLoading} />
            </div>

            <div className="space-y-2">
                <Label>Company</Label>
                <Select onValueChange={value => handleChange("companyId", value)} disabled={isLoading}>
                    <SelectTrigger>
                        <SelectValue placeholder="Select Company" />
                    </SelectTrigger>
                    <SelectContent>
                        {companies.map(company => (
                            <SelectItem key={company.id} value={company.id.toString()}>
                                {company.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-2">
                <Label>Role</Label>
                <Select onValueChange={value => handleChange("role", value)} disabled={isLoading}>
                    <SelectTrigger>
                        <SelectValue placeholder="Select Role" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="EMPLOYEE">Department Employee</SelectItem>
                        <SelectItem value="LEGAL_TEAM">Legal Team</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {formData.role === "EMPLOYEE" && (
                <div className="space-y-2">
                    <Label>Department</Label>
                    <Select onValueChange={value => handleChange("department", value)} disabled={isLoading}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select Department" />
                        </SelectTrigger>
                        <SelectContent>
                            {departments.map(dept => (
                                <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Creating Account..." : "Sign Up"}
            </Button>
            
            <div className="text-center text-sm">
                Already have an account? <Link to="/login" className="underline">Sign in</Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Signup;
