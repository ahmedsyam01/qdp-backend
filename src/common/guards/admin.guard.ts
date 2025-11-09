import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    const isAdmin = user.userType === 'admin' || user.userType === 'super_admin';

    if (!isAdmin) {
      throw new ForbiddenException('Access denied. Admin privileges required.');
    }

    return true;
  }
}
