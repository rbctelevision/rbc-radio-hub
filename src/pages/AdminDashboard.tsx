import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Loader2, LogOut, Shield, Ban, RefreshCw, AlertCircle, CheckCircle, Megaphone, Plus, Trash2, Edit } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

interface RequestLog {
  id: string;
  created_at: string;
  request_type: string;
  requester_name: string;
  content_summary: string | null;
  ip_address: string;
  user_agent: string | null;
}

interface BannedIP {
  id: string;
  ip_address: string;
  reason: string | null;
  created_at: string;
}

interface Announcement {
  id: string;
  title: string;
  message: string;
  type: "info" | "warning" | "success" | "error";
  is_active: boolean;
  starts_at: string | null;
  ends_at: string | null;
  created_at: string;
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, isAdmin, isLoading: authLoading, signOut } = useAuth();
  const { toast } = useToast();
  
  const [requestLogs, setRequestLogs] = useState<RequestLog[]>([]);
  const [bannedIPs, setBannedIPs] = useState<BannedIP[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(true);
  const [isLoadingBanned, setIsLoadingBanned] = useState(true);
  const [isLoadingAnnouncements, setIsLoadingAnnouncements] = useState(true);
  const [banDialogOpen, setBanDialogOpen] = useState(false);
  const [announcementDialogOpen, setAnnouncementDialogOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [selectedIP, setSelectedIP] = useState("");
  const [banReason, setBanReason] = useState("");
  const [isBanning, setIsBanning] = useState(false);
  const [isSavingAnnouncement, setIsSavingAnnouncement] = useState(false);
  
  // Announcement form state
  const [announcementTitle, setAnnouncementTitle] = useState("");
  const [announcementMessage, setAnnouncementMessage] = useState("");
  const [announcementType, setAnnouncementType] = useState<"info" | "warning" | "success" | "error">("info");
  const [announcementActive, setAnnouncementActive] = useState(true);

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      navigate("/admin", { replace: true });
    }
  }, [user, isAdmin, authLoading, navigate]);

  const fetchRequestLogs = async () => {
    setIsLoadingLogs(true);
    try {
      const { data, error } = await supabase
        .from("request_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) throw error;
      setRequestLogs(data || []);
    } catch (err) {
      console.error("Error fetching request logs:", err);
      toast({
        title: "Error",
        description: "Failed to fetch request logs",
        variant: "destructive",
      });
    } finally {
      setIsLoadingLogs(false);
    }
  };

  const fetchBannedIPs = async () => {
    setIsLoadingBanned(true);
    try {
      const { data, error } = await supabase
        .from("banned_ips")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setBannedIPs(data || []);
    } catch (err) {
      console.error("Error fetching banned IPs:", err);
      toast({
        title: "Error",
        description: "Failed to fetch banned IPs",
        variant: "destructive",
      });
    } finally {
      setIsLoadingBanned(false);
    }
  };

  const fetchAnnouncements = async () => {
    setIsLoadingAnnouncements(true);
    try {
      const { data, error } = await supabase
        .from("announcements")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setAnnouncements((data || []) as Announcement[]);
    } catch (err) {
      console.error("Error fetching announcements:", err);
      toast({
        title: "Error",
        description: "Failed to fetch announcements",
        variant: "destructive",
      });
    } finally {
      setIsLoadingAnnouncements(false);
    }
  };

  useEffect(() => {
    if (user && isAdmin) {
      fetchRequestLogs();
      fetchBannedIPs();
      fetchAnnouncements();
    }
  }, [user, isAdmin]);

  const handleBanIP = async () => {
    if (!selectedIP.trim()) return;
    
    setIsBanning(true);
    try {
      const { error } = await supabase
        .from("banned_ips")
        .insert({
          ip_address: selectedIP.trim(),
          reason: banReason.trim() || null,
          banned_by: user?.id,
        });

      if (error) {
        if (error.code === "23505") {
          toast({
            title: "Already Banned",
            description: "This IP address is already banned",
            variant: "destructive",
          });
        } else {
          throw error;
        }
      } else {
        toast({
          title: "IP Banned",
          description: `Successfully banned ${selectedIP}`,
        });
        setBanDialogOpen(false);
        setSelectedIP("");
        setBanReason("");
        fetchBannedIPs();
      }
    } catch (err) {
      console.error("Error banning IP:", err);
      toast({
        title: "Error",
        description: "Failed to ban IP address",
        variant: "destructive",
      });
    } finally {
      setIsBanning(false);
    }
  };

  const handleUnbanIP = async (id: string, ip: string) => {
    try {
      const { error } = await supabase
        .from("banned_ips")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "IP Unbanned",
        description: `Successfully unbanned ${ip}`,
      });
      fetchBannedIPs();
    } catch (err) {
      console.error("Error unbanning IP:", err);
      toast({
        title: "Error",
        description: "Failed to unban IP address",
        variant: "destructive",
      });
    }
  };

  const handleQuickBan = (ip: string) => {
    setSelectedIP(ip);
    setBanDialogOpen(true);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/admin");
  };

  const isIPBanned = (ip: string) => {
    return bannedIPs.some(banned => banned.ip_address === ip);
  };

  const resetAnnouncementForm = () => {
    setAnnouncementTitle("");
    setAnnouncementMessage("");
    setAnnouncementType("info");
    setAnnouncementActive(true);
    setEditingAnnouncement(null);
  };

  const handleOpenAnnouncementDialog = (announcement?: Announcement) => {
    if (announcement) {
      setEditingAnnouncement(announcement);
      setAnnouncementTitle(announcement.title);
      setAnnouncementMessage(announcement.message);
      setAnnouncementType(announcement.type);
      setAnnouncementActive(announcement.is_active);
    } else {
      resetAnnouncementForm();
    }
    setAnnouncementDialogOpen(true);
  };

  const handleSaveAnnouncement = async () => {
    if (!announcementTitle.trim() || !announcementMessage.trim()) return;

    setIsSavingAnnouncement(true);
    try {
      if (editingAnnouncement) {
        const { error } = await supabase
          .from("announcements")
          .update({
            title: announcementTitle.trim(),
            message: announcementMessage.trim(),
            type: announcementType,
            is_active: announcementActive,
          })
          .eq("id", editingAnnouncement.id);

        if (error) throw error;

        toast({
          title: "Announcement Updated",
          description: "The announcement has been updated successfully",
        });
      } else {
        const { error } = await supabase
          .from("announcements")
          .insert({
            title: announcementTitle.trim(),
            message: announcementMessage.trim(),
            type: announcementType,
            is_active: announcementActive,
            created_by: user?.id,
          });

        if (error) throw error;

        toast({
          title: "Announcement Created",
          description: "The announcement has been created successfully",
        });
      }

      setAnnouncementDialogOpen(false);
      resetAnnouncementForm();
      fetchAnnouncements();
    } catch (err) {
      console.error("Error saving announcement:", err);
      toast({
        title: "Error",
        description: "Failed to save announcement",
        variant: "destructive",
      });
    } finally {
      setIsSavingAnnouncement(false);
    }
  };

  const handleDeleteAnnouncement = async (id: string) => {
    try {
      const { error } = await supabase
        .from("announcements")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Announcement Deleted",
        description: "The announcement has been deleted successfully",
      });
      fetchAnnouncements();
    } catch (err) {
      console.error("Error deleting announcement:", err);
      toast({
        title: "Error",
        description: "Failed to delete announcement",
        variant: "destructive",
      });
    }
  };

  const handleToggleAnnouncementActive = async (id: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from("announcements")
        .update({ is_active: !isActive })
        .eq("id", id);

      if (error) throw error;

      toast({
        title: isActive ? "Announcement Disabled" : "Announcement Enabled",
        description: `The announcement is now ${isActive ? "hidden" : "visible"}`,
      });
      fetchAnnouncements();
    } catch (err) {
      console.error("Error toggling announcement:", err);
      toast({
        title: "Error",
        description: "Failed to update announcement",
        variant: "destructive",
      });
    }
  };

  const getRequestTypeBadge = (type: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      song: "default",
      message: "secondary",
      voice: "destructive",
    };
    return <Badge variant={variants[type] || "default"}>{type}</Badge>;
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || !isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold">Admin Dashboard</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">{user.email}</span>
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="logs" className="space-y-6">
          <TabsList>
            <TabsTrigger value="logs">Request Logs</TabsTrigger>
            <TabsTrigger value="banned">Banned IPs</TabsTrigger>
            <TabsTrigger value="announcements">
              <Megaphone className="h-4 w-4 mr-2" />
              Announcements
            </TabsTrigger>
          </TabsList>

          {/* Request Logs Tab */}
          <TabsContent value="logs" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Recent Requests</CardTitle>
                  <CardDescription>
                    View all song, message, and voice memo requests
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={fetchRequestLogs}
                  disabled={isLoadingLogs}
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${isLoadingLogs ? "animate-spin" : ""}`} />
                  Refresh
                </Button>
              </CardHeader>
              <CardContent>
                {isLoadingLogs ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : requestLogs.length === 0 ? (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>No request logs found</AlertDescription>
                  </Alert>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Time</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>Content</TableHead>
                          <TableHead>IP Address</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {requestLogs.map((log) => (
                          <TableRow key={log.id}>
                            <TableCell className="whitespace-nowrap">
                              {format(new Date(log.created_at), "MMM d, HH:mm")}
                            </TableCell>
                            <TableCell>{getRequestTypeBadge(log.request_type)}</TableCell>
                            <TableCell className="font-medium">{log.requester_name}</TableCell>
                            <TableCell className="max-w-xs truncate">
                              {log.content_summary || "-"}
                            </TableCell>
                            <TableCell className="font-mono text-sm">
                              <div className="flex items-center gap-2">
                                {log.ip_address}
                                {isIPBanned(log.ip_address) && (
                                  <Badge variant="destructive" className="text-xs">
                                    Banned
                                  </Badge>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              {!isIPBanned(log.ip_address) && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleQuickBan(log.ip_address)}
                                >
                                  <Ban className="h-4 w-4 mr-1" />
                                  Ban
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Banned IPs Tab */}
          <TabsContent value="banned" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Banned IP Addresses</CardTitle>
                  <CardDescription>
                    Manage IP addresses blocked from sending requests
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Dialog open={banDialogOpen} onOpenChange={setBanDialogOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm">
                        <Ban className="h-4 w-4 mr-2" />
                        Ban New IP
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Ban IP Address</DialogTitle>
                        <DialogDescription>
                          Enter the IP address to ban from sending requests
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="ip">IP Address</Label>
                          <Input
                            id="ip"
                            placeholder="192.168.1.1"
                            value={selectedIP}
                            onChange={(e) => setSelectedIP(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="reason">Reason (optional)</Label>
                          <Textarea
                            id="reason"
                            placeholder="Reason for banning..."
                            value={banReason}
                            onChange={(e) => setBanReason(e.target.value)}
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button
                          variant="outline"
                          onClick={() => setBanDialogOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleBanIP}
                          disabled={!selectedIP.trim() || isBanning}
                        >
                          {isBanning ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Banning...
                            </>
                          ) : (
                            "Ban IP"
                          )}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={fetchBannedIPs}
                    disabled={isLoadingBanned}
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 ${isLoadingBanned ? "animate-spin" : ""}`} />
                    Refresh
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {isLoadingBanned ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : bannedIPs.length === 0 ? (
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>No banned IP addresses</AlertDescription>
                  </Alert>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>IP Address</TableHead>
                          <TableHead>Reason</TableHead>
                          <TableHead>Banned At</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {bannedIPs.map((ban) => (
                          <TableRow key={ban.id}>
                            <TableCell className="font-mono">{ban.ip_address}</TableCell>
                            <TableCell>{ban.reason || "-"}</TableCell>
                            <TableCell>
                              {format(new Date(ban.created_at), "MMM d, yyyy HH:mm")}
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleUnbanIP(ban.id, ban.ip_address)}
                              >
                                Unban
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Announcements Tab */}
          <TabsContent value="announcements" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Announcements</CardTitle>
                  <CardDescription>
                    Manage announcement banners displayed on the site
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Dialog open={announcementDialogOpen} onOpenChange={(open) => {
                    setAnnouncementDialogOpen(open);
                    if (!open) resetAnnouncementForm();
                  }}>
                    <DialogTrigger asChild>
                      <Button size="sm" onClick={() => handleOpenAnnouncementDialog()}>
                        <Plus className="h-4 w-4 mr-2" />
                        New Announcement
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>
                          {editingAnnouncement ? "Edit Announcement" : "New Announcement"}
                        </DialogTitle>
                        <DialogDescription>
                          {editingAnnouncement 
                            ? "Update the announcement details below" 
                            : "Create a new announcement to display on the site"}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="title">Title</Label>
                          <Input
                            id="title"
                            placeholder="Announcement title"
                            value={announcementTitle}
                            onChange={(e) => setAnnouncementTitle(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="message">Message</Label>
                          <Textarea
                            id="message"
                            placeholder="Announcement message..."
                            value={announcementMessage}
                            onChange={(e) => setAnnouncementMessage(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="type">Type</Label>
                          <Select value={announcementType} onValueChange={(v) => setAnnouncementType(v as typeof announcementType)}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="info">Info (Blue)</SelectItem>
                              <SelectItem value="success">Success (Green)</SelectItem>
                              <SelectItem value="warning">Warning (Yellow)</SelectItem>
                              <SelectItem value="error">Error (Red)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="active">Active</Label>
                          <Switch
                            id="active"
                            checked={announcementActive}
                            onCheckedChange={setAnnouncementActive}
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setAnnouncementDialogOpen(false);
                            resetAnnouncementForm();
                          }}
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleSaveAnnouncement}
                          disabled={!announcementTitle.trim() || !announcementMessage.trim() || isSavingAnnouncement}
                        >
                          {isSavingAnnouncement ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Saving...
                            </>
                          ) : editingAnnouncement ? (
                            "Update"
                          ) : (
                            "Create"
                          )}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={fetchAnnouncements}
                    disabled={isLoadingAnnouncements}
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 ${isLoadingAnnouncements ? "animate-spin" : ""}`} />
                    Refresh
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {isLoadingAnnouncements ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : announcements.length === 0 ? (
                  <Alert>
                    <Megaphone className="h-4 w-4" />
                    <AlertDescription>No announcements yet. Create one to get started.</AlertDescription>
                  </Alert>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Title</TableHead>
                          <TableHead>Message</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Created</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {announcements.map((announcement) => (
                          <TableRow key={announcement.id}>
                            <TableCell className="font-medium">{announcement.title}</TableCell>
                            <TableCell className="max-w-xs truncate">{announcement.message}</TableCell>
                            <TableCell>
                              <Badge variant={
                                announcement.type === "error" ? "destructive" :
                                announcement.type === "warning" ? "secondary" :
                                "default"
                              }>
                                {announcement.type}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Switch
                                checked={announcement.is_active}
                                onCheckedChange={() => handleToggleAnnouncementActive(announcement.id, announcement.is_active)}
                              />
                            </TableCell>
                            <TableCell>
                              {format(new Date(announcement.created_at), "MMM d, HH:mm")}
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleOpenAnnouncementDialog(announcement)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteAnnouncement(announcement.id)}
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminDashboard;
