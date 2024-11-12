import {
  Controller,
  DefaultValuePipe,
  Get,
  Logger,
  Param,
  ParseIntPipe,
  Query,
  Request,
  Response,
} from '@nestjs/common';
import { FeedsService } from './feeds.service';
import { Response as Res, Request as Req } from 'express';

@Controller('feeds')
export class FeedsController {  
  private readonly logger = new Logger(this.constructor.name);

  constructor(private readonly feedsService: FeedsService) {}

  @Get('/')
  async getFeedList() {
    return this.feedsService.getFeedList();
  }

  @Get('/all.(json|rss|atom)')
  async getFeeds(
    @Request() req: Req,
    @Response() res: Res,
    @Query('limit', new DefaultValuePipe(100), ParseIntPipe) limit: number = 100,  
    @Query('mode') mode: string,
    @Query('title_include') title_include: string,
    @Query('title_exclude') title_exclude: string,
  ) {
    const path = req.path;
    const type = path.split('.').pop() || '';

    const { content, mimeType } = await this.feedsService.handleGenerateFeed({
      type,
      limit: 100,    
      mode,
      title_include,
      title_exclude,
    });

    res.setHeader('Content-Type', mimeType);
    res.send(content);
  }

  @Get('/:feed')
  async getFeed(
    @Response() res: Res,
    @Param('feed') feed: string,
    @Query('limit', new DefaultValuePipe(100), ParseIntPipe) limit: number = 100,  
    @Query('mode') mode: string,
    @Query('title_include') title_include: string,
    @Query('title_exclude') title_exclude: string,
    @Query('update') update: boolean = false,
  ) {
    const [id, type] = feed.split('.');
    this.logger.log('getFeed: ', id);

    if(update) {
      this.feedsService.updateFeed(id);
    }

    const { content, mimeType } = await this.feedsService.handleGenerateFeed({
      id,
      type,
      limit,
      mode,
      title_include,
      title_exclude,
    });

    res.setHeader('Content-Type', mimeType);
    res.send(content);
  }
}
