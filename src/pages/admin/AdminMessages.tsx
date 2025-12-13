import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { Eye, Trash2, Mail, MailOpen } from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export default function AdminMessages() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    const { data, error } = await supabase
      .from("contact_messages")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Mesajlar yüklenirken bir hata oluştu.",
      });
    } else {
      setMessages(data || []);
    }
    setLoading(false);
  };

  const handleViewMessage = async (message: ContactMessage) => {
    setSelectedMessage(message);

    if (!message.is_read) {
      const { error } = await supabase
        .from("contact_messages")
        .update({ is_read: true })
        .eq("id", message.id);

      if (!error) {
        setMessages((prev) =>
          prev.map((m) => (m.id === message.id ? { ...m, is_read: true } : m))
        );
      }
    }
  };

  const handleDeleteMessage = async (id: string) => {
    if (!confirm("Bu mesajı silmek istediğinizden emin misiniz?")) return;

    const { error } = await supabase
      .from("contact_messages")
      .delete()
      .eq("id", id);

    if (error) {
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Mesaj silinirken bir hata oluştu.",
      });
    } else {
      toast({
        title: "Başarılı",
        description: "Mesaj silindi.",
      });
      setMessages((prev) => prev.filter((m) => m.id !== id));
    }
  };

  const unreadCount = messages.filter((m) => !m.is_read).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Yükleniyor...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Mesajlar</h1>
          <p className="text-muted-foreground mt-1">
            İletişim formundan gelen mesajları yönetin
          </p>
        </div>
        {unreadCount > 0 && (
          <Badge variant="secondary" className="text-sm">
            {unreadCount} okunmamış mesaj
          </Badge>
        )}
      </div>

      {messages.length === 0 ? (
        <div className="text-center py-12 bg-card rounded-2xl border border-border">
          <Mail className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Henüz mesaj bulunmuyor.</p>
        </div>
      ) : (
        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12"></TableHead>
                <TableHead>Gönderen</TableHead>
                <TableHead>Konu</TableHead>
                <TableHead>Tarih</TableHead>
                <TableHead className="text-right">İşlemler</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {messages.map((message) => (
                <TableRow
                  key={message.id}
                  className={!message.is_read ? "bg-primary/5" : ""}
                >
                  <TableCell>
                    {message.is_read ? (
                      <MailOpen className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <Mail className="w-4 h-4 text-primary" />
                    )}
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className={`font-medium ${!message.is_read ? "text-foreground" : "text-muted-foreground"}`}>
                        {message.name}
                      </p>
                      <p className="text-sm text-muted-foreground">{message.email}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className={`${!message.is_read ? "font-medium text-foreground" : "text-muted-foreground"}`}>
                      {message.subject}
                    </p>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {format(new Date(message.created_at), "d MMM yyyy HH:mm", { locale: tr })}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleViewMessage(message)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleDeleteMessage(message.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Message Detail Dialog */}
      <Dialog open={!!selectedMessage} onOpenChange={() => setSelectedMessage(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedMessage?.subject}</DialogTitle>
          </DialogHeader>
          {selectedMessage && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Gönderen</p>
                  <p className="font-medium">{selectedMessage.name}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">E-posta</p>
                  <p className="font-medium">{selectedMessage.email}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-muted-foreground">Tarih</p>
                  <p className="font-medium">
                    {format(new Date(selectedMessage.created_at), "d MMMM yyyy, HH:mm", { locale: tr })}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-muted-foreground text-sm mb-2">Mesaj</p>
                <div className="bg-muted/50 rounded-lg p-4 whitespace-pre-wrap">
                  {selectedMessage.message}
                </div>
              </div>
              <div className="flex justify-end">
                <Button
                  variant="outline"
                  onClick={() => window.open(`mailto:${selectedMessage.email}`, "_blank")}
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Yanıtla
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
