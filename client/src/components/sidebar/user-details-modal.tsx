import { User } from "@shared/schema";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatDistanceToNow } from "date-fns";

interface UserDetailsModalProps {
  user: User & { 
    commentCount: number; 
    isPremium?: boolean;
    profileImage?: string;
    lastActive?: string;
  } | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function UserDetailsModal({ 
  user, 
  isOpen, 
  onOpenChange 
}: UserDetailsModalProps) {
  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">User Profile</DialogTitle>
        </DialogHeader>
        
        <div className="flex items-center space-x-4 mb-4">
          <div className="h-16 w-16 rounded-full overflow-hidden">
            <img 
              src={user.profileImage || `https://ui-avatars.com/api/?name=${user.username}&background=random`} 
              alt={user.username} 
              className="h-full w-full object-cover"
            />
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-1">{user.username}</h3>
            <div className="flex items-center space-x-2">
              {user.isPremium ? (
                <Badge variant="secondary" className="bg-secondary/10 text-secondary text-xs">Premium</Badge>
              ) : (
                <Badge variant="outline" className="bg-gray-200 text-gray-600 text-xs">Basic</Badge>
              )}
              <span className="text-xs text-gray-500">
                Member since {formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })}
              </span>
            </div>
          </div>
        </div>

        <Separator className="my-4" />
        
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium text-gray-500 mb-2">Activity</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-100 p-3 rounded-md">
                <div className="text-2xl font-bold">{user.commentCount}</div>
                <div className="text-xs text-gray-500">Comments</div>
              </div>
              <div className="bg-gray-100 p-3 rounded-md">
                <div className="text-2xl font-bold">
                  {user.lastActive ? 
                    formatDistanceToNow(new Date(user.lastActive), { addSuffix: true }) :
                    "N/A"
                  }
                </div>
                <div className="text-xs text-gray-500">Last Active</div>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="text-sm font-medium text-gray-500 mb-2">About</h4>
            <p className="text-sm text-gray-700">
              {`${user.username} is an active member of our community.`}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 