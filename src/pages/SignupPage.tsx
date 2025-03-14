
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import AuthSidebar from '@/components/AuthSidebar';
import { useAuth } from '@/contexts/AuthContext';

const SignupPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { signup } = useAuth();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const success = await signup(name, email, password);
      
      if (success) {
        toast({
          title: "Account created",
          description: "You've successfully signed up!",
        });
        navigate('/home');
      } else {
        toast({
          title: "Signup failed",
          description: "Failed to create account.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Signup error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <AuthSidebar />
      
      <div className="auth-form-container">
        <div className="w-full max-w-md">
          <h2 className="text-4xl font-bold mb-8">SIGN UP!</h2>
          
          <form onSubmit={handleSignup} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="name" className="block">Enter your name</label>
              <Input
                id="name"
                type="text"
                placeholder="John Smith"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="email" className="block">Enter your email</label>
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
              {isLoading ? "Signing up..." : "Sign up"}
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <p>Already have an account? <Link to="/login" className="text-blue-500 hover:underline">Log in!</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
