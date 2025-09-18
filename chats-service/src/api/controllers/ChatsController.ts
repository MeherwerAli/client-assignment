import bodyParser from 'body-parser';
import { StatusCodes } from 'http-status-codes';
import {
  Body,
  Delete,
  Get,
  HeaderParam,
  HttpCode,
  JsonController,
  Param,
  Patch,
  Post,
  QueryParams,
  Req,
  UseBefore
} from 'routing-controllers';
import { constructLogMessage } from '../../lib/env/helpers';
import { Logger } from '../../lib/logger';
import { IRequestHeaders } from '../Interface/IRequestHeaders';
import {
  AddMessageDto,
  CreateSessionDto,
  GetMessagesDto,
  RenameSessionDto,
  SmartChatDto,
  ToggleFavoriteDto
} from '../dto';
import { APIKeyMiddleware } from '../middlewares/APIKeyMiddleware';
import { ContentTypeMiddleware } from '../middlewares/ContentTypeMiddleware';
import { MethodValidationMiddleware } from '../middlewares/MethodValidationMiddleware';
import { MongoIdValidationMiddleware } from '../middlewares/MongoIdValidationMiddleware';
import { URCHeaderMiddleware } from '../middlewares/URCHeaderMiddleware';
import { UserContextMiddleware } from '../middlewares/UserContextMiddleware';
import { ChatService } from '../services/ChatService';
@JsonController('/v1/chats')
@UseBefore(
  MethodValidationMiddleware,
  ContentTypeMiddleware,
  URCHeaderMiddleware,
  APIKeyMiddleware,
  bodyParser.urlencoded({ extended: false }),
  bodyParser.json(),
  UserContextMiddleware,
  MongoIdValidationMiddleware
)
export class ChatsController {
  private log = new Logger(__filename);

  constructor(private chatService: ChatService) {}

  @Get('/')
  @HttpCode(StatusCodes.OK)
  public async getUserSessions(@HeaderParam('Unique-Reference-Code') urc: string, @Req() req: any) {
    const headers: IRequestHeaders = { urc };
    const logMessage = constructLogMessage(__filename, 'getUserSessions', headers);
    this.log.info(logMessage);
    this.log.debug(`Retrieving sessions for user: ${req.userId}`);

    return this.chatService.getUserSessions(req.userId, headers);
  }

  @Post('/')
  @HttpCode(StatusCodes.CREATED)
  public async createSession(
    @Body() body: CreateSessionDto,
    @HeaderParam('Unique-Reference-Code') urc: string,
    @Req() req: any
  ) {
    const headers: IRequestHeaders = { urc };
    const logMessage = constructLogMessage(__filename, 'createSession', headers);
    this.log.info(logMessage);
    this.log.debug(`Creating new session with title: ${body.title || 'untitled'} for user: ${req.userId}`);

    return this.chatService.createSession(body.title, req.userId, headers);
  }

  @Patch('/:id')
  @HttpCode(StatusCodes.OK)
  public async renameSession(
    @Param('id') id: string,
    @Body() body: RenameSessionDto,
    @HeaderParam('Unique-Reference-Code') urc: string,
    @Req() req: any
  ) {
    const headers: IRequestHeaders = { urc };
    const logMessage = constructLogMessage(__filename, 'renameSession', headers);
    this.log.info(logMessage);
    this.log.debug(`Renaming session ${id} to: ${body.title} for user: ${req.userId}`);

    return this.chatService.renameSession(id, body.title, req.userId, headers);
  }

  @Patch('/:id/favorite')
  @HttpCode(StatusCodes.OK)
  public async toggleFavorite(
    @Param('id') id: string,
    @Body() body: ToggleFavoriteDto,
    @HeaderParam('Unique-Reference-Code') urc: string,
    @Req() req: any
  ) {
    const headers: IRequestHeaders = { urc };
    const logMessage = constructLogMessage(__filename, 'toggleFavorite', headers);
    this.log.info(logMessage);
    this.log.debug(`Toggling favorite for session ${id} to: ${body.isFavorite} for user: ${req.userId}`);

    return this.chatService.toggleFavorite(id, body.isFavorite, req.userId, headers);
  }

  @Delete('/:id')
  @HttpCode(StatusCodes.OK)
  public async deleteSession(
    @Param('id') id: string,
    @HeaderParam('Unique-Reference-Code') urc: string,
    @Req() req: any
  ) {
    const headers: IRequestHeaders = { urc };
    const logMessage = constructLogMessage(__filename, 'deleteSession', headers);
    this.log.info(logMessage);
    this.log.debug(`Deleting session ${id} for user: ${req.userId}`);

    return this.chatService.deleteSession(id, req.userId, headers);
  }

  @Post('/:id/messages')
  @HttpCode(StatusCodes.CREATED)
  public async addMessage(
    @Param('id') id: string,
    @Body() body: AddMessageDto,
    @HeaderParam('Unique-Reference-Code') urc: string,
    @Req() req: any
  ) {
    const headers: IRequestHeaders = { urc };
    const logMessage = constructLogMessage(__filename, 'addMessage', headers);
    this.log.info(logMessage);
    this.log.debug(`Adding ${body.sender} message to session ${id} for user: ${req.userId}`);

    return this.chatService.addMessage(id, body.sender, body.content, body.context, req.userId, headers);
  }

  @Get('/:id/messages')
  @HttpCode(StatusCodes.OK)
  public async getMessages(
    @Param('id') id: string,
    @HeaderParam('Unique-Reference-Code') urc: string,
    @QueryParams() query: GetMessagesDto,
    @Req() req: any
  ) {
    const headers: IRequestHeaders = { urc };
    const logMessage = constructLogMessage(__filename, 'getMessages', headers);
    this.log.info(logMessage);
    this.log.debug(
      `Retrieving messages for session ${id} (limit: ${query.limit || 50}, skip: ${query.skip || 0}) for user: ${req.userId}`
    );

    return this.chatService.getMessages(id, query.limit, query.skip, req.userId, headers);
  }

  @Post('/:id/smart-chat')
  @HttpCode(StatusCodes.OK)
  public async smartChat(
    @Param('id') id: string,
    @Body() body: SmartChatDto,
    @HeaderParam('Unique-Reference-Code') urc: string,
    @Req() req: any
  ) {
    const headers: IRequestHeaders = { urc };
    const logMessage = constructLogMessage(__filename, 'smartChat', headers);
    this.log.info(logMessage);
    this.log.debug(
      `Processing smart chat for session ${id} with user message length: ${body.message?.length || 0} for user: ${req.userId}`
    );

    return this.chatService.smartChat(id, body.message, body.context, req.userId, headers, body.customApiKey);
  }
}
