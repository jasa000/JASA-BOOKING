import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BookMarked, MoveRight } from "lucide-react";

export default function HomePage() {
  return (
    <>
      <main className="flex-1">
        <section className="relative">
           <div 
            className="absolute inset-0 bg-gradient-to-r from-blue-500 to-teal-400 opacity-10 dark:opacity-20"
            style={{
              clipPath: 'polygon(0 0, 100% 0, 100% 80%, 0 100%)',
            }}
            />
          <div className="container relative py-24 md:py-32 lg:py-40 text-center">
            <h1 className="text-4xl font-headline font-extrabold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
              Your Portal to Unforgettable Events
            </h1>
            <p className="mx-auto mt-6 max-w-[700px] text-lg text-muted-foreground md:text-xl">
              Discover, create, and manage events with ease. JASA BOOKING is the ultimate platform for organizers and attendees alike.
            </p>
            <div className="mt-10 flex justify-center gap-4">
              <Link href="/events">
                <Button size="lg" className="bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:opacity-90 transition-opacity shadow-lg">
                  Browse Events
                  <MoveRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/events/create">
                <Button size="lg" variant="outline">
                  Create an Event
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <section className="container py-16 md:py-24">
            <div className="mx-auto grid max-w-5xl items-center gap-6 lg:grid-cols-2 lg:gap-12">
                <div className="flex flex-col justify-center space-y-4">
                    <div className="space-y-2">
                        <div className="inline-block rounded-lg bg-secondary px-3 py-1 text-sm">For Organizers</div>
                        <h2 className="text-3xl font-bold font-headline tracking-tighter sm:text-4xl">Effortless Event Management</h2>
                        <p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                            Post your event in minutes. Our admin approval system ensures quality and our platform provides all the tools you need to reach your audience.
                        </p>
                    </div>
                </div>
                <div className="flex flex-col justify-center space-y-4">
                    <div className="space-y-2">
                        <div className="inline-block rounded-lg bg-secondary px-3 py-1 text-sm">For Attendees</div>
                        <h2 className="text-3xl font-bold font-headline tracking-tighter sm:text-4xl">Discover and Register Seamlessly</h2>
                        <p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                            Find events that match your interests with powerful search and filtering. Register with a single click and keep track of your upcoming experiences.
                        </p>
                    </div>
                </div>
            </div>
        </section>
      </main>
      <footer className="py-6 md:px-8 md:py-0 border-t">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
            <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
                Built by Your Friends at Firebase.
            </p>
        </div>
      </footer>
    </>
  );
}
