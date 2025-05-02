import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { CommentWithUser } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import CommentForm from "./comment-form";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

interface CommentListProps {
  articleId: number;
}

export default function CommentList({ articleId }: CommentListProps) {
  const { data: comments, isLoading } = useQuery<CommentWithUser[]>({
    queryKey: [`/api/articles/${articleId}/comments`],
  });
  
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleLikeComment = async (commentId: number) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to like comments",
        variant: "destructive"
      });
      return;
    }

    try {
      await apiRequest("POST", `/api/comments/${commentId}/like`, { userId: user.id });
      queryClient.invalidateQueries({ queryKey: [`/api/articles/${articleId}/comments`] });
      toast({
        title: "Success!",
        description: "You liked this comment."
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to like comment",
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        {[...Array(3)].map((_, index) => (
          <div key={index} className="border-b border-gray-200 pb-4">
            <div className="flex items-start">
              <div className="w-10 h-10 rounded-full bg-gray-200 mr-3"></div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div className="h-4 bg-gray-200 w-24 rounded"></div>
                  <div className="h-3 bg-gray-200 w-16 rounded"></div>
                </div>
                <div className="h-4 bg-gray-200 w-full rounded mt-2"></div>
                <div className="h-4 bg-gray-200 w-full rounded mt-1"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!comments || comments.length === 0) {
    return (
      <div className="text-center py-6 text-gray-500">
        No comments yet. Be the first to comment!
      </div>
    );
  }

  // Get top-level comments and organize replies
  const topLevelComments = comments.filter(comment => !comment.parentId);
  const commentReplies = comments.filter(comment => comment.parentId);

  // Organizing replies into a map for easier access
  const repliesMap = new Map<number, CommentWithUser[]>();
  commentReplies.forEach(reply => {
    if (reply.parentId) {
      const existingReplies = repliesMap.get(reply.parentId) || [];
      repliesMap.set(reply.parentId, [...existingReplies, reply]);
    }
  });

  return (
    <div className="space-y-4">
      {topLevelComments.map(comment => (
        <div key={comment.id} className="border-b border-gray-200 pb-4">
          <div className="flex items-start">
            <img 
              src={`https://ui-avatars.com/api/?name=${comment.user.username}&background=random`} 
              alt={comment.user.username} 
              className="w-10 h-10 rounded-full mr-3"
            />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <p className="font-medium">{comment.user.username}</p>
                <span className="text-xs text-gray-500">
                  {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                </span>
              </div>
              <p className="text-sm mt-1">{comment.content}</p>
              <div className="flex items-center space-x-4 mt-2 text-sm">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="p-0 h-auto text-gray-500 hover:text-primary flex items-center"
                  onClick={() => handleLikeComment(comment.id)}
                >
                  <i className="far fa-thumbs-up mr-1 align-text-bottom"></i> {comment.likeCount}
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="p-0 h-auto text-gray-500 hover:text-primary flex items-center"
                  onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                >
                  {replyingTo === comment.id ? 'Cancel' : 'Reply'}
                </Button>
              </div>
              
              {/* Reply form */}
              {replyingTo === comment.id && (
                <div className="mt-3 ml-6 pt-3">
                  <CommentForm 
                    articleId={articleId} 
                    parentId={comment.id}
                    onSuccess={() => setReplyingTo(null)}
                  />
                </div>
              )}
              
              {/* Nested replies */}
              {repliesMap.get(comment.id)?.map(reply => (
                <div key={reply.id} className="mt-3 ml-6 pt-3 border-t border-gray-100">
                  <div className="flex items-start">
                    <img 
                      src={`https://ui-avatars.com/api/?name=${reply.user.username}&background=random`} 
                      alt={reply.user.username} 
                      className="w-8 h-8 rounded-full mr-2"
                    />
                    <div>
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-sm">{reply.user.username}</p>
                        <span className="text-xs text-gray-500">
                          {formatDistanceToNow(new Date(reply.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                      <p className="text-sm mt-1">{reply.content}</p>
                      <div className="flex items-center space-x-4 mt-2 text-sm">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="p-0 h-auto text-gray-500 hover:text-primary flex items-center"
                          onClick={() => handleLikeComment(reply.id)}
                        >
                          <i className="far fa-thumbs-up mr-1 align-text-bottom"></i> {reply.likeCount}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
      
      {comments.length > 5 && (
        <div className="text-center">
          <Button 
            variant="ghost" 
            className="text-primary font-medium hover:text-primary/80"
            onClick={() => queryClient.invalidateQueries({ queryKey: [`/api/articles/${articleId}/comments`] })}
          >
            Load More Comments
          </Button>
        </div>
      )}
    </div>
  );
}
