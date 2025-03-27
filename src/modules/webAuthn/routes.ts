import {
  AuthenticatorTransportFuture,
  generateAuthenticationOptions,
  generateRegistrationOptions,
  verifyAuthenticationResponse,
  verifyRegistrationResponse,
} from "@simplewebauthn/server";
import { NextFunction, Request, Response, Router } from "express";
import resp from "objectify-response";
import validateRequest from "src/middlewares/validateRequest";
import { validateToken } from "src/middlewares/validateToken";

type Passkey = {
  // SQL: Store as `TEXT`. Index this column
  id: Base64URLString;
  // SQL: Store raw bytes as `BYTEA`/`BLOB`/etc...
  //      Caution: Node ORM's may map this to a Buffer on retrieval,
  //      convert to Uint8Array as necessary
  publicKey: Uint8Array;
  // SQL: Foreign Key to an instance of your internal user model
  userId: string;
  // SQL: Store as `TEXT`. Index this column. A UNIQUE constraint on
  //      (webAuthnUserID + user) also achieves maximum user privacy
  webAuthnUserID: Base64URLString;
  // SQL: Consider `BIGINT` since some authenticators return atomic timestamps as counters
  counter: number;
  // SQL: `VARCHAR(32)` or similar, longest possible value is currently 12 characters
  // Ex: 'singleDevice' | 'multiDevice'
  deviceType: string;
  // SQL: `BOOL` or whatever similar type is supported
  backedUp: boolean;
  // SQL: `VARCHAR(255)` and store string array as a CSV string
  // Ex: ['ble' | 'cable' | 'hybrid' | 'internal' | 'nfc' | 'smart-card' | 'usb']
  transports?: AuthenticatorTransportFuture[];
};

const USERS: {
  id: string;
  username: string;
  passKey: Passkey;
}[] = [];

const CLIENT_URL = "http://localhost:5173";
const RP_ID = "localhost";

// const CLIENT_URL = "http://192.168.254.106:5173";
// const RP_ID = "192.168.254.106:5173";

function getUserByUsername(username: string) {
  return USERS.find((user) => user.username === username);
}

function getUserById(id: string) {
  return USERS.find((user) => user.id === id);
}

function createUser(id: string, username: string, passKey: Passkey) {
  USERS.push({ id, username, passKey });
}

function updateUserCounter(id: string, counter: number) {
  const user = USERS.find((user) => user.id === id);
  if (user) user.passKey.counter = counter;
}

const webauthnRouter = Router();
export const webauthnBaseUrl = "/webauthn";

webauthnRouter.get(
  webauthnBaseUrl + "/init-register",
  async (req: Request, res: Response) => {
    const username = req.query.username as string;
    if (!username) {
      return resp(res, "Username is required", 400);
    }

    if (getUserByUsername(username) != null) {
      return resp(res, "User already exists", 400);
    }

    const options = await generateRegistrationOptions({
      rpID: RP_ID,
      rpName: "Agnos",
      userName: username,
    });

    res.cookie(
      "regInfo",
      JSON.stringify({
        webauthnId: options.user.id,
        username,
        challenge: options.challenge,
      }),
      { httpOnly: true, maxAge: 60000, secure: true }
    );

    resp(res, options);
  }
);

webauthnRouter.post(
  webauthnBaseUrl + "/verify-register",
  async (req: Request, res: Response) => {
    const regInfo = JSON.parse(req.cookies.regInfo);

    if (!regInfo) {
      return resp(res, "Registration info not found", 400);
    }

    const isExist = USERS.find(v => v.username === regInfo.username)
    if (isExist) {
      return resp(res, "Username already exists", 400);
    }

    try {
      const verification = await verifyRegistrationResponse({
        response: req.body,
        expectedChallenge: regInfo.challenge,
        expectedOrigin: CLIENT_URL,
        expectedRPID: RP_ID,
      });
      if (verification.verified && verification.registrationInfo) {
        const user = {
          id: regInfo.webauthnId,
          username: regInfo.username,
          passKey: {
            id: verification.registrationInfo.credential.id,
            userId: regInfo.webauthnId,
            webAuthnUserID: regInfo.webauthnId,
            publicKey: verification.registrationInfo.credential.publicKey,
            counter: verification.registrationInfo.credential.counter,
            deviceType: verification.registrationInfo.credentialDeviceType,
            backedUp: verification.registrationInfo.credentialBackedUp,
            transports: verification.registrationInfo.credential.transports,
          },
        };

        USERS.push(user)
        console.log({ user })
        return resp(res, { verified: verification.verified });
      }
    } catch (error) {
      return resp(res, "Verification failed", 400);
    }
  }
);

webauthnRouter.get(
  webauthnBaseUrl + "/generate-auth",
  async (req: Request, res: Response) => {
    const username = req.query.username as string;
    if (!username) {
      return resp(res, { error: "Username is required" }, 400);
    }

    const user = getUserByUsername(username);
    if (user == null) {
      return resp(res, "No user for this username", 400);
    }

    const options = await generateAuthenticationOptions({
      rpID: RP_ID,
      allowCredentials: [
        {
          id: user.passKey.id,
          // type: "public-key",
          transports: user.passKey.transports,
        },
      ],
    });

    res.cookie(
      "authInfo",
      JSON.stringify({
        userId: user.id,
        challenge: options.challenge,
      }),
      { httpOnly: true, maxAge: 60000, secure: true }
    )

    resp(res, options);
  }
);

webauthnRouter.post(
  webauthnBaseUrl + "/verify-auth",
  async (req: Request, res: Response) => {
    const authInfo = JSON.parse(req.cookies.authInfo);

    if (!authInfo) {
      return resp(res, "Authentication info not found", 400);
    }

    const user = getUserById(authInfo.userId);
    if (user == null || user.passKey.id != req.body.id) {
      return resp(res, "Invalid user", 400);
    }

    const verification = await verifyAuthenticationResponse({
      response: req.body,
      expectedChallenge: authInfo.challenge,
      expectedOrigin: CLIENT_URL,
      expectedRPID: RP_ID,
      credential: {
        id: user.passKey.id,
        publicKey: user.passKey.publicKey,
        counter: user.passKey.counter,
        transports: user.passKey.transports,
      },
    });

    if (verification.verified) {
      updateUserCounter(user.id, verification.authenticationInfo.newCounter);
      res.clearCookie("authInfo");
      // Save user in a session cookie
      return resp(res, { verified: verification.verified });
    } else {
      return resp(res, "Verification failed", 400);
    }
  }
);

webauthnRouter.delete(
  webauthnBaseUrl,
  async (req: Request, res: Response) => {
    USERS.length = 0
    resp(res, "Registered users was deleted")
  }
);

export default webauthnRouter;
