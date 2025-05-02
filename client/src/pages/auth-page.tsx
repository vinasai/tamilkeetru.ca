import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useSearch } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const registerSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Password must be at least 6 characters"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const { user, loginMutation, registerMutation } = useAuth();
  const [, navigate] = useLocation();
  const search = useSearch();
  const params = new URLSearchParams(search);
  const defaultTab = params.get('tab') === 'register' ? 'register' : 'login';
  const [activeTab, setActiveTab] = useState(defaultTab);

  // If user is already logged in, redirect to home
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  // Login form
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  // Register form
  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onLoginSubmit = async (values: LoginFormValues) => {
    await loginMutation.mutateAsync(values);
  };

  const onRegisterSubmit = async (values: RegisterFormValues) => {
    const { confirmPassword, ...registerData } = values;
    await registerMutation.mutateAsync(registerData);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8 max-w-5xl mx-auto">
        <div className="w-full md:w-1/2">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-bold">Welcome to Tamil Keetru</CardTitle>
              <CardDescription>
                Sign in or create an account to personalize your news experience
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="login">Login</TabsTrigger>
                  <TabsTrigger value="register">Register</TabsTrigger>
                </TabsList>

                {/* Login Tab */}
                <TabsContent value="login">
                  <Form {...loginForm}>
                    <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                      <FormField
                        control={loginForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter your username" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={loginForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="Enter your password" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button 
                        type="submit" 
                        className="w-full bg-secondary text-white"
                        disabled={loginMutation.isPending}
                      >
                        {loginMutation.isPending ? (
                          <><i className="fas fa-spinner fa-spin mr-2"></i>Signing in...</>
                        ) : (
                          'Sign In'
                        )}
                      </Button>
                    </form>
                  </Form>
                </TabsContent>

                {/* Register Tab */}
                <TabsContent value="register">
                  <Form {...registerForm}>
                    <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                      <FormField
                        control={registerForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                              <Input placeholder="Choose a username" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="Enter your email" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="Create a password" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Confirm Password</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="Confirm your password" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button 
                        type="submit" 
                        className="w-full bg-secondary text-white"
                        disabled={registerMutation.isPending}
                      >
                        {registerMutation.isPending ? (
                          <><i className="fas fa-spinner fa-spin mr-2"></i>Creating account...</>
                        ) : (
                          'Create Account'
                        )}
                      </Button>
                    </form>
                  </Form>
                </TabsContent>
              </Tabs>

              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-gray-300"></span>
                  </div>
                  {/* <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">Or continue with</span>
                  </div> */}
                </div>

                {/* <div className="flex gap-3 mt-6">
                  <Button variant="outline" className="w-full">
                    <i className="fab fa-facebook-f mr-2"></i> Facebook
                  </Button>
                  <Button variant="outline" className="w-full">
                    <i className="fab fa-google mr-2"></i> Google
                  </Button>
                </div> */}
              </div>
            </CardContent>
            <CardFooter className="flex justify-center">
              <p className="text-sm text-gray-500">
                By continuing, you agree to our <Link href="#" className="text-secondary hover:underline">Terms of Service</Link> and <Link href="#" className="text-secondary hover:underline">Privacy Policy</Link>.
              </p>
            </CardFooter>
          </Card>
        </div>

        <div className="w-full md:w-1/2 bg-secondary text-white rounded-lg overflow-hidden hidden md:block">
          <div className="p-8 h-full flex flex-col justify-center">
            <h2 className="text-3xl font-bold mb-4">Stay Informed with Tamil Keetru</h2>
            <p className="mb-6">Join our community and get access to:</p>
            <ul className="space-y-4 mb-8">
              <li className="flex items-center">
                <i className="fas fa-check-circle mr-2 text-accent"></i>
                Personalized news feed based on your interests
              </li>
              <li className="flex items-center">
                <i className="fas fa-check-circle mr-2 text-accent"></i>
                Save articles to read later
              </li>
              <li className="flex items-center">
                <i className="fas fa-check-circle mr-2 text-accent"></i>
                Comment and engage with other readers
              </li>
              <li className="flex items-center">
                <i className="fas fa-check-circle mr-2 text-accent"></i>
                Breaking news notifications
              </li>
              <li className="flex items-center">
                <i className="fas fa-check-circle mr-2 text-accent"></i>
                Exclusive content for members
              </li>
            </ul>
            <div className="text-sm opacity-80">
              "Tamil Keetru delivers timely, accurate reporting on the stories that matter most."
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
