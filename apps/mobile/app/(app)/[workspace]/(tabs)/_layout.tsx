import { useState } from "react";
import { usePathname } from "expo-router";
import { Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Host, TabView } from "@expo/ui/swift-ui";
import {
  badge,
  tabViewStyle,
} from "@expo/ui/swift-ui/modifiers";
import { useWorkspaceStore } from "@/data/workspace-store";
import {
  useInboxUnreadCount,
  useChatUnreadMessageCount,
} from "@/lib/unread-counts";
import Inbox from "./inbox";
import MyIssues from "./my-issues";
import Chat from "./chat";
import More from "./more";

type MainTab = "inbox" | "my-issues" | "chat" | "more";

function selectedTabFromPath(pathname: string): MainTab {
  if (pathname.includes("/more")) return "more";
  if (pathname.includes("/my-issues")) return "my-issues";
  if (pathname.includes("/chat")) return "chat";
  return "inbox";
}

export default function TabsLayout() {
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const [selectedTab, setSelectedTab] = useState<MainTab>(() =>
    selectedTabFromPath(pathname),
  );
  const wsId = useWorkspaceStore((s) => s.currentWorkspaceId);
  const inboxUnread = useInboxUnreadCount(wsId);
  const chatUnread = useChatUnreadMessageCount(wsId);

  // Truncation aligned with web's sidebar badges: 99+ for both. `undefined`
  // makes React Navigation hide the badge, so zero-count is a free no-op.
  const inboxBadge =
    inboxUnread > 0 ? (inboxUnread > 99 ? "99+" : String(inboxUnread)) : undefined;
  const chatBadge =
    chatUnread > 0 ? (chatUnread > 99 ? "99+" : String(chatUnread)) : undefined;

  const onSelectionChange = (value: string) => {
    if (
      value === "inbox" ||
      value === "my-issues" ||
      value === "chat" ||
      value === "more"
    ) {
      setSelectedTab(value);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <View style={{ flex: 1, paddingBottom: insets.bottom + 84 }}>
        {selectedTab === "inbox" ? <Inbox /> : null}
        {selectedTab === "my-issues" ? <MyIssues /> : null}
        {selectedTab === "chat" ? <Chat isActive /> : null}
        {selectedTab === "more" ? <More /> : null}
      </View>

      <Host
        ignoreSafeArea="all"
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: insets.bottom + 96,
        }}
      >
        <TabView
          selection={selectedTab}
          onSelectionChange={onSelectionChange}
          modifiers={[tabViewStyle({ type: "automatic" })]}
        >
          <TabView.Tab
            value="inbox"
            label="Inbox"
            systemImage="tray"
            modifiers={inboxBadge ? [badge(inboxBadge)] : undefined}
          >
            <View />
          </TabView.Tab>
          <TabView.Tab
            value="my-issues"
            label="My Issues"
            systemImage="checklist"
          >
            <View />
          </TabView.Tab>
          <TabView.Tab
            value="chat"
            label="Chat"
            systemImage="bubble.left"
            modifiers={chatBadge ? [badge(chatBadge)] : undefined}
          >
            <View />
          </TabView.Tab>
          <TabView.Tab value="more" label="More" systemImage="ellipsis">
            <View />
          </TabView.Tab>
        </TabView>
      </Host>
      <View
        pointerEvents="box-none"
        style={{
          position: "absolute",
          left: 48,
          right: 48,
          bottom: insets.bottom + 6,
          height: 72,
          flexDirection: "row",
        }}
      >
        {(["inbox", "my-issues", "chat", "more"] satisfies MainTab[]).map(
          (tab) => (
            <Pressable
              key={tab}
              accessibilityRole="tab"
              accessibilityState={{ selected: selectedTab === tab }}
              onPress={() => setSelectedTab(tab)}
              style={{ flex: 1 }}
            />
          ),
        )}
      </View>
    </View>
  );
}
