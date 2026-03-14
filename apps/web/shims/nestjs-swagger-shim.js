// Simple stub to suppress @nestjs/swagger when next.js compiles DTOs for the client
export const ApiProperty = () => () => {};
export const ApiPropertyOptional = () => () => {};
export const ApiResponseProperty = () => () => {};
export const OmitType = (classRef) => classRef;
export const PickType = (classRef) => classRef;
export const PartialType = (classRef) => classRef;
export const IntersectionType = (classRef) => classRef;
export const DocumentBuilder = class {};
export const SwaggerModule = class {};
