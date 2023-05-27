package domain

import (
	"errors"
	"strings"
)

type Comment struct {
	CommentID       int64
	UserID 			int64
	ItemID 			int32
	Content			string
	CreatedAt		string
}

func (c Comment) Validate() error {
	c.Content = strings.TrimSpace(c.Content) 

	if c.Content == "" {
		return errors.New("Comment cannot be empty")
	}

	return nil
}