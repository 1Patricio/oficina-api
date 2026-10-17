import { Controller, Get } from '@nestjs/common'

@Controller()
export class PingController {
  @Get('ping')
  ping() {
    return {
      status: 'ok',
      dateTime: new Date().toISOString(),
    }
  }
}
