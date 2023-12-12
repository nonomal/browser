import { PasskyJsonExport } from "../../../src/importers/passky/passky-json-types";

export const testData: PasskyJsonExport = {
  encrypted: false,
  passwords: [
    {
      website: "https://bitwarden.com/",
      username: "testUser",
      password: "testPassword",
      message: "my notes",
    },
  ],
};
