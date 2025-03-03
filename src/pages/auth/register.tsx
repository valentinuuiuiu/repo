import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { authService } from "@/lib/auth";
import { 
  Loader2, 
  AtSign, 
  Lock, 
  User, 
  Store, 
  Globe, 
  ShoppingCart, 
  Building2 
} from 'lucide-react';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [registerType, setRegisterType] = useState<'merchant' | 'supplier'>('merchant');
  
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check if there's a supplier type in the URL
    const params = new URLSearchParams(location.search);
    const supplierType = params.get('type');
    if (supplierType === 'supplier') {
      setRegisterType('supplier');
    }
  }, [location]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Basic validation
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!agreedToTerms) {
      setError('You must agree to the terms and conditions');
      return;
    }

    try {
      setIsLoading(true);
      
      const userData = {
        email,
        password,
        firstName,
        lastName,
        companyName: registerType === 'supplier' ? companyName : undefined,
        userType: registerType
      };

      const { user } = await authService.signUp(userData);
      
      // Navigate to login with success message
      navigate(`/auth/login?registered=true`);
    } catch (error: any) {
      console.error("Registration failed:", error);
      setError(error.message || "Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center justify-center mb-4">
            <ShoppingCart className="h-10 w-10 text-primary mr-2" />
            <CardTitle className="text-2xl">DropConnect</CardTitle>
          </div>
          <CardDescription className="text-center">
            {registerType === 'merchant' 
              ? 'Create your merchant account' 
              : 'Register as a product supplier'}
          </CardDescription>
        </CardHeader>
        
        <Tabs 
          defaultValue="merchant" 
          value={registerType} 
          onValueChange={(value) => setRegisterType(value as 'merchant' | 'supplier')}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="merchant">
              <Store className="mr-2 h-4 w-4" /> Merchant
            </TabsTrigger>
            <TabsTrigger value="supplier">
              <Globe className="mr-2 h-4 w-4" /> Supplier
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="merchant">
            <CardContent>
              {error && (
                <div className="bg-red-50 text-red-700 p-3 rounded-md mb-4">
                  {error}
                </div>
              )}
              
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <Input 
                        type="text"
                        placeholder="First Name" 
                        className="pl-10"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        required 
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <Input 
                        type="text"
                        placeholder="Last Name" 
                        className="pl-10"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        required 
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                </div>
                
                <div>
                  <div className="relative">
                    <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input 
                      type="email"
                      placeholder="Email Address" 
                      className="pl-10"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required 
                      disabled={isLoading}
                    />
                  </div>
                </div>
                
                <div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input 
                      type="password"
                      placeholder="Password" 
                      className="pl-10"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required 
                      disabled={isLoading}
                    />
                  </div>
                </div>
                
                <div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input 
                      type="password"
                      placeholder="Confirm Password" 
                      className="pl-10"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required 
                      disabled={isLoading}
                    />
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="terms" 
                    checked={agreedToTerms}
                    onCheckedChange={(checked) => setAgreedToTerms(!!checked)}
                  />
                  <Label 
                    htmlFor="terms" 
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    I agree to the Terms of Service and Privacy Policy
                  </Label>
                </div>
                
                <Button type="submit" className="w-full" disabled={isLoading || !agreedToTerms}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating Account...
                    </>
                  ) : (
                    "Create Merchant Account"
                  )}
                </Button>
              </form>
              
              <div className="mt-4 text-center">
                <p className="text-sm text-muted-foreground">
                  Already have an account? {' '}
                  <Link 
                    to="/auth/login" 
                    className="text-primary hover:underline"
                  >
                    Login Here
                  </Link>
                </p>
              </div>
            </CardContent>
          </TabsContent>
          
          <TabsContent value="supplier">
            <CardContent>
              {error && (
                <div className="bg-red-50 text-red-700 p-3 rounded-md mb-4">
                  {error}
                </div>
              )}
              
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <Input 
                        type="text"
                        placeholder="First Name" 
                        className="pl-10"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        required 
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <Input 
                        type="text"
                        placeholder="Last Name" 
                        className="pl-10"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        required 
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                </div>
                
                <div>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input 
                      type="text"
                      placeholder="Company Name" 
                      className="pl-10"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      required 
                      disabled={isLoading}
                    />
                  </div>
                </div>
                
                <div>
                  <div className="relative">
                    <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input 
                      type="email"
                      placeholder="Business Email Address" 
                      className="pl-10"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required 
                      disabled={isLoading}
                    />
                  </div>
                </div>
                
                <div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input 
                      type="password"
                      placeholder="Password" 
                      className="pl-10"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required 
                      disabled={isLoading}
                    />
                  </div>
                </div>
                
                <div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input 
                      type="password"
                      placeholder="Confirm Password" 
                      className="pl-10"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required 
                      disabled={isLoading}
                    />
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="supplier-terms" 
                    checked={agreedToTerms}
                    onCheckedChange={(checked) => setAgreedToTerms(!!checked)}
                  />
                  <Label 
                    htmlFor="supplier-terms" 
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    I agree to the Supplier Terms of Service and Privacy Policy
                  </Label>
                </div>
                
                <Button type="submit" className="w-full" disabled={isLoading || !agreedToTerms}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating Supplier Account...
                    </>
                  ) : (
                    "Create Supplier Account"
                  )}
                </Button>
              </form>
              
              <div className="mt-4 text-center">
                <p className="text-sm text-muted-foreground">
                  Already have a supplier account? {' '}
                  <Link 
                    to="/auth/login?type=supplier" 
                    className="text-primary hover:underline"
                  >
                    Login Here
                  </Link>
                </p>
              </div>
            </CardContent>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}