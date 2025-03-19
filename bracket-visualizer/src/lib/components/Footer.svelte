<script>
  // Get current year for copyright
  const currentYear = new Date().getFullYear();
</script>

<footer class="footer">
  <div class="footer-content">
    <p>© {currentYear} March Madness Bracket Randomizer</p>
    <p class="credit">Vibe coded by <a href="https://loganlarson.caffeinatedstudios.dev" class="name">Logan Larson</a> and <a href="https://www.anthropic.com/claude" class="name">Claude</a></p>
  </div>
</footer>

<style>
  .footer {
    margin-top: auto;
    padding: 16px;
    background-color: white;
    border-top: 1px solid var(--border-color);
    text-align: center;
    font-size: 14px;
    color: #666;
  }
  
  .footer-content {
    max-width: 1000px;
    margin: 0 auto;
  }
  
  .credit {
    margin-top: 4px;
    font-size: 12px;
  }
  
  .name {
    color: var(--primary-color);
    font-weight: 600;
  }

  .name:hover {
    text-decoration: underline;
  }
</style> 