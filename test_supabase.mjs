import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://adzfnpebbblndhzngjqc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFkemZucGViYmJsbmRoem5nanFjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI4NTIwMzksImV4cCI6MjA4ODQyODAzOX0._S2PzOdKSk7hShycWDdjR2Q2vdqiDZrGZuNf4FtY6Bc';
const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  console.log("Testing insert...");
  const { data, error } = await supabase.from('notices').insert([{ title: 'Test', content: 'Test content' }]).select();
  if (error) {
    console.error("Error inserting into 'notices':", error.message);
  } else {
    console.log("Successfully inserted. Data:", data);
  }
}

testConnection();
