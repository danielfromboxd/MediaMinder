
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import Sidebar from '@/components/Sidebar';
import { useAuth } from '@/contexts/AuthContext';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";

const SettingsPage = () => {
  const { user, isLoggedIn } = useAuth();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isPrivateAccount, setIsPrivateAccount] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Initialize form with user data if logged in
    if (isLoggedIn && user) {
      setUsername(user.name || '');
      setEmail(user.email || '');
    }
  }, [isLoggedIn, user]);

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (password && password !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure your passwords match.",
        variant: "destructive"
      });
      return;
    }
    
    setIsUpdating(true);
    
    // Simulate update process
    setTimeout(() => {
      setIsUpdating(false);
      toast({
        title: "Settings updated",
        description: "Your account information has been updated successfully.",
      });
      setPassword('');
      setConfirmPassword('');
    }, 1000);
  };

  const handleDeleteAccount = () => {
    // Simulate account deletion
    setTimeout(() => {
      setShowDeleteDialog(false);
      toast({
        title: "Account deleted",
        description: "Your account has been deleted. You will be redirected to the login page.",
        variant: "destructive"
      });
      // In a real app, you would redirect to login page or trigger logout
    }, 1000);
  };

  const handlePrivacyToggle = () => {
    setIsPrivateAccount(!isPrivateAccount);
    toast({
      title: "Privacy setting updated",
      description: `Your account is now ${!isPrivateAccount ? 'private' : 'public'}.`,
    });
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      
      <div className="flex-1 p-8">
        <h1 className="text-5xl font-bold mb-8">SETTINGS</h1>
        
        <div className="max-w-3xl">
          <section className="mb-12 border p-6 rounded-lg shadow-sm">
            <h2 className="text-2xl font-bold mb-6">Account management</h2>
            
            <form onSubmit={handleUpdate} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="username" className="block">Username:</label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="email" className="block">Email address:</label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="password" className="block">New password:</label>
                <Input
                  id="password"
                  type="password"
                  placeholder="New password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="block">Confirm password:</label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full"
                disabled={isUpdating}
              >
                {isUpdating ? "Updating..." : "Update Account"}
              </Button>
            </form>
          </section>
          
          <section className="mb-12 border p-6 rounded-lg shadow-sm">
            <h2 className="text-2xl font-bold mb-6">Privacy settings</h2>
            
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium">Private account</h3>
                <p className="text-sm text-gray-500">When enabled, only you can see your media tracker</p>
              </div>
              <div className="flex items-center gap-2">
                <Switch 
                  checked={isPrivateAccount} 
                  onCheckedChange={handlePrivacyToggle} 
                />
                <Badge variant={isPrivateAccount ? "default" : "outline"}>
                  {isPrivateAccount ? "Private" : "Public"}
                </Badge>
              </div>
            </div>
          </section>
          
          <section className="mb-12 border p-6 rounded-lg shadow-sm bg-red-50">
            <h2 className="text-2xl font-bold mb-6 text-red-600">Danger zone</h2>
            
            <div>
              <h3 className="text-lg font-medium mb-2">Delete account</h3>
              <p className="text-sm text-gray-500 mb-4">Once you delete your account, there is no going back. Please be certain.</p>
              <Button 
                variant="destructive" 
                onClick={() => setShowDeleteDialog(true)}
              >
                Delete Account
              </Button>
            </div>
          </section>
          
          <section>
            <h2 className="text-2xl font-bold mb-4">Acknowledgements</h2>
            <p className="text-sm text-gray-600 mb-2">
              This product uses the TMDB API but is not endorsed or certified by TMDB.
            </p>
            <p className="text-sm text-gray-600">
              This product likewise uses the OpenLibrary API, but is not endorsed or certified by OpenLibrary.
            </p>
          </section>
        </div>
      </div>
      
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-red-600">Delete your account?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete your account and remove your data from our servers.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteAccount}>
              Delete Account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SettingsPage;
