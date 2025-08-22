const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Ekub App Backend API',
      version: '1.0.0',
      description: 'Professional Ekub App Backend - Production Ready API for managing Equbs (Ethiopian savings groups)',
      contact: {
        name: 'Yared Dereje',
        email: 'support@ekub-app.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: process.env.NODE_ENV === 'production' 
          ? (process.env.SWAGGER_PROD_URL || 'https://your-production-domain.com')
          : 'http://localhost:3001',
        description: process.env.NODE_ENV === 'production' ? 'Production server' : 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT token for authentication'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            _id: { type: 'string', description: 'MongoDB ObjectId' },
            userId: { 
              type: 'string', 
              description: 'User ID in format U followed by 9 alphanumeric characters', 
              example: 'UABC123DEF',
              pattern: '^U[A-Z0-9]{9}$'
            },
            fullName: { 
              type: 'string', 
              description: 'User full name (letters and spaces only)', 
              example: 'John Doe',
              minLength: 2,
              maxLength: 100,
              pattern: '^[a-zA-Z\\s]+$'
            },
            phoneNumber: { 
              type: 'string', 
              description: 'User phone number in international format', 
              example: '+251911234567',
              pattern: '^\\+[1-9]\\d{1,14}$'
            },
            email: { 
              type: 'string', 
              format: 'email', 
              description: 'User email address (optional)', 
              example: 'john.doe@example.com' 
            },
            referralId: { 
              type: 'string', 
              description: 'Referral ID (optional)', 
              example: 'REF123' 
            },
            profilePicture: { 
              type: 'string', 
              description: 'Profile picture URL (optional)' 
            },
            dateOfBirth: { 
              type: 'string', 
              format: 'date', 
              description: 'User date of birth (optional)' 
            },
            gender: { 
              type: 'string', 
              enum: ['male', 'female', 'other'], 
              description: 'User gender (optional)' 
            },
            address: {
              type: 'object',
              properties: {
                city: { type: 'string', description: 'City name' },
                subCity: { type: 'string', description: 'Sub-city name' },
                woreda: { type: 'string', description: 'Woreda name' },
                houseNumber: { type: 'string', description: 'House number' }
              }
            },
            bankDetails: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  bankName: { type: 'string', description: 'Bank name' },
                  accountNumber: { type: 'string', description: 'Account number' },
                  accountHolder: { type: 'string', description: 'Account holder name' }
                }
              }
            },
            isActive: { type: 'boolean', description: 'Account status', default: true },
            isVerified: { type: 'boolean', description: 'Phone verification status', default: false },
            verificationCode: { type: 'string', description: 'Verification code for password reset' },
            verificationCodeExpires: { type: 'string', format: 'date-time', description: 'Verification code expiry' },
            lastLogin: { type: 'string', format: 'date-time', description: 'Last login timestamp' },
            refreshTokens: {
              type: 'array',
              description: 'Array of refresh tokens',
              items: {
                type: 'object',
                properties: {
                  token: { type: 'string', description: 'Refresh token' },
                  expiresAt: { type: 'string', format: 'date-time', description: 'Token expiry' }
                }
              }
            },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        Equb: {
          type: 'object',
          properties: {
            _id: { type: 'string', description: 'MongoDB ObjectId' },
            equbId: { 
              type: 'string', 
              description: 'Equb ID in format E followed by 9 alphanumeric characters',
              example: 'EABC123DEF',
              pattern: '^E[A-Z0-9]{9}$'
            },
            name: { 
              type: 'string', 
              description: 'Equb name',
              minLength: 2,
              maxLength: 100
            },
            description: { 
              type: 'string', 
              description: 'Equb description',
              maxLength: 500
            },
            type: { 
              type: 'string', 
              enum: ['public', 'private'], 
              description: 'Equb type',
              default: 'public'
            },
            roundDuration: { 
              type: 'string', 
              enum: ['daily', 'weekly', 'monthly'], 
              description: 'Duration of each round',
              default: 'monthly'
            },
            saving: { 
              type: 'number', 
              description: 'Amount to be saved per round',
              minimum: 1
            },
            maxMembers: { 
              type: 'number', 
              description: 'Maximum number of members',
              minimum: 2,
              maximum: 100
            },
            startDate: { 
              type: 'string', 
              format: 'date', 
              description: 'Start date for the equb',
              default: 'now'
            },
            location: { type: 'string', description: 'Equb location' },
            createdBy: { 
              type: 'string', 
              description: 'Creator user ID (MongoDB ObjectId)'
            },
            secretNumber: { 
              type: 'string', 
              description: 'Secret number for private equbs',
              minLength: 6,
              maxLength: 6
            },
            isActive: { type: 'boolean', description: 'Equb status', default: true },
            currentRound: { type: 'number', description: 'Current round number', default: 1 },
            totalRounds: { type: 'number', description: 'Total number of rounds', default: 1, minimum: 1 },
            nextRoundDate: { type: 'string', format: 'date-time', description: 'Next round date' },
            level: { 
              type: 'string', 
              enum: ['new', 'old'], 
              description: 'Equb level',
              default: 'new'
            },
            bankAccountDetail: [{
              type: 'object',
              properties: {
                bankName: { type: 'string', description: 'Bank name' },
                accountNumber: { type: 'string', description: 'Account number' },
                accountHolder: { type: 'string', description: 'Account holder name' }
              }
            }],
            collectorsInfo: [{
              type: 'object',
              properties: {
                userId: { type: 'string', description: 'Collector user ID' },
                name: { type: 'string', description: 'Collector name' },
                phone: { type: 'string', description: 'Collector phone number' }
              }
            }],
            judgInfo: [{
              type: 'object',
              properties: {
                userId: { type: 'string', description: 'Judge user ID' },
                name: { type: 'string', description: 'Judge name' },
                phone: { type: 'string', description: 'Judge phone number' }
              }
            }],
            writersInfo: [{
              type: 'object',
              properties: {
                userId: { type: 'string', description: 'Writer user ID' },
                name: { type: 'string', description: 'Writer name' },
                phone: { type: 'string', description: 'Writer phone number' }
              }
            }],
            members: [{
              type: 'object',
              properties: {
                userId: { type: 'string', description: 'Member user ID' },
                name: { type: 'string', description: 'Member name' },
                participationType: { 
                  type: 'string', 
                  enum: ['full', 'half'], 
                  description: 'Participation type'
                },
                slotNumber: { 
                  type: 'number', 
                  description: 'Slot number',
                  minimum: 1
                },
                role: { 
                  type: 'string', 
                  enum: ['member', 'collector', 'judge', 'writer', 'admin'], 
                  description: 'Member role',
                  default: 'member'
                },
                joinedDate: { 
                  type: 'string', 
                  format: 'date-time', 
                  description: 'Date when member joined',
                  default: 'now'
                },
                isActive: { type: 'boolean', description: 'Member status', default: true },
                paymentHistory: [{
                  type: 'object',
                  properties: {
                    roundNumber: { type: 'number', description: 'Round number' },
                    date: { type: 'string', format: 'date-time', description: 'Payment date' },
                    status: { 
                      type: 'string', 
                      enum: ['paid', 'unpaid', 'pending', 'cancelled'], 
                      description: 'Payment status',
                      default: 'pending'
                    },
                    amountPaid: { type: 'number', description: 'Amount paid', default: 0 },
                    paymentMethod: { 
                      type: 'string', 
                      enum: ['cash', 'bank', 'mobile_money'], 
                      description: 'Payment method',
                      default: 'cash'
                    },
                    notes: { type: 'string', description: 'Payment notes' }
                  }
                }]
              }
            }],
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        Payment: {
          type: 'object',
          properties: {
            _id: { type: 'string', description: 'MongoDB ObjectId' },
            paymentId: { 
              type: 'string', 
              description: 'Payment ID in format P followed by 9 alphanumeric characters',
              example: 'PABC123DEF',
              pattern: '^P[A-Z0-9]{9}$'
            },
            equbId: { type: 'string', description: 'Equb ID' },
            userId: { type: 'string', description: 'User ID' },
            amount: { type: 'number', description: 'Payment amount' },
            status: { 
              type: 'string', 
              enum: ['paid', 'unpaid', 'pending', 'cancelled'], 
              description: 'Payment status' 
            },
            dueDate: { type: 'string', format: 'date', description: 'Payment due date' },
            paidAt: { type: 'string', format: 'date-time', description: 'Payment date' },
            paymentMethod: { 
              type: 'string', 
              enum: ['cash', 'bank', 'mobile_money'], 
              description: 'Payment method'
            },
            notes: { type: 'string', description: 'Payment notes' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        Notification: {
          type: 'object',
          properties: {
            _id: { type: 'string', description: 'MongoDB ObjectId' },
            notificationId: { 
              type: 'string', 
              description: 'Notification ID in format N followed by 9 alphanumeric characters',
              example: 'NABC123DEF',
              pattern: '^N[A-Z0-9]{9}$'
            },
            userId: { type: 'string', description: 'User ID' },
            type: { 
              type: 'string', 
              enum: ['payment', 'equb', 'system', 'reminder', 'announcement'], 
              description: 'Notification type',
              default: 'system'
            },
            title: { 
              type: 'string', 
              description: 'Notification title',
              maxLength: 100
            },
            message: { 
              type: 'string', 
              description: 'Notification message',
              maxLength: 500
            },
            equbId: { type: 'string', description: 'Related equb ID (optional)' },
            paymentId: { type: 'string', description: 'Related payment ID (optional)' },
            isRead: { type: 'boolean', description: 'Read status', default: false },
            isPushed: { type: 'boolean', description: 'Push notification sent', default: false },
            isEmailed: { type: 'boolean', description: 'Email sent', default: false },
            isSMS: { type: 'boolean', description: 'SMS sent', default: false },
            priority: { 
              type: 'string', 
              enum: ['low', 'medium', 'high', 'urgent'], 
              description: 'Notification priority',
              default: 'medium'
            },
            actionUrl: { type: 'string', description: 'Action URL (optional)' },
            actionData: { type: 'object', description: 'Action data (optional)' },
            scheduledFor: { type: 'string', format: 'date-time', description: 'Scheduled time (optional)' },
            expiresAt: { type: 'string', format: 'date-time', description: 'Expiry time (optional)' },
            metadata: { type: 'object', description: 'Additional metadata (optional)' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        Error: {
          type: 'object',
          properties: {
            status: { type: 'string', example: 'error' },
            error: {
              type: 'object',
              properties: {
                code: { type: 'string', description: 'Error code' },
                message: { type: 'string', description: 'Error message' },
                details: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      field: { type: 'string', description: 'Field name with error' },
                      message: { type: 'string', description: 'Error message for the field' }
                    }
                  }
                }
              }
            }
          }
        },
        Success: {
          type: 'object',
          properties: {
            status: { type: 'string', example: 'success' },
            message: { type: 'string', description: 'Success message' },
            data: { type: 'object', description: 'Response data' }
          }
        },
        JoinedEqub: {
          type: 'object',
          properties: {
            equbId: { 
              type: 'string', 
              description: 'Equb ID',
              example: 'EABC123DEF'
            },
            participationType: { 
              type: 'string', 
              enum: ['full', 'half'], 
              description: 'User\'s participation type in the equb'
            },
            slotNumber: { 
              type: 'number', 
              description: 'User\'s slot number in the equb'
            }
          }
        },
        AuthResponse: {
          type: 'object',
          properties: {
            status: { type: 'string', example: 'success' },
            data: {
              type: 'object',
              properties: {
                userId: { 
                  type: 'string', 
                  description: 'User ID in format U followed by 9 alphanumeric characters',
                  example: 'UABC123DEF'
                },
                name: { 
                  type: 'string', 
                  description: 'User\'s first name',
                  example: 'John'
                },
                phoneNumber: { 
                  type: 'string', 
                  description: 'User phone number',
                  example: '+251911234567'
                },
                accessToken: { 
                  type: 'string', 
                  description: 'JWT access token'
                },
                refreshToken: { 
                  type: 'string', 
                  description: 'JWT refresh token'
                },
                joinedEqubs: {
                  type: 'array',
                  description: 'Array of equbs the user has joined',
                  items: {
                    $ref: '#/components/schemas/JoinedEqub'
                  }
                }
              }
            }
          }
        }
      }
    },
    tags: [
      { name: 'Authentication', description: 'User authentication and authorization endpoints' },
      { name: 'Equbs', description: 'Equb management and discovery endpoints' },
      { name: 'Payments', description: 'Payment processing and management endpoints' },
      { name: 'Health', description: 'System health and status endpoints' }
    ]
  },
  apis: [
    './routes/*.js',
    './controllers/*.js',
    './models/*.js'
  ]
};

const specs = swaggerJsdoc(options);

module.exports = specs;
