const { app } = require('@azure/functions');
const CosmosClient = require('@azure/cosmos').CosmosClient;

const dbEndpoint = process.env.DBEndpoint;
const dbKey = process.env.DBKey;

// const databaseId = 'settemmaskin';
const databaseId = process.env.DBId;
// const containerId = process.env.DBContainerName

const dbOptions = {
    endpoint: dbEndpoint,
    key: dbKey
};

const dbClient = new CosmosClient(dbOptions);

app.http('erpdb', {
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    authLevel: 'anonymous',

    handler: async (request, context) => {
        const containerId = request.query.get('containerid');
        context.log(`Http function processed request for url "${request.url}" with method "${request.method}" on container "${containerId}"`);
        context.log('Body from frontend: ' + request.params);

        if (request.method == 'GET') {
            if (request.query.has('id')) {
                const itemId = request.query.get('id');
                try {
                    const { statusCode, resource } = await dbClient
                        .database(databaseId)
                        .container(containerId)
                        .item(itemId, itemId)
                        .read();
                    context.log('ReadItem id ' + itemId + ' StatusCode: ' + statusCode);
                    const resourceJSON = JSON.stringify(resource);
                    return { status: statusCode, body: resourceJSON }
                }
                catch (error) {
                    context.log(error.code + ' - DB Read Item error: ' + error)
                    return { status: error.code, body: error }
                }
            }
            else {
                const querySpec = {
                    query: 'SELECT * FROM root'
                };
                try {
                    const { resources: results } = await dbClient
                        .database(databaseId)
                        .container(containerId)
                        .items.query(querySpec)
                        .fetchAll();
                    const resultsJSON = JSON.stringify(results);
                    return { body: resultsJSON };
                }
                catch (error) {
                    context.log(error.code + ' - DB Read all items error: ' + error)
                    return { status: error.code, body: error }
                }
            }
        }

        if (request.method == 'POST') {
            const itemBody = await request.json();
            context.log('DocumentID to be written: ' + itemBody.id)
            try {
                const { statusCode, item } = await dbClient
                    .database(databaseId)
                    .container(containerId)
                    .items.create(itemBody);
                context.log('Created item width id: ' + item.id + ' Statuscode: ' + statusCode);
                const returnBody = { itemId: item.id };
                const returnBodyJSON = JSON.stringify(returnBody);
                return { status: statusCode, body: returnBodyJSON };                                
            }
            catch (error) {
                context.log(error.code + ' - DB write Item error: ' + error);
                return { status: error.code, body: error }
            }
        }
        
        if (request.method == 'PUT') {
            try {
                const putBody = await request.json();
                const { statusCode, item } = await dbClient
                    .database(databaseId)
                    .container(containerId)
                    .items.upsert(putBody);
                context.log('Updated item width id: ' + item.id + ' Statuscode: ' + statusCode);
                const returnBody = { itemId: item.id };
                const returnBodyJSON = JSON.stringify(returnBody);
                return { status: statusCode, body: returnBodyJSON };                                
            }
            catch (error) {
                context.log(error.code + ' - DB Put Item error: ' + error);
                return { status: error.code, body: error }
            }
        }

        if (request.method == 'PATCH') {
            return { status: 405, body: 'HTTP Request type PATCH not in use' }
            
        }

        if (request.method == 'DELETE') {
            try {
                const itemBody = await request.json();
                context.log(itemBody.id);
                const { statusCode, item } = await dbClient
                    .database(databaseId)
                    .container(containerId)
                    .item(itemBody.id, itemBody.id)
                    .delete(itemBody);
                context.log('Deleted item width id: ' + item.id);
                context.log(statusCode);
                return { status: statusCode }
            }
            catch (error) {
                context.log(error.code + ' DB delete item error: ' + error);
                return { status: error.code, body: error }
            }
        }
        
    }
});
