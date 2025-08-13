
'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetDescription,
} from '@/components/ui/sheet';

import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Check, Truck } from 'lucide-react';

const deliverySteps = [
  { id: 'Arrived at Pickup', label: 'Arrived at Pickup' },
  { id: 'Picked Up', label: 'Picked Up' },
  { id: 'Arrived at Drop', label: 'Arrived at Drop' },
  { id: 'Delivered', label: 'Delivered' },
];

type DeliveryStatusUpdaterProps = {
  children: React.ReactNode;
  task: { id: string; status: string };
  onStatusUpdate: (taskId: string, newStatus: string) => void;
};

export function DeliveryStatusUpdater({ children, task, onStatusUpdate }: DeliveryStatusUpdaterProps) {
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false);

  const currentStepIndex = deliverySteps.findIndex(step => step.id === task.status);
  
  // If the task status is "In Transit" we start at the first step
  const activeStepIndex = task.status === 'In Transit' ? -1 : currentStepIndex;

  const handleUpdate = () => {
    const nextStepIndex = activeStepIndex + 1;
    if (nextStepIndex < deliverySteps.length) {
      const nextStep = deliverySteps[nextStepIndex];
      onStatusUpdate(task.id, nextStep.id);
      if (nextStep.id === 'Delivered') {
        setIsOpen(false);
      }
    }
  };

  const nextActionText = activeStepIndex < deliverySteps.length -1 ? deliverySteps[activeStepIndex+1].label : 'Completed';


  const Content = () => (
    <div className='p-4 md:p-0'>
      <ol className="relative text-gray-500 border-s border-gray-200 dark:border-gray-700 dark:text-gray-400">
        {deliverySteps.map((step, index) => (
          <li key={step.id} className="mb-10 ms-6">
            <span className={cn("absolute flex items-center justify-center w-8 h-8 rounded-full -start-4 ring-4 ring-white dark:ring-gray-900",
                index <= activeStepIndex ? 'bg-green-200 dark:bg-green-900 text-green-600 dark:text-green-400' : 'bg-gray-100 dark:bg-gray-800'
            )}>
              {index <= activeStepIndex ? <Check className='w-5 h-5' /> : <Truck className='w-4 h-4' />}
            </span>
            <h3 className="font-medium leading-tight">{step.label}</h3>
            <p className="text-sm">Status: {index <= activeStepIndex ? 'Completed' : 'Pending'}</p>
          </li>
        ))}
      </ol>
      <Button 
        onClick={handleUpdate} 
        disabled={activeStepIndex >= deliverySteps.length - 1}
        className="w-full"
      >
        {nextActionText}
      </Button>
    </div>
  );

  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>{children}</SheetTrigger>
        <SheetContent side="bottom" className="bg-card/90 backdrop-blur-lg rounded-t-2xl">
          <SheetHeader>
            <SheetTitle>Update Delivery Status</SheetTitle>
            <SheetDescription>Mark the next step of your delivery as complete.</SheetDescription>
          </SheetHeader>
          <Content />
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md bg-card/95 backdrop-blur-lg">
        <DialogHeader>
          <DialogTitle>Update Delivery Status</DialogTitle>
           <DialogDescription>Mark the next step of your delivery as complete.</DialogDescription>
        </DialogHeader>
        <Content />
      </DialogContent>
    </Dialog>
  );
}
