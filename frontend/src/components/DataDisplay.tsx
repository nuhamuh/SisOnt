import React, { useEffect, useState } from 'react';
import { fetchData } from '../services/api';

interface Item {
  id: number;
  name: string;
}

const DataDisplay: React.FC = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetchData();
        setItems(response.data);
        setLoading(false);
      } catch (err) {
        setError('Gagal mengambil data');
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>Data dari Backend:</h2>
      <ul>
        {items.map(item => (
          <li key={item.id}>{item.name}</li>
        ))}
      </ul>
    </div>
  );
};

export default DataDisplay; 