import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from '@/components/ui/use-toast';
import AuthSidebar from '@/components/AuthSidebar';
import { useAuth } from '@/contexts/AuthContext';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, error } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    const success = await login(email, password);
    
    setIsLoading(false);
    
    if (success) {
      toast({
        title: "Success!",
        description: "You have been logged in.",
      });
      navigate('/home');
    } else {
      toast({
        title: "Login failed",
        description: error || "Please check your credentials and try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="auth-page">
      <AuthSidebar />
      
      <div className="auth-form-container">
        <div className="w-full max-w-md">
          <h2 className="text-4xl font-bold mb-8">LOG IN!</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="email" className="block">Enter your e-mail</label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="password" className="block">Enter your password</label>
              <Input
                id="password"
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-blue-500 hover:bg-blue-600"
              disabled={isLoading}
            >
              {isLoading ? "Logging in..." : "Log in"}
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <p>Don't have an account? <Link to="/signup" className="text-blue-500 hover:underline">Sign up!</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
