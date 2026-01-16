import { auth, signIn } from "@/auth"
import { redirect } from "next/navigation";
 
export default async function SignIn() {
  const session = await auth();
  if(session){
    redirect("/dashboard");
  }
  return (
    <form
          action={async () => {
            "use server"
            await signIn("google", {redirectTo:"/dashboard"})
          }}
        >
          <button className="text-center bg-blue-400 rounded-xl w-40 h-10 block" type="submit">Sign In with Google</button>
    </form>
  )
} 