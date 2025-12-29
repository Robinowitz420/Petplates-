import * as crypto from 'crypto';
import * as https from 'https';

export type AmazonSearchItem = {
  asin: string;
  title: string;
  url: string;
  priceDisplay?: string;
};

function getEnvAny(names: string[]): string {
  for (const name of names) {
    const v = String(process.env[name] || '').trim();
    if (v) return v;
  }
  return '';
}

function parseUsdFromDisplay(value: string | undefined): number {
  if (!value) return 0;
  const cleaned = value.replace(/[^0-9.]/g, '');
  const num = Number(cleaned);
  return Number.isFinite(num) ? num : 0;
}

export function hasAmazonPAApiConfig(): boolean {
  const accessKey = getEnvAny(['AMAZON_ACCESS_KEY_ID', 'AMAZON_ACCESS_KEY']);
  const secretKey = getEnvAny(['AMAZON_SECRET_ACCESS_KEY', 'AMAZON_SECRET_KEY']);
  const associateTag = getEnvAny(['AMAZON_ASSOCIATE_TAG']);
  return Boolean(accessKey && secretKey && associateTag);
}

function sha256Hex(value: string): string {
  return crypto.createHash('sha256').update(value).digest('hex');
}

function hmac(key: crypto.BinaryLike, value: string): Buffer {
  return crypto.createHmac('sha256', key).update(value).digest();
}

function signPaApiRequest(params: {
  payload: string;
  region: string;
  host: string;
  accessKey: string;
  secretKey: string;
  timestamp: string;
}): { authorization: string; signedHeaders: string } {
  const algorithm = 'AWS4-HMAC-SHA256';
  const service = 'ProductAdvertisingAPI';
  const date = params.timestamp.slice(0, 8);

  const canonicalUri = '/paapi5/searchitems';
  const canonicalQuerystring = '';
  const canonicalHeaders = `host:${params.host}\n` + `x-amz-date:${params.timestamp}\n`;
  const signedHeaders = 'host;x-amz-date';
  const payloadHash = sha256Hex(params.payload);
  const canonicalRequest =
    `POST\n${canonicalUri}\n${canonicalQuerystring}\n${canonicalHeaders}\n${signedHeaders}\n${payloadHash}`;

  const credentialScope = `${date}/${params.region}/${service}/aws4_request`;
  const stringToSign = `${algorithm}\n${params.timestamp}\n${credentialScope}\n${sha256Hex(canonicalRequest)}`;

  const kDate = hmac(`AWS4${params.secretKey}`, date);
  const kRegion = hmac(kDate, params.region);
  const kService = hmac(kRegion, service);
  const kSigning = hmac(kService, 'aws4_request');
  const signature = crypto.createHmac('sha256', kSigning).update(stringToSign).digest('hex');

  const authorization =
    `${algorithm} Credential=${params.accessKey}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

  return { authorization, signedHeaders };
}

async function postPaApiSearchItems(params: {
  host: string;
  region: string;
  accessKey: string;
  secretKey: string;
  payload: any;
}): Promise<any> {
  const timestamp = new Date().toISOString().replace(/[:-]|\.\d{3}/g, '');
  const payloadString = JSON.stringify(params.payload);
  const { authorization } = signPaApiRequest({
    payload: payloadString,
    region: params.region,
    host: params.host,
    accessKey: params.accessKey,
    secretKey: params.secretKey,
    timestamp,
  });

  const options: https.RequestOptions = {
    hostname: params.host,
    path: '/paapi5/searchitems',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; charset=UTF-8',
      'Content-Encoding': 'amz-1.0',
      'X-Amz-Date': timestamp,
      Authorization: authorization,
      'X-Amz-Target': 'com.amazon.paapi5.v1.ProductAdvertisingAPIv1.SearchItems',
      'Content-Length': Buffer.byteLength(payloadString),
    },
  };

  return new Promise((resolve) => {
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += String(chunk);
      });
      res.on('end', () => {
        try {
          if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
            resolve(JSON.parse(data));
            return;
          }
        } catch {
          // ignore
        }
        resolve(null);
      });
    });

    req.on('error', () => resolve(null));
    req.write(payloadString);
    req.end();
  });
}

export async function searchAmazonItems(params: {
  keywords: string;
  searchIndex?: string;
  itemCount?: number;
}): Promise<AmazonSearchItem[]> {
  if (!hasAmazonPAApiConfig()) return [];

  const accessKey = getEnvAny(['AMAZON_ACCESS_KEY_ID', 'AMAZON_ACCESS_KEY']);
  const secretKey = getEnvAny(['AMAZON_SECRET_ACCESS_KEY', 'AMAZON_SECRET_KEY']);
  const host = getEnvAny(['AMAZON_HOST']) || 'webservices.amazon.com';
  const region = getEnvAny(['AMAZON_REGION']) || 'us-east-1';
  const associateTag = getEnvAny(['AMAZON_ASSOCIATE_TAG']);

  const requestPayload: any = {
    Keywords: params.keywords,
    SearchIndex: params.searchIndex || 'All',
    ItemCount: params.itemCount ?? 10,
    PartnerTag: associateTag,
    PartnerType: 'Associates',
    Marketplace: 'www.amazon.com',
    Resources: ['ItemInfo.Title', 'Offers.Listings.Price', 'DetailPageURL'],
  };

  try {
    const response: any = await postPaApiSearchItems({
      host,
      region,
      accessKey,
      secretKey,
      payload: requestPayload,
    });
    const items = response?.SearchResult?.Items || [];
    return items
      .map((it: any) => {
        const asin = String(it?.ASIN || '').trim();
        const title = String(it?.ItemInfo?.Title?.DisplayValue || it?.Title || '').trim();
        const url = String(it?.DetailPageURL || '').trim();
        const priceDisplay = it?.Offers?.Listings?.[0]?.Price?.DisplayAmount;
        return { asin, title, url, priceDisplay } as AmazonSearchItem;
      })
      .filter((x: AmazonSearchItem) => x.asin && x.title && x.url);
  } catch {
    return [];
  }
}

export function getItemPriceUsd(item: AmazonSearchItem): number {
  return parseUsdFromDisplay(item.priceDisplay);
}
