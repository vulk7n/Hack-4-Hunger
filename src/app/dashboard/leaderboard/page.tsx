
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Award, Building, User } from "lucide-react";
import { AnimatedCounter } from "@/components/animated-counter";
import { getSupabaseServerClient } from "@/lib/supabase/server";

type LeaderboardUser = {
    rank: number;
    name: string;
    points: number;
    avatar_url: string;
}

export default async function LeaderboardPage() {
  const supabase = getSupabaseServerClient();

  const { data: restaurants, error: restaurantError } = await supabase
    .from('profiles')
    .select('name, power_coins, avatar_url')
    .eq('role', 'Restaurant')
    .order('power_coins', { ascending: false })
    .limit(10);
    
  const { data: individuals, error: individualError } = await supabase
    .from('profiles')
    .select('name, power_coins, avatar_url')
    .eq('role', 'Individual')
    .order('power_coins', { ascending: false })
    .limit(10);

  if (restaurantError) console.error("Error fetching restaurants:", restaurantError);
  if (individualError) console.error("Error fetching individuals:", individualError);

  const topRestaurants: LeaderboardUser[] = (restaurants || []).map((p, i) => ({
      rank: i + 1,
      name: p.name || 'Anonymous',
      points: p.power_coins || 0,
      avatar_url: p.avatar_url || '',
  }));
  
  const topIndividuals: LeaderboardUser[] = (individuals || []).map((p, i) => ({
      rank: i + 1,
      name: p.name || 'Anonymous',
      points: p.power_coins || 0,
      avatar_url: p.avatar_url || '',
  }));


  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">Leaderboard</h1>
        <p className="text-muted-foreground">Recognizing our top contributors making a difference.</p>
      </div>

      <Tabs defaultValue="restaurants">
        <TabsList className="grid w-full grid-cols-2 md:w-[400px]">
          <TabsTrigger value="restaurants">
            <Building className="mr-2 h-4 w-4" />
            Top Restaurants
          </TabsTrigger>
          <TabsTrigger value="individuals">
            <User className="mr-2 h-4 w-4" />
            Top Individuals
          </TabsTrigger>
        </TabsList>
        <TabsContent value="restaurants">
          <Card className="bg-card backdrop-blur-md">
            <CardHeader>
              <CardTitle>Top Restaurants - Monthly</CardTitle>
              <CardDescription>
                Leading restaurants in food donation for this month.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LeaderboardTable data={topRestaurants} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="individuals">
          <Card className="bg-card backdrop-blur-md">
            <CardHeader>
              <CardTitle>Top Individuals - Monthly</CardTitle>
              <CardDescription>
                Our most active individual donors this month.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LeaderboardTable data={topIndividuals} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

type LeaderboardTableProps = {
    data: LeaderboardUser[];
};

function LeaderboardTable({ data }: LeaderboardTableProps) {
    if (data.length === 0) {
        return <p className="text-muted-foreground text-center py-8">Leaderboard data is not available yet.</p>
    }
    return (
      <>
        {/* Desktop View */}
        <div className="hidden md:block">
            <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead className="w-[80px]">Rank</TableHead>
                    <TableHead>Contributor</TableHead>
                    <TableHead className="text-right">Power Coins</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.map((item) => (
                    <TableRow key={item.rank}>
                        <TableCell className="font-bold text-lg">{item.rank}</TableCell>
                        <TableCell>
                            <div className="flex items-center gap-3">
                                <Avatar>
                                    <AvatarImage src={item.avatar_url} />
                                    <AvatarFallback>{item.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <span className="font-medium">{item.name}</span>
                            </div>
                        </TableCell>
                        <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2 font-bold text-primary">
                                <Award className="h-5 w-5"/>
                                <AnimatedCounter value={item.points} />
                            </div>
                        </TableCell>
                    </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
        {/* Mobile View */}
        <div className="md:hidden space-y-4">
            {data.map((item) => (
                 <Card key={item.rank} className="bg-muted/50">
                    <CardContent className="p-4 flex items-center justify-between">
                         <div className="flex items-center gap-4">
                            <span className="font-bold text-lg w-6 text-center">{item.rank}</span>
                            <Avatar>
                                <AvatarImage src={item.avatar_url} />
                                <AvatarFallback>{item.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="font-medium">{item.name}</p>
                                <div className="flex items-center gap-1 text-sm text-primary">
                                    <Award className="h-4 w-4"/>
                                    <AnimatedCounter value={item.points} />
                                    <span className="text-xs text-muted-foreground ml-1">Coins</span>
                                </div>
                            </div>
                         </div>
                    </CardContent>
                 </Card>
            ))}
        </div>
      </>
    );
}
