import React from "react";
import { withBackgrounds } from "@storybook/addon-ondevice-backgrounds";
import type { Preview } from "@storybook/react-native";
import { Platform } from "react-native";
import { NativeCtxProvider } from "@nativectx/ui";
import { storybookBrand } from "../.storybook/brand-config";

// fix for actions on web
if (Platform.OS === "web") {
  // @ts-ignore
  global.ProgressTransitionRegister = {};
  // @ts-ignore
  global.UpdatePropsManager = {};
}

const withNativeCtxProvider = (Story: React.ComponentType) => (
  <NativeCtxProvider brand={storybookBrand}>
    <Story />
  </NativeCtxProvider>
);

const preview: Preview = {
  decorators: [withNativeCtxProvider, withBackgrounds],

  parameters: {
    backgrounds: {
      default: "plain",
      values: [
        { name: "plain", value: "white" },
        { name: "warm", value: "hotpink" },
        { name: "cool", value: "deepskyblue" },
      ],
    },
    actions: { argTypesRegex: "^on[A-Z].*" },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
  },
};

export default preview;
