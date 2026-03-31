import { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Loader2, UserPlus, LogIn, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const ALLOWED_DOMAIN = "cagd.gov.gh";

export default function Login() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();

  const isStaffRedirect = searchParams.has("redirect");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const { error } = await signIn(email, password);
    setIsLoading(false);
    if (error) {
      toast({ title: "Login failed", description: error.message, variant: "destructive" });
    } else {
      const redirect = searchParams.get("redirect");
      navigate(redirect || "/admin");
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.toLowerCase().endsWith(`@${ALLOWED_DOMAIN}`)) {
      toast({ title: "Registration restricted", description: `Only @${ALLOWED_DOMAIN} email addresses can register.`, variant: "destructive" });
      return;
    }

    if (password.length < 6) {
      toast({ title: "Password too short", description: "Password must be at least 6 characters.", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    const { error } = await signUp(email, password, displayName || undefined);
    setIsLoading(false);

    if (error) {
      toast({ title: "Registration failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Account created", description: "Check your email to verify your account, then sign in." });
      setMode("login");
      setPassword("");
    }
  };

  const PasswordInput = ({ id, value, onChange, placeholder }: { id: string; value: string; onChange: (v: string) => void; placeholder?: string }) => (
    <div className="relative">
      <Input
        id={id}
        type={showPassword ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="pr-10"
        required
      />
      <button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
        tabIndex={-1}
      >
        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </button>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-primary rounded-full flex items-center justify-center mb-4">
            <Shield className="w-6 h-6 text-primary-foreground" />
          </div>
          <CardTitle className="font-heading text-2xl">
            {mode === "login" ? "CAGD Portal" : "Create Account"}
          </CardTitle>
          <CardDescription>
            {mode === "login"
              ? (isStaffRedirect ? "Sign in to access the Staff Directory" : "Sign in to manage content")
              : "Register with your @cagd.gov.gh email"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {mode === "login" ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@cagd.gov.gh" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <PasswordInput id="password" value={password} onChange={setPassword} />
              </div>
              <div className="flex justify-end -mt-1">
                <Link to="/admin/forgot-password" className="text-xs text-primary hover:underline">
                  Forgot password?
                </Link>
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <LogIn className="w-4 h-4 mr-2" />}
                Sign In
              </Button>
              <p className="text-center text-sm text-muted-foreground mt-3">
                Don't have an account?{" "}
                <button type="button" onClick={() => setMode("register")} className="text-primary font-medium hover:underline">
                  Register
                </button>
              </p>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Kwame Mensah" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reg-email">Email</Label>
                <Input id="reg-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@cagd.gov.gh" required />
                <p className="text-xs text-muted-foreground">Only @{ALLOWED_DOMAIN} addresses allowed</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="reg-password">Password</Label>
                <PasswordInput id="reg-password" value={password} onChange={setPassword} placeholder="At least 6 characters" />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <UserPlus className="w-4 h-4 mr-2" />}
                Create Account
              </Button>
              <p className="text-center text-sm text-muted-foreground mt-3">
                Already have an account?{" "}
                <button type="button" onClick={() => setMode("login")} className="text-primary font-medium hover:underline">
                  Sign In
                </button>
              </p>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
