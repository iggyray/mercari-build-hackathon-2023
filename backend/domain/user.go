package domain

import (
	"errors"
	"strings"
)

type User struct {
	ID       int64
	Password string
	Name     string
	Balance  int64
}

func (u User) Validate() error {
	u.Name = strings.TrimSpace(u.Name) 

	if u.Name == "" {
		return errors.New("Username is empty or contains only spaces")
	}

	return nil
}