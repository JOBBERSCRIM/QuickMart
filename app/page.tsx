import { supabase } from '../lib/db';

export default function Home() {
  async function testConnection() {
    const { data, error } = await supabase.from('items').select('*');
    console.log("Items:", data, "Error:", error);
  }

  testConnection();

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Quickmart Dashboard</h1>
      <p>Check your browser console for Supabase test output.</p>
    </div>
  );
}