import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle, 
  CardFooter 
} from "@/components/ui/card";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { authService } from "@/lib/auth";
import { Loader2, AtSign, Lock, Store, Globe, ShoppingCart } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [loginType, setLoginType] = useState<'merchant' | 'supplier'>('merchant');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check for registration success message
    const params = new URLSearchParams(location.search);
    if (params.get('registered') === 'true') {
      setSuccessMessage('Account created successfully! Please log in.');
    }
    if (params.get('reset') === 'true') {
      setSuccessMessage('Password has been reset. Please log in with your new password.');
    }
  }, [location]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    try {
      setIsLoading(true);
      const { user } = await authService.signIn(email, password);
      
      // Determine navigation based on user type and email
      if (loginType === 'merchant') {
        if (user.email === "ionutbaltag3@gmail.com") {
          navigate("/dashboard");
        } else {
          navigate("/agent-dashboard");
        }
      } else {
        // Supplier-specific navigation
        navigate("/suppliers/dashboard");
      }
    } catch (error: any) {
      console.error("Login failed:", error);
      setError(error.message || "Login failed. Please check your credentials.");
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
            {loginType === 'merchant' 
              ? 'Login to manage your dropshipping business' 
              : 'Supplier login to manage your product listings'}
          </CardDescription>
        </CardHeader>
        
        <Tabs 
          defaultValue="merchant" 
          value={loginType} 
          onValueChange={(value) => setLoginType(value as 'merchant' | 'supplier')}
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
              
              {successMessage && (
                <div className="bg-green-50 text-green-700 p-3 rounded-md mb-4">
                  {successMessage}
                </div>
              )}
              
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <div className="relative">
                    <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input 
                      type="email"
                      placeholder="Enter your email" 
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
                      placeholder="Enter your password" 
                      className="pl-10"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required 
                      disabled={isLoading}
                    />
                  </div>
                  <div className="text-right mt-2">
                    <Link 
                      to="/auth/reset-password" 
                      className="text-sm text-primary hover:underline"
                    >
                      Forgot Password?
                    </Link>
                  </div>
                </div>
                
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Logging in...
                    </>
                  ) : (
                    "Login as Merchant"
                  )}
                </Button>
              </form>
              
              <div className="mt-4 text-center">
                <p className="text-sm text-muted-foreground">
                  Don't have a merchant account? {' '}
                  <Link 
                    to="/auth/register" 
                    className="text-primary hover:underline"
                  >
                    Register Now
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
              
              {successMessage && (
                <div className="bg-green-50 text-green-700 p-3 rounded-md mb-4">
                  {successMessage}
                </div>
              )}
              
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <div className="relative">
                    <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input 
                      type="email"
                      placeholder="Enter your supplier email" 
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
                      placeholder="Enter your password" 
                      className="pl-10"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required 
                      disabled={isLoading}
                    />
                  </div>
                  <div className="text-right mt-2">
                    <Link 
                      to="/auth/reset-password" 
                      className="text-sm text-primary hover:underline"
                    >
                      Forgot Password?
                    </Link>
                  </div>
                </div>
                
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Logging in...
                    </>
                  ) : (
                    "Login as Supplier"
                  )}
                </Button>
              </form>
              
              <div className="mt-4 text-center">
                <p className="text-sm text-muted-foreground">
                  Want to list your products? {' '}
                  <Link 
                    to="/auth/register?type=supplier" 
                    className="text-primary hover:underline"
                  >
                    Become a Supplier
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