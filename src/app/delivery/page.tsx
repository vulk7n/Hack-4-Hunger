
'use client';

import { StatCard } from "@/components/dashboard/stat-card";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Truck, CheckCircle, Clock, Wallet, Coins, Star, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { AnimatedCounter } from "@/components/animated-counter";
import { StarRating } from "@/components/delivery/star-rating";
import { DeliveryStatusUpdater } from "@/components/delivery/delivery-status-updater";
import { TaskNotification } from "@/components/delivery/task-notification";
import { useDelivery } from "@/contexts/delivery-context";


const taskPool = [
    { id: "task-1", food: "Leftover Wedding Feast", from: "Royal Palace Events", to: "City Shelter", status: "Awaiting Pickup", earnings: 150, coins: 75, distance: '12 km' },
    { id: "task-2", food: "Daily Bakery Surplus", from: "Bread & Co.", to: "Community Fridge", status: "Awaiting Pickup", earnings: 45, coins: 20, distance: '3.5 km' },
    { id: "task-3", food: "Home-cooked Pulao", from: "Priya S.", to: "Jayanagar Orphanage", status: "Awaiting Pickup", earnings: 35, coins: 15, distance: '2 km' },
    { id: "task-4", food: "Corporate Lunch Extras", from: "TechCorp Inc.", to: "Whitefield Night Shelter", status: "Awaiting Pickup", earnings: 90, coins: 45, distance: '15 km' },
    { id: "task-5", food: "Idli & Sambar", from: "South Kitchen", to: "Malleshwaram Home", status: "Awaiting Pickup", earnings: 60, coins: 30, distance: '5 km' },
    { id: "task-6", food: "Excess Birthday Cake", from: "Rohan K.", to: "HSR Layout Community", status: "Awaiting Pickup", earnings: 40, coins: 20, distance: '4 km' },
];


const initialOngoingTasks = [
    { id: "ongoing-1", food: "Event Leftovers", from: "Royal Palace", to: "Hope Shelter", status: "In Transit", earnings: 120, coins: 60, distance: '8 km' },
];

const initialCompletedTasks = [
     { id: "completed-1", food: "Bakery Surplus", from: "Bread & Co.", to: "Community Center", status: "Delivered", earnings: 50, coins: 25, distance: '2.5 km' },
];

export default function DeliveryDashboardPage() {
    const { isDutyOn } = useDelivery();
    const [ongoingTasks, setOngoingTasks] = useState(initialOngoingTasks);
    const [completedTasks, setCompletedTasks] = useState(initialCompletedTasks);
    const [cancelledTasksCount, setCancelledTasksCount] = useState(0);
    const [currentTask, setCurrentTask] = useState<any>(null);

     useEffect(() => {
        let timer: NodeJS.Timeout | undefined;

        if (isDutyOn && !currentTask) {
            timer = setInterval(() => {
                const acceptedTaskIds = [...ongoingTasks.map(t => t.id), ...completedTasks.map(t => t.id), currentTask?.id].filter(Boolean);
                const availableTasks = taskPool.filter(
                    p => !acceptedTaskIds.includes(p.id)
                );

                if (availableTasks.length > 0) {
                    const randomIndex = Math.floor(Math.random() * availableTasks.length);
                    const newTask = availableTasks[randomIndex];
                    setCurrentTask(newTask);
                }

            }, 5000); // Check for a new task every 5 seconds
        }

        return () => {
            if(timer) clearInterval(timer);
        };
    }, [isDutyOn, currentTask, ongoingTasks, completedTasks]);


    const handleStatusUpdate = (taskId: string, newStatus: string) => {
        if (newStatus === "Delivered") {
            const taskToComplete = ongoingTasks.find(t => t.id === taskId);
            if (taskToComplete) {
                setCompletedTasks(prev => [{...taskToComplete, status: "Delivered", id: `completed-${taskToComplete.id}`}, ...prev]);
                setOngoingTasks(prev => prev.filter(t => t.id !== taskId));
            }
        } else {
            setOngoingTasks(prev => prev.map(task => 
                task.id === taskId ? { ...task, status: newStatus } : task
            ));
        }
    };

    const handleAcceptTask = () => {
        if (currentTask) {
            setOngoingTasks(prev => [{...currentTask, status: 'Awaiting Pickup'}, ...prev]);
            setCurrentTask(null);
        }
    }

    const handleDeclineTask = () => {
        setCancelledTasksCount(prev => prev + 1);
        setCurrentTask(null);
    }


    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'Delivered':
                return 'bg-green-500/20 text-green-700';
            case 'In Transit':
                 return 'bg-blue-500/20 text-blue-700';
            case 'Arrived at Pickup':
                return 'bg-cyan-500/20 text-cyan-700';
            case 'Picked Up':
                return 'bg-indigo-500/20 text-indigo-700';
            case 'Arrived at Drop':
                 return 'bg-purple-500/20 text-purple-700';
            case 'Awaiting Pickup':
                return 'bg-yellow-500/20 text-yellow-700';
            default:
                return 'bg-muted';
        }
    }


  return (
    <div className="flex flex-col gap-8">
      {currentTask && (
        <TaskNotification 
            task={currentTask}
            onAccept={handleAcceptTask}
            onDecline={handleDeclineTask}
            onTimeout={handleDeclineTask}
        />
      )}
       <Card className="bg-card backdrop-blur-md h-full">
        <CardHeader>
            <CardTitle>Ongoing Deliveries</CardTitle>
            <CardDescription>
                Tasks you are currently completing.
            </CardDescription>
        </CardHeader>
        <CardContent>
            <TaskTable tasks={ongoingTasks} getStatusBadge={getStatusBadge} onStatusUpdate={handleStatusUpdate} showAction={true} />
        </CardContent>
       </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Star Rating"
          value={<StarRating rating={4.8} />}
          icon={Star}
          description="Based on last 50 deliveries"
        />
        <StatCard
          title="Cancelled delivery"
          value={<AnimatedCounter value={cancelledTasksCount} />}
          icon={XCircle}
          description="Tasks you declined today"
        />
        <StatCard
          title="Completed Today"
          value={<AnimatedCounter value={completedTasks.length} />}
          icon={CheckCircle}
          description="Great work!"
        />
         <StatCard
          title="Today's Earnings"
          value={<>₹<AnimatedCounter value={completedTasks.reduce((sum, task) => sum + task.earnings, 0)} /></>}
          icon={Wallet}
          description="earned today"
        />
      </div>

       <Card className="bg-card backdrop-blur-md h-full">
        <CardHeader>
            <CardTitle>Completed Deliveries</CardTitle>
            <CardDescription>
                Tasks you have completed today.
            </CardDescription>
        </CardHeader>
        <CardContent>
            <TaskTable tasks={completedTasks} getStatusBadge={getStatusBadge} />
        </CardContent>
       </Card>

    </div>
  );
}


type TaskTableProps = {
    tasks: any[];
    getStatusBadge: (status: string) => string;
    onStatusUpdate?: (taskId: string, newStatus: string) => void;
    showAction?: boolean;
}

function TaskTable({ tasks, getStatusBadge, onStatusUpdate, showAction = false }: TaskTableProps) {
    if (tasks.length === 0) {
        return <p className="text-muted-foreground text-center py-8">No tasks in this category right now.</p>
    }
    return (
        <>
        {/* Desktop View */}
        <div className="hidden md:block">
          <Table>
              <TableHeader>
                  <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead>From</TableHead>
                      <TableHead>To</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Earnings (INR)</TableHead>
                      <TableHead>Power Coins</TableHead>
                      {showAction && <TableHead className="text-right">Action</TableHead>}
                  </TableRow>
              </TableHeader>
              <TableBody>
                  {tasks.map((delivery) => (
                      <TableRow key={delivery.id}>
                          <TableCell className="font-medium">{delivery.food}</TableCell>
                          <TableCell>{delivery.from}</TableCell>
                          <TableCell>{delivery.to}</TableCell>
                          <TableCell>
                              <Badge variant='outline' className={getStatusBadge(delivery.status)}>
                                  {delivery.status}
                              </Badge>
                          </TableCell>
                          <TableCell className="font-semibold">₹{delivery.earnings}</TableCell>
                          <TableCell className="font-semibold text-primary flex items-center gap-2"><Coins className="h-4 w-4"/>{delivery.coins}</TableCell>
                           {showAction && onStatusUpdate && (
                            <TableCell className="text-right">
                               <DeliveryStatusUpdater
                                  task={delivery}
                                  onStatusUpdate={onStatusUpdate}
                                >
                                  <Button size="sm" variant="outline">Update</Button>
                                </DeliveryStatusUpdater>
                            </TableCell>
                           )}
                      </TableRow>
                  ))}
              </TableBody>
          </Table>
        </div>
         {/* Mobile View */}
        <div className="md:hidden space-y-4">
            {tasks.map((delivery) => (
                <Card key={delivery.id} className="bg-muted/50">
                    <CardContent className="p-4">
                       <div className="flex justify-between items-start">
                         <div>
                            <p className="font-semibold">{delivery.food}</p>
                            <p className="text-sm text-muted-foreground">From: {delivery.from}</p>
                            <p className="text-sm text-muted-foreground">To: {delivery.to}</p>
                         </div>
                          <Badge variant={'outline'} className={`${getStatusBadge(delivery.status)} text-xs`}>
                                {delivery.status}
                          </Badge>
                       </div>
                        <div className="flex justify-between items-end mt-4">
                           <div className="flex flex-col">
                             <span className="font-semibold text-sm">₹{delivery.earnings}</span>
                             <span className="font-semibold text-primary text-sm flex items-center gap-1"><Coins className="h-4 w-4"/>{delivery.coins}</span>
                           </div>
                            {showAction && onStatusUpdate && (
                                <DeliveryStatusUpdater
                                  task={delivery}
                                  onStatusUpdate={onStatusUpdate}
                                >
                                  <Button size="sm" variant="outline">Update</Button>
                                </DeliveryStatusUpdater>
                            )}
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
        </>
    );
}
