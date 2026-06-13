package telegram

import (
	"fmt"
	"net/url"
)

// RenderInboxNewHTML renders an inbox item as a Telegram HTML message.
// appBaseURL is the web UI base URL (e.g. "https://app.multica.io").
func RenderInboxNewHTML(item map[string]any, appBaseURL string) string {
	itemType := itemStr(item, "type")
	severity := itemStr(item, "severity")
	title := itemStr(item, "title")
	itemID := itemStr(item, "id")
	workspaceID := itemStr(item, "workspace_id")

	// Build the deep link to the inbox item
	deepLink := buildInboxLink(appBaseURL, workspaceID, itemID)

	lines := []string{
		"<b>New Inbox</b>",
		fmt.Sprintf("<code>%s</code>", itemType),
	}

	if severity != "" {
		lines = append(lines, fmt.Sprintf(" · %s", severity))
	}

	if title != "" {
		lines = append(lines, "")
		lines = append(lines, title)
	}

	if deepLink != "" {
		lines = append(lines, "")
		lines = append(lines, fmt.Sprintf("<a href=\"%s\">View in Multica →</a>", deepLink))
	}

	result := ""
	for _, line := range lines {
		if result == "" {
			result = line
		} else {
			result += "\n" + line
		}
	}
	return result
}

func buildInboxLink(appBaseURL, workspaceID, itemID string) string {
	if appBaseURL == "" || itemID == "" {
		return ""
	}
	u, err := url.Parse(appBaseURL)
	if err != nil {
		return ""
	}
	// Build a workspace-scoped inbox URL
	if workspaceID != "" {
		u.Path = fmt.Sprintf("/%s/inbox", workspaceID)
	} else {
		u.Path = "/inbox"
	}
	q := u.Query()
	q.Set("item", itemID)
	u.RawQuery = q.Encode()
	return u.String()
}

func itemStr(item map[string]any, key string) string {
	if v, ok := item[key].(string); ok {
		return v
	}
	return ""
}
