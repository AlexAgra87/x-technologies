// AWS Configuration for X-Tech
// These values come from Terraform deployment

export const awsConfig = {
    region: 'eu-west-1',

    // Cognito
    cognito: {
        userPoolId: 'eu-west-1_jeqdwrlar',
        clientId: '56hf0nu0ai7b7i035st4g3gf6j',
        domain: 'xtech-prod-183548422174',
    },

    // API Gateway
    api: {
        url: 'https://3t2air5si6.execute-api.eu-west-1.amazonaws.com/prod',
    },

    // DynamoDB Tables
    dynamodb: {
        usersTable: 'xtech-prod-users',
        ordersTable: 'xtech-prod-orders',
        productsTable: 'xtech-prod-products',
        cacheTable: 'xtech-prod-cache',
    },
};
