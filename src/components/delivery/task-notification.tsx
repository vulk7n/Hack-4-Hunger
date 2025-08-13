
'use client';

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useState, useEffect } from 'react';
import { Coins, MapPin, Milestone, Wallet } from 'lucide-react';

type TaskNotificationProps = {
  task: {
    from: string;
    to: string;
    distance: string;
    earnings: number;
    coins: number;
  };
  onAccept: () => void;
  onDecline: () => void;
  onTimeout: () => void;
};

const NOTIFICATION_TIMEOUT = 5000; // 5 seconds

export function TaskNotification({ task, onAccept, onDecline, onTimeout }: TaskNotificationProps) {
  const [progress, setProgress] = useState(100);
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    setIsOpen(true);
    setProgress(100);

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev <= 0) {
          clearInterval(interval);
          setIsOpen(false);
          onTimeout();
          return 0;
        }
        return prev - (100 / (NOTIFICATION_TIMEOUT / 100));
      });
    }, 100);

    return () => clearInterval(interval);
  }, [task, onTimeout]);

  const handleDecline = () => {
    setIsOpen(false);
    onDecline();
  };

  const handleAccept = () => {
    setIsOpen(false);
    onAccept();
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      handleDecline();
    }
    setIsOpen(open);
  };

  return (
    <Sheet open={isOpen} onOpenChange={handleOpenChange}>
      <SheetContent side="bottom" className="bg-card/90 backdrop-blur-lg rounded-t-2xl">
        <SheetHeader>
          <SheetTitle className="font-headline text-2xl">New Delivery Task!</SheetTitle>
          <SheetDescription>
            You have {NOTIFICATION_TIMEOUT/1000} seconds to accept this task.
          </SheetDescription>
        </SheetHeader>
        <div className="space-y-4 my-4">
            <div className="flex items-start gap-4">
                <MapPin className="h-5 w-5 text-primary mt-1" />
                <div>
                    <p className="font-semibold">Pickup</p>
                    <p className="text-muted-foreground">{task.from}</p>
                </div>
            </div>
             <div className="flex items-start gap-4">
                <Milestone className="h-5 w-5 text-primary mt-1" />
                <div>
                    <p className="font-semibold">Dropoff</p>
                    <p className="text-muted-foreground">{task.to}</p>
                </div>
            </div>
            <div className="flex justify-between text-sm pt-2">
                 <div className="flex items-center gap-2">
                    <p className="font-semibold">Distance:</p>
                    <p className="text-muted-foreground">{task.distance}</p>
                </div>
                 <div className="flex flex-col items-end">
                    <div className="flex items-center gap-2 font-semibold">
                        <Wallet className="h-4 w-4 text-green-500"/>
                        <span>₹{task.earnings}</span>
                    </div>
                     <div className="flex items-center gap-2 font-semibold text-primary">
                        <Coins className="h-4 w-4"/>
                        <span>{task.coins} coins</span>
                    </div>
                </div>
            </div>
        </div>

         <Progress value={progress} className="h-2" />

        <SheetFooter className="mt-4 grid grid-cols-2 gap-4">
          <Button variant="outline" onClick={handleDecline}>Decline</Button>
          <Button onClick={handleAccept}>Accept Job</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
