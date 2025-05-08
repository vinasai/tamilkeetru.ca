import { 
  User, InsertUser, 
  Category, InsertCategory,
  Article, InsertArticle, ArticleWithDetails,
  Comment, InsertComment, CommentWithUser,
  Like, InsertLike,
  Newsletter, InsertNewsletter,
  Advertisement, InsertAdvertisement
} from "@shared/schema";
import session from "express-session";

export interface IStorage {
  // Database status
  checkConnection(): Promise<{connected: boolean, error: string | null}>;
  
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUsers(): Promise<User[]>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<User>): Promise<User | undefined>;
  getUsersWithCommentCounts(limit?: number): Promise<(User & { commentCount: number; isPremium?: boolean })[]>;
  
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
  getArticleComments(articleId: number, userId?: number): Promise<CommentWithUser[]>;
  createComment(comment: InsertComment): Promise<Comment>;
  updateComment(id: number, comment: Partial<Comment>): Promise<Comment | undefined>;
  deleteComment(id: number): Promise<boolean>;
  likeComment(commentId: number, userId: number): Promise<Comment | undefined>;
  toggleCommentLike(commentId: number, userId: number): Promise<{ liked: boolean; newLikeCount: number; isLikedByCurrentUser: boolean } | null>;
  
  // Like methods
  getArticleLikes(articleId: number): Promise<Like[]>;
  getUserLike(articleId: number, userId: number): Promise<Like | undefined>;
  createLike(like: InsertLike): Promise<Like>;
  deleteLike(articleId: number, userId: number): Promise<boolean>;
  
  // User dashboard methods
  getUserLikes(userId: number): Promise<Like[]>;
  getUserComments(userId: number): Promise<Comment[]>;
  
  // Newsletter methods
  getNewsletterSubscribers(): Promise<Newsletter[]>;
  getNewsletterSubscriber(email: string): Promise<Newsletter | undefined>;
  createNewsletterSubscriber(newsletter: InsertNewsletter): Promise<Newsletter>;
  deleteNewsletterSubscriber(id: number): Promise<boolean>;
  
  // Advertisement methods
  getAdvertisements(): Promise<Advertisement[]>;
  getAdvertisementsByPosition(position: string): Promise<Advertisement[]>;
  getAdvertisement(id: number): Promise<Advertisement | undefined>;
  createAdvertisement(advertisement: InsertAdvertisement): Promise<Advertisement>;
  updateAdvertisement(id: number, advertisement: Partial<Advertisement>): Promise<Advertisement | undefined>;
  deleteAdvertisement(id: number): Promise<boolean>;
  trackAdvertisementImpression(id: number): Promise<boolean>;
  trackAdvertisementClick(id: number): Promise<boolean>;
  
  // Session store
  sessionStore: session.Store;
} 