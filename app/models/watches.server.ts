import { db } from "~/db.server";

interface Watch {
  user_id: string;
  auction_item_id: string;
}

export function getUserWatches(userId: string) {
  return db
    .selectFrom("watches")
    .select("auction_item_id")
    .where("user_id", "=", userId)
    .where("active", "=", true)
    .execute();
}

export function setWatch(watch: Watch) {
  return db
    .insertInto("watches")
    .values(watch)
    .onConflict((oc) =>
      oc.constraint("watches_un").doUpdateSet({ active: true }),
    )
    .execute();
}

export function unwatch(watch: Watch) {
  return db
    .updateTable("watches")
    .set({ active: false })
    .where((eb) => eb.and(watch))
    .execute();
}
