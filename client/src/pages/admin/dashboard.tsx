import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { Article, Category, Comment, Newsletter } from "@shared/schema";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";

export default function AdminDashboard() {
  const { user } = useAuth();
  
  const { data: articles } = useQuery<Article[]>({
    queryKey: ["/api/articles"],
  });

  const { data: categories } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const { data: comments } = useQuery<Comment[]>({
    queryKey: ["/api/comments"],
  });

  const { data: newsletters } = useQuery<Newsletter[]>({
    queryKey: ["/api/newsletters"],
  });

  // Calculate stats
  const totalArticles = articles?.length || 0;
  const totalCategories = categories?.length || 0;
  const totalComments = comments?.length || 0;
  const totalSubscribers = newsletters?.length || 0;
  
  // Calculate featured and breaking news articles
  const featuredArticles = articles?.filter(article => article.isFeatured).length || 0;
  const breakingArticles = articles?.filter(article => article.isBreaking).length || 0;

  // Prepare data for charts
  const categoryData = categories?.map(category => ({
    name: category.name,
    count: category.postCount
  })) || [];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#E30613'];

  // Prepare recent activities
  const recentActivities = [
    { type: 'article', message: 'New article published', time: '2 hours ago' },
    { type: 'comment', message: 'New comment received', time: '3 hours ago' },
    { type: 'subscriber', message: 'New newsletter subscriber', time: '5 hours ago' },
    { type: 'article', message: 'Article updated', time: '1 day ago' },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold font-['Roboto_Condensed']">Admin Dashboard</h1>
        <div className="flex items-center">
          <span className="mr-2">Welcome, {user?.username}</span>
          <Link href="/">
            <Button variant="outline" size="sm">
              <i className="fas fa-external-link-alt mr-2"></i> View Site
            </Button>
          </Link>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Articles</p>
              <h3 className="text-2xl font-bold">{totalArticles}</h3>
            </div>
            <div className="w-12 h-12 bg-secondary/20 flex items-center justify-center rounded-full">
              <i className="fas fa-newspaper text-xl text-secondary"></i>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Categories</p>
              <h3 className="text-2xl font-bold">{totalCategories}</h3>
            </div>
            <div className="w-12 h-12 bg-primary/20 flex items-center justify-center rounded-full">
              <i className="fas fa-tag text-xl text-primary"></i>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Comments</p>
              <h3 className="text-2xl font-bold">{totalComments}</h3>
            </div>
            <div className="w-12 h-12 bg-[#28A745]/20 flex items-center justify-center rounded-full">
              <i className="fas fa-comments text-xl text-[#28A745]"></i>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Subscribers</p>
              <h3 className="text-2xl font-bold">{totalSubscribers}</h3>
            </div>
            <div className="w-12 h-12 bg-accent/20 flex items-center justify-center rounded-full">
              <i className="fas fa-envelope text-xl text-accent"></i>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Content Overview */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Content Overview</CardTitle>
            <CardDescription>
              Distribution of content across categories
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={categoryData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#E30613" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Article Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Article Stats</CardTitle>
            <CardDescription>
              Distribution of article types
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Standard', value: totalArticles - featuredArticles - breakingArticles },
                      { name: 'Featured', value: featuredArticles },
                      { name: 'Breaking', value: breakingArticles }
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    label
                  >
                    {[0, 1, 2].map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-3 gap-2 mt-2">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-[#0088FE] rounded-full mr-2"></div>
                <span className="text-xs">Standard</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-[#00C49F] rounded-full mr-2"></div>
                <span className="text-xs">Featured</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-[#FFBB28] rounded-full mr-2"></div>
                <span className="text-xs">Breaking</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="quickActions">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="quickActions">Quick Actions</TabsTrigger>
          <TabsTrigger value="recentActivity">Recent Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="quickActions">
          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link href="/admin/articles/create">
                  <Button className="w-full bg-secondary text-white h-auto py-4">
                    <i className="fas fa-plus-circle mr-2"></i>
                    <div>
                      <div className="font-bold">Add New Article</div>
                      <div className="text-xs opacity-80">Create a new article</div>
                    </div>
                  </Button>
                </Link>
                <Link href="/admin/articles">
                  <Button className="w-full bg-secondary text-white h-auto py-4" variant="outline">
                    <i className="fas fa-newspaper mr-2"></i>
                    <div>
                      <div className="font-bold">Manage Articles</div>
                      <div className="text-xs opacity-80">Edit or delete articles</div>
                    </div>
                  </Button>
                </Link>
                <Link href="/admin/categories">
                  <Button className="w-full bg-secondary text-white h-auto py-4" variant="outline">
                    <i className="fas fa-tags mr-2"></i>
                    <div>
                      <div className="font-bold">Manage Categories</div>
                      <div className="text-xs opacity-80">Update news categories</div>
                    </div>
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recentActivity">
          <Card>
            <CardContent className="p-6">
              <ul className="space-y-4">
                {recentActivities.map((activity, index) => (
                  <li key={index} className="flex items-start border-b border-gray-100 pb-3">
                    <div className={`w-10 h-10 rounded-full mr-3 flex items-center justify-center 
                      ${activity.type === 'article' ? 'bg-secondary/20' : 
                        activity.type === 'comment' ? 'bg-[#28A745]/20' : 'bg-accent/20'}`}>
                      <i className={`
                        ${activity.type === 'article' ? 'fas fa-newspaper text-secondary' : 
                          activity.type === 'comment' ? 'fas fa-comment text-[#28A745]' : 'fas fa-user text-accent'}
                      `}></i>
                    </div>
                    <div>
                      <p className="font-medium">{activity.message}</p>
                      <p className="text-xs text-gray-500">{activity.time}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
