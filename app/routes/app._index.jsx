// @ts-nocheck
import { useRef, useState } from "react";
import { json } from "@remix-run/node";
import { useLoaderData, useSubmit } from "@remix-run/react";
import {
  Page,
  Layout,
  Text,
  VerticalStack,
  Card,
  Button,
  Box,
  Tabs,
} from "@shopify/polaris";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }) => {
  const { admin, session } = await authenticate.admin(request);

  const theme = (await admin.rest.resources.Theme.all({ session })).data.filter(
    (theme) => theme.role === "main"
  )?.[0];

  const assets = await admin.rest.resources.Asset.all({
    session,
    theme_id: theme.id,
  });

  const filteredAssets = filterTemplates(assets);

  const templates = extractTemplates(filteredAssets, theme.id);
  return json({ data: { ...templates, theme } });
};

const filterTemplates = (assets) => {
  return assets.data.filter((asset) => asset.key.split("/")[0] === "templates");
};

function extractTemplates(assetsResponse, themeId) {
  const templates = {
    home: [],
    product: [],
    collection: [],
  };
  assetsResponse.forEach((asset) => {
    const assetName = asset.key.toLowerCase();
    const assetType = getAssetType(asset.key);
    if (assetType === "collection") {
      templates.collection.push({
        name: assetName,
        theme_id: themeId,
        updatedAt: new Date().toISOString(),
        ...asset,
      });
    } else if (assetType === "home") {
      templates.home.push({
        name: assetName,
        theme_id: themeId,
        updatedAt: new Date().toISOString(),
        ...asset,
      });
    } else if (assetType === "product") {
      templates.product.push({
        name: assetName,
        theme_id: themeId,
        updatedAt: new Date().toISOString(),
        ...asset,
      });
    }
  });

  return templates;
}

const getAssetType = (assetKey) => {
  const assetName = assetKey.toLowerCase();
  if (assetName.includes("product")) {
    return "product";
  } else if (assetName.includes("index")) {
    return "home";
  } else if (assetName.includes("collection")) {
    return "collection";
  } else return null;
};

const createNewAssetKey = (assetKey) => {
  const parent = assetKey.split("/")?.[0];
  const dotSplit = assetKey.split(".");
  const ext = dotSplit[dotSplit.length - 1];
  const assetType = getAssetType(assetKey);
  const randomKey = generateRandomKey(10);
  switch (assetType) {
    case "home":
      return `${parent}/index.${randomKey}.${ext}`;
    case "collection":
      return `${parent}/collection.${randomKey}.${ext}`;
    case "product":
      return `${parent}/product.${randomKey}.${ext}`;
  }
};

const generateRandomKey = (length) => {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let randomKey = "";

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    randomKey += characters.charAt(randomIndex);
  }

  return randomKey;
};

export let action = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  // TODO: Complete this function to duplicate the selected asset
  // by creating a new asset with a random key and the same content.
  // format should be if homepage then index.{random10-characters-key}.liquid, collection then collection.{random10-characters-key}.liquid, product then product.{random10-characters-key}.liquid
  try {
    const accessToken = session.accessToken;
    const body = await request.formData();
    const assetKey = body.get("selectedAssetKey");
    const themeId = body.get("selectedAssetThemeId");
    const newKey = createNewAssetKey(assetKey);
    console.log(newKey);
    const data = {
      asset: {
        key: newKey,
        source_key: assetKey,
        theme_id: themeId,
      },
    };
    const url = `https://${session.shop}/admin/api/2022-10/themes/${themeId}/assets.json`;

    const response = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": accessToken,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    return json({ status: "success" });
  } catch (error) {
    console.log(error);
    return json({ status: "fail", message: error.message });
  }
};

export default function Index() {
  const { data } = useLoaderData();
  const [selectedTabIndex, setSelectedTabIndex] = useState(0);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const formRef = useRef();
  const submit = useSubmit();

  const handleSelect = (asset) => {
    setSelectedAsset(asset);
    console.log(asset);
  };

  const handleDuplicate = () => {
    console.log("here");
    // TODO: Complete this function to submit the form with the selected asset key and theme ID.
    console.log(formRef.current);
    submit(formRef.current, {
      assetId: selectedAsset.key,
      theme_id: selectedAsset.theme_id,
    });
  };

  const renderCard = (asset) => {
    return (
      <div onClick={() => handleSelect(asset)} key={asset.key}>
        <Box
          borderColor={
            selectedAsset?.name === asset.name
              ? "border-primary"
              : "border-secondary"
          }
          padding="5"
          borderWidth="1"
          borderStyle="solid"
        >
          <Text as="h2" variant="bodyMd">
            Asset Key: {asset.name}
          </Text>
          <Text as="h2" variant="bodyMd">
            Theme ID: {asset.theme_id}
          </Text>
          <Text as="h2" variant="bodyMd">
            Updated At: {asset.updatedAt}
          </Text>
        </Box>
      </div>
    );
  };

  // TODO: Create the Tabs and Panels components and render the assets inside the Panels.

  const handleTabChange = (selectedTabIndex) => {
    setSelectedTabIndex(selectedTabIndex);
    setSelectedAsset(null);
  };

  const tabs = [
    {
      id: "home-pages",
      content: "Home Pages",
    },
    {
      id: "collection-pages",
      content: "Collection Pages",
    },
    {
      id: "product-pages",
      content: "Product Pages",
    },
  ];

  return (
    <Page>
      <ui-title-bar title="Remix app template"></ui-title-bar>
      <VerticalStack gap="5">
        <Layout>
          <Layout.Section>
            <Card>
              <Tabs
                tabs={tabs}
                selected={selectedTabIndex}
                onSelect={handleTabChange}
              >
                <VerticalStack gap="5">
                  {selectedTabIndex === 0
                    ? data.home?.map((home) => renderCard(home))
                    : selectedTabIndex === 1
                    ? data.collection.map((collection) =>
                        renderCard(collection)
                      )
                    : data.product.map((product) => renderCard(product))}
                </VerticalStack>
              </Tabs>
            </Card>
          </Layout.Section>
        </Layout>
        <form ref={formRef} method="post">
          <input
            type="hidden"
            name="selectedAssetKey"
            value={selectedAsset ? selectedAsset.key : ""}
          />
          <input
            type="hidden"
            name="selectedAssetThemeId"
            value={selectedAsset ? selectedAsset.theme_id : ""}
          />
          <Button primary disabled={!selectedAsset} onClick={handleDuplicate}>
            Duplicate Template
          </Button>
        </form>
      </VerticalStack>
    </Page>
  );
}
