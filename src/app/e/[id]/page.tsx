import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Calendar, MapPin, Clock, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import * as api from '../../../services/dataService';
import { EventData, FieldType } from '../../../types';
import { Button, Input, Select, Card, Badge } from '../../../components/UI';
import { EventRenderer } from '../../../components/EventRenderer';

export const PublicEvent = () => {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<EventData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      api.getEventById(id)
        .then(setEvent)
        .catch(() => setError("Event not found"))
        .finally(() => setLoading(false));
    }
  }, [id]);

  const handleSubmit = async (answers: Record<string, any>) => {
    if (!event) return;
    await api.submitRegistration(event.id, answers);
  };

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-zinc-500 font-mono text-sm">LOADING_EVENT_DATA...</div>;
  if (!event) return <div className="min-h-screen bg-black flex items-center justify-center text-zinc-500 font-mono text-sm">EVENT_NOT_FOUND</div>;

  return (
    <div className="min-h-screen bg-black text-zinc-200 py-12 px-4 sm:px-6 lg:px-8 flex justify-center">
      <EventRenderer event={event} onSubmit={handleSubmit} />
    </div>
  );
};