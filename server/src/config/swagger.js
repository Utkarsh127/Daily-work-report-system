const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Daily Work Report System API',
      version: '1.0.0',
      description: `
## Overview
REST API for the **Daily Work Report System**.

Employees submit daily work reports; Managers monitor team performance,
generate analytics, and export data to CSV.

## Authentication
All protected routes require a **Bearer JWT token** in the \`Authorization\` header:
\`\`\`
Authorization: Bearer <token>
\`\`\`

Obtain a token by calling \`POST /api/auth/login\`.

## Response Format
All responses follow a consistent structure:
\`\`\`json
{
  "success": true | false,
  "message": "Human-readable message",
  "data": { ... } | null,
  "errors": [ ... ] | null
}
\`\`\`

## Roles
| Role | Permissions |
|------|------------|
| \`employee\` | Submit/edit/delete own daily reports (today only), view own history, update profile |
| \`manager\`  | All employee permissions + manage users, view all reports, analytics, CSV export |
      `.trim(),
      contact: {
        name: 'Daily Work Report System',
        email: 'admin@wrs.local',
      },
      license: {
        name: 'MIT',
      },
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 5000}`,
        description: 'Development Server',
      },
      {
        url: 'https://api.yourdomain.com',
        description: 'Production Server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Paste your JWT token here (without the "Bearer " prefix)',
        },
      },
      schemas: {
        SuccessResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Operation successful' },
            data: { type: 'object', nullable: true },
            errors: { type: 'array', nullable: true, items: { type: 'object' } },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string', example: 'An error occurred' },
            data: { type: 'object', nullable: true, example: null },
            errors: {
              type: 'array',
              nullable: true,
              items: {
                type: 'object',
                properties: {
                  field: { type: 'string' },
                  message: { type: 'string' },
                },
              },
            },
          },
        },
        PaginationMeta: {
          type: 'object',
          properties: {
            total: { type: 'integer', example: 42 },
            page: { type: 'integer', example: 1 },
            limit: { type: 'integer', example: 10 },
            totalPages: { type: 'integer', example: 5 },
            hasNextPage: { type: 'boolean', example: true },
            hasPrevPage: { type: 'boolean', example: false },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
    tags: [
      { name: 'Health', description: 'Server health check' },
      { name: 'Auth', description: 'Authentication — login, logout, profile' },
      { name: 'Users', description: 'User management (Manager only for CRUD)' },
      { name: 'Reports', description: 'Daily work report CRUD' },
      { name: 'Analytics', description: 'Weekly / monthly analytics and CSV export (Manager only)' },
    ],
  },
  apis: [
    './src/routes/*.js',
    './src/models/*.js',
    './app.js',
  ],
};

module.exports = swaggerJsdoc(options);
