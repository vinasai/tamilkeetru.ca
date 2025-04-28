import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/use-auth";

interface CommentFormProps {
  articleId: number;
  parentId?: number;
  onSuccess?: () => void;
}

export default function CommentForm({ articleId, parentId, onSuccess }: CommentFormProps) {
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to comment",
        variant: "destructive"
      });
      return;
    }

    if (!content.trim()) {
      toast({
        title: "Empty comment",
        description: "Please enter a comment",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await apiRequest("POST", "/api/comments", {
        articleId,
        userId: user.id,
        parentId,
        content
      });
      
      toast({
        title: "Success!",
        description: "Your comment has been posted."
      });
      
      setContent("");
      queryClient.invalidateQueries({ queryKey: [`/api/articles/${articleId}/comments`] });
      queryClient.invalidateQueries({ queryKey: [`/api/articles/${articleId}`] });
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      toast({
        title: "Failed to post comment",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-6">
      <Textarea
        placeholder={
          user 
            ? "Write your comment..." 
            : "Please sign in to comment"
        }
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent"
        rows={3}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        disabled={!user || isSubmitting}
      />
      <div className="flex justify-end mt-2">
        <Button 
          type="submit" 
          className="bg-secondary text-white px-4 py-2 rounded font-medium"
          disabled={!user || isSubmitting}
        >
          {isSubmitting ? (
            <><i className="fas fa-spinner fa-spin mr-2"></i>Posting...</>
          ) : (
            'Post Comment'
          )}
        </Button>
      </div>
    </form>
  );
}
