import { buildUser, buildAdmin } from "@server/test/factories";
import { getTestDatabase } from "@server/test/support";
import userDestroyer from "./userDestroyer";

const db = getTestDatabase();

afterAll(db.disconnect);

beforeEach(db.flush);

describe("userDestroyer", () => {
  const ip = "127.0.0.1";

  it("should prevent last user from deleting account", async () => {
    const user = await buildUser();
    let error;

    try {
      await userDestroyer({
        user,
        actor: user,
        ip,
      });
    } catch (err) {
      error = err;
    }

    expect(error && error.message).toContain("Cannot delete last user");
  });

  it("should prevent last admin from deleting account", async () => {
    const user = await buildAdmin();
    await buildUser({
      teamId: user.teamId,
    });
    let error;

    try {
      await userDestroyer({
        user,
        actor: user,
        ip,
      });
    } catch (err) {
      error = err;
    }

    expect(error && error.message).toContain("Cannot delete account");
  });

  it("should not prevent multiple admin from deleting account", async () => {
    const actor = await buildAdmin();
    const user = await buildAdmin({
      teamId: actor.teamId,
    });
    let error;

    try {
      await userDestroyer({
        user,
        actor,
        ip,
      });
    } catch (err) {
      error = err;
    }

    expect(error).toBeFalsy();
    expect(user.deletedAt).toBeTruthy();
  });

  it("should not prevent last non-admin from deleting account", async () => {
    const user = await buildUser();
    await buildUser({
      teamId: user.teamId,
    });
    let error;

    try {
      await userDestroyer({
        user,
        actor: user,
        ip,
      });
    } catch (err) {
      error = err;
    }

    expect(error).toBeFalsy();
    expect(user.deletedAt).toBeTruthy();
  });
});
