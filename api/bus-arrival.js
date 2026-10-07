/**
 * LTA DataMall v3 BusArrival Serverless API Endpoint
 * Path: /api/bus-arrival
 * Parameters:
 *   - BusStopCode (string, required, e.g. "04121")
 *   - ServiceNo (string, optional, e.g. "7")
 */
export default async function handler(req, res) {
  // Enable CORS for client-side consumption
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, AccountKey');
  res.setHeader('Cache-Control', 's-maxage=20, stale-while-revalidate=10');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { BusStopCode, ServiceNo } = req.query || {};

  if (!BusStopCode) {
    return res.status(400).json({
      error: 'Missing required query parameter: BusStopCode',
      usage: '/api/bus-arrival?BusStopCode=04121&ServiceNo=7',
    });
  }

  const accountKey = process.env.LTA_ACCOUNT_KEY;

  // If LTA AccountKey is set in Vercel or environment, call real LTA DataMall API
  if (accountKey) {
    try {
      const url = new URL('https://datamall2.mytransport.sg/ltaodataservice/v3/BusArrival');
      url.searchParams.set('BusStopCode', String(BusStopCode).trim());
      if (ServiceNo) {
        url.searchParams.set('ServiceNo', String(ServiceNo).trim());
      }

      const ltaResponse = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          AccountKey: accountKey,
          accept: 'application/json',
        },
      });

      if (!ltaResponse.ok) {
        const errText = await ltaResponse.text();
        return res.status(ltaResponse.status).json({
          error: `LTA DataMall API returned HTTP ${ltaResponse.status}`,
          details: errText,
          dataSource: 'lta_datamall_error',
        });
      }

      const ltaData = await ltaResponse.json();

      // Return both raw LTA format and enriched metadata
      return res.status(200).json({
        ...ltaData,
        dataSource: 'lta_datamall',
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      return res.status(502).json({
        error: 'Failed to communicate with LTA DataMall v3 service',
        message: err.message,
        dataSource: 'network_error',
      });
    }
  }

  // Fallback demo simulation when LTA_ACCOUNT_KEY is not configured yet
  const now = Date.now();
  const mockServices = [
    {
      ServiceNo: ServiceNo || '7',
      Operator: 'SBST',
      NextBus: {
        OriginCode: '16009',
        DestinationCode: '17009',
        EstimatedArrival: new Date(now + 120000).toISOString(), // 2 mins
        Latitude: '1.2981',
        Longitude: '103.8512',
        VisitNumber: '1',
        Load: 'SEA', // Seats Available
        Feature: 'WAB', // Wheelchair Accessible
        Type: 'DD', // Double Deck
      },
      NextBus2: {
        OriginCode: '16009',
        DestinationCode: '17009',
        EstimatedArrival: new Date(now + 480000).toISOString(), // 8 mins
        Latitude: '1.3052',
        Longitude: '103.8610',
        VisitNumber: '1',
        Load: 'SDA', // Standing Available
        Feature: 'WAB',
        Type: 'SD', // Single Deck
      },
      NextBus3: {
        OriginCode: '16009',
        DestinationCode: '17009',
        EstimatedArrival: new Date(now + 960000).toISOString(), // 16 mins
        Latitude: '1.3120',
        Longitude: '103.8720',
        VisitNumber: '1',
        Load: 'LSD', // Limited Standing
        Feature: 'WAB',
        Type: 'BD', // Bendy
      },
    },
    ...(!ServiceNo
      ? [
          {
            ServiceNo: '14',
            Operator: 'SBST',
            NextBus: {
              OriginCode: '14009',
              DestinationCode: '15009',
              EstimatedArrival: new Date(now + 180000).toISOString(), // 3 mins
              Latitude: '1.2965',
              Longitude: '103.8530',
              VisitNumber: '1',
              Load: 'SEA',
              Feature: 'WAB',
              Type: 'DD',
            },
            NextBus2: {
              OriginCode: '14009',
              DestinationCode: '15009',
              EstimatedArrival: new Date(now + 660000).toISOString(),
              Latitude: '1.3021',
              Longitude: '103.8615',
              VisitNumber: '1',
              Load: 'SDA',
              Feature: 'WAB',
              Type: 'SD',
            },
          },
          {
            ServiceNo: '36',
            Operator: 'GAS',
            NextBus: {
              OriginCode: '96009',
              DestinationCode: '97009',
              EstimatedArrival: new Date(now + 300000).toISOString(), // 5 mins
              Latitude: '1.2940',
              Longitude: '103.8560',
              VisitNumber: '1',
              Load: 'SDA',
              Feature: 'WAB',
              Type: 'SD',
            },
            NextBus2: {
              OriginCode: '96009',
              DestinationCode: '97009',
              EstimatedArrival: new Date(now + 780000).toISOString(),
              Latitude: '1.3010',
              Longitude: '103.8640',
              VisitNumber: '1',
              Load: 'SEA',
              Feature: 'WAB',
              Type: 'DD',
            },
          },
          {
            ServiceNo: '124',
            Operator: 'SBST',
            NextBus: {
              OriginCode: '10009',
              DestinationCode: '11009',
              EstimatedArrival: new Date(now + 420000).toISOString(), // 7 mins
              Latitude: '1.2910',
              Longitude: '103.8580',
              VisitNumber: '1',
              Load: 'SEA',
              Feature: 'WAB',
              Type: 'SD',
            },
          },
        ]
      : []),
  ];

  return res.status(200).json({
    'odata.metadata': 'https://datamall2.mytransport.sg/ltaodataservice/v3/$metadata#BusArrival',
    BusStopCode: String(BusStopCode),
    Services: mockServices,
    dataSource: 'demo_fallback',
    message: 'LTA_ACCOUNT_KEY environment variable is not configured yet. Returning simulated fallback response for preview. Configure LTA_ACCOUNT_KEY in Vercel / environment for live Singapore LTA telemetries.',
    timestamp: new Date().toISOString(),
  });
}
