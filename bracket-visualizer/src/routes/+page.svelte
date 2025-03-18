<script lang="ts">
  import Bracket from '$lib/components/Bracket.svelte';
  import TeamEditor from '$lib/components/TeamEditor.svelte';
  import { bracketStore } from '$lib/stores';
</script>

<svelte:head>
  <title>March Madness Bracket Visualizer</title>
</svelte:head>

<main>
  <header>
    <h1>March Madness Bracket Visualizer</h1>
    <p>Visualize your March Madness bracket and generate results.</p>
  </header>
  
  <div class="content">
    <div class="bracket-section">
      <Bracket />
    </div>
    
    <div class="team-section">
      <TeamEditor teams={$bracketStore.allTeams} />
    </div>
  </div>
</main>

<style>
  main {
    max-width: 1600px;
    margin: 0 auto;
    padding: 20px;
  }
  
  header {
    text-align: center;
    margin-bottom: 32px;
  }
  
  h1 {
    color: var(--primary-color);
    font-size: 32px;
    margin-bottom: 8px;
  }
  
  .content {
    display: flex;
    gap: 20px;
    flex-direction: column;
  }
  
  .bracket-section {
    overflow-x: auto;
  }
  
  @media (max-width: 1200px) {
    .content {
      grid-template-columns: 1fr;
    }
  }
</style>
