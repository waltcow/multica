import { Pressable, ScrollView, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Text } from "@/components/ui/text";
import { workspaceListOptions } from "@/data/queries/workspaces";
import { useAuthStore } from "@/data/auth-store";
import { useWorkspaceStore } from "@/data/workspace-store";
import { useColorScheme } from "@/lib/use-color-scheme";
import { THEME } from "@/lib/theme";

type MoreItem = {
  label: string;
  subtitle?: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  href: (slug: string) => string;
};

const WORK_ITEMS: MoreItem[] = [
  {
    label: "Pinned",
    subtitle: "Saved issues and projects",
    icon: "pin-outline",
    color: "#6b7280",
    href: (slug) => `/${slug}/more/pins`,
  },
  {
    label: "Issues",
    subtitle: "Browse every issue",
    icon: "list-outline",
    color: "#2563eb",
    href: (slug) => `/${slug}/more/issues`,
  },
  {
    label: "Projects",
    subtitle: "Roadmaps and grouped work",
    icon: "albums-outline",
    color: "#7c3aed",
    href: (slug) => `/${slug}/more/projects`,
  },
  {
    label: "Agents",
    subtitle: "Workspace automation",
    icon: "sparkles-outline",
    color: "#059669",
    href: (slug) => `/${slug}/more/agents`,
  },
];

function initialsOf(name: string | undefined): string {
  if (!name) return "?";
  return name
    .split(" ")
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function MorePage() {
  const slug = useWorkspaceStore((s) => s.currentWorkspaceSlug);
  const user = useAuthStore((s) => s.user);
  const { data: workspaces } = useQuery(workspaceListOptions());
  const currentWorkspace = workspaces?.find((ws) => ws.slug === slug);
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const groupedBg = isDark ? "hsl(0 0% 0%)" : "hsl(240 20% 96%)";
  const groupBg = isDark ? "hsl(240 4% 11%)" : "hsl(0 0% 100%)";
  const separator = isDark ? "hsl(240 4% 22%)" : "hsl(240 6% 84%)";
  const muted = THEME[colorScheme].mutedForeground;

  const push = (href: string) => {
    router.push(href);
  };

  return (
    <SafeAreaView
      edges={["top"]}
      className="flex-1"
      style={{ backgroundColor: groupedBg }}
    >
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 18,
          paddingBottom: 18,
          gap: 24,
        }}
        showsVerticalScrollIndicator={false}
      >
        <Text
          className="text-4xl font-bold text-foreground"
          style={{ lineHeight: 41 }}
        >
          More
        </Text>

        <View>
          <SectionTitle label="Account" />
          <Section backgroundColor={groupBg}>
            <MoreRow
              label={user?.name ?? "Account"}
              subtitle={user?.email}
              leading={
                <Avatar alt={user?.name ?? "User avatar"} className="size-[30px]">
                  {user?.avatar_url ? (
                    <AvatarImage source={{ uri: user.avatar_url }} />
                  ) : null}
                  <AvatarFallback>
                    <Text className="text-xs font-semibold text-muted-foreground">
                      {initialsOf(user?.name)}
                    </Text>
                  </AvatarFallback>
                </Avatar>
              }
              chevronColor={muted}
              separatorColor={separator}
              showSeparator
              onPress={() => slug && push(`/${slug}/more/settings/profile`)}
            />
            <MoreRow
              label={currentWorkspace?.name ?? "Workspace"}
              subtitle="Switch workspace"
              icon="business"
              iconColor="#ffffff"
              iconBackground="#ff9500"
              chevronColor={muted}
              separatorColor={separator}
              showSeparator
              onPress={() => slug && push(`/${slug}/switch-workspace`)}
            />
            <MoreRow
              label="Settings"
              subtitle="Appearance, notifications, account"
              icon="settings"
              iconColor="#ffffff"
              iconBackground="#6b7280"
              chevronColor={muted}
              separatorColor={separator}
              onPress={() => slug && push(`/${slug}/more/settings`)}
            />
          </Section>
        </View>

        <View>
          <SectionTitle label="Workspace" />
          <Section backgroundColor={groupBg}>
            {WORK_ITEMS.map((item, idx) => (
              <MoreRow
                key={item.label}
                label={item.label}
                subtitle={item.subtitle}
                icon={item.icon}
                iconColor="#ffffff"
                iconBackground={item.color}
                chevronColor={muted}
                separatorColor={separator}
                showSeparator={idx < WORK_ITEMS.length - 1}
                onPress={() => slug && push(item.href(slug))}
              />
            ))}
          </Section>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Section({
  children,
  backgroundColor,
}: {
  children: React.ReactNode;
  backgroundColor: string;
}) {
  return (
    <View
      className="overflow-hidden"
      style={{
        backgroundColor,
        borderRadius: 12,
      }}
    >
      {children}
    </View>
  );
}

function SectionTitle({ label }: { label: string }) {
  return (
    <Text
      className="text-xs uppercase text-muted-foreground"
      style={{
        letterSpacing: 0,
        paddingHorizontal: 16,
        marginBottom: 7,
      }}
    >
      {label}
    </Text>
  );
}

function MoreRow({
  label,
  subtitle,
  leading,
  icon,
  iconColor,
  iconBackground,
  chevronColor,
  separatorColor,
  showSeparator,
  onPress,
}: {
  label: string;
  subtitle?: string;
  leading?: React.ReactNode;
  icon?: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  iconBackground?: string;
  chevronColor: string;
  separatorColor: string;
  showSeparator?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="active:bg-secondary"
      style={{ minHeight: 62 }}
    >
      <View className="flex-row items-center px-4 py-2.5">
        {leading ?? (
          <View
            className="items-center justify-center"
            style={{
              width: 30,
              height: 30,
              borderRadius: 7,
              backgroundColor: iconBackground,
            }}
          >
            {icon ? <Ionicons name={icon} size={18} color={iconColor} /> : null}
          </View>
        )}
        <View className="flex-1 ml-3">
          <Text
            className="text-base font-medium text-foreground"
            numberOfLines={1}
          >
            {label}
          </Text>
          {subtitle ? (
            <Text
              className="text-sm text-muted-foreground mt-0.5"
              numberOfLines={1}
            >
              {subtitle}
            </Text>
          ) : null}
        </View>
        <Ionicons name="chevron-forward" size={17} color={chevronColor} />
      </View>
      {showSeparator ? (
        <View
          style={{
            height: 1,
            marginLeft: 62,
            backgroundColor: separatorColor,
          }}
        />
      ) : null}
    </Pressable>
  );
}
