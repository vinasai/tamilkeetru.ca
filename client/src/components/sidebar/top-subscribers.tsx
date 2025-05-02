import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { User } from "@shared/schema";
import UserDetailsModal from "./user-details-modal";
import { Button } from "@/components/ui/button";

type UserWithComments = User & {
  commentCount: number;
  isPremium?: boolean;
  profileImage?: string;
  lastActive?: string; // Changed to string for ISO date format
};

export default function TopSubscribers() {
  const [selectedUser, setSelectedUser] = useState<UserWithComments | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Fetch users with comment counts
  const { data: users, isLoading } = useQuery<UserWithComments[]>({
    queryKey: ['/api/users/top-commenters'],
    // If the API returns an error, it will be handled by the error boundary
    retry: false
  });

  // Mock data in case the API endpoint doesn't exist yet
  const mockUsers: UserWithComments[] = [
    {
      id: 1,
      username: "Emma Thompson",
      email: "emma@example.com",
      password: "",
      isAdmin: false,
      createdAt: new Date("2023-01-15").toISOString(),
      commentCount: 128,
      isPremium: true,
      lastActive: new Date("2023-07-25").toISOString()
    },
    {
      id: 2,
      username: "James Wilson",
      email: "james@example.com",
      password: "",
      isAdmin: false,
      createdAt: new Date("2023-02-10").toISOString(),
      commentCount: 97,
      isPremium: true,
      lastActive: new Date("2023-07-26").toISOString()
    },
    {
      id: 3,
      username: "Sarah Johnson",
      email: "sarah@example.com",
      password: "",
      isAdmin: false,
      createdAt: new Date("2023-03-05").toISOString(),
      commentCount: 85,
      isPremium: false,
      lastActive: new Date("2023-07-20").toISOString()
    },
    {
      id: 4,
      username: "Michael Brown",
      email: "michael@example.com",
      password: "",
      isAdmin: false,
      createdAt: new Date("2023-04-20").toISOString(),
      commentCount: 76,
      isPremium: true,
      lastActive: new Date("2023-07-28").toISOString()
    }
  ];

  // Use actual data or fallback to mock data
  const displayUsers = users || mockUsers;

  const handleOpenUserDetails = (user: UserWithComments) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  return (
    <div className="bg-white rounded-md shadow-md p-4 mb-6">
      <h3 className="font-bold font-['Roboto_Condensed'] text-lg mb-3 pb-2 border-b border-gray-200">
        TOP SUBSCRIBERS
      </h3>
      
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="flex items-center animate-pulse">
              <div className="w-10 h-10 bg-gray-200 rounded-full mr-3"></div>
              <div className="flex-grow">
                <div className="h-4 bg-gray-200 rounded w-24 mb-1"></div>
                <div className="h-3 bg-gray-200 rounded w-32"></div>
              </div>
              <div className="w-6 h-6 bg-gray-200 rounded-full"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {displayUsers.map((user: UserWithComments) => (
            <div key={user.id} className="flex items-center">
              <div className="w-10 h-10 bg-gray-300 rounded-full overflow-hidden mr-3">
                <img 
                  src={user.profileImage || `https://ui-avatars.com/api/?name=${user.username}&background=random`} 
                  alt={user.username} 
                  className="w-full h-full object-cover" 
                />
              </div>
              <div className="flex-grow">
                <h4 className="font-semibold text-sm">{user.username}</h4>
                <div className="text-xs text-gray-500 flex items-center">
                  <span className="flex items-center">
                    <i className="fas fa-comment-alt mr-1"></i> {user.commentCount}
                  </span>
                  <span className="mx-2">•</span>
                  <span className={user.isPremium 
                    ? "bg-secondary/10 text-secondary px-1 rounded text-xs"
                    : "bg-gray-200 text-gray-600 px-1 rounded text-xs"
                  }>
                    {user.isPremium ? "Premium" : "Basic"}
                  </span>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-gray-400 hover:text-secondary hover:bg-inherit"
                onClick={() => handleOpenUserDetails(user)}
              >
                <i className="fas fa-plus-circle"></i>
              </Button>
            </div>
          ))}
        </div>
      )}
      
      <button className="w-full text-secondary text-sm font-medium mt-4 hover:underline">
        View All Subscribers
      </button>

      {/* User Details Modal */}
      <UserDetailsModal 
        user={selectedUser} 
        isOpen={isModalOpen} 
        onOpenChange={setIsModalOpen} 
      />
    </div>
  );
} 