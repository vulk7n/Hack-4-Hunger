
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { UtensilsCrossed, ArrowRight, HeartHandshake, Leaf, Users, CloudOff, Truck } from 'lucide-react';
import { AnimatedCounter } from '@/components/animated-counter';
import { TypingAnimation } from '@/components/typing-animation';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background isolate">
       <div className="fixed inset-0 -z-10 h-full w-full bg-background">
        <div className="absolute bottom-0 left-0 right-0 top-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px]"></div>
        <div className="absolute left-0 right-0 top-[-10%] h-[1000px] w-[1000px] rounded-full bg-[radial-gradient(circle_400px_at_50%_300px,#32CD3233,transparent)]"></div>
       </div>

      <header className="container mx-auto px-4 md:px-6 h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
            <UtensilsCrossed className="h-7 w-7 text-primary" />
            <span className="text-2xl font-bold text-primary font-headline">AnnaDaan</span>
        </Link>
        <nav className="flex items-center gap-4">
            <Button variant="ghost" asChild>
                <Link href="/login">Log In</Link>
            </Button>
            <Button asChild>
                <Link href="/signup">Get Started <ArrowRight className="ml-2"/></Link>
            </Button>
        </nav>
      </header>

      <main className="flex-1 flex flex-col justify-center">
        <section className="container mx-auto px-4 md:px-6 py-20 md:py-32 text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-headline font-bold tracking-tight text-foreground mb-6 animate-fade-in-down">
              <div>Turn Surplus into</div>
              <div><TypingAnimation words={["Growth", "Earnings", "Respect", "Sustenance"]} className="text-primary" /></div>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto animate-fade-in-up">
              Join AnnaDaan to connect with your community by donating excess food.
              Reduce waste, fight hunger, and make a tangible impact, one meal at a time.
            </p>
            <div className="flex justify-center gap-4 animate-fade-in-up">
              <Button size="lg" asChild>
                <Link href="/dashboard/donations">Become a Donor</Link>
              </Button>
              <Button size="lg" variant="secondary" asChild>
                <Link href="/dashboard">Find Food</Link>
              </Button>
            </div>
          </div>
        </section>

         <section className="py-20 md:py-24">
            <div className="container mx-auto px-4 md:px-6">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold font-headline">Our Live Impact</h2>
                    <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">See the difference we're making together, in real-time.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
                    <div className="flex flex-col items-center p-6 bg-card/40 backdrop-blur-sm rounded-lg border border-primary/20">
                        <Leaf className="h-12 w-12 text-primary mb-4"/>
                        <p className="text-4xl font-bold text-primary"><AnimatedCounter value={350} /> kg</p>
                        <p className="text-muted-foreground mt-2 text-center">of food saved from waste</p>
                    </div>
                    <div className="flex flex-col items-center p-6 bg-card/40 backdrop-blur-sm rounded-lg border border-primary/20">
                        <HeartHandshake className="h-12 w-12 text-primary mb-4"/>
                        <p className="text-4xl font-bold text-primary"><AnimatedCounter value={1287} /></p>
                        <p className="text-muted-foreground mt-2 text-center">Meals provided</p>
                    </div>
                     <div className="flex flex-col items-center p-6 bg-card/40 backdrop-blur-sm rounded-lg border border-primary/20">
                        <CloudOff className="h-12 w-12 text-primary mb-4"/>
                        <p className="text-4xl font-bold text-primary"><AnimatedCounter value={875} /> kg</p>
                        <p className="text-muted-foreground mt-2 text-center">CO₂ saved by avoiding landfill</p>
                    </div>
                     <div className="flex flex-col items-center p-6 bg-card/40 backdrop-blur-sm rounded-lg border border-primary/20">
                        <Truck className="h-12 w-12 text-primary mb-4"/>
                        <p className="text-4xl font-bold text-primary"><AnimatedCounter value={25} /></p>
                        <p className="text-muted-foreground mt-2 text-center">Jobs supported for delivery workers</p>
                    </div>
                </div>
            </div>
        </section>

      </main>
      
      <footer className="border-t border-white/10">
        <div className="container mx-auto px-4 md:px-6 py-6 text-center text-muted-foreground text-sm">
          <p>&copy; {new Date().getFullYear()} AnnaDaan. All Rights Reserved.</p>
        </div>
      </footer>
    </div>
  );
}
