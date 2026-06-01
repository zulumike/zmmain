const { app } = require('@azure/functions');
const { BlobServiceClient, generateBlobSASQueryParameters, BlobSASPermissions, StorageSharedKeyCredential } = require('@azure/storage-blob');

app.http('qr', {
    methods: ['GET', 'POST'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        context.log(`Http function processed request for url "${request.url}" with method "${request.method}"`);
        context.log("Connection string value:", JSON.stringify(process.env.AZURE_STORAGE_CONNECTION_STRING));
        let blobService = null;
        try {
            const connStr = process.env.AZURE_STORAGE_CONNECTION_STRING;
            if (!connStr) {
                context.log("Missing AZURE_STORAGE_CONNECTION_STRING");
                return { status: 500, body: "Storage connection string not configured" };
            }
            blobService = BlobServiceClient.fromConnectionString(connStr);
            context.log("Blob service client opprettet");
        }
        catch (error) {
            context.log("Feil ved opprettelse av BlobServiceClient:", error);
            return { status: 500, body: "Feil ved opprettelse av BlobServiceClient" };
        }

        if (request.method === 'POST') {
            try {
                const formData = await request.formData();
                const file = formData.get("file");
    
                if (!file) {
                    return { status: 400, body: "No file uploaded" };
                }
    
                const buffer = Buffer.from(await file.arrayBuffer());
    
                const container = blobService.getContainerClient("qrphotos");
                await container.createIfNotExists();
    
                const blobName = `bilde_${Date.now()}.png`;
                const blockBlob = container.getBlockBlobClient(blobName);
    
                await blockBlob.uploadData(buffer);
    
                return {
                    status: 200,
                    body: `Lagret som ${blobName}`
                };
            }
            catch (error) {
                context.log("Feil ved filopplasting:", error);
                return { status: 500, body: "Feil ved filopplasting" };
            }
        };
        if (request.method === 'GET') {
            context.log("Henter bilder...");

            // Check authentication
            const principal = request.headers.get("x-ms-client-principal");
            if (!principal) {
                return { status: 401, body: "Ikke innlogget" };
            }

            const container = blobService.getContainerClient("qrphotos");
            const result = [];

            // Set up credentials for SAS generation
            const sharedKeyCredential = new StorageSharedKeyCredential(
                process.env.AZURE_STORAGE_ACCOUNT_NAME,
                process.env.AZURE_STORAGE_ACCOUNT_KEY
            );

            try {
                for await (const blob of container.listBlobsFlat()) {
                    const sasToken = generateBlobSASQueryParameters({
                        containerName: "qrphotos",
                        blobName: blob.name,
                        permissions: BlobSASPermissions.parse("r"),
                        expiresOn: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
                    }, sharedKeyCredential).toString();

                    result.push({
                        name: blob.name,
                        url: `${container.getBlockBlobClient(blob.name).url}?${sasToken}`
                    });
                }
                return {
                    status: 200,
                    jsonBody: result
                };
            }
            catch (error) {
                context.log("Feil ved henting av bilder:", error);
                return { status: 500, body: "Feil ved henting av bilder" };
            }
        };
    }
});