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
        NEWSLETTER
      </h3>
      <p className="text-gray-600 mb-3 text-sm">Stay updated with our daily digest of top stories.</p>
      <form className="space-y-3" onSubmit={handleSubmit}>
        <Input 
          type="email" 
          placeholder="Your email address" 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isSubmitting}
        />
        <div className="flex items-start">
          <Checkbox 
            id="newsletter-terms" 
            checked={agreeToTerms}
            onCheckedChange={(checked) => setAgreeToTerms(checked === true)}
            disabled={isSubmitting}
            className="mt-1 mr-2"
          />
          <Label htmlFor="newsletter-terms" className="text-xs text-gray-500">
            I agree to receive news and promotional emails
          </Label>
        </div>
        <Button 
          type="submit" 
          className="w-full bg-secondary text-white"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <><i className="fas fa-spinner fa-spin mr-2"></i>Subscribing...</>
          ) : (
            'Subscribe'
          )}
        </Button>
      </form>
    </div>
  );
}
