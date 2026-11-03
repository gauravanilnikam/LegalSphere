import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "";

const AdminDashboard = () => {
  const { token } = useAuth();
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [regNumber, setRegNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [companies, setCompanies] = useState<any[]>([]);

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
        const response = await fetch(`${API_BASE}/api/v1/companies`);
        if (response.ok) {
            const data = await response.json();
            setCompanies(data);
        }
    } catch (error) {
        console.error("Failed to fetch companies", error);
    }
  };

  const handleCreateCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const response = await fetch(`${API_BASE}/api/v1/admin/companies`, {
        method: "POST",
        headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}` 
        },
        body: JSON.stringify({ name, address, registrationNumber: regNumber }),
      });

      if (response.ok) {
        toast({ title: "Success", description: "Company created successfully" });
        setName("");
        setAddress("");
        setRegNumber("");
        fetchCompanies();
      } else {
        const data = await response.json();
        toast({ title: "Error", description: data.message || "Failed to create company", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to create company", variant: "destructive" });
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Create New Company</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateCompany} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Company Name</Label>
                  <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input id="address" value={address} onChange={(e) => setAddress(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="regNumber">Registration Number</Label>
                  <Input id="regNumber" value={regNumber} onChange={(e) => setRegNumber(e.target.value)} />
                </div>
                <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Creating..." : "Create Company"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Existing Companies</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {companies.map((company) => (
                        <div key={company.id} className="p-4 border rounded-lg bg-muted/50">
                            <h3 className="font-semibold text-lg">{company.name}</h3>
                            <div className="text-sm text-muted-foreground">
                                <p>{company.address}</p>
                                <p>Reg: {company.registrationNumber}</p>
                            </div>
                        </div>
                    ))}
                    {companies.length === 0 && <p className="text-muted-foreground">No companies found.</p>}
                </div>
            </CardContent>
          </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
