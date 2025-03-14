
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from "@/components/ui/use-toast";

const LogoutPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Clear user data from localStorage
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('user');
    
    // Show toast notification
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
    
    // Redirect to login page
    navigate('/login');
  }, [navigate, toast]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p>Logging out...</p>
    </div>
  );
};

export default LogoutPage;
