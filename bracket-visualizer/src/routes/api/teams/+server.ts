import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import type { TeamData } from '$lib/types';

// In-memory storage for team data
// This will persist as long as the server is running
let teamData: TeamData = { teams: [] };

// GET handler to retrieve team data
export const GET: RequestHandler = async () => {
  return json(teamData);
};

// PUT handler to update team data
export const PUT: RequestHandler = async ({ request }) => {
  try {
    const updatedData = await request.json() as TeamData;
    
    // Validate the data structure
    if (!updatedData.teams || !Array.isArray(updatedData.teams)) {
      return json({ error: 'Invalid data format' }, { status: 400 });
    }
    
    // Update the in-memory storage
    teamData = updatedData;
    
    return json({ success: true });
  } catch (error) {
    console.error('Error updating team data:', error);
    return json({ error: 'Failed to update team data' }, { status: 500 });
  }
}; 