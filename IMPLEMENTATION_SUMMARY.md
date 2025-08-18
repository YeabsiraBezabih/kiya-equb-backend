### Custom User ID Support for Equb Member Management (Latest)

**Date**: Current implementation

**Changes Made**:

1. **User Model Enhancement**:
   - Added `findByUserId` static method to find users by their custom userId (format: U + 9 alphanumeric characters)

2. **Equb Controller Updates**:
   - **removeMember**: Updated to accept custom userIds in route parameters, convert them to MongoDB ObjectIds for internal operations
   - **updateMemberRole**: Updated to accept custom userIds in route parameters, convert them to MongoDB ObjectIds for internal operations
   - **getEqubDetails**: Enhanced to populate and return both MongoDB ObjectId and custom userId for all member types

3. **API Route Updates**:
   - DELETE `/api/mobile/equbs/{equbId}/members/{userId}`: Now accepts custom userIds (U + 9 alphanumeric characters)
   - PUT `/api/mobile/equbs/{equbId}/members/{userId}/role`: Now accepts custom userIds (U + 9 alphanumeric characters)

4. **Swagger Documentation Updates**:
   - Added comprehensive Swagger documentation for the DELETE endpoint
   - Updated userId parameter pattern from MongoDB ObjectId to custom userId format
   - Updated response descriptions and error codes

5. **Test Updates**:
   - Modified test-equb-management.js to use custom userIds instead of MongoDB ObjectIds
   - Updated test data to use valid custom userId format (UFAKE12345)

**Technical Details**:
- Route parameters now expect custom userIds (e.g., "UABC123DEF")
- Controllers internally convert custom userIds to MongoDB ObjectIds using `User.findByUserId()`
- API responses include both `userId` (MongoDB ObjectId) and `customUserId` (custom format)
- Backward compatibility maintained for internal operations

**Benefits**:
- More user-friendly API endpoints
- Consistent with the system's custom ID naming convention
- Better API documentation and validation
- Improved test coverage

### MongoDB Logging Implementation (Latest)

**Date**: Current implementation

**Changes Made**:

1. **Logger Configuration Updates**:
   - Updated `logger.js` to use configuration from config files
   - Added MongoDB transport support with configurable options
   - Implemented conditional MongoDB transport based on configuration

2. **Configuration File Updates**:
   - **default.json**: Added MongoDB logging configuration
   - **development.json**: Added MongoDB logging with debug level
   - **production.json**: Added MongoDB logging with warn level
   - **custom-environment-variables.json**: Added logging environment variable mappings

3. **Environment Variables**:
   - `LOG_LEVEL`: Overall logging level
   - `LOG_MONGODB_ENABLED`: Enable/disable MongoDB logging
   - `LOG_MONGODB_DB`: MongoDB connection string for logs
   - `LOG_MONGODB_COLLECTION`: Collection name for storing logs

4. **Testing and Documentation**:
   - Created `test-logging.js` script for testing MongoDB logging
   - Added `test:logging` npm script
   - Updated README.md with MongoDB logging documentation

**Technical Details**:
- Logs are stored in MongoDB Atlas database `ekub-logs`
- Different collections for different environments (logs, dev-logs, prod-logs)
- Configurable log levels per environment
- Automatic fallback to console-only logging if MongoDB is disabled

**Benefits**:
- Centralized log storage in the cloud
- Easy log querying and analysis using MongoDB queries
- Scalable logging infrastructure
- No local log file management required
- Environment-specific logging configurations
