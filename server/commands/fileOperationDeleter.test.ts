import { FileOperation } from "@server/models";
import { buildAdmin, buildFileOperation } from "@server/test/factories";
import { getTestDatabase } from "@server/test/support";
import fileOperationDeleter from "./fileOperationDeleter";

const db = getTestDatabase();

afterAll(db.disconnect);

beforeEach(db.flush);

describe("fileOperationDeleter", () => {
  const ip = "127.0.0.1";

  it("should destroy file operation", async () => {
    const admin = await buildAdmin();
    const fileOp = await buildFileOperation({
      userId: admin.id,
      teamId: admin.teamId,
    });
    await fileOperationDeleter(fileOp, admin, ip);
    expect(await FileOperation.count()).toEqual(0);
  });
});
