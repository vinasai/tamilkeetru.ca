import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

// Mock data - replace with actual API calls
const fetchLikedArticles = async (userId: string | number) => {
  // Example API call
  // return await fetch(`/api/users/${userId}/likes`).then(res => res.json());
  
  // Mock data
  return [
    { id: 1, title: "Understanding Climate Change", category: "science", date: "2023-06-15" },
    { id: 2, title: "Technology Trends in 2023", category: "technology", date: "2023-05-22" },
    { id: 3, title: "Global Economic Outlook", category: "business", date: "2023-07-03" },
  ];
};

const fetchCommentedArticles = async (userId: string | number) => {
  // Example API call
  // return await fetch(`/api/users/${userId}/comments`).then(res => res.json());
  
  // Mock data
  return [
    { 
      id: 1, 
      title: "Latest Political Developments", 
      category: "politics", 
      date: "2023-06-10",
      comment: "This is a very insightful article that addresses many important issues." 
    },
    { 
      id: 2, 
      title: "Sports Highlights of the Week", 
      category: "sports", 
      date: "2023-06-05",
      comment: "I think the analysis in this article is spot-on!" 
    },
  ];
};

const fetchUserStats = async (userId: string | number) => {
  // Example API call
  // return await fetch(`/api/users/${userId}/stats`).then(res => res.json());
  
  // Mock data
  return {
    totalLikes: 15,
    totalComments: 8,
    articleReach: 650,
    lastActive: "2023-07-10",
  };
};

export default function ClientDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  
  // Make sure user is defined
  if (!user) {
    return <div>Loading...</div>;
  }
  
  const { data: likedArticles, isLoading: likesLoading } = useQuery({
    queryKey: ["likedArticles", user.id],
    queryFn: () => fetchLikedArticles(user.id),
    enabled: !!user.id,
  });
  
  const { data: commentedArticles, isLoading: commentsLoading } = useQuery({
    queryKey: ["commentedArticles", user.id],
    queryFn: () => fetchCommentedArticles(user.id),
    enabled: !!user.id,
  });
  
  const { data: userStats, isLoading: statsLoading } = useQuery({
    queryKey: ["userStats", user.id],
    queryFn: () => fetchUserStats(user.id),
    enabled: !!user.id,
  });

  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <h1 className="text-3xl font-bold mb-6">My Dashboard</h1>
      
      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-3 w-full max-w-md">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="likes">Liked Articles</TabsTrigger>
          <TabsTrigger value="comments">My Comments</TabsTrigger>
        </TabsList>
        
        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xl">Liked Articles</CardTitle>
                <CardDescription>Articles you've liked</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-secondary">
                  {statsLoading ? "..." : userStats?.totalLikes}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xl">Comments</CardTitle>
                <CardDescription>Your engagement</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-secondary">
                  {statsLoading ? "..." : userStats?.totalComments}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xl">Reach</CardTitle>
                <CardDescription>People who've seen your activity</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-secondary">
                  {statsLoading ? "..." : userStats?.articleReach}
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Likes</CardTitle>
              </CardHeader>
              <CardContent>
                {likesLoading ? (
                  <p>Loading...</p>
                ) : likedArticles && likedArticles.length > 0 ? (
                  <ul className="space-y-3">
                    {likedArticles.slice(0, 3).map(article => (
                      <li key={article.id} className="border-b pb-3 last:border-0">
                        <Link href={`/article/${article.id}`} className="hover:text-secondary">
                          <h3 className="font-medium">{article.title}</h3>
                        </Link>
                        <div className="flex items-center mt-1 text-sm text-gray-500">
                          <Badge variant="outline" className="mr-2">{article.category}</Badge>
                          <span>{article.date}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500">You haven't liked any articles yet.</p>
                )}
                {likedArticles && likedArticles.length > 0 && (
                  <Button variant="ghost" className="mt-4 w-full" onClick={() => setActiveTab("likes")}>
                    View all liked articles
                  </Button>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Recent Comments</CardTitle>
              </CardHeader>
              <CardContent>
                {commentsLoading ? (
                  <p>Loading...</p>
                ) : commentedArticles && commentedArticles.length > 0 ? (
                  <ul className="space-y-3">
                    {commentedArticles.slice(0, 2).map(article => (
                      <li key={article.id} className="border-b pb-3 last:border-0">
                        <Link href={`/article/${article.id}`} className="hover:text-secondary">
                          <h3 className="font-medium">{article.title}</h3>
                        </Link>
                        <p className="text-sm mt-1 line-clamp-2">{article.comment}</p>
                        <div className="flex items-center mt-1 text-sm text-gray-500">
                          <Badge variant="outline" className="mr-2">{article.category}</Badge>
                          <span>{article.date}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500">You haven't commented on any articles yet.</p>
                )}
                {commentedArticles && commentedArticles.length > 0 && (
                  <Button variant="ghost" className="mt-4 w-full" onClick={() => setActiveTab("comments")}>
                    View all comments
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Liked Articles Tab */}
        <TabsContent value="likes">
          <Card>
            <CardHeader>
              <CardTitle>Liked Articles</CardTitle>
              <CardDescription>All articles you've liked</CardDescription>
            </CardHeader>
            <CardContent>
              {likesLoading ? (
                <p>Loading...</p>
              ) : likedArticles && likedArticles.length > 0 ? (
                <ul className="space-y-4">
                  {likedArticles.map(article => (
                    <li key={article.id} className="border-b pb-4 last:border-0">
                      <Link href={`/article/${article.id}`} className="hover:text-secondary">
                        <h3 className="font-medium text-lg">{article.title}</h3>
                      </Link>
                      <div className="flex items-center mt-2 text-sm text-gray-500">
                        <Badge variant="outline" className="mr-2">{article.category}</Badge>
                        <span>{article.date}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">You haven't liked any articles yet.</p>
                  <Link href="/">
                    <Button className="bg-secondary text-white">Browse Articles</Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Comments Tab */}
        <TabsContent value="comments">
          <Card>
            <CardHeader>
              <CardTitle>My Comments</CardTitle>
              <CardDescription>Articles you've commented on</CardDescription>
            </CardHeader>
            <CardContent>
              {commentsLoading ? (
                <p>Loading...</p>
              ) : commentedArticles && commentedArticles.length > 0 ? (
                <ul className="space-y-6">
                  {commentedArticles.map(article => (
                    <li key={article.id} className="border-b pb-6 last:border-0">
                      <Link href={`/article/${article.id}`} className="hover:text-secondary">
                        <h3 className="font-medium text-lg">{article.title}</h3>
                      </Link>
                      <div className="bg-gray-50 p-3 rounded-md my-2 text-sm">
                        {article.comment}
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <Badge variant="outline" className="mr-2">{article.category}</Badge>
                        <span>{article.date}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">You haven't commented on any articles yet.</p>
                  <Link href="/">
                    <Button className="bg-secondary text-white">Browse Articles</Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 