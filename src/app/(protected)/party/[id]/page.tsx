import Party from '@/components/Party';

export default async function PartyPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = await params;

  return <Party id={id} />;
}
