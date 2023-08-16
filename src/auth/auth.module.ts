import { Module } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { SequelizeModule } from "@nestjs/sequelize";
import { User } from "src/models/user.model";
import { UserService } from "src/user/user.service";
import { UserModule } from "src/user/user.module";
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from "./constants";
import { AuthGuard } from "./auth.guard";
// import { JwtStrategy } from "./jwt.strategy";

@Module({
    imports:[SequelizeModule.forFeature([User]),
    UserModule, PassportModule,
    JwtModule.register({
        secret: jwtConstants.secret,
        signOptions: {expiresIn: '60d'}
    })],
    // providers:[AuthService, UserService, LocalStrategy, JwtStrategy],
    providers:[AuthService, UserService, AuthGuard],
    controllers: [AuthController],
    exports: [AuthService]
})
export class AuthModule{}