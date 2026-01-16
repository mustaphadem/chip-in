import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await auth();
  if(!session) {
    redirect("/signin");
  }
  return (
    <div>
       <h1 className="text-bold">WELCOME TO CHIP IN</h1>
       <p>Chip In lets people create shared groups, add expenses, and automatically calculate who owes whom so everyone can settle up easily.</p>
       <a className="text-center bg-blue-200 rounded-xl w-40 h-10 block p-2" href="/signin">Try Now!</a>
    </div>
  
  );
}
