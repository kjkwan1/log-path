# LogPath

LogPath is a TypeScript-first, decorator-based logging library designed for easy integration and tracing capabilities in modern JavaScript applications.

## Features

- Decorator-based logging for clean, unobtrusive code
- Hierarchical process tracking for complex execution flows
- Configurable log levels and endpoints
- TypeScript-first design with full type safety
- Off-main-thread processing for improved performance (In Progress)
- Flexible configuration for both development and production environments
- Sensitive data protection

## Installation

```bash
npm install logpath
```

## Quick Start
1. Initialize LogPath in your application entry point:
```typescript
import { initLogPath } from 'logpath';

initLogPath({
    devMode: process.env.NODE_ENV !== 'production',
    logMode: 'single',
    endpoint: 'https://logs.example.com'
});
```
2. Use the @LogPath decorator in your code:
```typescript
class OrderService {
  @LogPath({ isTopLevel: true, logLevel: 'info' })
  async processOrder(orderId: string) {
    await this.validateOrder(orderId);
    // More processing...
  }

  @LogPath({ logLevel: 'debug' })
  private async validateOrder(orderId: string) {
    // Validation logic
  }
}
```

## Configuration
LogPath can be configured for single or multiple endpoints:

### Single endpoint
```typescript
initLogPath({
  devMode: false,
  logMode: 'single',
  endpoint: 'https://logs.example.com'
});
```

### Multiple endpoints
```typescript
initLogPath({
  devMode: false,
  logMode: 'multiple',
  endpointParams: [
    { logLevel: 'error', endpoint: 'https://error-logs.example.com' },
    { logLevel: 'info', endpoint: 'https://info-logs.example.com' }
  ]
});
```
## API Reference

### @LogPath Decorator
```typescript
@LogPath(options?: LogPathOptions)
```
### Options
- `isTopLevel?: boolean`: If true, creates a new process ID for this function call
- `logLevel?: LogLevel`: Sets the log level for this function (default: 'info')
- `isSensitive?: boolean`: If true, prevents logging of function arguments

### initLogPath
```typescript
function initLogPath(config: LogConfig): void
```
Initializes the LogPath library with the provided configuration.

## Contributing
Contributions are welcome! Please feel free to submit a Pull Request.

## License
This project is licensed under the MIT License - see the LICENSE file for details.


