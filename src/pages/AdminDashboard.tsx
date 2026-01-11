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
import { Loader2, LogOut, Shield, Ban, RefreshCw, AlertCircle, CheckCircle } from "lucide-react";
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

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, isAdmin, isLoading: authLoading, signOut } = useAuth();
  const { toast } = useToast();
  
  const [requestLogs, setRequestLogs] = useState<RequestLog[]>([]);
  const [bannedIPs, setBannedIPs] = useState<BannedIP[]>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(true);
  const [isLoadingBanned, setIsLoadingBanned] = useState(true);
  const [banDialogOpen, setBanDialogOpen] = useState(false);
  const [selectedIP, setSelectedIP] = useState("");
  const [banReason, setBanReason] = useState("");
  const [isBanning, setIsBanning] = useState(false);

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

  useEffect(() => {
    if (user && isAdmin) {
      fetchRequestLogs();
      fetchBannedIPs();
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
        </Tabs>
      </main>
    </div>
  );
};

export default AdminDashboard;
