import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Clock, Beaker, AlertCircle, CheckCircle2, Package } from "lucide-react";
import { Order } from "@/components/OrderCard";
import { getRecipe } from "@/data/recipes";
import { cn } from "@/lib/utils";

interface OrderDetailModalProps {
  order: Order | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const OrderDetailModal = ({ order, open, onOpenChange }: OrderDetailModalProps) => {
  if (!order) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0">
        <ScrollArea className="max-h-[90vh]">
          <div className="p-6 space-y-6">
            <DialogHeader>
              <div className="flex items-start justify-between">
                <div>
                  <DialogTitle className="text-2xl font-bold">
                    Chi tiết đơn hàng {order.orderNumber}
                  </DialogTitle>
                  <DialogDescription className="mt-2">
                    Công thức pha chế và nguyên liệu chi tiết
                  </DialogDescription>
                </div>
                <Badge variant="outline" className="gap-2">
                  <Package className="w-4 h-4" />
                  {order.type === "takeaway" ? "Take-away" : "Delivery"}
                </Badge>
              </div>
            </DialogHeader>

            {/* Customer Info */}
            <div className="bg-secondary/30 rounded-lg p-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Khách hàng</p>
                  <p className="font-semibold text-foreground">{order.customerName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Thời gian đặt</p>
                  <p className="font-semibold text-foreground">{order.time}</p>
                </div>
              </div>
              {order.notes && (
                <div className="mt-3 pt-3 border-t border-border">
                  <p className="text-sm text-muted-foreground mb-1">Ghi chú đơn hàng</p>
                  <p className="text-sm font-medium text-foreground">{order.notes}</p>
                </div>
              )}
            </div>

            {/* Items with Recipes */}
            <div className="space-y-6">
              {order.items.map((item, idx) => {
                const recipe = getRecipe(item.name, item.size);
                
                return (
                  <div key={idx} className="border border-border rounded-lg overflow-hidden">
                    {/* Item Header */}
                    <div className="bg-primary/5 p-4 flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-bold text-lg text-foreground">
                          {item.name} ({item.size})
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Số lượng: <span className="font-semibold text-foreground">x{item.quantity}</span>
                        </p>
                        {item.notes && (
                          <p className="text-sm text-accent font-medium mt-1">
                            ⚠️ Ghi chú: {item.notes}
                          </p>
                        )}
                      </div>
                      {recipe && (
                        <Badge variant="outline" className="gap-2">
                          <Clock className="w-3 h-3" />
                          {recipe.preparationTime}
                        </Badge>
                      )}
                    </div>

                    {recipe ? (
                      <div className="p-4 space-y-4">
                        {/* Ingredients */}
                        <div>
                          <div className="flex items-center gap-2 mb-3">
                            <Beaker className="w-5 h-5 text-primary" />
                            <h4 className="font-semibold text-foreground">Nguyên liệu</h4>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            {recipe.ingredients.map((ingredient, i) => (
                              <div
                                key={i}
                                className="bg-secondary/20 rounded-lg p-3 flex justify-between items-center"
                              >
                                <span className="text-sm font-medium text-foreground">
                                  {ingredient.name}
                                </span>
                                <span className="text-sm font-bold text-primary">
                                  {ingredient.amount} {ingredient.unit}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <Separator />

                        {/* Recipe Steps */}
                        <div>
                          <div className="flex items-center gap-2 mb-3">
                            <CheckCircle2 className="w-5 h-5 text-accent" />
                            <h4 className="font-semibold text-foreground">Các bước thực hiện</h4>
                          </div>
                          <div className="space-y-3">
                            {recipe.steps.map((step) => (
                              <div key={step.step} className="flex gap-3">
                                <div className="flex-shrink-0">
                                  <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center">
                                    <span className="text-sm font-bold text-accent-foreground">
                                      {step.step}
                                    </span>
                                  </div>
                                </div>
                                <div className="flex-1 pt-1">
                                  <p className="text-sm text-foreground">{step.instruction}</p>
                                  {step.duration && (
                                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                                      <Clock className="w-3 h-3" />
                                      {step.duration}
                                    </p>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Notes */}
                        {recipe.notes && recipe.notes.length > 0 && (
                          <>
                            <Separator />
                            <div>
                              <div className="flex items-center gap-2 mb-3">
                                <AlertCircle className="w-5 h-5 text-destructive" />
                                <h4 className="font-semibold text-foreground">Lưu ý quan trọng</h4>
                              </div>
                              <div className="space-y-2">
                                {recipe.notes.map((note, i) => (
                                  <div
                                    key={i}
                                    className="bg-destructive/10 border border-destructive/20 rounded-lg p-3"
                                  >
                                    <p className="text-sm text-foreground">⚠️ {note}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    ) : (
                      <div className="p-4">
                        <div className="bg-muted/30 rounded-lg p-4 text-center">
                          <AlertCircle className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                          <p className="text-sm text-muted-foreground">
                            Công thức chưa được cập nhật cho món này
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
