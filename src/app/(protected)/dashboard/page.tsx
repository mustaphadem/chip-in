import { auth } from "@/auth";

export default async function Home() {
    const session = await auth();
  return (
    <div>
      <div className="block absolute top-5 right-10 align-right">
        <div>Welcome, {session?.user?.name}</div>
        <a href="/party">Create a party</a>
      </div>
    </div>
  
  );
}
