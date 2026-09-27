/**
 * Asynchronous helper for interactive skill-gap preview
 */
document.addEventListener('DOMContentLoaded', () => {
  const gapButtons = document.querySelectorAll('[data-gap-preview-job]');

  gapButtons.forEach((btn) => {
    btn.addEventListener('click', async (e) => {
      e.preventDefault();
      const jobId = btn.getAttribute('data-gap-preview-job');
      const targetContainer = document.getElementById(`gap-preview-${jobId}`);

      if (!targetContainer) return;

      if (targetContainer.style.display === 'block') {
        targetContainer.style.display = 'none';
        return;
      }

      targetContainer.innerHTML = '<div class="text-muted small p-2"><span class="spinner-border spinner-border-sm me-1"></span> Calculating gap...</div>';
      targetContainer.style.display = 'block';

      try {
        const response = await fetch(`/matching/api/job/${jobId}/`, {
          headers: {
            'X-Requested-With': 'XMLHttpRequest',
          }
        });

        if (!response.ok) {
          throw new Error('Could not fetch gap data.');
        }

        const data = await response.json();
        let matchedBadges = data.matched_skills.map(s => `<span class="badge-skill badge-matched me-1">${s}</span>`).join('') || '<span class="text-muted small">None</span>';
        let missingBadges = data.missing_skills.map(s => `<span class="badge-skill badge-missing me-1">${s}</span>`).join('') || '<span class="text-success small">None</span>';

        targetContainer.innerHTML = `
          <div class="card p-3 mt-2 bg-light border">
            <div class="d-flex justify-content-between align-items-center mb-2">
              <span class="fw-bold small">Instant Match: <strong>${data.total_score}%</strong></span>
              <a href="/matching/job/${jobId}/" class="small text-primary">View Full Breakdown &rarr;</a>
            </div>
            <div class="small mb-1"><strong>Matched:</strong> ${matchedBadges}</div>
            <div class="small"><strong>Missing:</strong> ${missingBadges}</div>
          </div>
        `;
      } catch (err) {
        targetContainer.innerHTML = `<div class="text-danger small p-2">${err.message}</div>`;
      }
    });
  });
});
