import { useEffect, useState } from 'react';
import { Plus, Minus, Trash2, UserPlus } from 'lucide-react';
import { supabase, AnecdoteCounter } from './lib/supabase';

function App() {
  const [counters, setCounters] = useState<AnecdoteCounter[]>([]);
  const [newPersonName, setNewPersonName] = useState('');
  const [isAddingPerson, setIsAddingPerson] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCounters();
  }, []);

  const loadCounters = async () => {
    try {
      const { data, error } = await supabase
        .from('anecdote_counters')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;
      setCounters(data || []);
    } catch (error) {
      console.error('Error loading counters:', error);
    } finally {
      setLoading(false);
    }
  };

  const addPerson = async () => {
    if (!newPersonName.trim()) return;

    try {
      const { data, error } = await supabase
        .from('anecdote_counters')
        .insert([{ person_name: newPersonName.trim(), count: 0 }])
        .select()
        .single();

      if (error) throw error;
      if (data) {
        setCounters([...counters, data]);
        setNewPersonName('');
        setIsAddingPerson(false);
      }
    } catch (error) {
      console.error('Error adding person:', error);
    }
  };

  const incrementCount = async (id: string, currentCount: number) => {
    try {
      const { error } = await supabase
        .from('anecdote_counters')
        .update({ count: currentCount + 1, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;

      setCounters(counters.map(c =>
        c.id === id ? { ...c, count: currentCount + 1 } : c
      ));
    } catch (error) {
      console.error('Error incrementing count:', error);
    }
  };

  const decrementCount = async (id: string, currentCount: number) => {
    if (currentCount <= 0) return;

    try {
      const { error } = await supabase
        .from('anecdote_counters')
        .update({ count: currentCount - 1, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;

      setCounters(counters.map(c =>
        c.id === id ? { ...c, count: currentCount - 1 } : c
      ));
    } catch (error) {
      console.error('Error decrementing count:', error);
    }
  };

  const deletePerson = async (id: string) => {
    try {
      const { error } = await supabase
        .from('anecdote_counters')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setCounters(counters.filter(c => c.id !== id));
    } catch (error) {
      console.error('Error deleting person:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-slate-600 text-lg">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-800 mb-3">
            Compteur d'Anecdotes
          </h1>
          <p className="text-slate-600 text-lg">
            Suivez le nombre d'anecdotes partagées par chaque personne
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          {counters.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-500 mb-6">Aucun compteur pour le moment</p>
              <button
                onClick={() => setIsAddingPerson(true)}
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                <UserPlus size={20} />
                Ajouter une personne
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {counters.map((counter) => (
                <div
                  key={counter.id}
                  className="flex items-center justify-between p-6 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors"
                >
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-slate-800 mb-1">
                      {counter.person_name}
                    </h3>
                    <p className="text-sm text-slate-500">
                      {counter.count} {counter.count <= 1 ? 'anecdote' : 'anecdotes'}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 bg-white rounded-lg p-2 shadow-sm">
                      <button
                        onClick={() => decrementCount(counter.id, counter.count)}
                        disabled={counter.count <= 0}
                        className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <Minus size={20} />
                      </button>
                      <span className="text-3xl font-bold text-slate-800 min-w-[60px] text-center">
                        {counter.count}
                      </span>
                      <button
                        onClick={() => incrementCount(counter.id, counter.count)}
                        className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                      >
                        <Plus size={20} />
                      </button>
                    </div>

                    <button
                      onClick={() => deletePerson(counter.id)}
                      className="p-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Supprimer"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {counters.length > 0 && !isAddingPerson && (
          <div className="text-center">
            <button
              onClick={() => setIsAddingPerson(true)}
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <UserPlus size={20} />
              Ajouter une personne
            </button>
          </div>
        )}

        {isAddingPerson && (
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">
              Nouvelle personne
            </h3>
            <div className="flex gap-3">
              <input
                type="text"
                value={newPersonName}
                onChange={(e) => setNewPersonName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addPerson()}
                placeholder="Nom de la personne"
                className="flex-1 px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                autoFocus
              />
              <button
                onClick={addPerson}
                disabled={!newPersonName.trim()}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Ajouter
              </button>
              <button
                onClick={() => {
                  setIsAddingPerson(false);
                  setNewPersonName('');
                }}
                className="px-6 py-3 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors font-medium"
              >
                Annuler
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
