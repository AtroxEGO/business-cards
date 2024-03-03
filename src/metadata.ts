/* eslint-disable */
export default async () => {
    const t = {
        ["./cards/dto/patch-card.dto"]: await import("./cards/dto/patch-card.dto")
    };
    return { "@nestjs/swagger": { "models": [[import("./users/dto/create-user.dto"), { "CreateUserDto": {}, "CreateUserResponseDto": {} }], [import("./auth/dto/login.dto"), { "LoginDto": {}, "LoginResponseDto": {} }], [import("./cards/dto/patch-card.dto"), { "PatchCardDto": {} }]], "controllers": [[import("./app.controller"), { "AppController": { "checkHealth": {} } }], [import("./users/users.controller"), { "UsersController": { "createUser": {}, "deleteUser": {} } }], [import("./auth/auth.controller"), { "AuthController": { "login": {} } }], [import("./cards/cards.controller"), { "CardsController": { "getCard": { type: Object }, "patchCard": {} } }]] } };
};