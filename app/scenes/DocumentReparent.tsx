import { observer } from "mobx-react";
import { useState } from "react";
import * as React from "react";
import { Trans, useTranslation } from "react-i18next";
import { CollectionPermission } from "@shared/types";
import Collection from "~/models/Collection";
import Button from "~/components/Button";
import Flex from "~/components/Flex";
import Text from "~/components/Text";
import useStores from "~/hooks/useStores";
import useToasts from "~/hooks/useToasts";
import { NavigationNode } from "~/types";

type Props = {
  item:
    | {
        active: boolean | null | undefined;
        children: Array<NavigationNode>;
        collectionId: string;
        depth: number;
        id: string;
        title: string;
        url: string;
      }
    | {
        id: string;
        collectionId: string;
        title: string;
      };
  collection: Collection;
  onCancel: () => void;
  onSubmit: () => void;
};

function DocumentReparent({ collection, item, onSubmit, onCancel }: Props) {
  const [isSaving, setIsSaving] = useState(false);
  const { showToast } = useToasts();
  const { documents, collections } = useStores();
  const { t } = useTranslation();
  const prevCollection = collections.get(item.collectionId);
  const accessMapping = {
    [CollectionPermission.ReadWrite]: t("view and edit access"),
    [CollectionPermission.Read]: t("view only access"),
    null: t("no access"),
  };

  const handleSubmit = React.useCallback(
    async (ev: React.SyntheticEvent) => {
      ev.preventDefault();
      setIsSaving(true);

      try {
        await documents.move(item.id, collection.id);
        showToast(t("Document moved"), {
          type: "info",
        });
        onSubmit();
      } catch (err) {
        showToast(err.message, {
          type: "error",
        });
      } finally {
        setIsSaving(false);
      }
    },
    [documents, item.id, collection.id, showToast, t, onSubmit]
  );

  return (
    <Flex column>
      <form onSubmit={handleSubmit}>
        <Text type="secondary">
          <Trans
            defaults="Heads up – moving the document <em>{{ title }}</em> to the <em>{{ newCollectionName }}</em> collection will grant all team members <em>{{ newPermission }}</em>, they currently have {{ prevPermission }}."
            values={{
              title: item.title,
              prevCollectionName: prevCollection?.name,
              newCollectionName: collection.name,
              prevPermission:
                accessMapping[prevCollection?.permission || "null"],
              newPermission: accessMapping[collection.permission || "null"],
            }}
            components={{
              em: <strong />,
            }}
          />
        </Text>
        <Button type="submit">
          {isSaving ? `${t("Moving")}…` : t("Move document")}
        </Button>{" "}
        <Button type="button" onClick={onCancel} neutral>
          {t("Cancel")}
        </Button>
      </form>
    </Flex>
  );
}

export default observer(DocumentReparent);
