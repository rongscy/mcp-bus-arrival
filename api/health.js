/**
 * Health check endpoint for MetroPulse / Vercel Serverless
 * Path: /api/health
 */
export default async function handler(req, res) {
  const hasLtaKey = Boolean(process.env.LTA_ACCOUNT_KEY);

  res.setHeader('Cache-Control', 'no-store, max-age=0');
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'MetroPulse LTA Bus API Gateway',
    environment: process.env.NODE_ENV || 'production',
    ltaKeyConfigured: hasLtaKey,
    uptimeSeconds: typeof process.uptime === 'function' ? Math.floor(process.uptime()) : null,
    endpoints: {
      health: '/api/health',
      busArrival: '/api/bus-arrival?BusStopCode=04121&ServiceNo=7',
    },
  });
}
