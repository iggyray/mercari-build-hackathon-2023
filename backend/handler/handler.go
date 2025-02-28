package handler

import (
	"bytes"
	"database/sql"
	"fmt"
	"io"
	"io/ioutil"
	"net/http"
	"os"
	"strconv"
	"strings"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/iggyray/mecari-build-hackathon-2023/backend/db"
	"github.com/iggyray/mecari-build-hackathon-2023/backend/domain"
	"github.com/labstack/echo/v4"
	"github.com/pkg/errors"
	"golang.org/x/crypto/bcrypt"
)

var (
	logFile = getEnv("LOGFILE", "access.log")
)

type JwtCustomClaims struct {
	UserID int64 `json:"user_id"`
	jwt.RegisteredClaims
}

type InitializeResponse struct {
	Message string `json:"message"`
}

type registerRequest struct {
	Name     string `json:"name"`
	Password string `json:"password"`
}

type registerResponse struct {
	ID   int64  `json:"id"`
	Name string `json:"name"`
}

type getOnSaleItemsResponse struct {
	ID           int32  `json:"id"`
	Name         string `json:"name"`
	Price        int64  `json:"price"`
	CategoryName string `json:"category_name"`
}
type getItemsResponse struct {
	ID           int32             `json:"id"`
	Name         string            `json:"name"`
	Price        int64             `json:"price"`
	CategoryName string            `json:"category_name"`
	Status       domain.ItemStatus `json:"status"`
}

type getItemResponse struct {
	ID           int32             `json:"id"`
	Name         string            `json:"name"`
	CategoryID   int64             `json:"category_id"`
	CategoryName string            `json:"category_name"`
	UserID       int64             `json:"user_id"`
	Price        int64             `json:"price"`
	Description  string            `json:"description"`
	Status       domain.ItemStatus `json:"status"`
}

type getCategoriesResponse struct {
	ID   int64  `json:"id"`
	Name string `json:"name"`
}

type sellRequest struct {
	UserID int64 `json:"user_id"`
	ItemID int32 `json:"item_id"`
}

type addItemRequest struct {
	Name        string `form:"name"`
	CategoryID  int64  `form:"category_id"`
	Price       int64  `form:"price"`
	Description string `form:"description"`
}

type addItemResponse struct {
	ID int64 `json:"id"`
}

type addBalanceRequest struct {
	Balance int64 `json:"balance"`
}

type getBalanceResponse struct {
	Balance int64 `json:"balance"`
}

type loginRequest struct {
	UserID   int64  `json:"user_id"`
	Password string `json:"password"`
}

type loginV2Request struct {
	UserName string `json:"user_name"`
	Password string `json:"password"`
}

type loginResponse struct {
	ID    int64  `json:"id"`
	Name  string `json:"name"`
	Token string `json:"token"`
}

type getCommentResponse struct {
	CommentId       int64  `json:"comment_id"`
	ParentCommentId *int64 `json:"parent_comment_id"`
	UserId          int64  `json:"user_id"`
	UserName        string `json:"user_name"`
	ItemId          int32  `json:"item_id"`
	Content         string `json:"content"`
	CreatedAt       string `json:"created_at"`
}

type addCommentRequest struct {
	ParentCommentId *int64 `json:"parent_comment_id"`
	Content         string `json:"content"`
}

type addCommentResponse struct {
	CommentId       int64  `json:"comment_id"`
	ParentCommentId *int64 `json:"parent_comment_id"`
	UserId          int64  `json:"user_id"`
	UserName        string `json:"user_name"`
	ItemId          int32  `json:"item_id"`
	Content         string `json:"content"`
	CreatedAt       string `json:"created_at"`
}

type Handler struct {
	DB          *sql.DB
	UserRepo    db.UserRepository
	ItemRepo    db.ItemRepository
	CommentRepo db.CommentRepository
}

func GetSecret() string {
	if secret := os.Getenv("SECRET"); secret != "" {
		return secret
	}
	return "secret-key"
}

func (h *Handler) Initialize(c echo.Context) error {
	err := os.Truncate(logFile, 0)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, errors.Wrap(err, "Failed to truncate access log"))
	}

	err = db.Initialize(c.Request().Context(), h.DB)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, errors.Wrap(err, "Failed to initialize"))
	}

	return c.JSON(http.StatusOK, InitializeResponse{Message: "Success"})
}

func (h *Handler) AccessLog(c echo.Context) error {
	return c.File(logFile)
}

func (h *Handler) Register(c echo.Context) error {
	// TODO: validation
	// http.StatusBadRequest(400)
	req := new(registerRequest)
	if err := c.Bind(req); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err)
	}

	// Check if name is not blank
	if req.Name == "" {
		return echo.NewHTTPError(http.StatusBadRequest, "Name cannot not be blank")
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil { // Check for user already exists error
		if strings.Contains(err.Error(), "already exists") {
			return echo.NewHTTPError(http.StatusBadRequest, err.Error())
		}
		return echo.NewHTTPError(http.StatusInternalServerError, err)
	}

	userID, err := h.UserRepo.AddUser(c.Request().Context(), domain.User{Name: req.Name, Password: string(hash)})
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err)
	}

	return c.JSON(http.StatusOK, registerResponse{ID: userID, Name: req.Name})
}

// deprecated
func (h *Handler) Login(c echo.Context) error {
	ctx := c.Request().Context()
	// TODO: validation
	//
	req := new(loginRequest)
	if err := c.Bind(req); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err)
	}

	user, err := h.UserRepo.GetUser(ctx, req.UserID)
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err)
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password)); err != nil {
		if err == bcrypt.ErrMismatchedHashAndPassword {
			return echo.NewHTTPError(http.StatusUnauthorized, err)
		}
		return echo.NewHTTPError(http.StatusBadRequest, err)
	}

	// Set custom claims
	claims := &JwtCustomClaims{
		req.UserID,
		jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(time.Hour * 72)),
		},
	}
	// Create token with claims
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	// Generate encoded token and send it as response.
	encodedToken, err := token.SignedString([]byte(GetSecret()))
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err)
	}

	return c.JSON(http.StatusOK, loginResponse{
		ID:    user.ID,
		Name:  user.Name,
		Token: encodedToken,
	})
}

func (h *Handler) LoginV2(c echo.Context) error {
	ctx := c.Request().Context()
	// TODO: validation
	// http.StatusBadRequest(400)
	req := new(loginV2Request)
	if err := c.Bind(req); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err)
	}

	user, err := h.UserRepo.GetUserByName(ctx, req.UserName)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err)
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password)); err != nil {
		if err == bcrypt.ErrMismatchedHashAndPassword {
			return echo.NewHTTPError(http.StatusUnauthorized, err)
		}
		return echo.NewHTTPError(http.StatusInternalServerError, err)
	}

	// Set custom claims
	claims := &JwtCustomClaims{
		user.ID,
		jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(time.Hour * 72)),
		},
	}
	// Create token with claims
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	// Generate encoded token and send it as response.
	encodedToken, err := token.SignedString([]byte(GetSecret()))
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err)
	}

	return c.JSON(http.StatusOK, loginResponse{
		ID:    user.ID,
		Name:  user.Name,
		Token: encodedToken,
	})
}

func (h *Handler) AddItem(c echo.Context) error {
	// TODO: validation
	// http.StatusBadRequest(400)
	ctx := c.Request().Context()

	req := new(addItemRequest)
	if err := c.Bind(req); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err)
	}

	userID, err := getUserID(c)
	if err != nil {
		return echo.NewHTTPError(http.StatusUnauthorized, err)
	}
	file, err := c.FormFile("image")
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err)
	}

	src, err := file.Open()
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err)
	}
	defer src.Close()

	// TODO: pass very big file
	// http.StatusBadRequest(400)
	const MaxImageSize = 1 << 20 // 1 MB
	if file.Size > MaxImageSize {
		return echo.NewHTTPError(http.StatusBadRequest, "Please upload image less than 1MB")
	}

	var dest []byte
	blob := bytes.NewBuffer(dest)

	if _, err := io.Copy(blob, src); err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err)
	}

	_, err = h.ItemRepo.GetCategory(ctx, req.CategoryID)
	if err != nil {
		if err == sql.ErrNoRows {
			return echo.NewHTTPError(http.StatusBadRequest, "invalid categoryID")
		}
		return echo.NewHTTPError(http.StatusInternalServerError, err)
	}

	item, err := h.ItemRepo.AddItem(c.Request().Context(), domain.Item{
		Name:        req.Name,
		CategoryID:  req.CategoryID,
		UserID:      userID,
		Price:       req.Price,
		Description: req.Description,
		Image:       blob.Bytes(),
		Status:      domain.ItemStatusInitial,
	})
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}

	return c.JSON(http.StatusOK, addItemResponse{ID: int64(item.ID)})
}

// Update item
func (h *Handler) UpdateItem(c echo.Context) error {

	req := new(addItemRequest)
	if err := c.Bind(req); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err)
	}
	itemID, err := strconv.Atoi(c.Param("itemID"))
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err)
	}

	userID, err := getUserID(c)
	if err != nil {
		return echo.NewHTTPError(http.StatusUnauthorized, err)
	}
	file, err := c.FormFile("image")
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err)
	}

	src, err := file.Open()
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err)
	}
	defer src.Close()

	var dest []byte
	blob := bytes.NewBuffer(dest)
	// TODO: pass very big file
	// http.StatusBadRequest(400)
	const MaxImageSize = 1 << 20 // 1 MB
	if file.Size > MaxImageSize {
		return echo.NewHTTPError(http.StatusBadRequest, "Please upload image less than 1MB")
	}
	if _, err := io.Copy(blob, src); err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err)
	}

	err = h.ItemRepo.UpdateItem(c.Request().Context(), int32(itemID), domain.Item{
		Name:        req.Name,
		CategoryID:  req.CategoryID,
		UserID:      userID,
		Price:       req.Price,
		Description: req.Description,
		Image:       blob.Bytes(),
		Status:      domain.ItemStatusInitial,
	})
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err)
	}
	return c.JSON(http.StatusOK, addItemResponse{ID: int64(itemID)})
}

func (h *Handler) Sell(c echo.Context) error {
	ctx := c.Request().Context()
	req := new(sellRequest)

	if err := c.Bind(req); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err)
	}

	item, err := h.ItemRepo.GetItem(ctx, req.ItemID)
	// TODO: not found handling
	// http.StatusPreconditionFailed(412)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err)
	}

	// TODO: check req.UserID and item.UserID
	// if req.UserID != item.UserID {
	// 	return echo.NewHTTPError(http.StatusPreconditionFailed, "invalid userID")
	// }

	// http.StatusPreconditionFailed(412)
	// TODO: only update when status is initial
	if item.Status != domain.ItemStatusInitial {
		return echo.NewHTTPError(http.StatusBadRequest, "Item is already on sale")
	}
	// http.StatusPreconditionFailed(412)
	if err := h.ItemRepo.UpdateItemStatus(ctx, item.ID, domain.ItemStatusOnSale); err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}

	return c.JSON(http.StatusOK, "successful")
}

func (h *Handler) GetOnSaleItems(c echo.Context) error {
	ctx := c.Request().Context()

	items, err := h.ItemRepo.GetOnSaleItems(ctx)
	if err != nil {
		return echo.NewHTTPError(http.StatusNotFound, err)
	}

	var res []getOnSaleItemsResponse
	for _, item := range items {
		cats, err := h.ItemRepo.GetCategories(ctx)
		if err != nil {
			return c.JSON(http.StatusInternalServerError, err)
		}
		for _, cat := range cats {
			if cat.ID == item.CategoryID {
				res = append(res, getOnSaleItemsResponse{ID: item.ID, Name: item.Name, Price: item.Price, CategoryName: cat.Name})
			}
		}
	}

	return c.JSON(http.StatusOK, res)
}

func (h *Handler) GetAllItems(c echo.Context) error {
	ctx := c.Request().Context()

	items, err := h.ItemRepo.GetAllItems(ctx)
	// TODO: not found handling
	// http.StatusNotFound(404)
	if err != nil {
		return echo.NewHTTPError(http.StatusNotFound, err)
	}

	var res []getItemsResponse
	for _, item := range items {
		cats, err := h.ItemRepo.GetCategories(ctx)
		if err != nil {
			return c.JSON(http.StatusInternalServerError, err)
		}
		for _, cat := range cats {
			if cat.ID == item.CategoryID {
				res = append(res, getItemsResponse{ID: item.ID, Name: item.Name, Price: item.Price, CategoryName: cat.Name, Status: item.Status})
			}
		}
	}

	return c.JSON(http.StatusOK, res)
}

func (h *Handler) GetItem(c echo.Context) error {
	ctx := c.Request().Context()

	itemID, err := strconv.Atoi(c.Param("itemID"))
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err)
	}

	item, err := h.ItemRepo.GetItem(ctx, int32(itemID))
	// TODO: not found handling
	// http.StatusNotFound(404)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err)
	}

	category, err := h.ItemRepo.GetCategory(ctx, item.CategoryID)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err)
	}
	return c.JSON(http.StatusOK, getItemResponse{
		ID:           item.ID,
		Name:         item.Name,
		CategoryID:   item.CategoryID,
		CategoryName: category.Name,
		UserID:       item.UserID,
		Price:        item.Price,
		Description:  item.Description,
		Status:       item.Status,
	})
}

func (h *Handler) SearchItems(c echo.Context) error {
	ctx := c.Request().Context()

	keyword := c.QueryParam("name")

	items, err := h.ItemRepo.GetItemsByKeyword(ctx, keyword)

	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err)
	}

	var res []getItemsResponse
	for _, item := range items {
		cats, err := h.ItemRepo.GetCategories(ctx)
		if err != nil {
			return c.JSON(http.StatusInternalServerError, err)
		}
		for _, cat := range cats {
			if cat.ID == item.CategoryID {
				res = append(res, getItemsResponse{
					ID:           item.ID,
					Name:         item.Name,
					Price:        item.Price,
					CategoryName: cat.Name,
					Status:       item.Status,
				})
			}
		}
	}

	return c.JSON(http.StatusOK, res)
}

func (h *Handler) GetUserItems(c echo.Context) error {
	ctx := c.Request().Context()

	userID, err := strconv.ParseInt(c.Param("userID"), 10, 64)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "invalid userID type")
	}

	items, err := h.ItemRepo.GetItemsByUserID(ctx, userID)
	// TODO: not found handling
	// http.StatusNotFound(404)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err)
	}

	var res []getItemsResponse
	for _, item := range items {
		cats, err := h.ItemRepo.GetCategories(ctx)
		if err != nil {
			return c.JSON(http.StatusInternalServerError, err)
		}
		for _, cat := range cats {
			if cat.ID == item.CategoryID {
				res = append(res, getItemsResponse{ID: item.ID, Name: item.Name, Price: item.Price, CategoryName: cat.Name, Status: item.Status})
			}
		}
	}

	return c.JSON(http.StatusOK, res)
}

func (h *Handler) GetCategories(c echo.Context) error {
	ctx := c.Request().Context()

	cats, err := h.ItemRepo.GetCategories(ctx)
	// TODO: not found handling
	// http.StatusNotFound(404)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err)
	}

	res := make([]getCategoriesResponse, len(cats))
	for i, cat := range cats {
		res[i] = getCategoriesResponse{ID: cat.ID, Name: cat.Name}
	}

	return c.JSON(http.StatusOK, res)
}

func (h *Handler) GetImage(c echo.Context) error {
	ctx := c.Request().Context()

	// TODO: overflow
	itemID, err := strconv.ParseInt(c.Param("itemID"), 10, 32)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "invalid itemID type")
	}

	// オーバーフローしていると。ここのint32(itemID)がバグって正常に処理ができないはず
	data, err := h.ItemRepo.GetItemImage(ctx, int32(itemID))
	if err != nil {
		// return placeholder image
		placeholderData, err := ioutil.ReadFile("./handler/default-image.jpg")
		if err != nil {
			return echo.NewHTTPError(http.StatusInternalServerError, "failed to read placeholder image")
		}
		return c.Blob(http.StatusOK, "image/jpg", placeholderData)
	}

	return c.Blob(http.StatusOK, "image/jpeg", data)
}

func (h *Handler) AddBalance(c echo.Context) error {
	ctx := c.Request().Context()

	req := new(addBalanceRequest)
	if err := c.Bind(req); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err)
	}

	userID, err := getUserID(c)
	if err != nil {
		return echo.NewHTTPError(http.StatusUnauthorized, err)
	}

	user, err := h.UserRepo.GetUser(ctx, userID)
	// TODO: not found handling
	// http.StatusPreconditionFailed(412)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err)
	}

	newBalance := user.Balance + req.Balance
	if req.Balance < 0 {
		return echo.NewHTTPError(http.StatusBadRequest, "The added balance should be more than zero")
	}
	if err := h.UserRepo.UpdateBalance(ctx, userID, newBalance); err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err)
	}

	return c.JSON(http.StatusOK, "successful")
}

func (h *Handler) GetBalance(c echo.Context) error {
	ctx := c.Request().Context()

	userID, err := getUserID(c)
	if err != nil {
		return echo.NewHTTPError(http.StatusUnauthorized, err)
	}

	user, err := h.UserRepo.GetUser(ctx, userID)
	// TODO: not found handling
	// http.StatusPreconditionFailed(412)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err)
	}

	return c.JSON(http.StatusOK, getBalanceResponse{Balance: user.Balance})
}

func (h *Handler) Purchase(c echo.Context) error {
	ctx := c.Request().Context()

	userID, err := getUserID(c)
	if err != nil {
		return echo.NewHTTPError(http.StatusUnauthorized, err)
	}

	// TODO: overflow
	itemID, err := strconv.Atoi(c.Param("itemID"))
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err)
	}

	// TODO: update only when item status is on sale

	// http.StatusPreconditionFailed(412)

	// オーバーフローしていると。ここのint32(itemID)がバグって正常に処理ができないはず

	user, err := h.UserRepo.GetUser(ctx, userID)
	// TODO: not found handling
	// http.StatusPreconditionFailed(412)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err)
	}

	item, err := h.ItemRepo.GetItem(ctx, int32(itemID))
	// TODO: not found handling
	// http.StatusPreconditionFailed(412)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err)
	}

	// Check if item is on sale
	if item.Status != domain.ItemStatusOnSale {
		return echo.NewHTTPError(http.StatusBadRequest, "Item is not on sale")
	}

	// Check if balance is enough
	if user.Balance < item.Price {
		return echo.NewHTTPError(http.StatusBadRequest, "Balance is not enough.")
	}

	// Check if item is own by the buyer
	if userID == item.UserID {
		return echo.NewHTTPError(http.StatusBadRequest, "Cannot buy own item")
	}

	if err := h.ItemRepo.UpdateItemStatus(ctx, int32(itemID), domain.ItemStatusSoldOut); err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}

	// TODO: if it is fail here, item status is still sold
	// TODO: balance consistency
	// TODO: not to buy own items. 自身の商品を買おうとしていたら、http.StatusPreconditionFailed(412)

	if err := h.UserRepo.UpdateBalance(ctx, userID, user.Balance-item.Price); err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err)
	}

	sellerID := item.UserID

	seller, err := h.UserRepo.GetUser(ctx, sellerID)
	// TODO: not found handling
	// http.StatusPreconditionFailed(412)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err)
	}

	if err := h.UserRepo.UpdateBalance(ctx, sellerID, seller.Balance+item.Price); err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err)
	}

	return c.JSON(http.StatusOK, "successful")
}

func getUserID(c echo.Context) (int64, error) {
	user := c.Get("user").(*jwt.Token)
	if user == nil {
		return -1, fmt.Errorf("invalid token")
	}
	claims := user.Claims.(*JwtCustomClaims)
	if claims == nil {
		return -1, fmt.Errorf("invalid token")
	}

	return claims.UserID, nil
}

func getEnv(key string, defaultValue string) string {
	value := os.Getenv(key)
	if value == "" {
		return defaultValue
	}
	return value
}

func (h *Handler) GetCommentsByItemId(c echo.Context) error {
	ctx := c.Request().Context()

	itemID, err := strconv.Atoi(c.Param("itemID"))
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	comments, err := h.CommentRepo.GetCommentsByItemId(ctx, int32(itemID))
	// TODO: not found handling
	// http.StatusNotFound(404)
	if err != nil {
		return echo.NewHTTPError(http.StatusNotFound, err.Error())
	}

	var res []getCommentResponse
	for _, comment := range comments {
		if err != nil {
			return c.JSON(http.StatusInternalServerError, err.Error())
		}
		res = append(res, getCommentResponse{
			CommentId:       comment.CommentID,
			ParentCommentId: comment.ParentCommentID,
			UserId:          comment.UserID,
			UserName:        comment.UserName,
			ItemId:          comment.ItemID,
			Content:         comment.Content,
			CreatedAt:       comment.CreatedAt,
		})
	}

	return c.JSON(http.StatusOK, res)
}

func (h *Handler) AddComment(c echo.Context) error {
	// TODO: validation
	// http.StatusBadRequest(400)
	ctx := c.Request().Context()

	req := new(addCommentRequest)
	if err := c.Bind(req); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	userID, err := getUserID(c)
	if err != nil {
		return echo.NewHTTPError(http.StatusUnauthorized, err.Error())
	}

	user, err := h.UserRepo.GetUser(ctx, userID)

	itemID, err := strconv.Atoi(c.Param("itemID"))
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}

	comment, err := h.CommentRepo.AddComment(ctx, domain.Comment{ParentCommentID: req.ParentCommentId, UserID: user.ID, UserName: user.Name, ItemID: int32(itemID), Content: req.Content})
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}

	return c.JSON(http.StatusOK, addCommentResponse{
		CommentId:       comment.CommentID,
		ParentCommentId: comment.ParentCommentID,
		UserId:          comment.UserID,
		UserName:        comment.UserName,
		ItemId:          comment.ItemID,
		Content:         comment.Content,
		CreatedAt:       comment.CreatedAt,
	})
}
