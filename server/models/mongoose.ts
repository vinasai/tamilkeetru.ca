import mongoose, { Schema, Document } from 'mongoose';
import { 
  User, InsertUser, 
  Category, InsertCategory,
  Article, InsertArticle, ArticleWithDetails,
  Comment, InsertComment, CommentWithUser,
  Like, InsertLike,
  Newsletter, InsertNewsletter
} from '@shared/schema';

// Add global error handlers to prevent server crashes
mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
  console.log('Application will continue without MongoDB. Some features may not work correctly.');
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected. Application will continue in fallback mode.');
});

// Set up unhandled promise rejection handlers for mongoose
process.on('unhandledRejection', (reason, promise) => {
  console.log('Unhandled Rejection at:', promise, 'reason:', reason);
  // Don't crash the application
});

// Connect to MongoDB
const connectDB = async () => {
  try {
    mongoose.set('strictQuery', false);
    // Use proper mongoose connection options with more resilient settings
    const options = {
      connectTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      serverSelectionTimeoutMS: 30000,
      heartbeatFrequencyMS: 10000,
      family: 4, // Use IPv4, sometimes helps with connection issues
      maxPoolSize: 10,
      minPoolSize: 0,
      maxIdleTimeMS: 30000,
      autoCreate: true,
      retryWrites: true,
      retryReads: true,
    };
    
    console.log('Connecting to MongoDB...');
    try {
      // First try the remote MongoDB
      await mongoose.connect('mongodb://keetruUser:522025tamilkeetru@192.227.129.163:27017/tamil-keetru', options);
      console.log('Remote MongoDB connected successfully');
      return true;
    } catch (remoteError) {
      console.error('Remote MongoDB connection error:', remoteError);
      console.log('Attempting to connect to local MongoDB...');
      
      try {
        // If remote fails, try local MongoDB without credentials
        await mongoose.connect('mongodb://127.0.0.1:27017/dailypulse', options);
        console.log('Local MongoDB connected successfully');
        return true;
      } catch (localError) {
        console.error('Local MongoDB connection error:', localError);
        // Don't throw error, just return false
        return false;
      }
    }
  } catch (error) {
    console.error('MongoDB connection error:', error);
    console.log('Application will continue without MongoDB. Some features may not work correctly.');
    return false;
  }
};

// Check if MongoDB connection is active
export const isMongoConnected = () => {
  return mongoose.connection.readyState === 1; // 1 means connected
};

// Safe execute function for MongoDB operations
export const safeMongoExecute = async <T>(operation: () => Promise<T>, fallback: T): Promise<T> => {
  if (!isMongoConnected()) {
    return fallback;
  }
  
  try {
    return await operation();
  } catch (error) {
    console.error('MongoDB operation failed:', error);
    return fallback;
  }
};

// User Schema
export interface UserDocument extends Omit<User, 'id'>, Document {
  id: number;
}

const UserSchema = new Schema<UserDocument>({
  id: { type: Number, required: true, unique: true },
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isAdmin: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

// Category Schema
export interface CategoryDocument extends Omit<Category, 'id'>, Document {
  id: number;
}

const CategorySchema = new Schema<CategoryDocument>({
  id: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String, default: null },
  postCount: { type: Number, default: 0 }
});

// Article Schema
export interface ArticleDocument extends Omit<Article, 'id'>, Document {
  id: number;
}

const ArticleSchema = new Schema<ArticleDocument>({
  id: { type: Number, required: true, unique: true },
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  excerpt: { type: String, required: true },
  content: { type: String, required: true },
  coverImage: { type: String, required: true },
  categoryId: { type: Number, required: true },
  authorId: { type: Number, required: true },
  likeCount: { type: Number, default: 0 },
  commentCount: { type: Number, default: 0 },
  isFeatured: { type: Boolean, default: false },
  isBreaking: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Comment Schema
export interface CommentDocument extends Omit<Comment, 'id'>, Document {
  id: number;
}

const CommentSchema = new Schema<CommentDocument>({
  id: { type: Number, required: true, unique: true },
  articleId: { type: Number, required: true },
  userId: { type: Number, required: true },
  parentId: { type: Number, default: null },
  content: { type: String, required: true },
  likeCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

// Like Schema
export interface LikeDocument extends Omit<Like, 'id'>, Document {
  id: number;
}

const LikeSchema = new Schema<LikeDocument>({
  id: { type: Number, required: true, unique: true },
  articleId: { type: Number, required: true },
  userId: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now }
});

// Newsletter Schema
export interface NewsletterDocument extends Omit<Newsletter, 'id'>, Document {
  id: number;
  name: string; // Add name to the interface
}

const NewsletterSchema = new Schema<NewsletterDocument>({
  id: { type: Number, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

// Create models
export const UserModel = mongoose.model<UserDocument>('User', UserSchema);
export const CategoryModel = mongoose.model<CategoryDocument>('Category', CategorySchema);
export const ArticleModel = mongoose.model<ArticleDocument>('Article', ArticleSchema);
export const CommentModel = mongoose.model<CommentDocument>('Comment', CommentSchema);
export const LikeModel = mongoose.model<LikeDocument>('Like', LikeSchema);
export const NewsletterModel = mongoose.model<NewsletterDocument>('Newsletter', NewsletterSchema);

export { connectDB }; 