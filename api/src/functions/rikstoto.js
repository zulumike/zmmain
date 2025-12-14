const { app } = require('@azure/functions');

app.http('rikstoto', {
    methods: ['GET'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        context.log(`Http function processed request for url "${request.url}"`);

        const apiUrl = request.query.get('apiurl');
        try {
            const fetchResponse = await fetch(apiUrl, {
                method: 'get'
            });
            const result = await fetchResponse.json();
            if (!result.success) {
                throw new Error(result.message);
            }
            const response = { status: 200, body: JSON.stringify(result.result) }
            return response
        }
        catch (error) {
             context.error('Error fetching data! Error: ' + error);
            return {
                status: 500,
                body: 'Error fetching data! Error: ' + error
            }
        }
    }
});