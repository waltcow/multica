package telegram

import (
	"context"
	"log/slog"
	"time"

	"github.com/jackc/pgx/v5/pgtype"
	"github.com/multica-ai/multica/server/internal/events"
	"github.com/multica-ai/multica/server/internal/util"
	db "github.com/multica-ai/multica/server/pkg/db/generated"
	"github.com/multica-ai/multica/server/pkg/protocol"
)

// WorkspaceQueries is the subset of *db.Queries the Notifier needs.
type WorkspaceQueries interface {
	GetWorkspace(ctx context.Context, id pgtype.UUID) (db.Workspace, error)
}

// Config tunes the TelegramNotifier.
type Config struct {
	// AppBaseURL is the web UI base URL used to build deep links
	// in Telegram messages (e.g. "https://app.multica.io").
	AppBaseURL string
	Logger     *slog.Logger
	Now        func() time.Time
}

func (c Config) withDefaults() Config {
	if c.Logger == nil {
		c.Logger = slog.Default()
	}
	if c.Now == nil {
		c.Now = time.Now
	}
	return c
}

// Notifier sends Telegram messages for inbox events.
type Notifier struct {
	queries WorkspaceQueries
	client  Client
	cfg     Config
}

// NewNotifier constructs a Notifier.
func NewNotifier(queries WorkspaceQueries, client Client, cfg Config) *Notifier {
	cfg = cfg.withDefaults()
	return &Notifier{
		queries: queries,
		client:  client,
		cfg:     cfg,
	}
}

// Register subscribes the notifier to inbox:new on the event bus.
func (n *Notifier) Register(bus *events.Bus) {
	bus.Subscribe(protocol.EventInboxNew, n.handleInboxNew)
}

func (n *Notifier) handleInboxNew(e events.Event) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	payload, ok := e.Payload.(map[string]any)
	if !ok {
		return
	}
	item, ok := payload["item"].(map[string]any)
	if !ok {
		return
	}

	wsUUID, err := util.ParseUUID(e.WorkspaceID)
	if err != nil {
		return
	}

	ws, err := n.queries.GetWorkspace(ctx, wsUUID)
	if err != nil {
		n.cfg.Logger.Warn("telegram notifier: failed to load workspace",
			"workspace_id", e.WorkspaceID,
			"error", err,
		)
		return
	}

	botToken := ws.TelegramBotToken.String
	chatID := ws.TelegramChatId.String
	if botToken == "" || chatID == "" {
		// Telegram not configured for this workspace
		return
	}

	html := RenderInboxNewHTML(item, n.cfg.AppBaseURL)
	if html == "" {
		return
	}

	if err := n.client.SendMessage(ctx, chatID, html); err != nil {
		n.cfg.Logger.Warn("telegram notifier: failed to send message",
			"workspace_id", e.WorkspaceID,
			"error", err,
		)
		return
	}

	n.cfg.Logger.Info("telegram notifier: sent inbox notification",
		"workspace_id", e.WorkspaceID,
	)
}
