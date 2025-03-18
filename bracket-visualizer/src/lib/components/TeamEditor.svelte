<script lang="ts">
  import { bracketStore, type Team } from '../stores';
  
  export let teams: Team[] = [];
  let selectedRegion = 'All';
  let expandedTeam: number | null = null;
  
  const regions = ['All', 'East', 'West', 'South', 'Midwest'];
  
  function toggleTeam(index: number) {
    expandedTeam = expandedTeam === index ? null : index;
  }
  
  function updateTeam(index: number, data: { name?: string, image?: string }) {
    bracketStore.updateTeamInfo(index, data);
  }
  
  $: filteredTeams = selectedRegion === 'All' 
    ? teams 
    : teams.filter(team => team.region === selectedRegion);
</script>

<div class="team-editor">
  <h2>Team Details</h2>
  
  <div class="region-filter">
    <label for="region-select">Filter by Region:</label>
    <select id="region-select" bind:value={selectedRegion}>
      {#each regions as region}
        <option value={region}>{region}</option>
      {/each}
    </select>
  </div>
  
  <div class="teams-list">
    {#each filteredTeams as team, index}
      {@const originalIndex = teams.findIndex(t => t.region === team.region && t.seed === team.seed)}
      <div class="team-item">
        <div class="team-header" on:click={() => toggleTeam(originalIndex)}>
          <div class="seed-badge">{team.seed}</div>
          <div class="team-name">{team.name || `${team.region} ${team.seed}`}</div>
          <div class="expand-icon">{expandedTeam === originalIndex ? '▼' : '▶'}</div>
        </div>
        
        {#if expandedTeam === originalIndex}
          <div class="team-details">
            <div class="form-row">
              <label for={`team-name-${originalIndex}`}>Team Name:</label>
              <input 
                id={`team-name-${originalIndex}`} 
                type="text" 
                value={team.name || ''}
                placeholder={`${team.region} ${team.seed}`}
                on:change={(e) => updateTeam(originalIndex, { name: (e.target as HTMLInputElement).value })}
              />
            </div>
            
            <div class="form-row">
              <label for={`team-image-${originalIndex}`}>Image URL:</label>
              <input 
                id={`team-image-${originalIndex}`} 
                type="text" 
                value={team.image || ''}
                placeholder="https://example.com/logo.png"
                on:change={(e) => updateTeam(originalIndex, { image: (e.target as HTMLInputElement).value })}
              />
            </div>
            
            {#if team.image}
              <div class="image-preview">
                <img src={team.image} alt={team.name || `${team.region} ${team.seed}`} />
              </div>
            {/if}
          </div>
        {/if}
      </div>
    {/each}
  </div>
</div>

<style>
  .team-editor {
    background-color: white;
    border-radius: 8px;
    padding: 20px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  }
  
  h2 {
    margin-bottom: 16px;
    color: var(--primary-color);
    font-size: 20px;
  }
  
  .region-filter {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 16px;
  }
  
  .region-filter select {
    padding: 6px 8px;
    border-radius: 4px;
    border: 1px solid var(--border-color);
  }
  
  .teams-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
    max-height: 600px;
    overflow-y: auto;
  }
  
  .team-item {
    border: 1px solid var(--border-color);
    border-radius: 4px;
    overflow: hidden;
  }
  
  .team-header {
    display: flex;
    align-items: center;
    padding: 8px;
    cursor: pointer;
    background-color: #f9f9f9;
    transition: background-color 0.2s;
  }
  
  .team-header:hover {
    background-color: #f0f0f0;
  }
  
  .seed-badge {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    background-color: var(--primary-color);
    color: white;
    border-radius: 50%;
    font-size: 12px;
    font-weight: bold;
    margin-right: 8px;
  }
  
  .team-name {
    flex: 1;
    font-size: 14px;
  }
  
  .expand-icon {
    color: var(--primary-color);
    font-size: 12px;
  }
  
  .team-details {
    padding: 12px;
    background-color: white;
    border-top: 1px solid var(--border-color);
  }
  
  .form-row {
    display: flex;
    flex-direction: column;
    margin-bottom: 12px;
  }
  
  .form-row label {
    font-size: 12px;
    margin-bottom: 4px;
    color: #555;
  }
  
  .form-row input {
    padding: 8px;
    border: 1px solid var(--border-color);
    border-radius: 4px;
    font-size: 14px;
  }
  
  .image-preview {
    width: 100%;
    height: 100px;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #f5f5f5;
    border-radius: 4px;
    overflow: hidden;
    margin-top: 8px;
  }
  
  .image-preview img {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
  }
</style> 