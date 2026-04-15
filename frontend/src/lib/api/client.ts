export async function apiDelay(durationMs = 120) {
  await new Promise((resolve) => {
    window.setTimeout(resolve, durationMs);
  });
}
