import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2, Mail, MailOpen, Trash2, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import DeleteConfirmDialog from "@/components/DeleteConfirmDialog";
import EmptyState from "@/components/EmptyState";

export default function ContactMessages() {
  const [selectedMessage, setSelectedMessage] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ["contact-messages"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cagd_contact_messages")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("cagd_contact_messages")
        .update({ is_read: true })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contact-messages"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("cagd_contact_messages")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contact-messages"] });
      toast({ title: "Message deleted" });
      setDeleteId(null);
    },
  });

  const handleView = (message: any) => {
    setSelectedMessage(message);
    if (!message.is_read) {
      markAsReadMutation.mutate(message.id);
    }
  };

  const unreadCount = messages.filter((m: any) => !m.is_read).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-heading font-bold">Contact Messages</h1>
          {unreadCount > 0 && (
            <p className="text-sm text-muted-foreground">
              {unreadCount} unread message{unreadCount > 1 ? "s" : ""}
            </p>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : messages.length === 0 ? (
        <EmptyState
          type="generic"
          title="No messages"
          description="You haven't received any contact form submissions yet."
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-8"></TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="w-24">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {messages.map((message: any) => (
              <TableRow key={message.id} className={!message.is_read ? "bg-primary/5" : ""}>
                <TableCell>
                  {message.is_read ? (
                    <MailOpen className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <Mail className="w-4 h-4 text-primary" />
                  )}
                </TableCell>
                <TableCell className="font-medium">
                  {message.name}
                  {!message.is_read && <Badge className="ml-2" variant="default">New</Badge>}
                </TableCell>
                <TableCell>{message.email}</TableCell>
                <TableCell className="max-w-[200px] truncate">{message.subject}</TableCell>
                <TableCell>{new Date(message.created_at).toLocaleDateString()}</TableCell>
                <TableCell className="flex gap-1">
                  <Button size="icon" variant="ghost" onClick={() => handleView(message)}>
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => setDeleteId(message.id)}>
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {/* View Message Dialog */}
      <Dialog open={!!selectedMessage} onOpenChange={() => setSelectedMessage(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{selectedMessage?.subject}</DialogTitle>
          </DialogHeader>
          {selectedMessage && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">From</p>
                  <p className="font-medium">{selectedMessage.name}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Email</p>
                  <a href={`mailto:${selectedMessage.email}`} className="font-medium text-primary hover:underline">
                    {selectedMessage.email}
                  </a>
                </div>
                {selectedMessage.phone && (
                  <div>
                    <p className="text-muted-foreground">Phone</p>
                    <a href={`tel:${selectedMessage.phone}`} className="font-medium text-primary hover:underline">
                      {selectedMessage.phone}
                    </a>
                  </div>
                )}
                <div>
                  <p className="text-muted-foreground">Date</p>
                  <p className="font-medium">
                    {new Date(selectedMessage.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-muted-foreground text-sm mb-2">Message</p>
                <div className="p-4 bg-muted rounded-lg whitespace-pre-wrap">
                  {selectedMessage.message}
                </div>
              </div>
              <div className="flex gap-2">
                <Button asChild className="flex-1">
                  <a href={`mailto:${selectedMessage.email}?subject=Re: ${selectedMessage.subject}`}>
                    <Mail className="w-4 h-4 mr-2" /> Reply via Email
                  </a>
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <DeleteConfirmDialog
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
        title="Delete message?"
        description="This will permanently delete this contact message. This action cannot be undone."
      />
    </div>
  );
}
