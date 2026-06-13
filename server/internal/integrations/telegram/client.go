package telegram

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"time"
)

// Client is a minimal Telegram Bot API client. It implements the
// TelegramBotAPI interface so it can be replaced in tests.
type Client interface {
	SendMessage(ctx context.Context, chatID, text string) error
}

// HTTPClient is the real Telegram Bot API client backed by net/http.
type HTTPClient struct {
	botToken string
	client   *http.Client
}

// NewHTTPClient returns a client that sends messages as the given bot.
func NewHTTPClient(botToken string) *HTTPClient {
	return &HTTPClient{
		botToken: botToken,
		client: &http.Client{
			Timeout: 10 * time.Second,
		},
	}
}

type sendMessageRequest struct {
	ChatID    string `json:"chat_id"`
	Text      string `json:"text"`
	ParseMode string `json:"parse_mode,omitempty"`
}

type sendMessageResponse struct {
	OK          bool   `json:"ok"`
	ErrorCode   int    `json:"error_code,omitempty"`
	Description string `json:"description,omitempty"`
}

func (c *HTTPClient) SendMessage(ctx context.Context, chatID, text string) error {
	if c.botToken == "" || chatID == "" {
		return nil
	}
	reqBody := sendMessageRequest{
		ChatID:    chatID,
		Text:      text,
		ParseMode: "HTML",
	}
	raw, err := json.Marshal(reqBody)
	if err != nil {
		return fmt.Errorf("marshal telegram request: %w", err)
	}

	url := fmt.Sprintf("https://api.telegram.org/bot%s/sendMessage", c.botToken)
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, url, bytes.NewReader(raw))
	if err != nil {
		return fmt.Errorf("create telegram request: %w", err)
	}
	req.Header.Set("Content-Type", "application/json")

	resp, err := c.client.Do(req)
	if err != nil {
		return fmt.Errorf("send telegram message: %w", err)
	}
	defer resp.Body.Close()

	var result sendMessageResponse
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return fmt.Errorf("decode telegram response: %w", err)
	}
	if !result.OK {
		return fmt.Errorf("telegram API error %d: %s", result.ErrorCode, result.Description)
	}
	return nil
}
