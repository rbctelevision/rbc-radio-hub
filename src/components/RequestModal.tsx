import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Button } from "./ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Music, MessageSquare, Send } from "lucide-react";
import SongRequestTab from "./request/SongRequestTab";
import MessageRequestTab from "./request/MessageRequestTab";

const RequestModal = () => {
  const [open, setOpen] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);

  const handleSuccess = () => {
    setOpen(false);
    setSuccessOpen(true);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button className="bg-gradient-primary hover:opacity-90">
            <Send className="mr-2" size={20} />
            Send a Request
          </Button>
        </DialogTrigger>

        <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Send a Request</DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="song" className="flex-1 flex flex-col overflow-hidden">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="song" className="flex items-center gap-2">
                <Music size={16} />
                Request a Song
              </TabsTrigger>
              <TabsTrigger value="message" className="flex items-center gap-2">
                <MessageSquare size={16} />
                Send a Message
              </TabsTrigger>
            </TabsList>

            <TabsContent value="song" className="flex-1 overflow-hidden">
              <SongRequestTab onSuccess={handleSuccess} />
            </TabsContent>

            <TabsContent value="message" className="flex-1 overflow-y-auto">
              <MessageRequestTab onSuccess={handleSuccess} />
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Success Dialog */}
      <Dialog open={successOpen} onOpenChange={setSuccessOpen}>
        <DialogContent className="max-w-sm text-center">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Request Submitted!</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground mb-4">
            Your request has been submitted successfully!
          </p>
          <Button onClick={() => setSuccessOpen(false)} className="w-full">
            OK
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default RequestModal;
