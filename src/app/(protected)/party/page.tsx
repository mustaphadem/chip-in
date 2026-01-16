import CreatePartyForm from "@/components/CreatePartyForm";

export default function CreatePartyPage() {
  return (
    <main className="min-h-screen p-8">
      <h1 className="text-2xl font-semibold mb-4">Create a party</h1>
      <CreatePartyForm />
    </main>
  );
}