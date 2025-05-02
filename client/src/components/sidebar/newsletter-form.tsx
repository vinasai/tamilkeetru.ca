import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

export default function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address",
        variant: "destructive"
      });
      return;
    }

    if (!agreeToTerms) {
      toast({
        title: "Terms not accepted",
        description: "Please agree to receive our newsletter",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await apiRequest("POST", "/api/newsletters", { email });
      toast({
        title: "Success!",
        description: "You've been subscribed to our newsletter."
      });
      setEmail("");
      setAgreeToTerms(false);
      queryClient.invalidateQueries({ queryKey: ["/api/newsletters"] });
    } catch (error) {
      toast({
        title: "Subscription failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-md shadow-md p-4 mb-6">
      <h3 className="font-bold font-['Roboto_Condensed'] text-lg mb-3 pb-2 border-b border-gray-200">
        STAY INFORMED
      </h3>
      <p className="text-gray-600 mb-4 text-sm">Get breaking news and exclusive stories delivered directly to your inbox.</p>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="relative">
          <Input 
            type="email" 
            placeholder="Your email address" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isSubmitting}
            className="pl-10 bg-gray-50 border-gray-200 focus:border-secondary focus:ring-1 focus:ring-secondary placeholder:text-gray-400 text-gray-700"
          />
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            <i className="far fa-envelope"></i>
          </div>
        </div>
        
        <div className="flex items-start">
          <Checkbox 
            id="newsletter-terms" 
            checked={agreeToTerms}
            onCheckedChange={(checked) => setAgreeToTerms(checked === true)}
            disabled={isSubmitting}
            className="mt-1 mr-2 text-secondary focus:ring-secondary"
          />
          <Label htmlFor="newsletter-terms" className="text-xs text-gray-500 leading-tight">
            I agree to receive news and promotional emails from Tamil Keetru and accept the <a href="/privacy-policy" className="text-secondary hover:underline">privacy policy</a>
          </Label>
        </div>
        
        <Button 
          type="submit" 
          className="w-full bg-secondary hover:bg-secondary/90 text-white font-semibold py-2"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <><i className="fas fa-spinner fa-spin mr-2"></i>Subscribing...</>
          ) : (
            'SUBSCRIBE NOW'
          )}
        </Button>
        
        <p className="text-center text-xs text-gray-500">
          No spam, unsubscribe anytime
        </p>
      </form>
    </div>
  );
}
