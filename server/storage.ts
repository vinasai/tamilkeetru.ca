import { 
  users, type User, type InsertUser, 
  categories, type Category, type InsertCategory,
  articles, type Article, type InsertArticle, type ArticleWithDetails,
  comments, type Comment, type InsertComment, type CommentWithUser,
  likes, type Like, type InsertLike,
  newsletters, type Newsletter, type InsertNewsletter
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Category methods
  getCategories(): Promise<Category[]>;
  getCategory(id: number): Promise<Category | undefined>;
  getCategoryBySlug(slug: string): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: number, category: Partial<Category>): Promise<Category | undefined>;
  deleteCategory(id: number): Promise<boolean>;
  incrementCategoryPostCount(id: number): Promise<Category | undefined>;
  decrementCategoryPostCount(id: number): Promise<Category | undefined>;
  
  // Article methods
  getArticles(): Promise<ArticleWithDetails[]>;
  getArticle(id: number): Promise<Article | undefined>;
  getArticleWithDetails(id: number): Promise<ArticleWithDetails | undefined>;
  getArticleBySlug(slug: string): Promise<ArticleWithDetails | undefined>;
  getFeaturedArticles(limit?: number): Promise<ArticleWithDetails[]>;
  getBreakingArticles(limit?: number): Promise<ArticleWithDetails[]>;
  getPopularArticles(limit?: number): Promise<ArticleWithDetails[]>;
  getArticlesByCategory(categoryId: number, limit?: number): Promise<ArticleWithDetails[]>;
  getCategoryArticles(categorySlug: string, limit?: number): Promise<ArticleWithDetails[]>;
  getRelatedArticles(articleId: number, categoryId: number, limit?: number): Promise<ArticleWithDetails[]>;
  searchArticles(query: string): Promise<ArticleWithDetails[]>;
  createArticle(article: InsertArticle): Promise<Article>;
  updateArticle(id: number, article: Partial<Article>): Promise<Article | undefined>;
  deleteArticle(id: number): Promise<boolean>;
  
  // Comment methods
  getComments(): Promise<Comment[]>;
  getArticleComments(articleId: number): Promise<CommentWithUser[]>;
  createComment(comment: InsertComment): Promise<Comment>;
  updateComment(id: number, comment: Partial<Comment>): Promise<Comment | undefined>;
  deleteComment(id: number): Promise<boolean>;
  likeComment(commentId: number, userId: number): Promise<Comment | undefined>;
  
  // Like methods
  getArticleLikes(articleId: number): Promise<Like[]>;
  getUserLike(articleId: number, userId: number): Promise<Like | undefined>;
  createLike(like: InsertLike): Promise<Like>;
  deleteLike(articleId: number, userId: number): Promise<boolean>;
  
  // Newsletter methods
  getNewsletterSubscribers(): Promise<Newsletter[]>;
  getNewsletterSubscriber(email: string): Promise<Newsletter | undefined>;
  createNewsletterSubscriber(newsletter: InsertNewsletter): Promise<Newsletter>;
  deleteNewsletterSubscriber(id: number): Promise<boolean>;
  
  // Session store
  sessionStore: session.SessionStore;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private categories: Map<number, Category>;
  private articles: Map<number, Article>;
  private comments: Map<number, Comment>;
  private likes: Map<number, Like>;
  private newsletters: Map<number, Newsletter>;
  
  userCurrentId: number;
  categoryCurrentId: number;
  articleCurrentId: number;
  commentCurrentId: number;
  likeCurrentId: number;
  newsletterCurrentId: number;
  
  sessionStore: session.SessionStore;

  constructor() {
    this.users = new Map();
    this.categories = new Map();
    this.articles = new Map();
    this.comments = new Map();
    this.likes = new Map();
    this.newsletters = new Map();
    
    this.userCurrentId = 1;
    this.categoryCurrentId = 1;
    this.articleCurrentId = 1;
    this.commentCurrentId = 1;
    this.likeCurrentId = 1;
    this.newsletterCurrentId = 1;
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // prune expired entries every 24h
    });
    
    // Add initial data for demo purposes
    this.seedData();
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username.toLowerCase() === username.toLowerCase(),
    );
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email.toLowerCase() === email.toLowerCase(),
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const now = new Date();
    const user: User = { 
      ...insertUser, 
      id,
      isAdmin: insertUser.isAdmin || false,
      createdAt: now
    };
    this.users.set(id, user);
    return user;
  }
  
  // Category methods
  async getCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }
  
  async getCategory(id: number): Promise<Category | undefined> {
    return this.categories.get(id);
  }
  
  async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    return Array.from(this.categories.values()).find(
      (category) => category.slug === slug,
    );
  }
  
  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const id = this.categoryCurrentId++;
    const category: Category = { 
      ...insertCategory, 
      id,
      postCount: insertCategory.postCount || 0
    };
    this.categories.set(id, category);
    return category;
  }
  
  async updateCategory(id: number, category: Partial<Category>): Promise<Category | undefined> {
    const existingCategory = this.categories.get(id);
    if (!existingCategory) return undefined;
    
    const updatedCategory = { ...existingCategory, ...category };
    this.categories.set(id, updatedCategory);
    return updatedCategory;
  }
  
  async deleteCategory(id: number): Promise<boolean> {
    // Check if category has articles
    const categoryArticles = Array.from(this.articles.values()).filter(
      (article) => article.categoryId === id,
    );
    
    if (categoryArticles.length > 0) {
      return false;
    }
    
    return this.categories.delete(id);
  }
  
  async incrementCategoryPostCount(id: number): Promise<Category | undefined> {
    const category = this.categories.get(id);
    if (!category) return undefined;
    
    const updatedCategory = { ...category, postCount: category.postCount + 1 };
    this.categories.set(id, updatedCategory);
    return updatedCategory;
  }
  
  async decrementCategoryPostCount(id: number): Promise<Category | undefined> {
    const category = this.categories.get(id);
    if (!category) return undefined;
    
    const updatedCategory = { ...category, postCount: Math.max(0, category.postCount - 1) };
    this.categories.set(id, updatedCategory);
    return updatedCategory;
  }
  
  // Article methods
  async getArticles(): Promise<ArticleWithDetails[]> {
    return Array.from(this.articles.values())
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .map(article => this.enrichArticleWithDetails(article));
  }
  
  async getArticle(id: number): Promise<Article | undefined> {
    return this.articles.get(id);
  }
  
  async getArticleWithDetails(id: number): Promise<ArticleWithDetails | undefined> {
    const article = this.articles.get(id);
    if (!article) return undefined;
    
    return this.enrichArticleWithDetails(article);
  }
  
  async getArticleBySlug(slug: string): Promise<ArticleWithDetails | undefined> {
    const article = Array.from(this.articles.values()).find(
      (article) => article.slug === slug,
    );
    
    if (!article) return undefined;
    
    return this.enrichArticleWithDetails(article);
  }
  
  async getFeaturedArticles(limit = 5): Promise<ArticleWithDetails[]> {
    return Array.from(this.articles.values())
      .filter(article => article.isFeatured)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit)
      .map(article => this.enrichArticleWithDetails(article));
  }
  
  async getBreakingArticles(limit = 5): Promise<ArticleWithDetails[]> {
    return Array.from(this.articles.values())
      .filter(article => article.isBreaking)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit)
      .map(article => this.enrichArticleWithDetails(article));
  }
  
  async getPopularArticles(limit = 5): Promise<ArticleWithDetails[]> {
    return Array.from(this.articles.values())
      .sort((a, b) => {
        // Sort first by like count, then by comment count
        if (a.likeCount !== b.likeCount) {
          return b.likeCount - a.likeCount;
        }
        return b.commentCount - a.commentCount;
      })
      .slice(0, limit)
      .map(article => this.enrichArticleWithDetails(article));
  }
  
  async getArticlesByCategory(categoryId: number, limit = 10): Promise<ArticleWithDetails[]> {
    return Array.from(this.articles.values())
      .filter(article => article.categoryId === categoryId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit)
      .map(article => this.enrichArticleWithDetails(article));
  }
  
  async getCategoryArticles(categorySlug: string, limit = 10): Promise<ArticleWithDetails[]> {
    const category = await this.getCategoryBySlug(categorySlug);
    if (!category) return [];
    
    return this.getArticlesByCategory(category.id, limit);
  }
  
  async getRelatedArticles(articleId: number, categoryId: number, limit = 3): Promise<ArticleWithDetails[]> {
    return Array.from(this.articles.values())
      .filter(article => article.id !== articleId && article.categoryId === categoryId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit)
      .map(article => this.enrichArticleWithDetails(article));
  }
  
  async searchArticles(query: string): Promise<ArticleWithDetails[]> {
    const searchLower = query.toLowerCase();
    
    return Array.from(this.articles.values())
      .filter(article => 
        article.title.toLowerCase().includes(searchLower) ||
        article.content.toLowerCase().includes(searchLower) ||
        article.excerpt.toLowerCase().includes(searchLower)
      )
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .map(article => this.enrichArticleWithDetails(article));
  }
  
  async createArticle(insertArticle: InsertArticle): Promise<Article> {
    const id = this.articleCurrentId++;
    const now = new Date();
    const article: Article = { 
      ...insertArticle, 
      id,
      likeCount: 0,
      commentCount: 0,
      createdAt: now,
      updatedAt: now
    };
    this.articles.set(id, article);
    
    // Increment category post count
    await this.incrementCategoryPostCount(article.categoryId);
    
    return article;
  }
  
  async updateArticle(id: number, article: Partial<Article>): Promise<Article | undefined> {
    const existingArticle = this.articles.get(id);
    if (!existingArticle) return undefined;
    
    // If category is changing, update post counts
    if (article.categoryId && article.categoryId !== existingArticle.categoryId) {
      await this.decrementCategoryPostCount(existingArticle.categoryId);
      await this.incrementCategoryPostCount(article.categoryId);
    }
    
    const updatedArticle = { 
      ...existingArticle, 
      ...article,
      updatedAt: new Date()
    };
    this.articles.set(id, updatedArticle);
    return updatedArticle;
  }
  
  async deleteArticle(id: number): Promise<boolean> {
    const article = this.articles.get(id);
    if (!article) return false;
    
    // Remove article's comments
    Array.from(this.comments.values())
      .filter(comment => comment.articleId === id)
      .forEach(comment => this.comments.delete(comment.id));
    
    // Remove article's likes
    Array.from(this.likes.values())
      .filter(like => like.articleId === id)
      .forEach(like => this.likes.delete(like.id));
    
    // Decrement category post count
    await this.decrementCategoryPostCount(article.categoryId);
    
    return this.articles.delete(id);
  }
  
  // Comment methods
  async getComments(): Promise<Comment[]> {
    return Array.from(this.comments.values());
  }
  
  async getArticleComments(articleId: number): Promise<CommentWithUser[]> {
    return Array.from(this.comments.values())
      .filter(comment => comment.articleId === articleId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .map(comment => this.enrichCommentWithUser(comment));
  }
  
  async createComment(insertComment: InsertComment): Promise<Comment> {
    const id = this.commentCurrentId++;
    const now = new Date();
    const comment: Comment = { 
      ...insertComment, 
      id,
      likeCount: 0,
      createdAt: now
    };
    this.comments.set(id, comment);
    
    // Increment article comment count
    const article = this.articles.get(comment.articleId);
    if (article) {
      article.commentCount += 1;
      this.articles.set(article.id, article);
    }
    
    return comment;
  }
  
  async updateComment(id: number, comment: Partial<Comment>): Promise<Comment | undefined> {
    const existingComment = this.comments.get(id);
    if (!existingComment) return undefined;
    
    const updatedComment = { ...existingComment, ...comment };
    this.comments.set(id, updatedComment);
    return updatedComment;
  }
  
  async deleteComment(id: number): Promise<boolean> {
    const comment = this.comments.get(id);
    if (!comment) return false;
    
    // Decrement article comment count
    const article = this.articles.get(comment.articleId);
    if (article) {
      article.commentCount = Math.max(0, article.commentCount - 1);
      this.articles.set(article.id, article);
    }
    
    // Remove child comments (replies) if any
    Array.from(this.comments.values())
      .filter(c => c.parentId === id)
      .forEach(c => this.deleteComment(c.id));
    
    return this.comments.delete(id);
  }
  
  async likeComment(commentId: number, userId: number): Promise<Comment | undefined> {
    const comment = this.comments.get(commentId);
    if (!comment) return undefined;
    
    // Check if user already liked this comment - simple implementation, no tracking
    comment.likeCount += 1;
    this.comments.set(commentId, comment);
    
    return comment;
  }
  
  // Like methods
  async getArticleLikes(articleId: number): Promise<Like[]> {
    return Array.from(this.likes.values())
      .filter(like => like.articleId === articleId);
  }
  
  async getUserLike(articleId: number, userId: number): Promise<Like | undefined> {
    return Array.from(this.likes.values()).find(
      like => like.articleId === articleId && like.userId === userId
    );
  }
  
  async createLike(insertLike: InsertLike): Promise<Like> {
    // Check if user already liked this article
    const existingLike = await this.getUserLike(insertLike.articleId, insertLike.userId);
    if (existingLike) {
      return existingLike;
    }
    
    const id = this.likeCurrentId++;
    const now = new Date();
    const like: Like = { 
      ...insertLike, 
      id,
      createdAt: now
    };
    this.likes.set(id, like);
    
    // Increment article like count
    const article = this.articles.get(like.articleId);
    if (article) {
      article.likeCount += 1;
      this.articles.set(article.id, article);
    }
    
    return like;
  }
  
  async deleteLike(articleId: number, userId: number): Promise<boolean> {
    const like = await this.getUserLike(articleId, userId);
    if (!like) return false;
    
    // Decrement article like count
    const article = this.articles.get(articleId);
    if (article) {
      article.likeCount = Math.max(0, article.likeCount - 1);
      this.articles.set(article.id, article);
    }
    
    return this.likes.delete(like.id);
  }
  
  // Newsletter methods
  async getNewsletterSubscribers(): Promise<Newsletter[]> {
    return Array.from(this.newsletters.values());
  }
  
  async getNewsletterSubscriber(email: string): Promise<Newsletter | undefined> {
    return Array.from(this.newsletters.values()).find(
      newsletter => newsletter.email.toLowerCase() === email.toLowerCase()
    );
  }
  
  async createNewsletterSubscriber(insertNewsletter: InsertNewsletter): Promise<Newsletter> {
    // Check if email already exists
    const existingSubscriber = await this.getNewsletterSubscriber(insertNewsletter.email);
    if (existingSubscriber) {
      return existingSubscriber;
    }
    
    const id = this.newsletterCurrentId++;
    const now = new Date();
    const newsletter: Newsletter = { 
      ...insertNewsletter, 
      id,
      createdAt: now
    };
    this.newsletters.set(id, newsletter);
    return newsletter;
  }
  
  async deleteNewsletterSubscriber(id: number): Promise<boolean> {
    return this.newsletters.delete(id);
  }
  
  // Helper methods
  private enrichArticleWithDetails(article: Article): ArticleWithDetails {
    const category = this.categories.get(article.categoryId) as Category;
    const author = this.users.get(article.authorId) as User;
    
    return {
      ...article,
      category,
      author
    };
  }
  
  private enrichCommentWithUser(comment: Comment): CommentWithUser {
    const user = this.users.get(comment.userId) as User;
    
    // If this is a top-level comment, include replies
    const replies = comment.parentId ? [] : Array.from(this.comments.values())
      .filter(c => c.parentId === comment.id)
      .map(c => this.enrichCommentWithUser(c));
    
    return {
      ...comment,
      user,
      replies
    };
  }
  
  // Seed data for demo purposes
  private async seedData() {
    // Create users
    const admin = await this.createUser({
      username: "admin",
      password: "password123", // In a real app, this would be hashed
      email: "admin@example.com",
      isAdmin: true
    });
    
    const reporter1 = await this.createUser({
      username: "jamesdoe",
      password: "password123",
      email: "james@example.com",
      isAdmin: false
    });

    const reporter2 = await this.createUser({
      username: "sarahsmith",
      password: "password123",
      email: "sarah@example.com",
      isAdmin: false
    });
    
    // Create categories
    const categoryData = [
      { name: "Politics", slug: "politics", description: "Political news and updates" },
      { name: "Business", slug: "business", description: "Business and economic news" },
      { name: "Technology", slug: "technology", description: "Technology news and innovations" },
      { name: "Sports", slug: "sports", description: "Sports news and results" },
      { name: "Entertainment", slug: "entertainment", description: "Entertainment and celebrity news" },
      { name: "Health", slug: "health", description: "Health and wellness news" },
      { name: "Science", slug: "science", description: "Scientific discoveries and research" },
      { name: "World", slug: "world", description: "International news" },
      { name: "Opinion", slug: "opinion", description: "Opinion pieces and editorials" }
    ];
    
    const categories = [];
    for (const category of categoryData) {
      const newCategory = await this.createCategory(category);
      categories.push(newCategory);
    }
    
    // Create articles
    const articlesData = [
      {
        title: "Global Markets Rally as Central Banks Cut Interest Rates",
        slug: "global-markets-rally",
        excerpt: "Stock markets around the world surged today as major central banks announced coordinated interest rate cuts to boost economic growth.",
        content: `<p>Stock markets around the world surged today as major central banks announced coordinated interest rate cuts to boost economic growth amid concerns of a global economic slowdown.</p>
                <p>The Dow Jones Industrial Average rose 450 points, or 1.3%, while the S&P 500 gained 1.5% and the Nasdaq Composite jumped 1.7%. European markets also rallied, with the Stoxx Europe 600 climbing 1.8%.</p>
                <p>The Federal Reserve, European Central Bank, Bank of England, Bank of Japan, and Bank of Canada announced a joint decision to cut their benchmark interest rates by 0.25 percentage points, citing "growing downside risks to the global economic outlook."</p>
                <p>"This coordinated action demonstrates our shared commitment to maintaining price stability while supporting sustainable economic growth," the central banks said in a joint statement.</p>
                <p>Economists welcomed the move but cautioned that monetary policy alone might not be sufficient to address deeper structural economic challenges.</p>
                <p>"While this is certainly a positive development for markets in the short term, investors should remain cautious about the underlying economic fundamentals," said Jane Smith, chief economist at Global Investment Partners.</p>`,
        coverImage: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80",
        categoryId: categories.find(c => c.slug === "business")?.id || 1,
        authorId: reporter1.id,
        isFeatured: true,
        isBreaking: true
      },
      {
        title: "New AI Model Can Predict Climate Change Impacts with 90% Accuracy",
        slug: "ai-climate-change-prediction",
        excerpt: "Scientists have developed a new artificial intelligence model that can predict climate change impacts with unprecedented accuracy.",
        content: `<p>A team of scientists at the Climate Research Institute has developed a groundbreaking artificial intelligence model that can predict the impacts of climate change with up to 90% accuracy, a significant improvement over previous models.</p>
                <p>The new AI system, called ClimateNet, uses deep learning algorithms and massive datasets from satellites, weather stations, and ocean buoys to simulate climate patterns and predict future changes with much higher precision than traditional methods.</p>
                <p>"This represents a quantum leap in our ability to forecast how climate change will affect specific regions," said Dr. Marcus Chen, the lead researcher on the project. "With ClimateNet, we can now predict temperature changes, precipitation patterns, and extreme weather events at a local level up to 30 years into the future."</p>
                <p>The technology could help governments and communities better prepare for the effects of climate change by providing more accurate information about which areas will be most vulnerable to rising sea levels, drought, flooding, or extreme temperatures.</p>
                <p>The researchers plan to make their technology available to governments worldwide through a cloud-based platform that will allow policymakers to run simulations based on different emissions scenarios.</p>`,
        coverImage: "https://images.unsplash.com/photo-1593288942460-e517b1956c15?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80",
        categoryId: categories.find(c => c.slug === "technology")?.id || 3,
        authorId: reporter2.id,
        isFeatured: true,
        isBreaking: false
      },
      {
        title: "Olympic Committee Announces Major Changes for 2028 Games",
        slug: "olympic-changes-2028",
        excerpt: "The International Olympic Committee has announced several new sports and rule changes for the 2028 Summer Olympics in Los Angeles.",
        content: `<p>The International Olympic Committee (IOC) has unveiled a series of major changes for the 2028 Summer Olympics in Los Angeles, including the addition of three new sports and significant modifications to existing events.</p>
                <p>Cricket, flag football, and squash will join the Olympic program for the first time, while baseball and softball will return after being excluded from the 2024 Paris Games. The IOC also announced that breakdancing, which will debut in Paris, will not continue in Los Angeles.</p>
                <p>"These changes reflect our ongoing commitment to evolve the Olympic program to appeal to younger audiences while respecting the traditions of the Games," said IOC President Thomas Bach at a press conference in Lausanne, Switzerland.</p>
                <p>The committee also approved a new qualification system designed to increase regional diversity among competitors and reduce the overall number of athletes, addressing concerns about the growing size and cost of hosting the Games.</p>
                <p>The Los Angeles organizing committee welcomed the changes, saying they align with their vision of creating "an Olympics for a new era" that embraces both tradition and innovation.</p>`,
        coverImage: "https://images.unsplash.com/photo-1569517282132-25d22f4573e6?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80",
        categoryId: categories.find(c => c.slug === "sports")?.id || 4,
        authorId: reporter1.id,
        isFeatured: false,
        isBreaking: false
      },
      {
        title: "Revolutionary Cancer Treatment Shows 90% Success Rate in Clinical Trials",
        slug: "cancer-treatment-breakthrough",
        excerpt: "A groundbreaking new cancer treatment has shown a 90% complete remission rate in patients with advanced forms of leukemia.",
        content: `<p>A revolutionary new cancer therapy developed by researchers at the National Medical Institute has shown unprecedented success in clinical trials, with a 90% complete remission rate in patients with advanced forms of leukemia who had previously exhausted all other treatment options.</p>
                <p>The treatment, which combines targeted immunotherapy with a novel delivery mechanism that can reach cancer cells throughout the body, has been hailed as a potential paradigm shift in cancer treatment. Unlike traditional chemotherapy, the new approach specifically targets cancer cells while leaving healthy tissue largely unaffected, significantly reducing side effects.</p>
                <p>"These results are truly remarkable," said Dr. Sarah Johnson, the lead oncologist overseeing the clinical trials. "Many of these patients had been told they had only months to live, and now, a year later, they show no detectable signs of cancer."</p>
                <p>The therapy works by reprogramming the patient's own immune cells to recognize and attack cancer cells that express specific proteins. The modified immune cells then persist in the body, providing ongoing surveillance against cancer recurrence.</p>
                <p>While the researchers caution that larger trials are needed before the treatment can be widely available, they have already begun testing the approach on other types of cancer, including lymphoma and certain solid tumors, with promising early results.</p>`,
        coverImage: "https://images.unsplash.com/photo-1576671414121-aa2d0967d1b8?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80",
        categoryId: categories.find(c => c.slug === "health")?.id || 6,
        authorId: reporter2.id,
        isFeatured: true,
        isBreaking: true
      },
      {
        title: "Tech Giant Unveils Revolutionary Augmented Reality Glasses",
        slug: "augmented-reality-glasses",
        excerpt: "A leading tech company has introduced a groundbreaking pair of augmented reality glasses that could redefine how we interact with digital content.",
        content: `<p>Silicon Valley's leading tech innovator today unveiled its highly anticipated augmented reality glasses, featuring technology that seamlessly blends digital content with the physical world in ways that were previously only possible in science fiction.</p>
                <p>The sleek, lightweight glasses, called "VisionPro," project high-resolution holograms into the user's field of view while allowing them to remain fully aware of their surroundings. Unlike previous AR headsets, which were bulky and had limited fields of view, the new glasses look almost identical to regular prescription eyewear.</p>
                <p>"This represents the future of computing," said the company's CEO during the product launch event. "We're moving beyond the era of staring at rectangular screens to a world where digital information is intuitively integrated into our physical environment."</p>
                <p>The glasses can display notifications, navigation directions, and interactive 3D objects that appear to exist in the real world. They also feature advanced hand-tracking technology that allows users to manipulate virtual objects with natural gestures.</p>
                <p>Industry analysts predict the technology could have far-reaching implications for fields ranging from education and healthcare to architecture and entertainment.</p>
                <p>"These aren't just a new gadget—they're potentially the beginning of a fundamental shift in how we interact with computers and digital information," said tech analyst Maria Rodriguez.</p>`,
        coverImage: "https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80",
        categoryId: categories.find(c => c.slug === "technology")?.id || 3,
        authorId: reporter1.id,
        isFeatured: true,
        isBreaking: false
      },
      {
        title: "Diplomatic Breakthrough: Historic Peace Agreement Signed in Middle East",
        slug: "middle-east-peace-agreement",
        excerpt: "After decades of conflict, rival nations in the Middle East have signed a comprehensive peace agreement, opening a new chapter in regional relations.",
        content: `<p>In a historic diplomatic breakthrough, two long-standing adversaries in the Middle East signed a comprehensive peace agreement today, ending decades of conflict and establishing formal diplomatic relations for the first time.</p>
                <p>The signing ceremony, held in Geneva under the auspices of the United Nations, was attended by world leaders and diplomats who hailed the agreement as a "new dawn" for a region that has long been plagued by instability and violence.</p>
                <p>The landmark accord includes provisions for mutual recognition, security cooperation, trade normalization, and joint development of natural resources. It also establishes a framework for resolving outstanding territorial disputes through international arbitration.</p>
                <p>"This agreement proves that even the most entrenched conflicts can be resolved through dialogue and compromise," said the UN Secretary-General, who played a key role in facilitating the negotiations over the past two years.</p>
                <p>The breakthrough came after months of secret talks mediated by a coalition of neutral countries, following significant changes in regional dynamics and leadership in both nations.</p>
                <p>Financial markets in the region responded positively to the news, with stock exchanges in both countries posting significant gains as investors anticipated new economic opportunities arising from the peace dividend.</p>`,
        coverImage: "https://images.unsplash.com/photo-1532375810709-75b1da00537c?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80",
        categoryId: categories.find(c => c.slug === "world")?.id || 8,
        authorId: reporter2.id,
        isFeatured: false,
        isBreaking: true
      },
      {
        title: "Major League Soccer Announces Expansion to Three New Cities",
        slug: "mls-expansion-announcement",
        excerpt: "Major League Soccer has announced plans to add three new franchises as part of its continued expansion strategy.",
        content: `<p>Major League Soccer (MLS) announced today that it will expand to three new cities over the next four years, bringing the total number of teams in the league to 32 as part of its ambitious growth strategy.</p>
                <p>The expansion will see new franchises established in San Diego, Detroit, and Phoenix, markets that have shown strong support for the sport through attendance at lower-division matches and international friendlies.</p>
                <p>"These three cities represent perfect markets for MLS expansion," said the league commissioner at a press conference in New York. "Each has a passionate soccer fanbase, strong ownership groups, and compelling stadium plans that will allow these clubs to thrive."</p>
                <p>The San Diego franchise will begin play in 2025, while Detroit and Phoenix will join the league in 2026, coinciding with the FIFA World Cup being held across North America that year.</p>
                <p>Each expansion team will pay an entry fee of approximately $500 million, a figure that has risen dramatically from the $10 million paid by teams joining the league in its early years, reflecting the significant growth in the value of MLS franchises.</p>
                <p>The announcement comes as soccer continues to gain popularity in the United States, with MLS attendance figures and television ratings showing steady growth over the past decade.</p>`,
        coverImage: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80",
        categoryId: categories.find(c => c.slug === "sports")?.id || 4,
        authorId: reporter1.id,
        isFeatured: false,
        isBreaking: false
      },
      {
        title: "Government Announces Major Infrastructure Investment Plan",
        slug: "infrastructure-investment-plan",
        excerpt: "The federal government has unveiled a comprehensive $1.2 trillion infrastructure plan aimed at modernizing the nation's transportation, energy, and digital networks.",
        content: `<p>The federal government today announced a sweeping $1.2 trillion infrastructure investment plan aimed at modernizing and expanding the nation's transportation networks, energy systems, and digital infrastructure over the next decade.</p>
                <p>The bipartisan legislation, which passed both houses of Congress after months of negotiation, represents the largest investment in infrastructure in more than half a century and will be funded through a combination of existing tax revenues, corporate tax adjustments, and public-private partnerships.</p>
                <p>"This historic investment will create millions of good-paying jobs, position America to compete with China and other global powers, and ensure our infrastructure is resilient to the challenges of climate change," said the President during a signing ceremony at the White House.</p>
                <p>The plan allocates $450 billion for transportation infrastructure, including roads, bridges, public transit, railways, and airports; $300 billion for water systems and environmental remediation; $250 billion for energy infrastructure, including a modern electrical grid and clean energy initiatives; and $200 billion for digital infrastructure, particularly broadband expansion in rural and underserved communities.</p>
                <p>State governors from both parties praised the legislation, which will distribute significant funding to state and local governments for regionally determined priority projects.</p>
                <p>Economists project that the plan could generate up to 2.5 million jobs over the next five years and add approximately 1.5% to GDP growth annually during the implementation period.</p>`,
        coverImage: "https://images.unsplash.com/photo-1621930598722-599881864217?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80",
        categoryId: categories.find(c => c.slug === "politics")?.id || 1,
        authorId: reporter2.id,
        isFeatured: true,
        isBreaking: false
      },
      {
        title: "Scientists Discover New Species in Unexplored Deep Ocean Trench",
        slug: "new-deep-ocean-species",
        excerpt: "Marine biologists have identified over 30 previously unknown species during an expedition to one of Earth's deepest ocean trenches.",
        content: `<p>A team of marine biologists has discovered more than 30 previously unknown species during a groundbreaking expedition to explore one of Earth's deepest and least studied ocean trenches.</p>
                <p>The three-week scientific mission, which used advanced submersible technology to reach depths of nearly 11,000 meters (36,000 feet), documented an extraordinary array of new life forms adapted to survive in one of the most extreme environments on the planet.</p>
                <p>"What we've found is simply astonishing," said Dr. Eleanor Hughes, the expedition's lead scientist. "These discoveries fundamentally change our understanding of deep-sea ecosystems and how life can adapt to extreme pressure, cold, and darkness."</p>
                <p>Among the newly identified species are several types of fish with transparent skin, crustaceans with unique bioluminescent properties, and microorganisms that have evolved to survive in conditions that would be toxic to most known life forms.</p>
                <p>Perhaps most significant was the discovery of a new type of extremophile bacteria that appears to break down plastics and other pollutants that have reached even these remote depths, raising hopes for new bioremediation applications.</p>
                <p>"These findings underscore how much we still have to learn about our own planet," said oceanographer James Chen, who was not involved in the expedition. "We've mapped more of Mars than our own deep oceans."</p>`,
        coverImage: "https://images.unsplash.com/photo-1551244072-5d12893278ab?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80",
        categoryId: categories.find(c => c.slug === "science")?.id || 7,
        authorId: reporter2.id,
        isFeatured: false,
        isBreaking: false
      },
      {
        title: "The Digital Divide: How Technology Is Reshaping Society",
        slug: "digital-divide-opinion",
        excerpt: "As technology becomes increasingly central to our lives, we must address the growing inequality in digital access and literacy.",
        content: `<p>The relentless advance of technology has transformed nearly every aspect of modern life, from how we work and communicate to how we shop, learn, and entertain ourselves. Yet this digital revolution has not benefited everyone equally, creating what experts increasingly recognize as a dangerous digital divide that threatens to exacerbate existing social inequalities.</p>
                <p>On one side of this divide are those with access to high-speed internet, cutting-edge devices, and the skills to use them effectively. On the other side are billions of people worldwide who lack reliable connectivity, affordable devices, or the digital literacy needed to participate fully in the 21st-century economy.</p>
                <p>This is not merely about access to convenience or entertainment. As essential services—from education and healthcare to banking and government assistance—move online, digital exclusion increasingly means exclusion from fundamental opportunities and resources.</p>
                <p>The COVID-19 pandemic starkly illustrated this reality. When schools shifted to remote learning, students without reliable internet or devices at home fell behind. When telehealth became essential, patients without digital access faced barriers to care. When businesses moved operations online, workers without digital skills found themselves at a severe disadvantage.</p>
                <p>Addressing the digital divide requires a multifaceted approach. Governments must treat internet access as essential infrastructure, like electricity or water, and invest accordingly. Technology companies must prioritize affordability and accessibility in their products and services. Educational institutions must integrate digital literacy throughout their curricula.</p>
                <p>But beyond specific policies or programs, we need a fundamental shift in how we think about technology—not as a luxury or privilege, but as a basic right in an increasingly digital world. Only then can we ensure that technological progress truly lifts all boats rather than leaving many adrift.</p>`,
        coverImage: "https://images.unsplash.com/photo-1576444356170-66073046b1bc?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80",
        categoryId: categories.find(c => c.slug === "opinion")?.id || 9,
        authorId: reporter1.id,
        isFeatured: false,
        isBreaking: false
      }
    ];
    
    for (const article of articlesData) {
      await this.createArticle(article);
    }
    
    // Create newsletter subscribers
    const newsletters = [
      { email: "subscriber1@example.com", name: "John Subscriber" },
      { email: "subscriber2@example.com", name: "Jane Reader" },
      { email: "subscriber3@example.com", name: "Bob Newsreader" },
    ];
    
    for (const newsletter of newsletters) {
      await this.createNewsletterSubscriber(newsletter);
    }
  }
}

export const storage = new MemStorage();
