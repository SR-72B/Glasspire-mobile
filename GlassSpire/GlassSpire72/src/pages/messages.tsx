import { useState, useEffect } from "react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { fine } from "@/lib/fine";
import { ProtectedRoute } from "@/components/auth/route-components";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Send, MessageSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Schema } from "@/lib/db-types";

type User = Schema["users"] & { id: number };
type Message = Schema["messages"] & { id: number };

const MessagesPage = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [messageText, setMessageText] = useState("");
  const { data: session } = fine.auth.useSession();
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!session?.user?.id) return;
      
      try {
        // Fetch current user
        const userData = await fine.table("users")
          .select()
          .eq("id", parseInt(session.user.id));
        
        if (userData && userData.length > 0) {
          setCurrentUser(userData[0] as User);
          
          // Fetch users based on current user type
          const userType = userData[0].accountType;
          const otherUsers = await fine.table("users")
            .select()
            .neq("accountType", userType);
          
          setUsers(otherUsers as User[]);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [session]);

  useEffect(() => {
    const fetchMessages = async () => {
      if (!session?.user?.id || !selectedUser) return;
      
      try {
        // Fetch messages between current user and selected user
        const sentMessages = await fine.table("messages")
          .select()
          .eq("senderId", parseInt(session.user.id))
          .eq("receiverId", selectedUser.id);
        
        const receivedMessages = await fine.table("messages")
          .select()
          .eq("senderId", selectedUser.id)
          .eq("receiverId", parseInt(session.user.id));
        
        // Combine and sort messages by timestamp
        const allMessages = [...sentMessages, ...receivedMessages]
          .sort((a, b) => new Date(a.timestamp!).getTime() - new Date(b.timestamp!).getTime());
        
        setMessages(allMessages as Message[]);
        
        // Mark received messages as read
        for (const message of receivedMessages) {
          if (!message.read) {
            await fine.table("messages")
              .update({ read: true })
              .eq("id", message.id);
          }
        }
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };
    
    fetchMessages();
  }, [session, selectedUser]);

  const handleSendMessage = async () => {
    if (!messageText.trim() || !session?.user?.id || !selectedUser) return;
    
    setSending(true);
    
    try {
      const newMessage = await fine.table("messages").insert({
        senderId: parseInt(session.user.id),
        receiverId: selectedUser.id,
        content: messageText,
        timestamp: new Date().toISOString(),
        read: false,
      }).select();
      
      if (newMessage && newMessage.length > 0) {
        setMessages([...messages, newMessage[0] as Message]);
        setMessageText("");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex flex-1 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 py-8">
        <div className="container mx-auto px-4 md:px-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Messages</h1>
            <p className="mt-2 text-muted-foreground">
              Communicate with {currentUser?.accountType === "customer" ? "retailers" : "customers"}
            </p>
          </div>
          
          <div className="grid gap-6 md:grid-cols-3">
            <div>
              <Card className="h-[600px] overflow-hidden">
                <CardHeader>
                  <CardTitle>Contacts</CardTitle>
                  <CardDescription>
                    Select a {currentUser?.accountType === "customer" ? "retailer" : "customer"} to message
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-[calc(600px-4rem)] overflow-y-auto p-0">
                  <div className="divide-y">
                    {users.length === 0 ? (
                      <div className="flex flex-col items-center justify-center p-6">
                        <MessageSquare className="h-12 w-12 text-muted-foreground" />
                        <p className="mt-2 text-center text-muted-foreground">
                          No contacts available
                        </p>
                      </div>
                    ) : (
                      users.map((user) => (
                        <div
                          key={user.id}
                          className={`cursor-pointer p-4 hover:bg-accent ${
                            selectedUser?.id === user.id ? "bg-accent" : ""
                          }`}
                          onClick={() => setSelectedUser(user)}
                        >
                          <div className="flex items-center space-x-3">
                            <div className="h-10 w-10 rounded-full bg-primary text-primary-foreground">
                              <div className="flex h-full w-full items-center justify-center">
                                {user.name.charAt(0).toUpperCase()}
                              </div>
                            </div>
                            <div>
                              <div className="font-medium">{user.name}</div>
                              <div className="text-sm text-muted-foreground">
                                {user.email}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="md:col-span-2">
              <Card className="h-[600px] overflow-hidden">
                <CardHeader className="border-b">
                  {selectedUser ? (
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 rounded-full bg-primary text-primary-foreground">
                        <div className="flex h-full w-full items-center justify-center">
                          {selectedUser.name.charAt(0).toUpperCase()}
                        </div>
                      </div>
                      <div>
                        <CardTitle>{selectedUser.name}</CardTitle>
                        <CardDescription>{selectedUser.email}</CardDescription>
                      </div>
                    </div>
                  ) : (
                    <CardTitle>Messages</CardTitle>
                  )}
                </CardHeader>
                
                <CardContent className="h-[calc(600px-8rem)] overflow-y-auto p-4">
                  {!selectedUser ? (
                    <div className="flex h-full flex-col items-center justify-center">
                      <MessageSquare className="h-12 w-12 text-muted-foreground" />
                      <p className="mt-2 text-center text-muted-foreground">
                        Select a contact to start messaging
                      </p>
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="flex h-full flex-col items-center justify-center">
                      <MessageSquare className="h-12 w-12 text-muted-foreground" />
                      <p className="mt-2 text-center text-muted-foreground">
                        No messages yet. Start the conversation!
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {messages.map((message) => {
                        const isSentByMe = session?.user?.id && parseInt(session.user.id) === message.senderId;
                        
                        return (
                          <div
                            key={message.id}
                            className={`flex ${isSentByMe ? "justify-end" : "justify-start"}`}
                          >
                            <div
                              className={`max-w-[70%] rounded-lg p-3 ${
                                isSentByMe
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-muted"
                              }`}
                            >
                              <p>{message.content}</p>
                              <p className={`mt-1 text-right text-xs ${
                                isSentByMe ? "text-primary-foreground/70" : "text-muted-foreground"
                              }`}>
                                {new Date(message.timestamp!).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
                
                <CardFooter className="border-t p-4">
                  {selectedUser && (
                    <div className="flex w-full items-center space-x-2">
                      <Textarea
                        placeholder="Type your message..."
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        className="min-h-[60px] flex-1 resize-none"
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage();
                          }
                        }}
                      />
                      <Button
                        size="icon"
                        onClick={handleSendMessage}
                        disabled={!messageText.trim() || sending}
                      >
                        {sending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Send className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  )}
                </CardFooter>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

const ProtectedMessagesPage = () => (
  <ProtectedRoute Component={MessagesPage} />
);

export default ProtectedMessagesPage;