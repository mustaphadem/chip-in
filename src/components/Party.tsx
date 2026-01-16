'use client';

import {useState, FormEvent, useEffect} from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

type PartyProps = {
  id: string;
};

export default function Party({ id }: PartyProps) {
  const router = useRouter();
  const [expenses, setExpenses] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState<string | null>(null);

  const { data: session, status } = useSession();

 useEffect(() => {
    if (!id) return;

    const fetchParty = async () => {
        try {
            setError(null);
            setLoading(true);

            const res = await fetch(`/api/parties/${id}`, {
                method: 'GET',
                headers: { "Content-Type": "application/json" }
            });

            if (!res.ok) throw new Error('Failed to fetch party');

            const data = await res.json();

            setExpenses(data.expenses);
            setParticipants(data.participants);

        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
        } finally {
            setLoading(false);
        };
       
    };

    fetchParty();
 }, [id])

  return (
    <div>
        <h1>Party</h1>
        <ul>
            {participants.map((participant, id) => (
                <li key={id} >{participant}</li>
            ))}
        </ul>
        <ul>
            {expenses.map((expense, id) => (
                <li key={id} >{expense}</li>
            ))}
        </ul>
    </div>
  );
}